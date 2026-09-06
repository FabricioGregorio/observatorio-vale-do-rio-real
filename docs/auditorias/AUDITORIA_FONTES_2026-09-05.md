# Auditoria das fontes locais — `observatorio-fontes/`

**Data:** 2026-09-05 · **Etapa:** Prompt 2 — inventário e reconciliação
**Natureza:** somente leitura. Nenhum arquivo da pasta de fontes foi
renomeado, movido, convertido, comprimido, editado ou apagado.

Este relatório **não substitui o Manifesto de Evidências**. Ele registra o que
existe fisicamente e como isso se relaciona ao inventário canônico. Não
promove nenhum item a `PUBLICAVEL`.

Não contém CPF, telefone, e-mail pessoal, segredo, conteúdo integral de
entrevista nem transcrição. Nomes de entrevistados aparecem porque a
reconciliação do §6 os exige e porque já constam do inventário versionado —
**a página pública não pode exibi-los** sem a decisão pendente registrada em
*Decisões humanas necessárias*.

> **Aviso de estado — acrescentado em 2026-09-05, depois do Prompt 2.2.**
>
> Este relatório descreve o acervo com **72 arquivos**. Ainda no mesmo dia, o
> acervo passou a **138 arquivos**: chegaram os três relatórios técnicos, a
> pasta de formulários, a identidade visual e as marcas. Nada foi removido —
> os 72 hashes registrados aqui continuam todos presentes.
>
> Continuam válidos: o inventário e os hashes dos 72 originais, a análise de
> duplicidade, a matriz de entrevistas e os achados de privacidade.
>
> **Ficaram desatualizados:** as seções que afirmam que `relatorios/` está
> vazia e que `formularios/`, `identidade-visual/` e `marcas/` não existem, e
> a conclusão de que os nove documentos não têm fonte atualizada — A02, A03 e
> A04 passaram a ter arquivo próprio.
>
> A pasta também mudou de lugar e teve nomes normalizados. O estado atual está
> em [`MAPA_FONTES_CANONICAS_2026-09-05.md`](./MAPA_FONTES_CANONICAS_2026-09-05.md).

---

## 1. Localização e isolamento

| Verificação | Resultado |
|---|---|
| Caminho | `C:\Users\bricin\Desktop\observatorio-fontes` |
| Dentro do repositório? | Não |
| Aparece em `git status`? | Não |
| Rastreada pelo Git? | Não — `git ls-files` não retorna nada com esse nome |
| Symlink ou junction apontando para ela? | Nenhum. Os dois únicos reparse points do repositório estão em `.next/` e apontam para `node_modules/.pnpm/pg@8.23.0` |
| Conteúdo copiado para `public/`? | Não. `public/` tem apenas `media/LEIA-ME.md` e cinco `.gitkeep` |

## 2. Inventário físico

- **Total de arquivos:** 72
- **Total de bytes:** 541.197.811 (516.1 MB)
- **Hashes SHA-256 calculados:** 72 — todos distintos

| Pasta de topo | Arquivos | Bytes |
|---|---:|---:|
| `entrevistas/` | 16 | 344.0 MB |
| `fotos/` | 56 | 172.1 MB |

### Pastas previstas pelo plano que não existem no disco

O §4 do plano de execução prevê dez pastas. Sete não existem:

- `diagnosticos/`
- `formularios/`
- `identidade-visual/`
- `marcas/`
- `caderno-estudos/`
- `derivados-publicos/`
- `nao-classificados/`

E `relatorios/` **existe mas está vazia** — zero arquivos, inclusive ocultos.
Também não existem as subpastas previstas `entrevistas/termos-consentimento/`,
`relatorios/originais-assinados/` e `relatorios/versoes-publicas/`.

### Data de modificação

Todos os 72 arquivos têm `mtime` de 2026-09-04, que é a data de montagem da
pasta. **Não serve como data do documento** e foi registrada apenas como dado
auxiliar, conforme o §3.

## 3. Duplicidade (§4)

| Grupo | Resultado |
|---|---|
| **A** — mesmo hash, nomes diferentes | **Nenhuma.** 72 arquivos, 72 hashes distintos |
| **B** — mesmo nome, hashes diferentes | **Nenhum.** Nenhum nome de arquivo se repete no acervo |
| **C** — aparentemente relacionados, hash diferente | **7 grupos**, todos de fotos |

Os sete grupos do tipo C são tomadas sequenciais da mesma cena, com tamanhos
distintos. **Não são duplicados** e nada foi apagado:

| Pasta | Raiz do nome | Arquivos |
|---|---|---:|
| `fotos/Dilson (Prefeito de Tobias Barreto)` | `equipe-e-dilson` | 2 |
| `fotos/Ilha Grande` | `forno-a-lenha` | 2 |
| `fotos/Josenilson (…)` | `antes-da-entrevista` | 2 |
| `fotos/Josenilson (…)` | `foto-durante-entrevista` | 2 |
| `fotos/Josenilson (…)` | `nilsinho-mostrando-banner-do-tobiarte` | 3 |
| `fotos/Laerte Aguiar (…)` | `equipe-com-laerte-aguiar` | 5 |
| `fotos/Pedro Menezes (Recanto da Serra)` | `momento-conversando-com-pedro` | 2 |

