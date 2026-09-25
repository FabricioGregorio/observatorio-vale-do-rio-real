import type { ComponentProps } from "react";
import { classificarDestino } from "../../lib/destino-de-link";
import { LinkDeDestino, type SinalDePercurso } from "../layout/LinkDeDestino";

export type VarianteAcao =
  | "primary"
  | "secondary"
  | "text"
  | "document"
  | "utility";

/**
 * O que o clique entrega, quando não é uma página: `download` para o binário
 * (a rota `/baixar/…` ou o pacote servido com `?baixar=1`), `external` para o
 * que abre fora do site. É modificador de família, não família: muda o ícone
 * do DOCUMENT e o sinal no fim do rótulo, nunca a forma do botão.
 */
function modificadorDe(
  href: string,
  download: unknown,
): "download" | "external" | undefined {
  if (
    (download !== undefined && download !== false) ||
    href.startsWith("/baixar/") ||
    /[?&]baixar=1(?:&|$)/.test(href)
  )
    return "download";
  return classificarDestino(href) === "interno" ? undefined : "external";
}

/**
 * O sinal de percurso sai do destino, e não de quem escreve o rótulo: âncora
 * desce, rota segue, `voltar` volta. DOCUMENT não segue — o ícone de arquivo
 * já diz o que vem —, e UTILITY não tem percurso.
 */
function sinalDe(
  variant: VarianteAcao,
  href: string,
  voltar: boolean,
): SinalDePercurso | undefined {
  if (voltar) return "voltar";
  if (variant === "document" || variant === "utility") return undefined;
  return href.startsWith("#") ? "descer" : "seguir";
}

export function ActionLink({
  variant = "text",
  className = "",
  voltar = false,
  ...props
}: Omit<ComponentProps<typeof LinkDeDestino>, "sinal"> & {
  variant?: VarianteAcao;
  voltar?: boolean;
}) {
  return (
    <LinkDeDestino
      {...props}
      data-acao={variant}
      data-modificador={modificadorDe(props.href, props.download)}
      sinal={sinalDe(variant, props.href, voltar)}
      className={`acao ${className}`.trim()}
    />
  );
}
