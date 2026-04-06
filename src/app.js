import express from "express";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import recordRoutes from "./routes/records.js";
import dashboardRoutes from "./routes/dashboard.js";
import rateLimit from "express-rate-limit";
import cors from "cors";

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { error: "Too many requests, please try again later" }
});

app.use(express.json());
app.use(limiter);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(cors());




app.use((err, req, res, next) => {
  if (err.isOperational) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
});

export default app;