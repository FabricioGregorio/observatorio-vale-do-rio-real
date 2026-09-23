import Link from "next/link";
import { MENU_INSTITUCIONAL, MENU_PRINCIPAL } from "../../lib/navegacao";
import { COLETIVO, NOME_OFICIAL } from "../home/conteudo";
import { ReguaDeCreditos } from "../institucional/ReguaDeCreditos";
import { CSS_DO_RODAPE } from "./estilosRodape";

/**
 * Rodapé do Observatório — o mesmo em todas as rotas públicas, inclusive na
 * Home.
 *
 * ## O que ele deixou de ser
 *
 * Até 2026-09-20 havia dois: este, com cinco links institucionais e um bloco
 * de créditos vazio, e o da Home, com o nome oficial e os mesmos cinco links.
 * A Home escondia este por CSS. Dois rodapés é a forma mais barata de manter
 * duas verdades sobre quem realiza e quem financia o projeto — e num site que
 * existe para comprovar execução as duas acabam divergindo.
 *
 * Agora é um só. O conteúdo, os links e a régua institucional têm fonte única;
 * a Home não esconde mais nada.
 *
 * ## A composição
 *
 * Quatro faixas, de cima para baixo:
 *
 * 1. **identidade** — o nome oficial, quem realiza e a frase de permanência;
 * 2. **navegação** — as seções do site e, com menos peso, as institucionais;
 * 3. **régua de marcas** — num painel claro, pelas razões que
 *    `ReguaDeCreditos` explica;
 * 4. **assinatura** — licença e endereço do acervo.
 *
 * A faixa de navegação é `MENU_PRINCIPAL` inteiro, e nada além dele. Até
 * 2026-09-23 havia um item escrito à mão ao lado da lista — a Prestação de
 * Contas, que era seção do site sem ser item do menu. Ela deixou de existir
 * como área pública, e o Acervo, que já está no menu, não precisa de uma
 * segunda entrada para o mesmo destino.
 *
 * O traçado de fundo é a mesma família gráfica da Cartografia Viva: linhas de
 * nível e um ponto de coordenada, desenhados em SVG inline de poucas centenas
 * de bytes, `aria-hidden`, e que somem sob `prefers-reduced-motion` porque
 * nunca se movem. Nenhuma biblioteca, nenhum JavaScript.
 *
 * ## Por que o CSS vem por `<style>`
 *
 * Mesma razão do cabeçalho (`estilosCabecalho.ts`): o rodapé é servido em toda
 * rota, e uma folha de rota não alcançaria a Home, que monta a sua própria
 * árvore. A string é uma só, importada de um módulo, e não há segunda cópia.
 */
export function Rodape() {
  return (
    <footer className="rd">
      <style>{CSS_DO_RODAPE}</style>
      {/*
        Traçado de coordenada: três linhas de nível e um ponto. Decoração pura,
        fora da árvore de acessibilidade, e sem custo de requisição.
      */}
      <svg
        aria-hidden="true"
        className="rd__tracado"
        preserveAspectRatio="none"
        viewBox="0 0 1200 320"
      >
        <title>Traçado decorativo</title>
        <path d="M0 96C180 72 320 128 520 112S860 40 1200 72" />
        <path d="M0 168C200 144 340 204 540 188S880 112 1200 148" />
        <path d="M0 244C220 220 360 276 560 260S900 188 1200 224" />
        <circle cx="540" cy="188" r="5" />
        <circle cx="540" cy="188" r="14" />
      </svg>

      <div className="rd__interior">
        <section aria-labelledby="rd-identidade" className="rd__identidade">
          <h2 className="meta-ficha meta-ficha--inversa" id="rd-identidade">
            Observatório
          </h2>
          <p className="rd__nome">{NOME_OFICIAL}</p>
          <p className="rd__realizacao">Realização: {COLETIVO}</p>
          <p className="rd__permanencia">
            Cada arquivo publicado aqui tem endereço próprio neste domínio e
            data de publicação — sem login e sem pedido de acesso.
          </p>
        </section>

        <nav aria-label="Seções do site" className="rd__secoes">
          <h2 className="meta-ficha meta-ficha--inversa">Seções</h2>
          <ul>
            {MENU_PRINCIPAL.map((item) => (
              <li key={item.href}>
                <Link
                  className="focus-visible:outline-destaque"
                  href={item.href}
                  prefetch={false}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Páginas institucionais" className="rd__institucional">
          <h2 className="meta-ficha meta-ficha--inversa">Institucional</h2>
          <ul>
            {MENU_INSTITUCIONAL.map((item) => (
              <li key={item.href}>
                <Link
                  className="focus-visible:outline-destaque"
                  href={item.href}
                  prefetch={false}
                >
                  {item.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-labelledby="creditos-fomento" className="rd__creditos">
          <h2 className="meta-ficha meta-ficha--inversa" id="creditos-fomento">
            Créditos de fomento
          </h2>
          <div className="rd__painel">
            <ReguaDeCreditos />
          </div>
        </section>
      </div>
    </footer>
  );
}