## 4. Reconciliação com o inventário canônico (§5)

Fonte canônica: `inventario-de-anexos.xlsx` — 30 linhas, 28 exigidas pelo
edital. Inalterado nesta etapa (conferido por hash do arquivo).
O banco continua **vazio**: `documento`, `arquivo`, `documento_arquivo` e
`consentimento` com zero linhas. Nada foi inserido nem alterado.

### 4.1 Encontrado e reconciliado — vínculo seguro

| Item | Título no inventário | Fonte física | Prova objetiva |
|---|---|---|---|
| B02 | Entrevista — Josenilson Bispo (27/03/2026) | `entrevistas/01. …` | áudio nomeado 'Entrevista com Josenilson Bispo 27-03'; pasta datada 27-03-2026 |
| B03 | Entrevista — Oviêdo e Neide Abreu (28/03/2026) | `entrevistas/02. …` | nomes conferem; áudio datado 28-03 |
| B04 | Entrevista — Pedro Menezes (05/04/2026) | `entrevistas/05. …` | nome confere; áudio datado 05-04-26 |
| B08 | Entrevista — Prefeito de Tobias Barreto | `entrevistas/06. …` | cargo inequívoco na pasta e no item; transcrição nomeia Dilson de Agripino |
| B01 | Fotografias de comprovação — Visitas I a VII | `fotos/` (8 pastas, 56 arquivos) | ver divergência em 4.4 |

### 4.2 Vínculo ambíguo — não foi criado automaticamente

| Item candidato | Fonte física | Por que não fechei o vínculo |
|---|---|---|
| B05? — Entrevista — Paola Santana (06/04/2026) | `entrevistas/03. …` | áudio datado 06-04, igual à data de B05; transcrição sem nome ('Transcrição completa.pdf') |
| B06? — Entrevista — liderança de Ilha Grande (11/04/2026) | `entrevistas/08. …` | município confere e é a única entrevista de Ilha Grande; nenhuma data nos arquivos confirma 11/04/2026 |

### 4.3 Inventário sem arquivo

| Item | Título | Situação |
|---|---|---|
| B07 | Entrevista — Secretaria de Cultura de Itabaianinha | **Nenhum arquivo.** O acervo não tem entrevista de Itabaianinha. A pasta 07 é Tomar do Geru, município diferente. Não criei item nem vínculo para preencher meta |
| A02, A03, A04 | Relatórios Técnicos | `relatorios/` vazia |
| A05, A06, A07, A08 | Diagnósticos Internos | `diagnosticos/` não existe |
| A09, A10 | Formulários modelo | `formularios/` não existe |
| B09, B10, B11, B12 | Relatos de campo | nenhuma fonte |
| C01 | Relatório Parcial de Levantamento de Dados | nenhuma fonte |
| C02, C03, C04 | Documento Final, modelagem, PodObservar | nenhuma fonte |
| E01 | Termos de consentimento | nenhuma fonte — ver seção 6 |
| E02 | Manual de aplicação de marcas | `marcas/` não existe |

### 4.4 Arquivo sem item

| Fonte física | Nomes que aparecem nos arquivos | Situação |
|---|---|---|
| `entrevistas/04. …` | Márcio André, Ian Victor (transcrição) | nenhum item do inventário descreve diretor de turismo de São Cristóvão |
| `entrevistas/07. …` | Laerte Aguiar | inventário não tem item para Tomar do Geru; B07 é Itabaianinha, município diferente |

Além disso, `fotos/` tem **8 pastas** por entrevistado/local, enquanto B01 diz
**"Visitas I a VII"** — sete. A correspondência existe, mas a contagem
divergiu; não reconciliei foto a foto com visita numerada porque nenhum
arquivo ou documento traz o número da visita.

## 5. Entrevistas — conferência contra as oito conhecidas (§6)

As oito pastas físicas correspondem às oito entrevistas listadas no §11 do
plano. Nenhum entrevistado, cargo, município, data ou consentimento foi
inventado. Divergências encontradas:

| # | Relação esperada pelo plano | O que os arquivos dizem | Divergência |
|---|---|---|---|
| 01 | Josenilson Bispo / “Nilsinho” / Sec. Cultura Tobias Barreto | pasta “Nilsinho”, áudio “Josenilson Bispo 27-03” | nenhuma — confirma a variação de nome |
| 02 | Oviêdo Abreu e Neide Abreu | “Oviedo Abreu e Neide Abreu” | grafia sem acento no disco (`Oviedo`) |
| 03 | Fundação de Cultura de São Cristóvão, vínculo com Paola Santana | transcrição genérica, sem nome. Foto na pasta correspondente: `paola-rodrigues-…` | **CONFLITO DE SOBRENOME**: inventário e plano dizem *Santana*; o arquivo diz *Rodrigues* |
| 04 | Diretor de Turismo de São Cristóvão | transcrição “Márcio André e Ian Victor”; foto `marcio-ramos-…` | **CONFLITO**: *Márcio André* na transcrição × *Márcio Ramos* na foto. E a transcrição indica **dois** entrevistados, não um |
| 05 | Pedro Menezes / Recanto da Serra | confere, áudio “05-04-26” | nenhuma |
| 06 | Dílson / Prefeitura de Tobias Barreto | confere; transcrição “Dilson de Agripino” | nome completo só aparece no arquivo, não no inventário |
| 07 | Laerte Aguiar / Tomar do Geru | confere | não tem item no inventário |
| 08 | Dona Madá / Ilha Grande / informal | pasta “Dona Mada”, informal | grafia sem acento; nenhuma data nos arquivos confirma 11/04/2026 |

