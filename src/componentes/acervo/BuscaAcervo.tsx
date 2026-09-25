"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { tipoPublico } from "../../dados/editorial/tipos-publicos";
import { Button } from "../ui/Button";
import {
  buscarNoAcervo,
  expandirIndice,
  type IndiceCompacto,
  motivoDoResultado,
} from "./busca";
import { ListaDocumentosPublicos } from "./ListaDocumentosPublicos";

/** Frase de estado: documentos, e quantos arquivos o acerto apontou dentro deles. */
export function fraseDoResultado(documentos: number, arquivos: number): string {
  const base = `${documentos} ${
    documentos === 1 ? "documento encontrado" : "documentos encontrados"
  }`;
  if (arquivos === 0) return base;
  return `${base}, com ${arquivos} ${
    arquivos === 1 ? "arquivo correspondente" : "arquivos correspondentes"
  }`;
}

export function BuscaAcervo({ indice }: { indice: IndiceCompacto }) {
  const documentos = useMemo(() => expandirIndice(indice), [indice]);
  const router = useRouter();
  const parametros = useSearchParams();
  const tipos = [...new Set(documentos.map((documento) => documento.tipo))];
  const q = parametros.get("q")?.slice(0, 120) ?? "";
  const tipoDaUrl = parametros.get("tipo") ?? "";
  const tipo = tipos.includes(tipoDaUrl) ? tipoDaUrl : "";
  const [entrada, definirEntrada] = useState(q);

  useEffect(() => definirEntrada(q), [q]);

  function navegar(busca: string, novoTipo: string) {
    const params = new URLSearchParams();
    if (busca.trim()) params.set("q", busca.trim().slice(0, 120));
    if (novoTipo) params.set("tipo", novoTipo);
    router.push(params.size ? `/acervo?${params.toString()}` : "/acervo", {
      scroll: false,
    });
  }

  function pesquisar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    navegar(entrada, tipo);
  }

  const resultados = buscarNoAcervo(documentos, q, tipo);
  const encontrados = resultados.map((resultado) => resultado.documento);
  const correspondencias = new Map(
    resultados.flatMap(({ documento, correspondencia }) =>
      correspondencia ? [[documento.slug, correspondencia] as const] : [],
    ),
  );
  // O motivo só aparece quando nenhum arquivo explica o resultado.
  const motivos = new Map(
    resultados.flatMap(({ documento, correspondencia }) => {
      if (correspondencia) return [];
      const motivo = motivoDoResultado(documento, q);
      return motivo.length > 0 ? [[documento.slug, motivo] as const] : [];
    }),
  );
  // A consulta viaja com o link do documento, para o retorno devolvê-la.
  const consulta = new URLSearchParams();
  if (q.trim()) consulta.set("q", q.trim());
  if (tipo) consulta.set("tipo", tipo);
  const arquivosCorrespondentes = [...correspondencias.values()].reduce(
    (soma, c) => soma + c.arquivos.length + c.alemDosExibidos,
    0,
  );

  return (
    <section aria-label="Consulta ao acervo" className="flex flex-col gap-6">
      <form
        onSubmit={pesquisar}
        className="acervo-controles grid gap-4 border-y py-6 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.55fr)]"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="busca-acervo">Buscar documentos</label>
          <div className="flex gap-2">
            <input
              id="busca-acervo"
              name="q"
              type="search"
              value={entrada}
              onChange={(evento) => definirEntrada(evento.target.value)}
              placeholder="Título, arquivo, lugar ou instituição"
              maxLength={120}
              className="min-w-0 flex-1 border px-3 py-2"
            />
            <Button type="submit" variant="primary">
              Buscar
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="tipo-acervo">Tipo de documento</label>
          <select
            id="tipo-acervo"
            name="tipo"
            value={tipo}
            onChange={(evento) => navegar(entrada, evento.target.value)}
            className="w-full border px-3 py-2"
          >
            <option value="">Todos os tipos</option>
            {tipos.map((valor) => (
              <option key={valor} value={valor}>
                {tipoPublico(
                  valor,
                  documentos.find((d) => d.tipo === valor)?.slug ?? "",
                )}
              </option>
            ))}
          </select>
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="meta-ficha"
        >
          {fraseDoResultado(encontrados.length, arquivosCorrespondentes)}
        </p>
        {q || tipo ? (
          <Button
            type="button"
            onClick={() => {
              definirEntrada("");
              navegar("", "");
            }}
            variant="text"
          >
            Limpar busca e filtros
          </Button>
        ) : null}
      </div>
      {encontrados.length ? (
        <ListaDocumentosPublicos
          documentos={encontrados}
          correspondencias={correspondencias}
          motivos={motivos}
          consulta={consulta.toString()}
        />
      ) : (
        <p className="acervo-vazio border p-6">
          Nenhum documento ou arquivo corresponde a esta busca. Tente outra
          palavra, ou limpe a busca e os filtros para ver o acervo inteiro.
        </p>
      )}
    </section>
  );
}
