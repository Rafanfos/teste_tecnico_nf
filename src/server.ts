import app from "./app";
import prisma from "./infra/database/prisma";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Versão do NodeJS: ${process.version}`);
  if (process.env.DATABASE_URL) {
    console.log("DATABASE_URL configurada.");
  } else {
    console.warn(
      "ATENÇÃO: DATABASE_URL não está configurada. A aplicação pode não funcionar corretamente com o banco de dados."
    );
  }
  if (process.env.DRFINANCAS_API_KEY) {
    console.log("DRFINANCAS_API_KEY configurada.");
  } else {
    console.warn(
      "ATENÇÃO: DRFINANCAS_API_KEY não está configurada. A emissão de notas fiscais falhará."
    );
  }
});

const handleShutdown = async () => {
  console.log("Servidor HTTP encerrado.");
  try {
    await prisma.$disconnect();
    console.log("Conexão com o banco de dados encerrada com sucesso.");
  } catch (error) {
    console.error("Erro ao desconectar do banco de dados:", error);
  }
  console.log("Todos os recursos foram liberados. Encerrando processo.");
  process.exit(0);
};

process.on("SIGTERM", () => {
  console.info("Sinal SIGTERM recebido: iniciando o encerramento elegante...");
  server.close(handleShutdown);
});

process.on("SIGINT", () => {
  console.info(
    "Sinal SIGINT recebido (Ctrl+C): iniciando o encerramento elegante..."
  );
  server.close(handleShutdown);
});

