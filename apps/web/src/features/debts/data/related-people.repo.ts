import { prisma } from "@valora/auth/prisma";

export async function listRelatedPeople(userId: string) {
  return prisma.relatedPerson.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
    },
  });
}
