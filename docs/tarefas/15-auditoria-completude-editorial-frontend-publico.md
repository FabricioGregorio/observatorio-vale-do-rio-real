# TAREFA 15 — Auditoria de completude editorial e frontend público

**Natureza:** auditoria e planejamento somente.

**Data:** 2026-09-13.

**Não autoriza implementação, alteração editorial, deploy, publicação, banco,
storage, CI, Vercel, DNS, merge, PR ou freeze.**

## 1. Decisão humana e veredito executivo

O deployment de produção `dpl_Ej9aVP4JH4dq5NyT8gGyR8dnbH6T`, que serve o
produto do commit `3519bc014251e02c21e0dceed63d0714de012e67`, é um
**checkpoint estável de produção / baseline para continuidade**. Ele não é a
versão final da entrega.

O freeze final foi adiado por decisão humana após inspeção da experiência
pública completa. O deployment não foi um erro e seu histórico não deve ser
apagado: Home, H0–H4.1, Sala, acervo 8/8, privacidade técnica,
responsividade, acessibilidade, JavaScript desabilitado e console/hidratação
permanecem validados conforme a Tarefa 14.

As três distinções que governam as próximas tarefas são:

- deployment tecnicamente estável **não** significa produto concluído;
- resposta HTTP 200 **não** significa conteúdo pronto;
- teste verde **não** significa experiência editorial completa.

**Veredito:** **SITE TECNICAMENTE ESTÁVEL, MAS EDITORIALMENTE INCOMPLETO**.

## 2. Estado auditado

| Camada | Estado em 2026-09-13 |
|---|---|
| Branch local | `feat/home-indicadores` |
| `HEAD` local e remoto | `90700d1d4adae0111fa155fdff48f96b94000117`; branch sincronizada com `origin/feat/home-indicadores` |
| Commit de produto em produção | `3519bc014251e02c21e0dceed63d0714de012e67` |
| Commit documental posterior | `90700d1d4adae0111fa155fdff48f96b94000117` |
| Deployment | `dpl_Ej9aVP4JH4dq5NyT8gGyR8dnbH6T`, Production, `Ready` |
| Domínio auditado | `https://observatoriotobiassoueu.com.br` |
| Árvore antes desta tarefa | limpa para arquivos versionados; `docs/handoff/` já existia como diretório não rastreado e foi preservado |
| Produção | H0–H4.1 publicada; oito anexos públicos; banco, R2, DNS e Vercel não alterados nesta auditoria |

O HTTP e os marcadores de conteúdo foram verificados por requisições somente
leitura ao domínio público em 2026-09-13. A implementação foi conferida no
`HEAD`. As fontes factuais foram procuradas no repositório e na fonte canônica
externa configurada por `OBSERVATORIO_FONTES_DIR`, sem copiar originais para o
Git.

## 3. Navegação efetivamente apresentada

### 3.1 Cabeçalho da Home

A Home substitui o cabeçalho legado por `CabecalhoPrototipo`. Os links reais
que ele apresenta são:

| Rótulo | Destino | Observação |
|---|---|---|
| símbolo do Observatório | `/` | link de marca para a Home |
| Observatório | `/observatorio` | rota real, hoje placeholder |
| Pesquisa | `/pesquisa` | rota real, hoje placeholder |
| Dados | `/dados` | rota real, hoje placeholder |
| PodObservar | `/podobservar` | rota real, hoje placeholder |
| Prestação de Contas | `/prestacao-de-contas` | utilidade destacada |

`Território` e `Acervo`, embora componham o menu-alvo da ADR-017, não são
renderizados na Home: as rotas ainda não existem e o componente filtra itens
sem `href`. O gatilho da Central de Acessibilidade é um botão, não um link para
`/acessibilidade`.

### 3.2 Cabeçalho das demais páginas

As demais rotas usam `Cabecalho` e exibem exatamente os seis links ainda
vigentes durante a transição da ADR-017:

