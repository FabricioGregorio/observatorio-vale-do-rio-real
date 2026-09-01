# ADR-006 — Cloudflare R2 como provedor de storage de objetos

## Status

Aceita

## Data

2026-08-30

## Contexto

A ADR-003 decidiu que todo binário do acervo — PDF, MP3, imagem, CSV — vive em
armazenamento de objetos, fora do PostgreSQL, com URL própria do domínio e hash
SHA-256 registrado no banco. Mas ela deixou o **provedor** em aberto, listando
"Vercel Blob, Cloudflare R2 ou S3" sem escolher um. O doc 02 §15 tem a mesma
indefinição ao falar de backup: "`pg_dump` diário para R2/S3".

Essa indefinição bloqueia a Tarefa 05 em diante: não dá para implementar upload,
espelhamento e geração de URL sem saber contra qual API se programa.

Restrições já definidas:

- Volume pequeno: acervo de projeto de pesquisa, não plataforma de mídia.
- Download público e sem login é requisito, não detalhe — a Sala do Avaliador
  oferece "Baixar tudo (.zip)" e cada anexo tem link permanente (doc 01 §4, §6).
- URL sob domínio próprio, no padrão `/arquivos/[categoria]/[slug]-[versao].pdf`
  (ADR-003, doc 01 §6).
- O mesmo storage recebe o backup lógico do banco (doc 02 §15).
- Orçamento de edital, sem margem para custo variável imprevisível.
- A camada de preservação não pode depender do provedor de hospedagem do site
  (ADR-001).

## Decisão

Adotar **Cloudflare R2** como provedor de armazenamento de objetos.

O acesso é feito pela **API S3-compatível**, com credenciais em variáveis de
ambiente (`STORAGE_ENDPOINT`, `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`,
`STORAGE_SECRET`, `STORAGE_PUBLIC_URL`), nunca no código.

Permanece valendo integralmente a ADR-003: o banco guarda **metadados e
relacionamentos** — nome, tipo, versão, hash SHA-256, vínculo com `documento` —
e **nunca o conteúdo binário**. O R2 guarda os bytes.

O R2 é também o destino do `pg_dump` diário previsto no doc 02 §15, com retenção
de 30 dias e dump mensal versionado.

**A decisão é do provedor, não do formato de acesso.** Por usar API S3, trocar de
provedor no futuro é mudança de endpoint e credencial, não de código de aplicação.
Essa portabilidade é condição da escolha, não efeito colateral dela.

## Alternativas consideradas

- **Cloudflare R2** (escolhido)
  - Sem cobrança de egress. É o critério decisivo: o site existe para que
    avaliadores e o público **baixem** documentos, e o "Baixar tudo (.zip)" torna
    o tráfego de saída o custo dominante e o menos previsível.
  - API S3-compatível — ferramental e SDK padrão do mercado, sem lock-in de API.
  - Domínio customizado nativo, atendendo ao padrão de URL da ADR-003.
  - Faixa gratuita cobre com folga o volume previsto.

- **Vercel Blob**
  - Integração mais direta com a hospedagem já usada.
  - Rejeitado por acoplar a camada de preservação ao fornecedor de hospedagem —
    exatamente o acoplamento que a ADR-001 existe para evitar. Se o projeto
    trocar de hospedagem depois do edital, o acervo iria junto, por vínculo
    comercial e não por decisão técnica.
  - Custo de egress e de armazenamento acima do R2 no mesmo perfil de uso.

- **Amazon S3**
  - Padrão de mercado, durabilidade comprovada, ferramental maduro.
  - Rejeitado pelo custo de egress, que é justamente o padrão de uso deste
    projeto, e pela complexidade de IAM desproporcional a um acervo pequeno
    administrado por equipe não especializada.

- **Supabase Storage**
  - Descartado junto com o Supabase como provedor de banco (ADR-004); manter o
    storage lá exigiria conta e vínculo com um fornecedor que o projeto não usa
    para mais nada.

## Consequências

Benefícios:

- Custo de download previsível e próximo de zero, no cenário de uso que o
  projeto de fato tem.
- Nenhum código de aplicação preso ao provedor: a API S3 é a fronteira.
- Backup do banco e acervo no mesmo lugar, com uma credencial e uma rotina.
- A camada de preservação fica independente da hospedagem do site (ADR-001).

Custos e riscos:

- Mais um fornecedor na operação, com credencial própria a rotacionar.
- R2 não tem CDN de imagem com transformação embutida; redimensionamento, se
  vier a ser necessário, é responsabilidade do Next.js.
- Concentrar acervo e backup no mesmo provedor reduz o isolamento de falhas. É
  mitigado — mas não eliminado — pelo depósito trimestral no Zenodo com DOI, que
  a ADR-003 e o doc 02 §15 já definem como a garantia de longo prazo.
- A escolha não dispensa o espelho local obrigatório de todo anexo (ADR-003).

## Impacto técnico

Arquivos ou módulos afetados:

- `.env.example` / `.env.local` — `STORAGE_PROVIDER=r2`, `STORAGE_ENDPOINT`,
  `STORAGE_BUCKET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET`, `STORAGE_PUBLIC_URL`
- `db/schema.ts` — tabela `arquivo` guarda chave do objeto e hash, nunca bytes
- `scripts/gerar-hashes.ts` — SHA-256 conferido contra o objeto no R2
- `src/app/prestacao-de-contas/` — links permanentes da Sala do Avaliador
- `src/app/api/anexos/route.ts` — `/anexos.json`
- rotina de backup — destino do `pg_dump` diário (doc 02 §15)

Decisões relacionadas:

- ADR-001 — camada de preservação independente da camada de gestão
- ADR-003 — separação `documento` (obra) × `arquivo` (binário); hash e espelho
- ADR-004 — provedor do PostgreSQL; backup lógico com destino neste storage

Fontes:

- doc 01 §4 (Sala do Avaliador: hash, ZIP, link permanente)
- doc 01 §6 (espelho local obrigatório, padrão de URL)
- doc 02 §5 (tabela `arquivo`)
- doc 02 §15 (backup `pg_dump` para R2/S3, retenção, Zenodo)
- doc 02 §17 (por que binários não vão para o banco)
