import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { notFound } from "./middlewares/notfound";
import { errorHandler } from "./middlewares/errorHandler";
import adminRoutes from "./routes/admin";
import userRoutes from "./routes/user";
import sellerRoutes from "./routes/seller";
import connectDB from "./config/db";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/seller", sellerRoutes);

app.use(notFound);

app.use(errorHandler);
const port = process.env.port || 3000;
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
