import { ActionLink } from "../ui/ActionLink";

type Props = { href: string; id: string; className?: string };
export function OuvirNoSpotify({ href, id, className }: Props) {
  return (
    <ActionLink variant="primary" href={href} id={id} className={className}>
      Ouvir no Spotify
    </ActionLink>
  );
}
export function AssistirNoYoutube({
  href,
  id,
  className,
}: Omit<Props, "href"> & { href: string | null }) {
  if (!href) return null;
  return (
    <ActionLink variant="secondary" href={href} id={id} className={className}>
      Assistir no YouTube
    </ActionLink>
  );
}
