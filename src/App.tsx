import type { JSX } from "preact";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
import {
  ESTADOS_BRASIL,
  TODOS_ESTADOS,
  findStateByUf,
  getAllowedRegionDigits
} from "./brazilStates";
import {
  buscarVariacoesCpf,
  formatCpf,
  formatCpfPartial,
  getCpfRegionDigit,
  isCpfValid,
  normalizeCpf
} from "./cpf";
import type { EstadoApp, ResultadoVariacao } from "./types";

function assertNever(value: never): never {
  throw new Error(`Unhandled app state: ${String(value)}`);
}

function pluralizeDigit(count: number): string {
  return count === 1 ? "digit" : "digits";
}

function CopyButton({ text }: { text: string }): JSX.Element {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleCopy(): void {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <button
      type="button"
      class={`btn-copy${copied ? " copied" : ""}`}
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy CPF"}
      title="Copy to clipboard"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

function renderHighlightedCpf(
  formatted: string,
  originalFormatted: string
): JSX.Element {
  return (
    <span class="cpf-value">
      {formatted.split("").map((char, i) => {
        const isChanged = /\d/.test(char) && char !== originalFormatted[i];
        return isChanged ? (
          <span key={i} class="changed-digit">{char}</span>
        ) : (
          <span key={i}>{char}</span>
        );
      })}
    </span>
  );
}

export function App(): JSX.Element {
  const [estado, setEstado] = useState<EstadoApp>("entrada");
  const [entrada, setEntrada] = useState("");
  const [cpfOriginal, setCpfOriginal] = useState("");
  const [resultados, setResultados] = useState<ResultadoVariacao[]>([]);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);
  const [progressoBusca, setProgressoBusca] = useState("Waiting for input...");
  const [totalVerificados, setTotalVerificados] = useState(0);
  const [mudancaAtual, setMudancaAtual] = useState<number | null>(null);
  const [estadoSelecionadoUf, setEstadoSelecionadoUf] =
    useState<string>(TODOS_ESTADOS);

  const inputRef = useRef<HTMLInputElement>(null);

  const entradaHabilitada = estado === "entrada" || estado === "concluido";
  const hasInput = entrada.trim().length > 0;

  const handleCpfInput = useCallback((event: JSX.TargetedEvent<HTMLInputElement>) => {
    const el = event.currentTarget;
    const rawCursor = el.selectionStart ?? 0;
    const oldValue = el.value;

    const digitsBeforeCursor = oldValue.slice(0, rawCursor).replace(/\D/g, "").length;

    const newDigits = el.value.replace(/\D/g, "").slice(0, 11);
    const formatted = formatCpfPartial(newDigits);
    setEntrada(formatted);

    let digitsSeen = 0;
    let newCursor = 0;
    for (let i = 0; i < formatted.length; i += 1) {
      if (/\d/.test(formatted[i])) {
        digitsSeen += 1;
      }
      if (digitsSeen === digitsBeforeCursor) {
        newCursor = i + 1;
        break;
      }
    }
    if (digitsBeforeCursor === 0) {
      newCursor = 0;
    }

    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    });
  }, []);
  const estadoSelecionado = useMemo(() => {
    return findStateByUf(estadoSelecionadoUf);
  }, [estadoSelecionadoUf]);
  const allowedRegionDigits = useMemo(() => {
    return getAllowedRegionDigits(estadoSelecionadoUf);
  }, [estadoSelecionadoUf]);
  const cpfOriginalFormatado = useMemo(() => {
    return cpfOriginal ? formatCpf(cpfOriginal) : null;
  }, [cpfOriginal]);
  const cpfOriginalRegionDigit = useMemo(() => {
    return cpfOriginal ? getCpfRegionDigit(cpfOriginal) : null;
  }, [cpfOriginal]);

  async function handleBuscar(event: Event): Promise<void> {
    event.preventDefault();

    if (!entradaHabilitada || !hasInput) {
      return;
    }

    setEstado("validando");
    setMensagemErro(null);
    setResultados([]);
    setTotalVerificados(0);
    setMudancaAtual(null);

    const cpfLimpo = normalizeCpf(entrada);

    if (cpfLimpo.length !== 11) {
      setMensagemErro("CPF must have 11 digits.");
      setEstado("entrada");
      return;
    }

    if (!isCpfValid(cpfLimpo)) {
      setMensagemErro("Invalid CPF.");
      setEstado("entrada");
      return;
    }

    setCpfOriginal(cpfLimpo);
    setEstado("buscando");

    try {
      const response = await buscarVariacoesCpf(
        cpfLimpo,
        3,
        (progress) => {
          setMudancaAtual(progress.currentChangeCount);
          setTotalVerificados(progress.totalChecked);
          setProgressoBusca(progress.message);
        },
        allowedRegionDigits
      );

      setResultados(response.resultados);
      setTotalVerificados(response.totalChecked);
      setMudancaAtual(response.changesUsed);
      setEstado("concluido");

      if (response.resultados.length === 0) {
        const filtroMensagem = estadoSelecionado
          ? ` for ${estadoSelecionado.nome} (${estadoSelecionado.uf})`
          : "";
        setProgressoBusca(
          `Search complete. No valid variation found${filtroMensagem}. Total checked: ${response.totalChecked}.`
        );
      } else {
        setProgressoBusca(
          `Search complete. Found ${response.resultados.length} valid variation(s). Total checked: ${response.totalChecked}.`
        );
      }
    } catch (error) {
      console.error(error);
      setMensagemErro("Unexpected error while searching variations.");
      setEstado("entrada");
    }
  }

  function handleReset(): void {
    setEstado("entrada");
    setEntrada("");
    setCpfOriginal("");
    setResultados([]);
    setMensagemErro(null);
    setProgressoBusca("Waiting for input...");
    setTotalVerificados(0);
    setMudancaAtual(null);
  }

  function renderStatus(): JSX.Element {
    switch (estado) {
      case "entrada":
        return (
          <p class="status-text muted">
            Enter a valid CPF to generate minimum-change variants.
          </p>
        );
      case "validando":
        return (
          <div class="status-row">
            <span class="spinner" aria-hidden="true" />
            <p class="status-text">Validating CPF...</p>
          </div>
        );
      case "buscando":
        return (
          <div>
            <div class="status-row">
              <span class="spinner" aria-hidden="true" />
              <p class="status-text">{progressoBusca}</p>
            </div>
            <p class="status-subtle">
              Checked candidates: <strong>{totalVerificados}</strong>
              {mudancaAtual ? ` | current level: ${mudancaAtual} change(s)` : ""}
            </p>
          </div>
        );
      case "concluido":
        return (
          <div>
            <p class="status-text success">{progressoBusca}</p>
            <p class="status-subtle">
              Checked candidates: <strong>{totalVerificados}</strong>
            </p>
          </div>
        );
      default:
        return assertNever(estado);
    }
  }

  return (
    <main class="app-shell">
      <section class="card">
        <div class="header-row">
          <h1>WTF-CPF</h1>
          <a
            class="github-link"
            href="https://github.com/storopoli/WTF-CPF"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source on GitHub"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </div>
        <p class="tagline">
          Technical playground for generating plausible CPF variants with valid
          check digits.
        </p>

        <form class="controls" onSubmit={handleBuscar}>
          <label for="cpf-input">CPF</label>
          <div class="control-row">
            <input
              id="cpf-input"
              ref={inputRef}
              type="text"
              value={entrada}
              onInput={handleCpfInput}
              placeholder="000.000.000-00"
              maxLength={14}
              disabled={!entradaHabilitada}
              inputMode="numeric"
              autoComplete="off"
            />

            <button
              class="btn-primary"
              type="submit"
              disabled={!entradaHabilitada || !hasInput}
            >
              Buscar
            </button>
            <button
              class="btn-secondary"
              type="button"
              onClick={handleReset}
              disabled={estado === "buscando" || estado === "validando"}
            >
              Nova Busca
            </button>
          </div>
          <label for="state-select">Issuing state (UF)</label>
          <div class="control-row">
            <div class="select-wrapper">
              <select
                id="state-select"
                value={estadoSelecionadoUf}
                disabled={!entradaHabilitada}
                onChange={(event) => {
                  const target = event.currentTarget as HTMLSelectElement;
                  setEstadoSelecionadoUf(target.value);
                }}
              >
                <option value={TODOS_ESTADOS}>Any issuing state</option>
                {ESTADOS_BRASIL.map((estadoUf) => {
                  return (
                    <option key={estadoUf.uf} value={estadoUf.uf}>
                      {estadoUf.nome} ({estadoUf.uf}) — digit {estadoUf.cpfRegionDigit}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <p class="helper-text">
            CPF does not encode an exact state, only a fiscal region group via
            the 9th digit.
          </p>
        </form>

        {mensagemErro ? <p class="error">{mensagemErro}</p> : null}

        <section
          class={`status-panel${estado === "buscando" ? " searching" : ""}`}
        >
          {renderStatus()}
        </section>

        <section class="results-panel">
          <div class="results-header">
            <h2>Valid Variations</h2>
            <span class="results-count">{resultados.length}</span>
          </div>

          {cpfOriginalFormatado ? (
            <p class="origin">
              Original: {cpfOriginalFormatado}
              {cpfOriginalRegionDigit !== null
                ? ` | region digit: ${cpfOriginalRegionDigit}`
                : ""}
            </p>
          ) : null}

          {resultados.length > 0 && cpfOriginalFormatado ? (
            <ol class="results-list">
              {resultados.map((resultado) => {
                return (
                  <li key={resultado.cpfRaw} class="result-row">
                    {renderHighlightedCpf(resultado.cpfFormatado, cpfOriginalFormatado)}
                    <div class="result-actions">
                      <span class="difference-badge">
                        {resultado.numDiferencas} {pluralizeDigit(resultado.numDiferencas)}
                      </span>
                      <CopyButton text={resultado.cpfFormatado} />
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p class="empty-results">
              {estado === "entrada"
                ? "No search yet."
                : "No results for this CPF within 1-3 changed digits."}
            </p>
          )}
        </section>

        <footer class="footer-note">
          Educational and satirical experimentation only. This app runs fully in
          your browser and stores no data.
        </footer>
      </section>
    </main>
  );
}
