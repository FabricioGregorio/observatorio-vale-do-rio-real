# H1 — Correção da marca no Hero B

**Data:** 09/09/2026. **Estado:** proposta local para avaliação humana.

O responsável indicou o Hero B como base e pediu a retirada da marca horizontal
com painel preto da composição recomendada. Esta revisão sucede a recomendação
do registro `H1_HERO_MANIFESTO_PROTOTIPO.md`; não aplica o protótipo à Home pública.

## Diagnóstico e escolha

O preto faz parte de `horizontal-monocromatica-escura.svg`. Não era fundo de CSS.
A peça horizontal repetia o nome em lettering diminuto, ocupando 192×108 px no
Hero B desktop. Competia com a fotografia sem acrescentar legibilidade.

Foram inspecionados os arquivos oficiais `icon.png` e `logo-e-texto.png`, ambos
1080×1350. O segundo é uma composição vertical completa, com fundo institucional,
grafismos e nome: pequeno, o lettering ficaria ilegível; grande, repetiria o título.
O primeiro contém o símbolo separado do nome, também sobre fundo verde-azulado.

Foi escolhido **`identidade-visual/observatorio/icon.png`**, no corpus definido por
`OBSERVATORIO_FONTES_DIR`. O fundo oficial permanece: não se produziu transparência,
não se extraiu desenho da peça horizontal e não se inventou uma marca nova.

## Arquivo aplicado

- Original: `identidade-visual/observatorio/icon.png`.
- SHA-256 original: `6b230265d3c50b864bed83c5d3e7ddd02bd01998a92de818fefae487afc2571b`.
- Derivado: `public/media/logos/observatorio-simbolo-256.png`, 256×320, 13.026 B.
- SHA-256 derivado: `5404186e9658408aaf2ca3521c2fceeb87d2f23cb8f46bd89d02e93296ce8283`.
- Método: redimensionamento integral bicúbico via System.Drawing, PNG sem perdas
  de compressão; sem recorte, recoloração ou remoção de fundo. O bitmap novo não
  herda os metadados do original. Procedência declarada em `src/dados/hero/derivados.ts`.
- Reprodução: `scripts/derivar-simbolo-observatorio.ps1 -PastaDasFontes <corpus>`;
  o script recusa original cujo hash diverge do conferido.

## Composição recomendada

**Hero B revisado — texto protagonista + símbolo oficial compacto.**

O símbolo aparece a 64×80 px, junto a `SERGIPE / BRASIL`. O nome completo continua
em `h1` visível, com Archivo e a escala anterior. A assinatura do Coletivo preserva
o texto integral em Literata e a marca colorida, agora a 64×51,2 px; a autoria usa
o token de texto-base. No celular, o nome do Coletivo reflui ao lado da marca.

O cabeçalho do protótipo também usa o símbolo, com nome acessível no link para a
Home. O Hero A preserva a peça antiga somente como referência de comparação.
Fotografia, crops, overlay, cores e título não foram alterados.

O painel do Observatório ocupa **75,3% menos área no desktop** e **44,4% menos no
mobile**. As marcas passam a apoiar o título e deixam mais fotografia exposta.
O verde-azulado pertence à identidade existente, em vez de introduzir preto.

## Comparação e limites

Os 12 screenshots anteriores foram preservados. Foram geradas 12 novas capturas
com o script existente, em outra pasta, nas mesmas combinações: A/B, 1440 e 375
nos dois temas; 768 e 320 no claro. Os caminhos absolutos são entregues na sessão,
sem introduzir caminhos de usuário neste registro versionado.

A revisão foi inspecionada no navegador e nos screenshots. As capturas mobile,
assim como as anteriores, incluem um pequeno trecho do cabeçalho fixo no topo.
O título ainda se sobrepõe a parte das pessoas no desktop; no mobile, o conjunto
de símbolo/metadado ainda cobre parte das placas. A correção reduz a competição
das marcas; não resolve todos os conflitos da fotografia registrados na H1.

