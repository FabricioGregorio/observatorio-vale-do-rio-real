import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { lerVarianteDaAbertura } from "../../../componentes/prototipo/homelivre/abertura";
import { HomeLivre } from "../../../componentes/prototipo/homelivre/HomeLivre";
import { listarArquivosPorDocumento } from "../../../dados/consultas/anexos";

/**
 * Experimento controlado — Home livre. **Rota de desenvolvimento.**
 *
 * Testa uma arquitetura editorial global diferente da Home pública H0–H4.1,
 * por decisão humana de 2026-09-13. Não substitui a Home, não altera nenhum
 * componente público e não autoriza publicação: em produção o render é
 * interrompido pelo 404 nativo, pelo mesmo mecanismo das demais rotas `/dev/*`.
 *
 * Todo o experimento vive em `src/componentes/prototipo/homelivre/`, nesta
 * rota e em `testes/rota-home-livre.test.ts`. Remover os três desfaz tudo.
 */

export const metadata: Metadata = {
  title: "Experimento — Home livre",
  robots: { index: false, follow: false },
};

/** Em produção, interrompe o render com o 404 nativo. */
export function exigirDesenvolvimentoDaHomeLivre(
  ambiente: string | undefined,
  interromper: () => never = notFound,
): void {
  if (ambiente === "production") interromper();
}

export default async function ExperimentoHomeLivre({
  searchParams,
}: {
  searchParams: Promise<{ [chave: string]: string | string[] | undefined }>;
}) {
  exigirDesenvolvimentoDaHomeLivre(process.env.NODE_ENV);
  const { hero } = await searchParams;

  return (
    <HomeLivre
      abertura={lerVarianteDaAbertura(hero)}
      publicados={await listarArquivosPorDocumento()}
    />
  );
}
