import express, { Express, Request, Response, NextFunction } from "express";
import "dotenv/config";
import invoiceRoutes from "./api/routes/invoice.routes";
import { errorHandler } from "./api/middlewares/errorHandler";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

app.use("/invoices", invoiceRoutes);

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;

