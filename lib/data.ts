import { prisma } from "@/lib/prisma";

// Enums to match Prisma schema
export enum ZakatType {
  FITRAH = "FITRAH",
  MAL = "MAL",
  INFAK = "INFAK",
  OTHER = "OTHER"
}

export enum OnBehalfOfType {
  SELF = "SELF",
  FAMILY = "FAMILY",
  BADAL = "BADAL",
  OTHER = "OTHER"
}

export enum UserRole {
  ADMIN = "ADMIN",
  STAFF = "STAFF"
}

export enum PaymentMethod {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  E_WALLET = "E_WALLET",
  OTHER = "OTHER"
}

// Updated interfaces to match Prisma models
export interface Transaction {
  id: string
  donorName: string
  recipientName: string
  onBehalfOf: Array<{
    id: string
    type: OnBehalfOfType
    name: string
  }>
  amount: number
  date: Date
  paymentMethod: PaymentMethod
  zakatType: ZakatType
  notes?: string | null
  donorSignature?: string | null
  recipientSignature?: string | null
  userId: string
  user?: {
    id: string
    username: string
    name: string
    role: UserRole
  }
}

export interface ReportData {
  period: string
  fitrah: number
  mal: number
  infak: number
  other: number
  total: number
  transactionCount: number
}

export interface User {
  id: string
  username: string
  password: string
  name: string
  role: UserRole
}

// Transaction functions
export async function getAllTransactions(): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
    include: {
      onBehalfOf: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    }
  })

  return transactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount),
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    zakatType: transaction.zakatType as ZakatType,
    onBehalfOf: transaction.onBehalfOf.map(behalf => ({
      id: behalf.id,
      type: behalf.type as OnBehalfOfType,
      name: behalf.name
    })),
    user: transaction.user
      ? {
          ...transaction.user,
          role: transaction.user.role as UserRole
        }
      : undefined
  }))
}

export async function getPaginatedTransactions(page = 1, limit = 10): Promise<{
  transactions: Transaction[];
  totalPages: number;
  totalItems: number;
}> {
  const [transactions, totalItems] = await Promise.all([
    prisma.transaction.findMany({
      include: {
        onBehalfOf: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.transaction.count()
  ])

  const totalPages = Math.ceil(totalItems / limit)

  return {
    transactions: transactions.map(transaction => ({
      ...transaction,
      amount: Number(transaction.amount),
      paymentMethod: transaction.paymentMethod as PaymentMethod,
      zakatType: transaction.zakatType as ZakatType,
      onBehalfOf: transaction.onBehalfOf.map(behalf => ({
        id: behalf.id,
        type: behalf.type as OnBehalfOfType,
        name: behalf.name
      })),
      user: transaction.user
        ? {
            ...transaction.user,
            role: transaction.user.role as UserRole
          }
        : undefined
    })),
    totalPages,
    totalItems
  }
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      onBehalfOf: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true
        }
      }
    }
  })

  if (!transaction) return null

  return {
    ...transaction,
    amount: Number(transaction.amount),
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    zakatType: transaction.zakatType as ZakatType,
    onBehalfOf: transaction.onBehalfOf.map(behalf => ({
      id: behalf.id,
      type: behalf.type as OnBehalfOfType,
      name: behalf.name
    })),
    user: transaction.user
      ? {
          ...transaction.user,
          role: transaction.user.role as UserRole
        }
      : undefined
  }
}

