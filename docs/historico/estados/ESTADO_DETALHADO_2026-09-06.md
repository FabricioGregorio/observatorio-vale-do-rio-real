> **SUPERADO — preservado apenas para histórico.**
> Não usar como orientação operacional vigente.
> Referências vigentes: [`PLANO_EXECUCAO_OBSERVATORIO.md`](../../../PLANO_EXECUCAO_OBSERVATORIO.md)
> e [`ESTADO_ATUAL_PROJETO.md`](../../../ESTADO_ATUAL_PROJETO.md).
> Movido em 2026-09-06 pela consolidação de governança.

---

# Estado atual do projeto

Registro factual em 2026-09-05. Este arquivo não recompõe documentos históricos
removidos.

## Repositório

- Branch atual: `feat/home-indicadores`.
- Commit atual: `38f3e1427ebd6ef5a66ba1d8ba2e94399ed7689a`.
- Working tree: contém alterações anteriores não relacionadas a esta etapa
  (incluindo exclusões de estados antigos e arquivos novos), além das alterações
  desta continuação; não houve commit nem push.

## Banco

- PostgreSQL confirmado: 18.6.
- Migrations aplicadas: `0001_fundacao`, `0002_nucleo_prestacao_contas` e
  `0003_gate_pendencias`.
- Roles confirmados: `app_observatorio` (somente leitura),
  `manutencao_observatorio` (DML sem DDL) e `neondb_owner` (role real das
  migrations, com DDL).
- Testes de isolamento registrados: 15/15 conformes; operações negadas falharam
  com SQLSTATE 42501 pelo privilégio esperado.
- Sequences não aplicáveis ao schema atual: zero em `public`, zero colunas
  `identity` e zero defaults `nextval()`; as chaves usam UUID.

## Storage

- Variáveis dos dois buckets detectadas como configuradas em `.env.local`, sem
  registrar seus valores.
- Cliente privado implementado em `src/lib/storage-privado.ts`, sem URL pública e
  sem fallback para o bucket público.
- Teste real de storage criado em `testes/storage-integracao.test.ts`, cobrindo
  upload, leitura, URL pública, GET anônimo privado, limpeza e acessos cruzados.
- Toolchain recuperada fora da restrição do sandbox: `tsc`, Vitest e Biome
  executam normalmente.
- Preflight do ZIP repetido sem mutação: zero documentos no banco, zero candidatos
  elegíveis e `prestacao-de-contas/anexos.zip` ausente (HEAD 404).
- O gerador agora usa `podePublicar` do Manifesto e não gera nem envia ZIP vazio.
- `pnpm build` executado com `.env.local` carregado no processo: exit code 0;
  o gerador consultou a fonte e informou zero anexos elegíveis, sem upload.
- HEAD final de `prestacao-de-contas/anexos.zip`: 404; o objeto continua inexistente.
- Nenhum item `RESTRITO`, `PENDENTE`, `IMPEDIDO` ou `ESPELHAVEL` foi considerado.
- Preflight somente leitura: bucket `observatorio-publico`, chave
  `prestacao-de-contas/anexos.zip`, zero candidatos, zero códigos e HEAD 404.
- A regra antiga baseada em `status = publicado` foi substituída pelo gate
  `PUBLICAVEL` + `revisao_privacidade = concluida`, com arquivo, hash e
  proveniência obrigatórios.
- Variáveis documentadas apenas pelos nomes: `STORAGE_PUBLIC_ENDPOINT`,
  `STORAGE_PUBLIC_BUCKET`, `STORAGE_PUBLIC_ACCESS_KEY`, `STORAGE_PUBLIC_SECRET`,
  `STORAGE_PUBLIC_URL`, `STORAGE_PRIVATE_ENDPOINT`, `STORAGE_PRIVATE_BUCKET`,
  `STORAGE_PRIVATE_ACCESS_KEY` e `STORAGE_PRIVATE_SECRET`.

## Manifesto de Evidências

- Contrato derivado criado em `src/lib/manifesto-evidencias.ts`, com testes.
- A fonte canônica permanece banco/inventário; nenhum registro documental foi
  preenchido ou inventado. Item sem estado/revisão/URL permanece não público.