| Rótulo | Destino |
|---|---|
| O Observatório | `/observatorio` |
| A Pesquisa | `/pesquisa` |
| Dados | `/dados` |
| Diário de Campo | `/campo` |
| PodObservar | `/podobservar` |
| Educação | `/educacao` |

### 3.3 Rodapé global

| Rótulo | Destino |
|---|---|
| Prestação de Contas | `/prestacao-de-contas` |
| Imprensa | `/imprensa` |
| Acessibilidade | `/acessibilidade` |
| Privacidade | `/privacidade` |
| Contato | `/contato` |

O rodapé também exibe o bloco textual “Créditos de fomento”, sem link, com a
pendência do manual de aplicação de marcas.

### 3.4 Links contextuais relevantes

A Home repete links para Prestação de Contas, Pesquisa, PodObservar e Dados na
área “Caminhos prioritários”; os três últimos são rotulados “Em preparação”.
Ela também oferece `/anexos.json` e `/prestacao-de-contas/imprimir`. A Sala
repete essas duas saídas e liga os oito objetos do acervo público. O CTA de ZIP
não é renderizado porque o pacote não foi publicado.

## 4. Mapa das rotas navegáveis

Cada rota abaixo recebe exatamente uma categoria. “Conteúdo real” descreve o
que está efetivamente servido, não o que apenas existe no corpus.

| Link | Rota | HTTP | Estado | Conteúdo real | Problema |
|---|---|---:|---|---|---|
| Início / marca | `/` | 200 | **PARCIAL** | Hero H1, Território H2, Pesquisa em Campo H3, Dados H4.1, caminhos e acervo | conteúdo substancial e tecnicamente estável, mas o humano ainda fará revisão editorial/visual da Home |
| Observatório | `/observatorio` | 200 | **PLACEHOLDER** | título e mensagem de ausência | não explica projeto, território, finalidade, contexto, autoria ou fomento |
| Pesquisa | `/pesquisa` | 200 | **PLACEHOLDER** | título e mensagem de ausência | não publica hub, método, resultados, documento final nem caminhos para materiais reais |
| Dados | `/dados` | 200 | **PLACEHOLDER** | título e mensagem de ausência | não oferece conjunto completo, dicionário, licença ou downloads; segue correto não haver CTA dentro de H4 |
| Diário de Campo | `/campo` | 200 | **PLACEHOLDER** | título e mensagem de ausência | não organiza visitas, registros, entrevistas, relatos ou galeria |
| PodObservar | `/podobservar` | 200 | **PLACEHOLDER** | título e mensagem de ausência | nenhum episódio, áudio, transcrição, feed ou plataforma foi publicado |
| Educação | `/educacao` | 200 | **PLACEHOLDER** | título e mensagem de ausência | não há trilha, glossário, material para professores ou ações documentadas |
| Prestação de Contas | `/prestacao-de-contas` | 200 | **PRONTA** | apresentação, recursos e oito anexos públicos com metadados e hashes | ZIP segue ausente deliberadamente; isso não torna a rota falsa, mas é pendência para a definição global de pronto |
| Imprensa | `/imprensa` | 200 | **PLACEHOLDER** | título e mensagem de ausência | não há release, kit aprovado, seleção de fotos nem canal de imprensa |
| Acessibilidade | `/acessibilidade` | 200 | **PLACEHOLDER** | título e mensagem de ausência | recursos técnicos existem, mas falta declaração pública e canal para relatar barreira |
| Privacidade | `/privacidade` | 200 | **PLACEHOLDER** | título e mensagem de ausência | controles técnicos existem, mas falta política pública aprovada |
| Contato | `/contato` | 200 | **PLACEHOLDER** | título e mensagem de ausência | nenhum canal institucional público foi fornecido |

