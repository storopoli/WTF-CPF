export interface EstadoBrasileiro {
  readonly uf: string;
  readonly nome: string;
  readonly cpfRegionDigit: number;
}

export const ESTADOS_BRASIL: readonly EstadoBrasileiro[] = [
  { uf: "AC", nome: "Acre", cpfRegionDigit: 2 },
  { uf: "AL", nome: "Alagoas", cpfRegionDigit: 4 },
  { uf: "AP", nome: "Amapa", cpfRegionDigit: 2 },
  { uf: "AM", nome: "Amazonas", cpfRegionDigit: 2 },
  { uf: "BA", nome: "Bahia", cpfRegionDigit: 5 },
  { uf: "CE", nome: "Ceara", cpfRegionDigit: 3 },
  { uf: "DF", nome: "Distrito Federal", cpfRegionDigit: 1 },
  { uf: "ES", nome: "Espirito Santo", cpfRegionDigit: 7 },
  { uf: "GO", nome: "Goias", cpfRegionDigit: 1 },
  { uf: "MA", nome: "Maranhao", cpfRegionDigit: 3 },
  { uf: "MT", nome: "Mato Grosso", cpfRegionDigit: 1 },
  { uf: "MS", nome: "Mato Grosso do Sul", cpfRegionDigit: 1 },
  { uf: "MG", nome: "Minas Gerais", cpfRegionDigit: 6 },
  { uf: "PA", nome: "Para", cpfRegionDigit: 2 },
  { uf: "PB", nome: "Paraiba", cpfRegionDigit: 4 },
  { uf: "PR", nome: "Parana", cpfRegionDigit: 9 },
  { uf: "PE", nome: "Pernambuco", cpfRegionDigit: 4 },
  { uf: "PI", nome: "Piaui", cpfRegionDigit: 3 },
  { uf: "RJ", nome: "Rio de Janeiro", cpfRegionDigit: 7 },
  { uf: "RN", nome: "Rio Grande do Norte", cpfRegionDigit: 4 },
  { uf: "RS", nome: "Rio Grande do Sul", cpfRegionDigit: 0 },
  { uf: "RO", nome: "Rondonia", cpfRegionDigit: 2 },
  { uf: "RR", nome: "Roraima", cpfRegionDigit: 2 },
  { uf: "SC", nome: "Santa Catarina", cpfRegionDigit: 9 },
  { uf: "SP", nome: "Sao Paulo", cpfRegionDigit: 8 },
  { uf: "SE", nome: "Sergipe", cpfRegionDigit: 5 },
  { uf: "TO", nome: "Tocantins", cpfRegionDigit: 1 }
];

export const TODOS_ESTADOS = "ANY";

export function findStateByUf(uf: string): EstadoBrasileiro | null {
  const found = ESTADOS_BRASIL.find((state) => state.uf === uf);
  return found ?? null;
}

export function getAllowedRegionDigits(uf: string): Set<number> | null {
  const state = findStateByUf(uf);
  if (!state) {
    return null;
  }

  return new Set([state.cpfRegionDigit]);
}
