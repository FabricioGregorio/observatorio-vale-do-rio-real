# Fechamento final de integridade — publicação dos materiais da pesquisa

**Data da prova:** 16/09/2026  
**Branch preservada:** `exp/home-v2-territorio-vivo`  
**HEAD preservado:** `fdae0e6bf1bb0308f03ce8219d39699c76303a88`  
**Resultado:** acervo público reconciliado em **108/108 objetos**, sem vínculo
residual divergente. Não houve commit, push, Preview, Production nem alteração
de `main`.

O artefato detalhado, com uma entrada por objeto, é
[`RECONCILIACAO_INDEPENDENTE_2026-09-16.json`](./RECONCILIACAO_INDEPENDENTE_2026-09-16.json).

## A. Estado inicial desta continuação

O estado reportado foi preservado: 33 documentos, 118 arquivos, 118 vínculos,
108 linhas em `vw_anexo_publico`, 16 documentos `PUBLICAVEL`, 10 arquivos
privados e zero pendência de publicação. A branch, o HEAD e o working tree sujo
foram mantidos. A decisão anterior sobre os dois créditos fotográficos não foi
desfeita nem reaberta.

## B. Reconciliação independente dos 108 objetos

Foi criado `scripts/auditar-integridade-publicacao.ts`. O auditor **não importa
nem chama** `publicar-acervo.ts`, `corrigir-vinculos-publicacao.ts` ou a função
`slugDoItem`. A expectativa é reconstruída do XLSX/CSV derivado, do manifesto
de 100 objetos, do registro declarativo dos oito objetos da primeira publicação
e dos arquivos-fonte locais. O estado real é lido do banco por slug e chave.

Para cada objeto, o JSON registra fonte original, código esperado, slug
esperado, `documento_id`, `arquivo_id`, vínculo `documento_arquivo`, URL,
SHA-256, MIME, bytes e problemas. Resultado: **108 esperados, 108 reais, zero
divergência, zero extra público e zero hash local divergente**.

Duas fontes históricas da primeira publicação não existem mais na raiz atual de
fontes: D01-04 `horizontal-monocromatica-escura.svg` e D01-06 `icon.svg`. Seus
objetos públicos continuam íntegros e conferem com hashes, tamanhos e MIME
documentados. Isso é uma pendência de preservação da fonte local, não uma
divergência do acervo publicado.

## C. Contagem esperada × real por documento

| Código | Documento canônico | Esperados | Reais | Diferença |
|---|---|---:|---:|---:|
| A02 | Relatório Técnico — Recanto da Serra | 2 | 2 | 0 |
| A03 | Relatório Técnico — Borda da Mata | 1 | 1 | 0 |
| A04 | Relatório Técnico — Serra dos Macacos | 1 | 1 | 0 |
| A09 | Respostas do formulário de funcionamento | 1 | 1 | 0 |
| A10 | Respostas do formulário de visitantes | 2 | 2 | 0 |
| A11 | Anexo Técnico de Indicadores — Etapa 1 | 18 | 18 | 0 |
| B01 | Fotografias de comprovação — Visitas I a VII | 59 | 59 | 0 |
| B02 | Entrevista — Josenilson Bispo | 2 | 2 | 0 |
| B03 | Entrevista — Oviedo e Neide Abreu | 2 | 2 | 0 |
| B04 | Entrevista — Pedro Menezes | 2 | 2 | 0 |
| B05 | Entrevista — Paola Santana | 2 | 2 | 0 |
| B06 | Entrevista — liderança de Ilha Grande | 2 | 2 | 0 |
| B08 | Entrevista — prefeito de Tobias Barreto | 2 | 2 | 0 |
| B13 | Entrevista — Laerte Aguiar | 2 | 2 | 0 |
| B14 | Entrevista — Márcio André | 2 | 2 | 0 |
| D01 | Identidade visual — logomarca e cards | 8 | 8 | 0 |
| **Total** |  | **108** | **108** | **0** |

`D01-01` a `D01-08` são arquivos do único documento canônico D01; não existem
como oito documentos separados no banco.

## D. Os cinco documentos indevidamente promovidos e confirmação da reversão

O registro do incidente e o executor de correção provam que os cinco estavam,
antes da promoção acidental, em `PENDENTE` / revisão `pendente` / `rascunho` /
`publicado_em = null`. A leitura independente atual confirma a restauração
exata:

