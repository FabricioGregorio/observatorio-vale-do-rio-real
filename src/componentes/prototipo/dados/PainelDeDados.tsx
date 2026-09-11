import {
  INDICADORES,
  type IndicadorDerivado,
} from "../../../dados/indicadores/derivados";
import { exibirIndicador } from "../../../dados/indicadores/formato";
import { CSS_DOS_DADOS } from "./estilosDosDados";
import { RankingDeAtividades } from "./RankingDeAtividades";
import { SerieMensal } from "./SerieMensal";

export type ComposicaoDosDados = "declaracao" | "painel";

const ROTULOS: Readonly<Record<ComposicaoDosDados, string>> = {
  declaracao: "A — Declaração editorial",
  painel: "B — Painel de pesquisa",
};

function porId(id: string): IndicadorDerivado {
  const achado = INDICADORES.find((indicador) => indicador.id === id);
  if (achado === undefined) throw new Error(`indicador ausente: ${id}`);
  return achado;
}

/**
 * Ficha do indicador — a camada de metadado.
 *
 * Base, período e recorte ficam aqui, em IBM Plex Mono, e não no meio da
 * frase. Campo sem valor na fonte não vira linha: metadado vazio só para dar
 * aparência técnica é cenografia.
 */
function FichaDoIndicador({ indicador }: { indicador: IndicadorDerivado }) {
  return (
    <dl className="painel-dados__ficha">
      {indicador.base === null ? null : (
        <div>
          <dt>Base</dt>
          <dd>{indicador.base}</dd>
        </div>
      )}
      <div>
        <dt>Período</dt>
        <dd>{indicador.periodo}</dd>
      </div>
      <div>
        <dt>Recorte</dt>
        <dd>{indicador.recorte}</dd>
      </div>
      <div>
        <dt>Cálculo</dt>
        <dd>{indicador.regra}</dd>
      </div>
      <div>
        <dt>Fonte</dt>
        <dd>{indicador.fontePublica}</dd>
      </div>
    </dl>
  );
}

function CelulaDeIndicador({ indicador }: { indicador: IndicadorDerivado }) {
  return (
    <div className="painel-dados__celula">
      <p className="painel-dados__valor">{exibirIndicador(indicador)}</p>
      <h3>{indicador.titulo}</h3>
      <p className="meta-ficha">
        {indicador.base === null ? indicador.periodo : indicador.base}
      </p>
    </div>
  );
}

/**
 * Seção Dados — laboratório da H4.0, em dois tratamentos.
 *
 * Server Component puro: nenhuma ilha, nenhum gráfico que se desenha, nenhum
 * contador rolando. O número aparece pronto porque ele já está pronto.
 *
 * Os dois presets usam **o mesmo dataset**, os mesmos valores brutos, a mesma
 * precisão, a mesma base e o mesmo recorte. O que muda é hierarquia e
 * densidade — em A um indicador governa a composição; em B os oito convivem
 * numa grade de consulta.
 *
 * O título editorial é **proposta** e está marcado como tal na tela. O título
 * estrutural `03 — DADOS` vem da estrutura aprovada da Home.
 *
 * Não existe entrada pública: a H4.0 termina no laboratório, e a escolha entre
 * A e B é humana. Quando ela vier, a H4.1 acrescenta o contexto Home, como o
 * Território e a Pesquisa em Campo já fazem.
 */
export function PainelDeDados({
  composicao,
}: {
  composicao: ComposicaoDosDados;
}) {
  const prefixo = `dados-${composicao}`;
  const protagonista = porId("H4-001");
  const apoio = porId("H4-002");
  const demais = INDICADORES.filter(
    (indicador) => indicador.id !== protagonista.id,
  );

  return (
    <section
      aria-labelledby={`${prefixo}-titulo`}
      className="painel-dados"
      data-composicao={composicao}
      data-testid={`preset-${composicao}`}
      id={prefixo}
    >
      <style>{CSS_DOS_DADOS}</style>

      <div className="painel-dados__cabecalho">
        <div>
          <p className="meta-ficha">03 — DADOS</p>
          <p className="meta-ficha painel-dados__proposta">
            Preset {ROTULOS[composicao]} · somente DEV
          </p>
        </div>
        {/*
          O título estrutural vem da estrutura aprovada da Home. O editorial é
          redação da H4.0 e continua PROPOSTA até decisão humana; a marca fica
          fora do `h2` para não entrar no nome acessível da seção.
        */}
        <p className="meta-ficha">Título editorial · proposta</p>
        <h2 id={`${prefixo}-titulo`}>Onde o recurso circula</h2>
        <p>
          Os números abaixo vêm do levantamento próprio do Observatório em dois
          equipamentos culturais de Tobias Barreto, entre julho e dezembro de
          2025. Cada um traz base, período, recorte e regra de cálculo.
        </p>
      </div>

      <div className="painel-dados__corpo">
        {composicao === "declaracao" ? (
          <>
            <div className="painel-dados__monumental">
              <p className="painel-dados__valor painel-dados__numero">
                {exibirIndicador(protagonista)}
              </p>
              <p className="painel-dados__rotulo">{protagonista.titulo}</p>
              <FichaDoIndicador indicador={protagonista} />
            </div>

            <div className="painel-dados__leitura">
              <p className="meta-ficha">Leitura do dado</p>
              <h3>O que este número mede, e o que não mede</h3>
              <p>
                O indicador mede a parcela da despesa identificada que foi
                executada dentro do município. Ele não mede lucro, não mede
                impacto e não descreve o que aconteceu fora das despesas com
                localidade identificada.
              </p>
              {protagonista.notaMetodologica === null ? null : (
                <p className="painel-dados__nota">
                  {protagonista.notaMetodologica}
                </p>
              )}
            </div>

            <div className="painel-dados__apoio">
              <div className="painel-dados__grade">
                <CelulaDeIndicador indicador={apoio} />
                <CelulaDeIndicador indicador={porId("H4-007")} />
              </div>
            </div>

            <SerieMensal prefixo={prefixo} />
          </>
        ) : (
          <>
            <div className="painel-dados__monumental">
              <p className="painel-dados__valor painel-dados__numero">
                {exibirIndicador(protagonista)}
              </p>
              <p className="painel-dados__rotulo">{protagonista.titulo}</p>
            </div>

            <div className="painel-dados__grade">
              {demais.map((indicador) => (
                <CelulaDeIndicador indicador={indicador} key={indicador.id} />
              ))}
            </div>

            <div className="painel-dados__leitura">
              <p className="meta-ficha">Como ler esta seção</p>
              <p>
                Cada valor tem base, período, recorte e regra declarados. As
                contagens de contratações não são contagens de pessoas, e a
                despesa identificada por localidade é menor que a despesa total.
              </p>
              <FichaDoIndicador indicador={protagonista} />
            </div>

            <SerieMensal prefixo={prefixo} />

            <div className="painel-dados__ranking">
              <RankingDeAtividades />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
