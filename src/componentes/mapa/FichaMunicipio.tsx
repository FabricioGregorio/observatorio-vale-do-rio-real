import type { MunicipioDoMapa } from "../../dados/territorio/mapa";
import type { PontoDeVisita } from "../../dados/territorio/tipos";

/**
 * Ficha de um município — Tarefa 10B.3.3.
 *
 * Server Component. Mostra o que existe no dado e **some quando não há**: sem
 * evidência de pesquisa e sem ponto relacionado, devolve `null`, e o município
 * fica só com nome e relações na lista. Nenhum número, nenhuma comparação,
 * nenhuma narrativa — a ficha não inventa.
 *
 * As evidências existem porque afirmar que um município foi pesquisado é
 * afirmação verificável (10B.2.2). Aqui elas aparecem para quem lê, não só no
 * código.
 */
export function FichaMunicipio({
  municipio,
  pontos,
}: {
  municipio: MunicipioDoMapa;
  pontos: readonly PontoDeVisita[];
}) {
  const relacionados = pontos.filter(
    (ponto) => ponto.municipioId === municipio.codigoIbge,
  );
  const temEvidencia = municipio.evidenciasDePesquisa.length > 0;

  if (!temEvidencia && relacionados.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {temEvidencia ? (
        <>
          <p className="meta-ficha">Evidências da pesquisa de campo</p>
          <ul className="flex list-none flex-col p-0">
            {municipio.evidenciasDePesquisa.map((evidencia) => (
              <li key={evidencia}>{evidencia}</li>
            ))}
          </ul>
        </>
      ) : null}

      {relacionados.length === 0 ? null : (
        <>
          <p className="meta-ficha">Pontos de visita</p>
          <ul className="flex list-none flex-col p-0">
            {relacionados.map((ponto) => (
              <li key={ponto.id}>{ponto.nome}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