- O Caderno de Estudos continua PENDENTE e não bloqueia o site.

## Gates e próxima etapa

- Gates sem publicação: `pnpm tipos` passou; `pnpm lint` passou com quatro avisos
  preexistentes em `tokens.css`; testes do fluxo sem R2 passaram (145/145);
  `next build` direto passou; `pnpm a11y` passou (33/33).
- `pnpm build` literal passou com zero candidatos e sem upload. `package.json` e
  `pnpm-lock.yaml` não mudaram; `.env.local` não aparece no Git.

## Prompt 1

CONCLUÍDO.

## Prompt 2 — auditoria e reconciliação de `observatorio-fontes/`

EXECUTADO. Relatório em `docs/auditorias/AUDITORIA_FONTES_2026-09-05.md`.

### Isolamento da pasta

- Localizada em `Desktop/observatorio-fontes`, fora do repositório.
- Não rastreada pelo Git, ausente de `git status`, sem symlink ou junction
  apontando para dentro do repositório, e nada copiado para `public/`.
- Etapa somente leitura: nenhum arquivo da pasta foi renomeado, movido,
  convertido, comprimido, editado ou apagado.

### Fontes encontradas

- 72 arquivos, 541.197.811 bytes (516,1 MB), 72 hashes SHA-256 distintos.
- Só três pastas existem: `entrevistas/` (16 arquivos), `fotos/` (56) e
  `relatorios/`, que existe **vazia**.
- Sete pastas previstas pelo plano não existem: `diagnosticos/`,
  `formularios/`, `identidade-visual/`, `marcas/`, `caderno-estudos/`,
  `derivados-publicos/` e `nao-classificados/`.
- Duplicidade binária: nenhuma. Sete grupos de fotos com nome sequencial têm
  hashes distintos e não são duplicados.

### Reconciliação

- Vínculos seguros: 5 — B02, B03, B04, B08 e B01 (com divergência de contagem:
  8 pastas de fotos contra "Visitas I a VII").
- Vínculos ambíguos, não fechados: 2 — B05 e B06.
- Arquivos sem item: 2 — entrevista do diretor de turismo de São Cristóvão e
  entrevista de Tomar do Geru.
- Itens sem arquivo: 23 dos 28 exigidos, incluindo B07 (Itabaianinha), para o
  qual nenhum item foi criado.
- Nenhum registro canônico foi inserido ou alterado: `documento`, `arquivo`,
  `documento_arquivo` e `consentimento` continuam com zero linhas.

### Relatórios atualizados

Nenhum. `relatorios/` está vazia, sem subpastas.

### Nove documentos (A02–A06, B09–B12)

Todos BLOQUEADOS: nenhuma fonte atualizada localizada. Nada foi extraído de
versão antiga. A03 e A04 seguem apontando para o mesmo documento de origem de
A02.

### Pendências

- Zero termos de consentimento no acervo: 8 áudios e 8 transcrições travados
  em `RESTRITO`. Isso significa "termo não localizado", não ausência de
  consentimento jurídico.
- Relatório de Objeto (§9 do plano) não localizado e não identificável: a
  expressão aparece uma única vez em todo o projeto, no próprio plano.
- Caderno de Estudos: `PENDENTE`. Não bloqueia o site de 14/09.
- Marcas e identidade visual: nenhum arquivo. E02 segue pendente e o rodapé
  continua com placeholder declarado.
- 56 fotos exigem revisão de privacidade; 45 têm bloco EXIF presente, cujos
  valores não foram lidos.

### Próxima decisão necessária

Nove decisões humanas estão listadas na seção 17 do relatório de auditoria. As
que travam mais coisa: o sobrenome de B05 (Santana contra Rodrigues), a
identidade do entrevistado da pasta 04 (Márcio André contra Márcio Ramos, e
possivelmente dois entrevistados), o destino das duas entrevistas sem item, e o
rótulo público das entrevistas em `/prestacao-de-contas`.

Prompt 3 não foi iniciado.

## Prompt 2.2 — fonte canônica local, reconciliação e nomenclatura

