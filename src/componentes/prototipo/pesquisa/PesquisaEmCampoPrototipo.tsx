import Image from "next/image";

import {
  DERIVADOS_DA_PESQUISA,
  type DerivadoDaPesquisa,
  PASTA_PUBLICA_DA_PESQUISA,
} from "../../../dados/pesquisa/derivados";
import { CSS_DA_PESQUISA } from "./estilosDaPesquisa";

export type ComposicaoDaPesquisa = "documental-aberto" | "caderno-tecnico";

const ROTULOS: Readonly<Record<ComposicaoDaPesquisa, string>> = {
  "documental-aberto": "A — Documental aberto",
  "caderno-tecnico": "B — Caderno técnico",
};

function FichaDoRegistro({ registro }: { registro: DerivadoDaPesquisa }) {
  return (
    <dl className="pesquisa-campo__ficha">
      <div>
        <dt>Local</dt>
        <dd>{registro.local}</dd>
      </div>
      <div>
        <dt>Data</dt>
        <dd>Não informada</dd>
      </div>
      <div>
        <dt>Tipo de registro</dt>
        <dd>{registro.tipo}</dd>
      </div>
      <div>
        <dt>Fonte</dt>
        <dd>{registro.fonte}</dd>
      </div>
    </dl>
  );
}

function Fotografia({
  registro,
  principal = false,
}: {
  registro: DerivadoDaPesquisa;
  principal?: boolean;
}) {
  return (
    <figure className={principal ? "pesquisa-campo__principal" : undefined}>
      <div className="pesquisa-campo__imagem">
        <Image
          alt={registro.alt}
          height={registro.altura}
          loading="lazy"
          sizes={
            principal
              ? "(max-width: 768px) 100vw, 62vw"
              : "(max-width: 768px) 88vw, 30vw"
          }
          src={`${PASTA_PUBLICA_DA_PESQUISA}/${registro.arquivo}`}
          width={registro.largura}
        />
      </div>
      <figcaption className="pesquisa-campo__legenda">
        <strong>{registro.titulo}</strong>
        <span className="meta-ficha">
          {registro.local} · data não informada · registro fotográfico
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Dois tratamentos editoriais para o mesmo conteúdo seguro da H3.
 *
 * Server Component puro. Não há seleção, carrossel ou animação: as fotografias
 * e sua leitura documental não precisam de JavaScript para funcionar.
 */
export function PesquisaEmCampoPrototipo({
  composicao,
}: {
  composicao: ComposicaoDaPesquisa;
}) {
  const igreja = DERIVADOS_DA_PESQUISA[2];
  const chegada = DERIVADOS_DA_PESQUISA[0];
  const forno = DERIVADOS_DA_PESQUISA[1];
  const prefixo = `pesquisa-${composicao}`;

  return (
    <section
      aria-labelledby={`${prefixo}-titulo`}
      className="pesquisa-campo"
      data-composicao={composicao}
      data-testid={`preset-${composicao}`}
      id={prefixo}
    >
      <style>{CSS_DA_PESQUISA}</style>

      <header className="pesquisa-campo__cabecalho">
        <div>
          <p className="meta-ficha">02 — PESQUISA EM CAMPO</p>
          <p className="meta-ficha pesquisa-campo__proposta">
            Preset {ROTULOS[composicao]} · somente DEV
          </p>
        </div>
        <h2 id={`${prefixo}-titulo`}>O campo como documento</h2>
        <p>
          <span className="meta-ficha">Título editorial · proposta</span>
          <br />
          Três registros sem pessoas identificáveis aproximam a cartografia da
          presença física: chegada por água, arquitetura e uma atividade em área
          coberta.
        </p>
      </header>

      <div className="pesquisa-campo__corpo">
        <Fotografia principal registro={igreja} />

        <div className="pesquisa-campo__texto">
          <p className="meta-ficha">Leitura do registro</p>
          <h3>Da abstração do mapa à materialidade do território</h3>
          <p>
            Este recorte reúne três fotografias documentadas como Ilha Grande. A
            data das imagens não está confirmada e, por isso, não é inferida a
            partir de entrevistas, relatórios ou metadados do arquivo.
          </p>
          {composicao === "caderno-tecnico" ? (
            <FichaDoRegistro registro={igreja} />
          ) : (
            <p className="pesquisa-campo__aviso">
              Ilha Grande · registro fotográfico · data não informada
            </p>
          )}
          <div className="pesquisa-campo__metodo">
            <p className="meta-ficha">Método · síntese transversal</p>
            <p>
              O corpus do projeto reúne registros fotográficos, entrevistas
              gravadas e formulários de resposta. Esta síntese não atribui todas
              as técnicas a todos os locais.
            </p>
          </div>
        </div>

        <div className="pesquisa-campo__secundarias">
          <Fotografia registro={chegada} />
          <Fotografia registro={forno} />
        </div>
      </div>
    </section>
  );
}
