"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { tipoPublico } from "../../dados/editorial/tipos-publicos";
import {
  type DocumentoDoIndice,
  ListaDocumentosPublicos,
} from "./ListaDocumentosPublicos";

export function filtrarDocumentos(
  documentos: readonly DocumentoDoIndice[],
  busca: string,
  tipo: string,
) {
  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  return documentos.filter((documento) => {
    if (tipo && documento.tipo !== tipo) return false;
    const conteudo = [
      documento.titulo,
      documento.resumo ?? "",
      tipoPublico(documento.tipo, documento.slug),
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");
    return !termo || conteudo.includes(termo);
  });
}

export function BuscaAcervo({
  documentos,
}: {
  documentos: readonly DocumentoDoIndice[];
}) {
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

  const encontrados = filtrarDocumentos(documentos, q, tipo);

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
              placeholder="Título ou assunto"
              maxLength={120}
              className="min-w-0 flex-1 border px-3 py-2"
            />
            <button type="submit" className="acervo-botao px-4 py-2">
              Buscar
            </button>
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
          {encontrados.length}{" "}
          {encontrados.length === 1
            ? "documento encontrado"
            : "documentos encontrados"}
        </p>
        {q || tipo ? (
          <button
            type="button"
            onClick={() => {
              definirEntrada("");
              navegar("", "");
            }}
            className="acervo-link"
          >
            Limpar busca e filtros
          </button>
        ) : null}
      </div>
      {encontrados.length ? (
        <ListaDocumentosPublicos documentos={encontrados} />
      ) : (
        <p className="acervo-vazio border p-6">Nenhum documento encontrado.</p>
      )}
    </section>
  );
}
