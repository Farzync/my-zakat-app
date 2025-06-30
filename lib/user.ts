import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function getUserByCredentials(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) return null

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) return null

  return user
}