export async function createTransaction(data: {
  donorName: string
  recipientName: string
  onBehalfOf: Array<{
    type: OnBehalfOfType
    name: string
  }>
  amount: number
  date: Date
  paymentMethod: PaymentMethod
  zakatType: ZakatType
  notes?: string
  donorSignature?: string
  recipientSignature?: string
  userId: string
}): Promise<Transaction> {
  const transaction = await prisma.transaction.create({
    data: {
      donorName: data.donorName,
      recipientName: data.recipientName,
      amount: data.amount,
      date: data.date,
      paymentMethod: data.paymentMethod,
      zakatType: data.zakatType,
      notes: data.notes,
      donorSignature: data.donorSignature,
      recipientSignature: data.recipientSignature,
      userId: data.userId,
      onBehalfOf: {
        create: data.onBehalfOf.map(behalf => ({
          type: behalf.type,
          name: behalf.name
        }))
      }
    },
    include: {
      onBehalfOf: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true
        }
      }
    }
  })

  return {
    ...transaction,
    amount: Number(transaction.amount),
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    zakatType: transaction.zakatType as ZakatType,
    onBehalfOf: transaction.onBehalfOf.map(behalf => ({
      id: behalf.id,
      type: behalf.type as OnBehalfOfType,
      name: behalf.name
    })),
    user: transaction.user
      ? {
          ...transaction.user,
          role: transaction.user.role as UserRole
        }
      : undefined
  }
}

export async function updateTransaction(id: string, data: {
  donorName?: string
  recipientName?: string
  onBehalfOf?: Array<{
    type: OnBehalfOfType
    name: string
  }>
  amount?: number
  date?: Date
  paymentMethod?: PaymentMethod
  zakatType?: ZakatType
  notes?: string
  donorSignature?: string
  recipientSignature?: string
}): Promise<Transaction | null> {
  // If onBehalfOf is being updated, we need to handle it separately
  if (data.onBehalfOf) {
    // Delete existing onBehalfOf records
    await prisma.onBehalfOf.deleteMany({
      where: { transactionId: id }
    })
  }

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...(data.donorName && { donorName: data.donorName }),
      ...(data.recipientName && { recipientName: data.recipientName }),
      ...(data.amount && { amount: data.amount }),
      ...(data.date && { date: data.date }),
      ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
      ...(data.zakatType && { zakatType: data.zakatType }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.donorSignature !== undefined && { donorSignature: data.donorSignature }),
      ...(data.recipientSignature !== undefined && { recipientSignature: data.recipientSignature }),
      ...(data.onBehalfOf && {
        onBehalfOf: {
          create: data.onBehalfOf.map(behalf => ({
            type: behalf.type,
            name: behalf.name
          }))
        }
      })
    },
    include: {
      onBehalfOf: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true
        }
      }
    }
  })

  return {
    ...transaction,
    amount: Number(transaction.amount),
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    zakatType: transaction.zakatType as ZakatType,
    onBehalfOf: transaction.onBehalfOf.map(behalf => ({
      id: behalf.id,
      type: behalf.type as OnBehalfOfType,
      name: behalf.name
    })),
    user: transaction.user
      ? {
          ...transaction.user,
          role: transaction.user.role as UserRole
        }
      : undefined
  }
}

export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    // Delete onBehalfOf records first (due to foreign key constraint)
    await prisma.onBehalfOf.deleteMany({
      where: { transactionId: id }
    })
    
    // Delete the transaction
    await prisma.transaction.delete({
      where: { id }
    })
    
    return true
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return false
  }
}

export async function getTransactionStats() {
  const [transactions, aggregations] = await Promise.all([
    prisma.transaction.count(),
    prisma.transaction.groupBy({
      by: ['zakatType'],
      _sum: {
        amount: true
      },
      _count: {
        zakatType: true
      }
    })
  ])

  const stats = {
    fitrah: 0,
    fitrahCount: 0,
    mal: 0,
    malCount: 0,
    infak: 0,
    infakCount: 0,
    other: 0,
    otherCount: 0,
    total: 0,
    totalCount: transactions
  }

  let total = 0
  for (const agg of aggregations) {
    const amount = Number(agg._sum.amount || 0)
    const count = agg._count.zakatType
    total += amount

    switch (agg.zakatType) {
      case ZakatType.FITRAH:
        stats.fitrah = amount
        stats.fitrahCount = count
        break
      case ZakatType.MAL:
        stats.mal = amount
        stats.malCount = count
        break
      case ZakatType.INFAK:
        stats.infak = amount
        stats.infakCount = count
        break
      default:
        stats.other = amount
        stats.otherCount = count
    }
  }

  stats.total = total
  return stats
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const transactions = await prisma.transaction.findMany({
    include: {
      onBehalfOf: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true
        }
      }
    },
    orderBy: {
      date: 'desc'
    },
    take: limit
  })

  return transactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount),
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    zakatType: transaction.zakatType as ZakatType,
    onBehalfOf: transaction.onBehalfOf.map(behalf => ({
      id: behalf.id,
      type: behalf.type as OnBehalfOfType,
      name: behalf.name
    })),
    user: transaction.user
      ? {
          ...transaction.user,
          role: transaction.user.role as UserRole
        }
      : undefined
  }))
}

