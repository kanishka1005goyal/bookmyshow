import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

// route mounting yahan aayega
// app.use("/api/auth", authRoutes);

export default app;