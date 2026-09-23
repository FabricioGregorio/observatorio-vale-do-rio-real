import type { ComponentPropsWithRef } from "react";
import type { VarianteAcao } from "./ActionLink";

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ComponentPropsWithRef<"button"> & { variant?: VarianteAcao }) {
  return (
    <button
      {...props}
      type={type}
      data-acao={variant}
      className={`acao ${className}`}
    />
  );
}
