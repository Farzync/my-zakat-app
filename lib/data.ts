import transactionsData from "@/data/transactions.json"

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
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  switch (period) {
    case "daily":
      return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    case "weekly": {
      // Week number of year
      const firstDay = new Date(date.getFullYear(), 0, 1)
      const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000))
      const week = Math.ceil((days + firstDay.getDay() + 1) / 7)
      return `Minggu ${week} ${year}`
    }
    case "monthly":
      return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
    case "yearly":
      return `${year}`
    default:
      return ""
  }
}

export async function getReportData(period: "daily" | "weekly" | "monthly" | "yearly"): Promise<ReportData[]> {
  const transactions = await getAllTransactions()
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
    let type = t.zakatType
    if (type === "fitrah") {
      grouped[key].fitrah += t.amount
    } else if (type === "mal") {
      grouped[key].mal += t.amount
    } else if (type === "infak") {
      grouped[key].infak += t.amount
    } else {
      grouped[key].other += t.amount
    }
    grouped[key].total += t.amount
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
  const data = await getReportData(period)
  if (!startDate && !endDate) return data

  // Filter by period key
  const start = startDate ? new Date(startDate) : undefined
  const end = endDate ? new Date(endDate) : undefined

  return data.filter((item) => {
    // Try to parse date from label
    let itemDate: Date | null = null
    try {
      if (period === "daily") {
        // e.g. "15 Januari 2024"
        const [d, m, y] = item.period.split(" ")
        const monthMap: Record<string, number> = {
          Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
          Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
        }
        itemDate = new Date(Number(y), monthMap[m], Number(d))
      } else if (period === "monthly") {
        // e.g. "Januari 2024"
        const [m, y] = item.period.split(" ")
        const monthMap: Record<string, number> = {
          Januari: 0, Februari: 1, Maret: 2, April: 3, Mei: 4, Juni: 5,
          Juli: 6, Agustus: 7, September: 8, Oktober: 9, November: 10, Desember: 11,
        }
        itemDate = new Date(Number(y), monthMap[m], 1)
      } else if (period === "yearly") {
        itemDate = new Date(Number(item.period), 0, 1)
      } else {
        // weekly: fallback, not accurate
        itemDate = new Date(item.period)
      }
    } catch {
      itemDate = null
    }
    if (!itemDate) return true
    if (start && itemDate < start) return false
    if (end && itemDate > end) return false
    return true
  })
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
