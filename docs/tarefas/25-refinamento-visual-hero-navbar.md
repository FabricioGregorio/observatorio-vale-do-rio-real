# Tarefa 25 — Refinamento visual do Hero e da navbar

Solicitação direta do responsável em 17/09/2026: avaliar e melhorar visualmente
o Hero da Home e a navegação superior, com liberdade criativa.

## Escopo

Continuação da Home v2 sobre as alterações locais já existentes. O pedido
atual reúne os dois componentes tratados separadamente nas tarefas 23 e 24.
Conteúdo, fotografia documental, rotas e comportamento dos menus são preservados.

Arquivos desta rodada:

- `src/componentes/prototipo/homelivre/estilosAberturas.ts`;
- `src/componentes/prototipo/homelivre/estilos.ts`;
- `src/componentes/prototipo/homelivre/Aberturas.tsx`;
- `src/componentes/prototipo/homelivre/HomeLivre.tsx`;

> **Nota de 17/09/2026.** A consolidação da
> [tarefa 26](./26-consolidacao-home-oficial.md) moveu esses quatro arquivos
> para `src/componentes/home/`, e `HomeLivre.tsx` virou `Home.tsx`. Os caminhos
> acima são os que valiam quando esta rodada foi executada.

- `src/estilos/tokens.css`;
- `testes/a11y/home.spec.ts`;
- `testes/home.test.ts`;
- este registro.

## Implementação

- Redução do espaço superior do Hero no desktop, maior hierarquia tipográfica,
  CTA e números com destaque na cor milho existente.
- Painel de números com fundo mais opaco, filetes discretos e rótulos maiores.
- Navbar com espaçamento equilibrado e destaque na Prestação de Contas.
- Menu ao lado da marca no celular; painel aberto ocupa toda a largura.
- Tokens centralizados; sem dependências, fontes, imagens ou JavaScript novos.

### Complemento solicitado na mesma sessão

Navbar fixa sobre a fotografia contínua do Hero, com fundo escuro a 82% de
opacidade e desfoque de fundo. O título recebe reserva de espaço no celular;
âncoras usam `scroll-padding-top` para que seus destinos permaneçam visíveis.
O menu aberto tem rolagem própria quando excede a altura da tela. Aplicação
restrita à Home pública, preservando as variantes históricas do laboratório.
Testes adicionais verificam a sobreposição, permanência até o fim da página
e destino do CTA abaixo da navbar em 375 e 1440 px.

Resultado do complemento: tipos e build aprovados; cenários da Home aprovados
(o ajuste final de âncora foi revalidado nos dois tamanhos). A suíte unitária
registrou 646 aprovações, três casos ignorados e oito falhas de contraste
associadas à alteração paralela de `--color-milho` de `#e8b23a` para `#026a69`.
Essa mudança de paleta foi preservada, sem fazer parte da navbar fixa.

### Hero em tela inteira

Por solicitação posterior na mesma sessão, a abertura pública ocupa uma tela
inteira (`100svh`, com fallback `100vh`), incluindo a navbar sobreposta.
O conteúdo fica alinhado à base no desktop e a seção Origem começa após o Hero.
Usa altura mínima para permitir crescimento em telas baixas ou com texto ampliado,
sem cortar conteúdo. Testes verificam altura e posição exatas em 375 × 900 e
1440 × 900, além da separação entre o painel e a legenda da fotografia.

## Verificação

### Faixa após Origem

Solicitação posterior: retirar os indicadores do Hero e posicioná-los logo
após Origem, antes de Território. A composição inclui `FaixaDaPesquisa` nessa
posição, com os mesmos valores derivados dos dados existentes: 2 equipamentos,
8 entrevistas e 5 municípios. Fundo transparente, três colunas no desktop e
linhas no celular. Os créditos permanecem na apresentação institucional de
Origem, que já contém realização, fomento e território; a duplicação do painel
foi removida. O grafismo topográfico do painel também saiu. Os arquivos de
composição e seus testes foram incluídos no escopo para realizar essa mudança
de posição expressamente solicitada, sem alterar rotas ou arquitetura.

Tipos, lint, testes unitários, suíte da Home e build local. A suíte cobre
temas claro/escuro, 320–1440 px, teclado, movimento reduzido e ausência de
JavaScript. Regressão adicional verifica que abrir o menu em 320 px não
comprime a marca nem cria rolagem horizontal.
