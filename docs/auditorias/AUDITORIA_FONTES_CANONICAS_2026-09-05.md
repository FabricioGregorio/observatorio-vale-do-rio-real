# Auditoria da fonte canônica atual — `observatorio-fontes/`

**Data:** 2026-09-05 · **Etapa:** Prompt 2.2, §6 em diante
**Corpus:** 138 arquivos, fonte canônica local

Não substitui nem corrige retroativamente o `AUDITORIA_FONTES_2026-09-05.md`,
que permanece como **fotografia histórica do acervo anterior de 72 arquivos**.
As duas convivem e as divergências entre elas estão declaradas abaixo.

Não contém trecho de consentimento, nome de trabalhador remunerado, resposta
individual de formulário, conteúdo de transcrição nem foto.

---

## 1. Validação da fonte (§22)

| Verificação | Resultado |
|---|---|
| Caminho | vem de `OBSERVATORIO_FONTES_DIR`; fora do repositório |
| Total de arquivos | **138** |
| Total de bytes | **608.281.472** (580.1 MB) |
| Hashes distintos | 138 |
| Hashes alterados desde a movimentação | **0** |
| Arquivos perdidos | **0** |
| Colisões | **0** |
| Fonte dentro do Git | **NÃO** |

| Pasta | Arquivos | Bytes |
|---|---:|---:|
| `entrevistas/` | 16 | 344.0 MB |
| `formularios/` | 21 | 2.5 MB |
| `fotos/` | 56 | 172.1 MB |
| `identidade-visual/` | 8 | 47.9 MB |
| `marcas/` | 34 | 10.6 MB |
| `relatorios/` | 3 | 3.0 MB |

## 2. Correção de estado: consentimento verbal gravado (§6)

Não existe termo separado de consentimento, e **não deve existir**: a
autorização foi obtida verbalmente no início de cada entrevista e está
registrada no áudio e na transcrição. A auditoria anterior registrou
"termo não localizado", o que era literalmente verdade e conceitualmente
enganoso. Esta seção corrige o enquadramento.

Nenhum PDF ou termo artificial foi criado. Nenhum trecho de consentimento foi
transcrito para o Git.

| # | `consentimento_tipo` | `evidencia_transcricao` | Localização aproximada | `evidencia_audio` |
|---|---|---|---|---|
| 01 | `verbal_gravado` | localizado | final da entrevista, ~48:03 e 51:30 (linhas 494 e 525 de 542) | presumida até conferência |
| 02 | `verbal_gravado` | localizado | abertura, 00:40–00:49 (linhas 16–26 de 449) | presumida até conferência |
| 03 | `verbal_gravado` | localizado | abertura, 00:00–00:30 (linhas 3–9 de 726) | presumida até conferência |
| 04 | `verbal_gravado` | localizado | abertura, 00:38–00:53 (linhas 17–23 de 379) | presumida até conferência |
| 05 | `verbal_gravado` | localizado | abertura, 00:39–00:48 (linhas 12–21 de 312) | presumida até conferência |
| 06 | `verbal_gravado` | localizado | abertura, ~01:54 (linhas 20–26 de 362) | presumida até conferência |
| 07 | `verbal_gravado` | localizado | abertura, 00:02–00:57 (linhas 10–16 de 313) | presumida até conferência |
| 08 | `verbal_gravado` | **não localizado** | pedido presente (linha 50 de 335), resposta afirmativa ausente | **exige conferência** |

**Consentimentos verbais verificados: 7/8.**

### Divergência — entrevista 08 (Dona Madá / Ilha Grande)

Situação: **evidência de consentimento verbal não localizada**.

O pedido de autorização **existe** na transcrição, feito pelo entrevistador.
A resposta afirmativa **não aparece**: a interlocutora segue o assunto
anterior e a transcrição não registra anuência. A entrevista é a única
classificada como informal, e a transcrição começa com a conversa já em
curso.

Conforme o §6, isso significa apenas que a evidência não foi localizada
**nesta auditoria**, e não que falte consentimento. A verificação seguinte é
ouvir o início do áudio — que não fiz, porque não transcrevo áudio.

### Observação de integridade — artefato de ferramenta na transcrição 08

A última linha da transcrição 08 não é fala de ninguém: é uma pergunta
gerada por ferramenta automática de transcrição, oferecendo destacar trechos
do áudio. Ela ficou dentro de um documento que é prova de execução do objeto.

Não editei o original. Registro para revisão humana: convém removê-la do
derivado, nunca do original.

## 3. Decisões humanas aplicadas (§7, §8)

Os três conflitos que a auditoria anterior deixou abertos **não eram
conflitos de identidade** — eram fragmentos do mesmo nome. A transcrição
resolve os dois primeiros por evidência direta.

| Caso | O que a auditoria anterior viu | O que a fonte canônica mostra | Situação |
|---|---|---|---|
| **B05 / entrevista 03** | inventário dizia *Paola Santana*; foto dizia *paola-rodrigues* | a própria entrevistada declara o nome completo: **Paola Rodrigues de Santana** | **reconciliado.** Não são duas pessoas; `paola-rodrigues` é nomenclatura histórica divergente do mesmo nome. Canônico: **Paola Santana** |
| **Entrevista 04** | transcrição dizia *Márcio André*; foto dizia *marcio-ramos* | o entrevistado declara: **Márcio André Soares Ramos** | **reconciliado.** `marcio-ramos` é divergência histórica de nomenclatura. Canônico: **Márcio André** |
| **B07 / entrevista 07** | inventário dizia Itabaianinha; pasta dizia Tomar do Geru | o secretário se identifica como **Secretário Municipal de Cultura de Tomar do Geru** | **vínculo antigo desatualizado.** Ver seção 4 |

Ian Victor Batista de Araújo participa da entrevista 04 e autoriza a gravação
na mesma abertura, mas **não é o entrevistado principal**: o cargo de Diretor
de Turismo é de Márcio André. Ian Victor permanece registrado como outra
pessoa presente.

### Nome canônico da entrevista 06

Achado novo: o prefeito declara **Dilson de Jesus Santos**. O arquivo de
transcrição e o uso corrente dizem *Dilson de Agripino*, que é como o
entrevistador o chama e como a entrevista 01 se refere às gestões. Não é
erro: são o mesmo nome em registro civil e em uso público. O slug físico
`06-dilson-de-agripino` foi mantido; o metadado canônico registra os dois.

## 4. B07 / Tomar do Geru (§8)

