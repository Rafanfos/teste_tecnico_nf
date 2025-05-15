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
) => {
  console.error("ERRO DETECTADO:", err.name, err.message, err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : "Ocorreu um erro inesperado no servidor.";

  if (err.message.startsWith("API Externa: 400")) {
    return res
      .status(400)
      .json({
        message: "Erro na solicitação à API externa (400).",
        details: err.message,
      });
  }
  if (err.message.startsWith("API Externa: 401")) {
    return res
      .status(401)
      .json({
        message: "Erro de autenticação com a API externa (401).",
        details: err.message,
      });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    return res
      .status(409)
      .json({ message: "Conflito de dados.", details: err.message });
  }

  if (
    err.name === "Error" &&
    err.message.includes("Solicitação não encontrada")
  ) {
    return res.status(404).json({ message: err.message });
  }

  if (
    err.name === "Error" &&
    (err.message.includes("Nota Fiscal já emitida") ||
      err.message.includes("solicitação cancelada"))
  ) {
    return res.status(400).json({ message: err.message });
  }

  res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Envia stacktrace apenas em dev
  });
};