Não foi encontrada rota navegável classificada como **VAZIA**, **AUSÊNCIA
DELIBERADA** ou **QUEBRADA**. As dez páginas incompletas são placeholders
intencionais de estrutura, não erros de roteamento. `/territorio` e `/acervo`
respondem 404 deliberadamente e não são links públicos; portanto não entram no
inventário de destinos efetivamente apresentados.

As superfícies contextuais `/prestacao-de-contas/imprimir` e `/anexos.json`
respondem 200 e estão funcionais. Os oito objetos permanentes do acervo também
responderam 200 na validação pós-deploy já registrada. Não se reclassificam
essas saídas como páginas editoriais globais.

## 5. Conteúdo disponível e lacunas por área

### 5.1 `/pesquisa`

**Já existe e ainda não está integrado à rota:**

- A02, Relatório Técnico — Recanto da Serra, já publicável e servido no acervo;
- A03, relatório da Borda da Mata, com derivado por leitura visual existente,
  mas não promovido automaticamente a conteúdo público;
- A04, relato técnico da Serra dos Macacos, espelhável e ainda não público;
- A05 derivável de seção real de A02 e A06 localizado no derivado de A03;
- três planilhas de respostas e o conjunto A11 de indicadores, ambos sujeitos
  às regras de restrição/anonimização;
- oito pares de áudio/transcrição de entrevista, todos restritos;
- texto e método já aprovados na H3 da Home, além de três derivados
  fotográficos públicos, sem pessoa identificável e sem metadados sensíveis;
- recorte territorial aprovado e indicadores públicos selecionados para H4.1.

**Existe apenas como protótipo DEV:** `/dev/pesquisa` e os componentes que
originaram H3. A parte aprovada já está na Home; o laboratório não é uma página
pública pronta nem autoriza transplantar todo o seu conteúdo.

**Falta produzir, receber ou decidir:** o Documento Final C02 não foi
localizado; faltam arquitetura editorial do hub, leitura HTML em capítulos,
síntese metodológica completa, relação segura entre pesquisa/campo/dados,
referência “como citar”, licença e eventual DOI. Materiais restritos exigem
decisão documental e privacidade antes de qualquer uso.

**Proposta de composição, sem autorização de implementação:** apresentação do
objeto e do recorte; percurso metodológico e limites; síntese H3 já aprovada;
resultados públicos H4.1 como entrada, não substituto do conjunto; acesso a A02
e demais documentos que se tornarem elegíveis; estados honestos para Documento
Final, dados e citação. A rota deve aprofundar H3, não duplicá-la.

### 5.2 `/dados`

O diagnóstico anterior continua verdadeiro. A Home publica um recorte
quantitativo auditado, mas `/dados` não cumpre a promessa de Portal de Dados
Abertos completo. Por isso permanece correta a decisão de H4.1 de não criar CTA
interno para essa rota.

**Já existe:** dataset TypeScript consolidado de H4, série e tabela completas
no laboratório, ranking reservado à futura página, A11 com 17 PDFs, uma
planilha estática, nota metodológica e dicionário; perguntas reconstituíveis a
partir dos cabeçalhos dos formulários.

**Somente DEV:** `/dev/dados` e `/dev/dados-vivos`; o ranking e o conjunto
completo ali não são, por si, publicação autorizada.

**Falta:** seleção editorial da página, exportações públicas anonimizadas,
dicionário público, metodologia, licença explicitamente aprovada, formatos de
download e prova de que nenhum dado individual entra na saída.

### 5.3 `/campo`

**Já existe:** relatórios técnicos, 56 fotografias no corpus, auditoria visual
que encontrou 15 candidatas sem pessoa identificável, três derivados já usados
na Home e oito entrevistas com áudio e transcrição. O corpus sustenta que houve
fotografia, entrevista gravada e formulário, sem sustentar que todo local
recebeu as três técnicas.

