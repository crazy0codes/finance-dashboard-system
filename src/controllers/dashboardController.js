import {
  getSummary,
  getCategoryTotals,
  getRecentActivity,
  getMonthlyTrends
} from "../services/dashboardService.js";

export async function getSummaryController(req, res) {
  try {
    const summary = await getSummary();
    return res.status(200).json({ summary });
  } catch (error) {
    if (error.isOperational) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getCategoryTotalsController(req, res) {
  try {
    const totals = await getCategoryTotals();
    return res.status(200).json({ totals });
  } catch (error) {
    if (error.isOperational) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getRecentActivityController(req, res) {
  try {
    const activity = await getRecentActivity();
    return res.status(200).json({ activity });
  } catch (error) {
    if (error.isOperational) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getMonthlyTrendsController(req, res) {
  try {
    const trends = await getMonthlyTrends();
    return res.status(200).json({ trends });
  } catch (error) {
    if (error.isOperational) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal Server Error" });
  }
}