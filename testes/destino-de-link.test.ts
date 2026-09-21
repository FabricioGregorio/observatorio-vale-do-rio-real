/**
 * Política de nova guia — a regra, sem renderizar.
 *
 * A função é pela função do link, não pelo domínio: arquivo do próprio site
 * abre em nova guia, ficha do Acervo não. A varredura das páginas renderizadas
 * está em `testes/a11y/nova-guia.spec.ts` e aplica esta mesma função.
 */
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { classificarDestino } from "../src/lib/destino-de-link";

describe("classificação de destino", () => {
  test.each([
    "/",
    "/pesquisa",
    "/territorio",
    "/dados",
    "/acervo",
    "/acervo#acervo-fotografias-visitas-i-vii",
    "/acervo/fotografias-visitas-i-vii",
    // A ficha do arquivo é página HTML; o arquivo é o link dentro dela.
    "/acervo/entrevista-josenilson-bispo/arquivo/b66b98a6-fdec-481b-9d9f-fd323a751364",
    "/podobservar/t1/01-o-que-e-o-vale-do-rio-real",
    "/prestacao-de-contas/imprimir",
    "#conteudo",
    "mailto:contato@example.org",
    "https://observatoriotobiassoueu.com.br/pesquisa",
  ])("%s fica na mesma guia", (href) => {
    expect(classificarDestino(href)).toBe("interno");
  });

  test.each([
    "/anexos.json",
    "/arquivos/relatorio.pdf",
    "/media/pesquisa/ilha-grande-pequena-igreja.webp",
    "https://observatoriotobiassoueu.com.br/anexos.json",
    "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a02-relatorio-tecnico-recanto-da-serra-publico-v1.pdf",
    "https://acervo.observatoriotobiassoueu.com.br/arquivos/analise-de-dados/a11-planilha-indicadores-v1.xlsx",
    "https://acervo.observatoriotobiassoueu.com.br/arquivos/comprovacao-de-campo/b02-entrevista-v1.mp3",
    "https://acervo.observatoriotobiassoueu.com.br/pacotes/anexos.zip?v=2",
  ])("%s é documento", (href) => {
    expect(classificarDestino(href)).toBe("documento");
  });

  test.each([
    "https://open.spotify.com/episode/4I2y3ku1E62PjxtDNWo8Uf",
    "https://www.youtube.com/watch?v=CcNdxMkuFcI",
    "https://www.openstreetmap.org/directions?route=%3B-11.0%2C-38.0",
    "https://www.google.com/maps/dir/?api=1&destination=-11.0%2C-38.0",
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados/SE/municipios",
  ])("%s é externo", (href) => {
    expect(classificarDestino(href)).toBe("externo");
  });
});

/**
 * Link com `href` vindo de dado passa pela política. Um `<a href={…}>` escrito
 * à mão com endereço de arquivo foi exatamente o defeito em `/dados`: o
 * documento abria por cima da página.
 */
describe("links gerados por dado usam a abstração", () => {
  test.each([
    ["src/app/dados/page.tsx", "anexo.linkPermanente"],
    ["src/app/pesquisa/page.tsx", "item.href"],
    ["src/componentes/home/Secoes.tsx", "item.href"],
    ["src/componentes/home/Secoes.tsx", "RELATORIO_DO_RECANTO.url"],
    ["src/componentes/acervo/TabelaAnexos.tsx", "anexo.linkPermanente"],
    ["src/componentes/acervo/TabelaAnexos.tsx", "anexo.linkOrigem"],
    [
      "src/componentes/acervo/ListaMateriaisPublicos.tsx",
      "anexo.linkPermanente",
    ],
    ["src/componentes/territorio/cartografia/PranchaDoLugar.tsx", "m.href"],
  ])("%s não escreve <a> cru para %s", (arquivo, expressao) => {
    const fonte = readFileSync(arquivo, "utf8");
    const cru = new RegExp(
      `<a\\b[^>]*href=\\{${expressao.replace(".", "\\.")}\\}`,
      "s",
    );
    expect(fonte).not.toMatch(cru);
  });
});
