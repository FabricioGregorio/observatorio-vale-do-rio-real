# Publicação do acervo — 2026-09-16

**Escopo:** 100 objetos públicos novos, em 15 documentos, sobre os 8 objetos da
[primeira publicação](./PRIMEIRA_PUBLICACAO_PUBLICA_2026-09-08.md).

**Domínio:** `https://acervo.observatoriotobiassoueu.com.br`
**Cache-Control:** `public, max-age=86400`, sem `immutable`.
**Executor:** `scripts/publicar-acervo.ts` — dry-run por padrão, upload e
persistência somente com `--executar`.
**Lote declarado:** `src/dados/lote-publicacao-2026-09-16.json`, validado por
`src/dados/lote-publicacao.ts`.

## A decisão que autorizou

Decisão humana de 2026-09-16: **todos os materiais da pesquisa dos quatro
lugares estão autorizados para publicação**; somente CPF, telefone e assinatura
exigiriam tratamento. As classificações anteriores — `RESTRITO`, `PENDENTE`,
`EM REVISÃO`, `ESPELHAVEL` — permanecem como histórico e deixaram de constituir
veto, porque eram consequência da regra anterior.

## Varredura de privacidade sobre o que foi publicado

33 arquivos com texto extraível — 21 PDFs, 8 transcrições e 4 planilhas —
varridos por CPF (com validação dos dígitos verificadores), telefone brasileiro
e marca textual de assinatura:

| Achado | Quantidade |
|---|---:|
| CPF | **0** |
| Telefone | **0** — os 8 candidatos são percentuais (`89.61038961`, `91.80722892`, …) na planilha de indicadores |
| Assinatura | **0** |

`relatorios/relatorio-tecnico-borda-da-mata.pdf` é digitalizado, com 7 imagens
JPEG e nenhuma camada de texto: a varredura textual não o alcança. A revisão
visual página por página é anterior a esta rodada e não foi repetida; como
verificação independente, a transcrição por leitura visual
(`derivados/a03-borda-da-mata-ocr.md`, 10.136 caracteres) foi varrida com o
mesmo critério e devolveu **0 achados**.

Os 58 derivados WebP foram conferidos byte a byte: nenhum contém `EXIF`,
`XMP`, `ICC_PROFILE`, `GPS` ou vestígio de dispositivo. O SVG publicado não
tem `<script>`, bloco de metadados nem `href` externo.

## Fotografias de campo (B01)

63 arquivos na fonte canônica, **59 conteúdos distintos**: quatro fotografias
existem em duas pastas com os mesmos bytes e foram publicadas uma única vez.

| Duplicata byte a byte | Caminho canônico adotado |
|---|---|
| `fotos/pedro-menezes/estufa.jpg` | `fotos/recanto-da-serra/estufa.jpg` |
| `fotos/pedro-menezes/foto-saindo-placa-volte-sempre.jpg` | `fotos/recanto-da-serra/volte-sempre.jpg` |
| `fotos/pedro-menezes/frente-museu-dona-maria.jpg` | `fotos/recanto-da-serra/museu-dona-maria.jpg` |
| `fotos/pedro-menezes/momento-conversando-com-pedro.jpg` | `fotos/recanto-da-serra/momento-da-entrevista-com-pedro-menezes.jpg` |

O derivado é produzido por `scripts/derivar-fotos-campo.py`: orientação EXIF
aplicada, largura máxima de 1280 px, WebP em qualidade 78 e método 6, sem
recorte e sem metadados. O SVG da Bodega dos Tropeiros é ilustração vetorial e
passa inteiro, sem recodificação. O manifesto completo — original, hash do
original, derivado, hash do derivado, lugar e transformação — fica em
`OBSERVATORIO_FONTES_DIR/derivados-publicos/B01/manifesto-b01.json`, fora do
Git como os demais derivados.

Treze desses derivados também servem às fichas da Home, em
`public/media/pesquisa/`, com os **mesmos bytes**: um script só, nunca duas
codificações.

## Proveniência física no banco

| Relação | Objetos | Como fica registrado |
|---|---:|---|
| Réplica de objeto privado | 3 | `replica_de_id` aponta a linha privada de mesmo SHA-256 (A02 integral, A04, D01-08) |
| Sem intermediário | 39 | upload direto da fonte canônica |
| Derivado sem origem registrável | 58 | `derivado_de_id` e `derivacao_metodo` nulos |

Os 58 derivados web não podem declarar `derivacao_metodo`: o CHECK
`arquivo_derivacao_completa` exige `derivado_de_id` junto, as fotografias
originais nunca foram espelhadas e criar uma linha de origem inexistente seria
fabricar prova. A cadeia original → derivado está no manifesto acima e nas
tabelas abaixo. **Pendência registrada:** espelhar os 59 originais no bucket
privado fecharia essa lacuna no banco, e depende de autorização própria.

## Incidente de vínculo, e a correção

A primeira execução resolveu o documento de destino por **posição de linha no
CSV** do inventário, tratando-a como `ordem_anexo`. As duas não coincidem:
`A11`, `B13` e `B14` foram acrescentados ao fim da planilha e no banco ocupam
as posições 11, 24 e 25. Resultado: **94 dos 100 vínculos** apontaram para o
documento errado — os 18 PDFs de indicadores foram parar em "Manual de marcas",
as 59 fotografias em "Anexo Técnico de Indicadores" — e cinco documentos fora
do lote foram promovidos junto. Nenhuma constraint acusou, porque ligar
qualquer arquivo a qualquer documento é válido para o schema.

Os cem objetos no R2 estavam corretos desde o início: chave, conteúdo, MIME e
hash foram conferidos por releitura autenticada antes de qualquer INSERT. O
erro foi exclusivamente relacional.

Correção em `scripts/corrigir-vinculos-publicacao.ts`, numa transação: 94
vínculos repostos por slug, 5 documentos devolvidos a `PENDENTE`/`rascunho`, 4
promovidos, 12 `principal` restaurados. `publicar-acervo.ts` passou a resolver
por `slugDoItem`, a mesma função que o espelhamento privado já usava.

