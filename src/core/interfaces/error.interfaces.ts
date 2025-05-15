interface AppError extends Error {
  status?: number;
  message: string;
}
