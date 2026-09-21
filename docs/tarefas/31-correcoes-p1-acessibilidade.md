# Tarefa 31 — correções P1 de acessibilidade

Pedido direto do responsável em 2026-09-21, após a auditoria do HEAD
`b5c60ff`: corrigir somente o destino do link de salto nas páginas internas,
o reflow em 320 px de `/acervo` e `/privacidade`, e o canal de relato de
barreiras em `/acessibilidade`.

Arquivos permitidos:

- `src/estilos/tokens.css`, apenas reserva do destino do salto;
- `src/componentes/layout/estilosCabecalho.ts`, apenas destino do salto;
- `src/app/acervo/acervo.css`, apenas largura dos controles;
- `src/componentes/institucional/documental.css`, apenas quebra da prova;
- `src/app/acessibilidade/page.tsx`, apenas relato de barreiras;
- `testes/a11y/correcoes-p1.spec.ts`, novo;
- este registro.

Validar teclado, destino abaixo do cabeçalho, reflow em 320/375/768/1440 px,
texto e `mailto`, temas claro/escuro, axe, tipos, testes direcionados e build.
Preservar as alterações locais preexistentes e os dois P2 da auditoria.
