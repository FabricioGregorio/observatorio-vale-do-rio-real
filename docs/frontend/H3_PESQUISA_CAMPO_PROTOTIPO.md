# H3 — Pesquisa em Campo: auditoria e protótipo

Data: 2026-09-10

Estado: **EM PROTÓTIPO**

Rota: `/dev/pesquisa` — 404 em produção

Home: **não alterada**

## 1. Escopo e regra de privacidade

A H3 procura responder “como essa pesquisa aconteceu no território?” sem
transformar registro de campo em galeria, portfólio ou timeline cenográfica.
Foram auditados `fotos/`, `relatorios/`, `entrevistas/` e `formularios/` no
corpus local apontado por `OBSERVATORIO_FONTES_DIR`.

O caminho absoluto do corpus não é registrado aqui nem chega ao frontend. A
decisão foi *fail closed*: `pessoa=0` e `consentimento=0` continuam sendo o
estado conhecido do banco; nenhuma autorização de imagem foi presumida.

`B01` continua **RESTRITO** como conjunto documental. A classificação APTA
abaixo é uma revisão individual de pixels para produzir somente derivados sem
pessoa identificável; ela não promove B01 no banco, não publica seus originais
e não muda a classificação dos demais arquivos.

Fontes de controle:

- `docs/privacidade/REVISAO_PRIVACIDADE_A02_A04_D01_2026-09-07.md`;
- `docs/auditorias/AUDITORIA_FONTES_2026-09-05.md`;
- `docs/auditorias/AUDITORIA_FONTES_CANONICAS_2026-09-05.md`;
- inventário derivado vigente e `src/dados/classificacao-documental.ts`.

## 2. Inventário do corpus relevante

| Conjunto | Arquivos | Tipo e relação com a H3 | Local/data confirmados | Pessoa/privacidade | Publicabilidade na H3 |
|---|---:|---|---|---|---|
| `fotos/` | 56 | B01, comprovação de campo | oito agrupamentos; datas das fotos não confirmadas | 33 nomes sinalizam pessoa; 45 arquivos trazem bloco EXIF segundo auditoria canônica | revisão individual: 15 APTAS, 41 PENDENTES |
| `relatorios/` | 3 | fonte factual interna | A02 Recanto da Serra; A03 Borda da Mata; A04 Serra dos Macacos | A02 só por seu derivado público; A03 restrito; A04 fora do lote público | fonte interna; nenhum PDF novo no frontend |
| `entrevistas/` | 16 | oito pares de áudio/transcrição; sustenta “entrevistas gravadas” | datas próprias existem para parte das entrevistas, não para as fotos | voz e fala atribuída; itens B restritos | não entram no bundle |
| `formularios/` | 21 | três planilhas de resposta, 17 PDFs derivados de indicadores e uma planilha estática; sustenta “formulários de resposta” | Recanto/Borda nos arquivos próprios; não generalizar aos demais locais | conjunto inclui arquivos restritos | somente síntese metodológica transversal |

O corpus completo tem 151 arquivos; os quatro conjuntos acima somam 96. A H3
não usa os outros 55 porque não acrescentam evidência factual necessária à
seção.

### 2.1 Locais documentados

| Local | Evidência existente | O que pode ser afirmado | Limite |
|---|---|---|---|
| Recanto da Serra | A02, B04 e fotografias | relatório, entrevista e registros fotográficos existem | data da entrevista não é data das fotos; município/coordenada não são inventados |
| Borda da Mata | A03, B03 e fotografias | relatório, entrevista e registros fotográficos existem | A03 não é publicado pela H3; fotos permanecem pendentes |
| Serra dos Macacos | A04 | relatório existe como fonte interna | A04 continua fora do lote público e não aparece silenciosamente |
| Ilha Grande | B06 e fotografias | entrevista informal e registros fotográficos existem | data 11/04/2026 não está confirmada pelos arquivos; nenhuma foto com pessoa é usada |

Isto não converte os quatro locais em “quatro visitas”. O corpus não sustenta
essa simplificação. Também não foram criados município, coordenada ou número de
etapa.

## 3. Matriz das 56 fotografias

Para evitar duplicar dados pessoais presentes nos nomes privados, a matriz usa
IDs H3 e aliases de conjunto. A correspondência exata continua na auditoria
canônica restrita já existente. Os nomes exatos aparecem somente nas 15 imagens
sem pessoa, em que são descrição de lugar/objeto e necessários à procedência.

Todas as datas de fotografia estão **não informadas**. “Sim — sinal” significa
o indício nominal já registrado pela auditoria; não houve reconhecimento
facial. “Indeterminado” fecha em PENDENTE. Fonte comum: B01 + inspeção visual H3.