| Slug | Estado atual | Revisão | Status | Publicado em |
|---|---|---|---|---|
| `entrevista-cultura-itabaianinha` | PENDENTE | pendente | rascunho | null |
| `documento-final` | PENDENTE | pendente | rascunho | null |
| `instagram` | PENDENTE | pendente | rascunho | null |
| `termos-de-consentimento` | PENDENTE | pendente | rascunho | null |
| `manual-de-marcas` | PENDENTE | pendente | rascunho | null |

Nenhum permanece `PUBLICAVEL`. Os dez privados reportados são **arquivos
privados**, não dez documentos privados: um original de A02, um original de A04
e oito originais de D01. Todos continuam sem URL pública; somente suas réplicas
ou derivados autorizados aparecem na visão pública.

## E. Idempotência dos scripts

Dry-runs finais, todos com rollback ou sem escrita:

- publicação: 100 planejados, 100 idênticos no bucket, zero upload e zero INSERT;
- correção relacional: `movidos=0`, `revertidos=0`, `promovidos=0`, 12 principais
  já corretos e `vw_anexo_publico=108`;
- créditos: `gravados=0`, ambos já presentes;
- semântica A09/A10: zero documento a alterar.

Logo: novos arquivos 0, novos vínculos 0, vínculos corrigidos 0, promoções 0,
reversões 0, alterações de principal 0 e créditos novos 0.

## F. A09/A10 — semântica corrigida

As planilhas reais foram abertas e inspecionadas sem modificar seu conteúdo.
A09 contém respostas sobre funcionamento; A10 contém respostas de visitantes
do Recanto da Serra e do Borda da Mata. O inventário e o banco passaram a usar:

- A09: **Respostas do formulário de funcionamento**; rótulo público
  `A09 — respostas de rotina de funcionamento`; descrição factual sobre
  funcionamento, gastos, contratação temporária, atividades, visitantes e
  receitas;
- A10: **Respostas do formulário de visitantes**; rótulos públicos separados
  para Recanto da Serra e Borda da Mata; descrição factual sobre origem, perfil,
  recorrência, motivações, atividades, consumo e percepção.

Acervo, Prestação de Contas e `/anexos.json` recebem os mesmos títulos, resumos e
rótulos da consulta pública. `pnpm conferir-inventario` confirmou 33 itens e
correspondência exata entre XLSX e CSV derivado.

## G. A03 — auditoria do OCR

O PDF original de sete páginas foi renderizado e comparado visualmente página a
página com `derivados/a03-borda-da-mata-ocr.md`.

- PDF original: SHA-256
  `6dfef47006ed97133c8fef2ce0b935643c7955efbc7abaece2bcc9b0edcfea2e`;
- Markdown auditado: SHA-256
  `502d9bf1433413cfd17fe70442f6351efbe708aad7a94314946b2b64b366ff8b`;
- o texto é majoritariamente fiel, mas omite dois nomes legíveis no PDF;
- há duas truncaturas reais, no fim das páginas 1 e 2; a passagem normal entre
  páginas 2 e 3 foi marcada incorretamente como uma terceira truncatura;
- o cabeçalho do Markdown ainda diz `RESTRITO` / não publicar, incompatível com
  a autorização humana vigente;
- a releitura visual e a varredura textual deram CPF 0, telefone 0 e assinatura
  0.

## H. A03 — versão acessível não publicada

Não foi publicada. O arquivo existente não estava fiel o bastante para virar
prova pública sem correção. Foi preparada localmente uma correção sustentada
pela leitura visual, preservando lacunas em vez de inventar texto, mas a ação de
publicar os dois nomes pessoais legíveis exigiu confirmação humana específica
no controle de segurança e foi recusada nesta rodada. A tentativa não foi
contornada; o temporário foi removido.

O PDF digitalizado original permanece público e intocado. Não existe nova URL,
novo objeto ou vínculo de derivação para o Markdown; por isso a contagem não
subiu para 109.

## I. Proveniência dos WebP

O manifesto B01 preserva, para cada fotografia, caminho e SHA-256 do original,
caminho e SHA-256 do derivado, lugar e transformação. Há 58 WebP e um SVG; zero
dos 58 WebP possui hoje `derivado_de_id`. A transformação aplicada foi
orientação EXIF, largura máxima de 1280 px, WebP qualidade 78/método 6, sem
recorte e sem metadados.

## J. Originais privados e dívida técnica

