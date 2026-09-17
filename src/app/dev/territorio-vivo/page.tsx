import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TerritorioVivo } from "../../../componentes/territorio/cartografia/TerritorioVivo";
import { listarArquivosPorDocumento } from "../../../dados/consultas/anexos";

/**
 * Laboratório — Cartografia Viva como experiência territorial. **Rota DEV.**
 *
 * Candidata à futura rota pública `/territorio`, que ainda não existe e não é
 * autorizada. Em produção o render é interrompido pelo 404 nativo, pelo mesmo
 * mecanismo das demais rotas `/dev/*`.
 */

export const metadata: Metadata = {
  title: "Laboratório — Cartografia Viva",
  robots: { index: false, follow: false },
};

/** Em produção, interrompe o render com o 404 nativo. */
export function exigirDesenvolvimentoDoTerritorioVivo(
  ambiente: string | undefined,
  interromper: () => never = notFound,
): void {
  if (ambiente === "production") interromper();
}

export default async function LaboratorioTerritorioVivo() {
  exigirDesenvolvimentoDoTerritorioVivo(process.env.NODE_ENV);

  return (
    <TerritorioVivo
      baseDasCamadas="/dev/territorio-vivo/camada-local"
      publicados={await listarArquivosPorDocumento()}
    />
  );
}
