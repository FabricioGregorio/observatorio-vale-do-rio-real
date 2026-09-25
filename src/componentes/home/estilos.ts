/**
 * Estilos da Home.
 *
 * Tudo escopado em `.home-observatorio`. Nenhuma cor literal: só papéis de
 * `tokens.css` e misturas entre eles, que acompanham o tema. Movimento só em
 * hover/foco, com `--duracao-hover`, que o `tokens.css` zera sob
 * `prefers-reduced-motion`. Nenhuma animação de rolagem.
 *
 * ## Comentário aqui é peso de rede
 *
 * A folha viaja dentro do HTML de toda visita: comentário escrito **dentro**
 * do literal chega ao navegador. O porquê das regras fica neste bloco, que o
 * build descarta. Os comentários que sobraram lá dentro são os antigos; regra
 * nova documenta-se aqui.
 *
 * ## IV Lugares — por que as duas fichas mudaram
 *
 * O problema não era de cor, era de ancoragem. O corpo da ficha empilhava
 * tudo com um espaçamento uniforme, então cada elemento pousava onde o texto
 * acima o deixava: descrições de tamanhos diferentes produziam listas e
 * botões em alturas diferentes, e o par lia como duas peças desalinhadas em
 * vez de duas leituras da mesma coisa.
 *
 * Agora o corpo tem topo e pé. O topo é o texto — localidade, nome, descrição
 * e nota. O pé (`.hl-equip__pe`) reúne a lista de materiais e o CTA e desce
 * com `margin-top:auto`. Como a grade já estica as duas fichas à mesma
 * altura, os dois botões terminam na mesma linha por construção — sem altura
 * fixa e sem `min-height` chutado; o que varia é só a folga no meio.
 *
 * O espaçamento deixou de ser uniforme e virou hierarquia: a localidade cola
 * no nome, o nome respira antes da descrição, a nota se distingue por tom e
 * tamanho. O CTA fecha a ficha de ponta a ponta, com o rótulo em cima e os
 * metadados do arquivo embaixo. Lido como barra, e não como botão solto, ele
 * dá às duas fichas o mesmo acabamento — e as duas linhas fixas garantem a
 * mesma altura nos dois, mesmo com metadados de tamanhos diferentes. Para
 * ocupar a largura, ele troca `inline-flex` por `flex`: dentro de um
 * contêiner de bloco, `align-self` não tem a quem obedecer e o botão voltaria
 * à largura do texto.
 *
 * ## Notas das regras
 *
 * O que segue vivia dentro do literal e chegava ao navegador em toda
 * visita. Mudou de lado, não de conteúdo.
 *
 * ### III Território — a folha desta página
 *
 * O tratamento visual base é a folha cartográfica compartilhada, servida pelo
 * próprio mapa: CSS_DO_MAPA (as quatro camadas) e CSS_DO_TERRITORIO (a
 * o volume, a grade e a legenda). Aqui ficam só as regras do que a Home tem e
 * o laboratório não: o desenho sem moldura, o recorte como opção, os pins dos
 * lugares confirmados, o painel revelável e a ponte para /territorio.
 *
 * Nada aqui repinta a malha. O mapa é invariante de tema de propósito — a
 * camada cartográfica é lida sobre pedra nos dois temas, e trocar os valores
 * junto com os papéis semânticos desfaria a legibilidade das fronteiras.
 *
 * ### III Território — sem moldura ao redor do desenho
 *
 * São duas bordas, e as duas saem:
 *
 * 1. a do quadro, que a folha compartilhada desenha e faz o mapa parecer uma
 *    figura dentro de uma caixa;
 * 2. o contorno que o navegador dá ao próprio <svg>, que no Chrome é alvo de
 *    foco por clique. Ele nunca foi indicador de nada aqui — quem recebe foco
 *    de teclado são os dois grupos de recorte, que têm indicador próprio, e o
 *    <svg> não tem tabindex, então nem entra na ordem de Tab. O que aparecia
 *    era um retângulo preto em volta do mapa inteiro ao clicar em área vazia.
 *
 * ### III Território — o recorte é a opção, não o município
 *
 * O recorte é a opção, não o município: foco, hover e seleção pousam no grupo.
 * Os três estados se distinguem sem depender de cor — repouso fino e sólido,
 * foco tracejado em anil, seleção grossa em carvão.
 *
 * As duas primeiras regras desfazem o hover e o cursor que a folha
 * compartilhada dá a cada um dos 75 polígonos. No laboratório o município é
 * alvo; aqui não é, e prometer o contrário com o ponteiro — ou apagar a camada
 * pintando o polígono de mata-claro — seria dizer o que não é verdade.
 *
 * ### III Território — lugar visitado
 *
 * Lugar visitado: o ponto aparece sempre, o nome só com o recorte
 * selecionado. O irmão geral alcança o pin a partir do grupo escolhido —
 * nenhum estado precisa subir para um invólucro.
 *
 * ### III Território — o painel revelável
 *
 * O painel é servido com hidden; a folha compartilhada dá display:grid a ele,
 * o que venceria a regra do agente do usuário e o deixaria visível sem
 * JavaScript, prometendo uma interação que não existe.
 *
 * ### III Território — a ponte para /territorio
 *
 * Ponte para a cartografia completa. É link, não botão: leva a outra página,
 * existe sem JavaScript e não depende de seleção nenhuma.
 *
 * ### III Território — leitura em texto
 *
 * Leitura em texto: alternativa completa sem JavaScript e lista que a ilha
 * marca. Fechada por padrão — a Home é síntese, e a exploração é de
 * /territorio.
 *
 * ### IV Lugares — crédito de autoria
 *
 * Crédito de autoria: discreto, sobre a base da fotografia, nunca sobre a
 * área principal da imagem.
 */

