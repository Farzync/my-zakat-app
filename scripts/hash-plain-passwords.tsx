import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

async function hashPlainPasswords() {
  const users = await prisma.user.findMany()

  let updated = 0

  for (const user of users) {
    const currentPassword = user.password

    // Cek apakah password masih plaintext (belum di-hash)
    const isHashed = currentPassword.startsWith("$2b$") || currentPassword.startsWith("$2a$")
    if (isHashed) continue

    const hashedPassword = await bcrypt.hash(currentPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    console.log(`🔐 Password hashed for user: ${user.username}`)
    updated++
  }

  if (updated === 0) {
    console.log("✅ Semua password sudah dalam bentuk hash.")
  } else {
    console.log(`🎉 Total ${updated} password berhasil di-hash.`)
  }
}

hashPlainPasswords()
  .catch((err) => {
    console.error("❌ Gagal meng-hash password:", err)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
