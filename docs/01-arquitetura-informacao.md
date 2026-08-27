# Arquitetura de Informação e Técnica
## Site do Observatório de Cultura e Economia Criativa na Região do Vale do Rio Real

**Executor:** Coletivo Cultural "Tobias, sou Eu!"
**Fomento:** Edital de Chamamento Público PNAB nº 02/2025 — Observatórios de Cultura e Economia Criativa
**Avaliação / prestação de contas:** FUNCAP — Sergipe
**Documento:** v1 — especificação de arquitetura (pré-implementação)

---

## 0. Leitura estratégica antes da arquitetura

Três observações do material enviado que condicionam todas as decisões abaixo:

1. **O cronograma do projeto já se encerrou.** A entrega do Relatório Final de Execução estava prevista para 16/07/2026 e a publicização em "portal digital de domínio público" para 05–08/05/2026. Portanto o site **não é mais uma peça de divulgação em curso: é o repositório permanente e a prova documental do objeto executado**. Isso muda a prioridade: durabilidade e rastreabilidade dos links vêm antes de qualquer sofisticação visual.

2. **O maior risco técnico do projeto hoje é a fragilidade dos links.** O documento "Links de Referência" aponta para Google Drive, Google Docs, Google Forms (`/edit#responses` — link de edição, não de leitura) e Figma. Esses endereços quebram, mudam de permissão, dependem de conta e não sobrevivem a uma auditoria feita daqui a dois anos. **A função primária do site é substituir esses links por URLs próprias, estáveis e públicas.**

3. **Há lacunas declaradas no inventário.** Continuam marcados como `[Inserir link aqui]`: Diagnósticos Internos, Relatos de Campo, Documento Final / Modelagem Estatística e o Podcast. São bloqueadores de conteúdo, não de código — o site pode ser construído sem eles, mas não pode ser publicado sem eles.

---

## 1. Objetivos do sistema

| # | Objetivo | Como a arquitetura responde |
|---|---|---|
| O1 | Comprovar a execução do objeto perante a FUNCAP | Sala do Avaliador + Portal da Transparência + página de Metas |
| O2 | Publicizar a pesquisa em domínio público | Documento Final em HTML acessível + PDF + dados abertos |
| O3 | Divulgar o PodObservar como ferramenta de acessibilidade atitudinal | Seção própria com player, transcrição e feed RSS |
| O4 | Alcançar jovens do Ensino Médio de Tobias Barreto | Trilha educativa (glossário, material para professores, linguagem simples) |
| O5 | Devolver conhecimento ao território | Páginas por equipamento cultural, mapa, galeria de campo |
| O6 | Permitir continuidade do observatório após o edital | Modelo de conteúdo extensível a novas temporadas/pesquisas |

---

## 2. Públicos e caminhos de entrada

| Público | O que procura | Rota mais curta |
|---|---|---|
| **Avaliador FUNCAP / técnico do edital** | Comprovantes, metas, anexos, cronograma | `/prestacao-de-contas` (uma página, tudo linkado) |
| **Jovem do Ensino Médio** | Algo curto, ouvível, compreensível | Home → `/podobservar` → `/glossario` |
| **Gestor público municipal** | Diagnóstico, recomendações, comparativo entre municípios | `/pesquisa/politicas-publicas` |
| **Pesquisador / universidade / IFS** | Metodologia, dados brutos, como citar | `/dados` |
| **Comunidade e atores-chave** | Ver o próprio território representado | `/equipamentos/[slug]`, `/campo/galeria` |
| **Imprensa e rádios locais** | Release, logo, fotos, contato | `/imprensa` |

Cada público precisa chegar ao seu destino em **no máximo dois cliques a partir da home**. Esse é o critério de aceite da navegação.

---

## 3. Mapa do site (sitemap)

