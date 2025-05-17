# API de Gerenciamento de Solicitações de Notas Fiscais

## Apresentação do Projeto

Esta API foi desenvolvida para gerenciar solicitações de emissão de notas fiscais. Ela permite criar, listar e consultar solicitações, além de emitir notas fiscais através de integração com um serviço externo (DrFinanças).

A aplicação foi construída utilizando Node.js, TypeScript, Express e Prisma ORM, seguindo boas práticas de desenvolvimento como Clean Architecture, validação de dados, tratamento de erros e documentação automática via Swagger.

## Como Instalar

### Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL (banco de dados)
- npm ou yarn

### Passos para Instalação

1. Clone o repositório:
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd nf_management_api
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
   Edite o arquivo `.env` com suas configurações, especialmente:
   - `DATABASE_URL`: URL de conexão com o PostgreSQL
   - `DRFINANCAS_API_KEY`: Chave de API para o serviço DrFinanças

4. Execute as migrações do banco de dados:
   ```bash
   npx prisma migrate dev
   ```

5. Gere o cliente Prisma:
   ```bash
   npx prisma generate
   ```

6. Gere a documentação Swagger:
   ```bash
   node swagger.js
   ```

7. Inicie o servidor:
   ```bash
   npm run dev
   ```

## Funcionamento

A API estará disponível em `http://localhost:3000` (ou na porta definida na variável de ambiente `PORT`).

Em ambiente de produção, a API estará disponível em: `[URL_DE_PRODUCAO]`

### Fluxo Principal

1. Crie uma solicitação de nota fiscal
2. Consulte o status da solicitação
3. Emita a nota fiscal quando estiver pronto

## Documentação da API

### Swagger UI

A documentação interativa da API está disponível em:
- Desenvolvimento: `http://localhost:3000/api-docs`
- Produção: `[URL_DE_PRODUCAO]/api-docs`

Para habilitar o Swagger UI, descomente as linhas relacionadas no arquivo `src/app.ts`.

### Endpoints Principais

#### Criar Solicitação de Nota Fiscal
- **Método**: POST
- **Endpoint**: `/api/invoice-requests`
- **Corpo da Requisição**:
  ```json
  {
    "takerCnpj": "12345678000195",
    "serviceCity": "São Paulo",
    "serviceState": "SP",
    "serviceValue": 1500.50,
    "desiredIssueDate": "2024-12-31T00:00:00.000Z",
    "serviceDescription": "Consultoria em desenvolvimento de software"
  }
  ```
- **Resposta de Sucesso**: Status 201 (Created)

#### Listar Todas as Solicitações
- **Método**: GET
- **Endpoint**: `/api/invoice-requests`
- **Resposta de Sucesso**: Status 200 (OK)

#### Buscar Solicitação por ID
- **Método**: GET
- **Endpoint**: `/api/invoice-requests/{id}`
- **Resposta de Sucesso**: Status 200 (OK)
- **Resposta de Erro**: Status 404 (Not Found)

#### Emitir Nota Fiscal
- **Método**: POST
- **Endpoint**: `/api/invoice-requests/{id}/emit`
- **Resposta de Sucesso**: Status 200 (OK)
- **Respostas de Erro**: 
  - Status 400 (Bad Request): Nota já emitida ou solicitação cancelada
  - Status 404 (Not Found): Solicitação não encontrada
  - Status 500 (Internal Server Error): Erro na API externa

## Solução para Frontend Assíncrono

![Diagrama C4 para Solução Assíncrona]
