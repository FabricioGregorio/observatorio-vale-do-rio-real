# Mapa da fonte canônica local — `observatorio-fontes/`

**Data:** 2026-09-05 · **Etapa:** Prompt 2.2 — fonte canônica, reconciliação
e padronização de nomenclatura

Este documento é o **metadado do sistema** exigido pelo §4: a grafia humana
correta, com acentos e nome completo, vive aqui, não no nome do arquivo.

Substitui, no que diverge, o `AUDITORIA_FONTES_2026-09-05.md`, que descreve o
acervo **antes** de o material novo chegar.

> **Continuação registrada em 2026-09-05 (Prompt 2.2, §6 em diante).**
>
> Este mapa segue válido: a movimentação, os 97 arquivos renomeados e os hashes
> não mudaram. Recebeu apenas **correções factuais** de justificativa, marcadas
> no texto: dois casos descritos como “disputa de nome” eram fragmentos do mesmo
> nome, e o consentimento é verbal gravado, não termo ausente.
>
> A análise do conteúdo está em
> [`AUDITORIA_FONTES_CANONICAS_2026-09-05.md`](./AUDITORIA_FONTES_CANONICAS_2026-09-05.md).

---

## 1. Localização e configuração

| | |
|---|---|
| Local anterior | `Desktop/observatorio-fontes` |
| Local canônico | `~/observatorio-fontes` (fora do repositório) |
| Variável | `OBSERVATORIO_FONTES_DIR`, em `.env.local` |
| Em `.env.example` | apenas o nome, sem valor |
| Caminho fixo em código versionado | nenhum |

### Verificação do move

| Métrica | Antes | Depois |
|---|---:|---:|
| Arquivos | 138 | 138 |
| Bytes | 608.281.472 | 608.281.472 |
| Hashes distintos | 138 | 138 |

Conjunto de hashes **idêntico**: zero perdidos, zero inéditos. O move usou
`os.rename` na mesma unidade — operação de metadado, sem reescrever byte.
Logo depois do move, e antes de qualquer renomeação, o mapa caminho→hash
também era idêntico nos 138 arquivos.

## 2. O acervo cresceu desde a auditoria

A auditoria de hoje mais cedo registrou **72 arquivos / 516,1 MB**. O acervo
agora tem **138 arquivos / 580.1 MB**:
**66 arquivos novos**, nenhum removido — os 72 hashes originais
continuam todos presentes.

O material novo desbloqueia parte do que estava travado:

| Pasta | Antes | Agora |
|---|---|---|
| `relatorios/` | vazia | **3 relatórios técnicos distintos** |
| `formularios/` | não existia | 3 exportações + 18 arquivos de indicadores |
| `identidade-visual/` | não existia | 8 arquivos (observatório + coletivo) |
| `marcas/` | não existia | 34 PNGs |

## 3. Estrutura canônica (§3)

```text
observatorio-fontes/
├── entrevistas/
├── formularios/
├── fotos/
├── identidade-visual/
├── marcas/
└── relatorios/
```

As seis pastas já existiam; a única renomeada foi `identidade visual` →
`identidade-visual`. **Nenhuma pasta foi criada**: `consentimentos/`,
`caderno-estudos/`, `derivados-publicos/` e `nao-classificados/` continuam
inexistentes, porque não há conteúdo que as justifique.

## 4. Entrevistas (§5)

Estrutura `NN-slug/{audio,transcricao}/`. O slug usa o nome da pessoa quando
ele é incontestado, e a instituição ou o cargo quando o nome está em disputa —
assim o nome físico não afirma o que ainda está em aberto.