// Report functions
function getPeriodKey(date: Date, period: "daily" | "weekly" | "monthly" | "yearly") {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  switch (period) {
    case "daily":
      return `${year}-${month + 1}-${day}`
    case "weekly": {
      // Week number of year
      const firstDay = new Date(date.getFullYear(), 0, 1)
      const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
      const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
      return `${year}-W${week}`
    }
    case "monthly":
      return `${year}-${month + 1}`
    case "yearly":
      return `${year}`
    default:
      return ""
  }
}

function getPeriodLabel(date: Date, period: "daily" | "weekly" | "monthly" | "yearly") {
  switch (period) {
    case "daily":
      return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    case "weekly": {
      // Week number of year
      const firstDay = new Date(date.getFullYear(), 0, 1)
      const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
      const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
      return `Minggu ${week} ${date.getFullYear()}`
    }
    case "monthly":
      return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    case "yearly":
      return `${date.getFullYear()}`
    default:
      return ""
  }
}

export async function getReportData(period: "daily" | "weekly" | "monthly" | "yearly"): Promise<ReportData[]> {
  const transactions = await prisma.transaction.findMany({
    select: {
      amount: true,
      date: true,
      zakatType: true
    }
  })

  const grouped: Record<string, ReportData> = {}

  for (const t of transactions) {
    const date = new Date(t.date)
    const key = getPeriodKey(date, period)
    const label = getPeriodLabel(date, period)
    
    if (!grouped[key]) {
      grouped[key] = {
        period: label,
        fitrah: 0,
        mal: 0,
        infak: 0,
        other: 0,
        total: 0,
        transactionCount: 0,
      }
    }

    const amount = Number(t.amount)
    
    switch (t.zakatType) {
      case ZakatType.FITRAH:
        grouped[key].fitrah += amount
        break
      case ZakatType.MAL:
        grouped[key].mal += amount
        break
      case ZakatType.INFAK:
        grouped[key].infak += amount
        break
      default:
        grouped[key].other += amount
    }
    
    grouped[key].total += amount
    grouped[key].transactionCount += 1
  }

  // Sort by period (descending)
  return Object.values(grouped).sort((a, b) => {
    // Try to sort by date, fallback to string
    const aDate = new Date(a.period)
    const bDate = new Date(b.period)
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return bDate.getTime() - aDate.getTime()
    }
    return b.period.localeCompare(a.period)
  })
}

export async function getFilteredReportData(
  period: "daily" | "weekly" | "monthly" | "yearly",
  startDate?: string,
  endDate?: string,
): Promise<ReportData[]> {
  // Build where clause for date filtering
  const whereClause: any = {}
  if (startDate || endDate) {
    whereClause.date = {}
    if (startDate) whereClause.date.gte = new Date(startDate)
    if (endDate) whereClause.date.lte = new Date(endDate)
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    select: {
      amount: true,
      date: true,
      zakatType: true
    }
  })

  const grouped: Record<string, ReportData> = {}

  for (const t of transactions) {
    const date = new Date(t.date)
    const key = getPeriodKey(date, period)
    const label = getPeriodLabel(date, period)
    
    if (!grouped[key]) {
      grouped[key] = {
        period: label,
        fitrah: 0,
        mal: 0,
        infak: 0,
        other: 0,
        total: 0,
        transactionCount: 0,
      }
    }

    const amount = Number(t.amount)
    
    switch (t.zakatType) {
      case ZakatType.FITRAH:
        grouped[key].fitrah += amount
        break
      case ZakatType.MAL:
        grouped[key].mal += amount
        break
      case ZakatType.INFAK:
        grouped[key].infak += amount
        break
      default:
        grouped[key].other += amount
    }
    
    grouped[key].total += amount
    grouped[key].transactionCount += 1
  }

  // Sort by period (descending)
  return Object.values(grouped).sort((a, b) => {
    const aDate = new Date(a.period)
    const bDate = new Date(b.period)
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return bDate.getTime() - aDate.getTime()
    }
    return b.period.localeCompare(a.period)
  })
}