A entrevista 07 é **de Tomar do Geru**, declarado pelo próprio entrevistado
na abertura, com cargo. Não é de Itabaianinha.

Por que o inventário mantinha B07 como Itabaianinha: o inventário foi montado
a partir do Relatório Parcial e do documento de Links de Referência, **antes**
de a entrevista acontecer — B07 tem status `A confirmar` e nunca teve `Link
atual`. Era previsão de agenda, não registro de fato. A entrevista prevista
para Itabaianinha não foi realizada; a de Tomar do Geru foi, e não tinha item.

Proposta:

| Ação | Item |
|---|---|
| Criar item para a entrevista realizada | **B13 — Entrevista — Laerte Aguiar, Secretário Municipal de Cultura de Tomar do Geru** |
| Manter B07 | como **PENDENTE**, refletindo que a entrevista de Itabaianinha não ocorreu |

**Nenhum item de entrevista foi criado para Itabaianinha para preencher meta.**
A ausência continua refletindo a realidade.

## 5. Matriz canônica das 8 entrevistas (§9)

| # | Entrevistado principal | Nome canônico curto | Cargo/função comprovado | Município | Áudio | Transcr. | Consent. verbal | Código | Divergência histórica |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Josenilson Bispo dos Santos | Josenilson Bispo | Secretário de Cultura, Juventude e Turismo | Tobias Barreto | sim | sim | localizado | B02 | “Nilsinho” — apelido, mesmo nome |
| 02 | Oviêdo Abreu de Santana e Luzineide Maria de Jesus | Oviêdo e Neide Abreu | Dirigentes do Centro Cultural e Museu Borda da Mata | Tobias Barreto | sim | sim | localizado | B03 | `Oviedo` sem acento no disco |
| 03 | Paola Rodrigues de Santana | Paola Santana | Fundação de Cultura de São Cristóvão | São Cristóvão | sim | sim | localizado | B05 | `paola-rodrigues` em nome de foto |
| 04 | Márcio André Soares Ramos | Márcio André | Diretor de Turismo | São Cristóvão | sim | sim | localizado | **B14 (proposto)** | `marcio-ramos` em nome de foto |
| 05 | Pedro Corrêa de Menezes | Pedro Menezes | Ator-chave / Recanto da Serra | Tobias Barreto | sim | sim | localizado | B04 | — |
| 06 | Dilson de Jesus Santos | Dilson de Agripino | Prefeito | Tobias Barreto | sim | sim | localizado | B08 | dois nomes em uso, mesma pessoa |
| 07 | Laerte Santos Aguiar | Laerte Aguiar | Secretário Municipal de Cultura | Tomar do Geru | sim | sim | localizado | **B13 (proposto)** | inventário atribuía a Itabaianinha |
| 08 | Maria Madalena Santos | Dona Madá | moradora / memória local | Ilha Grande | sim | sim | **não localizado** | B06 | `Dona Mada` sem acento; data 11/04/2026 não confirmada |

### Outras pessoas presentes ou mencionadas

| # | Pessoa | Papel |
|---|---|---|
| 02 | Rivaldino Santos, Elias | presentes, dirigentes do museu |
| 04 | Ian Victor Batista de Araújo | presente, autoriza a gravação, **não** é o entrevistado principal |
| 07 | Mateus Cardoso Rita | presente, sacristão da paróquia, autoriza a gravação |
| todas | Galileu, Lhucas, Luiz/Luis Eduardo, Fabrício, Laura | equipe entrevistadora do Coletivo Cultural “Tobias, sou Eu!” |

### B06 reavaliado só pela fonte canônica (§7)

A entrevista 08 é a única de Ilha Grande no corpus; a interlocutora se
identifica pelo nome completo no primeiro minuto e o local é declarado no
título do documento. Isso sustenta o vínculo com **B06 — Entrevista,
liderança de Ilha Grande**.

Ressalvas que permanecem, agora por evidência e não por ambiguidade:

- **a data 11/04/2026 do inventário não é confirmada por nada** na fonte: a
  transcrição 08 não tem data e o nome do arquivo não a traz;
- o inventário chama de "liderança"; a fonte a descreve como moradora e
  guardiã de memória local, em entrevista informal. Não é contradição, mas
  também não é a mesma coisa.

Vínculo proposto: **B06, com data a confirmar.**

## 6. Relatórios técnicos (§10)

Os três são **arquivos distintos, com hashes distintos**. A distinção também
se sustenta pela estrutura interna, e não só pelo nome:

| Item | Arquivo | Páginas | Título interno | Texto extraível |
|---|---|---:|---|---|
| **A02** | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | 14 | RELATÓRIO TÉCNICO – RECANTO DA SERRA | sim, 15.578 caracteres |
| **A03** | `relatorios/relatorio-tecnico-borda-da-mata.pdf` | 7 | **não legível** | **não** |
| **A04** | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` | 4 | RELATO TÉCNICO SERRA DOS MACACOS | sim, 7.907 caracteres |

SHA-256:

- `relatorios/relatorio-tecnico-recanto-da-serra.pdf`  
  `18b7bbb11b6157af525c7e1c88b7e385763dadc094bb60fdf6f3a27d9c2aff91`  (602121 bytes)
- `relatorios/relatorio-tecnico-borda-da-mata.pdf`  
  `6dfef47006ed97133c8fef2ce0b935643c7955efbc7abaece2bcc9b0edcfea2e`  (2424406 bytes)
- `relatorios/relatorio-tecnico-serra-dos-macacos.pdf`  
  `7e966429d1fccae8f7583ebc0fb6644c8f6393390e5a2a0d633cbe79a79a7cde`  (76164 bytes)

### Bloqueio novo — A03 é PDF sem camada de texto

`relatorio-tecnico-borda-da-mata.pdf` tem 7 páginas, **7 imagens JPEG,
zero fontes e zero mapas `ToUnicode`**. É digitalização ou exportação como
imagem: nenhum caractere é extraível.

Consequências, todas objetivas:

1. o conteúdo **não pôde ser conferido por texto** — a distinção em relação a
   A02 e A04 está provada por hash e estrutura, não por leitura;
2. leitor de tela não acessa nada, o que colide com o piso de acessibilidade
   do projeto;
3. não é pesquisável nem citável por trecho;
4. **A06 — Diagnóstico Interno / Borda da Mata não pôde ser procurado**
   dentro dele.

Antes de servir como anexo público, precisa de OCR — que gera derivado com
hash próprio, preservando o original.

### A05 tem fonte, dentro de A02

O relatório do Recanto da Serra contém a seção **"Diagnóstico detalhado do
Recanto da Serra"**, além de um resumo executivo intitulado "Diagnóstico de
Impacto Econômico e Cultural". É a fonte de **A05 — Diagnóstico Interno /
Recanto da Serra**: conteúdo derivável, não arquivo próprio.

Atenção de privacidade: o mesmo relatório traz seção de **nomes recorrentes
de trabalhadores contratados**. Nenhum nome foi copiado para este documento.

## 7. Os nove documentos (§11)

| Item | Localizado | Arquivo fonte | Tipo de fonte | Conteúdo | Precisa extração | Pronto p/ próxima etapa | Bloqueio |
|---|---|---|---|---|---|---|---|
| A02 | SIM | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | arquivo próprio | próprio | NÃO | **SIM** | revisão de privacidade (nomes de trabalhadores) |
| A03 | SIM | `relatorios/relatorio-tecnico-borda-da-mata.pdf` | arquivo próprio | próprio | NÃO | **NÃO** | **PDF sem camada de texto; exige OCR** |
| A04 | SIM | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` | arquivo próprio | próprio | NÃO | **SIM** | nenhum |
| A05 | SIM | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | seção de outro documento | derivável | **SIM** | NÃO | extração é etapa posterior |
| A06 | NÃO | `—` | — | — | indeterminado | **NÃO** | candidato seria A03, que não é legível |
| B09 | NÃO | `—` | — | — | — | **NÃO** | nenhuma fonte no corpus |
| B10 | NÃO | `—` | — | — | — | **NÃO** | nenhuma fonte no corpus |
| B11 | NÃO | `—` | — | — | — | **NÃO** | nenhuma fonte no corpus |
| B12 | NÃO | `—` | — | — | — | **NÃO** | nenhuma fonte no corpus |