EXECUTADO. Mapa em `docs/auditorias/MAPA_FONTES_CANONICAS_2026-09-05.md`.

### Decisão humana registrada

`observatorio-fontes/` passou a ser a FONTE CANÔNICA LOCAL. Dado anterior do
repositório que a contradiga é tratado como potencialmente desatualizado e
reconciliado, nunca sobrescrito em silêncio.

### Local e configuração

- Movida de `Desktop/observatorio-fontes` para `~/observatorio-fontes`, fora do
  repositório.
- `os.rename` na mesma unidade: operação de metadado, sem reescrever byte.
- Verificação antes/depois: 138 arquivos, 608.281.472 bytes, 138 hashes
  distintos, conjunto de hashes idêntico e mapa caminho→hash idêntico.
- Caminho em `OBSERVATORIO_FONTES_DIR`, no `.env.local`. O `.env.example`
  documenta só o nome. Nenhum caminho de usuário em código versionado.

### O acervo cresceu

De 72 para 138 arquivos (516,1 MB para 580,1 MB) entre a auditoria e esta
etapa: 66 arquivos novos, nenhum removido. Chegaram os três relatórios
técnicos, `formularios/`, `identidade-visual/` e `marcas/`.

Consequência: `AUDITORIA_FONTES_2026-09-05.md` recebeu aviso de estado. Segue
válido nos 72 originais, na duplicidade, na matriz de entrevistas e nos
achados de privacidade; ficou desatualizado onde afirma pastas ausentes.

### Padronização

- Seis pastas canônicas: `entrevistas/`, `formularios/`, `fotos/`,
  `identidade-visual/`, `marcas/`, `relatorios/`. Nenhuma criada — todas já
  tinham conteúdo. `identidade visual` foi a única renomeada.
- Entrevistas reorganizadas em `NN-slug/{audio,transcricao}/`.
- 97 arquivos e 35 diretórios renomeados; zero colisões; zero itens deixados
  de fora por ambiguidade.
- Conjunto de hashes idêntico depois do renome: nenhum byte alterado.
- A grafia humana correta vive no mapa, não no filename.

### Reconciliação nova

- Vínculo seguro: **A02, A03 e A04** passaram a ter arquivo próprio. Encerra o
  conflito de três itens apontando para um único Google Docs.
- Vínculo provável, não fechado: E02 (`marcas/`, 34 PNGs não abertos), D01
  (`identidade-visual/`) e A01 (`indicadores-observatorio/`).
- Arquivos sem item: as três exportações de respostas de formulário — são
  respostas, não o instrumento que A09 e A10 pedem — e os 18 arquivos de
  indicadores.
- Nada gravado no banco: as quatro tabelas seguem com zero linhas.

### Continua em aberto

Termos de consentimento ainda inexistentes; conflito Paola Santana × Rodrigues;
pasta 04 com três nomes em circulação e dois entrevistados na transcrição; B07
sem fonte; entrevistas 04 e 07 sem item; data de B06 não confirmada; Relatório
de Objeto não localizado; Caderno de Estudos pendente; e o material novo ainda
não passou por triagem de privacidade.

### Observação sobre o enunciado

O §1–§5 chegou truncado no meio do §5. A continuação com §6 a §25 foi recebida
depois e executada.

## Prompt 2.2 §6–§25 — consentimento, reconciliação e auditoria canônica

EXECUTADO. Auditoria em `docs/auditorias/AUDITORIA_FONTES_CANONICAS_2026-09-05.md`.

Nada foi movido, renomeado ou desfeito nesta continuação. Fonte verificada:
138 arquivos, 608.281.472 bytes, **zero hashes alterados** desde a movimentação.

### Consentimento verbal gravado

Correção de estado aplicada: não existe termo separado, e não deve existir. A
autorização é verbal, gravada no áudio e registrada na transcrição.

**Verificados: 7 de 8.** Em seis a autorização está na abertura; na entrevista
01 está no fim, e o próprio entrevistador observa que deveria ter pedido no
início. Nenhum trecho de consentimento foi copiado para o Git e nenhum termo
artificial foi criado.

