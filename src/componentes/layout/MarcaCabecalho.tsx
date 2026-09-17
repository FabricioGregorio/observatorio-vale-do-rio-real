"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** O estado da marca acompanha a rota sem tornar o cabeçalho inteiro cliente. */
export function MarcaCabecalho({
  imagem,
  largura,
  altura,
}: {
  readonly imagem: string;
  readonly largura: number;
  readonly altura: number;
}) {
  const pathname = usePathname();

  return (
    <Link
      aria-current={pathname === "/" ? "page" : undefined}
      className="hl-topo__marca"
      href="/"
      prefetch={false}
    >
      <img alt="" height={altura} src={imagem} width={largura} />
      <span>Observatório do Vale do Rio Real</span>
    </Link>
  );
}