Placar: **3 de 9 com arquivo próprio, 1 derivável, 5 sem fonte.** Nenhuma
extração foi feita. Busquei `relato de campo` em todo o texto do corpus e
não há ocorrência: B09 a B12 seguem sem fonte.

## 8. Formulários (§12)

| Classe | Arquivos |
|---|---|
| **A. Instrumento/modelo** | **nenhum arquivo** |
| **B. Respostas/exportações** | 3 `.xlsx` na raiz de `formularios/` |
| **C. Análises/indicadores** | 17 PDFs + 1 `.xlsx` em `indicadores-observatorio/` |
| **D. Metodologia** | `11-nota-metodologica.pdf` e `16-dicionario-dados.pdf` |
| **E. Outros** | — |

### O instrumento não existe como documento, mas as perguntas existem

Achado que muda o encaminhamento de A09 e A10: **os cabeçalhos de coluna das
planilhas de respostas são o texto literal das perguntas aplicadas.**

| Planilha | Corresponde ao instrumento de | Item |
|---|---|---|
| `formulario-de-funcionamento-pedro-e-oviedo.xlsx` | Rotina de funcionamento | **A09** |
| `formulario-recanto-da-serra-respostas.xlsx` | Público visitante / consumidor | **A10** |
| `formulario-borda-da-mata-respostas.xlsx` | Público visitante / consumidor | **A10** |

Ou seja: o instrumento é **reconstituível a partir de fonte válida do próprio
acervo**, sem depender do link `/edit` do Google Forms, que não abre para
terceiro. O PDF estático do instrumento é etapa posterior e não foi produzido
aqui.

### Privacidade

`formulario-de-funcionamento-pedro-e-oviedo.xlsx` tem coluna **“Nome do
responsável pelo preenchimento”** — dado pessoal direto. As duas planilhas de
público coletam faixa de idade e identidade de gênero em nível de resposta
individual.

As três são **`RESTRITO`** por padrão. Nenhuma resposta individual foi exposta
neste documento.

## 9. Indicadores e nota metodológica (§13)

Estrutura: **1 planilha com 17 abas** e **17 PDFs**, um por aba, com os mesmos
nomes. Os PDFs são renderização da planilha, não fontes independentes.

| Papel | Arquivos |
|---|---|
| **Fonte** | `anexo-indicadores-observatorio-pnab-estatico-final.xlsx` (17 abas) |
| **Renderização** | os 17 PDFs `00-capa` … `16-dicionario-dados` |
| **Metodologia** | `11-nota-metodologica`, `16-dicionario-dados`, `10-conciliacao` |
| **Dados agregados** | `02`, `03`, `05`, `07`, `09`, `12`, `13`, `14`, `15` |
| **Possível identificação de pessoa** | `06-pessoas-trabalho`, `08-fornecedores` |

### Revisão de privacidade obrigatória

- **`06-pessoas-trabalho`** — ranking de **pessoas remuneradas**, com nome
  consolidado, código de pessoa e as variações de grafia declaradas. É dado
  pessoal de pessoa identificada. `RESTRITO`. Nenhum nome foi copiado aqui.
- **`08-fornecedores`** — cadeia de fornecedores; pode conter pessoa física.
  `RESTRITO` até triagem.
- `12`, `13`, `14`, `15` — consolidados de respostas individuais. Agregado é
  publicável em tese, mas a promoção depende de revisão.

### A nota metodológica é a origem da regra de anonimização

`11-nota-metodologica.pdf` declara que os formulários de visitantes não
coletam nome, documento, telefone ou e-mail — a base é anônima na origem — e
que **comentários que citam nomes de terceiros estão sinalizados em coluna
própria e devem ser anonimizados em publicação**. É a fonte da restrição que
o projeto já vinha aplicando.

A mesma nota registra duas premissas que precisam aparecer em qualquer
publicação derivada: parte dos nomes de trabalhadores foi **atribuída por
cruzamento** de função, localidade e recorrência, e o gênero foi **inferido
pelo prenome**. Nenhum número foi conferido de memória: o que está aqui vem
do texto do arquivo.

### Correspondência com A01 — proposta, não aplicada

O conjunto se identifica como "ANEXO TÉCNICO DE INDICADORES – ETAPA 1 DE
LEVANTAMENTO", e `04-publico-mensuracao` declara atender às exigências nº 2,
4 e 5 do Parecer Técnico da FUNCAP. **Não associei o conjunto a A01**
(Painel Vivo de Dados, cuja origem registrada é um quadro do Figma): são
coisas diferentes até prova em contrário.