Divergência: entrevista 08 (Dona Madá). O pedido existe na transcrição, a
resposta afirmativa não. Exige conferência do áudio.

Achado separado: a última linha da transcrição 08 é texto de ferramenta
automática de transcrição, não fala de participante. Original não foi editado.

### Decisões humanas resolvidas por evidência

Os dois conflitos de nome não eram conflitos:

- **Paola Rodrigues de Santana** — `Santana` e `Rodrigues` são fragmentos do
  mesmo nome, declarado na entrevista. Canônico: Paola Santana.
- **Márcio André Soares Ramos** — `marcio-ramos` da foto é fragmento do mesmo
  nome. Canônico: Márcio André, Diretor de Turismo. Ian Victor Batista de
  Araújo participa e autoriza, mas não é o entrevistado principal.
- **Laerte Santos Aguiar / Tomar do Geru** — confirmado pelo próprio
  entrevistado. B07 era previsão de agenda anterior à entrevista; a de
  Itabaianinha não ocorreu. Nenhum item foi criado para preencher meta.

Achado novo: o prefeito declara **Dilson de Jesus Santos**; *Dilson de
Agripino* é o uso público. Mesma pessoa, slug físico mantido.

### Relatórios

Os três são distintos por hash e por estrutura. Bloqueio novo: **A03 (Borda da
Mata) é PDF sem camada de texto** — 7 páginas, 7 JPEGs, zero fontes. Não é
legível por máquina nem por leitor de tela, e por isso A06 não pôde ser
procurado dentro dele. Precisa de OCR.

A05 tem fonte: a seção "Diagnóstico detalhado do Recanto da Serra", dentro de
A02. Derivável, não arquivo próprio. Nenhuma extração foi feita.

### Nove documentos

3 com arquivo próprio (A02, A03, A04), 1 derivável (A05), 5 sem fonte (A06,
B09–B12). Prontos para a próxima etapa: **A02 e A04**.

### Formulários e indicadores

O instrumento não existe como documento, mas **as perguntas são o cabeçalho das
planilhas de respostas** — A09 e A10 são reconstituíveis de fonte válida do
próprio acervo, sem depender do link `/edit` do Google Forms.

O anexo de indicadores é 1 planilha de 17 abas mais 17 PDFs que a renderizam.
`11-nota-metodologica` é a origem da regra de anonimização de comentários que
citam terceiros. `06-pessoas-trabalho` e `08-fornecedores` trazem pessoa
identificada: RESTRITO. Nenhum nome foi copiado para documento versionado.

### Marcas e identidade visual

34 PNGs de 8000×4500 com transparência — **ativos de marca, não páginas de
manual**. Inspecionei 7 e identifiquei MinC/Governo Federal, FUNCAP, Governo de
Sergipe e Cultura Viva 20 Anos. Os outros 27 seguem não identificados
individualmente.

Dois achados para o rodapé: a marca da **PNAB/Lei Aldir Blanc não apareceu** em
nenhum arquivo inspecionado, e **E02 continua sem fonte** — a pasta entrega os
ativos, não as regras de proporção e ordem.

### Relatório de Objeto

Fonte não localizada no corpus atual. A expressão não aparece em nenhuma das 8
transcrições, dos 3 relatórios nem dos 17 arquivos de indicadores. Não foi
inferido C01.

### Próxima decisão necessária

Onze decisões na seção 17 da auditoria canônica. As que travam mais: autorizar
OCR de A03, conferir o áudio de 08, criar B13 e B14, localizar a marca da PNAB
e obter E02.

Nada gravado no banco: as quatro tabelas seguem com zero linhas.

## Prompt 2.2.1 — fechamento da reconciliação

EXECUTADO em 2026-09-06. Registro na seção "Fechamento — Prompt 2.2.1" de
`docs/auditorias/AUDITORIA_FONTES_CANONICAS_2026-09-05.md`.

Nada publicado, nenhum upload, nenhum original alterado, banco não tocado.

### Resolvido

