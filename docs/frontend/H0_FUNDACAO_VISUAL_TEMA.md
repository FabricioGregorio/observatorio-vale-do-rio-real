# H0 — FUNDAÇÃO VISUAL E TEMA
## Observatório de Cultura e Economia Criativa da Região do Vale do Rio Real

**Versão:** 1.0
**Data:** 09/09/2026
**Status:** IMPLEMENTADA
**Fase:** primeira da implementação de frontend, conforme
[`PLANO_HOME_PILOTO_1_0.md`](./PLANO_HOME_PILOTO_1_0.md) §29

**Fonte de verdade visual:** [`DIRECAO_VISUAL_FRONTEND_1_0.md`](./DIRECAO_VISUAL_FRONTEND_1_0.md),
não alterada nesta rodada.

---

# 1. O que a H0 é, e o que ela não é

A H0 constrói a **fundação**: tokens, temas e bases de acessibilidade visual. Ela
prepara o terreno para o Hero, o cabeçalho e as seções da Home — e não constrói
nenhum deles.

**Implementado:**

- assinatura institucional do Observatório como token medido;
- papéis semânticos completos, em claro e escuro;
- tema claro, escuro e sistema, com escolha manual persistível;
- ausência de flash na primeira pintura;
- fundação de movimento com `prefers-reduced-motion`;
- sistema de foco visível nos dois temas;
- papéis tipográficos organizados;
- camadas (`z-index`) declaradas;
- 97 testes novos.

**Deliberadamente fora:** Hero, `home.jpg`, MapLibre, mapa inclinado, drawer,
gráficos, Pessoas, PodObservar, Acervo novo, animações, narração, menu novo, rotas
novas.

**A Home não sofreu redesign.** No tema claro ela está como estava. O que mudou é que
agora ela também existe no escuro.

---

# 2. Baseline e gates

| | Antes | Depois |
|---|---|---|
| Commit | `b82e3f4` | esta entrega |
| `pnpm tipos` | limpo | limpo |
| `pnpm lint` | 4 warnings | **4 warnings** |
| `pnpm teste` | 256 passaram, 3 pulados | **337 passaram, 3 pulados** |
| `pnpm a11y` | 54 passaram | **99 passaram** |
| `pnpm build` | 19 rotas estáticas | 19 rotas estáticas |
| Client Components | 2 | **2** |
| Dependências | — | **nenhuma nova** |

Os 4 warnings de CSS são os mesmos de antes: `!important` no bloco de
`prefers-reduced-motion`. São legítimos — a regra precisa vencer a cascata — e a
quantidade **não aumentou**. Um teste agora trava esse número em 4.

---

# 3. Auditoria dos tokens anteriores

O `tokens.css` de antes cobria cor, tipografia e dois valores de layout. A matriz do
que foi encontrado:

| Eixo | Estado anterior | Veredito |
|---|---|---|
| **cores brutas** | 9 tokens: mata, anil, pedra, milho, barro, carvão, mata-claro, pedra-fundo, pedra-borda | **MANTER** — nenhum removido, nenhum alterado |
| **papéis semânticos** | 12 papéis, todos com valor único de tema claro | **AJUSTAR** — passam a ter equivalente noturno |
| **famílias** | Archivo, Literata, IBM Plex Mono | **MANTER** — nenhuma fonte nova |
| **escala de texto** | 9 degraus, razão 1.25 | **MANTER** |
| **tracking / leading** | 3 tokens | **AJUSTAR** — faltava `leading` de título |
| **pesos** | escritos à mão em `@layer base` | **NOVO** — viraram token |
| **radii** | `--radius-ficha: 2px` | **MANTER** — suficiente; ficha de arquivo não tem canto macio |
| **borders** | espessura escrita à mão | **MANTER** — 1px em toda parte, não justifica token |
| **shadows** | ausente, por decisão | **MANTER AUSENTE** — sombra colorida é proibida; elevação se resolve com borda |
| **focus** | um token, uma cor | **AJUSTAR** — precisa trocar de cor por tema |
| **motion** | nenhum token | **NOVO** |
| **z-index** | `z-index: 100` escrito à mão em `.pular-conteudo` | **NOVO** |
| **spacing** | nenhum token | **NÃO NECESSÁRIO** — ver abaixo |
| **breakpoints** | padrão do Tailwind | **NÃO NECESSÁRIO** — ver abaixo |

## 3.1 Dois eixos que deliberadamente não ganharam token

**Spacing.** O projeto usa a escala de espaçamento do Tailwind (`gap-4`, `px-4`,
`py-12`) de forma consistente. Criar uma escala paralela em `tokens.css` daria dois
sistemas de espaçamento concorrentes, e a instrução da H0 é explícita: não criar
sistema paralelo. Se uma seção futura precisar de um ritmo vertical próprio, entra
**um** token com nome semântico — não uma escala inteira antecipada.

**Breakpoints.** Mesma razão. Os três breakpoints do projeto — 375, 768, 1440 — vivem
hoje na matriz de teste, que é onde eles têm efeito verificável.

Não criar estes tokens é resultado da auditoria, não omissão.

## 3.2 O achado que tornou a H0 barata

**A estilização do projeto passa quase inteiramente por `style` inline com
`var(--color-*)`** — 22 usos de `--color-borda`, 13 de `--color-link`, e assim por
diante. Praticamente não há classe utilitária de cor do Tailwind no código.

Isso costuma ser considerado um defeito. Aqui foi o que permitiu que o modo escuro
inteiro fosse implementado **sem tocar em um único componente**: `var()` resolve em
tempo de execução, então redefinir o papel numa camada mais específica da cascata muda
o que já está escrito.

---

# 4. Assinatura institucional — `#026A69`

## 4.1 Evidência

A Direção Visual §5.1 exige que o hexadecimal saia do arquivo oficial e proíbe "olhar
e estimar". Três fontes independentes, todas medidas:

| Fonte | Método | Resultado |
|---|---|---|
| `identidade-visual/observatorio/icon.png` | frequência de pixel | `#026A69` em **87,59%** |
| `identidade-visual/observatorio/logo-e-texto.png` | frequência de pixel | `#026A69` em **68,07%** |
| `primeiro-post-observatorio.pdf` (D01-08) | operadores de cor do PDF | `#026A69` presente |

A terceira confirmação é a mais forte: não é amostragem de imagem comprimida, é o
valor que o arquivo de design declara ao pintar o vetor.

## 4.2 O token, e o que ele não é

```css
--color-observatorio: #026a69;              /* paleta bruta */
--color-marca: var(--color-observatorio);   /* papel semântico */
```

Segue a convenção que o projeto já usava — bruto → papel, como `--color-milho` →
`--color-destaque`.

**`mata` não foi substituída.** Os dois papéis são distintos e permanecem separados:

| Token | Papel |
|---|---|
| `--color-mata` `#12301F` | **atmosfera territorial** — a temperatura dominante do projeto |
| `--color-observatorio` `#026A69` | **assinatura institucional** — a marca |

Um teste garante que os dois continuam existindo e diferentes.

## 4.3 Restrição que acompanha o token

| Par | Contraste | Veredito |
|---|---|---|
| sobre pedra-fundo | **5,68:1** | ✓ texto |
| sobre branco | **6,43:1** | ✓ texto |
| branco sobre ele | **6,43:1** | ✓ texto |
| **sobre mata** | **2,23:1** | ✗ **proibido** |

Sobre superfície escura, usa-se `--color-observatorio-claro` (`#2A9D96`, 5,57:1).

---

# 5. Paleta clara

Todos os papéis pedidos, mapeados para a nomenclatura em pt-BR que o projeto já usa:

| Papel pedido | Token do projeto | Valor | Origem |
|---|---|---|---|
| background | `--color-fundo` | pedra-fundo | existente |
| surface | `--color-fundo` | pedra-fundo | existente |
| surface-elevated | `--color-fundo-elevado` | branco | existente |
| foreground | `--color-texto` | carvão | existente |
| foreground-muted | `--color-texto-suave` | carvão-suave | existente |
| border | `--color-borda` | pedra-borda | existente |
| border-strong | `--color-borda-forte` | `#767B74` | **novo** |
| interactive | `--color-link` | anil | existente |
| interactive-hover | `--color-link-hover` | `#162943` | **novo** |
| focus | `--color-foco` | anil | existente |
| observatorio | `--color-marca` | `#026A69` | **novo** |
| mata | `--color-mata` | `#12301F` | existente |
| milho | `--color-milho` | `#E8B23A` | existente |
| barro | `--color-barro` | `#8A4B2A` | existente |
| anil | `--color-anil` | `#1F3A5F` | existente |

**`surface` e `background` apontam para o mesmo token de propósito.** O projeto tem
dois níveis de superfície — página e ficha —, não três. Inventar um nível intermediário
sem componente que o use seria criar sistema paralelo.

A predominância continua clara: pedra/off-white. **O site não virou teal** — a
assinatura é acento institucional, não fundo.

---

# 6. Paleta escura

## 6.1 Princípio

Não é inversão. O fundo escuro é **mata muito escura** (`#0E1611`), não preto: a
temperatura dominante é a mesma nos dois temas.

## 6.2 Equivalentes, com contraste medido

Todos contra `--color-fundo` do próprio tema.

| Papel | Claro | Escuro | Contraste no escuro |
|---|---|---|---|
| `--color-fundo` | `#F2F1EC` | `#0E1611` | — |
| `--color-fundo-elevado` | `#FFFFFF` | `#16211A` | — |
| `--color-fundo-inverso` | `#12301F` | `#1D4630` | — |
| `--color-texto` | `#171A17` | `#E7E5DE` | **14,59:1** |
| `--color-texto-suave` | `#4A504A` | `#A8B0A6` | **8,26:1** |
| `--color-texto-inverso` | `#E7E5DE` | `#E7E5DE` | 8,45:1 sobre a faixa |
| `--color-link` | `#1F3A5F` | `#8FB8D6` | **8,76:1** |
| `--color-link-hover` | `#162943` | `#B6D4E8` | **11,89:1** |
| `--color-destaque` | `#E8B23A` | `#E8B23A` | **9,51:1** |
| `--color-acento` | `#8A4B2A` | `#C97B4E` | **5,63:1** |
| `--color-marca` | `#026A69` | `#2A9D96` | **5,57:1** |
| `--color-borda` | `#D3D0C6` | `#2C3A30` | 1,54:1 (decorativa) |
| `--color-borda-forte` | `#767B74` | `#5A7064` | **3,45:1** |
| `--color-foco` | `#1F3A5F` | `#E8B23A` | **9,51:1** |

## 6.3 Por que a inversão automática não serviria

Três tokens da paleta clara **reprovam** sobre a superfície noturna:

| Token | Sobre `#0E1611` |
|---|---|
| `--color-anil` | **1,60:1** |
| `--color-observatorio` | **2,86:1** |
| `--color-barro` | **2,73:1** |

Milho é o único que atravessa os dois temas sem mudar — e é por isso que ele vira o
contorno de foco do escuro.

Um teste falha se alguém "simplificar" o escuro reaproveitando os valores claros.

## 6.4 Duas descobertas dos testes

Os testes de contraste pegaram dois defeitos no primeiro desenho da paleta escura.
Ambos foram corrigidos antes da entrega.

**A faixa do cabeçalho não pode inverter.** No primeiro desenho,
`--color-fundo-inverso` virava pedra no tema escuro — o que colocaria uma barra clara
no topo de uma página escura e derrubaria o par milho/faixa para 1,53:1. A correção:
a faixa continua sendo mata, apenas clareada para `mata-claro`, com o mesmo texto em
pedra. O cabeçalho mantém a identidade nos dois temas.

**Texto sobre marcador de milho precisa ser invariante.** O par "texto sobre
marcador" herdava `--color-texto`, que vira pedra no escuro: pedra sobre milho dá
1,53:1. A correção foi um papel próprio:

```css
--color-texto-sobre-destaque: var(--color-carvao);   /* igual nos dois temas */
```

Milho é a mesma cor nos dois temas; o texto por cima dele também precisa ser.

---

# 7. Marca do Coletivo em superfície escura

Decisão humana de 2026-09-09: **a ausência de versão monocromática oficial não é
bloqueio.**

**Proibido:** redesenhar, recolorir, vetorizar automaticamente, inventar versão
branca, alterar as cores da marca.

**Solução adotada para composições escuras:** usar a marca oficial colorida sobre uma
**superfície neutra ou clara apropriada** — um bloco de respiro claro sob a marca —
em vez de aplicá-la direto sobre o fundo escuro.

A razão é medida:

| Marca | Cor institucional | Sobre mata `#12301F` |
|---|---|---|
| Observatório | `#026A69` | **2,23:1** |
| Coletivo "Tobias, sou Eu!" | `#9E309E` | **2,30:1** |

Nenhuma das duas é legível em cor institucional sobre superfície escura. O
Observatório tem saída própria — existe vetor monocromático claro oficial. O Coletivo
não tem, e por isso recebe a superfície de apoio.

Se uma versão monocromática oficial do Coletivo for fornecida depois, **ela substitui
esta solução**.

Um teste registra as duas medições, para que ninguém aplique nenhuma das marcas
direto sobre escuro por engano.

---

# 8. Mecânica do tema

## 8.1 A cascata

```
sem data-tema        →  o sistema decide (prefers-color-scheme)
data-tema="claro"    →  claro, mesmo com o sistema no escuro
data-tema="escuro"   →  escuro, mesmo com o sistema no claro
```

Implementa a decisão da Direção Visual §5.4: **primeira visita segue o sistema**;
depois, escolha manual persiste.

`color-scheme` acompanha os três estados, para que o navegador pinte campo de
formulário e barra de rolagem no tema certo.

## 8.2 Três estados, não dois

`sistema` não é sinônimo de `claro`. É a **ausência** de escolha manual, e é o padrão.
Por isso `atributoDoTema("sistema")` devolve `null`, que significa **remover o
atributo** — e não escrever a string `"sistema"`, que não casaria com seletor nenhum e
funcionaria por acidente em vez de por contrato.

## 8.3 Persistência

`localStorage`, chave `observatorio-tema`. Sem cookie, sem servidor, sem banco, sem
rastreio.

Valor ausente, corrompido, de outra aba ou de outra versão cai em `sistema`. A leitura
**nunca lança**: armazenamento é entrada externa, e entrada externa inválida vira o
padrão, não uma exceção no caminho de renderização.

---

# 9. Flash de tema

## 9.1 O problema, e ele existe

**SIM, o flash foi identificado.** Server Components não têm como saber o que este
navegador salvou, então o HTML sai sempre sem `data-tema`. Se a escolha manual só
fosse aplicada depois da hidratação, quem escolheu escuro veria um lampejo claro em
toda navegação.

## 9.2 A solução

Um script **síncrono e inline** no `<head>`, com **148 bytes**, que lê a preferência
salva e carimba o atributo antes da primeira pintura.

Propriedades que importam:

- **síncrono**, senão a pintura acontece antes dele;
- **`try/catch` obrigatório** — `localStorage` **lança** em navegador com armazenamento
  bloqueado, não devolve vazio. Sem o `catch`, a página inteira quebraria para quem
  bloqueia armazenamento;
- **só escreve quando há escolha manual**. Em `sistema` não toca no DOM;
- **nenhuma rede, nenhum cookie, nenhum rastreio**. O `AGENTS.md` proíbe script de
  terceiro que rastreie; este é próprio, local e constante;
- o conteúdo é **gerado a partir das constantes** de `src/lib/tema.ts`, para que a
  chave exista em um lugar só. Um teste confere que script e módulo não divergiram.

`suppressHydrationWarning` no elemento raiz — e **só** nele — porque o React não
renderizou o atributo que o script escreve. Um teste verifica que nenhum erro de
hidratação aparece no console.

Um teste mede o momento: o atributo já está aplicado quando `document.readyState` vira
`interactive`, isto é, **antes de o corpo ser analisado**.

---

# 10. Movimento

Tokens novos, na escala aprovada (Direção Visual §12.1 — site 3–4/10):

```css
--duracao-hover: 150ms;       /* faixa aprovada 120–180 */
--duracao-revelacao: 240ms;   /* faixa aprovada 200–300 */
--duracao-painel: 240ms;      /* faixa aprovada 200–280 */
--duracao-tema: 0ms;

--easing-padrao / --easing-entrada / --easing-saida
```

**Nenhuma animação decorativa foi adicionada.** Os tokens existem para que as fases
seguintes não escolham duração no olho.

**A troca de tema é instantânea de propósito.** Animar a página inteira mudando de cor
é pior que o corte para quem tem sensibilidade vestibular ou fotossensibilidade. Aqui
a ausência de animação é a escolha acessível, não uma omissão.

**Reduced motion:** o bloco global que já existia permanece, e agora os **próprios
tokens** são zerados sob a preferência — para que quem lê `var(--duracao-hover)`
receba a resposta certa, em vez de depender de a regra global alcançá-lo. Verificado
no navegador, com a preferência emulada.

---

# 11. Foco

Requisitos atendidos:

| Requisito | Como |
|---|---|
| visível no claro | anil, 9,1:1 sobre pedra |
| visível no escuro | milho, 9,51:1 sobre noite — o token troca por tema |
| não depende só de cor | contorno de 3px onde não havia contorno + `outline-offset: 2px`, que abre uma faixa da própria superfície entre o elemento e o contorno |
| não escondido por border-radius | **corrigido** — ver abaixo |
| consistente | uma regra só, em `@layer base`, para todo elemento interativo |

**A correção do raio.** A regra anterior declarava `border-radius: var(--radius-ficha)`
dentro do `:focus-visible`. Isso não protegia o contorno: **mudava a forma do elemento
ao focá-lo**. O `outline` já acompanha sozinho o raio que o elemento tiver. A
declaração foi removida, e um teste impede que volte.

Efeito colateral bem-vindo: `Cabecalho`, `MenuMobile` e `Rodape` sobrescreviam a cor
do foco à mão, com `focus-visible:outline-destaque`, porque anil sobre mata some.
Agora que `--color-foco` é sensível a tema, esses três `override` podem sair — não
nesta fase, para não tocar em componente, mas a dívida deixou de existir na fundação.

---

# 12. Tipografia

**Nenhuma fonte foi adicionada, removida ou trocada.** Archivo, Literata e IBM Plex
Mono continuam auto-hospedadas por `next/font`, subset `latin`.

Papéis organizados sobre o que já existia:

| Papel | Família | Onde |
|---|---|---|
| display | Archivo | títulos, numeral de ficha |
| heading | Archivo | títulos |
| body | Literata | corpo |
| editorial | Literata | texto longo, `--largura-leitura` |
| metadata | IBM Plex Mono | `.meta-ficha` |
| label | IBM Plex Mono | `.meta-ficha` |
| navigation | Archivo | cabeçalho |

Tokens novos: `--leading-titulo` (1.15), `--peso-titulo` (600) e `--peso-numeral`
(700) — os três estavam escritos à mão em `@layer base` e viraram token.

**Não foram criados sete tokens de família**, um por papel. Sete aliases de três
famílias seriam sistema paralelo; o mapeamento acima é documentação, e é o suficiente.

---

# 13. Wordmark

A fonte oficial do lettering da marca **não foi identificada** — nenhum arquivo de
identidade declara `font-family` ou preserva texto editável, e o único vetor real tem
o lettering convertido em curvas.

**Regra registrada, agora também no `tokens.css`:**

> A marca nunca é reproduzida com fonte. Quando a identidade exata for necessária,
> usa-se o asset oficial. Redigitar o nome do Observatório em Archivo e chamar de
> marca é inventar a marca.

---

# 14. Coletivo "Tobias, sou Eu!"

Registrado como decisão permanente do projeto:

O Coletivo Cultural "Tobias, sou Eu!" é **idealizador, realizador e origem
institucional** do Observatório. **Não é patrocinador secundário.**

Nesta H0 **nenhuma área visual foi redesenhada**. O que a fase entrega é a condição
técnica para a presença correta do Coletivo no Hero e no rodapé das fases seguintes:
superfícies com contraste medido e a regra da §7 sobre marca em fundo escuro.

---

# 15. Server vs Client

| | Antes | Depois |
|---|---|---|
| Client Components | 2 | **2** |

`MenuMobile` e `MapaInterativo`. **Nenhum novo.**

## 15.1 Por que a H0 não criou um provedor de tema

Foi avaliado, e não era necessário:

1. **O tema funciona inteiro sem JavaScript.** A cascata do `tokens.css` resolve
   claro, escuro e `prefers-color-scheme` sozinha. Testado com JavaScript desligado.
2. **O que precisa de navegador é ler a preferência salva antes da primeira pintura** —
   e isso é um script de 148 bytes no `<head>`, não um componente.
3. **Não existe interface de troca de tema nesta fase.** A Central de Acessibilidade é
   da H4. Um provedor de estado não teria o que prover, e expor um controle
   incompleto na Home pública está proibido pela própria instrução da H0.

O que existe é `src/lib/tema.ts`: módulo **puro**, sem `"use client"`, sem React, sem
acesso direto a `window`. Ele descreve as regras; a H4 importa em vez de
reimplementar.

## 15.2 Biblioteca externa

**`next-themes` não foi instalado**, e nenhuma outra. A avaliação: a biblioteca
resolveria o mesmo problema que 148 bytes de script mais uma cascata de CSS já
resolvem, ao custo de uma dependência e de tornar a raiz da aplicação um Client
Component. **CSS + ponte mínima é superior aqui.**

---

# 16. Performance

| Item | Impacto |
|---|---|
| **JavaScript** | **+0 B** — nenhum Client Component novo, nenhum chunk novo |
| **CSS** | 5.013 B → **5.369 B** comprimidos (**+356 B**) |
| **HTML** | +148 B por página (script inline) + a cópia dele no payload RSC |
| **Dependências** | **nenhuma nova** |
| **Rotas estáticas** | 19, todas ainda estáticas |

O custo total da fundação de tema é de algumas centenas de bytes, sem JavaScript
adicional. É a consequência direta de o tema ser cascata de CSS, e não estado de
componente.

O orçamento do doc 01 §7 — Home abaixo de 500 kB — continua com folga larga.

---

# 17. O mapa

**ADR-010 permanece em vigor.** MapLibre continua fora, sujeito a ADR futuro. Nenhuma
mudança de arquitetura, de geometria ou de comportamento.

Houve, porém, um efeito colateral a corrigir — e ele é instrutivo.

O CSS do mapa misturava paleta bruta com papéis semânticos. Como os papéis trocam de
valor no escuro, o tema teria mudado **metade** do desenho:

| Referência | Efeito no escuro, se mantida |
|---|---|
| `--color-texto-suave` no traço da camada base | a fronteira dos 75 municípios clarearia sobre um preenchimento pedra que **não** clareia, e sumiria — desfazendo em silêncio a correção que a ADR-010 registra |
| `--color-fundo-elevado` no contorno do marcador | escureceria e deixaria de separar o pino do preenchimento claro |
| `--color-texto` herdado no item realçado da lista | viraria pedra sobre milho: **1,53:1** |

As três referências passaram para tokens **invariantes de tema**, com valores que são
exatamente os que os papéis já resolviam no claro. Consequência: **zero mudança visual
no tema claro**, e o mapa preservado no escuro.

Isto não é alterar o mapa — é impedir que a H0 o altere. Verificado no navegador: em
tema escuro o mapa renderiza com preenchimento `#E7E5DE` e traço `#4A504A`, idênticos
ao tema claro.

Um teste impede que o CSS do mapa volte a depender de papel semântico. A camada
cartográfica ganha tratamento próprio de tema na H3.

---

# 18. Geometria territorial — auditoria (Q3)

O plano listou `sergipe.geojson` como faltante. A auditoria confirma que **isso estava
correto**, e esclarece uma ambiguidade que poderia levar alguém a baixar malha
duplicada.

## 18.1 O que existe, e é usado

| Arquivo | Bytes | Conteúdo | SHA-256 |
|---|---|---|---|
| `src/dados/territorio/municipios-sergipe.geojson` | 92.720 | **75 municípios** | **confere** com `fontes.ts` |
| `src/dados/territorio/municipios-sergipe-nomes.json` | 54.401 | **75 nomes** | **diverge** — ver §18.3 |

Lidos e validados em tempo de build por `src/dados/territorio/validacao.ts`, que
rejeita o arquivo se não vierem exatamente 75 municípios.

**A malha municipal existe, está íntegra e não deve ser baixada de novo.**

## 18.2 O que realmente falta

