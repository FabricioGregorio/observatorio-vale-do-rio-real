import type { NextConfig } from "next";

import {
  ambienteIndexavel,
  CABECALHO_ROBOTS,
  DIRETIVA_NOINDEX,
} from "./src/lib/indexacao";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    /**
     * AVIF primeiro, WebP como reserva.
     *
     * O padrão do Next é só `image/webp`. A negociação é por `Accept`: quem
     * não anuncia AVIF continua recebendo o WebP de sempre, byte por byte —
     * não é troca de formato, é um formato a mais na frente da fila.
     *
     * Medido na capa do episódio, o único `next/image` da carga inicial da
     * Home, em 384 px e qualidade 75: **21.110 B em WebP contra 11.555 B em
     * AVIF**. O mesmo pedido, com `Accept` sem AVIF, continua devolvendo os
     * 21.110 B de antes.
     */
    formats: ["image/avif", "image/webp"],
    /**
     * Qualidades que o otimizador aceita. O Next 16 só serve as declaradas
     * aqui; qualquer outra responde 400, e é por isso que a lista existe.
     *
     * 75 é o padrão e continua valendo para todo o resto. 65 é para a capa do
     * episódio — arte chapada, decorativa (`alt=""`), abaixo da dobra e
     * exibida a 350 px. Medido em AVIF 384 px: 11.555 B a 75, 8.639 B a 65.
     */
    qualities: [65, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "acervo.observatoriotobiassoueu.com.br",
        port: "",
        pathname: "/arquivos/podobservar-artes/**",
        search: "",
      },
    ],
  },

  /**
   * `X-Robots-Tag: noindex` em todo ambiente que não seja o deployment de
   * produção da Vercel.
   *
   * O cabeçalho é a única proteção que acompanha o domínio customizado da
   * homologação: o `noindex` que a Vercel injeta sozinha vale para o host
   * `*.vercel.app`, e não para um domínio próprio apontado ao mesmo
   * deployment. Aqui a diretiva vem do framework e viaja com o build.
   *
   * `/:caminho*` é o padrão documentado do Next.js para "toda rota", e inclui
   * a raiz. A decisão é lida no build (ver `src/lib/indexacao.ts`); produção
   * não recebe cabeçalho algum e seu SEO fica exatamente como está.
   */
  async headers() {
    if (ambienteIndexavel()) return [];

    return [
      {
        source: "/:caminho*",
        headers: [{ key: CABECALHO_ROBOTS, value: DIRETIVA_NOINDEX }],
      },
    ];
  },
};

export default nextConfig;