## 6. Matriz áudio / transcrição / termo (§7)

| # | Item | Áudio | Transcrição | Termo | Observação |
|---|---|---|---|---|---|
| 01 | B02 | sim | sim | NÃO | vínculo seguro |
| 02 | B03 | sim | sim | NÃO | vínculo seguro |
| 03 | B05? | sim | sim | NÃO | VÍNCULO AMBÍGUO — precisa de confirmação |
| 04 | — | sim | sim | NÃO | ARQUIVO SEM ITEM no inventário |
| 05 | B04 | sim | sim | NÃO | vínculo seguro |
| 06 | B08 | sim | sim | NÃO | vínculo seguro |
| 07 | — | sim | sim | NÃO | ARQUIVO SEM ITEM no inventário |
| 08 | B06? | sim | sim | NÃO | VÍNCULO AMBÍGUO — precisa de confirmação |

**As oito entrevistas têm áudio e transcrição. Nenhuma tem termo de**
**consentimento localizado** — zero arquivos com `termo` ou `consentimento`
no caminho, em todo o acervo, e a subpasta `termos-consentimento/` não existe.

Conforme o §7, isso significa exatamente **“termo não localizado nesta
auditoria”**, e não ausência de consentimento jurídico. Nenhuma autorização
foi inferida em nenhuma direção.

Classificação mantida, sem exceção:

```text
áudio       → RESTRITO
transcrição → RESTRITO
termo       → PENDENTE (não localizado)
```

## 7. Riscos de privacidade (§8, §13)

Marcados com `revisao_privacidade_necessaria = true`. Nenhum dado pessoal foi
reproduzido, nenhuma redação foi feita, nenhuma versão pública foi criada.

| Conjunto | Quantidade | Sinal |
|---|---:|---|
| Áudios de entrevista | 8 | voz identificável, sem termo localizado |
| Transcrições | 8 | fala atribuída nominalmente, sem termo localizado |
| Fotos | 56 | ver abaixo |
| Fotos cujo **nome** indica pessoa identificável | 33 | triagem humana obrigatória |
| Fotos com bloco EXIF presente | 45 | metadado embutido pode conter geolocalização; **nenhum valor foi lido** |

O sinal de pessoa identificável vem **do nome do arquivo e da pasta**.
Nenhuma imagem foi analisada, nenhum reconhecimento facial foi usado e
nenhum valor de EXIF foi interpretado — apenas a presença do bloco.

### Crédito de terceiro embutido no nome do arquivo

Duas fotos trazem crédito de autoria de terceiro no próprio nome, o que
levanta questão de licenciamento além de privacidade:

- `fotos/Diretor de Turismo de São Cristóvão/marcio-ramos-foto-por-Dani-Santos.jpg`
- `fotos/Fundação de Cultura São Cristóvão/paola-rodrigues-foto-por-iago-de-andrade-santos.jpeg`

### Não avaliado

Não abri o conteúdo de nenhum PDF nem de nenhum áudio. Portanto **não
verifiquei** se as transcrições contêm CPF, telefone, e-mail, endereço, dado
de saúde, menção a PCD, raça associada nominalmente, assinatura, documento
pessoal ou dado de menor. Todas as oito estão marcadas para revisão de
privacidade justamente porque isso está em aberto.

## 8. Relatório de Objeto (§9)

**Não localizado.**

A expressão “Relatório de Objeto” aparece **uma única vez em todo o
projeto**: no §9 do próprio plano de execução. Ela não consta do
`inventario-de-anexos.xlsx`, de nenhuma ADR, de nenhum documento em `docs/`
e de nenhum arquivo em `observatorio-fontes/`.

Não é possível confirmar arquivo, hash, versão/data nem localização, porque
não há candidato identificado. **Não associei o item a `C01 — Relatório
Parcial de Levantamento de Dados` nem a nenhum outro**: seria inferência, e
o §9 pede confirmação.

Classificação registrada: `PENDENTE` (não localizado). Continua valendo que,
quando aparecer, o original é `RESTRITO` e precisa de derivado público
redigido em etapa posterior.

## 9. Os nove documentos (§10, §11)

