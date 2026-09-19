import {
  ALT_DO_HERO,
  CAMINHO_PUBLICO,
  DERIVADOS_DO_HERO,
  LARGURA_DA_COMPOSICAO_HORIZONTAL,
} from "../../dados/hero/derivados";

/**
 * Fotografia do Hero, com art direction por breakpoint — Fase H1.
 *
 * Server Component. Não busca nada: os derivados e o texto alternativo vêm de
 * `src/dados/hero/derivados.ts`, que também registra a procedência.
 *
 * ## Por que `<picture>` e não `next/image`
 *
 * O que este Hero precisa é **art direction**: composição horizontal no
 * desktop, composição vertical no mobile — dois recortes diferentes da mesma
 * fotografia, não a mesma imagem em dois tamanhos. `next/image` faz troca por
 * densidade e largura; quem faz troca por *composição* é `<picture>` com
 * `media`, que é o elemento que o HTML tem para isso.
 *
 * Há um segundo motivo, e ele é prático: os derivados já saem otimizados de
 * `pnpm derivar-hero`, que codifica o AVIF a partir do original e calibra o
 * peso junto do orçamento da Home. Não há o que o otimizador do Next faça em
 * tempo de requisição além de recodificar o que já está no ponto. A própria
 * documentação do Next indica `unoptimized` para esse caso; usar `<picture>`
 * diretamente é o mesmo resultado com menos indireção.
 *
 * `CreditosInstitucionais` já abre precedente para `<img>` no projeto, pelo
 * mesmo tipo de razão.
 *
 * ## LCP
 *
 * Esta fotografia é o maior elemento da primeira dobra, então é o LCP. Por
 * isso `fetchPriority="high"` e **ausência** de `loading="lazy"` — que é
 * exceção consciente à regra geral do doc 01 §7, e é a exceção correta: adiar
 * o LCP é adiar a página.
 *
 * `width` e `height` estão declarados para reservar a caixa e impedir
 * deslocamento de layout enquanto a imagem chega.
 */

const DESKTOP = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("desktop"),
) as (typeof DERIVADOS_DO_HERO)[number];

const MOBILE = DERIVADOS_DO_HERO.find((d) =>
  d.arquivo.includes("mobile"),
) as (typeof DERIVADOS_DO_HERO)[number];

export function FotografiaHero() {
  return (
    <picture>
      <source
        media={`(min-width: ${LARGURA_DA_COMPOSICAO_HORIZONTAL}px)`}
        srcSet={`${CAMINHO_PUBLICO}/${DESKTOP.arquivo}`}
        width={DESKTOP.largura}
        height={DESKTOP.altura}
      />
      <img
        src={`${CAMINHO_PUBLICO}/${MOBILE.arquivo}`}
        alt={ALT_DO_HERO}
        width={MOBILE.largura}
        height={MOBILE.altura}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </picture>
  );
}