```
/                                   Home
│
├── /observatorio                   O que é o Observatório
│   ├── /observatorio/coletivo      O Coletivo "Tobias, sou Eu!"
│   ├── /observatorio/equipe        Pesquisadores e agentes culturais (7 contratações)
│   ├── /observatorio/metodologia   Percurso metodológico e suas alterações
│   └── /observatorio/linha-do-tempo
│
├── /pesquisa                       Hub da pesquisa
│   ├── /pesquisa/documento-final   Leitura em HTML, capítulo a capítulo + download PDF
│   ├── /pesquisa/vale-do-rio-real  O território
│   ├── /pesquisa/politicas-publicas  Comparativo entre os municípios
│   └── /pesquisa/como-citar        Referência + DOI
│
├── /equipamentos                   Índice dos equipamentos estudados
│   ├── /equipamentos/recanto-da-serra
│   ├── /equipamentos/borda-da-mata
│   ├── /equipamentos/serra-dos-macacos
│   ├── /equipamentos/ilha-grande
│   └── /equipamentos/pedra-branca        (caso: rota desativada)
│
├── /dados                          Portal de Dados Abertos
│   ├── /dados/painel-vivo          Figma incorporado + espelho estático
│   ├── /dados/relatorios-tecnicos
│   ├── /dados/diagnosticos
│   ├── /dados/formularios          Modelos + resultados agregados
│   └── /dados/downloads            CSV/JSON anonimizados + licença
│
├── /campo                          Diário de Campo
│   ├── /campo/visitas              As 7 visitas (I a VII) + II Serra dos Macacos
│   ├── /campo/entrevistas          Índice de entrevistas
│   │   └── /campo/entrevistas/[slug]   Áudio + transcrição + ficha
│   ├── /campo/relatos              Lhucas, Fabricio, Luiz, Galileu
│   └── /campo/galeria              Fotografias de comprovação
│
├── /podobservar                    Podcast
│   ├── /podobservar/t1/[episodio]  Player + transcrição + destaques
│   └── /podobservar/ouvir          Plataformas, RSS, download offline
│
├── /educacao                       Trilha educativa
│   ├── /educacao/glossario
│   ├── /educacao/para-professores  Plano de aula com o podcast
│   └── /educacao/na-comunidade     Escolas, IFS, rádios
│
├── /mapa                           Mapa interativo do Vale do Rio Real
│
├── /prestacao-de-contas            ★ Sala do Avaliador
│   ├── /prestacao-de-contas/metas  Alcançadas / em desenvolvimento / não iniciadas
│   ├── /prestacao-de-contas/cronograma
│   └── /prestacao-de-contas/anexos Índice mestre de todos os anexos
│
├── /imprensa                       Kit de imprensa e identidade visual
├── /noticias                       Atualizações (opcional, alimenta redes)
├── /acessibilidade                 Declaração de acessibilidade
├── /privacidade                    LGPD, consentimentos, anonimização
└── /contato
```

**Menu principal (6 itens, teto cognitivo):**
`O Observatório · A Pesquisa · Dados · Diário de Campo · PodObservar · Educação`

**Rodapé:** Prestação de Contas · Imprensa · Acessibilidade · Privacidade · Contato · **bloco de créditos de fomento**.

---

## 4. A "Sala do Avaliador" — a página mais importante do site

`/prestacao-de-contas` é a tradução literal do PDF "Links de Referência" para a web, e resolve o problema de fragilidade descrito na seção 0. Uma tabela única, imprimível, com:

| Coluna | Conteúdo |
|---|---|
| Item do edital | Ex.: "Anexo — Relatórios Técnicos" |
| Descrição | Texto curto |
| Formato | PDF, MP3, CSV, painel |
| **Link permanente** | URL do próprio site (`obsvaledoriorreal.org/arquivos/...`) |
| Link de origem | Drive/Figma, como redundância |
| Data de publicação | ISO |
| Hash SHA-256 | Integridade do arquivo (diferencial forte em auditoria) |

Recursos: botão **"Baixar tudo (.zip)"**, versão **imprimível em PDF** da própria tabela e um **`/anexos.json`** legível por máquina. O avaliador nunca precisa de login, nunca pede permissão de acesso, nunca encontra link morto.

---

## 5. Modelo de conteúdo (entidades)

O site não é um conjunto de páginas soltas — é um pequeno acervo. Modelar assim permite reuso, filtros e novas temporadas sem reescrita.

**`Equipamento`** — nome, slug, município, povoado, coordenadas, tipo (ecoparque, museu, comunidade, rota), ator-chave, status (ativo/desativado), síntese, indicadores, galeria, relações → `Visita[]`, `Entrevista[]`, `Documento[]`

**`Documento`** — título, tipo (relatório técnico, diagnóstico interno, relato de campo, formulário, documento final), autoria, data, arquivo, tamanho, hash, licença, resumo, `equipamento?`, `metaRelacionada?`

**`Entrevista`** — entrevistado, cargo/vínculo, instituição, data, local, duração, áudio, transcrição, temas[], consentimento (obrigatório), trechos destacados

**`Visita`** — numeral (I–VII), data, horário, local, participantes, fotos[], relato vinculado

**`Episodio`** (PodObservar) — número, título, temporada, duração, áudio, transcrição integral, capítulos, convidados, documentos citados

**`Meta`** — texto original do projeto aprovado, status, evidências → `Documento[]`, nota de execução (por que mudou, quando mudou)

**`Termo`** (glossário) — termo, definição em linguagem simples, exemplo local, ver-também

**`Pessoa`** — nome, papel, bio curta, foto, vínculos

**`Municipio`** — nome, dados públicos, políticas identificadas, entrevistas ligadas

Taxonomias transversais: `tema` (economia solidária, ecoturismo, patrimônio imaterial, agricultura familiar, política cultural), `municipio`, `etapa do projeto`, `tipo de evidência`.