| Foto | Local/conjunto | Conteúdo | Pessoa identificável? | Publicabilidade | Uso proposto | Observação |
|---|---|---|---|---|---|---|
| H3-F001 | Borda da Mata / CCBM-01 | conversa em ambiente interno | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F002 | Borda da Mata / CCBM-02 | conversa em grupo | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F003 | Borda da Mata / CCBM-03 | espaço do museu | Indeterminado | PENDENTE | candidatura futura | HEIC não decodificado neste ambiente |
| H3-F004 | Borda da Mata / CCBM-04 | fachada de casa de taipa | Indeterminado | PENDENTE | candidatura futura | HEIC não decodificado neste ambiente |
| H3-F005 | Borda da Mata / CCBM-05 | fachada de museu | Indeterminado | PENDENTE | candidatura futura | HEIC não decodificado neste ambiente |
| H3-F006 | Borda da Mata / CCBM-06 | acervo de discos/CDs | Indeterminado | PENDENTE | candidatura futura | HEIC não decodificado neste ambiente |
| H3-F007 | Borda da Mata / CCBM-07 | entrevista | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F008 | entrevista 06 / foto 01 | entrevista | Sim — sinal | PENDENTE | nenhum | pessoa e voz associável |
| H3-F009 | entrevista 06 / foto 02 | grupo | Sim — sinal | PENDENTE | nenhum | sem autorização de imagem específica |
| H3-F010 | entrevista 06 / foto 03 | grupo | Sim — sinal | PENDENTE | nenhum | sem autorização de imagem específica |
| H3-F011 | entrevista 06 / foto 04 | entrevista | Sim — sinal | PENDENTE | nenhum | sem autorização de imagem específica |
| H3-F012 | entrevista 06 / foto 05 | preparação | Sim — sinal | PENDENTE | nenhum | sem autorização de imagem específica |
| H3-F013 | entrevista 06 / foto 06 | pós-entrevista | Sim — sinal | PENDENTE | nenhum | sem autorização de imagem específica |
| H3-F014 | São Cristóvão / retrato 04 | retrato institucional | Sim — sinal | PENDENTE | nenhum | crédito de terceiro; privacidade e licença pendentes |
| H3-F015 | São Cristóvão / retrato 03 | retrato institucional | Sim — sinal | PENDENTE | nenhum | crédito de terceiro; privacidade e licença pendentes |
| H3-F016 | Ilha Grande / `arvores-preservadas.png` | árvores e vegetação | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F017 | Ilha Grande / `cais-ou-pier-ilha-grande.png` | cais/píer | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F018 | Ilha Grande / `campo-verde-de-grama-e-arvores.png` | campo e árvores | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F019 | Ilha Grande / `chegando-a-ilha-grande-de-barco.png` | margem vista da água | Não | APTA | secundária A/B | derivado versionado |
| H3-F020 | Ilha Grande / IG-05 | retrato | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F021 | Ilha Grande / `forno-a-lenha.png` | forno a lenha | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F022 | Ilha Grande / `forno-a-lenha2.png` | atividade no forno | Não | APTA | secundária A/B | derivado versionado |
| H3-F023 | Ilha Grande / `igrejinha.jpg` | fachada de igreja | Não | APTA | principal A/B | derivado versionado |
| H3-F024 | Ilha Grande / `placa-bem-vindos-a-pedreiras.jpg` | placa de chegada | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F025 | Ilha Grande / `rio.png` | curso d’água | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F026 | entrevista 01 / foto 01 | preparação | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F027 | entrevista 01 / foto 02 | preparação | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F028 | entrevista 01 / foto 03 | equipe em biblioteca | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F029 | Recanto da Serra / `bodega-dos-tropeiros-e-mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg` | parede e objetos | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F030 | Recanto da Serra / `bodega-dos-tropeiros-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg` | parede e objetos | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F031 | entrevista 01 / foto 06 | grupo pós-entrevista | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F032 | entrevista 01 / foto 07 | entrevista | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F033 | entrevista 01 / foto 08 | entrevista | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F034 | Recanto da Serra / `mensagem-de-silo-no-memorial-tobias-barreto-homenagem-ao-recanto-da-serra.jpg` | parede e texto | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F035 | entrevista 01 / foto 10 | apresentação de mural | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F036 | entrevista 01 / foto 11 | apresentação de banner | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F037 | entrevista 01 / foto 12 | apresentação de banner | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F038 | entrevista 01 / foto 13 | apresentação de banner | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F039 | entrevista 07 / foto 01 | equipe | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F040 | entrevista 07 / foto 02 | equipe | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F041 | entrevista 07 / foto 03 | equipe | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F042 | entrevista 07 / foto 04 | equipe | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F043 | entrevista 07 / foto 05 | equipe | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F044 | Recanto da Serra / RS-01 | interior com retratos impressos | Sim — sinal | PENDENTE | nenhum | pessoa aparece em material dentro da cena |
| H3-F045 | Recanto da Serra / RS-02 | chegada; três pessoas de costas | Não identificável na inspeção | PENDENTE | nenhum | conjunto B01 restrito; autorização não presumida |
| H3-F046 | Recanto da Serra / RS-03 | visita a museu/memorial | Indeterminado | PENDENTE | candidatura futura | HEIC não decodificado neste ambiente |
| H3-F047 | Recanto da Serra / `estufa.jpg` | estufa e vegetação | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F048 | Recanto da Serra / RS-05 | saída da visita | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F049 | Recanto da Serra / RS-06 | fachada com retratos impressos | Sim — sinal | PENDENTE | nenhum | pessoa aparece em material dentro da cena |
| H3-F050 | Recanto da Serra / `frente-museu-dona-maria.jpg` | fachada de museu | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F051 | Recanto da Serra / `igreja-com-pedras-coruba-vista-de-longe.jpg` | igreja vista à distância | Não | APTA | reserva editorial | pixels inspecionados; sem pessoa |
| H3-F052 | entrevista 05 / foto 09 | conversa | Sim — sinal | PENDENTE | nenhum | sem autorização específica |
| H3-F053 | entrevista 05 / foto 10 | conversa | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F054 | Recanto da Serra / RS-11 | visita | Indeterminado | PENDENTE | candidatura futura | HEIC não decodificado neste ambiente |
| H3-F055 | Recanto da Serra / RS-12 | visita em equipe | Sim — sinal | PENDENTE | nenhum | HEIC; sem autorização específica |
| H3-F056 | Recanto da Serra / RS-13 | visita | Indeterminado | PENDENTE | candidatura futura | não usado até revisão individual |