Proposta: **item novo** para o anexo de indicadores, em vez de encaixá-lo à
força em A01.

## 10. Fotos (§14)

56 arquivos, 172.1 MB, em 8 pastas. Originais intactos.

| Pasta | Arquivos |
|---|---:|
| `fotos/centro-cultural-museu-borda-da-mata` | 7 |
| `fotos/dilson-de-agripino` | 6 |
| `fotos/diretor-turismo-sao-cristovao` | 1 |
| `fotos/fundacao-cultura-sao-cristovao` | 1 |
| `fotos/ilha-grande` | 10 |
| `fotos/josenilson-bispo` | 13 |
| `fotos/laerte-aguiar` | 5 |
| `fotos/pedro-menezes` | 13 |

| Sinal | Quantidade |
|---|---:|
| Arquivos com bloco EXIF presente | **45** de 56 |
| Nome sugere pessoa identificável | **33** de 56 |
| Crédito de terceiro embutido no nome | 2 |

Nenhum reconhecimento facial foi usado, nenhuma pessoa foi identificada por
imagem e nenhum valor de EXIF foi lido — apenas a presença do bloco. Nenhum
EXIF foi removido.

### Regra formalizada para derivados de imagem

```text
ORIGINAL
  → preservado, nunca sobrescrito
  → hash original registrado
  → RESTRITO até revisão

DERIVADO PÚBLICO
  → arquivo novo
  → EXIF removido
  → otimizado para web
  → hash próprio
  → vínculo explícito com o original e tipo de derivação
```

## 11. Identidade visual (§15)

8 arquivos. Nenhum foi convertido, redesenhado ou escolhido como final.

| Grupo | Arquivos |
|---|---|
| **Observatório** | `horizontal-monocromatica-escura.png` e `.svg`, `icon.png` e `.svg`, `logo-e-texto.png` |
| **Coletivo Cultural “Tobias, sou Eu!”** | `logo-oficial-tobias-sou-eu.png` |
| **Peça gráfica, não marca** | `primeiro-post-observatorio.pdf` (33,9 MB), `logo.pdf` (12,3 MB) |
| **Referências** | nenhuma |

Há **SVG para o Observatório**, o que permite uso vetorial sem redesenho. O
Coletivo só tem PNG e um PDF grande.

## 12. Marcas (§16)

34 PNGs, todos **8000×4500 px, RGBA com transparência**. Inspecionei 7 deles.

**Não são páginas de manual.** São ativos de marca, um por arquivo, em
variantes de cor e de monocromia:

| Marca identificada | Arquivos conferidos | Natureza |
|---|---|---|
| Ministério da Cultura + Governo Federal (“Brasil — União e Reconstrução”) | `marcas-prancheta-1`, `marcas-02` | logomarca, variantes de cor |
| FUNCAP — Fundação de Cultura e Arte Aperipê de Sergipe | `marcas-15` | logomarca |
| Governo do Estado de Sergipe + Secretaria Especial da Cultura | `marcas-20` | logomarca |
| Cultura Viva 20 Anos | `marcas-24`, `marcas-28`, `marcas-31` | logomarca, variantes de cor e monocromática |

~~Os 27 arquivos não abertos seguem não identificados~~ **CORRIGIDO em
2026-09-06: os 34 foram classificados um a um.** A suposição de que os blocos
por tamanho seriam variantes das mesmas quatro marcas também estava errada —
há **seis** marcas distintas, não quatro.

### Dois achados que afetam o rodapé

1. ~~A marca da PNAB / Lei Aldir Blanc não apareceu~~ **CORRIGIDO em
   2026-09-06.** A afirmação estava errada, e o erro foi de amostragem: os 7
   arquivos abertos não incluíam nenhum dos seis que trazem a PNAB. Com os 34
   classificados, **a marca da PNAB está no acervo** — `marcas-09` a
   `marcas-14`. Ver a seção "Classificação completa das 34 marcas".
2. **E02 continua sem fonte.** `marcas/` entrega os *ativos*, não o *manual*.
   Proporção, ordem e regras de aplicação — que é o que o rodapé precisa e o
   que causa ressalva em prestação de contas — não estão em nenhum dos 34
   arquivos, todos conferidos visualmente.

Composição final do rodapé não foi definida, conforme o §16.

## 13. Relatório de Objeto (§17)

**Relatório de Objeto — fonte não localizada no corpus atual.**

Procurei em todo o texto extraído das 8 transcrições, dos 3 relatórios e dos
17 arquivos de indicadores. A expressão não aparece, e a palavra “objeto” não
ocorre em nenhum deles. Também não consta do `inventario-de-anexos.xlsx`.

Não inferi C01, não criei arquivo e não criei versão pública.

## 14. Proveniência das renomeações (§18)

`MAPA_FONTES_CANONICAS_2026-09-05.md` foi validado: reconstrói
`nome/caminho original → nome/caminho normalizado` para os 97 arquivos
renomeados, e o conjunto de hashes é o mesmo antes e depois (0 alterados).

Recebeu correção factual nesta etapa, porque duas justificativas de slug
descreviam como “disputa de nome” o que a transcrição mostrou ser fragmento
do mesmo nome. Nenhuma renomeação foi desfeita.

A grafia humana canônica não depende de filename: vive na matriz da seção 5
e no mapa.

## 15. Classificação preliminar (§21)

Nada foi promovido a `PUBLICAVEL`. Fail-closed mantido.

| Conjunto | Qtde | Estado proposto |
|---|---:|---|
| Áudios de entrevista | 8 | `RESTRITO` — mesmo com consentimento verbal verificado |
| Transcrições de entrevista | 8 | `RESTRITO` |
| Planilhas de resposta de formulário | 3 | `RESTRITO` — resposta individual e nome de responsável |
| `06-pessoas-trabalho`, `08-fornecedores` | 2 | `RESTRITO` — pessoa identificada |
| Demais arquivos de indicadores | 16 | `ESPELHAVEL` após revisão de privacidade |
| A02 — Recanto da Serra | 1 | `ESPELHAVEL` após revisão |
| A04 — Serra dos Macacos | 1 | `CANDIDATO_A_PUBLICAVEL` |
| A03 — Borda da Mata | 1 | `IMPEDIDO` — sem camada de texto |
| Fotos com indício de pessoa | 33 | `RESTRITO` |
| Fotos sem indício de pessoa | 23 | `CANDIDATO_A_PUBLICAVEL` após triagem |
| Identidade visual | 8 | `ESPELHAVEL` |
| Marcas | 34 | `ESPELHAVEL`; composição do rodapé pendente de E02 |
| A05 | 0 | `PENDENTE` — derivável de A02 |
| A06, B09–B12, C01–C04, E01, E02 | — | `PENDENTE` |
| A09, A10 | 0 | `PENDENTE` — instrumento reconstituível dos cabeçalhos |
| B07 — Itabaianinha | 0 | `PENDENTE` — entrevista não realizada |
| Relatório de Objeto | 0 | `PENDENTE` — fonte não localizada |

