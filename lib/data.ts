import transactionsData from "@/data/transactions.json"
import reportsData from "@/data/reports.json"
import usersData from "@/data/users.json"

export interface Transaction {
  id: string
  donorName: string
  recipientName: string
  onBehalfOf: Array<{
    type: "self" | "family" | "badal" | "other"
    name: string
  }>
  amount: number
  date: string
  paymentMethod: string
  zakatType: string
  notes?: string
  donorSignature?: string
  recipientSignature?: string
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
  role: string
}

// Transaction functions
export async function getAllTransactions(): Promise<Transaction[]> {
  return transactionsData as Transaction[]
}

export async function getTransactionById(id: string): Promise<Transaction | null> {
  const transactions = await getAllTransactions()
  return transactions.find((t) => t.id === id) || null
}

export async function getTransactionStats() {
  const transactions = await getAllTransactions()

  const stats = transactions.reduce(
    (acc, transaction) => {
      const amount = transaction.amount
      acc.total += amount
      acc.totalCount += 1

      switch (transaction.zakatType) {
        case "fitrah":
          acc.fitrah += amount
          acc.fitrahCount += 1
          break
        case "mal":
          acc.mal += amount
          acc.malCount += 1
          break
        case "infak":
          acc.infak += amount
          acc.infakCount += 1
          break
        default:
          acc.other += amount
          acc.otherCount += 1
      }

      return acc
    },
    {
      fitrah: 0,
      fitrahCount: 0,
      mal: 0,
      malCount: 0,
      infak: 0,
      infakCount: 0,
      other: 0,
      otherCount: 0,
      total: 0,
      totalCount: 0,
    },
  )

  return stats
}

export async function getRecentTransactions(limit = 5): Promise<Transaction[]> {
  const transactions = await getAllTransactions()
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
}

// Report functions
export async function getReportData(period: "daily" | "weekly" | "monthly" | "yearly"): Promise<ReportData[]> {
  const reports = reportsData as Record<string, ReportData[]>
  return reports[period] || []
}

export async function getFilteredReportData(
  period: "daily" | "weekly" | "monthly" | "yearly",
  startDate?: string,
  endDate?: string,
): Promise<ReportData[]> {
  const data = await getReportData(period)

  // In a real app, you would filter by actual dates
  // For now, we'll just return the data as is
  return data
}

// User functions
export async function getUserByCredentials(username: string, password: string): Promise<User | null> {
  const users = usersData as User[]
  return users.find((u) => u.username === username && u.password === password) || null
}

// Chart data functions
export async function getChartData() {
  const transactions = await getAllTransactions()

  const chartData = transactions.reduce(
    (acc, transaction) => {
      const amount = transaction.amount

      switch (transaction.zakatType) {
        case "fitrah":
          acc.fitrah += amount
          break
        case "mal":
          acc.mal += amount
          break
        case "infak":
          acc.infak += amount
          break
        default:
          acc.other += amount
      }

      return acc
    },
    { fitrah: 0, mal: 0, infak: 0, other: 0 },
  )

  return [
    { name: "Fitrah", value: chartData.fitrah, color: "#3b82f6" },
    { name: "Mal", value: chartData.mal, color: "#10b981" },
    { name: "Infak", value: chartData.infak, color: "#f59e0b" },
    { name: "Lainnya", value: chartData.other, color: "#ef4444" },
  ]
}
