/**
 * Destinos externos de escuta — Spotify e YouTube.
 *
 * A ADR-021 decidiu que o site divulga e não reproduz. Isto é a consequência
 * concreta dessa decisão na interface: um link que sai do site, nunca um
 * player, um embed ou um iframe. Não existe `<audio>` em lugar nenhum desta
 * árvore, e não existe SDK de plataforma.
 *
 * Cada link anuncia que abre em nova guia. A seta é decorativa e fica fora da
 * árvore de acessibilidade — quem usa leitor de tela recebe a informação pelo
 * texto associado, não por um caractere que seria lido como "seta nordeste".
 */

type Props = {
  href: string;
  /** Precisa ser único na página: vira o `id` do aviso de nova guia. */
  id: string;
  children: React.ReactNode;
  className?: string;
};

function LinkExterno({ href, id, children, className }: Props) {
  return (
    <>
      <span className="sr-only" id={id}>
        Abre em nova guia.
      </span>
      <a
        aria-describedby={id}
        className={className}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children} <span aria-hidden="true">↗</span>
      </a>
    </>
  );
}

/** CTA primário. Todo episódio público tem um — o gate do banco exige. */
export function OuvirNoSpotify({
  href,
  id,
  className,
}: {
  href: string;
  id: string;
  className?: string;
}) {
  return (
    <LinkExterno className={className} href={href} id={id}>
      Ouvir no Spotify
    </LinkExterno>
  );
}

/**
 * CTA secundário, e opcional de verdade.
 *
 * `url_youtube` é anulável e não entra no gate de publicação. Quando não
 * existe, nada é renderizado — sem placeholder, sem "em breve", sem botão
 * desabilitado.
 */
export function AssistirNoYoutube({
  href,
  id,
  className,
}: {
  href: string | null;
  id: string;
  className?: string;
}) {
  if (!href) return null;
  return (
    <LinkExterno className={className} href={href} id={id}>
      Assistir no YouTube
    </LinkExterno>
  );
}