O projeto suporta objetos privados, mas não havia plano de chaves nem executor
idempotente aprovado para criar 59 originais e seus vínculos. Fazer isso nesta
rodada criaria uma nova operação documental de grande volume. Nenhum original
foi espelhado e nenhum schema/migration foi criado. A proveniência continua no
manifesto; espelhar os 59 conteúdos únicos no bucket privado e preencher
`derivado_de_id`/`derivacao_metodo` permanece dívida técnica explícita.

## K. Créditos Dani Santos / Iago de Andrade Santos

As duas fotografias permanecem entre os 108 objetos. Os créditos finais são
`Foto: Dani Santos` e `Foto: Iago de Andrade Santos`. O dry-run confirmou ambos
já gravados. `credito-fotografico.ts` separa rótulo e crédito; a URL não recebe
o crédito, os filtros continuam usando os campos reais e `/anexos.json` expõe
`credito` separadamente. Nenhuma coluna proposta na ADR-018 foi implementada.

## L. Recanto da Serra

Imagem principal: `recanto-da-serra.webp`, derivada da fotografia canônica do
Recanto e marcada `principal`. Relatório técnico, entrevista, formulários e
fotografias resolvem como **Público** a partir das URLs reais; não há rótulo
residual `Restrito`/`Em revisão` nessas fichas.

## M. Borda da Mata

Imagem principal: `borda-frente-casa-de-taipa.webp`, derivada de
`frente-casa-de-taipa.heic` e marcada `principal`. Relatório técnico,
entrevista, formulários e fotografias resolvem como **Público**. O PDF A03
continua público; a versão textual não foi adicionada pelo motivo da seção H.

## N. Serra dos Macacos

A04 está público. Foram preservados exatamente: **Serra dos Macacos**;
município **Tobias Barreto**; localização **Comunidade próxima à Vila de
Samambaia**; referência cartográfica **Vila Samambaia · IBGE**. Vila Samambaia
não é apresentada como lugar visitado. Não há fotografia inventada.

## O. Ilha Grande

As fotografias e a entrevista B06 continuam associadas a **São Cristóvão —
Povoado Ilha Grande**. A interface explicita que São Cristóvão é referência
externa e não mistura Ilha Grande com o recorte municipal do Vale do Rio Real.

## P. B01 e deduplicação 63 → 59

Foram encontrados 63 caminhos físicos e 59 conteúdos únicos. Os quatro grupos
deduplicados permanecem:

| SHA-256 | Canônico | Duplicata não republicada |
|---|---|---|
| `e0a4bfd7d25624556f1916877cf01a17471b02a0467bf121c9f52365de032042` | `fotos/recanto-da-serra/estufa.jpg` | `fotos/pedro-menezes/estufa.jpg` |
| `2ce1b14f688c2d1d6e8a95244739c7607f586c9a8b819309e70eab470f43b70b` | `fotos/recanto-da-serra/momento-da-entrevista-com-pedro-menezes.jpg` | `fotos/pedro-menezes/momento-conversando-com-pedro.jpg` |
| `832eaeeb9265f4bce3e1decaa7ff6cc18f05b73502ec65b7b35291f8898addce` | `fotos/recanto-da-serra/museu-dona-maria.jpg` | `fotos/pedro-menezes/frente-museu-dona-maria.jpg` |
| `fb03f333043f5ce8d802c6a9fe1107796667d1ae525d7ab445eb7c932c074ffb` | `fotos/recanto-da-serra/volte-sempre.jpg` | `fotos/pedro-menezes/foto-saindo-placa-volte-sempre.jpg` |

Não foi criado objeto público duplicado.

## Q. Fonte única Home × Território × Acervo × Prestação × anexos.json

Home e `/territorio` usam `src/dados/materiais-de-campo.ts` e resolvem o estado
pela presença de URL em `vw_anexo_publico`. A seção de produtos da Home deixou
de conter `Restrito` fixo e passou a usar o mesmo resolvedor. Acervo, Prestação
de Contas e `/anexos.json` usam `listarAnexosPublicos`. Não foi criado array
paralelo. Um teste novo prova que os produtos da Home só ficam públicos com as
URLs reais.

O Hero e o cabeçalho não foram alterados nesta continuação. O Hero preserva
`object-position` 42% no mobile e 45% no desktop, `Recanto da Serra` e
`05/04/2026`. O B01 permanece com 59 links; agrupamento, filtro, miniaturas e
paginação são trabalho editorial futuro, não implementado aqui.

## R. Contagem pública final

