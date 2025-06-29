import { prisma } from "@/lib/prisma";

export async function getUserByCredentials(username: string, password: string) {
  return await prisma.user.findFirst({
    where: {
      username,
      password,
    },
  })
}