**Falta:** modelar editorialmente visitas sem inferir numeração/data/local;
decidir e registrar elegibilidade de cada fotografia e entrevista; produzir
derivados públicos; relacionar consentimento, áudio e transcrição; receber os
relatos B09–B12, cujas fontes não foram localizadas. O conjunto B01 e as
entrevistas permanecem restritos; não devem ser publicados por associação.

### 5.4 `/podobservar`

O corpus contém somente material promocional factual no PDF “primeiro post”,
que apresenta o podcast como devolução acessível, orgânica e didática do
conhecimento à comunidade e anuncia “vem aí”. Isso comprova intenção editorial,
não episódio.

C04 permanece `PENDENTE`: não há episódio no banco, áudio de episódio,
transcrição, título, duração, participante, link de plataforma ou feed RSS. Os
áudios de entrevistas não são episódios e permanecem restritos. A página só
pode ser concluída depois de o humano fornecer/validar episódio, ficha, áudio,
transcrição integral, direitos e destinos de distribuição.

### 5.5 `/educacao`

A arquitetura prevê glossário, área para professores e registro “na
comunidade”. Também documenta como público e ações planejadas escolas, IFS e
rádios. Não foi localizado no corpus um glossário, plano de aula, material
didático, registro editorial de ação ou episódio do qual derivar a atividade.

Portanto existe **estrutura prevista**, mas ainda não existe **conteúdo factual
publicável suficiente**. Nomes presentes na arquitetura não devem virar relato
de execução sem evidência correspondente.

### 5.6 `/observatorio`

O PDF institucional “primeiro post” oferece material factual candidato: origem
como iniciativa do Coletivo Cultural “Tobias, sou Eu!”, criação em junho de
2026, propósito inicial, locais de coleta/comparação, explicação do que é o
Observatório e descrição do percurso de coleta. A Home e `recorte.ts` também
contêm território, propósito visual e relações territoriais aprovadas.

Esse material precisa de revisão humana antes de virar copy permanente: o post
é peça de comunicação situada no tempo, fala em “próximo passo” e “vem aí”, e
não substitui texto institucional consolidado. Faltam contexto do edital,
finalidade atual, autoria/realização, delimitação precisa do Vale como recorte
socioeconômico — não divisão oficial — e apresentação do Coletivo em texto
aprovado.

### 5.7 `/imprensa`

Há sete objetos públicos de identidade visual em D01, marcas do projeto,
fotografias no corpus e o PDF institucional de divulgação. Isso pode alimentar
um kit depois de seleção e regras de uso. Não há release aprovado, ficha
institucional atualizada, seleção pública de fotografias/créditos, instruções
de uso de marca nem contato de imprensa.

### 5.8 `/acessibilidade`

Há conteúdo factual técnico: recursos da Central de Acessibilidade, navegação
por teclado, movimento reduzido, funcionamento sem JavaScript e auditorias já
registradas. Isso pode sustentar uma declaração de acessibilidade, desde que a
redação diferencie recurso implementado, teste executado e limitação conhecida.

Faltam texto público aprovado, escopo/versão da declaração, limitações atuais e
um canal válido para relatar barreiras. Não afirmar conformidade além da
evidência dos testes executados.

### 5.9 `/privacidade`

O projeto já documenta práticas reais: ausência de rastreadores/cookies de
terceiros, publicação fail-closed, separação público/privado, revisão humana de
privacidade, anonimização dos formulários e consentimento verbal gravado. Há
auditorias e gates técnicos que podem servir de fonte.

Falta uma política pública aprovada que informe finalidade, dados tratados,
bases e critérios aplicáveis, retenção, direitos e canal de contato. Não criar
termo assinado inexistente: o consentimento das entrevistas é verbal gravado,
conforme o plano vigente.

### 5.10 `/contato`

Nenhum canal institucional publicável foi localizado no repositório ou na
fonte canônica. O campo `contato_email` do banco é interno e nunca renderizado;
o domínio registra que não recebe e-mail. D02/Instagram permanece pendente e
não deve ser transformado em canal oficial por inferência.