## Contagem

| Controle | Antes | Depois |
|---|---:|---:|
| `documento` | 33 | **33** |
| `arquivo` | 18 | **118** |
| `documento_arquivo` | 18 | **118** |
| `vw_anexo_publico` | 8 | **108** |
| documentos `PUBLICAVEL` | 2 | **16** |
| arquivos privados | 10 | **10** |
| `pessoa` / `consentimento` | 0 / 0 | **0 / 0** |
| `vw_pendencia_publicacao` | 0 | **0** |

Os 100 novos: 3 relatórios integrais + 3 planilhas de formulário + 18
indicadores + 59 fotografias + 8 áudios + 8 transcrições + 1 peça D01-08.

## Conferência das URLs

As **108** URLs de `vw_anexo_publico` foram baixadas anonimamente: 108
respostas HTTP 200, com SHA-256, bytes, `Content-Type` e `Cache-Control`
conferindo em 108/108. Zero URLs `r2.dev` e zero endpoints S3.

## Idempotência

Reexecutar `publicar-acervo.ts --executar` reconheceu 100/100 objetos como
idênticos: zero `PutObject`, zero INSERT, zero promoção. Reexecutar a correção
moveu zero vínculos.

## Ressalvas registradas

- **Créditos de terceiro — resolvido.** Ver a seção "Fotografias de autoria de
  terceiro" abaixo. As duas continuam públicas, agora com crédito exibido.
- **A09 e A10** são "Formulário modelo" no inventário, e o que foi publicado
  são as **planilhas de respostas** das quais o instrumento seria
  reconstituído. A decisão humana autorizou publicar os arquivos existentes e
  proibiu versão agregada; o rótulo de cada arquivo diz o que ele é.
- **A02** ganhou o original integral **ao lado** do derivado redigido de
  2026-09-08, que conserva sua URL. Nenhuma evidência histórica foi apagada e
  nenhum link permanente foi quebrado.
- **`derivados/a03-borda-da-mata-ocr.md`**, a transcrição por leitura visual do
  relatório digitalizado, não entrou no lote: não estava na lista autorizada.
  Publicá-la tornaria o A03 legível por leitor de tela, e vale como proposta.


## Fotografias de autoria de terceiro

Decisão humana de 2026-09-16, posterior à publicação: as duas fotografias de
autoria de terceiro **permanecem públicas** e o crédito passa a ser
obrigatório. Não foram retiradas do Acervo nem reclassificadas como pendentes.

### Autoria conferida

A atribuição foi verificada nesta rodada. **A única fonte documental é o nome
do arquivo original.** Nenhum dos dois traz EXIF `Artist`, `Copyright` ou
`XPAuthor`, XMP `dc:creator` ou by-line IPTC — conferido com Pillow sobre os
originais. A auditoria de 2026-09-05
([`AUDITORIA_FONTES_2026-09-05.md`](../auditorias/AUDITORIA_FONTES_2026-09-05.md),
§"Crédito de terceiro embutido no nome do arquivo") já registrava os mesmos
dois nomes e os mesmos SHA-256, com a grafia `Dani-Santos` preservada. Não
existe forma mais completa a preservar.

| | Fotografia 1 | Fotografia 2 |
|---|---|---|
| Original | `fotos/diretor-turismo-sao-cristovao/marcio-ramos-foto-por-dani-santos.jpg` | `fotos/fundacao-cultura-sao-cristovao/paola-rodrigues-foto-por-iago-de-andrade-santos.jpeg` |
| SHA-256 do original | `fcd594b725cd5c649a3951ad49b2d5ba037520c4448c588ec0c24f2ab7826a29` | `e087ab565f743703006ef4596aba73130237c7f6747f3ddcc4b6abd7d1a682d3` |
| Autor | **Dani Santos** | **Iago de Andrade Santos** |
| Fonte da atribuição | nome do arquivo original; sem EXIF, XMP ou IPTC | idem |
| Derivado público | `b01-diretor-turismo-sao-cristovao-marcio-ramos-foto-por-dani-santos-v1.webp` | `b01-fundacao-cultura-sao-cristovao-paola-rodrigues-foto-por-iago-de-andrade-santos-v1.webp` |
| SHA-256 do derivado | `a22f0daed765d2b73eb0996c9b4df8e739850f96c0ddfbb8f4e17c5a3b982361` | `e6347cdb28f766eb8d3c35715ae0d7e538965f9799ee91c302985cc9fa8abb89` |
| URL | `…/arquivos/comprovacao-de-campo/b01-diretor-turismo-sao-cristovao-marcio-ramos-foto-por-dani-santos-v1.webp` | `…/arquivos/comprovacao-de-campo/b01-fundacao-cultura-sao-cristovao-paola-rodrigues-foto-por-iago-de-andrade-santos-v1.webp` |
| Documento / lugar | `fotografias-visitas-i-vii` (B01) · entrevista de São Cristóvão (B14) | `fotografias-visitas-i-vii` (B01) · entrevista de São Cristóvão (B05) |
| Crédito exibido | `Foto: Dani Santos` | `Foto: Iago de Andrade Santos` |

Os dois derivados não foram regerados: o SHA-256 de ambos é o mesmo de antes
da correção, e os objetos no R2 não foram tocados.

### Onde o crédito é guardado

Uma declaração só, em `scripts/derivar-fotos-campo.py`, com autor e fonte da
atribuição. Dali ela se propaga ao manifesto de B01, ao lote de publicação, ao
banco e às superfícies de exibição — nenhuma duplicação manual.

O modelo não tem campo de autoria por objeto físico: `documento.autoria` é da
obra inteira, e B01 é um documento com 59 fotografias. O crédito viaja então
dentro de `documento_arquivo.rotulo`, com separador declarado em
`src/dados/pesquisa/credito-fotografico.ts`; `montarRotulo` compõe e
`separarCredito` desfaz, e nenhum outro lugar escreve essa forma à mão.
A proposta de uma coluna própria `arquivo.credito_autoria` está na
[ADR-018](../decisoes/ADR-018-credito-de-autoria-de-arquivo.md), **em análise**
— mudar schema não é atribuição do agente.

