import { getImageProps } from "next/image";
import {
  DERIVADOS_DOS_LUGARES,
  PASTA_PUBLICA_DA_PESQUISA,
  tituloPublicoDaFotografia,
} from "../../dados/pesquisa/derivados";

/** Seleção de apresentação; arquivos e legendas continuam no manifesto. */
export function FotografiaDoObservatorio({
  arquivo,
  abertura = false,
}: {
  arquivo:
    | "serra-dos-macacos-serras-e-nuvens.webp"
    | "borda-conversa-oviedo-neide.webp";
  abertura?: boolean;
}) {
  const foto = DERIVADOS_DOS_LUGARES.find((item) => item.arquivo === arquivo);
  const titulo = foto ? tituloPublicoDaFotografia(foto.sha256) : null;
  if (!foto || !titulo) {
    throw new Error(`Fotografia do Observatório sem procedência: ${arquivo}`);
  }
  // O pipeline existente gera srcset no servidor, sem hidratar cada imagem.
  // Só a apresentação é otimizada; os derivados documentais ficam intactos.
  const { props } = getImageProps({
    alt: foto.alt,
    height: foto.altura,
    width: foto.largura,
    loading: abertura ? "eager" : "lazy",
    fetchPriority: abertura ? "high" : undefined,
    sizes: abertura
      ? "(min-width: 1920px) 1640px, 85vw"
      : "(min-width: 960px) 42vw, 90vw",
    src: `${PASTA_PUBLICA_DA_PESQUISA}/${foto.arquivo}`,
  });
  return (
    <figure className={`obs-foto${abertura ? " obs-foto--abertura" : ""}`}>
      <img {...props} alt={foto.alt} />
      <figcaption>
        <span className="meta-ficha">{foto.local}</span>
        <span>{titulo}</span>
        {foto.credito ? <span>{foto.credito}</span> : null}
      </figcaption>
    </figure>
  );
}
