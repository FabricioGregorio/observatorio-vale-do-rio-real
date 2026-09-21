# Tarefa 30 — redesign de /contato

Pedido direto do responsável em 2026-09-21. Os canais públicos do Observatório
e do Coletivo Tobias Sou Eu foram fornecidos nesta sessão e superam o retrato
anterior da Tarefa 15 quanto à ausência de contatos.

Escopo: página institucional de contato com duas identidades separadas, e-mail
direto, Instagram de cada uma e YouTube do Coletivo. Sem formulário, promessas
de resposta ou dados adicionais. Não alterar outras rotas, cabeçalho, rodapé,
banco, storage ou migrações.

Arquivos permitidos:

- `src/app/contato/page.tsx`;
- `src/estilos/tokens.css`, somente estilos `.ct`;
- `src/componentes/institucional/conteudo.ts`, somente remoção do texto antigo de contato;
- `testes/a11y/contato.spec.ts`, novo;
- este registro.

Validar links e metadados, axe, ausência de overflow, tipos, testes e build.
Conferir visualmente em 1440, 768 e 375 px. Stage nominal; commit dedicado e
push somente para `origin/exp/home-v2-territorio-vivo`. Preservar alterações
locais preexistentes. Não iniciar a auditoria final de release.