Gravado por `scripts/gravar-creditos-fotograficos.ts`, em transação,
idempotente: `gravados=2` na primeira execução, `gravados=0` na segunda.
Nenhum hash, URL, classificação ou objeto de storage foi alterado.

### Onde o crédito aparece

| Superfície | Como |
|---|---|
| `/acervo` | linha própria sob o link, junto do tipo e do tamanho — fora do texto do link |
| `/prestacao-de-contas` (Sala do Avaliador) | linha própria sob o rótulo do arquivo |
| `/anexos.json` | campo `credito`, separado de `rotulo_arquivo` |
| Fichas da Home e do `/territorio` | `figcaption` discreto sob a imagem, nunca sobre a área principal |

As duas não estão hoje no recorte de fotografias das fichas — ele cobre Recanto
da Serra e Borda da Mata, e elas são de São Cristóvão. O caminho existe e está
coberto por teste: se alguma entrar num recorte, entra com o crédito junto.
`testes/credito-fotografico.test.ts` garante que nenhuma superfície exiba a
fotografia sem a atribuição que outra já conhece.

## Inventário publicado, por documento

"Origem" é o caminho relativo a `OBSERVATORIO_FONTES_DIR`; nas fotografias, é o
original e seu hash, dos quais o derivado publicado foi produzido.

### relatorio-tecnico-recanto-da-serra
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| A02 — relatório técnico integral | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | `18b7bbb11b6157af525c7e1c88b7e385763dadc094bb60fdf6f3a27d9c2aff91` | 602.121 | application/pdf | — |
| A02 | `publicação de 2026-09-08` | `b314cd7a5330276ecccc0c7cfe7dfe6461da721055318c15957db5cd7848961a` | 756.239 | application/pdf | — |

### relatorio-tecnico-borda-da-mata
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| A03 — relatório técnico integral | `relatorios/relatorio-tecnico-borda-da-mata.pdf` | `6dfef47006ed97133c8fef2ce0b935643c7955efbc7abaece2bcc9b0edcfea2e` | 2.424.406 | application/pdf | sim |