Estado consultado: `documento=33`, `arquivo=118`, `documento_arquivo=118`,
`vw_anexo_publico=108`, documentos `PUBLICAVEL=16`, arquivos privados `=10` e
`vw_pendencia_publicacao=0`. A03 não ganhou derivado, portanto o total correto
continua **108**, sem hardcode de 109.

## S. URLs e hashes

As 108 URLs finais foram baixadas anonimamente. Resultado: **108 HTTP 200**, 108
SHA-256 conformes, 108 tamanhos conformes, 108 `Content-Type` conformes e 108
`Cache-Control: public, max-age=86400`. Zero 404, zero `r2.dev`, zero endpoint
S3 e zero URL fabricada.

## T. CPF, telefone e assinatura

Uma segunda varredura independente (`scripts/auditar-privacidade-publicacao.py`)
releu os 31 PDFs e quatro planilhas do conjunto reconciliado e a transcrição
visual do A03. Resultado final: **CPF público 0, telefone público 0, assinatura
pública 0**. O A03 é o único PDF sem camada textual e foi conferido visualmente
nas sete páginas.

## U. Segredos

Os arquivos alterados e não rastreados foram varridos por chave privada, AWS
access key, tokens usuais, URL com credencial e segredo atribuído: zero achado.
Não há `.env` versionado nem caminho local acidental em `src/` ou `public/`.
Caminhos locais encontrados pelo rastreio amplo existem somente em documentação
operacional/histórica e em um teste deliberado, anteriores a esta continuação.
Nenhuma URL de bucket privado ou segredo da Vercel foi introduzido.

## V. Gates

| Gate | Resultado |
|---|---|
| `pnpm tipos` | passou |
| `pnpm lint` | passou; quatro avisos preexistentes de `!important` no bloco de redução de movimento |
| `pnpm teste` | 656 pass / 3 skip; 41 arquivos pass / 1 skip |
| `pnpm a11y` | 314 pass |
| `pnpm build` | passou; 33 páginas estáticas/SSG geradas |
| `pnpm verificar` | passou; repetiu 656/3 e 314; o subcomando `pendencias` não tinha `DATABASE_URL`, mas a reconciliação externa consultou a visão e confirmou zero |
| `git diff --check` | passou |
| `pnpm conferir-inventario` | passou; 33 itens, 16 colunas |

## W. Arquivos modificados

Esta continuação criou ou alterou diretamente:

- `inventario-de-anexos.xlsx` e `scripts/derivar-inventario.py`;
- `scripts/auditar-integridade-publicacao.ts`;
- `scripts/auditar-privacidade-publicacao.py`;
- `scripts/corrigir-semantica-formularios.ts`;
- `src/componentes/prototipo/homelivre/HomeLivre.tsx` e `Secoes.tsx`;
- `testes/materiais-de-campo.test.ts` e `testes/semantica-formularios.test.ts`;
- a reconciliação JSON e este relatório.

O working tree já continha alterações locais da publicação, dos créditos, da
Home e do Território. Todas foram preservadas. Isso inclui os executores e
manifestos de publicação, ADR-018, consultas/componentes do Acervo, rotas,
dados territoriais, testes, 13 WebP de fichas e diretórios locais `.claude/`,
`docs/handoff/` e `tmp/`. O `git status` final é a lista autoritativa; não foi
feito stage.

## X. Estado Git final

Branch `exp/home-v2-territorio-vivo`, HEAD
`fdae0e6bf1bb0308f03ce8219d39699c76303a88`, com working tree sujo preservado.
Nenhum commit, push, Preview, Production, checkout de `main` ou deploy ocorreu.

## Y. Itens ainda pendentes e motivo concreto

1. **A03 acessível:** corrigir o Markdown fielmente e obter confirmação humana
   específica para publicar os dois nomes legíveis; só então criar o objeto
   complementar, sua relação de derivação, hash e URL.
2. **Proveniência física dos WebP:** definir plano de chaves e executor
   idempotente para 59 originais privados; hoje o manifesto é a prova da cadeia.
3. **Preservação D01:** repor na fonte canônica local os SVGs D01-04 e D01-06,
   mantendo os hashes históricos.
4. **Licença/autorização das duas fotos de terceiro:** questão jurídica
   documental registrada, sem bloquear a integridade técnica local nem remover
   os créditos aprovados.
5. **B01 editorial:** estudar agrupamento, filtro, miniaturas e expansão
   progressiva/paginação em tarefa própria, sem redesenho nesta rodada.

