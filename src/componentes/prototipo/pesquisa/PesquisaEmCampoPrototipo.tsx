import Image from "next/image";

import {
  exibirDataDaFotografia,
  PASTA_PUBLICA_DA_PESQUISA,
  REGISTROS_DOS_PROTOTIPOS,
  type RegistroDoPrototipo,
} from "../../../dados/pesquisa/derivados";
import {
  CSS_DA_PESQUISA,
  CSS_DO_LABORATORIO_DA_PESQUISA,
} from "../../pesquisa/estilosDaPesquisa";

export type ComposicaoDaPesquisa = "documental-aberto" | "caderno-tecnico";
export type ContextoDaPesquisa = "home" | "prototipo";

const ROTULOS: Readonly<Record<ComposicaoDaPesquisa, string>> = {
  "documental-aberto": "A — Documental aberto",
  "caderno-tecnico": "B — Caderno técnico",
};

/**
 * Ficha do registro — a camada de metadado da seção.
 *
 * `Local` e `Data` são os dois campos que interessam a quem lê: onde, e a
 * declaração de que a data não veio junto. A ausência é dita aqui, como campo,
 * e não explicada no texto corrido.
 *
 * `completa` acrescenta tipo e fonte, e existe só para o Preset B do
 * laboratório. **A fonte nomeia o conjunto documental restrito**, então ela
 * nunca acompanha a composição publicada na Home.
 */
function FichaDoRegistro({
  registro,
  completa = false,
}: {
  registro: RegistroDoPrototipo;
  completa?: boolean;
}) {
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
      {completa ? (
        <>
          <div>
            <dt>Tipo de registro</dt>
            <dd>{registro.tipo}</dd>
          </div>
          <div>
            <dt>Fonte</dt>
            <dd>{registro.fonte}</dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

/**
 * Larguras reais do slot, medidas na Home: a principal ocupa 8 de 12 colunas
 * dentro de um container que trava em 1152 px, e as secundárias ocupam 4 de 10
 * colunas de uma faixa recuada. Abaixo de 768 px a composição vira uma coluna,
 * e a secundária fica em `min(88%, 28rem)`.
 *
 * `sizes` que declara mais largura do que o layout usa faz o navegador baixar
 * um recorte maior à toa: com `62vw`, a fotografia principal vinha em 1080 px
 * para um slot de 733 px. Aqui ele descreve o slot que existe.
 */
const SIZES_PRINCIPAL =
  "(max-width: 768px) 100vw, (max-width: 1152px) 64vw, 736px";
const SIZES_SECUNDARIA =
  "(max-width: 768px) min(88vw, 448px), (max-width: 1152px) 34vw, 390px";

function Fotografia({
  registro,
  principal = false,
}: {
  registro: RegistroDoPrototipo;
  principal?: boolean;
}) {
  return (
    <figure className={principal ? "pesquisa-campo__principal" : undefined}>
      <div className="pesquisa-campo__imagem">
        <Image
          alt={registro.alt}
          height={registro.altura}
          loading="lazy"
          sizes={principal ? SIZES_PRINCIPAL : SIZES_SECUNDARIA}
          src={`${PASTA_PUBLICA_DA_PESQUISA}/${registro.arquivo}`}
          width={registro.largura}
        />
      </div>
      <figcaption className="pesquisa-campo__legenda">
        <strong>{registro.titulo}</strong>
        <span className="meta-ficha">
          {registro.local} · {exibirDataDaFotografia(registro.data)} · registro
          fotográfico
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Seção Pesquisa em Campo — implementação compartilhada pela Home e pelo
 * laboratório.
 *
 * Server Component puro. Não há seleção, carrossel ou animação: as fotografias
 * e sua leitura documental não precisam de JavaScript para funcionar.
 *
 * O `contexto` decide apenas o que é rótulo de desenvolvimento. Na Home entra
 * a composição A aprovada, sem marca de preset e sem marca de proposta; o
 * laboratório continua exibindo A e B lado a lado para comparação.
 *
 * A ficha documental — e com ela o identificador do conjunto de origem —
 * pertence só ao preset B, que é de laboratório. O conjunto continua RESTRITO
 * e não há regra documental que autorize publicar seus metadados, por isso ele
 * não chega ao HTML servido na Home.
 */
export function PesquisaEmCampoPrototipo({
  composicao,
  contexto = "prototipo",
}: {
  composicao: ComposicaoDaPesquisa;
  contexto?: ContextoDaPesquisa;
}) {
  const igreja = REGISTROS_DOS_PROTOTIPOS[2];
  const chegada = REGISTROS_DOS_PROTOTIPOS[0];
  const forno = REGISTROS_DOS_PROTOTIPOS[1];
  const prefixo =
    contexto === "home" ? "pesquisa-home" : `pesquisa-${composicao}`;

  return (
    <section
      aria-labelledby={`${prefixo}-titulo`}
      className="pesquisa-campo"
      data-composicao={composicao}
      data-contexto={contexto}
      data-testid={
        contexto === "prototipo" ? `preset-${composicao}` : "pesquisa-home"
      }
      id={prefixo}
    >
      <style>
        {contexto === "prototipo"
          ? `${CSS_DA_PESQUISA}
${CSS_DO_LABORATORIO_DA_PESQUISA}`
          : CSS_DA_PESQUISA}
      </style>

      {/*
        `div`, e não `header`. Um `header` aninhado em `section` não vira
        landmark de banner, então não acrescenta semântica — mas cria um
        segundo `<header>` visível na Home, que é exatamente o que o teste do
        cabeçalho real vigia. A seção Território já usa `div` pelo mesmo
        motivo; o `h2` com `aria-labelledby` é quem nomeia a seção.
      */}
      <div className="pesquisa-campo__cabecalho">
        <div>
          <p className="meta-ficha">02 — PESQUISA EM CAMPO</p>
          {contexto === "prototipo" ? (
            <p className="meta-ficha pesquisa-campo__proposta">
              Preset {ROTULOS[composicao]} · somente DEV
            </p>
          ) : null}
        </div>
        <h2 id={`${prefixo}-titulo`}>O campo como documento</h2>
        <p>
          A pesquisa foi a campo e fotografou o que encontrou. As imagens desta
          seção pertencem ao acervo do projeto e documentam lugares onde o
          trabalho aconteceu.
        </p>
      </div>

      <div className="pesquisa-campo__corpo">
        <Fotografia principal registro={igreja} />

        <div className="pesquisa-campo__texto">
          <p className="meta-ficha">Leitura do registro</p>
          <h3>Da abstração do mapa à materialidade do território</h3>
          <p>
            Os registros desta seção são de Ilha Grande, um dos lugares onde a
            pesquisa esteve.
          </p>
          {/*
            A ausência de data é dita na ficha, como campo, e não explicada no
            texto. O visitante precisa saber que a data não veio junto; o
            porquê de ela não ser inferida é assunto do registro técnico.
          */}
          <FichaDoRegistro
            completa={composicao === "caderno-tecnico"}
            registro={igreja}
          />
          <div className="pesquisa-campo__metodo">
            <p className="meta-ficha">Método · síntese transversal</p>
            <p>
              A pesquisa reúne fotografia, entrevista gravada e formulário de
              resposta. Nem todo lugar recebeu as três.
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