| Item | Fonte atualizada localizada? | Fonte antiga localizada? | Diferença de versão? | Pronto para extração definitiva? |
|---|---|---|---|---|
| A02 | **Não** — `relatorios/` vazia | Sim, fora do acervo: Google Docs, HTTP 401 anônimo | Não avaliável | **NÃO** |
| A03 | **Não** | Sim, **mesmo ID de A02** | Não avaliável | **NÃO** |
| A04 | **Não** | Sim, **mesmo ID de A02** | Não avaliável | **NÃO** |
| A05 | **Não** — `diagnosticos/` não existe | Não | — | **NÃO** |
| A06 | **Não** — `diagnosticos/` não existe | Não | — | **NÃO** |
| B09 | **Não** | Não | — | **NÃO** |
| B10 | **Não** | Não | — | **NÃO** |
| B11 | **Não** | Não | — | **NÃO** |
| B12 | **Não** | Não | — | **NÃO** |

**Nenhum dos nove tem fonte atualizada em `observatorio-fontes/`.** Não
extraí nada de versão antiga, conforme o §12.1 do plano e a regra de parada.

A03 e A04 continuam apontando para o **mesmo documento de origem** que A02 —
três itens distintos, um arquivo. Extrair assim daria a Borda da Mata e a
Serra dos Macacos o conteúdo de Recanto da Serra. Conflito não resolvido
aqui.

## 10. Relatórios atualizados (§11)

**Nenhum encontrado.** `relatorios/` existe e está vazia; as subpastas
`originais-assinados/` e `versoes-publicas/` não existem.

Consequentemente não há múltiplas versões a comparar, nenhuma candidata a
propor e nenhuma fonte canônica a confirmar. Nenhum número foi comparado ou
corrigido de memória.

## 11. Formulários (§12)

`formularios/` não existe. Zero arquivos, zero PDFs, zero exportações, zero
capturas.

A única evidência de A09 e A10 continua sendo o link `/edit#responses` do
Google Forms, que **não serve como evidência pública**: requisição anônima
cai em parede de login (`accounts.google.com/ServiceLogin`). O PDF estático
do instrumento é etapa posterior.

## 12. Fotos (§13)

56 arquivos em 8 pastas, 172.1 MB.
Nada publicado nesta etapa.