---

## 6. Arquitetura técnica

```
┌──────────────────────────────────────────────────┐
│  Next.js (App Router) · SSG/ISR · TypeScript     │
│  Tailwind + Radix UI (acessibilidade nativa)     │
└──────────────────────────────────────────────────┘
        │                    │                 │
   Conteúdo             Arquivos           Integrações
   MDX no repo          Vercel Blob        Figma (embed)
   ou CMS leve          ou R2/S3           Player de áudio
   (Decap/Sanity)       + /public          Leaflet + OSM
                        PDFs, áudios,      Instagram (link,
                        CSVs, imagens      não widget)
        │
   Deploy: Vercel (preview por branch, domínio próprio)
```

**Decisões e justificativas:**

- **Estático primeiro (SSG).** Conteúdo é de arquivo, não transacional. Resultado: custo próximo de zero, resistência a picos de acesso (divulgação em rádio) e sobrevida do site mesmo sem manutenção ativa.
- **Sem banco de dados na v1.** Formulários já foram coletados no Google Forms; publicamos os resultados agregados como CSV/JSON versionado. Banco só entraria se houver coleta contínua.
- **Conteúdo em MDX versionado no Git** é a opção mais durável e barata. Se a equipe precisar editar sem tocar em código, use **Decap CMS** (roda sobre o próprio Git, sem servidor) antes de considerar um headless pago.
- **Espelho local obrigatório de todo anexo.** Nenhum item da prestação de contas pode depender exclusivamente de Drive/Figma. O Figma entra como *embed* de conveniência, com **captura estática do painel em PDF/PNG** publicada ao lado.
- **Padrão de URL:** minúsculas, sem acento, hífen, sem data no caminho, sem `/index`. URLs de arquivo em `/arquivos/[categoria]/[slug]-[versao].pdf`. Toda mudança de rota exige `301`.
- **Corrigir os links do inventário:** o Google Forms está publicado com `/edit#responses` (link de edição). Publicar o **modelo do formulário** e, separadamente, os **resultados anonimizados**.

**Preservação digital (recomendação forte):** depositar o Documento Final e a base de dados no **Zenodo** para obter **DOI** citável, e registrar o site no **Internet Archive** após a publicação. Isso dá permanência mesmo que o domínio expire — e é um argumento excelente na prestação de contas.

---

## 7. Requisitos não funcionais

| Requisito | Meta |
|---|---|
| Acessibilidade | **WCAG 2.1 nível AA** + eMAG; navegação por teclado; foco visível; contraste ≥ 4.5:1; `lang="pt-BR"`; skip links; textos alternativos em todas as fotos de campo |
| Recursos de acessibilidade | Alto contraste, aumento de fonte, **VLibras**, transcrição de 100% dos áudios, versão em **linguagem simples** do documento final |
| Desempenho | Lighthouse ≥ 90 em todas as categorias; LCP < 2,5s em 3G — o público rural e escolar acessa por celular com rede fraca |
| Peso | Home < 500 KB; imagens em WebP/AVIF com `loading="lazy"` |
| SEO / dados estruturados | JSON-LD `Dataset`, `Report`, `PodcastEpisode`, `Place`; sitemap.xml; OG images |
| Privacidade | Sem rastreadores de terceiros; analytics sem cookies (Plausible/Umami); política LGPD explícita |
| Compatibilidade | Funcionar sem JavaScript nas páginas de leitura e download |
| Idioma | pt-BR; considerar resumo em inglês/espanhol apenas na página do documento final |

---

## 8. O que acrescentar ao site (sugestões além do escopo mínimo)

**Alto impacto na avaliação do edital**

1. **Página de Metas com semáforo de status** — reproduz literalmente as metas do projeto aprovado e, ao lado de cada uma, a evidência clicável e a *nota de execução* explicando substituições metodológicas (relatórios mensais → Painel Vivo + Diagnóstico Interno). Transformar a justificativa metodológica em recurso navegável é a forma mais eficiente de antecipar questionamentos.
2. **Bloco de créditos de fomento fixo no rodapé e na capa dos PDFs** — PNAB / Lei Aldir Blanc, Ministério da Cultura, Governo Federal, Governo de Sergipe e FUNCAP, com as marcas nas proporções exigidas pelo manual de aplicação do edital. Verifique o manual antes de fechar o layout; é uma causa recorrente de ressalva.
3. **Painel de números do projeto** na home: 5 meses de coleta, 40 formulários de rotina de funcionamento, 63 registros de público consumidor, 7 visitas de campo, 7 trabalhos remunerados a fazedores de cultura, 3 municípios. Números concretos comunicam execução melhor que texto.
4. **Página de dados abertos com licença explícita** (sugestão: CC BY-SA 4.0 para textos, CC0 para os dados agregados) e um `README` de dicionário de dados.