## 16. Reconciliação com o inventário (§20)

### Vínculo inequívoco

| Item | Fonte |
|---|---|
| A02 | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` |
| A03 | `relatorios/relatorio-tecnico-borda-da-mata.pdf` |
| A04 | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` |
| B02 | `entrevistas/01-josenilson-bispo/` |
| B03 | `entrevistas/02-oviedo-e-neide-abreu/` |
| B04 | `entrevistas/05-pedro-menezes/` |
| B08 | `entrevistas/06-dilson-de-agripino/` |
| B01 | `fotos/` (8 pastas, 56 arquivos) — contagem divergente de “Visitas I a VII” |

### Vínculo corrigido por decisão humana

| Item | Fonte | Correção |
|---|---|---|
| B05 | `entrevistas/03-fundacao-cultura-sao-cristovao/` | Paola Santana; `paola-rodrigues` é grafia histórica |
| B06 | `entrevistas/08-dona-mada/` | vínculo aceito; **data 11/04/2026 a confirmar** |
| B13 (novo) | `entrevistas/07-laerte-aguiar/` | Tomar do Geru, não Itabaianinha |
| B14 (novo) | `entrevistas/04-diretor-turismo-sao-cristovao/` | Márcio André; `marcio-ramos` é grafia histórica |

### Vínculo ambíguo

| Candidato | Fonte | Falta |
|---|---|---|
| A01 | `formularios/indicadores-observatorio/` | A origem de A01 é um quadro do Figma; o anexo de indicadores parece ser outro produto. Proponho item novo |
| D01 | `identidade-visual/` | plausível; D01 não é exigido pelo edital |
| E02 | `marcas/` | os ativos estão lá, o **manual** não |
| A06 | `relatorios/relatorio-tecnico-borda-da-mata.pdf` | indeterminável sem OCR |

### Arquivo sem item

| Fonte | Observação |
|---|---|
| `formularios/indicadores-observatorio/` (18 arquivos) | anexo técnico de indicadores; nenhum item do inventário o descreve |
| `formularios/*.xlsx` (3) | respostas; A09/A10 pedem o instrumento |
| `identidade-visual/primeiro-post-observatorio.pdf` | peça de divulgação, não marca |

### Item sem arquivo

A05 (derivável), A06, A07, A08, A09, A10, B07, B09, B10, B11, B12, C01, C02,
C03, C04, E01 (não se aplica — consentimento é verbal), E02.

**Nada foi gravado no banco.** `documento`, `arquivo`, `documento_arquivo` e
`consentimento` seguem com zero linhas.

## 17. Decisões humanas ainda necessárias

1. **Entrevista 08:** ouvir o início do áudio e confirmar a anuência de Dona
   Madá, ou registrar a divergência como definitiva.
2. **Data de B06:** 11/04/2026 não é confirmada por nenhuma fonte.
3. **A03 — Borda da Mata:** autorizar OCR. Sem isso o item fica `IMPEDIDO` e
   A06 fica indeterminável.
4. **Criar B13 e B14** para as entrevistas de Tomar do Geru e São Cristóvão,
   e manter B07 como pendência real.
5. **Anexo de indicadores:** item novo ou vínculo com A01?
6. **Marca da PNAB / Lei Aldir Blanc:** localizar o ativo gráfico.
7. **E02 — manual de marcas:** obter. Os ativos não substituem as regras de
   proporção e ordem.
8. **Artefato de ferramenta na transcrição 08:** confirmar remoção no
   derivado, preservando o original.
9. **Rótulo público das entrevistas** em `/prestacao-de-contas`.
10. **Crédito das duas fotos** com autoria de terceiro no nome do arquivo.
11. **B09–B12:** os relatos de campo precisam ser produzidos.

## 18. O que esta etapa não fez

- Não moveu a pasta de novo, não renomeou nada de novo, não desfez
  nomenclatura já normalizada.
- Não alterou infraestrutura, migrations nem banco.
- Não fez upload, não publicou, não gerou versão pública.
- Não alterou nenhum byte da fonte canônica.
- Não extraiu os nove documentos.
- Não criou termo de consentimento artificial.
- Não escolheu logo nem definiu composição de rodapé.
- Não promoveu nada a `PUBLICAVEL`.
- Não fez commit nem push. Não iniciou o Prompt 3.

---

# Fechamento — Prompt 2.2.1, 2026-09-06

Esta parte resolve os bloqueios que tinham caminho de decisão. Nada foi
publicado, nada subiu para storage, nenhum original foi alterado e o banco não
foi tocado.

## F1. Nomes canônicos e de exibição (§1)

O modelo passa a separar `nome_declarado` de `nome_exibicao`.

| # | `nome_declarado` | `nome_exibicao` | Função comprovada | Município |
|---|---|---|---|---|
| 01 | Josenilson Bispo dos Santos | Josenilson Bispo | Secretário de Cultura, Juventude e Turismo | Tobias Barreto |
| 02 | Oviêdo Abreu de Santana · Luzineide Maria de Jesus | Oviêdo Abreu · Neide Abreu | Dirigentes do Centro Cultural e Museu Borda da Mata | Tobias Barreto |
| 03 | Paola Rodrigues de Santana | **Paola Santana** | Fundação de Cultura de São Cristóvão | São Cristóvão |
| 04 | Márcio André Soares Ramos | **Márcio André** | Diretor de Turismo | São Cristóvão |
| 05 | Pedro Corrêa de Menezes | Pedro Menezes | Ator-chave / Recanto da Serra | Tobias Barreto |
| 06 | Dilson de Jesus Santos | Dilson de Agripino | Prefeito | Tobias Barreto |
| 07 | Laerte Santos Aguiar | Laerte Aguiar | Secretário Municipal de Cultura | Tomar do Geru |
| 08 | Maria Madalena Santos | **Dona Madá** | moradora / memória local | Ilha Grande |