| Pasta física | Rótulo humano (grafia correta) | Critério do slug |
|---|---|---|
| `01-josenilson-bispo/` | Entrevista 01 — Josenilson Bispo (“Nilsinho”), Secretário de Cultura de Tobias Barreto, 27/03/2026 | áudio nomeia Josenilson Bispo e a pasta datou 27-03-2026 |
| `02-oviedo-e-neide-abreu/` | Entrevista 02 — Oviêdo Abreu e Neide Abreu, Centro Cultural e Museu Borda da Mata | nomes conferem com o inventário |
| `03-fundacao-cultura-sao-cristovao/` | Entrevista 03 — Fundação de Cultura de São Cristóvão | slug pela instituição, que a pasta declara. **Correção de 2026-09-05:** não havia disputa de nome — a transcrição registra o nome completo *Paola Rodrigues de Santana*, do qual *Santana* e *Rodrigues* são fragmentos. Canônico: Paola Santana. O slug institucional foi mantido |
| `04-diretor-turismo-sao-cristovao/` | Entrevista 04 — Diretor de Turismo de São Cristóvão (Márcio André; transcrição também cita Ian Victor) | slug pelo cargo. **Correção de 2026-09-05:** não havia conflito de pessoa — o entrevistado declara *Márcio André Soares Ramos*, de que *marcio-ramos* é fragmento. Canônico: Márcio André, Diretor de Turismo. Ian Victor Batista de Araújo participa e autoriza, mas não é o entrevistado principal. O slug pelo cargo foi mantido |
| `05-pedro-menezes/` | Entrevista 05 — Pedro Menezes, Recanto da Serra | nome confere com o inventário |
| `06-dilson-de-agripino/` | Entrevista 06 — Dilson de Agripino, Prefeito de Tobias Barreto | transcrição nomeia Dilson de Agripino; cargo confere |
| `07-laerte-aguiar/` | Entrevista 07 — Laerte Aguiar, Secretário Municipal de Cultura de Tomar do Geru | nome e cargo explícitos na pasta e na transcrição |
| `08-dona-mada/` | Entrevista 08 — Dona Madá, Ilha Grande (informal) | nome e local explícitos; a data 11/04/2026 do inventário segue não confirmada |

Cada pasta tem exatamente um áudio e uma transcrição, nomeados
`entrevista-NN-slug-audio.<ext>` e `entrevista-NN-slug-transcricao.pdf`.

## 5. Renomeações executadas (§4)

- Arquivos renomeados: **97** de 138
- Diretórios renomeados: **35**
- Colisões detectadas: **0**
- Itens deixados de fora por ambiguidade: **0**

Convenção aplicada: minúsculas, kebab-case, ASCII, sem espaço, sem
caractere problemático para URL ou Windows. A extensão foi preservada em
formato e passada a minúscula (`.HEIC` → `.heic`), o que não converte nada.

### Mapa completo, por pasta

#### `entrevistas/`

| Nome original | Nome normalizado |
|---|---|
| `Transcrição completa da entrevista Nilsinho.pdf` | `entrevista-01-josenilson-bispo-transcricao.pdf` |
| `Entrevista com Josenilson Bispo 27-03.m4a` | `entrevista-01-josenilson-bispo-audio.m4a` |
| `Transcrição completa Museu Borda da Mata.pdf` | `entrevista-02-oviedo-e-neide-abreu-transcricao.pdf` |
| `Entrevista com o Centro Cultural Borda da Mata 28-03.m4a` | `entrevista-02-oviedo-e-neide-abreu-audio.m4a` |
| `Transcrição completa.pdf` | `entrevista-03-fundacao-cultura-sao-cristovao-transcricao.pdf` |
| `Entrevista com a fundação de cultura São Cristóvão 06-04.m4a` | `entrevista-03-fundacao-cultura-sao-cristovao-audio.m4a` |
| `Transcrição da entrevista Márcio André e Ian Victor.pdf` | `entrevista-04-diretor-turismo-sao-cristovao-transcricao.pdf` |
| `Entrevista com o diretor de turimo de São Cristóvão 06-04.m4a` | `entrevista-04-diretor-turismo-sao-cristovao-audio.m4a` |
| `Transcrição completa - Entrevista pedro menezes (revisado).pdf` | `entrevista-05-pedro-menezes-transcricao.pdf` |
| `Entrevista com o Recanto da Serra 05-04-26.m4a` | `entrevista-05-pedro-menezes-audio.m4a` |
| `Transcrição da entrevista Dilson de Agripino.pdf` | `entrevista-06-dilson-de-agripino-transcricao.pdf` |
| `entrevista-dilson-prefeito-tobias.m4a` | `entrevista-06-dilson-de-agripino-audio.m4a` |
| `Transcrição da entrevista com Secretário Municipal de Cultura de Tomar do Geru .pdf` | `entrevista-07-laerte-aguiar-transcricao.pdf` |
| `Entrevista com Laerte Aguiar (Secretário Municipal de Cultura da cidade de Tomar do Geru).mp3` | `entrevista-07-laerte-aguiar-audio.mp3` |
| `TRANSCRIÇÃO COMPLETA - DONA MADA (ILHA GRANDE).pdf` | `entrevista-08-dona-mada-transcricao.pdf` |
| `Entrevista Dona Mada Ilha Grande.mp3` | `entrevista-08-dona-mada-audio.mp3` |