### relatorio-tecnico-serra-dos-macacos
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| A04 — relato técnico integral | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` | `7e966429d1fccae8f7583ebc0fb6644c8f6393390e5a2a0d633cbe79a79a7cde` | 76.164 | application/pdf | — |

### formulario-rotina-de-funcionamento
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| A09 — respostas de rotina de funcionamento | `formularios/formulario-de-funcionamento-pedro-e-oviedo.xlsx` | `4e426325bf010a2914b7b459ea7b410e6150f4cfb0eb78e4a5da27f45b0e842c` | 25.726 | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | sim |

### formulario-publico-consumidor
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| A10 — respostas de visitantes, Borda da Mata | `formularios/formulario-borda-da-mata-respostas.xlsx` | `7c50c0291901ca39a5497f674a2a19b0efa7b56ea58d150a8a21835b329b6fd1` | 9.417 | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | — |
| A10 — respostas de visitantes, Recanto da Serra | `formularios/formulario-recanto-da-serra-respostas.xlsx` | `c69044128c52d12a2d0a7fdff847b1e025b016c8ec91dced653a25b125d9bcc7` | 17.609 | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | sim |

### anexo-indicadores-etapa-1
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| A11-00 — capa | `formularios/indicadores-observatorio/00-capa.pdf` | `c7bf054f79faabe5a7bf30337a10a3548bd8a787ac003b33a5094f0451c80bfb` | 114.854 | application/pdf | — |
| A11-01 — sumario | `formularios/indicadores-observatorio/01-sumario.pdf` | `9abde76705a04434767346f463f22ae63c9a94b463d0f94db9cca043be313efb` | 104.911 | application/pdf | — |
| A11-02 — painel executivo | `formularios/indicadores-observatorio/02-painel-executivo.pdf` | `fe093922ee93f8d12d5473a5dba04840d2d894a825931d30c04cde9fef8354a8` | 111.426 | application/pdf | — |
| A11-03 — indicadores solidaria | `formularios/indicadores-observatorio/03-indicadores-solidaria.pdf` | `442c7c490f64183364eaf1cad058c1c15854e785ad96bfabeff3ca331d5e71ec` | 117.571 | application/pdf | — |
| A11-04 — publico mensuracao | `formularios/indicadores-observatorio/04-publico-mensuracao.pdf` | `66f0f2e3d39957a2a129a1b64d694a93ca787d675cd5d733a5b77cc800392f6f` | 117.400 | application/pdf | — |
| A11-05 — serie mensal | `formularios/indicadores-observatorio/05-serie-mensal.pdf` | `151e952509e52ee07b820098f307a59ad46a5f4a4a7a0c4b2890b92eb951d206` | 93.901 | application/pdf | — |
| A11-06 — pessoas trabalho | `formularios/indicadores-observatorio/06-pessoas-trabalho.pdf` | `9c7b74200941d2b77b820311621f5151312dd6eab3096260997fc3b9d6fb0811` | 203.310 | application/pdf | — |
| A11-07 — localidades | `formularios/indicadores-observatorio/07-localidades.pdf` | `332048e0de36549ab5a14ef9d8c22d94296de890935537c7fdc55f62012e2916` | 104.978 | application/pdf | — |
| A11-08 — fornecedores | `formularios/indicadores-observatorio/08-fornecedores.pdf` | `202afd35cce33009cc02fc3cf9ab3a925ec795d0c41e4c803dd97d99c49d9e6f` | 113.992 | application/pdf | — |
| A11-09 — atividades | `formularios/indicadores-observatorio/09-atividades.pdf` | `0720f4a1af36ee071e351756805d8ca5df7fd2bb0ebf13b0af17931b27af774a` | 99.244 | application/pdf | — |
| A11-10 — conciliacao | `formularios/indicadores-observatorio/10-conciliacao.pdf` | `3d0cd369c270ab24d67aa0e2aa6800fb83c41f6b31eb77171408015ddac44fc1` | 110.181 | application/pdf | — |
| A11-11 — nota metodologica | `formularios/indicadores-observatorio/11-nota-metodologica.pdf` | `21f508407c67f47a4e5518aa8b21a8961a13f6d0bbc15ff83392ef1619714ece` | 122.618 | application/pdf | — |
| A11-12 — perfil visitantes | `formularios/indicadores-observatorio/12-perfil-visitantes.pdf` | `ec9401bfacb0799bbcf2e81ed7e2f08686cc04e765f8bdcb4f7dc0cfb957a996` | 129.159 | application/pdf | — |
| A11-13 — motivacao atividades | `formularios/indicadores-observatorio/13-motivacao-atividades.pdf` | `01d83183cbba0d7b04b746340bfca5b846d0af7a819a74893e53d39f74eaa8e3` | 125.018 | application/pdf | — |
| A11-14 — consumo percepcao | `formularios/indicadores-observatorio/14-consumo-percepcao.pdf` | `bb412a77600037470ea2b70c03d26c72fc37c2a9d2138cdf148e764fb1f9263e` | 121.366 | application/pdf | — |
| A11-15 — grupos institucionais | `formularios/indicadores-observatorio/15-grupos-institucionais.pdf` | `d38ec73b859f58fc373bc732da7ca603a06d3d40d4e8022ea35d3da6996e737e` | 115.818 | application/pdf | — |
| A11-16 — dicionario dados | `formularios/indicadores-observatorio/16-dicionario-dados.pdf` | `1b08e39983184fc4e8e4636a86e1a66eb119f96675a5e009a2c3101d9454dbcd` | 134.633 | application/pdf | — |
| A11 — planilha de indicadores, 17 abas | `formularios/indicadores-observatorio/anexo-indicadores-observatorio-pnab-estatico-final.xlsx` | `10143117a960f3a07a84d3f798029d1490399b90b6276e42763d6c5f7b52c7b1` | 530.387 | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet | sim |

### fotografias-visitas-i-vii
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B01 · centro-cultural-museu-borda-da-mata/conversa-com-oviedo-dentro-da-casa-de-taipa.heic | `fotos/centro-cultural-museu-borda-da-mata/conversa-com-oviedo-dentro-da-casa-de-taipa.heic · sha 73d9aa2fddc8` | `956a2b46500cc70a7c19d64940d898c0b895d82d37b13d32bf1ad6caf45bf483` | 147.416 | image/webp | — |
| B01 · centro-cultural-museu-borda-da-mata/conversa-com-oviedo-e-neide-abreu.heic | `fotos/centro-cultural-museu-borda-da-mata/conversa-com-oviedo-e-neide-abreu.heic · sha 07667308b11f` | `dca36525a8de1830c93cdebad6c33093349df5adf4120e5a0a296270ba29350a` | 128.346 | image/webp | — |
| B01 · centro-cultural-museu-borda-da-mata/espaco-do-historiador.heic | `fotos/centro-cultural-museu-borda-da-mata/espaco-do-historiador.heic · sha b694b08c5e06` | `09261f487965a78e5e59e37c2704cf80339ed2a36fa50abcd98a534ad93266e6` | 244.998 | image/webp | — |
| B01 · centro-cultural-museu-borda-da-mata/frente-casa-de-taipa.heic | `fotos/centro-cultural-museu-borda-da-mata/frente-casa-de-taipa.heic · sha e56e29065948` | `76764cded8d50330a5362c4ece3efaa765e5c82d5e3311ee8214b4474377df43` | 490.166 | image/webp | — |
| B01 · centro-cultural-museu-borda-da-mata/frente-do-museu-borda-da-mata.heic | `fotos/centro-cultural-museu-borda-da-mata/frente-do-museu-borda-da-mata.heic · sha a34d4858b111` | `4f17d17521069bd33986ae3e593f9ada5404d06a7cc4b01524e2e29e5756aae8` | 230.346 | image/webp | — |
| B01 · centro-cultural-museu-borda-da-mata/geladeira-em-conversa-com-discos-e-cds-dentro.heic | `fotos/centro-cultural-museu-borda-da-mata/geladeira-em-conversa-com-discos-e-cds-dentro.heic · sha 4cfec584e3a0` | `bfc7dafa09ab388eb8876584ea2d7f72a71df019ef31f119dfc79fef0a8ad0a2` | 203.762 | image/webp | — |
| B01 · centro-cultural-museu-borda-da-mata/lhucas-concedendo-entrevista-a-pedro.heic | `fotos/centro-cultural-museu-borda-da-mata/lhucas-concedendo-entrevista-a-pedro.heic · sha 2131371f46e3` | `5ef68cc44a6465bbf5b6a2b76e3fa0ceb5fc0e61fc200b41780c589c3e633932` | 292.738 | image/webp | — |
| B01 · dilson-de-agripino/durante-entrevista.jpg | `fotos/dilson-de-agripino/durante-entrevista.jpg · sha fdeca688498f` | `66346054c81343e61045d812334ed88e42fd6199b053dd3e212dccfcfdd296ce` | 132.664 | image/webp | — |
| B01 · dilson-de-agripino/equipe-e-dilson.jpg | `fotos/dilson-de-agripino/equipe-e-dilson.jpg · sha 3b11088b4654` | `627ac3d2aff41b514a2fa082c3892e619f361821390f809d4b57e89fc467fd6a` | 179.474 | image/webp | — |
| B01 · dilson-de-agripino/equipe-e-dilson2.jpg | `fotos/dilson-de-agripino/equipe-e-dilson2.jpg · sha bc264f4e7321` | `9598b6a1a265a78a56737898f5fc7a37bf5897a83b21a82e1a37e31da68ceb9d` | 176.508 | image/webp | — |
| B01 · dilson-de-agripino/inicio-da-entrevista.jpg | `fotos/dilson-de-agripino/inicio-da-entrevista.jpg · sha a51054802c98` | `d450695804dcca817b3fbc349dae377b29aa0ea32af8718e0f98e77e6d55cf90` | 160.538 | image/webp | — |
| B01 · dilson-de-agripino/momento-antes-da-entrevista-com-dilson.jpg | `fotos/dilson-de-agripino/momento-antes-da-entrevista-com-dilson.jpg · sha f77930e40a06` | `ab00367339f53b17a5c46d82e0a6ad5c0b0007ebbcff5a4cb3a28bbd61a839f5` | 192.542 | image/webp | — |
| B01 · dilson-de-agripino/momento-pos-entrevista.jpg | `fotos/dilson-de-agripino/momento-pos-entrevista.jpg · sha bfc3d09528ac` | `50d44fe615a26e72cff7f5305ba706afdc80575e8ffe48f491c415ee6d1653ea` | 103.326 | image/webp | — |
| B01 · diretor-turismo-sao-cristovao/marcio-ramos-foto-por-dani-santos.jpg — Foto: Dani Santos | `fotos/diretor-turismo-sao-cristovao/marcio-ramos-foto-por-dani-santos.jpg · sha fcd594b725cd` | `a22f0daed765d2b73eb0996c9b4df8e739850f96c0ddfbb8f4e17c5a3b982361` | 67.276 | image/webp | — |
| B01 · fundacao-cultura-sao-cristovao/paola-rodrigues-foto-por-iago-de-andrade-santos.jpeg — Foto: Iago de Andrade Santos | `fotos/fundacao-cultura-sao-cristovao/paola-rodrigues-foto-por-iago-de-andrade-santos.jpeg · sha e087ab565f74` | `e6347cdb28f766eb8d3c35715ae0d7e538965f9799ee91c302985cc9fa8abb89` | 73.820 | image/webp | — |
| B01 · ilha-grande/arvores-preservadas.png | `fotos/ilha-grande/arvores-preservadas.png · sha 088874e85a37` | `0020df753e0fdaa905a6d99a6a39b2d293d9053789eea625012aa4eadac05db3` | 89.614 | image/webp | — |
| B01 · ilha-grande/cais-ou-pier-ilha-grande.png | `fotos/ilha-grande/cais-ou-pier-ilha-grande.png · sha 188ae9071d1c` | `6683fb1348891399d61046f32df1e38a680ba050cbd97a362ae435a29fee1f8e` | 35.500 | image/webp | — |
| B01 · ilha-grande/campo-verde-de-grama-e-arvores.png | `fotos/ilha-grande/campo-verde-de-grama-e-arvores.png · sha defb34f4f875` | `0ae97eadadf94f23c6e1fbb50f7d3f2bb8583e43ea97d2f21c5e97efae9034f9` | 85.970 | image/webp | — |
| B01 · ilha-grande/chegando-a-ilha-grande-de-barco.png | `fotos/ilha-grande/chegando-a-ilha-grande-de-barco.png · sha 00415cefdbd2` | `0e14cb19abe159a875b5bfe6486d6591cfc9a24d4ef19115ea7daa19c5421ab0` | 30.226 | image/webp | — |
| B01 · ilha-grande/dona-mada.png | `fotos/ilha-grande/dona-mada.png · sha 2272f64414f5` | `349c2879540a0c76ad007bc0d52463ebe34b7515ec0708ba11ee93f041fcf045` | 13.818 | image/webp | — |
| B01 · ilha-grande/forno-a-lenha.png | `fotos/ilha-grande/forno-a-lenha.png · sha f9218275a210` | `b269d5763ab2d8c673caa80ac2020d08d1e19e6561cd7a28946fa15e1d28f61c` | 41.888 | image/webp | — |
| B01 · ilha-grande/forno-a-lenha2.png | `fotos/ilha-grande/forno-a-lenha2.png · sha 25475b5fa02d` | `a12b913038fbea7c215eec856d05349ac3ac778735abe58c5cb8fa81591521fd` | 39.102 | image/webp | — |
| B01 · ilha-grande/igrejinha.jpg | `fotos/ilha-grande/igrejinha.jpg · sha 2746986d0351` | `9d0ab7a31168856140ef35d0b5b6d56dbf7d46948c3d09397feeb8d95e6078c5` | 223.968 | image/webp | — |
| B01 · ilha-grande/placa-bem-vindos-a-pedreiras.jpg | `fotos/ilha-grande/placa-bem-vindos-a-pedreiras.jpg · sha 5fa96abae987` | `8e4beb2c284e7ec1aea9a98d576fa46ce3021db47b76a39b77cf30bd4f148ce3` | 149.636 | image/webp | — |
| B01 · ilha-grande/rio.png | `fotos/ilha-grande/rio.png · sha a8ce4e12de35` | `be134855802bb381130ff605d3c26773286830337bd74e96ea34acc997965a38` | 25.012 | image/webp | — |
| B01 · josenilson-bispo/antes-da-entrevista.jpg | `fotos/josenilson-bispo/antes-da-entrevista.jpg · sha 57988d915c2e` | `93d8b8aa670e30a8cbde20c3ce0a8086977ec809895ab15a467d1d7f9a3d270f` | 224.456 | image/webp | — |
| B01 · josenilson-bispo/antes-da-entrevista2.jpg | `fotos/josenilson-bispo/antes-da-entrevista2.jpg · sha 4ed98b551fa8` | `add716346c5a5b9b6e184a263f5438fafefc5d4915510a51b2d73295d1a318aa` | 171.630 | image/webp | — |
| B01 · josenilson-bispo/biblioteca-da-sala-de-nilsinho-com-equipe-lendo-e-pegando-livros.jpg | `fotos/josenilson-bispo/biblioteca-da-sala-de-nilsinho-com-equipe-lendo-e-pegando-livros.jpg · sha a7957e24b923` | `55bb1ef03f1d403baaa1165fc8d1e90858e68cf393194ef9a856d1859b01c9b0` | 277.728 | image/webp | — |
| B01 · josenilson-bispo/bodega-dos-tropeiros-e-mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg | `fotos/josenilson-bispo/bodega-dos-tropeiros-e-mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg · sha 8affa12b68f5` | `e0680a55ba607fb14688743795c8add282f2163597751380ef5e00e22c962d81` | 40.618 | image/webp | — |
| B01 · josenilson-bispo/bodega-dos-tropeiros-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg | `fotos/josenilson-bispo/bodega-dos-tropeiros-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg · sha c2b1b977c2d7` | `e758a6ca8e0e402ee283a7c5c5747497ab4f76a3891db48d3cc61e25649045ec` | 96.412 | image/webp | — |
| B01 · josenilson-bispo/foto-com-todos-pos-entrevista.jpg | `fotos/josenilson-bispo/foto-com-todos-pos-entrevista.jpg · sha 55714162d35a` | `786bda666018d775b212d4457e898e10c5945fc109bcfc5189c14d22e222a99a` | 252.184 | image/webp | — |
| B01 · josenilson-bispo/foto-durante-entrevista.jpg | `fotos/josenilson-bispo/foto-durante-entrevista.jpg · sha 31580765c00e` | `63d344b855377c22ee675badda328a17af5c45302b9b7017150ea3a2cbe00e76` | 162.874 | image/webp | — |
| B01 · josenilson-bispo/foto-durante-entrevista2.jpg | `fotos/josenilson-bispo/foto-durante-entrevista2.jpg · sha f5c9a4adf29c` | `d47021ab565aa67301d4555f0bcfa7c5e320fd34430c89f90c84078171418e24` | 333.294 | image/webp | — |
| B01 · josenilson-bispo/mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg | `fotos/josenilson-bispo/mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg · sha f353f09372a9` | `b8a9bce0561eeec69230a6535764f401e2bfdb5aba2d5e3f5b066c7fddff19b8` | 84.652 | image/webp | — |
| B01 · josenilson-bispo/nilsinho-apresentando-mural-do-memorial-tobias-barreto.jpg | `fotos/josenilson-bispo/nilsinho-apresentando-mural-do-memorial-tobias-barreto.jpg · sha 336b683851d0` | `77f140d4ffbf5e13f4d0cfe71eb8b7bed77c1990ac6664133ed9faaa07292537` | 126.510 | image/webp | — |
| B01 · josenilson-bispo/nilsinho-mostrando-banner-do-tobiarte.jpg | `fotos/josenilson-bispo/nilsinho-mostrando-banner-do-tobiarte.jpg · sha 1e380f6d77ef` | `27ab4e6ec19e360a8ed7f9c48322bc9c9c6d8e1970415f3d4b0967406a881291` | 209.120 | image/webp | — |
| B01 · josenilson-bispo/nilsinho-mostrando-banner-do-tobiarte2.jpg | `fotos/josenilson-bispo/nilsinho-mostrando-banner-do-tobiarte2.jpg · sha da4c81fe7873` | `0cbbc7f642bcc5c9b7188b724f1438d07ab165ff6f5ed7b418762e9024da2bcf` | 243.572 | image/webp | — |
| B01 · josenilson-bispo/nilsinho-mostrando-banner-do-tobiarte3.jpg | `fotos/josenilson-bispo/nilsinho-mostrando-banner-do-tobiarte3.jpg · sha f91edb27f52d` | `c645b76b7459264b4d526c2d117a9edb5bb0d7b1b31e79788c8a8e7f609263cb` | 142.406 | image/webp | — |
| B01 · laerte-aguiar/equipe-com-laerte-aguiar.heic | `fotos/laerte-aguiar/equipe-com-laerte-aguiar.heic · sha d9e9b4b650cf` | `4700218a4cfc2fdd35fe5e207c717297e4571cafa35dc25ddb77d1e665516725` | 395.042 | image/webp | — |
| B01 · laerte-aguiar/equipe-com-laerte-aguiar2.heic | `fotos/laerte-aguiar/equipe-com-laerte-aguiar2.heic · sha 2ea1bdf3bf7d` | `3eb726e8a03edf60972e265da244b347d771c237d58bf5f83c53494e272d1c77` | 362.472 | image/webp | — |
| B01 · laerte-aguiar/equipe-com-laerte-aguiar3.heic | `fotos/laerte-aguiar/equipe-com-laerte-aguiar3.heic · sha 783ecfe59d79` | `185691ffedc857c8ba87aa4dcfbe1e884b57f6fa1a881ed03a7ae9c99c7ce8cf` | 588.906 | image/webp | — |
| B01 · laerte-aguiar/equipe-com-laerte-aguiar4.heic | `fotos/laerte-aguiar/equipe-com-laerte-aguiar4.heic · sha 4428658e2363` | `e261549b396a4a5ae5c94e190d6371dca71ff6df27df5a5bfe82d65d735a79bc` | 181.750 | image/webp | — |
| B01 · laerte-aguiar/equipe-com-laerte-aguiar5.heic | `fotos/laerte-aguiar/equipe-com-laerte-aguiar5.heic · sha 8ce4e25eecd1` | `7afa4c7af8657846839af1e72d602221ae214563f34ebb10c99ddf1ca326f0c2` | 179.648 | image/webp | — |
| B01 · pedro-menezes/budega-dos-tropeiros-por-dentro.jpg | `fotos/pedro-menezes/budega-dos-tropeiros-por-dentro.jpg · sha 0560f013200e` | `6c16546d7962e2c2ef1f870194e92010ffa235cccac5b5d0097e9cfc2e8f3d29` | 373.114 | image/webp | — |
| B01 · pedro-menezes/chegada-ao-recanto-placa-oxente-nao-se-avexe-nao.jpg | `fotos/pedro-menezes/chegada-ao-recanto-placa-oxente-nao-se-avexe-nao.jpg · sha 37cf8d2ee72d` | `6f245b4e427ef7869e6f52f458de916be9200bdb2ec85157a856079f19218b7f` | 799.216 | image/webp | — |
| B01 · pedro-menezes/conhecendo-o-museu-e-memorial-epifanio-doria.heic | `fotos/pedro-menezes/conhecendo-o-museu-e-memorial-epifanio-doria.heic · sha fa8e01be6792` | `21cd06e76d998a4c3433e289961d6b583757988fcb8ec9b77d7b0dc2ebbd649d` | 198.960 | image/webp | — |
| B01 · pedro-menezes/frente-budega-dos-tropeiros.jpg | `fotos/pedro-menezes/frente-budega-dos-tropeiros.jpg · sha b481c5dcf04a` | `c14c2a31fec66280751ca37ea01f56e72acae49fad1f0ed17a55e1b623be9e06` | 489.984 | image/webp | — |
| B01 · pedro-menezes/igreja-com-pedras-coruba-vista-de-longe.jpg | `fotos/pedro-menezes/igreja-com-pedras-coruba-vista-de-longe.jpg · sha 49eae7a69266` | `6538be4481e654e51672f969d10ed0acbf04f571c238d98209174148f43cdeea` | 413.100 | image/webp | — |
| B01 · pedro-menezes/momento-conversando-com-pedro2.heic | `fotos/pedro-menezes/momento-conversando-com-pedro2.heic · sha 34693372f4d5` | `90769d850457086079322446334b0b590ccde0172abf515975b1307c4e6e7cc6` | 457.038 | image/webp | — |
| B01 · pedro-menezes/visita-a-mensagem-de-silo2.heic | `fotos/pedro-menezes/visita-a-mensagem-de-silo2.heic · sha 15231a6d695e` | `6d57a380f4fc14cb9d8e2c4a7b8a18a18ad729374049648d3e2bebf8ecebe2de` | 170.588 | image/webp | — |
| B01 · pedro-menezes/visita-da-equipe-com-oviedo-e-neide-ao-recanto-da-serra.heic | `fotos/pedro-menezes/visita-da-equipe-com-oviedo-e-neide-ao-recanto-da-serra.heic · sha b2273bfd331f` | `c8ed8a4a0afde92a4ffee2e9e42c91be8e3a43263cdcff2e2f5e447c1a3a7aab` | 149.962 | image/webp | — |
| B01 · pedro-menezes/visita-na-mensagem-de-silo.png | `fotos/pedro-menezes/visita-na-mensagem-de-silo.png · sha 7deb206e317a` | `dff74fdf4595bbdde5786246b1480b6f08e60a421064691980db0deca136469b` | 278.658 | image/webp | — |
| B01 · recanto-da-serra/bodega dos tropeiros.svg | `fotos/recanto-da-serra/bodega dos tropeiros.svg · sha 13d14523624c` | `13d14523624cfe0a7505962282b59032f13d7a039c822cda0d0b710940c5d758` | 680.838 | image/svg+xml | — |
| B01 · recanto-da-serra/estufa.jpg | `fotos/recanto-da-serra/estufa.jpg · sha e0a4bfd7d256` | `4d8b8c55f910b29744f0bfb3e88129a270c1d2ac71065293d80d29bfa2a9c2e5` | 720.856 | image/webp | — |
| B01 · recanto-da-serra/momento-da-entrevista-com-pedro-menezes.jpg | `fotos/recanto-da-serra/momento-da-entrevista-com-pedro-menezes.jpg · sha 2ce1b14f688c` | `99082ca58728d2a7dd199773cd8fa603943ae5324673aae6bc4134c2cd37eeea` | 542.130 | image/webp | — |
| B01 · recanto-da-serra/museu-dona-maria.jpg | `fotos/recanto-da-serra/museu-dona-maria.jpg · sha 832eaeeb9265` | `bbd15b96102018e871ac18152f74e849bb375e6d3b47652105e18aaf1fd4290a` | 584.608 | image/webp | — |
| B01 · recanto-da-serra/por dentro da budega.jpg | `fotos/recanto-da-serra/por dentro da budega.jpg · sha 4c10ee676dbf` | `5d2ac9e6b4b627ef5329d3687933021f6483d3d54a42219039d950d3da4f24f3` | 231.480 | image/webp | — |
| B01 · recanto-da-serra/recanto-da-serra.png | `fotos/recanto-da-serra/recanto-da-serra.png · sha 6bc9b831dd4a` | `8a27ae3d13304738a6ea19b83212e2ef375279d8126d4e30b90bf545aee7ff62` | 382.474 | image/webp | — |
| B01 · recanto-da-serra/volte-sempre.jpg | `fotos/recanto-da-serra/volte-sempre.jpg · sha fb03f333043f` | `dba7a217cde8d74e3c7af710e97d96cb714c05c5923b2f360fbc55e545f52dfc` | 337.516 | image/webp | — |

### entrevista-josenilson-bispo
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B02 — áudio da entrevista | `entrevistas/01-josenilson-bispo/audio/entrevista-01-josenilson-bispo-audio.m4a` | `d38e9c437bde2bb5dfe8aea7caa45252632f3710371512668ec988dbd52bf1a6` | 25.807.110 | audio/mp4 | — |
| B02 — transcrição da entrevista | `entrevistas/01-josenilson-bispo/transcricao/entrevista-01-josenilson-bispo-transcricao.pdf` | `5f5a7bed432d59afa5c14854e7203cf53e398a868f050906bce0a601b66cb05d` | 184.212 | application/pdf | sim |

### entrevista-oviedo-e-neide-abreu
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B03 — áudio da entrevista | `entrevistas/02-oviedo-e-neide-abreu/audio/entrevista-02-oviedo-e-neide-abreu-audio.m4a` | `c3dc21fb6ee35a744a38405665a8964ecb7d807f6bff9f898bd255107be98842` | 67.404.241 | audio/mp4 | — |
| B03 — transcrição da entrevista | `entrevistas/02-oviedo-e-neide-abreu/transcricao/entrevista-02-oviedo-e-neide-abreu-transcricao.pdf` | `6f4e97ccbe63baa006db10f41bcfa0fa33a83e4a7e771c8af3002c4419ec80b4` | 165.322 | application/pdf | sim |

### entrevista-pedro-menezes
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B04 — áudio da entrevista | `entrevistas/05-pedro-menezes/audio/entrevista-05-pedro-menezes-audio.m4a` | `d7096363ae4541aaf62bc9dea7bf284f811b3a93daec30e9ec1c9ff8dd68f952` | 13.527.879 | audio/mp4 | — |
| B04 — transcrição da entrevista | `entrevistas/05-pedro-menezes/transcricao/entrevista-05-pedro-menezes-transcricao.pdf` | `8e6e8fbf17e7c9c5e6c92e6806efe6929f5be69604e29f9a41db17b441f58f72` | 42.058 | application/pdf | sim |

### entrevista-paola-santana
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B05 — áudio da entrevista | `entrevistas/03-fundacao-cultura-sao-cristovao/audio/entrevista-03-fundacao-cultura-sao-cristovao-audio.m4a` | `ed04a253db99136db3f246c13762bd3ff5af80eb936d97ef0c2449475507267c` | 30.529.930 | audio/mp4 | — |
| B05 — transcrição da entrevista | `entrevistas/03-fundacao-cultura-sao-cristovao/transcricao/entrevista-03-fundacao-cultura-sao-cristovao-transcricao.pdf` | `53fca08161a64576823d88fb5fb4fbe87ebe6e4c09b822073aeb0c34048d77a2` | 196.060 | application/pdf | sim |

### entrevista-lideranca-ilha-grande
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B06 — áudio da entrevista | `entrevistas/08-dona-mada/audio/entrevista-08-dona-mada-audio.mp3` | `df2e5be42f5cc3c1873d06cf93639e58fd5891edc2732b09d2ba7dd9949df2b9` | 108.037.440 | audio/mpeg | — |
| B06 — transcrição da entrevista | `entrevistas/08-dona-mada/transcricao/entrevista-08-dona-mada-transcricao.pdf` | `3b4cc0955235381701dbd0a6ef0cb7afc558862b57b9fb4bd0fad25ed2f0d2b5` | 49.574 | application/pdf | sim |

### entrevista-prefeito-tobias-barreto
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B08 — áudio da entrevista | `entrevistas/06-dilson-de-agripino/audio/entrevista-06-dilson-de-agripino-audio.m4a` | `21d16759e58f1de0f3a798bbcf537fc22b0ff7ee586a91486795e86f6fff8baf` | 19.221.297 | audio/mp4 | — |
| B08 — transcrição da entrevista | `entrevistas/06-dilson-de-agripino/transcricao/entrevista-06-dilson-de-agripino-transcricao.pdf` | `7fc8a49543c1cc8d2b48527d7b6633768481724af3d7f2f8996157fec79eb0f2` | 161.064 | application/pdf | sim |

### entrevista-laerte-aguiar
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B13 — áudio da entrevista | `entrevistas/07-laerte-aguiar/audio/entrevista-07-laerte-aguiar-audio.mp3` | `ef4ff053498e062a786f9de306104d42c19f4270dd50c253ed2be083c997a2df` | 37.324.362 | audio/mpeg | — |
| B13 — transcrição da entrevista | `entrevistas/07-laerte-aguiar/transcricao/entrevista-07-laerte-aguiar-transcricao.pdf` | `77476608e851b794a762e082e1ff60affd1fcc4dfb5f1978641246771f0142ea` | 291.096 | application/pdf | sim |

### entrevista-marcio-andre
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| B14 — áudio da entrevista | `entrevistas/04-diretor-turismo-sao-cristovao/audio/entrevista-04-diretor-turismo-sao-cristovao-audio.m4a` | `396e60c5e2c3ee020eca7514e7c52a95bc11eb5a1ae1a57f989a0a07b2c739f8` | 57.624.686 | audio/mp4 | — |
| B14 — transcrição da entrevista | `entrevistas/04-diretor-turismo-sao-cristovao/transcricao/entrevista-04-diretor-turismo-sao-cristovao-transcricao.pdf` | `69edb10d5629f8bc0a4ee35928c02e418902df36a4a82adef188179511b91b29` | 158.236 | application/pdf | sim |

### identidade-visual
| rótulo | origem | SHA-256 do publicado | bytes | MIME | principal |
|---|---|---|---:|---|---|
| D01-01 | `publicação de 2026-09-08` | `b8842594544c579a9fc508a912b9a913030013eb6de16704a007c7fefcc323f5` | 257.102 | image/png | — |
| D01-02 | `publicação de 2026-09-08` | `882810f458c2bb92d51c24dad691bb2553d0373125e70884e25856571ca2f551` | 12.943.416 | application/pdf | — |
| D01-03 | `publicação de 2026-09-08` | `a52ccb2202f19b93e383e22295ff68e781ba3dbb5403983168c40b47c332659e` | 129.763 | image/png | — |
| D01-04 | `publicação de 2026-09-08` | `8bda07efbe684aaae64cb28ff3b69b10cb572058aa9c4dfb04dbb670c6cef1dc` | 31.520 | image/svg+xml | — |
| D01-05 | `publicação de 2026-09-08` | `ec8c13aee802c5baaac15a11a5c8813ff5cb6733107bcae6c9c82dd79b6426a4` | 100.975 | image/png | — |
| D01-06 | `publicação de 2026-09-08` | `f19d71e2ed22bfc1aac44be4760a07517d1f88cb2186cf6b59cdcbfa97d11883` | 704.574 | image/svg+xml | — |
| D01-07 | `publicação de 2026-09-08` | `9af5c7b249456496cf0a6a66a67a4262c1959be04eed93f9197ec02fc9e25846` | 400.824 | image/png | — |
| D01-08 | `identidade-visual/observatorio/primeiro-post-observatorio.pdf` | `3721a0e64c4ecf3e928206e5f9f9c1042303c2c5e9f205e38e9b095f85dcfdfe` | 35.599.475 | application/pdf | — |