| Pasta | Arquivos |
|---|---:|
| `fotos/Centro Cultural e Museu Borda da Mata` | 7 |
| `fotos/Dilson (Prefeito de Tobias Barreto)` | 6 |
| `fotos/Diretor de Turismo de São Cristóvão` | 1 |
| `fotos/Fundação de Cultura São Cristóvão` | 1 |
| `fotos/Ilha Grande` | 10 |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)` | 13 |
| `fotos/Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru)` | 5 |
| `fotos/Pedro Menezes (Recanto da Serra)` | 13 |

Local ou evento foi registrado **somente quando explícito no nome do arquivo
ou no nome da pasta**. Onde não havia, ficou em branco — nada foi inferido.

## 13. Marcas e identidade visual (§14)

`identidade-visual/` e `marcas/` **não existem**. Zero arquivos.

Não há como separar logo do Observatório, logo do Coletivo “Tobias, sou Eu!”,
PNAB, MinC/Governo Federal, FUNCAP, Governo de Sergipe, referências ou
arquivos não identificados — nenhum deles está no acervo. Nada foi alterado,
vetorizado, redesenhado, e nenhuma variante foi escolhida.

O rodapé do site segue com o placeholder declarado em
`src/componentes/layout/Rodape.tsx`, que depende do item E02.

## 14. Caderno de Estudos (§15)

`caderno-estudos/` não existe.

```text
estado = PENDENTE
```

Não bloqueia esta auditoria e não bloqueia tecnicamente o site de 14/09.
Nenhum caderno provisório foi criado e nenhum conteúdo foi gerado para
preencher a ausência.

## 15. Classificação preliminar proposta (§16)

Proposta, não aplicada. Fail-closed mantido: nada virou `PUBLICAVEL`.

| Conjunto | Qtde | Estado proposto |
|---|---:|---|
| Áudios de entrevista | 8 | `RESTRITO` |
| Transcrições de entrevista | 8 | `RESTRITO` |
| Fotos cujo nome indica pessoa identificável | 33 | `RESTRITO` |
| Fotos sem indicação de pessoa no nome | 23 | `CANDIDATO_A_PUBLICAVEL` |
| Termos de consentimento (E01) | 0 | `PENDENTE` |
| Manual de marcas (E02) | 0 | `PENDENTE` |
| Caderno de Estudos | 0 | `PENDENTE` |
| Relatório de Objeto | 0 | `PENDENTE` (não localizado) |
| Nove documentos (A02–A06, B09–B12) | 0 | `PENDENTE` |
| A09, A10 — formulários | 0 | `IMPEDIDO` (origem não abre para terceiro) |
| A03, A04 | 0 | `IMPEDIDO` (origem compartilhada com A02) |
| B07 — Itabaianinha | 0 | `PENDENTE` (nenhuma fonte; item não criado) |

Os 23 `CANDIDATO_A_PUBLICAVEL` são candidatos **a triagem
humana**, não a publicação. O critério foi a ausência de indicação de pessoa
no nome do arquivo, e **nome de arquivo não é prova de conteúdo**: alguns
desses nomes descrevem visita (`conhecendo-o-museu…`, `visita-na-mensagem…`)
e podem conter pessoas. A promoção real depende da revisão de privacidade.

## 16. Bloqueios

| Bloqueio | Efeito |
|---|---|
| Zero termos de consentimento no acervo | 8 áudios e 8 transcrições travados em `RESTRITO` |
| `relatorios/` vazia | os nove documentos não têm fonte atualizada |
| `diagnosticos/`, `formularios/`, `marcas/`, `identidade-visual/` ausentes | A05–A08, A09, A10 e E02 sem fonte |
| Relatório de Objeto não identificado | §9 do plano não pode ser cumprido |
| A03 e A04 sem documento próprio | extração produziria conteúdo trocado |
| B07 sem fonte | meta de entrevistas não fecha pelo inventário atual |

## 17. Decisões humanas necessárias

1. **B05 — Paola Santana ou Paola Rodrigues?** Inventário e plano dizem
   *Santana*; o arquivo de foto diz *Rodrigues*. Confirmar o sobrenome e se
   a pasta 03 é mesmo B05.
2. **Pasta 04 — quem é o diretor de turismo?** A transcrição nomeia *Márcio
   André e Ian Victor*; a foto, *Márcio Ramos*. E indica dois entrevistados.
   Definir e decidir se vira item novo do inventário.
3. **Pasta 07 — Laerte Aguiar / Tomar do Geru** não tem item. Criar item
   novo ou deixar como arquivo órfão?
4. **B07 — Itabaianinha** não tem fonte. Manter como pendência real ou
   corrigir o inventário se a entrevista prevista era outra?
5. **Pasta 08 — a data 11/04/2026 de B06** não é confirmada por nenhum
   arquivo. Confirmar.
6. **A03 e A04** precisam de documento próprio antes de qualquer extração.
7. **Relatório de Objeto:** qual item do inventário ele é, ou é um documento
   novo a produzir?
8. **Rótulo público das entrevistas.** Se `/prestacao-de-contas` listar os 28
   itens, os títulos do inventário expõem nomes de entrevistados sem termo
   localizado. Decisão pendente desde a etapa anterior.
9. **Crédito das duas fotos com autoria de terceiro** no nome do arquivo.

## 18. O que esta etapa não fez

- Não alterou infraestrutura, migrations nem banco.
- Não fez upload e não publicou nada.
- Não modificou, renomeou, moveu, converteu, comprimiu nem apagou nenhum
  arquivo de `observatorio-fontes/`.
- Não gerou versão pública de nada.
- Não extraiu os nove documentos.
- Não inseriu nem alterou registro canônico no banco.
- Não preencheu URL, hash ou publicação no Manifesto.
- Não iniciou o Prompt 3.

---

## Apêndice — hashes SHA-256

Registro de integridade. Permite reexecutar a auditoria e detectar qualquer
alteração posterior nos originais.

| Caminho relativo | Bytes | SHA-256 |
|---|---:|---|
| `entrevistas/01. Entrevista com Nilsinho (Secretário de Cultura de Tobias Barreto) - 27-03-2026/Transcrição/Transcrição completa da entrevista Nilsinho.pdf` | 184212 | `5f5a7bed432d59afa5c14854e7203cf53e398a868f050906bce0a601b66cb05d` |
| `entrevistas/01. Entrevista com Nilsinho (Secretário de Cultura de Tobias Barreto) - 27-03-2026/Áudio/Entrevista com Josenilson Bispo 27-03.m4a` | 25807110 | `d38e9c437bde2bb5dfe8aea7caa45252632f3710371512668ec988dbd52bf1a6` |
| `entrevistas/02. Entrevista com Oviedo Abreu e Neide Abreu (Centro Cultural e Museu Borda da Mata)/Transcrição/Transcrição completa Museu Borda da Mata.pdf` | 165322 | `6f4e97ccbe63baa006db10f41bcfa0fa33a83e4a7e771c8af3002c4419ec80b4` |
| `entrevistas/02. Entrevista com Oviedo Abreu e Neide Abreu (Centro Cultural e Museu Borda da Mata)/Áudio/Entrevista com o Centro Cultural Borda da Mata 28-03.m4a` | 67404241 | `c3dc21fb6ee35a744a38405665a8964ecb7d807f6bff9f898bd255107be98842` |
| `entrevistas/03. Entrevista com a fundação de cultura São Cristovão/Transcrição/Transcrição completa.pdf` | 196060 | `53fca08161a64576823d88fb5fb4fbe87ebe6e4c09b822073aeb0c34048d77a2` |
| `entrevistas/03. Entrevista com a fundação de cultura São Cristovão/Áudio/Entrevista com a fundação de cultura São Cristóvão 06-04.m4a` | 30529930 | `ed04a253db99136db3f246c13762bd3ff5af80eb936d97ef0c2449475507267c` |
| `entrevistas/04. Entrevista com diretor de turismo de São Cristóvão/Transcrição/Transcrição da entrevista Márcio André e Ian Victor.pdf` | 158236 | `69edb10d5629f8bc0a4ee35928c02e418902df36a4a82adef188179511b91b29` |
| `entrevistas/04. Entrevista com diretor de turismo de São Cristóvão/Áudio/Entrevista com o diretor de turimo de São Cristóvão 06-04.m4a` | 57624686 | `396e60c5e2c3ee020eca7514e7c52a95bc11eb5a1ae1a57f989a0a07b2c739f8` |
| `entrevistas/05. Entrevista com Pedro Menezes (Recanto da Serra)/Transcrição/Transcrição completa - Entrevista pedro menezes (revisado).pdf` | 42058 | `8e6e8fbf17e7c9c5e6c92e6806efe6929f5be69604e29f9a41db17b441f58f72` |
| `entrevistas/05. Entrevista com Pedro Menezes (Recanto da Serra)/Áudio/Entrevista com o Recanto da Serra 05-04-26.m4a` | 13527879 | `d7096363ae4541aaf62bc9dea7bf284f811b3a93daec30e9ec1c9ff8dd68f952` |
| `entrevistas/06. Entrevista com Dilson (Prefeito de Tobias Barreto)/Transcrição/Transcrição da entrevista Dilson de Agripino.pdf` | 161064 | `7fc8a49543c1cc8d2b48527d7b6633768481724af3d7f2f8996157fec79eb0f2` |
| `entrevistas/06. Entrevista com Dilson (Prefeito de Tobias Barreto)/Áudio/entrevista-dilson-prefeito-tobias.m4a` | 19221297 | `21d16759e58f1de0f3a798bbcf537fc22b0ff7ee586a91486795e86f6fff8baf` |
| `entrevistas/07. Entrevista com Laerte Aguiar (Secretário Municipal de Cultura de Tomar do Geru)/Transcrição/Transcrição da entrevista com Secretário Municipal de Cultura de Tomar do Geru .pdf` | 291096 | `77476608e851b794a762e082e1ff60affd1fcc4dfb5f1978641246771f0142ea` |
| `entrevistas/07. Entrevista com Laerte Aguiar (Secretário Municipal de Cultura de Tomar do Geru)/Áudio/Entrevista com Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru).mp3` | 37324362 | `ef4ff053498e062a786f9de306104d42c19f4270dd50c253ed2be083c997a2df` |
| `entrevistas/08. Entrevista informal com Dona Mada - Ilha Grande/Transcrição/TRANSCRIÇÃO COMPLETA - DONA MADA (ILHA GRANDE).pdf` | 49574 | `3b4cc0955235381701dbd0a6ef0cb7afc558862b57b9fb4bd0fad25ed2f0d2b5` |
| `entrevistas/08. Entrevista informal com Dona Mada - Ilha Grande/Áudio/Entrevista Dona Mada Ilha Grande.mp3` | 108037440 | `df2e5be42f5cc3c1873d06cf93639e58fd5891edc2732b09d2ba7dd9949df2b9` |
| `fotos/Centro Cultural e Museu Borda da Mata/conversa-com-oviedo-dentro-da-casa-de-taipa.HEIC` | 1743664 | `73d9aa2fddc8fa00663de6720428c023c85fa48d6b55bdb2cc0e9a0a2e4b3bc6` |
| `fotos/Centro Cultural e Museu Borda da Mata/conversa-com-oviedo-e-neide-abreu.HEIC` | 2714204 | `07667308b11f1aab7e717a56f02650f3838dd84a9ca9955ac84f89b452caecaa` |
| `fotos/Centro Cultural e Museu Borda da Mata/espaço-do-historiador.HEIC` | 2749619 | `b694b08c5e0665c80be6472b43acf99cf83b2016b299e4ca47a2e0eba27a8cf8` |
| `fotos/Centro Cultural e Museu Borda da Mata/frente-casa-de-taipa.HEIC` | 3852535 | `e56e29065948c94f14f00f7ecdc278c1846d4036038efa5841ceb837f35b7143` |
| `fotos/Centro Cultural e Museu Borda da Mata/frente-do-museu-borda-da-mata.HEIC` | 2690038 | `a34d4858b111bc8bb9ec86f75961d2ddc1a59085630ef3e892065516da42375c` |
| `fotos/Centro Cultural e Museu Borda da Mata/geladeira-em-conversa-com-discos-e-cds-dentro.HEIC` | 1849400 | `4cfec584e3a0d0e03f5698e19b80bd85be9b74df019d59725e77feada2de5bea` |
| `fotos/Centro Cultural e Museu Borda da Mata/lhucas-concedendo-entrevista-à-pedro.HEIC` | 2107964 | `2131371f46e35733f01cdeb0ad86b38d17f4069425529b104d195650ea9c5ea3` |
| `fotos/Dilson (Prefeito de Tobias Barreto)/durante-entrevista.jpg` | 3089579 | `fdeca688498fe3e8947a975f3d175ead334739040a14bd8035d369aaa8482160` |
| `fotos/Dilson (Prefeito de Tobias Barreto)/equipe-e-dilson.jpg` | 4059598 | `3b11088b4654c36ce3a28ca908ad9f1e445e38624ca00239e803fc887b1e4db7` |
| `fotos/Dilson (Prefeito de Tobias Barreto)/equipe-e-dilson2.jpg` | 4053101 | `bc264f4e7321d2f5f9371791194d3db44669c469e507b7d690d7149adbedfc17` |
| `fotos/Dilson (Prefeito de Tobias Barreto)/inicio-da-entrevista.jpg` | 4047919 | `a51054802c98213928b803e1012d1d3fcf4f03bafc66d6b7c3f5d4631e96adfa` |
| `fotos/Dilson (Prefeito de Tobias Barreto)/momento-antes-da-entrevista-com-dilson.jpg` | 4301151 | `f77930e40a06bbeece2176334999df36c1df27ba8ac8463f15d97f63efa2f631` |
| `fotos/Dilson (Prefeito de Tobias Barreto)/momento-pos-entrevista.jpg` | 3046360 | `bfc3d09528ac582809e11abe8e3ccff411a27f2a3a6d24af8ffc0d9919b90c44` |
| `fotos/Diretor de Turismo de São Cristóvão/marcio-ramos-foto-por-Dani-Santos.jpg` | 2327805 | `fcd594b725cd5c649a3951ad49b2d5ba037520c4448c588ec0c24f2ab7826a29` |
| `fotos/Fundação de Cultura São Cristóvão/paola-rodrigues-foto-por-iago-de-andrade-santos.jpeg` | 1627216 | `e087ab565f743703006ef4596aba73130237c7f6747f3ddcc4b6abd7d1a682d3` |
| `fotos/Ilha Grande/arvores-preservadas.png` | 897081 | `088874e85a372a281ebf0f92dd07719fb6e244eb4c97a8b0ba0b5d460d8fca1a` |
| `fotos/Ilha Grande/cais-ou-pier-ilha-grande.png` | 653343 | `188ae9071d1c8a661a108afe0b4595753e6c1aa9d2f7be158848be23da79d0c7` |
| `fotos/Ilha Grande/campo-verde-de-grama-e-arvores.png` | 861096 | `defb34f4f8756b651ee1682759db0386f4a627a9cb11919ecf6dd9765395be9e` |
| `fotos/Ilha Grande/chegando-a-ilha-grande-de-barco.png` | 587875 | `00415cefdbd2a3954bf2717fe4886aa69ba62ab2815bbf58b1aedb8a3a4c1e89` |
| `fotos/Ilha Grande/dona-mada.png` | 559904 | `2272f64414f56217333b717cba406f51ff69abcbba55f6976254b3e72864cc09` |
| `fotos/Ilha Grande/forno-a-lenha.png` | 698323 | `f9218275a2102074b6b81f52142b374bce86e9f38b5540075c51e54c0d867c61` |
| `fotos/Ilha Grande/forno-a-lenha2.png` | 746932 | `25475b5fa02d2aa4d3e70f07580c01ffe32910b11f39bc91d5cb71cfe7f43aa9` |
| `fotos/Ilha Grande/igrejinha.jpg` | 3748570 | `2746986d0351640c3ba4e0b78fec0276cacd828039317638c3d4e9f7d6f8a4c0` |
| `fotos/Ilha Grande/placa-bem-vindos-a-pedreiras.jpg` | 3111718 | `5fa96abae987ca25278eb819df1852d5a1cd770e182dbeadd67b352f22083441` |
| `fotos/Ilha Grande/rio.png` | 457176 | `a8ce4e12de35cd444b2a3ff74667075b079e9dfd4014963dc0556f400a52ea21` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/antes-da-entrevista.jpg` | 3976747 | `57988d915c2ed5545398e5ad7d4bafe76987d9cf6f0b4898fc1a84fdc577a364` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/antes-da-entrevista2.jpg` | 3210621 | `4ed98b551fa8eeb2370674e4b7b33874a5cc35956cf622b537ff4731172c5106` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/biblioteca-da-sala-de-nilsinho-com-equipe-lendo-e-pegando-livros.jpg` | 4300460 | `a7957e24b923d0e1ba847bab8cf754eff29406eb6b4d89d5448ea00b528ab23f` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/bodega-dos-tropeiros-e-mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg` | 3912894 | `8affa12b68f568f5bba2109f324a26f682daa83136abacd0e88f7c13e53a7b47` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/bodega-dos-tropeiros-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg` | 3523391 | `c2b1b977c2d741c381fa8583b493e16f8b051294b4fb69337792d913f7b42097` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/foto-com-todos-pos-entrevista.jpg` | 4009193 | `55714162d35ac6231c73471d1be47b84ff624ad554afc83ef9dc4174acb83026` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/foto-durante-entrevista.jpg` | 3187008 | `31580765c00e37bdafdfd24bbc4a34b1aaa796a21992be206c4cd626df4eb186` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/foto-durante-entrevista2.jpg` | 4537967 | `f5c9a4adf29c55d5ed6a56a08d9239d552889b943ce193df707930a084cb6a7c` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg` | 3480436 | `f353f09372a9fa6a7ae5694da2d53e44bb079366848932fa4fc4a6cda203c82e` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/nilsinho-apresentando-mural-do-memorial-tobias-barreto.jpg` | 3434019 | `336b683851d0186472af5f6ce244f0f88274348407f060c7dd343efa110ef0cd` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/nilsinho-mostrando-banner-do-tobiarte.jpg` | 3906509 | `1e380f6d77efdf93a51e1339548ce1fa390aea5e6433ddf7edc4699bdc6a239d` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/nilsinho-mostrando-banner-do-tobiarte2.jpg` | 4049725 | `da4c81fe7873aacacd91b5cf2fb89cd186cc0bdb315d1da72474298740ca3dba` |
| `fotos/Josenilson (Secretário de Cultura de Tobias Barreto)/nilsinho-mostrando-banner-do-tobiarte3.jpg` | 3429032 | `f91edb27f52d5f29e33a1ea10b1eabc58c5af0d8b7a2f8cff5ebf0ca1d5002e3` |
| `fotos/Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru)/equipe-com-laerte-aguiar.HEIC` | 1572359 | `d9e9b4b650cf57ac80cd711cb77f72baaef0ba4453abd3111445407f4e8720c4` |
| `fotos/Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru)/equipe-com-laerte-aguiar2.HEIC` | 1449961 | `2ea1bdf3bf7d79eda339ff38a71092c6a4c09a8b5dab23360596354d7b7c1929` |
| `fotos/Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru)/equipe-com-laerte-aguiar3.HEIC` | 3657310 | `783ecfe59d796fb49bfcd33fc07e4b5c80417bab43d88402211f0d518ed17ed9` |
| `fotos/Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru)/equipe-com-laerte-aguiar4.HEIC` | 1650501 | `4428658e23639d0c2430ba879fe5050df26a05bc3d54aa7844ef8d9c84ae302f` |
| `fotos/Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru)/equipe-com-laerte-aguiar5.HEIC` | 1624283 | `8ce4e25eecd195f7e8b175f8fafb061eb2df375273ee07542b08c7aa99d1fffc` |
| `fotos/Pedro Menezes (Recanto da Serra)/budega-dos-tropeiros-por-dentro.jpg` | 4723997 | `0560f013200e9c63ab331b05f55f2bcd8b8fecc8e45c2780e397dcff7d706a07` |
| `fotos/Pedro Menezes (Recanto da Serra)/chegada-ao-recanto-placa-oxente-nao-se-avexe-nao.jpg` | 7190837 | `37cf8d2ee72d41756b41f1b027ca241c4cbc17d9a654addc2d9f5412fd7ca866` |
| `fotos/Pedro Menezes (Recanto da Serra)/conhecendo-o-museu-e-memorial-epifanio-doria.HEIC` | 2727585 | `fa8e01be6792d3160c1fe7ba612a89f72e2c29f810c6bf80f862463d9bc1f4e7` |
| `fotos/Pedro Menezes (Recanto da Serra)/estufa.jpg` | 6391931 | `e0a4bfd7d25624556f1916877cf01a17471b02a0467bf121c9f52365de032042` |
| `fotos/Pedro Menezes (Recanto da Serra)/foto-saindo-placa-volte-sempre.jpg` | 4367097 | `fb03f333043f5ce8d802c6a9fe1107796667d1ae525d7ab445eb7c932c074ffb` |
| `fotos/Pedro Menezes (Recanto da Serra)/frente-budega-dos-tropeiros.jpg` | 5447855 | `b481c5dcf04a865f7fe1294a3bc4692c9b2a09822c0128abddce854539880cd6` |
| `fotos/Pedro Menezes (Recanto da Serra)/frente-museu-dona-maria.jpg` | 5896960 | `832eaeeb9265f4bce3e1decaa7ff6cc18f05b73502ec65b7b35291f8898addce` |
| `fotos/Pedro Menezes (Recanto da Serra)/igreja-com-pedras-coruba-vista-de-longe.jpg` | 4701613 | `49eae7a692667e07f158f6782e9c744c0eb0eba62d848afc15af41aa53843d24` |
| `fotos/Pedro Menezes (Recanto da Serra)/momento-conversando-com-pedro.jpg` | 5693855 | `2ce1b14f688c2d1d6e8a95244739c7607f586c9a8b819309e70eab470f43b70b` |
| `fotos/Pedro Menezes (Recanto da Serra)/momento-conversando-com-pedro2.HEIC` | 3695756 | `34693372f4d5012d79880c09c6e5fa573a91fc40920a2490c2c920f7f9da1b50` |
| `fotos/Pedro Menezes (Recanto da Serra)/visita-a-mensagem-de-silo2.HEIC` | 2678434 | `15231a6d695e0b276b49c670e505f036842e69395c860bdd063c60e9dd7f46d9` |
| `fotos/Pedro Menezes (Recanto da Serra)/visita-da-equipe-com-oviedo-e-neide-ao-recanto-da-serra.HEIC` | 2732410 | `b2273bfd331f5fda6682f220d94dcea57a0128d9626361895b99cba279234843` |
| `fotos/Pedro Menezes (Recanto da Serra)/visita-na-mensagem-de-silo.PNG` | 8730327 | `7deb206e317aa3fd92c8d64fa245b5516956fe972ab6d88d357f25de9075fd11` |
