import { Fragment } from "react";

import {
  ASSINATURA_PADRAO,
  CAMINHO_DAS_MARCAS_INSTITUCIONAIS,
  REGUA_DE_CREDITOS,
} from "./creditos";

/**
 * A régua de marcas institucionais.
 *
 * ## Por que as marcas ficam sobre branco
 *
 * O rodapé é escuro, e nenhum dos três manuais autoriza fabricar versão
 * branca de marca por filtro. Parte dos ativos existe em versão de
 * fonte branca; **a do Governo de Sergipe não existe** — o corpus só traz o
 * brasão azul. Aplicar as marcas em variantes diferentes de cor seria compor
 * uma assinatura que manual nenhum descreve.
 *
 * O manual do Governo Federal resolve isso com a **aplicação em box branco**,
 * e o manual do Governo de Sergipe adota a mesma lógica de caixa quando o
 * fundo compromete a legibilidade. Então a régua vive num painel claro dentro
 * do rodapé escuro, e cada marca entra na sua versão completa e original em
 * cores sólidas — que é, para peça não impressa, a versão que o manual federal
 * determina.
 *
 * O painel dá folga bem acima da caixa de proteção exigida: a distância mínima
 * é a espessura do "I" de BRASIL, e o respiro aqui é várias vezes ela.
 *
 * ## Ordem
 *
 * Lista ordenada, porque a ordem é normativa e não composição: ascendente em
 * importância da esquerda para a direita, com a assinatura Ministério da
 * Cultura/Governo Federal fechando o bloco à direita. Quem ouve precisa
 * receber "2 de 2 — Realização", e não dois blocos soltos.
 *
 * ## Texto alternativo
 *
 * A régua gráfica não repete os nomes escritos dentro dos logotipos. Cada
 * imagem recebe, por isso, o nome institucional no `alt`; a frase obrigatória
 * permanece visível abaixo do conjunto. Assim a simplificação visual não
 * remove informação de quem usa leitor de tela.
 *
 * Sem `"use client"`, sem estado, sem biblioteca. As marcas carregam com
 * `loading="lazy"`: a régua fica no fim de toda página, muito abaixo da
 * primeira dobra.
 */
export function ReguaDeCreditos() {
  /*
    Não há variante de tema. A régua vive sempre dentro de um painel branco,
    e por isso a sua tinta é fixa nos dois temas — quem muda é o que está em
    volta dela, não ela.

    Havia um `destaque`, que abria o espaçamento para a escala maior em que a
    Prestação de Contas servia a mesma régua. Aquela página saiu em
    2026-09-23 e o único consumidor do prop foi com ela; um parâmetro que
    ninguém passa é uma variante que ninguém vê.
  */
  return (
    <div className="regua">
      <ol className="regua__niveis">
        {REGUA_DE_CREDITOS.map((nivel) => (
          <li className="regua__nivel" key={nivel.id}>
            <p className="meta-ficha regua__papel">{nivel.papel}</p>
            {nivel.marcas.length === 0 ? null : (
              <div className="regua__marcas">
                {nivel.marcas.map((marca, indice) => (
                  <Fragment key={marca.id}>
                    {/*
                      O traço do manual da PNAB, entre a marca da política e a
                      assinatura conjunta federal. `aria-hidden` porque é regra
                      de composição gráfica: o que importa para quem ouve é a
                      ordem, e ela já está na lista.
                    */}
                    {nivel.tracoAntesDaMarca === marca.id && indice > 0 ? (
                      <span aria-hidden="true" className="regua__traco" />
                    ) : null}
                    <img
                      alt={marca.entidade}
                      className="regua__marca"
                      decoding="async"
                      height={marca.altura}
                      loading="lazy"
                      src={`${CAMINHO_DAS_MARCAS_INSTITUCIONAIS}/${marca.arquivo}`}
                      width={marca.largura}
                    />
                  </Fragment>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="regua__assinatura">{ASSINATURA_PADRAO}</p>
    </div>
  );
}
