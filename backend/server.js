require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { testConnection } = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes    = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");  // ← NEW

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "API running", timestamp: new Date().toISOString() })
);

app.use("/api/auth",     authRoutes);
app.use("/api/students", studentRoutes);   // ← NEW

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`\n🚀 Server → http://localhost:${PORT}`);
    console.log(`📋 ENV    → ${process.env.NODE_ENV || "development"}\n`);
  });
};

start();
