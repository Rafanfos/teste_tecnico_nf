import express, { Express, Request, Response } from "express";
import "dotenv/config";
import invoiceRoutes from "./api/routes/invoice.routes";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger-output.json";
import { errorHandler } from "./api/middlewares/errorHandler.middleware";

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

app.use("/api/invoice-requests", invoiceRoutes);

app.use(errorHandler);

export default app;