// Chart data functions
export async function getChartData() {
  const aggregations = await prisma.transaction.groupBy({
    by: ['zakatType'],
    _sum: {
      amount: true
    }
  })

  const chartData = {
    fitrah: 0,
    mal: 0,
    infak: 0,
    other: 0
  }

  for (const agg of aggregations) {
    const amount = Number(agg._sum.amount || 0)
    
    switch (agg.zakatType) {
      case ZakatType.FITRAH:
        chartData.fitrah = amount
        break
      case ZakatType.MAL:
        chartData.mal = amount
        break
      case ZakatType.INFAK:
        chartData.infak = amount
        break
      default:
        chartData.other = amount
    }
  }

  return [
    { name: "Fitrah", value: chartData.fitrah, color: "#3b82f6" },
    { name: "Mal", value: chartData.mal, color: "#10b981" },
    { name: "Infak", value: chartData.infak, color: "#f59e0b" },
    { name: "Lainnya", value: chartData.other, color: "#ef4444" },
  ]
}

// User functions
export async function getAllUsers(): Promise<User[]> {
  return await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      role: true
    }
  }).then(users => users.map(user => ({
    ...user,
    role: user.role as UserRole
  })))
}

export async function getUserById(id: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      role: true
    }
  }).then(user => user ? { ...user, role: user.role as UserRole } : null)
}

export async function getUserByUsername(username: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      role: true
    }
  }).then(user => user ? { ...user, role: user.role as UserRole } : null)
}

export async function createUser(data: {
  username: string
  password: string
  name: string
  role: UserRole
}): Promise<User> {
  return await prisma.user.create({
    data,
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      role: true
    }
  }).then(user => ({ ...user, role: user.role as UserRole }))
}

export async function updateUser(id: string, data: {
  username?: string
  password?: string
  name?: string
  role?: UserRole
}): Promise<User | null> {
  return await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      role: true
    }
  }).then(user => ({ ...user, role: user.role as UserRole }))
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    await prisma.user.delete({
      where: { id }
    })
    return true
  } catch (error) {
    console.error('Error deleting user:', error)
    return false
  }
}

// Helper functions for UI labels
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "Cash",
    [PaymentMethod.BANK_TRANSFER]: "Bank Transfer",
    [PaymentMethod.E_WALLET]: "E-Wallet",
    [PaymentMethod.OTHER]: "Lainnya",
  }
  return labels[method] || method
}

export function getZakatTypeLabel(type: ZakatType): string {
  const labels: Record<ZakatType, string> = {
    [ZakatType.FITRAH]: "Fitrah",
    [ZakatType.MAL]: "Mal",
    [ZakatType.INFAK]: "Infak",
    [ZakatType.OTHER]: "Lainnya",
  }
  return labels[type] || type
}

export function getOnBehalfOfTypeLabel(type: OnBehalfOfType): string {
  const labels: Record<OnBehalfOfType, string> = {
    [OnBehalfOfType.SELF]: "Diri sendiri",
    [OnBehalfOfType.FAMILY]: "Keluarga",
    [OnBehalfOfType.BADAL]: "Badal",
    [OnBehalfOfType.OTHER]: "Lainnya",
  }
  return labels[type] || type
}

export function getUserRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Admin",
    [UserRole.STAFF]: "Staff",
  }
  return labels[role] || role
}

// Cleanup function to disconnect Prisma client
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}