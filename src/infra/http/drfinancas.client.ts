import axios, { AxiosInstance } from "axios";
import {
  IInvoiceEmissionPayload,
  IInvoiceEmissionSuccessResponse,
  IExternalInvoiceService,
} from "../../core/interfaces/invoice.interfaces";

const DRFINANCAS_API_URL = process.env.DRFINANCAS_API_URL;
const DRFINANCAS_API_KEY = process.env.DRFINANCAS_API_KEY;

export class DrFinancasClient implements IExternalInvoiceService {
  private apiClient: AxiosInstance;

  constructor() {
    if (!DRFINANCAS_API_KEY) {
      throw new Error(
        "Chave da API DrFinanças (DRFINANCAS_API_KEY) não configurada nas variáveis de ambiente."
      );
    }
    this.apiClient = axios.create({
      baseURL: DRFINANCAS_API_URL,
      headers: {
        Authorization: DRFINANCAS_API_KEY,
        "Content-Type": "application/json",
      },
    });
  }

  async emitInvoice(
    payload: IInvoiceEmissionPayload
  ): Promise<IInvoiceEmissionSuccessResponse> {
    try {
      const response =
        await this.apiClient.post<IInvoiceEmissionSuccessResponse>(
          "/",
          payload
        );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error(
          `Erro ao emitir NF na API externa: ${error.response.status}`,
          error.response.data
        );
        throw new Error(
          `API Externa: ${error.response.status} - ${JSON.stringify(
            error.response.data
          )}`
        );
      }
      console.error("Erro desconhecido ao emitir NF na API externa:", error);
      throw new Error(
        "Erro desconhecido ao comunicar com a API de emissão de notas fiscais."
      );
    }
  }
}