O humano precisa fornecer o canal, responsável, finalidade, expectativa de
resposta e tratamento de dados antes da implementação.

## 6. Home — baseline e backlog reservado

Estrutura pública atual, preservada nesta rodada:

1. H1 — Hero Manifesto;
2. H2 — Território cartográfico;
3. H3 — “O campo como documento”;
4. H4.1 — “Onde o recurso circula”;
5. Caminhos prioritários;
6. Acervo público.

Não houve alteração visual ou editorial. A Home é classificada como
**PARCIAL** exclusivamente porque o responsável informou que apresentará
diversas mudanças para avaliação e especificação.

### Backlog reservado para feedback humano da Home

- [ ] receber o conjunto de observações do responsável;
- [ ] separar correções factuais, editoriais, visuais, responsivas e de
  navegação;
- [ ] confrontar cada pedido com a direção visual, ADR-017, tokens e orçamento
  de performance;
- [ ] fatiar a implementação em tarefa própria, com arquivos permitidos,
  critérios de aceite e testes;
- [ ] revalidar H0–H4.1 sem apagar este checkpoint estável.

Nenhum item desse backlog está especificado ou autorizado por esta auditoria.

## 7. Créditos e marcas

A frase do rodapé nasce diretamente de `src/componentes/layout/Rodape.tsx` e
foi introduzida na Tarefa 03 como estado vazio explícito de E02. A pendência
continua válida.

Os ativos das cinco famílias previstas — PNAB/Lei Aldir Blanc, Ministério da
Cultura, Governo Federal, Governo de Sergipe e FUNCAP — foram localizados no
acervo. O PDF institucional também contém uma composição de marcas usada em
uma peça anterior. Nenhuma dessas evidências substitui o manual: arquivo de
marca e composição passada não definem ordem, proporção, chancela, tamanho ou
área de proteção do rodapé e dos PDFs.

E02 permanece `PENDENTE`. Cultura Viva e Lei Rouanet não entram sem base
específica. A resolução do bloco conforme o manual é requisito explícito da
definição de pronto e precisa ocorrer antes do freeze verdadeiro.

## 8. Prioridades de completude do produto

### P0 — entrega bloqueada

1. Concluir, com material factual e estado público válido, as seis rotas do
   menu principal hoje servidas como placeholder: Observatório, Pesquisa,
   Dados, Campo, PodObservar e Educação. Quando o conteúdo realmente não
   existir, a decisão humana deve definir uma experiência editorial honesta e
   compatível com a promessa da navegação; esta auditoria não autoriza remover
   rota nem inventar conteúdo.
2. Publicar conteúdo adequado em Privacidade e Acessibilidade, hoje destinos
   globais vazios apesar de tratarem compromissos centrais do produto.
3. Resolver E02 e aplicar créditos/marcas segundo o manual oficial.
4. Impedir que o sitemap e a navegação apresentem placeholders como se fossem
   produto final — preferencialmente concluindo as rotas; qualquer mudança de
   rota ou arquitetura exige decisão própria.

### P1 — concluir antes do freeze real

1. Receber, especificar e executar o feedback humano da Home.
2. Concluir Imprensa e Contato com materiais e canais aprovados.
3. Unificar a experiência de navegação: hoje a Home tem cabeçalho alvo parcial
   e as demais páginas mantêm o menu legado de seis itens.
4. Decidir e publicar o pacote ZIP quando o conjunto elegível e a operação
   explícita estiverem aprovados, para satisfazer a definição global de pronto.
5. Tratar os desvios técnicos já registrados para H7, especialmente orçamento
   da Home, prova de CI/gate real e cobertura declarada com precisão.
6. Executar revisão transversal de links, rótulos, breadcrumbs/retorno,
   metadados, estados vazios e coerência entre Home e páginas internas.

### P2 — melhoria posterior

