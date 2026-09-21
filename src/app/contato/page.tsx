import { metadadosDaRota } from "../../lib/site-url";

export const metadata = metadadosDaRota({
  pathname: "/contato",
  titulo: "Contato — Observatório do Vale do Rio Real",
  descricao:
    "E-mail e redes do Observatório do Vale do Rio Real e do Coletivo Tobias Sou Eu.",
});

const canais = [
  {
    id: "observatorio",
    numero: "01",
    nome: "Observatório",
    chamada: "Para falar sobre o Observatório",
    email: "obstobiassoueu@gmail.com",
    instagram: "@obs_tobiassoueu",
    instagramUrl: "https://www.instagram.com/obs_tobiassoueu/",
  },
  {
    id: "coletivo",
    numero: "02",
    nome: "Coletivo Tobias Sou Eu",
    chamada: "Para falar com o Coletivo ou acompanhar seus canais",
    email: "coletivotobiassoueu@gmail.com",
    instagram: "@tobiassoueu",
    instagramUrl: "https://www.instagram.com/tobiassoueu/",
    youtube: "@TobiassouEu",
    youtubeUrl: "https://www.youtube.com/@TobiassouEu",
  },
] as const;

export default function PaginaContato() {
  return (
    <div className="ct">
      <header className="ct-abertura">
        <div className="ct-abertura__miolo">
          <p className="ct-sobretitulo">
            Observatório do Vale do Rio Real / Contato
          </p>
          <h1>
            Por onde <br />
            conversar.
          </h1>
          <p className="ct-abertura__texto">
            Escolha o canal de quem você procura. O Observatório e o Coletivo
            Tobias Sou Eu têm contatos próprios.
          </p>
        </div>
        <p className="ct-abertura__indice" aria-hidden="true">
          01 / 02
        </p>
      </header>

      <div className="ct-lista">
        {canais.map((canal) => (
          <section
            aria-labelledby={`${canal.id}-titulo`}
            className={`ct-entidade ct-entidade--${canal.id}`}
            key={canal.id}
          >
            <div className="ct-entidade__cabecalho">
              <span className="ct-numero" aria-hidden="true">
                {canal.numero}
              </span>
              <div>
                <p className="ct-rotulo">Canal institucional</p>
                <h2 id={`${canal.id}-titulo`}>{canal.nome}</h2>
                <p className="ct-chamada">{canal.chamada}</p>
              </div>
            </div>

            <div className="ct-canais">
              <span className="sr-only" id={`${canal.id}-aviso-nova-guia`}>
                Abre em nova guia.
              </span>
              <div className="ct-canal ct-canal--email">
                <p className="ct-canal__tipo">
                  Contato direto <span> / E-mail</span>
                </p>
                <a href={`mailto:${canal.email}`}>{canal.email}</a>
              </div>
              <div className="ct-canal">
                <p className="ct-canal__tipo">
                  Acompanhar <span> / Instagram</span>
                </p>
                <a
                  aria-describedby={`${canal.id}-aviso-nova-guia`}
                  href={canal.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {canal.instagram}
                  <span className="ct-seta" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
              {"youtube" in canal ? (
                <div className="ct-canal">
                  <p className="ct-canal__tipo">
                    Vídeos <span> / YouTube</span>
                  </p>
                  <a
                    aria-describedby={`${canal.id}-aviso-nova-guia`}
                    href={canal.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {canal.youtube}
                    <span className="ct-seta" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                </div>
              ) : null}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
