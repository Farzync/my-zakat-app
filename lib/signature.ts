import { Transaction } from '@/lib/data'

// Helper function to normalize strings consistently
function normalizeString(str: string): string {
  return str
    .trim() // Remove leading/trailing whitespace
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, '') // Remove special characters (optional, comment out if needed)
}

// Helper function to create consistent base string
function createBaseString(transaction: Transaction): string {
  const parts = [
    transaction.id,
    normalizeString(transaction.donorName),
    normalizeString(transaction.recipientName),
    transaction.amount.toString(),
    new Date(transaction.date).toISOString(),
    transaction.paymentMethod,
    transaction.zakatType,
  ]

  const baseString = parts.join('|')

  // Debug logging (remove in production)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Base string parts:', parts)
    console.log('Final base string:', baseString)
  }

  return baseString
}

// Digital signature functions are removed. Use only transaction.id for verification.

export function isTransactionIdValid(transaction: { id: string } | null, id: string): boolean {
  return !!transaction && transaction.id === id
}
