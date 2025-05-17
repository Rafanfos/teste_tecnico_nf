import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Ocorreu um erro inesperado no servidor.";

  if (err.message.startsWith("API Externa: 400")) {
    res.status(400).json({
      message: "Erro na solicitação à API externa (400).",
      details: err.message,
    });
    return;
  }
  if (err.message.startsWith("API Externa: 401")) {
    res.status(401).json({
      message: "Erro de autenticação com a API externa (401).",
      details: err.message,
    });
    return;
  }

  if (err.name === "PrismaClientKnownRequestError") {
    res
      .status(409)
      .json({ message: "Conflito de dados.", details: err.message });
    return;
  }

  if (
    err.name === "Error" &&
    err.message.includes("Solicitação não encontrada")
  ) {
    res.status(404).json({ message: err.message });
    return;
  }

  if (
    err.name === "Error" &&
    (err.message.includes("Nota Fiscal já emitida") ||
      err.message.includes("solicitação cancelada"))
  ) {
    res.status(400).json({ message: err.message });
    return;
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
