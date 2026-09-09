import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  HeroManifesto,
  type VarianteDoHero,
} from "../../../componentes/hero/HeroManifesto";
import { CabecalhoPrototipo } from "../../../componentes/prototipo/CabecalhoPrototipo";
import {
  ITENS_COM_DESTINO,
  ITENS_EM_DEMONSTRACAO,
} from "../../../componentes/prototipo/menuAlvo";
import {
  DERIVADOS_DO_HERO,
  ORIGINAL_DO_HERO,
} from "../../../dados/hero/derivados";

/**
 * Protótipo do Hero — Fase H1. **Rota de desenvolvimento.**
 *
 * Existe para que as duas variantes possam ser vistas, medidas e comparadas
 * antes de qualquer decisão. Ela **não** substitui a Home: a Home pública
 * continua exatamente como está até a variante ser escolhida por decisão
 * humana.
 *
 * ## Por que não é rota pública
 *
 * Mesma proteção de `/dev/estilos`, e pelo mesmo motivo: em produção o render
 * é interrompido por 404 nativo. Fora do índice de busca, fora do
 * `sitemap.ts`, e sem link a partir de nenhuma página pública.
 *
 * Um protótipo alcançável de fora seria conteúdo publicado — e conteúdo
 * publicado num site de prestação de contas é afirmação. Este ainda é
 * rascunho.
 *
 * ## Por que as duas variantes na mesma página
 *
 * Comparar em duas abas é comparar de memória. Uma abaixo da outra, com a
 * mesma fotografia, os mesmos tokens e o mesmo cabeçalho, a única diferença
 * que sobra é a que está em avaliação.
 */

export const metadata: Metadata = {
  title: "Protótipo — Hero Manifesto",
  robots: { index: false, follow: false },
};

type InterromperCom404 = () => never;

/**
 * Mantém a decisão testável sem reatribuir `process.env.NODE_ENV`: em produção
 * o render é interrompido pelo 404 nativo; nos demais ambientes nada acontece.
 */
export function exigirAmbienteDeDesenvolvimento(
  ambiente: string | undefined,
  interromper: InterromperCom404 = notFound,
): void {
  if (ambiente === "production") interromper();
}

const VARIANTES: { chave: VarianteDoHero; titulo: string; nota: string }[] = [
  {
    chave: "wordmark",
    titulo: "Hero A — wordmark oficial",
    nota: "A marca oficial carrega visualmente o nome. Nada é recriado com fonte: o lettering vem do próprio vetor. O h1 existe no DOM, por extenso, para leitor de tela e indexação.",
  },
  {
    chave: "tipografia",
    titulo: "Hero B — tipografia editorial",
    nota: "O nome é construído em Archivo, e a marca oficial aparece menor, ao lado. Não finge que Archivo é a fonte da logo — são coisas declaradamente diferentes.",
  },
];

/**
 * Isolamento do protótipo.
 *
 * O layout raiz renderiza o cabeçalho e o rodapé do site em toda rota, e no
 * App Router um layout aninhado não remove o que o layout de cima já colocou.
 * Sem isto, a página mostraria dois cabeçalhos empilhados e a composição em
 * avaliação ficaria irreconhecível.
 *
 * Esconder por CSS é aceitável **porque esta regra só existe enquanto esta
 * página está renderizada**, e esta página responde 404 em produção. A
 * alternativa — mover o cabeçalho do site do layout raiz para um layout de
 * grupo de rotas — é refatoração de layout, e não é o que a H1 autoriza.
 *
 * Quando a variante escolhida for aplicada à Home, nada disto viaja junto: o
 * cabeçalho definitivo substitui o atual no layout raiz, e este arquivo some.
 */
const CSS_DE_ISOLAMENTO = `
body > header, body > footer { display: none; }
`.trim();

export default function PrototipoDoHero() {
  exigirAmbienteDeDesenvolvimento(process.env.NODE_ENV);

  return (
    <div className="flex flex-col">
      <style>{CSS_DE_ISOLAMENTO}</style>
      <CabecalhoPrototipo />

      {VARIANTES.map(({ chave, titulo, nota }) => (
        <div key={chave}>
          <HeroManifesto id={`hero-${chave}`} variante={chave} />
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8">
            <h2 className="text-xl">{titulo}</h2>
            <p style={{ maxWidth: "var(--largura-leitura)" }}>{nota}</p>
          </div>
        </div>
      ))}

      <section
        aria-labelledby="ficha-do-prototipo"
        className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pb-16"
      >
        <h2 className="text-xl" id="ficha-do-prototipo">
          Ficha do protótipo
        </h2>

        <p style={{ maxWidth: "var(--largura-leitura)" }}>
          Esta rota é de desenvolvimento e responde 404 em produção. Nenhuma
          variante foi aplicada à Home: a escolha entre A e B é humana.
        </p>

        <dl className="flex flex-col gap-3">
          <div>
            <dt className="meta-ficha">Original</dt>
            <dd>
              {ORIGINAL_DO_HERO.arquivo} — {ORIGINAL_DO_HERO.larguraOrientada}
              &times;{ORIGINAL_DO_HERO.alturaOrientada} depois de aplicada a
              orientação do EXIF. Não versionado.
            </dd>
          </div>
          <div>
            <dt className="meta-ficha">Metadados removidos</dt>
            <dd>{ORIGINAL_DO_HERO.metadadosRemovidos.join(" · ")}</dd>
          </div>
          <div>
            <dt className="meta-ficha">Derivados</dt>
            <dd>
              {DERIVADOS_DO_HERO.map(
                (d) => `${d.arquivo} (${d.largura}×${d.altura})`,
              ).join(" · ")}
            </dd>
          </div>
          <div>
            <dt className="meta-ficha">Menu — itens com destino real</dt>
            <dd>{ITENS_COM_DESTINO.map((i) => i.rotulo).join(" · ")}</dd>
          </div>
          <div>
            <dt className="meta-ficha">Menu — itens em demonstração</dt>
            <dd>
              {ITENS_EM_DEMONSTRACAO.map((i) => i.rotulo).join(" · ")} — sem
              rota, por isso renderizados como texto e não como link.
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
