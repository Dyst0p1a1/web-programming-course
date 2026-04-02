import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "web-basics" },
    update: {},
    create: {
      name: "Web Basics",
      slug: "web-basics",
    },
  });

  await prisma.question.createMany({
    data: [
      {
        text: "Which of the following are semantic HTML tags?",
        type: "multiple-select",
        categoryId: category.id,
        correctAnswer: ["header", "main", "footer"],
        points: 3,
      },
      {
        text: "Explain the difference between localStorage and sessionStorage.",
        type: "essay",
        categoryId: category.id,
        points: 5,
      },
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });