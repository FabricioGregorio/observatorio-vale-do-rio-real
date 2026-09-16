# TAREFA 16 — Home v2 — candidata editorial experimental

**Natureza:** consolidação e registro de protótipo DEV.

**Data:** 2026-09-13.

**Rota:** `/dev/home-livre` — somente desenvolvimento; 404 em produção.

**Esta tarefa NÃO autoriza** integração em `src/app/page.tsx`, alteração da
Home pública, publicação de marcas, cópia de assets para `public/`, commit,
push ou deploy.

## 1. Estado

| | |
|---|---|
| Branch | `feat/home-indicadores` |
| `HEAD` | `90700d1d4adae0111fa155fdff48f96b94000117` |
| Protótipo no Git | não — todos os arquivos estão não rastreados |
| Home pública | inalterada (H0–H4.1) |
| Abertura candidata | **B2 — Fotográfica/Documental refinada** |

## 2. Decisões humanas registradas

1. Experimento de Home com liberdade de composição, sem liberdade de fato
   (2026-09-13).
2. Seções da Home livre aprovadas conceitualmente; abertura repensada em três
   variações (A, B, C); B escolhida como base; B2 criada e **escolhida como
   abertura candidata**. Exploração A/B/C encerrada; não criar B3 sem nova
   autorização.
3. Copy aprovada como base editorial do experimento:
   “Um observatório que foi a campo para registrar a cultura e a economia
   criativa do Vale do Rio Real — e tornar público o que encontrou.”
4. PodObservar: três episódios publicados, no Spotify e no YouTube; o
   responsável possui os materiais.
5. Régua conceitual: Projeto → Apoio/parceria (FUNCAP, Governo de Sergipe) →
   Fomento (PNAB como selo/programa → separador se o manual exigir →
   Ministério da Cultura + Governo Federal). Governo Federal fecha à direita.
   Usar **Governo de Sergipe**, não “Secretaria de Cultura + Governo de
   Sergipe”.
6. `.claude/launch.json` é configuração local de preview e **não entra em
   commit**.

Implementação nesta rodada: sem `?hero=`, a rota agora abre a B2. As variações
`atual`, `a`, `b` e `c` seguem acessíveis por `?hero=` só como registro.

## 3. Arquitetura da Home v2

| Ordem | Seção | Âncora | Conteúdo | Origem da composição |
|---|---|---|---|---|
| — | Topo | — | símbolo, menu com rotas existentes, Central de Acessibilidade, Prestação de Contas | `Secoes.tsx › Topo` |
| 0 | Abertura B2 | `data-abertura="b2"` | fotografia documental, nome oficial (`h1`), propósito, CTA “Conhecer a pesquisa”, 2 / 8 / 5, assinatura, legenda | `Aberturas.tsx › AberturaB2` |
| I | Origem | `#hl-origem` | Coletivo realiza; Edital PNAB nº 02/2025 financia; FUNCAP/SE recebe a prestação de contas | `Secoes.tsx` |
| II | Território | `#hl-territorio` | recorte do Vale; mapa estático; lista de municípios | `Secoes.tsx`, `MapaDoRecorte.tsx` |
| III | Lugares | `#hl-lugares` | Recanto da Serra e Borda da Mata; o que a pesquisa reuniu em cada um | `Secoes.tsx` |
| IV | Leitura — Onde o recurso circula | `#hl-leitura` | H4-001 e quatro apoios, com base, regra, período, recorte e fonte | `Secoes.tsx` |
| V | Escuta | `#hl-escuta` | oito entrevistas por instituição/lugar; Ilha Grande | `Secoes.tsx` |
| VI | Produtos | `#hl-produtos` | PodObservar; catálogo com estado | `Secoes.tsx` |
| VII | Conferência | `#hl-conferencia` | Prestação de Contas, `anexos.json`, versão imprimível, hash do A02 | `Secoes.tsx` |
| — | Créditos | — | régua conceitual — **não publicar** | `Secoes.tsx` |
| — | Rodapé | — | links do rodapé vigente | `Secoes.tsx` |

## 4. Conteúdo

### 4.1 Factual, com fonte

- Nome oficial (Direção Visual §8.4) e nome curto (metadados do site).
- “Uma iniciativa do Coletivo Cultural “Tobias, sou Eu!”” (H1 §12).
- Edital de Chamamento Público PNAB nº 02/2025 — Observatórios de Cultura e
  Economia Criativa; prestação de contas à FUNCAP/SE (doc 01; AGENTS.md).
- Recorte territorial e definição do Vale (`recorte.ts`, responsável,
  2026-09-03).
- Contagens 2 / 8 / 5 e demais contagens — derivadas de dados versionados.
- Indicadores H4 (`indicadores/derivados.ts`), sem recálculo.
- Povoado Jacaré e caracterização do Recanto (A02 público).
- Estados documentais dos materiais (inventário; auditoria H3).
- URL, licença, tamanho e hash do A02 (`/anexos.json`, 2026-09-13).

### 4.2 Copy aprovada

- Frase de propósito da B2 (decisão humana, 2026-09-13).
- Copy da Leitura: título “Onde o recurso circula”, entrada, leitura do dado e
  saída (H4.5.2).
- Linha de método “A pesquisa reúne fotografia, entrevista gravada e
  formulário de resposta. Nem todo lugar recebeu as três.” (H3).
- Texto da Sala do Avaliador reutilizado na Conferência.

### 4.3 Texto novo ainda PROPOSTA — requer aprovação antes da integração

- Origem: os dois parágrafos e as descrições da cadeia.
- Território: nota sobre São Cristóvão, Ilha Grande e Serra dos Macacos.
- Lugares: introdução e textos de Recanto e Borda da Mata.
- Escuta: os dois parágrafos iniciais e a legenda de Ilha Grande.
- Produtos: textos do PodObservar e descrições do catálogo.
- Créditos: aviso e regras (DEV).

## 5. Revisão de coerência global — achados, sem correção

1. **Informação institucional repetida.** A assinatura da B2 (Coletivo →
   Edital → Vale) é seguida imediatamente pela Origem, que repete Coletivo e
   Edital em texto e de novo na cadeia. O Coletivo aparece três vezes em
   sequência curta.
2. **Contagem repetida.** “8 entrevistas” está na B2, na Escuta e no catálogo
   de Produtos; “5 municípios” está na B2 e no catálogo; “2 equipamentos” está
   na B2 e no título “Dois lugares no centro da pesquisa”.
3. **Destino do CTA.** “Conhecer a pesquisa” leva a `#hl-lugares` e salta
   Origem e Território.
4. **Links duplicados.** O A02 tem dois links (Lugares e Produtos). A
   Prestação de Contas é alcançada por quatro caminhos: Topo, catálogo
   (“Ver no acervo”), Conferência e Rodapé.
5. **Nome de destino inconsistente.** “Ver no acervo” aponta para
   `/prestacao-de-contas`; `/acervo` não existe (ADR-017).
6. **Rótulos que variam.** Seção VII: rótulo “Conferência”, título “Tudo o que
   está aqui pode ser conferido”, destino “Prestação de Contas”. Seção IV:
   rótulo “Leitura”, título “Onde o recurso circula”, catálogo “Leitura
   quantitativa”.
7. **Fotografia repetida.** A foto da B2 reaparece no cartão do Recanto, em
   Lugares. A marcação lá diz “atribuição a confirmar”; a B2 diz “Atribuição
   formal de local pendente”. O cartão, sob o título do Recanto, sugere
   visualmente a atribuição ainda não encerrada.
8. **Nome oficial repetido** no `h1` e no rodapé.
9. **Transição abrupta** entre a assinatura da B2 e o rótulo “I Origem”, que
   recomeça pelos mesmos fatos.
10. **Navegação para placeholders.** O Topo leva a quatro páginas vazias sem
    indicar estado; só a lista “Seções do site em preparação”, em Produtos,
    avisa. Ver §9.
11. **Material DEV presente na candidata:** faixa “Experimento controlado”,
    seletor de variações, “Fontes desta seção · experimento” em todas as
    seções, marcações tracejadas, aviso “Não publicar” nos Créditos.
12. **Créditos desatualizados em relação às decisões desta rodada:**
    - dizem “arquivo oficial RGB pendente”, mas os arquivos existem;
    - citam códigos antigos `marcas-NN`, mas os arquivos foram renomeados;
    - agrupam Governo de Sergipe com a Secretaria (antigos 19–23);
    - não preveem separador entre PNAB e MinC/Governo Federal;
    - trazem o rótulo “Apoio / parceria” ainda como pendência.
13. **Casca de layout.** A candidata esconde por CSS o cabeçalho e o rodapé do
    layout raiz e usa `Topo`/`RodapeLivre` próprios. A integração exige
    decidir entre esse topo e o `CabecalhoPrototipo` da Home pública.
14. **Código da exploração encerrada** (A, B, C, `FragmentoDoVale.tsx`,
    `Abertura` atual) segue no protótipo. Decidir se entra em commit ou se sai
    antes da integração.

## 6. Fotografia da abertura

- **Origem técnica confirmada:** o SHA-256 do original do Hero (`37cf8d2e…`)
  é idêntico ao de um arquivo da pasta de campo da visita ao Recanto da Serra.
- **Atribuição editorial formal: pendente.** A B2 mantém “Conjunto de campo
  do Recanto da Serra · Data não informada · Atribuição formal de local
  pendente”.
- Não escrever “fotografia do Recanto da Serra” como fato definitivo em
  conteúdo público.
- **Decisão humana necessária antes da integração:** encerrar ou não a
  atribuição; decidir o cartão do Recanto em Lugares (achado 7).

## 7. Dependências de mídia

| Dependência | Situação |
|---|---|
| Fotografias do Recanto classificadas APTAS na H3 (estufa, fachada de museu, igreja vista de longe, parede do memorial) | sem derivado público |
| Sete fotografias do Borda da Mata | pendentes; HEIC não decodificado; três com sinal de pessoa identificável |
| Recorte horizontal da foto do Hero | usado pela B2 no desktop; mostra pessoas de lado, como o Hero público já mostra |
| Marcas de apoio e fomento | originais existem fora do Git; derivados web não produzidos (§8) |
| PodObservar | material ausente do repositório (§7.1) |

### 7.1 PodObservar — material a fornecer

Por episódio:

- número e temporada;
- título;
- data de publicação;
- duração;
- descrição ou sinopse;
- participantes e convidados, com autorização de nome e voz;
- URL do Spotify;
- URL do YouTube;
- **transcrição integral revisada** — obrigatória: áudio sem transcrição
  vinculada não pode ser publicado (AGENTS.md);
- capa ou arte, com arquivo original, texto alternativo e direitos;
- créditos de produção e edição;
- trilha e respectiva licença;
- licença do episódio;
- documentos citados.

Para o podcast:

- URL do feed RSS, se houver;
- arte geral;
- decisão sobre incorporar players. Players do Spotify e do YouTube carregam
  scripts e cookies de terceiros e conflitam com a regra de não rastrear;
  links simples não conflitam.

Até lá, os três espaços seguem sem título, duração, link ou transcrição, e C04
segue `PENDENTE` no inventário.

## 8. E02 — créditos e marcas

### 8.1 Composição conceitual candidata — não publicar

```text
PROJETO            APOIO / PARCERIA              FOMENTO
[Observatório /    [FUNCAP] [Governo de Sergipe]  [PNAB] | [Ministério da Cultura + Governo Federal]
 Coletivo — a                                     selo    separador   assinatura federal, sempre à direita
 definir]
```

### 8.2 Inventário de `C:\Users\bricin\observatorio-fontes\marcas`

Leitura somente; nada foi copiado, convertido ou alterado.

- **23 PNG**, todos 8000×4500 px, RGBA, sem perfil de cor embutido. Nenhum
  vetor (SVG, PDF ou EPS) de marca.
- **FUNCAP:** horizontal e vertical, em cor e em preto e branco.
- **Governo de Sergipe:** horizontal com fundo, horizontal sem fundo, vertical
  sem fundo.
- **Secretaria de Cultura + Governo de Sergipe:** horizontal e vertical —
  **não usar** (decisão 5).
- **Ministério da Cultura + Governo Federal:** horizontal e vertical em cor,
  com fonte preta, com fonte branca e sem fundo.
- **PNAB:** PNAB1 a PNAB4 (variações de cor), fonte preta, fonte branca.
- **Manual:** `manual-identidade-visual.pdf`, 44 páginas — “Manual de uso da
  marca do Governo Federal”, v1.2, ago/2025.
- **Diferença em relação à auditoria de 05/09:** os arquivos de Cultura Viva e
  Lei Rouanet não estão mais na pasta.

### 8.3 O que o manual federal estabelece

Lido por extração de texto. Os diagramas de proporção ainda exigem leitura
visual das páginas 12–15 e 18–28.

- RGB para peças não impressas; CMYK para impressas.
- Versões monocromáticas (linha, positiva em preto, negativa em branco); preto
  sobre fundo colorido claro; versão especial para fundos escuros; aplicação
  em box branco.
- Não aplicar diretamente sobre fundo instável.
- Área de não interferência “x” = espessura da letra I de BRASIL; recomenda-se
  espaço maior.
- Largura mínima digital: 200 px (excepcionalmente 110 px).
- Ordem ascendente de importância da esquerda para a direita; Governo Federal
  sempre por último à direita (e abaixo, em assinatura vertical).
- A marca nominativa do Governo Federal nunca menor que as demais; marcas
  parceiras não ultrapassam sua altura nem sua largura.
- Selo de programa de governo, de preferência, fora da assinatura; se entrar,
  com linha separadora (espessura conforme a p. 7) e sem ultrapassar a marca
  nominativa.
- Usos indevidos: rotacionar, distorcer, alterar cores ou tipografia, moldura,
  marca-d'água, reposicionar elementos.

### 8.4 Pontos a validar

- A PNAB como selo, dentro da régua, depende da regra do selo de programa
  (separador; não ultrapassar a marca federal).
- “Alturas visuais equivalentes” só é compatível se nenhuma marca ficar maior
  que a marca federal.
- Os PNG em tela de 8000×4500 exigem medir a área útil antes de qualquer
  derivado.

### 8.5 Manuais ainda NÃO localizados

- manual específico da PNAB;
- manual da FUNCAP;
- manual do Governo de Sergipe;
- regra gráfica específica do edital.

O manual federal resolve apenas a parte federal da assinatura. Nenhuma lacuna
foi preenchida por inferência. **E02 continua dependente de validação técnica
e nada opor.** Se surgir documento do edital que exija a assinatura da
Secretaria de Cultura, parar e reportar o conflito.

### 8.6 Regras para os futuros derivados web

Os originais não são alterados. Todo derivado deve preservar:

- proporção e transparência;
- espaço de proteção;
- tamanho mínimo;
- procedência registrada: arquivo de origem, hash e transformação.

## 9. Matriz de links da candidata

| Destino | Onde aparece | Estado |
|---|---|---|
| `/` | marca do Topo | **parcial** — Home pública H0–H4.1 (Tarefa 15) |
| `/observatorio` | Topo | **placeholder** |
| `/pesquisa` | Topo; Produtos | **placeholder** |
| `/dados` | Topo; Produtos | **placeholder** |
| `/campo` | Produtos | **placeholder** |
| `/podobservar` | Topo; Produtos | **placeholder** |
| `/educacao` | não linkada na candidata | **placeholder** |
| `/imprensa` | Rodapé | **placeholder** |
| `/acessibilidade` | Rodapé | **placeholder** (a Central de Acessibilidade é um botão funcional à parte) |
| `/privacidade` | Rodapé | **placeholder** |
| `/contato` | Rodapé | **placeholder** |
| `/prestacao-de-contas` | Topo; Produtos; Conferência; Rodapé | **pronto** |
| `/prestacao-de-contas/imprimir` | Conferência | **pronto** |
| `/anexos.json` | Conferência | **pronto** |
| PDF A02 no acervo | Lugares; Produtos | **pronto** — HTTP 200, 756.239 bytes |
| `#hl-lugares`, `#hl-leitura`, `#hl-territorio` | CTA da B2; Produtos | **pronto** (internos) |
| `/dev/home-livre?hero=…` | seletor DEV | somente DEV (404 em produção) |

Os dez placeholders exibem apenas título e “Esta seção ainda não tem conteúdo
publicado.” A navegação não foi alterada; decisão humana pendente.

## 10. Performance em build de produção local

### 10.1 Método

Mesmo método da 10B.3.2: `next build` + `next start`, e
`performance.getEntriesByType` no navegador, com contexto novo e sem cache.
Tamanhos transferidos com a compressão do `next start`.

A rota `/dev/home-livre` responde **404** no build de produção, por desenho.
Para medir sem remover esse guarda, o build foi feito numa **cópia descartável
fora do repositório**:

- sem `.git`, `docs`, `testes` e `.env`;
- `node_modules` por junção;
- raiz do Turbopack ampliada só na configuração da cópia;
- rota temporária `/medicao-home-livre` renderizando o mesmo
  `HomeLivre abertura="b2"`.

O `/` da mesma build é a Home pública atual. A cópia foi apagada depois da
medição.

### 10.2 Carga inicial, sem rolar (bytes transferidos)

| | Atual 1440 | Candidata 1440 | Atual 375 | Candidata 375 |
|---|---:|---:|---:|---:|
| **Total** | 810.959 | 882.075 | 623.367 | 590.649 |
| HTML (transferido / decodificado) | 76.279 / 333.294 | 70.054 / 259.477 | 76.279 / 333.294 | 70.054 / 259.477 |
| JavaScript | 149.664 | 142.643 | 149.664 | 142.643 |
| Imagens | 469.476 (6) | 553.838 (5) | 281.884 (4) | 262.412 (4) |
| Fontes | 108.972 (4) | 108.972 (4) | 108.972 (4) | 108.972 (4) |
| CSS | 6.568 | 6.568 | 6.568 | 6.568 |
| Requisições | 20 | 19 | 18 | 18 |
| Chunks JS | 8 | 8 | 8 | 8 |

### 10.3 Depois de rolar a página inteira

| | Atual 1440 | Candidata 1440 | Atual 375 | Candidata 375 |
|---|---:|---:|---:|---:|
| **Total** | 861.709 | 1.125.741 | 722.943 | 834.315 |
| Imagens | 499.730 (7) | 797.504 (8) | 360.964 (7) | 506.078 (7) |
| Prefetch RSC | 20.496 (10) | 0 | 20.496 (10) | 0 |
| Requisições | 31 | 22 | 31 | 21 |

### 10.4 Leitura dos números

- Nenhuma das duas cabe na referência de 500 kB.
- **JavaScript:** a candidata tem 7 kB a menos — sai a ilha do mapa, entra um
  chunk de 1.775 bytes.
- **HTML:** a candidata tem 74 kB decodificados a menos.
- **Imagens após rolagem:** a candidata é mais pesada. No desktop carrega o
  recorte horizontal do Hero e o recorte vertical, que o cartão do Recanto
  usa; nas duas larguras carrega as três fotos de Ilha Grande.
- **Limitações:**
  - uma única execução;
  - localhost, sem CDN;
  - o HTML da candidata inclui o material DEV (§5, item 11).

## 11. Testes executados em 2026-09-13

| Verificação | Resultado |
|---|---|
| `pnpm tipos` | passou |
| `pnpm lint` | passou — 0 erros, 4 avisos preexistentes (`!important` do movimento reduzido) |
| `testes/rota-home-livre.test.ts` | 17/17, dentro da suíte completa |
| `pnpm teste` (suíte completa, credenciais externas neutralizadas como string vazia) | 33 arquivos passaram, 2 ignorados; 537 testes passaram, 19 ignorados |
| `testes/a11y/home-livre.spec.ts` (servidor de desenvolvimento) | 7/7 — B2 por padrão, um `h1`, ordem das seções, 375/1440 claro/escuro sem transbordo nem imagem sem `alt`, CTA por teclado com foco visível até `#hl-lugares`, movimento reduzido |
| Guarda de produção | `/dev/home-livre` → 404 no build de produção |

**Registro de execução.** A primeira rodada da suíte completa neutralizou as
credenciais com um espaço em branco. Os testes de integração interpretaram
isso como credencial presente, tentaram conectar e falharam: 14 falhas em 3
arquivos, sem conexão estabelecida. A rodada válida é a da tabela.

**Não executados:**

- suíte a11y completa;
- `pnpm pendencias`;
- escrita real no R2;
- Lighthouse.

## 12. Critérios para futura integração

- [ ] Autorização humana explícita de integração em tarefa própria, com
      arquivos permitidos.
- [ ] Aprovação das copies em §4.3.
- [ ] Decisão sobre a atribuição da fotografia e sobre o cartão do Recanto
      (§6).
- [ ] Decisão sobre cada achado de coerência (§5).
- [ ] Remoção de todo material DEV: faixa, seletor, “Fontes desta seção”,
      marcações e aviso dos Créditos.
- [ ] Decisão sobre a casca de layout: Topo/Rodapé do experimento ×
      cabeçalho/rodapé do layout raiz.
- [ ] Decisão sobre links para placeholders (§9).
- [ ] Créditos: régua atualizada conforme §8, derivados com procedência,
      validação técnica e nada opor antes de publicar.
- [ ] PodObservar alimentado com material real e transcrições, ou estado
      vazio honesto aprovado.
- [ ] Orçamento de performance tratado ou exceção aprovada (§10).
- [ ] Remoção ou arquivamento do código das variações encerradas.
- [ ] `pnpm verificar` completo e verde no ambiente de integração.
- [ ] Preservação dos invariantes H4: fonte, período, recorte, base e regra
      junto aos números.

## 13. Inventário para um eventual commit experimental

### Deve entrar futuramente

- `src/app/dev/home-livre/page.tsx`
- `src/componentes/prototipo/homelivre/abertura.ts`
- `src/componentes/prototipo/homelivre/Aberturas.tsx`
- `src/componentes/prototipo/homelivre/conteudo.ts`
- `src/componentes/prototipo/homelivre/estilos.ts`
- `src/componentes/prototipo/homelivre/estilosAberturas.ts`
- `src/componentes/prototipo/homelivre/Estrutura.tsx`
- `src/componentes/prototipo/homelivre/FragmentoDoVale.tsx`
- `src/componentes/prototipo/homelivre/HomeLivre.tsx`
- `src/componentes/prototipo/homelivre/MapaDoRecorte.tsx`
- `src/componentes/prototipo/homelivre/Secoes.tsx`
- `testes/rota-home-livre.test.ts`
- `testes/a11y/home-livre.spec.ts`
- `docs/tarefas/16-home-v2-candidata-editorial-experimental.md`

Fora do protótipo, com decisão própria:
`docs/tarefas/15-auditoria-completude-editorial-frontend-publico.md`, já não
rastreado antes deste experimento.

### Não deve entrar

- `.claude/launch.json`
- `docs/handoff/`
- capturas, scripts de medição, extrações de texto e a cópia de build — todos
  no scratchpad da sessão, fora do repositório
- qualquer arquivo de `C:\Users\bricin\observatorio-fontes`
- `.next/`, `test-results/`, `playwright-report/` (já ignorados)

## 14. Arquivos alterados nesta rodada

- `src/componentes/prototipo/homelivre/abertura.ts` — B2 como variação padrão
- `src/componentes/prototipo/homelivre/HomeLivre.tsx` — B2 como padrão
- `testes/rota-home-livre.test.ts` — expectativa do padrão
- `testes/a11y/home-livre.spec.ts` — novo
- `docs/tarefas/16-home-v2-candidata-editorial-experimental.md` — este
  documento

## 15. Promoção a Home oficial em desenvolvimento — 2026-09-16

Decisão humana desta data: a Home v2 **deixou de ser experimento concorrente**.
Ela é a Home oficial em desenvolvimento do Observatório, e `/` passou a
renderizá-la. Não haverá Home v3 nem alternativa paralela: todo refinamento
futuro é commit incremental nesta mesma linha.

A Home estrutural H0–H4.1, que servia `/` até aqui, continua versionada e
publicada em produção. O papel dela mudou, não o código: passa a ser **baseline
publicado e ponto de rollback**, não linha de desenvolvimento. Nada foi
removido, e nenhum documento anterior foi reescrito — o histórico das decisões
que levaram até ela continua valendo como registro do que foi decidido quando.

A promoção não duplicou a Home. `/` e `/dev/home-livre` renderizam o mesmo
`HomeLivre`; o que os separa é o parâmetro `contexto`:

- `publico` — navegação canônica de sete itens da ADR-017, menu de telas
  estreitas e nenhum rótulo de desenvolvimento;
- `dev` — aviso de experimento, seletor de abertura e a demonstração histórica
  de menu da H1, como harness de regressão.

`/dev/home-livre` segue existindo com essa função e continua respondendo 404 em
produção, verificado no build local. Não existe segunda Home pública.

A abertura pública é a B2 aprovada, fixa: `?hero=` é instrumento de laboratório
e não é lido em `/`.

### Correção de destino incorporada

O item "Identidade visual" do capítulo Produtos apontava para
`/prestacao-de-contas` enquanto `/acervo` não existia. A rota passou a existir
na integração de 2026-09-16 e o destino passou a ser `/acervo`, que é o que o
rótulo "Ver no acervo" sempre disse. A copy não mudou.

### Aposentadoria da composição H2 — decisão de 2026-09-16

A composição H2 do território — `SecaoMapa`, o mapa exploratório com índice
sincronizado e navegação por teclado sobre os 75 municípios — era servida
**somente** por `/`. Com a promoção da candidata v2 ela perdeu rota pública.

Decisão humana: a H2 está **aposentada da composição pública**. Não será
reincorporada à Home, não será movida inteira para `/territorio` e não fica
como segunda experiência concorrente. O componente e os seus estilos
continuam versionados como legado histórico; nenhuma rota pública e nenhuma
rota `/dev` nova foi criada para mantê-los vivos.

A aposentadoria é da **implementação**, não da exigência. Os contratos de
acessibilidade que a H2 protegia foram auditados um a um e migrados:

- **Reaproveitados** — seleção por teclado, `Enter`, `Espaço`, `Esc`, foco
  visível que muda cor *e* espessura, estado selecionado perceptível sem
  depender de cor, caminho único para mouse, toque e teclado, uma única
  parada de `Tab`, mapa como `img` sem JavaScript e alternativa textual.
  Agora em `testes/a11y/mapa.spec.ts`, aplicados a **dois recortes**.
- **Aposentados** — os 75 municípios como opções individuais, o índice
  textual dos 75, as setas percorrendo 75 itens e o título "Cartografia viva
  do Vale do Rio Real" na Home, que hoje é o nome de `/territorio`.
- **Conteúdo verificado** — os quatro lugares de pesquisa continuam públicos
  em `/territorio`; o recorte e o vínculo de cada município continuam em
  texto no capítulo II da Home.

Sobre os 75 nomes: eles eram a alternativa textual de uma visualização do
estado inteiro, não conteúdo editorial. O estado continua desenhado como
**contexto**, com `<title>`, `<desc>` e a lista dos municípios com vínculo
declarado ao lado. Nenhuma informação essencial foi perdida.

### Mapa interativo da Home v2 — exploração por recorte

Decisão humana da mesma data: a Home v2 **tem** mapa interativo, por junção
entre a linguagem editorial da v2 e os princípios de interação da H2.

Estado inicial: Sergipe em visão ampla, nenhum recorte destacado, nenhum
município nomeado no desenho, nenhuma ficha aberta. **Foco não é seleção** —
um recorte focado por teclado recebe contorno tracejado e nada mais; quem
revela o recorte é `Enter`, `Espaço`, clique ou toque.

São dois alvos, não setenta e cinco: o recorte do Vale do Rio Real, com os
cinco municípios tratados como **um** recorte, e São Cristóvão como
referência de comparação. Selecionar revela contorno, preenchimento, os nomes
no desenho, os itens correspondentes na lista textual e um painel contextual
com CTA para `/territorio`. `Esc` e a ação "Ver Sergipe inteiro" devolvem à
visão geral, com o foco de volta no mapa.

O reenquadramento é transformação CSS sobre o invólucro do desenho, com
escala e deslocamento **calculados em tempo de build** a partir da mesma
geometria projetada. Não há cálculo geométrico em runtime, nenhuma biblioteca
nova e nenhuma malha adicional. A duração vem de `--duracao-painel`, que a H0
zera sob `prefers-reduced-motion`.

`MapaInterativo` foi **reutilizado e parametrizado**, não duplicado: a ilha já
era comportamental e não renderizava nada. Ganhou o seletor das opções, a
chave que liga opção e lista, o rótulo da lista, o elemento que recebe o
estado, os elementos revelados na montagem e o botão de voltar. Os padrões
preservam o comportamento do laboratório `/dev/territorio`.

Sem JavaScript nada disso é prometido: o desenho continua `role="img"`, a
lista textual continua completa, e orientação, painel e botão são servidos com
`hidden` — a ilha os revela ao montar.

### Conteúdo interno fora da árvore pública

Auditoria do HTML servido em `/` encontrou material de laboratório que veio
junto na promoção: nove blocos "Fontes desta seção · experimento" com caminhos
de repositório, códigos de fase, documentos internos e os identificadores
restritos A03 e A04; e a seção de créditos, que é estudo conceitual da régua
de marcas e declara "Não publicar", com slots de marca pendentes e regras
ainda a validar.

Decisão: em `contexto="publico"` esses blocos **não são renderizados** — não
escondidos por CSS, por `hidden` ou por comentário. Em `contexto="dev"`
continuam completos, e `/dev/home-livre` segue respondendo 404 em produção.

A atribuição institucional que o visitante precisa — quem realiza, quem
financia e a quem se presta contas — já está escrita em texto no capítulo
Origem, e não dependia da régua.

### Correção de acessibilidade incorporada

A varredura encontrou 17 links de conteúdo distinguidos apenas por cor
(WCAG 1.4.1). Correção localizada: links dentro de capítulo, abertura e painel
do mapa passam a ser sublinhados; cabeçalho, rodapé e botões vazados ficam
fora, porque são landmarks de navegação ou já se distinguem por contorno. A
barra superior da Home passou a ser `<header>`, e o seu foco usa milho, a
mesma tinta do resto do site.

### Placeholders e desvios

Permanecem placeholders preexistentes em O Observatório, A Pesquisa, Dados,
Diário de Campo e PodObservar. Os dois CTAs ambíguos — "Ir para o território"
e "Conhecer a pesquisa", ambos âncoras internas — foram preservados por
decisão e ficam registrados para a próxima rodada editorial.