`Rodrigues` e `Santana` são fragmentos de um só nome, não pessoas distintas. O
mesmo vale para `Ramos` e `André`. Ambos ficam registrados como **nomenclatura
histórica divergente**, com hash e proveniência preservados nos arquivos onde
aparecem.

**Entrevista 08:** a descrição é *moradora / memória local*. O termo
"liderança", que vinha do inventário, **não tem sustentação na fonte** e sai do
metadado canônico. A data 11/04/2026 também sai: nenhum arquivo a confirma.

**Ian Victor Batista de Araújo** permanece como participante da entrevista 04,
comprovado pela transcrição, e **não** como entrevistado principal.

## F2. Consentimento da entrevista 08 (§2)

Registro atual:

```text
tipo                   = verbal_gravado
declaracao_responsavel = autorizado
evidencia_transcricao  = nao_localizada
evidencia_audio        = pendente_verificacao
```

**Não consegui aferir o áudio.** O ambiente não tem `ffmpeg` nem qualquer
ferramenta de recorte ou transcrição de áudio, e eu não transcrevo áudio. Por
isso este item **para aqui**, conforme o §2, com o intervalo indicado para
conferência humana.

**Intervalo a conferir:** o áudio tem ~45 min (MP3, 320 kbps, 48 kHz). O pedido
de autorização está na linha 50 de 335 da transcrição. Os timestamps da
transcrição **terminam em [01:18]**, na linha 28 — daí em diante não há marcação
de tempo.

Estimando linearmente entre a última marcação e o fim do documento, o pedido
cai por volta de **04:20**. A estimativa é grosseira, então a recomendação é
ouvir **de 01:00 a 06:00**.

Nenhuma fala foi copiada para o Git.

## F3. B13 e B14 (§3)

Conferi os códigos da série B no inventário: **B01 a B12, contíguos, sem
reservas**. Portanto:

| Código | Entrevistado | Função | Município | Situação |
|---|---|---|---|---|
| **B13** | Laerte Santos Aguiar | Secretário Municipal de Cultura | Tomar do Geru | livre, segue a sequência |
| **B14** | Márcio André Soares Ramos | Diretor de Turismo | São Cristóvão | livre, segue a sequência |

**B07 não é substituído.** Permanece como a previsão de entrevista de
Itabaianinha, com estado `PENDENTE / não realizada`. O histórico fica: o item
nasceu do Relatório Parcial antes da entrevista, com status `A confirmar` e sem
link, e a entrevista não ocorreu.

## F4. B06 (§4)

Reconciliado com **Maria Madalena Santos ("Dona Madá"), Ilha Grande**.

Removidos do metadado canônico, com observação histórica preservada:

| Campo | Valor antigo | Motivo da remoção |
|---|---|---|
| data | 11/04/2026 | nenhuma fonte a confirma |
| descrição | "liderança de Ilha Grande" | não sustentada pela fonte |

## F5. OCR de A03 (§5)

Autorizado e executado. **O original não foi tocado.**

| | |
|---|---|
| Original | `relatorios/relatorio-tecnico-borda-da-mata.pdf` |
| SHA-256 do original | `6dfef47006ed97133c8fef2ce0b935643c7955efbc7abaece2bcc9b0edcfea2e` |
| Derivado | `derivados/a03-borda-da-mata-ocr.md` |
| SHA-256 do derivado | `502d9bf1433413cfd17fe70442f6351efbe708aad7a94314946b2b64b366ff8b` |
| Bytes do derivado | 10.449 |
| `derivado_de` | A03 / original |
| Estado | `RESTRITO` |
| Publicar | não |

**Método:** as 7 imagens JPEG embutidas foram extraídas por recorte de stream,
sem biblioteca externa, e transcritas por leitura visual. Não houve OCR
estatístico, e nada foi corrigido, completado ou inferido.

### Trechos de baixa confiança e defeitos do original

1. **Três truncamentos de texto**, marcados no derivado como
   `[TRUNCADO NO ORIGINAL]`. Não são falha de leitura: o layout do PDF corta o
   parágrafo e o bloco seguinte começa por cima. **O texto perdido não existe
   no arquivo** — some antes de qualquer OCR.
2. **Dois nomes de trabalhadores diferentes** para atividades de manutenção, um
   no resumo executivo e outro no detalhamento. Podem ser duas das cinco
   pessoas contratadas, ou inconsistência entre resumo e detalhe. Não resolvi.
3. **Numeração de seção com salto:** de "2. Motivação" para "2.3 Despesas", sem
   2.1 nem 2.2. Reproduzido como está.
4. **Períodos divergentes entre as duas partes** do arquivo: o relatório analisa
   21/07–21/12/2025; o formulário de visitantes, 26/07–10/12/2025.
5. Os dois gráficos foram **descritos**, não convertidos em dados. Conferir
   contra a base antes de citar qualquer número.

### A06 encontrado

**SIM.** O OCR mostrou que A03 contém, em estrutura idêntica à de A02:

- `Resumo Executivo: Diagnóstico de Impacto Econômico e Cultural – Borda da Mata`
- e o detalhamento numerado: 1. Base de dados · 2. Motivação · 2.3 Despesas ·
  2.4 Receitas · 3. Mão de obra local ativada · 4. Ativação do território

**A06 — Diagnóstico Interno / Borda da Mata é derivável de A03.** Deixa de ser
`PENDENTE sem fonte`.

Achado adicional: o PDF de A03 **contém dois documentos**. Páginas 1–5 são o
relatório técnico; páginas 6–7 são um `Formulário de Visitantes — Borda da
Mata`, com período e contagem próprios.

**Privacidade:** o texto nomeia trabalhadores remunerados. O derivado marca as
posições e **omite os nomes**; eles permanecem apenas no original, que é
`RESTRITO`.

## F6. A05 (§6)

Seção confirmada dentro de A02:

- `Resumo Executivo: Diagnóstico de Impacto Econômico e Cultural` — linha 8
- `Diagnóstico detalhado do Recanto da Serra` — linha 93, com
  `Período ativo: 21 de julho a 21 de dezembro de 2025`

Registro: **A05 → derivável de A02.** Nada foi extraído.

## F7. A02 / A03 / A04 (§7)

