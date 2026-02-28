export type EstadoApp = "entrada" | "validando" | "buscando" | "concluido";

export interface ResultadoVariacao {
  cpfRaw: string;
  cpfFormatado: string;
  numDiferencas: number;
}

export interface ProgressoBusca {
  message: string;
  totalChecked: number;
  currentChangeCount: number;
}

export interface BuscaVariacoesResult {
  resultados: ResultadoVariacao[];
  totalChecked: number;
  changesUsed: number | null;
}
