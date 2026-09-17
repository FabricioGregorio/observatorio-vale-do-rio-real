# Direção Visual

## Documentos

10B.0 v1.1
Direção visual

10B.0 v1.2
Decisões técnicas

10B.0 v1.3
Especificação de implementação

10B.2.1
Consolidação territorial e modelo de camadas

10B.3.2
Auditoria de performance e alternativas do mapa (diagnóstico, não decisão)

## Decisões técnicas relacionadas

ADR-010 — mapa territorial em SVG renderizado no servidor, em
`docs/decisoes/ADR-010-mapa-svg-no-servidor.md`. É a decisão **em vigor** para o
mapa da Home.

ADR-009 — MapLibre GL JS, em
`docs/decisoes/ADR-009-biblioteca-do-mapa-territorial.md`. **Substituída pela
ADR-010** depois da medição de peso; mantida como histórico.

## Precedência

Em caso de divergência, vale o documento mais recente. A **Consolidação
10B.2.1** prevalece sobre os trechos correspondentes de v1.1, v1.2 e v1.3:
define o Vale do Rio Real, o modelo de camadas, a qualidade da malha e a lista
de arquivos de dado. Decisão de biblioteca do mapa vale a da ADR-009.

## Consolidação de 2026-09-17

A Home especificada na **v1.3** (`10B.0_v1.3_Especificacao_de_Implementacao_da_Home.md`)
foi substituída e seus componentes foram removidos do código. O documento
permanece como registro da fase; ele **não** descreve a Home atual, cuja
composição vive em `src/componentes/home/`.

O que da v1.3 continua valendo é o que nunca foi da composição: tokens,
tipografia e os critérios de “nenhum valor fora de `tokens.css`”.
