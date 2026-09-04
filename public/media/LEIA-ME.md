# `public/media` — arquivos de mídia do site

Estrutura criada na Tarefa 10B.1, conforme 10B.0 v1.2 §11. **Vazia de
propósito**: nenhuma imagem foi adicionada, e as pastas existem no repositório
por causa dos `.gitkeep`.

```
media/
├── logos/       marcas institucionais, de fomento e de parceiros
├── mapa/        recursos do mapa territorial
├── territorio/  imagens por município
├── campo/       fotografias das visitas de campo
└── pessoas/     retratos e ilustrações de participantes
```

Antes de colocar qualquer arquivo aqui:

- **Só imagem real do projeto.** Banco de imagem genérico, ilustração gerada ou
  foto que represente um lugar real sem ser dele estão proibidos (10B.0 v1.1 §5
  e v1.2 §9). Num site de prestação de contas isso não é escolha estética, é
  integridade da pesquisa.
- **Toda imagem precisa de texto alternativo e de crédito.** Os contratos já
  exigem: `ImagemDeCampo` em `src/dados/territorio/tipos.ts` e
  `MarcaInstitucional` em `src/componentes/institucional/`. `alt` não é
  opcional na tipagem.
- **Pessoa identificável exige consentimento verificado** (doc 01 §11).
- **Logos dependem do manual de aplicação de marcas do edital**, item E02 do
  inventário, hoje pendente. Ordem e proporção saem de lá, nunca de estimativa.
- **Formato:** WebP ou AVIF, comprimido, com carregamento preguiçoso
  (doc 01 §7).