| Item | Arquivo | Páginas | Título interno | SHA-256 |
|---|---|---:|---|---|
| **A02** | `relatorio-tecnico-recanto-da-serra.pdf` | 14 | RELATÓRIO TÉCNICO – RECANTO DA SERRA | `18b7bbb1…9c2aff91` |
| **A03** | `relatorio-tecnico-borda-da-mata.pdf` | 7 | RELATÓRIO TÉCNICO – BORDA DA MATA | `6dfef470…edcfea2e` |
| **A04** | `relatorio-tecnico-serra-dos-macacos.pdf` | 4 | RELATO TÉCNICO SERRA DOS MACACOS | `7e966429…a79a7cde` |

Arquivos distintos, hashes distintos e, **agora com o OCR, conteúdo conferido
nos três**. O título interno de A03 confirma o equipamento; a distinção deixou
de depender apenas de hash e estrutura.

O título interno de A04 diz "RELATO", não "RELATÓRIO". Divergência registrada,
não corrigida.

## F8. B09–B12 (§8)

```text
fonte_nao_localizada = true
estado = PENDENTE
```

Busquei "relato de campo" e "relato individual" em todo o texto extraído do
corpus: zero ocorrências. Nenhum derivado foi criado de memória.

## F9. Formulários A09 / A10 (§9)

```text
instrumento_original_separado = nao_localizado
fonte_das_perguntas           = cabecalhos_das_planilhas
reconstituivel                = true
```

| Planilha | Instrumento | Item |
|---|---|---|
| `formulario-de-funcionamento-pedro-e-oviedo.xlsx` | Rotina de funcionamento | **A09** |
| `formulario-recanto-da-serra-respostas.xlsx` | Público visitante | **A10** |
| `formulario-borda-da-mata-respostas.xlsx` | Público visitante | **A10** |

O PDF do instrumento **não foi produzido** nesta tarefa. A distinção entre
instrumento e respostas é preservada: as respostas individuais seguem
`RESTRITO`, e a planilha de funcionamento tem coluna com nome de responsável.

## F10. Indicadores (§10)

**O que A01 é no inventário:** *Painel Vivo de Dados*, categoria "Análise de
dados", tipo `painel_dados`, origem **quadro do Figma**, slug
`painel-vivo-figma`. É um painel interativo hospedado no Figma.

**O que os 18 arquivos são:** 1 planilha de 17 abas mais 17 PDFs que a
renderizam, aba por aba, identificada internamente como *ANEXO TÉCNICO DE
INDICADORES – ETAPA 1 DE LEVANTAMENTO*.

| Função | Arquivos |
|---|---|
| Fonte | `anexo-indicadores-observatorio-pnab-estatico-final.xlsx` |
| Renderização | 17 PDFs, `00-capa` a `16-dicionario-dados` |
| Metodologia | `11-nota-metodologica`, `16-dicionario-dados`, `10-conciliacao` |
| Dados agregados | `02`, `03`, `05`, `07`, `09`, `12`, `13`, `14`, `15` |
| Pessoa identificada | `06-pessoas-trabalho`, `08-fornecedores` |

São artefatos diferentes: um é painel interativo no Figma, o outro é anexo
estático. **Não associei ao A01.**

**Unidade documental proposta:** um item, tendo a planilha como arquivo
principal e os 17 PDFs como renderizações da mesma unidade — é assim que o
conjunto se apresenta e é assim que um avaliador o consulta.

**Código proposto: A11**, categoria "Análise de dados" (a mesma de A01–A10, e a
que o conteúdo pede). A série A vai até A10, então A11 está livre e segue a
sequência. Nenhum código foi criado nesta tarefa.

`06-pessoas-trabalho` e `08-fornecedores` permanecem `RESTRITO`.

## F11. Classificação completa das 34 marcas (§11)

Todas as 34 inspecionadas visualmente, uma a uma. Nada foi inferido por
posição na sequência.

Para ver as variantes claras foi preciso compor cada PNG sobre fundo escuro:
todos são RGBA com transparência, e as versões brancas renderizam invisíveis
sobre branco. A composição foi feita em miniaturas no scratchpad; **os
originais não foram alterados**.

| Arquivo | Marca | Variante |
|---|---|---|
| `marcas-02` | MinC + Governo Federal | colorida, horizontal |
| `marcas-03` | MinC + Governo Federal | monocromática preta, horizontal |
| `marcas-04` | MinC + Governo Federal | monocromática branca, horizontal |
| `marcas-05` | MinC + Governo Federal | colorida, vertical |
| `marcas-06` | MinC + Governo Federal | colorida, vertical (variação de tom) |
| `marcas-07` | MinC + Governo Federal | monocromática preta, vertical |
| `marcas-08` | MinC + Governo Federal | monocromática branca, vertical |
| `marcas-09` | **PNAB / Aldir Blanc** | colorida, assinatura azul |
| `marcas-10` | **PNAB / Aldir Blanc** | colorida, assinatura amarela |
| `marcas-11` | **PNAB / Aldir Blanc** | colorida, assinatura azul (variação) |
| `marcas-12` | **PNAB / Aldir Blanc** | colorida, assinatura amarela (variação) |
| `marcas-13` | **PNAB / Aldir Blanc** | monocromática preta |
| `marcas-14` | **PNAB / Aldir Blanc** | monocromática branca |
| `marcas-15` | FUNCAP | colorida, horizontal |
| `marcas-16` | FUNCAP | colorida, vertical |
| `marcas-17` | FUNCAP | monocromática branca, horizontal |
| `marcas-18` | FUNCAP | monocromática branca, vertical |
| `marcas-19` | Governo de Sergipe + Secretaria Especial da Cultura | horizontal, caixa azul |
| `marcas-20` | Governo de Sergipe + Secretaria Especial da Cultura | vertical, caixa azul |
| `marcas-21` | Governo de Sergipe | horizontal, azul sobre transparente |
| `marcas-22` | Governo de Sergipe | horizontal, caixa azul |
| `marcas-23` | Governo de Sergipe | vertical, azul sobre transparente |
| `marcas-24` | Cultura Viva 20 Anos | selo, colorida ciano |
| `marcas-25` | Cultura Viva 20 Anos | selo, azul-escuro |
| `marcas-26` | Cultura Viva 20 Anos | selo, monocromática branca |
| `marcas-27` | Cultura Viva 20 Anos | selo, monocromática preta |
| `marcas-28` | Cultura Viva 20 Anos | lockup completo, colorida ciano |
| `marcas-29` | Cultura Viva 20 Anos | lockup completo, azul-escuro |
| `marcas-30` | Cultura Viva 20 Anos | lockup completo, monocromática branca |
| `marcas-31` | Cultura Viva 20 Anos | lockup completo, monocromática preta |
| `marcas-32` | Lei de Incentivo à Cultura (Lei Rouanet) | colorida |
| `marcas-33` | Lei de Incentivo à Cultura (Lei Rouanet) | monocromática preta |
| `marcas-34` | Lei de Incentivo à Cultura (Lei Rouanet) | monocromática branca |
| `marcas-prancheta-1` | MinC + Governo Federal | colorida, horizontal |