#### `formularios/`

| Nome original | Nome normalizado |
|---|---|
| `Formulário Borda da Mata (respostas).xlsx` | `formulario-borda-da-mata-respostas.xlsx` |
| `Formulário Recanto da Serra (respostas).xlsx` | `formulario-recanto-da-serra-respostas.xlsx` |
| `Formulário de funcionamento (Pedro e Oviedo).xlsx` | `formulario-de-funcionamento-pedro-e-oviedo.xlsx` |
| `00_Capa.pdf` | `00-capa.pdf` |
| `01_Sumário.pdf` | `01-sumario.pdf` |
| `02_Painel_Executivo.pdf` | `02-painel-executivo.pdf` |
| `03_Indicadores_Solidaria.pdf` | `03-indicadores-solidaria.pdf` |
| `04_Publico_Mensuracao.pdf` | `04-publico-mensuracao.pdf` |
| `05_Serie_Mensal.pdf` | `05-serie-mensal.pdf` |
| `06_Pessoas_Trabalho.pdf` | `06-pessoas-trabalho.pdf` |
| `07_Localidades.pdf` | `07-localidades.pdf` |
| `08_Fornecedores.pdf` | `08-fornecedores.pdf` |
| `09_Atividades.pdf` | `09-atividades.pdf` |
| `10_Conciliacao.pdf` | `10-conciliacao.pdf` |
| `11_Nota_Metodologica.pdf` | `11-nota-metodologica.pdf` |
| `12_Perfil_Visitantes.pdf` | `12-perfil-visitantes.pdf` |
| `13_Motivacao_Atividades.pdf` | `13-motivacao-atividades.pdf` |
| `14_Consumo_Percepcao.pdf` | `14-consumo-percepcao.pdf` |
| `15_Grupos_Institucionais.pdf` | `15-grupos-institucionais.pdf` |
| `16_Dicionario_Dados.pdf` | `16-dicionario-dados.pdf` |
| `Anexo_Indicadores_Observatorio_PNAB_Estatico_Final (1).xlsx` | `anexo-indicadores-observatorio-pnab-estatico-final.xlsx` |

#### `fotos/`

| Nome original | Nome normalizado |
|---|---|
| `conversa-com-oviedo-dentro-da-casa-de-taipa.HEIC` | `conversa-com-oviedo-dentro-da-casa-de-taipa.heic` |
| `conversa-com-oviedo-e-neide-abreu.HEIC` | `conversa-com-oviedo-e-neide-abreu.heic` |
| `espaço-do-historiador.HEIC` | `espaco-do-historiador.heic` |
| `frente-casa-de-taipa.HEIC` | `frente-casa-de-taipa.heic` |
| `frente-do-museu-borda-da-mata.HEIC` | `frente-do-museu-borda-da-mata.heic` |
| `geladeira-em-conversa-com-discos-e-cds-dentro.HEIC` | `geladeira-em-conversa-com-discos-e-cds-dentro.heic` |
| `lhucas-concedendo-entrevista-à-pedro.HEIC` | `lhucas-concedendo-entrevista-a-pedro.heic` |
| `marcio-ramos-foto-por-Dani-Santos.jpg` | `marcio-ramos-foto-por-dani-santos.jpg` |
| `equipe-com-laerte-aguiar.HEIC` | `equipe-com-laerte-aguiar.heic` |
| `equipe-com-laerte-aguiar2.HEIC` | `equipe-com-laerte-aguiar2.heic` |
| `equipe-com-laerte-aguiar3.HEIC` | `equipe-com-laerte-aguiar3.heic` |
| `equipe-com-laerte-aguiar4.HEIC` | `equipe-com-laerte-aguiar4.heic` |
| `equipe-com-laerte-aguiar5.HEIC` | `equipe-com-laerte-aguiar5.heic` |
| `conhecendo-o-museu-e-memorial-epifanio-doria.HEIC` | `conhecendo-o-museu-e-memorial-epifanio-doria.heic` |
| `momento-conversando-com-pedro2.HEIC` | `momento-conversando-com-pedro2.heic` |
| `visita-a-mensagem-de-silo2.HEIC` | `visita-a-mensagem-de-silo2.heic` |
| `visita-da-equipe-com-oviedo-e-neide-ao-recanto-da-serra.HEIC` | `visita-da-equipe-com-oviedo-e-neide-ao-recanto-da-serra.heic` |
| `visita-na-mensagem-de-silo.PNG` | `visita-na-mensagem-de-silo.png` |