- **Nomes canônicos:** o modelo separa `nome_declarado` de `nome_exibicao`.
  Paola Santana, Márcio André e Dona Madá fixados. `Rodrigues` e `Ramos` ficam
  como nomenclatura histórica divergente, não como pessoas distintas.
- **B13 e B14 livres e confirmados** — a série B ia até B12, contígua, sem
  reservas. B07 preservado como previsão não realizada de Itabaianinha, sem
  substituição silenciosa.
- **B06 reconciliado** com Maria Madalena Santos, Ilha Grande. Saíram do
  metadado a data 11/04/2026 e a classificação "liderança", ambas sem fonte.
- **OCR de A03 produzido.** Original intocado
  (`6dfef470…edcfea2e`); derivado em `derivados/a03-borda-da-mata-ocr.md`,
  hash `502d9bf1…b366ff8b`, 10.449 bytes, `RESTRITO`, `derivado_de = A03`.
  Método: extração das 7 imagens JPEG embutidas e leitura visual, sem OCR
  estatístico. Nada corrigido ou completado.
- **A06 encontrado dentro de A03** — mesma estrutura de A05 em A02. Deixa de
  ser pendência sem fonte.
- **A05 confirmado** derivável de A02, seção "Diagnóstico detalhado do Recanto
  da Serra".
- **A02, A03 e A04 reconciliados** com conteúdo conferido nos três, não só por
  hash.
- **As 34 marcas classificadas** uma a uma. Seis marcas distintas em 34
  variantes; nenhuma não identificada.

### Correção de erro meu na etapa anterior

Eu havia registrado que **a marca da PNAB não estava no acervo**. Estava
errado, e o erro foi de amostragem: os 7 arquivos que abri não incluíam nenhum
dos seis que a trazem. **PNAB localizada: `marcas-09` a `marcas-14`.** Também
errei ao supor que os blocos por tamanho seriam variantes de quatro marcas — são
seis. As duas afirmações foram corrigidas na auditoria, com a marcação do erro.

As cinco marcas que o rodapé exige estão todas no acervo. Apareceram ainda duas
que **não pertencem a este rodapé**: Cultura Viva 20 Anos e Lei Rouanet, de
outras políticas de fomento. Este projeto é PNAB; incluí-las seria crédito
indevido.

### Continua bloqueado

- **Consentimento da entrevista 08:** não consegui aferir o áudio — o ambiente
  não tem `ffmpeg` nem ferramenta de transcrição de áudio. Item parado com
  intervalo indicado: ouvir **01:00 a 06:00** do áudio de ~45 min. O pedido
  está na linha 50 de 335; os timestamps da transcrição terminam em [01:18].
- **E02 permanece `PENDENTE`.** Verifiquei o que ele exige — proporção e ordem
  dos créditos — e os 34 arquivos são arte, não regra. Logo existir não
  resolve.
- **B09 a B12:** `fonte_nao_localizada = true`. Zero ocorrências de "relato de
  campo" em todo o corpus.
- **A09 e A10:** instrumento não localizado como documento, mas
  reconstituível dos cabeçalhos das planilhas. PDF não produzido.
- **Indicadores:** proposto item novo **A11**, categoria "Análise de dados",
  com a planilha como principal e os 17 PDFs como renderizações. Não associado
  a A01, que é painel interativo no Figma — artefato diferente. Nenhum código
  criado.

### Achados novos no OCR de A03

Três truncamentos de texto no original, onde o layout corta o parágrafo — o
texto perdido não existe no arquivo. Dois nomes de trabalhadores diferentes
entre resumo e detalhamento, não resolvido. Salto na numeração das seções.
Períodos divergentes entre as duas partes do arquivo. E o PDF contém **dois
documentos**: relatório técnico nas páginas 1–5, formulário de visitantes nas
6–7.

### Próxima decisão necessária

Aprovar a proposta de atualização do inventário, que está pronta e **não foi
gravada**. Ela depende de: criar B13, B14 e A11; aplicar as remoções de campo
de B06; e registrar A05/A06 como deriváveis. Fora disso, seguem pendentes o
áudio de 08, o E02, os relatos B09–B12 e o instrumento dos formulários.

Prompt 3 não iniciado.
