import type { PontoDeVisita } from "./tipos";

/**
 * Pontos de visita de campo — Tarefa 10B.2.2.
 *
 * Estrutura, não conteúdo. Cada ponto traz apenas o que está declarado em
 * documento: identificador, nome e, quando há evidência, o município. Tipo,
 * coordenada, fotografia e descrição continuam `null` — e é assim que devem
 * ficar até existir fonte.
 *
 * Os identificadores são os slugs que o doc 01 §3 já fixou em
 * `/equipamentos/[slug]`: `recanto-da-serra`, `borda-da-mata`,
 * `serra-dos-macacos` e `ilha-grande`. Não foram inventados aqui, e mantê-los
 * iguais é o que permitirá ligar ponto do mapa e página do equipamento sem
 * tabela de tradução.
 *
 * **Coordenada não sai de estimativa sobre mapa.** Ela vem de conferência em
 * campo ou de documento do projeto. Um marcador colocado no lugar errado num
 * site de prestação de contas é afirmação falsa sobre onde a pesquisa esteve.
 */
export const PONTOS_DE_VISITA_PREVISTOS: readonly PontoDeVisita[] = [
  {
    id: "recanto-da-serra",
    nome: "Recanto da Serra",
    tipo: null,
    // Tobias Barreto: o ponto consta entre as evidências de pesquisa de campo
    // do município (10B.2.2) e 10B.0 v1.1 §4 já o associava a ele.
    municipioId: "2807402",
    coordenadas: null,
    imagem: null,
    descricao: null,
  },
  {
    id: "borda-da-mata",
    nome: "Centro Cultural e Museu Borda da Mata",
    tipo: null,
    municipioId: "2807402",
    coordenadas: null,
    imagem: null,
    descricao: null,
  },
  {
    id: "serra-dos-macacos",
    nome: "Serra dos Macacos",
    tipo: null,
    // Nenhum documento lido associa este ponto a um município. A instrução da
    // 10B.2.2 proibiu explicitamente inventar o de Ilha Grande; aqui a
    // situação é a mesma, e a resposta também: fica `null` até haver fonte.
    municipioId: null,
    coordenadas: null,
    imagem: null,
    descricao: null,
  },
  {
    id: "ilha-grande",
    nome: "Ilha Grande",
    tipo: null,
    municipioId: null,
    coordenadas: null,
    imagem: null,
    descricao: null,
  },
];
