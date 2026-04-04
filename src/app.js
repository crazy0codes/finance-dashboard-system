import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import recordRoutes from "./routes/records.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

export default app;