**Não identificadas: nenhuma.** Seis marcas distintas, em 34 variantes.

### Marca PNAB localizada? **SIM**

Seis arquivos: `marcas-09` a `marcas-14`.

### As cinco marcas que o rodapé exige estão todas no acervo

| Marca exigida | Arquivos |
|---|---|
| PNAB / Lei Aldir Blanc | 09–14 |
| Ministério da Cultura | 02–08, prancheta-1 |
| Governo Federal | idem (lockup conjunto) |
| Governo de Sergipe | 19–23 |
| FUNCAP | 15–18 |

### Duas marcas presentes que **não** pertencem a este rodapé

`Cultura Viva 20 Anos` (24–31) e `Lei de Incentivo à Cultura / Lei Rouanet`
(32–34) são de **outras políticas de fomento**. Este projeto é PNAB. Incluí-las
no rodapé seria crédito indevido. Ficam inventariadas e fora da composição.

### E02 não está resolvido

Verifiquei o que E02 exige antes de concluir: pela Legenda do inventário, ele
*"define proporção e ordem dos créditos de fomento no rodapé e nas capas dos
PDFs"*.

Os 34 arquivos são **arte**, não regra. Nenhum deles traz proporção, ordem,
área de reserva ou tamanho mínimo. **E02 permanece `PENDENTE`**, e o rodapé
segue com o placeholder declarado.

## F12. Identidade visual (§12)

| Grupo | Arquivos | Observação |
|---|---|---|
| Observatório | `horizontal-monocromatica-escura.png` + `.svg`, `icon.png` + `.svg`, `logo-e-texto.png` | **tem SVG** — uso vetorial sem redesenho |
| Coletivo Cultural "Tobias, sou Eu!" | `logo-oficial-tobias-sou-eu.png` | **só PNG**, 1280×1024 |
| Peça gráfica, não marca | `primeiro-post-observatorio.pdf`, `logo.pdf` | 33,9 MB e 12,3 MB |

Nada foi convertido, redesenhado ou escolhido como final.

## F13. Transcrição 08 — texto de ferramenta (§13)

O original permanece intocado.

**Registro:** a última linha da transcrição 08 é conteúdo externo, gerado pela
ferramenta automática de transcrição — uma oferta de destacar trechos do áudio.
Não é fala de nenhum participante.

Regra para qualquer derivado futuro, público ou de consulta:

```text
- remover essa linha;
- registrar que foi removido conteúdo de interface/ferramenta;
- não alterar nenhuma fala real.
```

O derivado **não foi produzido** nesta tarefa.

## F14. Validação da fonte (§22 do prompt anterior)

| Verificação | Resultado |
|---|---|
| Originais | **138**, inalterados |
| Bytes dos originais | 608.281.472 |
| Hashes alterados desde a movimentação | **0** |
| Arquivos perdidos | **0** |
| Colisões | **0** |
| Fonte dentro do Git | **NÃO** |
| Novo artefato | +1 derivado OCR em `derivados/`, hash próprio registrado |
| Total na pasta | 139 (138 originais + 1 derivado) |

---

# Aplicação da reconciliação — 2026-09-06 (Prompt 2.4)

Registro do que foi efetivamente aplicado ao `inventario-de-anexos.xlsx`. Não
altera nenhuma conclusão de auditoria acima; acrescenta os fatos da aplicação.

## Onde ficou o campo `obrigatorio`

A planilha **já tinha** o campo: a coluna `Exigido pelo edital`, com `Sim`/`Não`.
Não foi criada coluna nova, e nada foi improvisado. A natureza de evidência
complementar ficou declarada no início da coluna `Observações`, em texto.

Consequência a registrar: `Exigido pelo edital = Não` **não distingue**, por si,
"evidência complementar" de "item original não exigido" — `D01` e `D02` também
são `Não` e são itens originais. A distinção está no texto de `Observações`. Se
for preciso torná-la legível por máquina, a menor mudança seria uma coluna
`Natureza`; **ela não foi criada** e depende de decisão humana.

## Mudança nas fórmulas do Resumo

Todas as fórmulas da aba Resumo estavam fixas em `Inventário!X2:X31`. Com três
linhas novas, elas continuariam somando só até a linha 31 — os totais ficariam
silenciosamente errados, que é o pior desfecho possível numa planilha de
prestação de contas.

Os 29 intervalos foram estendidos para `:34`. O efeito nos números:

| Indicador | Antes | Depois | Por quê |
|---|---:|---:|---|
| Total de itens | 30 | 33 | três linhas novas |
| **Exigidos pelo edital** | 28 | **28** | as três novas têm `Não` |
| Disponíveis | 10 | 13 | os três novos têm arquivo real |
| Já espelhados em URL própria | 0 | 0 | nada foi espelhado |

Os valores em cache das células de fórmula foram removidos para que a planilha
recalcule ao abrir, em vez de exibir número velho.

## Proveniência preservada

Valor histórico incorreto não foi apagado sem rastro:

| Item | Valor retirado | Onde ficou o rastro |
|---|---|---|
| `B06` | data `11/04/2026` | `Observações`, como valor retirado por falta de fonte |
| `B06` | classificação `liderança` | idem |
| `A03`, `A04` | link do Google Docs compartilhado com `A02` | mantido em `Link atual`, com nota de que não identifica o item |

O campo ativo passou a conter apenas o valor sustentado pela fonte.

## Validação executada

| Verificação | Resultado |
|---|---|
| Códigos duplicados | 0 |
| `B13`, `B14`, `A11` únicos | sim |
| `B07` preservado, ainda Itabaianinha, sem arquivo | sim |
| Itens obrigatórios | 28 |
| Complementares fora do denominador | sim |
| Itens `PUBLICAVEL` | 0 |
| Status `Publicado` | 0 |
| URL permanente preenchida | 0 |
| Hashes | 3, todos conferidos; nenhum inventado |
| Fonte inexistente criada | nenhuma |
| Colunas | 15, as mesmas |
| Aba Legenda | inalterada |
| Integridade do arquivo | `testzip` OK; as 3 abas parseáveis |