`sergipe.geojson` — o **contorno externo do estado**, malha única — é um arquivo
**diferente** da malha municipal. Está declarado em `fontes.ts` com `origem`
preenchida e `obtidoEm: null`. A busca por `*sergipe*` e `*.geojson` em todo o
repositório devolve apenas os dois arquivos da §18.1.

**Confirmado: o contorno do estado não existe.** Ele é o insumo da espessura do pôster
cartográfico planejada para a H3. Nada nesta fase depende dele.

`pontos-visita.json` também não existe, e continua correto que não exista: coordenada
sai de conferência em campo.

## 18.3 Achado — um SHA-256 declarado que não confere

| | Valor |
|---|---|
| SHA-256 declarado em `fontes.ts` | `2678c3b2…5801c5` |
| SHA-256 real do arquivo | `b304f78e…984701` |

**Causa identificada, não suposta.** O arquivo salvo está formatado com indentação de
2 espaços; o hash declarado é o da **resposta compacta da API**. Reserializando o
conteúdo em forma compacta, o hash bate exatamente com o declarado — o que prova que o
conteúdo é o mesmo e só o formato difere.

O arquivo foi commitado uma única vez e nunca mudou: o hash estava errado desde a
origem.

**Consequência prática:** ninguém consegue conferir o arquivo do repositório com o
hash registrado, que é justamente a função do registro num projeto de prestação de
contas.

**Não corrigido nesta rodada.** Alterar `fontes.ts` é mexer em procedência documental,
que não é escopo da H0 e merece decisão própria — inclusive sobre registrar os **dois**
hashes, o da resposta original e o do arquivo armazenado. Fica registrado aqui com a
evidência completa.

---

# 19. Primeiro post — referência interna (Q4)

`primeiro-post-observatorio.pdf` é **D01-08** e continua **MANTER_PRIVADO**.

**O que foi feito:** inspeção local, autorizada, do arquivo no corpus.

**O que NÃO foi feito:** não foi copiado para `public/`, não tem URL, não foi enviado
ao R2, não entrou no bundle, não foi versionado no Git, nenhuma página ou imagem dele
foi publicada. O arquivo permanece exatamente onde estava.

## 19.1 Conclusões abstratas

**Cor.** A paleta do material confirma o verde-azulado institucional e organiza-se em
quatro famílias: o teal da marca, uma família de verdes territoriais, uma família de
azuis — coerente com a água que dá nome ao Vale — e tons de terra. O amarelo aparece
como acento pontual, nunca como fundo. Isso sustenta as decisões de temperatura por
seção que o plano já previa.

**Amarelo.** O tom usado no material é mais puro e saturado que o `--color-milho`
atual do projeto. **Nenhuma alteração foi feita** — trocar milho seria mudança de
paleta não autorizada, e a instrução da H0 autoriza apenas incorporar o teal. Fica
registrado como observação para decisão humana futura.

**Linhas orgânicas.** O material usa contorno orgânico como elemento de composição,
não como moldura decorativa. Compatível com a "topografia extremamente sutil" que a
Direção Visual §23 aprova.

**Fotografia e tipografia.** A relação é de fotografia como plano de fundo com bloco
de texto sólido por cima — não texto solto sobre foto sem separação. Reforça a decisão
do overlay obrigatório no Hero.

**Linguagem territorial.** Nomeia municípios, equipamentos e o próprio Vale de forma
concreta, sem lirismo. Coerente com o tom editorial da Direção Visual §20.

**Integração institucional.** As marcas aparecem em área própria, com os rótulos de
produção e realização separados do conteúdo — exatamente a estrutura que o plano
propõe para o rodapé.

**Contraste.** Preto e branco puros são usados como extremos de composição. O projeto
usa carvão e pedra, que são menos duros; nenhuma mudança é proposta.

**Iconografia.** Os elementos gráficos aparecem com função editorial, não como
enfeite. Confirma a diretriz de biblioteca iconográfica semântica.

## 19.2 Um achado que não é de design

O material contém **texto institucional redigido pelo próprio projeto** sobre o que é
o Observatório, o que é o Vale do Rio Real e o que é um observatório de cultura.

**Isso não o torna fonte pública.** O documento é `MANTER_PRIVADO`, e nenhuma linha
dele foi copiada para este ou qualquer outro arquivo do repositório. Fica o registro
de que **existe** texto institucional de autoria do projeto — o que é relevante para o
bloco `00` da Home, hoje bloqueado por ausência de texto aprovado. Liberar qualquer
trecho é decisão humana, e exige tratar a origem documental.