**Alto impacto no público-alvo e na continuidade**

5. **Área "Para Professores"** — plano de aula de 50 minutos usando um episódio do PodObservar, com perguntas disparadoras e atividade de campo. Converte o podcast em política educativa concreta e documenta a contrapartida social nas escolas (Samambaia, Abelardo Barreto do Rosário, Prof. Maria Lucilene, IFS).
6. **Mapa interativo do Vale do Rio Real** (Leaflet + OpenStreetMap, sem chave de API) com camadas: equipamentos ativos, potenciais, desativados (Pedra Branca) e rotas tropeiras históricas. Para o avaliador externo, o mapa é o que torna o território legível.
7. **Glossário de economia criativa em linguagem simples**, com exemplo local em cada verbete ("economia solidária: quando o Recanto compra o queijo do vizinho em vez de..."). Verbetes viram *tooltips* no documento final.
8. **"Ouça esta página"** — cada página longa com o trecho correspondente do podcast ou áudio sintetizado, coerente com o conceito de acessibilidade atitudinal defendido no relatório.
9. **Formulário de escuta permanente** — permitir que moradores e gestores enviem informações, corrigindo o risco do observatório "acabar" com o edital. Alimenta uma segunda temporada.
10. **Página do caso Pedra Branca** — a rota desativada é um achado de pesquisa, não uma meta frustrada. Tratada como estudo de caso ("o que acontece quando um equipamento fecha"), fortalece a análise de políticas públicas.

**Higiene e risco**

11. **Página de privacidade e consentimento** — entrevistas gravadas e fotografias de pessoas exigem base legal na LGPD. Publicar o modelo de termo de consentimento usado e o critério de anonimização dos formulários de público consumidor.
12. **"Como citar esta pesquisa"** com ABNT, BibTeX e DOI.
13. **Metodologia replicável / kit para outros coletivos** — publicar os modelos de formulário, o roteiro semiestruturado e o desenho do painel Figma como material reaplicável. É a contrapartida de transferência de conhecimento mais valorizada em editais de observatório.
14. **Busca interna** e página 404 que devolve para a Sala do Avaliador.

---

## 9. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Links do Drive/Figma quebram ou pedem permissão | Alto — inviabiliza comprovação | Espelho local de todo arquivo + hash + Zenodo |
| Anexos ainda sem link (diagnósticos, relatos, documento final, podcast) | Alto — bloqueia publicação | Fechar inventário antes da Fase 2 |
| Áudios de entrevista sem consentimento formalizado | Alto — jurídico | Publicar apenas transcrição/trechos até regularizar |
| Domínio ou hospedagem expira após o edital | Alto — perda do objeto | Domínio pago por 5 anos + Internet Archive + repositório público no GitHub |
| Site pesado demais para a rede local das escolas | Médio | Orçamento de performance na seção 7 |
| Dependência de uma única pessoa para atualizar | Médio | Conteúdo em Git + Decap CMS + documentação de operação |

---

## 10. Roadmap sugerido

**Fase 1 — Fundação (1–2 semanas)**
Next.js + Tailwind no Vercel; design system e tokens de acessibilidade; layout base; Home; `/prestacao-de-contas` com a tabela mestre; migração de **todos** os arquivos para URLs próprias. *Já entrega valor de auditoria mesmo com o resto vazio.*

**Fase 2 — Pesquisa e dados (2–3 semanas)**
`/pesquisa`, documento final em HTML capítulo a capítulo, `/dados` com downloads e licença, `/equipamentos/[slug]`, `/prestacao-de-contas/metas`.

**Fase 3 — Território e voz (2 semanas)**
`/campo` (visitas, galeria, entrevistas com transcrição), `/podobservar` com player, transcrições e RSS, `/mapa`.

**Fase 4 — Educação e permanência (1–2 semanas)**
`/educacao`, `/imprensa`, `/acessibilidade`, `/privacidade`, auditoria WCAG, DOI no Zenodo, arquivamento no Internet Archive, documentação de operação.

---

## 11. Definição de pronto (checklist de publicação)

- [ ] Nenhum link externo é a única fonte de um anexo obrigatório
- [ ] Todos os áudios têm transcrição publicada
- [ ] Auditoria WCAG 2.1 AA sem erro crítico (axe + teste manual por teclado)
- [ ] Lighthouse ≥ 90 em Performance, Acessibilidade, Boas Práticas e SEO
- [ ] Créditos de fomento conforme o manual do edital, no site e nos PDFs
- [ ] Licença de uso declarada em textos, dados e imagens
- [ ] Consentimento verificado para cada pessoa identificável publicada
- [ ] `/anexos.json` e ZIP completo funcionando
- [ ] Site arquivado no Internet Archive e depósito com DOI concluído
