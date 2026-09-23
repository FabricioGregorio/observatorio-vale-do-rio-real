import type { ComponentProps } from "react";
import { LinkDeDestino } from "../layout/LinkDeDestino";

export type VarianteAcao =
  | "primary"
  | "secondary"
  | "text"
  | "document"
  | "utility";

export function ActionLink({
  variant = "text",
  className = "",
  ...props
}: ComponentProps<typeof LinkDeDestino> & { variant?: VarianteAcao }) {
  return (
    <LinkDeDestino
      {...props}
      data-acao={variant}
      className={`acao ${className}`}
    />
  );
}
