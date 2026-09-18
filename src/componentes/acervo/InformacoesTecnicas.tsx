import type { AnexoPublico } from "../../dados/consultas/anexos";
import { tamanhoLegivel } from "./TabelaAnexos";

export function InformacoesTecnicas({ arquivo }: { arquivo: AnexoPublico }) {
  return (
    <details className="acervo-tecnico border p-4">
      <summary>Informações técnicas</summary>
      <dl className="mt-4 grid gap-2">
        <div>
          <dt>Formato</dt>
          <dd>{arquivo.mimeType}</dd>
        </div>
        <div>
          <dt>Tamanho</dt>
          <dd>{tamanhoLegivel(arquivo.bytes)}</dd>
        </div>
        <div>
          <dt>SHA-256</dt>
          <dd className="break-all font-mono select-text">{arquivo.sha256}</dd>
        </div>
        <div>
          <dt>URL pública</dt>
          <dd className="break-all select-text">{arquivo.linkPermanente}</dd>
        </div>
        {arquivo.arquivoDerivacaoMetodo ? (
          <div>
            <dt>Método registrado</dt>
            <dd>{arquivo.arquivoDerivacaoMetodo.replaceAll("_", " ")}</dd>
          </div>
        ) : null}
        {arquivo.arquivoRelacao && arquivo.arquivoOrigemId ? (
          <div>
            <dt>Proveniência</dt>
            <dd>
              {arquivo.arquivoRelacao} de {arquivo.arquivoOrigemId}
            </dd>
          </div>
        ) : null}
      </dl>
    </details>
  );
}