---

# 20. Navegação

**Nenhuma rota nova foi criada. Nenhum link foi alterado.**

O menu alvo aprovado está registrado na
[ADR-017](../decisoes/ADR-017-navegacao-alvo-do-frontend.md), com a estratégia
incremental que impede rota falsa. `docs/01-arquitetura-informacao.md` §3 recebeu o
apontamento correspondente.

A troca do menu é da **H1**, e depende de `/territorio` e `/acervo` existirem.

---

# 21. Testes

**97 testes novos.**

| Arquivo | Testes | O que protege |
|---|---|---|
| `testes/tema.test.ts` | 56 | contrato dos três estados; script de tema executado de verdade, inclusive com armazenamento que lança; **os dois blocos de tema escuro sendo idênticos**; escuro que redefine papéis e nunca a paleta bruta; teal medido; foco que troca por tema; `!important` travado em 4; mapa invariante de tema |
| `testes/contraste.test.ts` | 39 | 15 pares × 2 temas calculados do próprio `tokens.css`; os três tokens claros que reprovariam no escuro; a regra do milho nos dois sentidos; as duas marcas sobre mata |
| `testes/a11y/tema.spec.ts` | 15 | sistema claro/escuro; escolha manual vencendo o sistema; valor corrompido; **ausência de flash medida por `readyState`**; ausência de erro de hidratação; **tema funcionando sem JavaScript**; reduced motion; foco nos dois temas |
| `testes/a11y/viewports-tema.spec.ts` | 30 | 3 larguras × 2 temas × 3 rotas sem transbordo; 320 px nos dois temas; contraste **do que foi pintado**, não do token; link de pular legível ao receber foco; contorno de 3px |

Nenhum snapshot grande. Cada teste afirma um comportamento nomeado.

**Nota sobre `pnpm a11y`:** o script roda Playwright, **sem axe** — não há `@axe-core`
instalado no projeto. As verificações são explícitas e escritas à mão. O
`PLANO_HOME_PILOTO_1_0.md` descrevia o script como "Playwright + axe"; a correção está
registrada lá.

---

# 22. Viewports

Matriz completa, automatizada:

| | 320 | 375 | 768 | 1440 |
|---|---|---|---|---|
| **claro** | Home | Home · Sala · imprimível | Home · Sala · imprimível | Home · Sala · imprimível |
| **escuro** | Home | Home · Sala · imprimível | Home · Sala · imprimível | Home · Sala · imprimível |

Sem transbordo horizontal em nenhuma combinação. Contraste de corpo de texto,
metadado, cabeçalho e link de pular verificado nos dois temas. Contorno de foco de 3px
confirmado nos dois.

**A Sala do Avaliador não foi redesenhada.** Ela apenas passou a existir também no
escuro, pelos mesmos tokens.

---

# 23. Verificação visual

Conferido no navegador, em 1280×900:

- **claro** — a Home está como estava. Nenhuma diferença perceptível;
- **escuro** — fundo mata muito escuro, fichas elevadas, texto pedra, links em anil
  claro, faixa do cabeçalho em mata-claro, mapa idêntico ao tema claro.

---

# 24. O que fica para a H1

| Bloqueio | Situação |
|---|---|
| Menu alvo | **resolvido** — ADR-017 |
| Marca do Coletivo em fundo escuro | **resolvido** — superfície neutra/clara de apoio |
| Rotas `/territorio` e `/acervo` | **abertas** — precisam existir antes da troca de menu |
| Versão monocromática oficial do Coletivo | **desejável, não bloqueante** |
| Crop do Hero em 375 px | aberta — decisão visual da H2 |
| Overlay do Hero: α 0,50 ou 0,60 | aberta — piso medido é 0,50; recomendado 0,60 |
| Manual de marcas (E02) | aberto — bloqueia o bloco de fomento |

**A fundação está pronta para o Hero.** O que a H2 precisa e já tem: superfícies com
contraste medido nos dois temas, sistema de foco que não some sobre fotografia
escurecida, tokens de movimento e a regra de marca sobre fundo escuro.