Totais: **56 candidatas · 15 APTAS · 41 PENDENTES · 0 NÃO USAR · 33 com
sinal de pessoa identificável**. As duas fotos com crédito de terceiro ficam
PENDENTES, e não “NÃO USAR”, porque licença/autorização ainda pode ser
documentada; nenhuma hipótese futura autoriza o uso agora.

## 4. Derivados públicos seguros

Pipeline: `scripts/derivar-pesquisa-campo.ts`. O Chromium já presente no
projeto aplica orientação, desenha a imagem integral em canvas e grava WebP.
Não há IA, recorte, filtro, reconstrução nem alteração de cena.

| Derivado | Original (relativo ao corpus) | SHA-256 original | Dimensões | Transformação | SHA-256 derivado | Bytes |
|---|---|---|---|---|---|---:|
| `ilha-grande-chegada-barco-410.webp` | `fotos/ilha-grande/chegando-a-ilha-grande-de-barco.png` | `00415cefdbd2a3954bf2717fe4886aa69ba62ab2815bbf58b1aedb8a3a4c1e89` | 410×731 → 410×731 | integral, PNG→WebP q0,78 | `b8404169e78e5bffa78d1b73ee32a5f0850f587366315a2a8d74e715cec6abb2` | 31.842 |
| `ilha-grande-forno-lenha-412.webp` | `fotos/ilha-grande/forno-a-lenha2.png` | `25475b5fa02d2aa4d3e70f07580c01ffe32910b11f39bc91d5cb71cfe7f43aa9` | 412×731 → 412×731 | integral, PNG→WebP q0,78 | `1c9cc9b37a54bfa5bf53381d5c4bc217bae9e187476c27037377898a0d0d26ed` | 42.186 |
| `ilha-grande-igrejinha-1280.webp` | `fotos/ilha-grande/igrejinha.jpg` | `2746986d0351640c3ba4e0b78fec0276cacd828039317638c3d4e9f7d6f8a4c0` | 4000×3000, Orientation 6 → 1280×1707 | orientação aplicada, integral, JPEG→WebP q0,72 | `75d9dcb8291299224953c965c24a04c346373bd7923757cd39c1e45599aa3592` | 168.738 |

Total versionado: **242.766 B**. Canvas elimina EXIF, XMP, GPS, dispositivo,
data, orientação e miniatura. `testes/pesquisa-derivados.test.ts` confere os
chunks, vestígios textuais, hashes, pesos e a lista exata de três arquivos.

## 5. Conteúdo e copy

| Texto no protótipo | Fonte | Factual? | Proposta? | Precisa aprovação? |
|---|---|---:|---:|---:|
| `02 — PESQUISA EM CAMPO` | estrutura aprovada da Home | sim | não | não |
| `O campo como documento` | redação H3 | não é alegação factual | sim, marcada na tela | **sim** |
| síntese dos três registros sem pessoas | inspeção visual + B01 | sim | redação editorial | **sim** |
| Ilha Grande / registro fotográfico / data não informada | pasta canônica + ausência de data confirmada | sim | não | não |
| corpus reúne registros fotográficos, entrevistas gravadas e formulários de resposta | B01, oito pares de entrevista e planilhas de resposta | sim, transversal | redação editorial | **sim** |
| `Da abstração do mapa à materialidade do território` | redação H3 | orientação narrativa | sim | **sim** |

