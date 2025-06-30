import { getTransactionById } from '@/lib/data'
import VerifyTransactionClient from '@/components/verify-transaction-view'

function isTransactionIdValid(transaction: { id: string } | null, id: string): boolean {
  return !!transaction && transaction.id === id
}

export default async function VerifyTransactionPage({
  searchParams,
}: {
  searchParams: { id?: string; sign?: string }
}) {
  const id = searchParams.id
  // sign parameter is ignored, only id is used

  if (!id) {
    return <VerifyTransactionClient status="invalid" />
  }

  const tx = await getTransactionById(id)

  if (!tx) {
    return <VerifyTransactionClient status="not_found" />
  }

  const isValid = isTransactionIdValid(tx, id)

  if (!isValid) {
    return <VerifyTransactionClient status="invalid" />
  }

  return <VerifyTransactionClient status="valid" transaction={tx} />
}
