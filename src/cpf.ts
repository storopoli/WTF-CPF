import type {
  BuscaVariacoesResult,
  ProgressoBusca,
  ResultadoVariacao
} from "./types";

const CPF_LENGTH = 11;

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatCpf(cpf: string): string {
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9, 11)}`;
}

export function formatCpfPartial(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function getCpfRegionDigit(cpf: string): number {
  return Number(cpf[8]);
}

export function countDifferences(cpfA: string, cpfB: string): number {
  let differences = 0;

  for (let i = 0; i < Math.min(cpfA.length, cpfB.length); i += 1) {
    if (cpfA[i] !== cpfB[i]) {
      differences += 1;
    }
  }

  return differences;
}

export function isCpfValid(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf)) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const digits = cpf.split("").map((digit) => Number(digit));

  const checkDigitOne = calculateCheckDigit(digits.slice(0, 9), 10);
  if (digits[9] !== checkDigitOne) {
    return false;
  }

  const checkDigitTwo = calculateCheckDigit(digits.slice(0, 10), 11);
  return digits[10] === checkDigitTwo;
}

function calculateCheckDigit(digits: number[], startWeight: number): number {
  const weightedSum = digits.reduce((sum, digit, index) => {
    return sum + digit * (startWeight - index);
  }, 0);

  const remainder = weightedSum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

function generateCombinations(values: number[], size: number): number[][] {
  const output: number[][] = [];
  const partial: number[] = [];

  function walk(startIndex: number): void {
    if (partial.length === size) {
      output.push([...partial]);
      return;
    }

    for (let index = startIndex; index < values.length; index += 1) {
      partial.push(values[index]);
      walk(index + 1);
      partial.pop();
    }
  }

  walk(0);
  return output;
}

function buildCandidate(
  originalDigits: number[],
  positions: number[],
  variantIndex: number
): number[] {
  const candidate = [...originalDigits];
  let temporary = variantIndex;

  for (const position of positions) {
    const originalDigit = originalDigits[position];
    const offset = temporary % 9;
    temporary = Math.floor(temporary / 9);

    const newDigit = offset < originalDigit ? offset : offset + 1;
    candidate[position] = newDigit;
  }

  return candidate;
}

function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export async function buscarVariacoesCpf(
  cpfOriginal: string,
  maxMudancas = 3,
  onProgress?: (progress: ProgressoBusca) => void,
  allowedRegionDigits?: ReadonlySet<number> | null
): Promise<BuscaVariacoesResult> {
  const originalDigits = cpfOriginal.split("").map((digit) => Number(digit));
  const positions = Array.from({ length: CPF_LENGTH }, (_, index) => index);
  let totalChecked = 0;

  for (let numMudancas = 1; numMudancas <= maxMudancas; numMudancas += 1) {
    const resultados: ResultadoVariacao[] = [];
    const seenCpfs = new Set<string>();
    const combinations = generateCombinations(positions, numMudancas);

    onProgress?.({
      message: `Buscando variacoes com ${numMudancas} digito(s) alterado(s)...`,
      totalChecked,
      currentChangeCount: numMudancas
    });

    let cycleCounter = 0;

    for (const indexSet of combinations) {
      const totalVariants = 9 ** indexSet.length;

      for (let variant = 0; variant < totalVariants; variant += 1) {
        totalChecked += 1;
        cycleCounter += 1;

        const candidateDigits = buildCandidate(originalDigits, indexSet, variant);
        const candidateCpf = candidateDigits.join("");
        const candidateRegionDigit = candidateDigits[8];

        if (
          allowedRegionDigits &&
          !allowedRegionDigits.has(candidateRegionDigit)
        ) {
          continue;
        }

        if (isCpfValid(candidateCpf) && !seenCpfs.has(candidateCpf)) {
          seenCpfs.add(candidateCpf);
          resultados.push({
            cpfRaw: candidateCpf,
            cpfFormatado: formatCpf(candidateCpf),
            numDiferencas: countDifferences(cpfOriginal, candidateCpf)
          });
        }

        if (onProgress && totalChecked % 250 === 0) {
          onProgress({
            message: `Buscando variacoes com ${numMudancas} digito(s) alterado(s)...`,
            totalChecked,
            currentChangeCount: numMudancas
          });
        }

        if (cycleCounter >= 2000) {
          cycleCounter = 0;
          await yieldToBrowser();
        }
      }
    }

    if (resultados.length > 0) {
      return {
        resultados,
        totalChecked,
        changesUsed: numMudancas
      };
    }
  }

  return {
    resultados: [],
    totalChecked,
    changesUsed: null
  };
}