Não há data criada a partir de EXIF, entrevista ou relatório; metodologia não é
atribuída automaticamente a nenhum local; nenhuma timeline foi criada.

## 6. Presets A/B

Ambos usam as mesmas três imagens, conteúdo, tokens e ordem semântica.

| Critério | A — Documental aberto | B — Caderno técnico |
|---|---|---|
| humanidade/cultura viva | mais alta: foto e espaço negativo lideram | presente, mas mediada pela ficha |
| rigor/tecnologia | metadado essencial | `dl` explícita para local, data, tipo e fonte |
| fotografia | 8/12 colunas; duas secundárias assimétricas | 7/12 colunas; secundárias no grid regular |
| mobile | foto → metadado → texto → registros | mesma ordem, com ficha mais longa |
| velocidade | igual; três URLs | igual; mesmos URLs reutilizados pelo cache |
| manutenção | menor densidade estrutural | ficha adiciona estrutura e copy |
| risco institucional | baixo | médio |
| risco de portfólio | baixo pela legenda e pelo método | baixo, mas pode parecer relatório institucional |

**Recomendação técnica: A — Documental aberto.** Ele realiza melhor a passagem
da cartografia para a presença física e mantém a fotografia como documento,
sem perder fonte, local e ausência declarada. A escolha final continua humana.

## 7. Performance, servidor e JavaScript

- Home antes: **aprox. 692.435 B** no cenário 1440 registrado na H2.1.
- Home depois: **o mesmo valor**; a H3 não foi integrada. Incremento inicial:
  **0 B**.
- Derivados disponíveis: 242.766 B. No laboratório 1440/DPR 1, o conjunto A
  responsivo medido pelo pipeline Next foi **169.372 B** quando suas três fotos
  já estavam próximas do viewport. Este número varia por DPR, `Accept` e cache.
- Todas as imagens têm `loading="lazy"`, `sizes` por papel no grid e nenhum
  `preload`/`priority`. Na Home futura, abaixo da dobra e abaixo de Território,
  isso precisa ser remedido no build servido.
- Client Components no repositório: **5 antes, 5 depois**. A seção H3 adiciona
  **zero**. A rota continua herdando somente as duas ilhas do cabeçalho do
  laboratório.

## 8. Responsividade, tema e acessibilidade

A ordem DOM é sempre título, fotografia principal/legenda, texto/método e
registros seguintes. Em 320/375 ela vira coluna, sem side-by-side. Testes cobrem
320, 375, 768 e 1440 nos temas claro/escuro, zoom 200% e overflow horizontal.
As fotografias não recebem filtro por tema.

Cada imagem possui `alt` factual e `figcaption`; nenhum alt identifica pessoa.
Metadados usam IBM Plex Mono, texto corrido usa Literata e títulos usam Archivo.
Não há interação editorial, autoplay, parallax, reveal ou transição; reduced
motion mantém duração efetivamente nula pelo contrato global.

Inspeção visual:

- fotografia principal tem protagonismo e não parece card;
- escala irregular evita grade 2×2/Pinterest;
- legendas e ausência de data impedem aparência de portfólio/blog;
- A evita excesso de mono e de ficha; B assume deliberadamente mais rigor;
- nenhum texto existe apenas dentro da imagem;
- não há textura artificial, pessoa decorativa ou metadata cenográfica.

## 9. Screenshots

Gerados em `tmp/h3-screenshots/` e **não versionados**:

- A: `pesquisa-a-1440-light.png`, `pesquisa-a-1440-dark.png`,
  `pesquisa-a-375-light.png`, `pesquisa-a-375-dark.png`;
- B: `pesquisa-b-1440-light.png`, `pesquisa-b-1440-dark.png`,
  `pesquisa-b-375-light.png`, `pesquisa-b-375-dark.png`;
- recomendado em 320 light: `pesquisa-a-320-light.png`.

## 10. Riscos e bloqueios para integração

1. copy marcada como PROPOSTA precisa de aprovação humana;
2. a escolha A/B precisa de decisão humana;
3. B01 continua agregado RESTRITO; integrar a modelagem de derivados
   fotográficos individuais antes de uma publicação pública definitiva;
4. medir a Home integrada e manter as imagens fora do carregamento inicial;
5. não promover fotografia com pessoa sem evidência específica por arquivo e
   por uso;
6. A04 permanece fora do lote público.

Conclusão: **pronto para decisão visual, não autorizado para integração**.
