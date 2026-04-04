import prisma from "../config/db.js";
import { AppError } from "../utils/appError.js";

export async function getSummary() {
  try {
    const [income, expense] = await Promise.all([
      prisma.record.aggregate({
        where: { type: "INCOME", deletedAt: null },
        _sum: { amount: true }
      }),
      prisma.record.aggregate({
        where: { type: "EXPENSE", deletedAt: null },
        _sum: { amount: true }
      })
    ]);

    const totalIncome = income._sum.amount ?? 0;
    const totalExpense = expense._sum.amount ?? 0;

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    };
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
}

export async function getCategoryTotals() {
  try {
    const totals = await prisma.record.groupBy({
      by: ["category"],
      where: { deletedAt: null },
      _sum: { amount: true }
    });

    return totals.map(item => ({
      category: item.category,
      total: item._sum.amount ?? 0
    }));
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
}

export async function getRecentActivity() {
  try {
    const records = await prisma.record.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 10
    });
    return records;
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
}

export async function getMonthlyTrends() {
  try {
    const records = await prisma.record.findMany({
      where: { deletedAt: null },
      select: { amount: true, type: true, date: true },
      orderBy: { date: "asc" }
    });

    const trends = {};
    for (const record of records) {
      const month = record.date.toISOString().slice(0, 7);
      if (!trends[month]) trends[month] = { income: 0, expense: 0 };
      if (record.type === "INCOME") trends[month].income += Number(record.amount);
      else trends[month].expense += Number(record.amount);
    }

    return Object.entries(trends).map(([month, data]) => ({
      month,
      ...data,
      net: data.income - data.expense
    }));
  } catch (error) {
    console.error(error);
    throw new AppError("Internal Server Error", 500);
  }
}