#### `identidade visual/`

| Nome original | Nome normalizado |
|---|---|
| `LOGO OFICIAL TOBIAS SOU EU.png` | `logo-oficial-tobias-sou-eu.png` |
| `Horizontal - Monocromática escura.png` | `horizontal-monocromatica-escura.png` |
| `Horizontal - Monocromática escura.svg` | `horizontal-monocromatica-escura.svg` |
| `logo+texto.png` | `logo-e-texto.png` |
| `primeiro post observatorio.pdf` | `primeiro-post-observatorio.pdf` |

#### `marcas/`

| Nome original | Nome normalizado |
|---|---|
| `MARCAS - -02.png` | `marcas-02.png` |
| `MARCAS - -03.png` | `marcas-03.png` |
| `MARCAS - -04.png` | `marcas-04.png` |
| `MARCAS - -05.png` | `marcas-05.png` |
| `MARCAS - -06.png` | `marcas-06.png` |
| `MARCAS - -07.png` | `marcas-07.png` |
| `MARCAS - -08.png` | `marcas-08.png` |
| `MARCAS - -09.png` | `marcas-09.png` |
| `MARCAS - -10.png` | `marcas-10.png` |
| `MARCAS - -11.png` | `marcas-11.png` |
| `MARCAS - -12.png` | `marcas-12.png` |
| `MARCAS - -13.png` | `marcas-13.png` |
| `MARCAS - -14.png` | `marcas-14.png` |
| `MARCAS - -15.png` | `marcas-15.png` |
| `MARCAS - -16.png` | `marcas-16.png` |
| `MARCAS - -17.png` | `marcas-17.png` |
| `MARCAS - -18.png` | `marcas-18.png` |
| `MARCAS - -19.png` | `marcas-19.png` |
| `MARCAS - -20.png` | `marcas-20.png` |
| `MARCAS - -21.png` | `marcas-21.png` |
| `MARCAS - -22.png` | `marcas-22.png` |
| `MARCAS - -23.png` | `marcas-23.png` |
| `MARCAS - -24.png` | `marcas-24.png` |
| `MARCAS - -25.png` | `marcas-25.png` |
| `MARCAS - -26.png` | `marcas-26.png` |
| `MARCAS - -27.png` | `marcas-27.png` |
| `MARCAS - -28.png` | `marcas-28.png` |
| `MARCAS - -29.png` | `marcas-29.png` |
| `MARCAS - -30.png` | `marcas-30.png` |
| `MARCAS - -31.png` | `marcas-31.png` |
| `MARCAS - -32.png` | `marcas-32.png` |
| `MARCAS - -33.png` | `marcas-33.png` |
| `MARCAS - -34.png` | `marcas-34.png` |
| `MARCAS - _Prancheta 1.png` | `marcas-prancheta-1.png` |

#### `relatorios/`

| Nome original | Nome normalizado |
|---|---|
| `RELATORIO TECNICO_SERRA_DOS_MACACOS.pdf` | `relatorio-tecnico-serra-dos-macacos.pdf` |
| `RELATORIO_TECNICO_BORDA_DA_MATA.pdf` | `relatorio-tecnico-borda-da-mata.pdf` |
| `RELATORIO_TECNICO_RECANTO.pdf` | `relatorio-tecnico-recanto-da-serra.pdf` |

### Decisões de nomenclatura que merecem registro

| Original | Normalizado | Por quê |
|---|---|---|
| `RELATORIO_TECNICO_RECANTO.pdf` | `relatorio-tecnico-recanto-da-serra.pdf` | alinhado ao slug de A02 no inventário |
| `RELATORIO TECNICO_SERRA_DOS_MACACOS.pdf` | `relatorio-tecnico-serra-dos-macacos.pdf` | tinha espaço no meio; slug de A04 |
| `Anexo_..._Final (1).xlsx` | `anexo-indicadores-observatorio-pnab-estatico-final.xlsx` | o `(1)` é artefato de download repetido, não versão; não há segunda cópia |
| `logo+texto.png` | `logo-e-texto.png` | `+` é problemático em URL |
| `MARCAS - -02.png` | `marcas-02.png` | separador duplicado do export |

