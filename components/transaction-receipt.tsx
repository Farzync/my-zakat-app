// lib/pdf-receipt.ts
import {
  getOnBehalfOfTypeLabel,
  getPaymentMethodLabel,
  getZakatTypeLabel,
  Transaction,
} from '@/lib/data'
import { formatCurrency } from '@/lib/utils'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'localhost:3000'

export async function generateReceiptPDF(transaction: Transaction) {
  const doc = new jsPDF()
  const verifyUrl = `https://${BASE_URL}/verify/tx?id=${transaction.id}`

  const qrDataUrl = await QRCode.toDataURL(verifyUrl)

  doc.setProperties({
    title: 'Struk Zakat',
    subject: 'Bukti pembayaran zakat',
    author: 'my-zakat-app',
  })

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Struk Zakat - Bukti Pembayaran', 14, 20)

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(
    `Tanggal     : ${transaction.date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`,
    14,
    35
  )

  doc.text(`Donatur     : ${transaction.donorName}`, 14, 42)
  doc.text(`Penerima    : ${transaction.recipientName}`, 14, 49)
  doc.text(`Pembayaran  : ${getPaymentMethodLabel(transaction.paymentMethod)}`, 14, 56)
  doc.text(`Jenis Zakat : ${getZakatTypeLabel(transaction.zakatType)}`, 14, 63)
  doc.text(`Nominal     : ${formatCurrency(transaction.amount)}`, 14, 72)

  if (transaction.notes) {
    doc.setFont('helvetica', 'italic')
    doc.text('Catatan:', 14, 82)
    doc.setFont('helvetica', 'normal')
    doc.text(transaction.notes, 14, 89, { maxWidth: 180 })
  }

  autoTable(doc, {
    startY: 105,
    head: [['Atas Nama', 'Nama/Keterangan']],
    body: transaction.onBehalfOf.map(item => [getOnBehalfOfTypeLabel(item.type), item.name]),
    styles: { fontSize: 10 },
  })

  const finalY = (doc as any).lastAutoTable?.finalY || 130

  // 🧾 Footer
  doc.setFontSize(10)
  doc.setTextColor(120)
  doc.text('Dokumen ini adalah bukti sah pembayaran zakat.', 14, finalY + 10)
  doc.text('Verifikasi struk digital', 14, finalY + 16)

  // 📸 Tambahkan QR Code
  doc.addImage(qrDataUrl, 'PNG', 150, finalY + 5, 40, 40)

  doc.save(`struk-zakat-${transaction.id}.pdf`)
}
