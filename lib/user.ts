import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function getUserByCredentials(username: string, password: string) {
  return await prisma.user.findFirst({
    where: {
      username,
      password,
    },
  })
}