## 6. Reconciliação do material novo — proposta, não aplicada

### Vínculo seguro

| Item | Arquivo | Prova |
|---|---|---|
| **A02** | `relatorios/relatorio-tecnico-recanto-da-serra.pdf` | nome do arquivo declara o equipamento |
| **A03** | `relatorios/relatorio-tecnico-borda-da-mata.pdf` | idem |
| **A04** | `relatorios/relatorio-tecnico-serra-dos-macacos.pdf` | idem |

**Isto encerra o conflito mais grave da auditoria:** A02, A03 e A04 apontavam
para um único documento do Google Docs. Agora são três arquivos distintos,
com três hashes distintos.

### Vínculo provável, não fechado

| Item candidato | Arquivo | Por que não fechei |
|---|---|---|
| **E02** — Manual de marcas | `marcas/` (34 PNGs) | a sequência `marcas-02` a `marcas-34` sugere páginas de manual, mas **não abri nenhuma imagem**. Confirmar se é o manual do edital, e qual página traz proporção e ordem |
| **D01** — Identidade visual | `identidade-visual/` (8 arquivos) | plausível pelo nome da pasta; D01 não é exigido pelo edital |
| **A01** — Painel Vivo de Dados | `formularios/indicadores-observatorio/` | 17 PDFs + planilha compõem um anexo de indicadores; não é evidente que sejam o “painel vivo” do Figma |

### Arquivo sem item

| Arquivo | Observação |
|---|---|
| `formularios/formulario-borda-da-mata-respostas.xlsx` | são **respostas**, não o instrumento. A09 e A10 pedem o **modelo** do formulário |
| `formularios/formulario-recanto-da-serra-respostas.xlsx` | idem |
| `formularios/formulario-de-funcionamento-pedro-e-oviedo.xlsx` | idem |
| `formularios/indicadores-observatorio/*` (18) | nenhum item do inventário descreve um anexo de indicadores com 17 seções |

Nenhum vínculo foi gravado no banco. `documento`, `arquivo`,
`documento_arquivo` e `consentimento` continuam com zero linhas.

## 7. O que continua em aberto

- **Consentimento:** **corrigido em 2026-09-05.** Não existe nem deve existir
  termo separado — a autorização é **verbal e gravada**, no áudio e na
  transcrição. Localizada em **7 das 8** entrevistas. Os 8 áudios e as 8
  transcrições seguem `RESTRITO` de todo modo, por decisão de etapa.
- ~~B05 — Paola Santana ou Rodrigues~~ **resolvido:** nome completo
  *Paola Rodrigues de Santana*, declarado na própria entrevista.
- ~~Pasta 04 — três nomes em circulação~~ **resolvido:** *Márcio André
  Soares Ramos*, Diretor de Turismo. Ian Victor é outra pessoa presente.
- **B07 — Itabaianinha:** sem fonte, e agora se sabe por quê — o item era
  previsão de agenda anterior à entrevista, que não ocorreu. Nenhum item
  criado para preencher meta.
- **Entrevistas 04 e 07:** sem item no inventário; propostos **B14** e
  **B13** na auditoria canônica.
- **Data de B06:** 11/04/2026 segue não confirmada por nenhum arquivo.
- **Relatório de Objeto:** não localizado; a expressão só aparece no plano.
- **Caderno de Estudos:** `PENDENTE`; não bloqueia o site.
- **Privacidade:** 56 fotos e 16 arquivos de entrevista seguem marcados para
  revisão. O material novo **não foi triado** — os 18 arquivos de indicadores
  incluem `12-perfil-visitantes.pdf` e `14-consumo-percepcao.pdf`, que são
  justamente o tipo de documento que a nota metodológica manda anonimizar.

## 8. O que esta etapa não fez

- Não alterou infraestrutura, migrations nem banco.
- Não fez upload e não publicou nada.
- Não alterou o conteúdo interno de nenhum arquivo: só nome e caminho.
- Não converteu, comprimiu nem redesenhou nada.
- Não escolheu variante de marca nem de logo.
- Não criou pasta sem conteúdo que a justificasse.
- Não fez commit nem push.
- Não iniciou o Prompt 3.
