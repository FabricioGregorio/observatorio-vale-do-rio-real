# ADR-005 — Conteúdo editorial em MDX versionado no Git

## Status

Aceita

## Data

2025-08-27

## Contexto

O site tem dois tipos de conteúdo com naturezas distintas:

1. **Conteúdo editorial** — textos autorais, revisados por pessoas: home,
   metodologia, capítulos do documento final, páginas institucionais
   (acessibilidade, privacidade, imprensa). Muda por revisão humana em pull
   request.

2. **Dados estruturados** — metadados de equipamentos, documentos, entrevistas,
   metas, formulários, episódios. Muda por importação, seed ou painel
   administrativo futuro.

A ADR-001 definiu que o banco é a camada de gestão e o HTML estático é a camada
de preservação. A ADR-002 definiu PostgreSQL + Drizzle para os dados
estruturados. Resta definir onde vive o conteúdo editorial.

O risco de colocar tudo no banco: se o provedor ou a assinatura expirarem, o
conteúdo autoral morre junto — e é justamente o conteúdo que precisa de maior
durabilidade, por ser peça de comprovação do objeto executado (doc 01 §0).

## Decisão

Conteúdo editorial vive em **MDX versionado no Git**, na pasta `content/`:

```
content/
├── paginas/           # home, metodologia, acessibilidade, privacidade, etc.
└── documento-final/   # capítulos do documento final em HTML
```

O banco **não guarda** conteúdo editorial de páginas institucionais (doc 02 §17).

Regras de separação:

| Tipo de conteúdo | Onde vive | Por quê |
|---|---|---|
| Texto autoral de página | MDX no Git | Revisado por PR, sobrevive à morte do banco |
| Metadados de equipamento, documento, entrevista | PostgreSQL | Relações N:N, filtros, busca full-text |
| Binários (PDF, MP3, imagem, CSV) | Storage de objetos (R2/S3/Blob) | Fora do banco, URL própria + hash |

Se a equipe precisar editar conteúdo editorial sem tocar em código, usar
**Decap CMS** (roda sobre o próprio Git, sem servidor) antes de considerar um
headless pago (doc 01 §6).

## Alternativas consideradas

- **Tudo no banco:** conteúdo autoral ficaria preso ao provedor de PostgreSQL.
  Se o projeto perder a assinatura, perde o conteúdo. Inaceitável para
  prestação de contas com vida útil superior ao contrato (doc 01 §0).

- **CMS headless pago (Sanity, Contentful):** custo recorrente, dados fora do
  controle do projeto, dependência de terceiro para conteúdo que é peça
  documental.

- **Decap CMS sobre Git:** viável como camada de edição sobre o MDX, sem
  servidor adicional. Não é alternativa ao MDX — é complemento. Pode ser
  adicionado se a equipe precisar editar sem abrir código.

- **Markdown puro (sem MDX):** funciona para texto simples, mas não permite
  componentes interativos inline (tooltips do glossário, player de áudio
  embutido no documento final).

## Consequências

Benefícios:

- Conteúdo autoral sobrevive à morte do banco, à expiração do provedor e à
  ausência de manutenção ativa.
- Revisão por pull request dá rastreabilidade completa de quem mudou o quê e
  quando — relevante em prestação de contas.
- MDX permite componentes React inline sem perder a legibilidade do texto.
- Sem custo adicional de CMS.

Custos:

- Editar conteúdo exige familiaridade com Git (mitigável com Decap CMS).
- Duas fontes de conteúdo (MDX + banco) exigem clareza sobre onde cada tipo de
  informação vive — esta ADR é essa clareza.
- Componentes MDX precisam ser mantidos e testados como qualquer outro
  componente React.

## Impacto técnico

Arquivos ou módulos afetados:

- `content/paginas/` — páginas institucionais e editoriais
- `content/documento-final/` — capítulos do documento final
- `src/app/` — rotas que renderizam MDX usam pipeline de compilação em build time
- `src/componentes/acervo/` — componentes reutilizáveis dentro do MDX
- `db/schema.ts` — **não** inclui tabelas de conteúdo editorial (doc 02 §17)

Fontes:

- doc 01 §6 ("Conteúdo em MDX versionado no Git é a opção mais durável e barata")
- doc 01 §6 ("Decap CMS roda sobre o próprio Git, sem servidor")
- doc 02 §0 ("O banco é a camada de gestão")
- doc 02 §17 ("Não guarda o conteúdo editorial das páginas institucionais")
- doc 03 §1 (stack: "Conteúdo editorial: MDX versionado no Git")
- doc 03 §2 (estrutura: `content/paginas/`, `content/documento-final/`)
- doc 03 §5 ("Componentes. Server Component por padrão")
