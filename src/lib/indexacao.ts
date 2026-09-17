/**
 * Autorização de indexação por mecanismos de busca.
 *
 * Só o deployment de produção da Vercel é indexável. Homologação, preview e
 * qualquer outro ambiente respondem `X-Robots-Tag` com `noindex` e um
 * `robots.txt` que proíbe tudo — porque a homologação existe para a equipe
 * revisar o estado de um commit, não para concorrer com o domínio canônico no
 * índice do Google.
 *
 * **Fail-closed**, como os demais gates do projeto (ADR-015, doc 03 §6): a
 * indexação exige declaração explícita, `VERCEL_ENV=production`. O desenho
 * inverso — marcar `noindex` quando `VERCEL_ENV=preview` — erraria para o lado
 * da exposição: bastaria a variável faltar para a homologação entrar no índice
 * sob um domínio que não é o canônico. Errar para o outro lado apenas esconde
 * um ambiente que já não deveria estar visível, e isso um teste de cabeçalho
 * detecta na hora.
 *
 * `VERCEL_ENV` é variável de sistema injetada pela plataforma em todo
 * deployment; ninguém a configura à mão, e por isso ela é uma declaração
 * confiável. O valor é lido no build: não há decisão em tempo de requisição.
 */

/**
 * Diretiva devolvida em ambiente não público.
 *
 * `noindex` é o que a tarefa exige e vem primeiro, inequívoco. `nofollow`
 * acompanha para que um rastreador que chegue à homologação por um link
 * qualquer não use as URLs dela como fonte de descoberta.
 */
export const DIRETIVA_NOINDEX = "noindex, nofollow";

/** Nome do cabeçalho de resposta que carrega a diretiva. */
export const CABECALHO_ROBOTS = "X-Robots-Tag";

/** Verdadeiro somente no deployment de produção da Vercel. */
export function ambienteIndexavel(
  vercelEnv: string | undefined = process.env.VERCEL_ENV,
): boolean {
  return vercelEnv?.trim() === "production";
}

/** Forma do `robots.txt`, estruturalmente compatível com `MetadataRoute.Robots`. */
export type RegrasDeRobots = {
  rules: { userAgent: string; allow?: string; disallow: string };
  sitemap?: string;
  host?: string;
};

/**
 * Regras do `robots.txt` para uma origem.
 *
 * Em ambiente não indexável o arquivo proíbe tudo e **não** anuncia sitemap
 * nem host: a homologação não aponta rastreador para o domínio canônico, e
 * também não se declara como ele.
 */
export function regrasDeRobots(
  origem: URL,
  indexavel: boolean,
): RegrasDeRobots {
  if (!indexavel) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/dev/" },
    sitemap: new URL("/sitemap.xml", origem).href,
    host: new URL(origem).origin,
  };
}