1. Expandir os hubs para as subrotas previstas na arquitetura somente quando
   houver conteúdo e autorização: capítulos, equipamentos, glossário, páginas
   de episódio, visitas e materiais.
2. Busca interna, notícias opcionais e recursos avançados de exploração.
3. Evoluções de permanência como DOI/depósito e arquivamento, sem usá-las para
   mascarar lacunas do conteúdo público básico.

## 9. Dependências humanas

| Dependência | Áreas afetadas |
|---|---|
| texto institucional consolidado e aprovação da copy do “primeiro post” | Observatório, Imprensa, Home |
| Documento Final C02, síntese metodológica e regras de citação/licença | Pesquisa |
| decisão de anonimização, licença e formatos públicos | Dados |
| classificação/publicação de visitas, fotos, entrevistas e consentimentos | Campo e Pesquisa |
| episódios completos, áudio, transcrição, ficha, direitos e plataformas | PodObservar e Educação |
| glossário, plano de aula e evidências de ações na comunidade | Educação |
| release, fotos/créditos e contato de imprensa | Imprensa |
| texto/política e canal para direitos ou barreiras | Privacidade, Acessibilidade, Contato |
| manual oficial de aplicação de marcas | rodapé, créditos e PDFs |
| feedback visual/editorial ainda não fornecido | Home |

## 10. Ordem mínima recomendada

1. Obter as dependências humanas bloqueantes e decidir o tratamento honesto de
   áreas cujo conteúdo ainda não existe, sobretudo PodObservar e Educação.
2. Fatiar e concluir primeiro as rotas globais P0: Observatório, Pesquisa,
   Dados, Campo, PodObservar, Educação, Privacidade e Acessibilidade.
3. Concluir Imprensa e Contato e resolver E02/créditos assim que o manual for
   recebido; E02 permanece bloqueador mesmo se chegar depois das páginas.
4. Receber e especificar o feedback da Home em tarefa separada, preservando o
   baseline H0–H4.1.
5. Harmonizar navegação e coerência entre Home, páginas internas, rodapé e
   sitemap; decidir as rotas futuras da ADR-017 sem criar destinos falsos.
6. Fechar pendências globais de pacote, licença, acessibilidade, privacidade e
   performance.
7. Executar auditoria editorial/funcional final em toda a experiência pública,
   além dos testes técnicos.
8. Só então declarar o freeze verdadeiro em decisão humana explícita.

## 11. Evidências consultadas

- `PLANO_EXECUCAO_OBSERVATORIO.md` e `ESTADO_ATUAL_PROJETO.md`;
- `docs/01-arquitetura-informacao.md`, `docs/02-arquitetura-banco.md` e
  `docs/03-guia-implementacao.md`;
- ADR-005 (conteúdo editorial) e ADR-017 (navegação alvo);
- Tarefas 03, 12, 13 e 14;
- auditoria funcional pré-freeze, auditoria e mapa das fontes canônicas,
  revisão de privacidade e documentação H3/H4;
- código real de layout, navegação, Home, Sala e todas as páginas públicas;
- fonte canônica externa: relatórios, formulários/indicadores, entrevistas,
  fotografias, identidade visual, marcas e o PDF “primeiro post” de 16 páginas;
- produção no domínio principal, por verificação HTTP e marcadores de conteúdo.

O PDF institucional foi lido integralmente e conferido visualmente. Ele é
fonte candidata, não copy automaticamente aprovada nem manual de marcas.

## 12. Escopo de arquivos e regra de parada

Arquivo permitido nesta tarefa:

- `docs/tarefas/15-auditoria-completude-editorial-frontend-publico.md`.

Qualquer implementação exige nova tarefa com arquivos permitidos e critérios
de aceite. Alteração de schema ou rota exige o procedimento decisório previsto
em `AGENTS.md`. Se uma fonte contradisser a arquitetura, parar e devolver a
decisão ao responsável.
