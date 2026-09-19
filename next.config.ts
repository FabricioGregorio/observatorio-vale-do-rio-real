import type { NextConfig } from "next";

import {
  ambienteIndexavel,
  CABECALHO_ROBOTS,
  DIRETIVA_NOINDEX,
} from "./src/lib/indexacao";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "acervo.observatoriotobiassoueu.com.br",
        port: "",
        pathname: "/arquivos/podobservar/artes/**",
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