export const CSS_DA_HOME = `
.home-observatorio{
  --hl-margem:clamp(1rem,4vw,3.5rem);
  --hl-capitulo:clamp(4rem,9vw,7.5rem);
  --hl-fio:color-mix(in srgb,var(--color-borda-forte) 45%,var(--color-fundo));
  --hero-texto:var(--color-texto);
  background:var(--color-fundo);
  color:var(--color-texto);
}
:where(.home-observatorio) :where(ul,ol){list-style:none;margin:0;padding:0}
.hl-quadro{max-width:var(--largura-conteudo);margin-inline:auto;padding-inline:var(--hl-margem)}

.hl-pendente{display:inline-block;margin-top:.5rem;padding:.2rem .45rem;border:1px dashed var(--color-acento);border-radius:var(--radius-ficha);color:var(--color-acento);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);line-height:1.4}


/* Botões */
.hl-acoes{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}

/* Síntese da pesquisa, entre Origem e Território. */
.hl-faixa-pesquisa{padding-block:var(--faixa-respiro);border-top:1px solid var(--hl-fio)}
.hl-faixa-pesquisa__lista{display:grid;margin-top:var(--faixa-espaco)}
.hl-faixa-pesquisa__lista li{display:grid;grid-template-columns:var(--faixa-coluna-numero) minmax(0,1fr);align-items:center;gap:var(--faixa-espaco);padding-block:var(--faixa-espaco)}
.hl-faixa-pesquisa__lista li+li{border-top:1px solid var(--hl-fio)}
.hl-faixa-pesquisa__lista strong{font-family:var(--font-display);font-size:var(--text-4xl);font-weight:var(--peso-numeral);line-height:1;color:var(--color-marca)}
.hl-faixa-pesquisa__lista span{font-size:var(--text-base);line-height:var(--leading-leitura)}
@media (min-width:768px){.hl-faixa-pesquisa__lista{grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--faixa-espaco)}.hl-faixa-pesquisa__lista li+li{border-top:0;border-left:1px solid var(--hl-fio);padding-left:var(--faixa-espaco)}}

/* Capítulos */
.hl-capitulo{padding-block:var(--hl-capitulo);border-top:1px solid var(--hl-fio)}
.hl-capitulo--rio,.hl-capitulo--serra{position:relative;overflow:clip}
.hl-capitulo--rio>.hl-quadro,.hl-capitulo--serra>.hl-quadro{position:relative;isolation:isolate}
.hl-grafismo{position:absolute;z-index:-1;display:block;color:var(--color-grafismo-territorial);pointer-events:none}
.hl-grafismo--rio{right:calc(var(--hl-margem) * -1);bottom:calc(var(--hl-capitulo) * -.72);width:min(64rem,88vw);height:clamp(6rem,14vw,10rem);opacity:var(--opacidade-grafismo-rio)}
.hl-grafismo--rio path{stroke-width:1.25}
.hl-grafismo--serra{right:50%;bottom:calc(var(--hl-capitulo) * -.82);width:100vw;height:clamp(7rem,15vw,11rem);opacity:var(--opacidade-grafismo-serra);transform:translateX(50%)}
.hl-grafismo--serra path:first-child{stroke-width:1.2}
.hl-grafismo--serra path:last-child{stroke-width:.65}
@media (max-width:767px){.hl-grafismo--rio{width:105vw;opacity:calc(var(--opacidade-grafismo-rio) * .8)}.hl-grafismo--serra{opacity:calc(var(--opacidade-grafismo-serra) * .8)}}
.hl-rotulo{display:flex;align-items:baseline;gap:.85rem;margin:0}
.hl-num{font-family:var(--font-display);font-weight:var(--peso-numeral);font-stretch:125%;color:var(--color-marca)}
.hl-antes{margin:1.25rem 0 0;max-width:40ch;font-size:var(--text-base);font-style:italic}
@media (min-width:768px){.hl-antes{font-size:var(--text-lg)}}
.hl-capitulo h2{margin-top:.85rem;max-width:20ch;font-size:clamp(var(--text-xl),3.6vw,var(--text-4xl))}
.hl-texto{max-width:var(--largura-leitura)}
.hl-texto p+p{margin-top:1rem}
.hl-intro{margin-top:1.5rem;font-size:var(--text-lg);line-height:1.5}
.hl-nota{margin-top:1.25rem;font-size:var(--text-sm);color:var(--color-texto-suave)}
.hl-ponte{display:flex;align-items:center;gap:1rem;margin-top:3rem;max-width:var(--largura-leitura);font-size:var(--text-lg);font-style:italic}
.hl-ponte::before{content:"";flex:0 0 3rem;height:1px;background:currentColor}


/* I Origem */
.hl-origem{display:grid;gap:2rem;margin-top:2rem;align-items:start}
.hl-origem .hl-texto{font-size:var(--text-lg);line-height:1.55}
.hl-cadeia{display:grid;margin-top:3.5rem}
.hl-elo{position:relative;padding:1.75rem 1.5rem 1.5rem 0;border-top:2px solid var(--color-texto)}
.hl-elo::before{content:"";position:absolute;top:-.45rem;left:0;width:.75rem;height:.75rem;border:2px solid var(--color-texto);border-radius:50%;background:var(--color-fundo)}
.hl-elo h3{margin-top:.5rem;font-size:var(--text-xl)}
.hl-elo p:last-child{margin-top:.6rem;color:var(--color-texto-suave)}
.hl-elo__nome{display:flex;align-items:center;gap:.85rem}
.hl-elo__nome h3{margin-top:0}
.hl-selo{flex:0 0 3.5rem;height:3.5rem;overflow:hidden;clip-path:circle(50% at 50% 50%)}
.hl-selo img{width:100%;height:100%;object-fit:cover}
@media (min-width:960px){
  .hl-cadeia{grid-template-columns:repeat(3,minmax(0,1fr))}
  .hl-elo+.hl-elo{padding-left:1.5rem}
  .hl-elo+.hl-elo::before{left:1.5rem}
}

/* III Território — cartografia editorial. */
.hl-capitulo--territorio .territorio-cartografico{margin-top:2rem;padding-block:0;border-top:0}
.hl-capitulo--territorio .territorio-cartografico__moldura{border:0;border-radius:0}
.hl-capitulo--territorio .territorio-cartografico__svg:focus{outline:none}

.hl-capitulo--territorio .territorio-cartografico .m{cursor:default}
.hl-capitulo--territorio .territorio-cartografico .m:hover{fill:var(--color-pedra)}
.hl-capitulo--territorio .territorio-cartografico .v:hover{fill:var(--color-milho)}
.territorio-cartografico__svg[data-interativo="true"] .territorio-cartografico__recorte .m{cursor:pointer}
.territorio-cartografico__svg[data-interativo="true"] .territorio-cartografico__recorte:hover .m{stroke:var(--color-carvao);stroke-width:2.4}
.territorio-cartografico__recorte:focus{outline:none}
.territorio-cartografico__recorte:focus-visible .m{stroke:var(--color-anil);stroke-width:3;stroke-dasharray:6 4}
.territorio-cartografico__recorte[aria-selected="true"] .m{stroke:var(--color-carvao);stroke-width:3.5}

.territorio-cartografico__lugar{pointer-events:none}
.territorio-cartografico__lugar:focus{outline:none}
.territorio-cartografico__svg[data-interativo="true"] .territorio-cartografico__lugar{pointer-events:auto;cursor:pointer}
.territorio-cartografico__lugar .forma{fill:var(--color-carvao);stroke:var(--color-branco);stroke-width:1.5;vector-effect:non-scaling-stroke}
.territorio-cartografico__lugar .miolo{fill:var(--color-branco)}
.territorio-cartografico__lugar .alvo{fill:transparent;stroke:none}
.territorio-cartografico__lugar text{fill:var(--color-carvao);font-family:var(--font-display);font-size:20px;font-weight:600;paint-order:stroke;stroke:var(--color-branco);stroke-width:5;opacity:0;transition:opacity var(--duracao-painel) var(--easing-padrao)}
.territorio-cartografico__recorte[data-recorte="vale"][aria-selected="true"]~.territorio-cartografico__lugar[data-lugar-do-recorte="vale"] text,.territorio-cartografico__recorte[data-recorte="comparacao"][aria-selected="true"]~.territorio-cartografico__lugar[data-lugar-do-recorte="comparacao"] text,.territorio-cartografico__lugar[aria-selected="true"] text{opacity:1}
.territorio-cartografico__lugar[aria-selected="true"] .forma,.territorio-cartografico__lugar:focus-visible .forma{stroke:var(--color-destaque);stroke-width:4}
.territorio-cartografico__lugar:focus-visible .forma{stroke-dasharray:4 3}
.territorio-cartografico__lugar[aria-selected="true"] .miolo{fill:var(--color-destaque);r:5}

.territorio-cartografico__painel[hidden],.territorio-cartografico__painel [data-painel-de][hidden],.territorio-cartografico__convite[hidden]{display:none}
.hl-capitulo--territorio .territorio-cartografico__painel{padding-top:0;border-top:0}
.hl-capitulo--territorio .territorio-cartografico__painel h3{font-size:clamp(var(--text-xl),2.4vw,var(--text-2xl))}
.territorio-cartografico__painel [data-painel-de]{display:grid;gap:.75rem}
.territorio-cartografico__painel-lista{font-size:var(--text-sm);color:var(--color-texto-suave)}
.territorio-cartografico__convite{margin:0;color:var(--color-texto-suave)}
.territorio-cartografico__ponte{margin:0}
.territorio-cartografico__pontos li{display:grid;gap:.1rem}
.territorio-cartografico__lugar-nome{font-family:var(--font-display);font-weight:600;color:var(--color-texto)}

.hl-capitulo--territorio .territorio-cartografico__indice{margin-top:2.5rem}
.hl-capitulo--territorio .territorio-cartografico__lista{grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));max-height:none;overflow:visible}
.hl-capitulo--territorio .territorio-cartografico__item dt{font-family:var(--font-display);font-weight:600}
.hl-capitulo--territorio .territorio-cartografico__item dd{margin:0}
.hl-capitulo--territorio .territorio-cartografico__item[data-selecionado="true"]{border-color:var(--color-marca);background:color-mix(in srgb,var(--color-fundo) 88%,var(--color-marca));color:var(--color-texto)}
.hl-capitulo--territorio .territorio-cartografico__item[data-selecionado="true"] .meta-ficha{color:var(--color-texto-suave)}

/* IV Lugares — o porquê destas regras está no comentário do componente. */
.hl-dupla{display:grid;gap:clamp(1.5rem,3vw,2.5rem);margin-top:3rem}
@media (min-width:960px){.hl-dupla{grid-template-columns:repeat(2,minmax(0,1fr))}}
.hl-equip{display:flex;flex-direction:column;background:var(--color-fundo-elevado);border:1px solid var(--color-borda);border-radius:var(--radius-ficha);overflow:hidden;transition:border-color var(--duracao-hover) var(--easing-padrao)}
.hl-equip:hover{border-color:color-mix(in srgb,var(--color-borda-forte) 70%,var(--color-fundo))}
.hl-equip:focus-within{border-color:var(--color-borda-forte)}
.hl-equip__imagem{position:relative;margin:0;aspect-ratio:4/3;overflow:hidden;background:color-mix(in srgb,var(--color-fundo) 90%,var(--color-texto))}
.hl-credito{position:absolute;right:0;bottom:0;padding:.15rem .4rem;background:color-mix(in srgb,var(--color-fundo) 82%,transparent);color:var(--color-texto-suave);font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono)}
.hl-equip__imagem img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 60%}
.hl-equip__corpo{display:flex;flex:1;flex-direction:column;padding:clamp(1.25rem,3vw,2rem)}
.hl-equip__corpo>.meta-ficha{margin:0}
.hl-equip h3{margin-top:.35rem;font-size:clamp(var(--text-xl),2.4vw,var(--text-2xl));line-height:1.2;text-wrap:balance}
.hl-equip__corpo>p:not(.meta-ficha):not(.hl-nota){margin:.85rem 0 0;max-width:46ch}
.hl-equip__corpo>.hl-nota{margin:.75rem 0 0}
.hl-equip__pe{margin-top:auto;padding-top:1.5rem}
.hl-reuniu{margin-top:0}
.hl-reuniu>.meta-ficha{margin:0 0 .35rem}
.hl-reuniu ul{border-top:1px solid var(--hl-fio)}
.hl-reuniu li{display:flex;justify-content:space-between;gap:1rem;padding:.55rem 0;border-bottom:1px solid var(--hl-fio);font-size:var(--text-sm)}
.hl-estado{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;white-space:nowrap;color:var(--color-texto-suave)}
.hl-estado[data-estado="publicado"]{color:var(--color-marca);font-weight:500}

/* V Leitura — faixa inversa */
.hl-leitura{background:var(--color-fundo-inverso);color:var(--color-texto-inverso);border-top:0}
.hl-leitura .meta-ficha,.hl-leitura .hl-num{color:color-mix(in srgb,var(--color-texto-inverso) 85%,var(--color-fundo-inverso))}
.home-observatorio .hl-leitura a{color:var(--color-texto-inverso)}
.hl-leitura :focus-visible{outline-color:var(--color-destaque)}
.hl-protagonista{display:grid;gap:2rem;margin-top:3rem;align-items:end}
@media (min-width:960px){.hl-protagonista{grid-template-columns:minmax(0,6fr) minmax(0,5fr)}}
.hl-numero{margin:0;font-family:var(--font-display);font-weight:var(--peso-numeral);font-stretch:125%;font-size:clamp(4.5rem,15vw,10.5rem);line-height:.9;letter-spacing:-.03em;color:var(--color-destaque)}
.hl-numero__rotulo{margin-top:.75rem;font-family:var(--font-display);font-size:var(--text-xl);font-weight:600}
.hl-protagonista__leitura h3{font-size:var(--text-lg)}
.hl-protagonista__leitura>p{margin-top:.6rem}
.hl-ficha{display:grid;gap:.45rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid color-mix(in srgb,var(--color-texto-inverso) 35%,var(--color-fundo-inverso));font-size:var(--text-sm)}
.hl-ficha>div{display:grid;grid-template-columns:5.5rem 1fr;gap:.75rem}
.hl-ficha dt{font-family:var(--font-mono);font-size:var(--text-xs);letter-spacing:var(--tracking-mono);text-transform:uppercase;padding-top:.15rem}
.hl-ficha dd{margin:0}
.hl-apoios{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));margin-top:3.5rem;border-top:2px solid var(--color-texto-inverso)}
.hl-apoio{padding:1.25rem 1.5rem 1.25rem 0;border-bottom:1px solid color-mix(in srgb,var(--color-texto-inverso) 35%,var(--color-fundo-inverso))}
.hl-apoio dt{font-size:var(--text-sm)}
.hl-apoio__valor{margin:.35rem 0 0;font-family:var(--font-display);font-weight:var(--peso-numeral);font-size:clamp(var(--text-xl),2.6vw,var(--text-2xl))}
.hl-apoio__regra{margin:.4rem 0 0;font-size:var(--text-xs);line-height:1.5}

/* VI Escuta */
.hl-escuta{display:grid;gap:3rem;margin-top:2rem;align-items:start}
@media (min-width:960px){.hl-escuta{grid-template-columns:minmax(0,5fr) minmax(0,6fr)}}
.hl-metodo{padding-left:1rem;border-left:2px solid var(--color-marca)}
.hl-entrevistas{border-top:2px solid var(--color-texto)}
.hl-entrevistas li{display:grid;grid-template-columns:2.5rem minmax(0,1fr);gap:.1rem 1rem;padding:.8rem 0;border-bottom:1px solid var(--hl-fio);align-items:baseline}
.hl-entrevistas li .meta-ficha{grid-column:2}
.hl-entrevistas__n{font-family:var(--font-mono);color:var(--color-marca)}
.hl-entrevistas__onde{font-family:var(--font-display);font-weight:600}
@media (min-width:600px){
  .hl-entrevistas li{grid-template-columns:2.5rem minmax(0,1fr) auto}
  .hl-entrevistas li .meta-ficha{grid-column:auto;text-align:right}
}
/* Também em campo: Serra dos Macacos e Ilha Grande com a mesma forma —
   texto e três fotografias. No celular as três seguem lado a lado, em
   miniatura, para o bloco não virar uma coluna de imagens. */
.hl-ilha{display:grid;gap:1.25rem;margin-top:4.5rem;padding-top:2rem;border-top:1px solid var(--hl-fio);align-items:start}
.hl-ilha + .hl-ilha{margin-top:3rem}
@media (min-width:960px){.hl-ilha{grid-template-columns:minmax(0,3fr) minmax(0,8fr);gap:2rem}}
.hl-ilha h3{font-size:var(--text-lg);text-wrap:balance}
.hl-ilha__texto p{margin-top:.5rem;font-size:var(--text-sm);color:var(--color-texto-suave);max-width:34rem}
.hl-ilha__fotos{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}
@media (min-width:600px){.hl-ilha__fotos{gap:.75rem}}
.hl-ilha__fotos figure{margin:0}
.hl-ilha__fotos img{display:block;width:100%;height:auto;aspect-ratio:3/4;object-fit:cover;border-radius:var(--radius-ficha)}
.hl-ilha__fotos figcaption{display:flex;flex-direction:column;gap:.1rem;margin-top:.4rem;font-size:var(--text-xs);line-height:1.35;overflow-wrap:break-word}

/* VII Produtos */
.hl-catalogo{display:grid;grid-template-columns:repeat(auto-fit,minmax(16rem,1fr));margin-top:3rem;border-top:2px solid var(--color-texto)}
.hl-catalogo li{display:flex;flex-direction:column;align-items:flex-start;gap:.45rem;padding:1.25rem 1.5rem 1.25rem 0;border-bottom:1px solid var(--hl-fio)}
.hl-catalogo h3{font-size:var(--text-lg)}
.hl-catalogo p{font-size:var(--text-sm);color:var(--color-texto-suave)}
.hl-secoes{display:flex;flex-wrap:wrap;align-items:baseline;gap:.5rem 1.5rem;margin-top:2rem}
.hl-secoes ul{display:flex;flex-wrap:wrap;gap:.5rem 1.25rem}

/* VIII Conferência */
.hl-conferencia{margin-top:2rem}
.hl-conferencia .hl-texto{font-size:var(--text-lg)}

/* Rodapé */
`.trim();
