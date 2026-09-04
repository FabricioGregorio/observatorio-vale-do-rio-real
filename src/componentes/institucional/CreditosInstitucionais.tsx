/**
 * Créditos institucionais — fundação, Tarefa 10B.1.
 *
 * Bloco próprio, separado da identidade visual do projeto, como 10B.0 v1.2
 * §12 e v1.3 §13 exigem. Reserva a arquitetura para as marcas de fomento
 * (PNAB / Lei Aldir Blanc, Ministério da Cultura, Governo Federal, Governo de
 * Sergipe, FUNCAP/SE), para as marcas do projeto e para os parceiros
 * territoriais.
 *
 * **Nenhuma logo é adicionada aqui, e a ordem final não é definida.** Ordem e
 * proporção saem do manual de aplicação de marcas do edital — item E02 do
 * inventário, hoje `Pendente` e sem link. Crédito de fomento errado é causa
 * recorrente de ressalva em prestação de contas, e um bloco aproximado seria
 * pior do que a ausência declarada. O componente renderiza exatamente as
 * marcas que receber, na ordem em que as receber: quem decide a ordem é o
 * manual, não este arquivo.
 *
 * Sem marcas aprovadas, devolve `null`. O rodapé já declara a pendência em
 * texto; dois blocos dizendo o mesmo seria ruído.
 */

/**
 * Uma marca institucional.
 *
 * `alt` é obrigatório na tipagem, sem opcional — imagem sem texto alternativo
 * é rejeitada pelo contrato (AGENTS.md, doc 03 §5). O agrupamento vem de
 * 10B.0 v1.1 §11, que separa identidade do projeto, parceiros territoriais e
 * fomento; ele classifica, não ordena.
 */
export type MarcaInstitucional = {
  readonly nome: string;
  /** Caminho sob `public/media/logos/`, servido a partir de `/media/logos/`. */
  readonly arquivo: string;
  readonly alt: string;
  readonly grupo: "projeto" | "parceiro" | "fomento";
};

export function CreditosInstitucionais({
  marcas,
}: {
  marcas: readonly MarcaInstitucional[];
}) {
  if (marcas.length === 0) return null;

  return (
    <ul className="flex list-none flex-wrap items-center gap-6 p-0">
      {marcas.map((marca) => (
        <li key={marca.nome} data-grupo={marca.grupo}>
          {/*
            Sem `next/image` por enquanto: dimensão, formato e proporção de
            cada marca vêm do manual, e `next/image` exige width e height que
            hoje só poderiam ser estimados.
          */}
          <img src={marca.arquivo} alt={marca.alt} />
        </li>
      ))}
    </ul>
  );
}