O asset novo é 18.494 B menor que o horizontal. **O orçamento total de 500 kB
continua pendente**: a página de comparação carrega também a peça antiga de A
e, portanto, não representa o peso de B isolado.

## Escopo

Validação: tipos e lint aprovados (quatro avisos de lint preexistentes), 375 testes
de unidade aprovados e três pulados; 144 testes de navegador aprovados. Build local
concluído. O teste de contraste existente, que aproxima a composição do gradiente,
estimou mínimo de 6,50:1 para B nos textos amostrados. Sem overflow em 320, 375, 768
e 1440 px nos dois temas; zoom de 200% aprovado. O comando `pnpm verificar` terminou
com sucesso, mas seu gate de publicação foi **pulado** por ausência de `DATABASE_URL`
no ambiente do comando; ele não atesta pendências do banco.

Os componentes existentes vivem em `src/componentes/hero/` e `prototipo/`, fora
da lista histórica da Tarefa 10. A instrução direta desta sessão autoriza corrigir
esse protótipo. Os arquivos adicionais de procedência, derivação, testes e registro
são necessários para tornar a aplicação oficial verificável; não ampliam a Home.

Nenhum deploy, push, alteração de infraestrutura, banco, rota pública ou regra de
publicação. A proposta continua em `/dev/hero`, com guarda de 404 em produção.

## Refinamento circular das marcas — 09/09/2026

Por instrução do responsável, as duas marcas do Hero B revisado passaram a ter
uma apresentação circular, sem gerar outro asset e sem alterar os arquivos
oficiais já adotados.

- **Observatório:** o PNG 256×320 é centralizado numa caixa de 64×64 px com
  `object-fit: cover` e máscara circular. O corte remove somente 32 px virtuais
  de cada extremidade vertical do arquivo original; o círculo branco do símbolo
  e o respiro teal permanecem íntegros.
- **Coletivo:** o WebP 640×512 usa a mesma caixa e a mesma máscara. O corte
  central remove somente 64 px virtuais de cada margem lateral antes de aparar
  os cantos; o lettering, o retrato e os elementos radiais permanecem dentro da
  área visível.
- **Escala:** os dois selos têm o mesmo diâmetro de 64 px em desktop e mobile.
  Não há achatamento, recoloração, padding artificial nem novo arquivo. A
  igualdade de diâmetro reduz a competição entre marcas e mantém o título como
  elemento dominante.

O Hero A e o símbolo do cabeçalho continuam como referência anterior e não
receberam o tratamento circular. A alteração permanece restrita ao Hero B da
rota local `/dev/hero`; a Home pública não foi alterada.

### Validação do refinamento

- Inspeção visual real em 1440×900 e 375×812, nos temas claro e escuro: as
  duas marcas permanecem reconhecíveis e o título conserva a dominância.
- A inspeção adicional em 320 px não encontrou peso excessivo nem conflito
  novo com o texto.
- O teste estrutural confirma dois círculos de 64×64 px, `object-fit: cover`,
  posição central e máscara circular; nenhum asset é distorcido.
- Sem overflow horizontal em 320, 375, 768 e 1440 px, nos dois temas. Zoom de
  200% sem overflow e com o título legível.
- Contraste do Hero B sobre a fotografia: mínimo de **6,45:1** entre os textos
  amostrados, acima do piso WCAG AA de 4,5:1.
- Gates: tipos e lint aprovados; o lint conserva quatro avisos preexistentes de
  `!important` no bloco global de movimento reduzido. **375 testes unitários
  aprovados e três pulados; 145 testes de navegador aprovados.** O build local
  gerou 20 páginas estáticas com sucesso.
- `pnpm verificar` terminou com código 0. Como já documentado, o último gate
  declarou `DATABASE_URL` ausente no ambiente do comando e, portanto, não
  atestou pendências de publicação; nenhuma consulta foi feita por esse gate.

Capturas novas foram geradas no scratchpad local da sessão, na subpasta
`screenshots-hero-circulares`, fora do Git. Nenhum deploy, push ou alteração de
infraestrutura foi executado.
