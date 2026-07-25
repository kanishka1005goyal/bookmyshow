import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";

const app = express();       // pehle declare

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api/auth", authRoutes);   // uske baad use

export default app;