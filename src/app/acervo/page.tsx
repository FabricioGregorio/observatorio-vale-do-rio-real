import Link from "next/link";
import { Suspense } from "react";

import { BuscaAcervo } from "../../componentes/acervo/BuscaAcervo";
import { tamanhoLegivel } from "../../componentes/acervo/formato";
import {
  type DocumentoDoIndice,
  ListaDocumentosPublicos,
} from "../../componentes/acervo/ListaDocumentosPublicos";
import { ActionLink } from "../../componentes/ui/ActionLink";
import { listarDocumentosPublicos } from "../../dados/publicado/acervo";
import { pacoteDoAcervo } from "../../dados/publicado/downloads";
import { metadadosDaRota } from "../../lib/site-url";
import "./acervo.css";

export const metadata = metadadosDaRota({
  pathname: "/acervo",
  titulo: "Acervo — Observatório do Vale do Rio Real",
  descricao: "Documentos e registros públicos da pesquisa do Observatório.",
});

export default async function PaginaAcervo() {
  const documentos = await listarDocumentosPublicos();
  const pacote = pacoteDoAcervo();
  const indice: DocumentoDoIndice[] = documentos.map((documento) => ({
    slug: documento.slug,
    titulo: documento.titulo,
    tipo: documento.tipo,
    resumo: documento.resumo,
    quantidade: documento.arquivos.length,
  }));
  const arquivos = indice.reduce(
    (soma, documento) => soma + documento.quantidade,
    0,
  );

  return (
    <div className="acervo mx-auto flex max-w-6xl flex-col gap-12 px-4 py-10 md:py-16">
      <header className="acervo-abertura relative overflow-hidden border-b pb-10 md:pb-14">
        <div className="acervo-tracado" aria-hidden="true" />
        <p className="meta-ficha">Acervo público</p>
        <h1 className="relative mt-5 max-w-3xl text-4xl md:text-5xl">
          Documentos e registros da pesquisa
        </h1>
        <p className="relative mt-5 max-w-prose text-lg">
          Tudo o que a pesquisa reuniu e pôde ser publicado está aqui:
          relatórios técnicos, entrevistas gravadas com transcrição, fotografias
          de campo, planilhas de resposta e peças de identidade. Cada arquivo
          tem endereço próprio, sem login e sem pedido de acesso.
        </p>
        <p className="meta-ficha relative mt-8">
          {documentos.length} documentos · {arquivos} arquivos públicos
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <div>
          <p className="meta-ficha">Consulta documental</p>
          <h2 className="mt-2 text-2xl">Percorra o acervo</h2>
          <p className="mt-3 max-w-prose">
            A consulta é por documento. Um documento pode reunir vários arquivos
            — o anexo de indicadores tem dezoito; o conjunto fotográfico,
            dezenas —, e a ficha de cada um traz formato, tamanho, licença e
            data de publicação.
          </p>
        </div>
        <Suspense
          fallback={
            <div>
              <p className="meta-ficha mb-6">{indice.length} documentos</p>
              <ListaDocumentosPublicos documentos={indice} />
            </div>
          }
        >
          <BuscaAcervo documentos={indice} />
        </Suspense>

        {/*
          O que ainda não existe é dito, e não insinuado.

          O Caderno de Estudos está em preparação. Enquanto não houver
          arquivo, ele não tem ficha, endereço, botão nem entrada no
          inventário: anunciar um documento que não existe é a única coisa
          que um acervo documental não pode fazer. A linha é curta de
          propósito — é estado editorial, não vitrine.
        */}
        <p className="acervo-elaboracao max-w-prose text-sm">
          <span className="meta-ficha">Em elaboração</span> Caderno de Estudos,
          ainda sendo escrito. Quando for publicado, entra no acervo como os
          demais: endereço próprio, licença declarada e arquivo para baixar.
        </p>
      </div>

      <aside className="acervo-nota border-l-2 pl-5">
        <h2 className="text-lg">O que este acervo reúne</h2>
        <p className="mt-2 max-w-prose">
          O Acervo reúne somente os materiais que integram o corpus público do
          Observatório. Nem tudo o que a pesquisa produziu faz parte desse
          conjunto: entram aqui os materiais autorizados para publicação e
          preservação pública, e é sobre eles que valem o endereço permanente e
          a licença declarada.
        </p>
        <p className="mt-3 max-w-prose">
          O percurso que produziu estes documentos está em{" "}
          <Link href="/pesquisa" prefetch={false}>
            A Pesquisa
          </Link>
          , e o que cada lugar reuniu aparece lugar a lugar no{" "}
          <Link href="/territorio" prefetch={false}>
            Território
          </Link>
          .
        </p>
      </aside>

      {pacote ? (
        <section
          className="acervo-inventario flex flex-wrap items-end justify-between gap-5 border-t pt-8"
          aria-labelledby="acervo-pacote"
        >
          <div>
            <h2 id="acervo-pacote" className="text-xl">
              Acervo completo
            </h2>
            <p className="mt-2 max-w-prose">
              Os {arquivos} arquivos públicos em um pacote único, organizados
              por documento — os mesmos originais que cada ficha oferece, sem
              versão reduzida.
            </p>
          </div>
          {/*
            O tamanho vai no próprio rótulo: quem está num plano de dados
            limitado decide antes de tocar, e não depois. Hash, chave e
            endereço do objeto não aparecem — a interface fala com pessoas.
          */}
          <ActionLink variant="document" href={pacote.url}>
            Baixar tudo em ZIP · {tamanhoLegivel(pacote.bytes)}
          </ActionLink>
        </section>
      ) : null}

      <section
        className="acervo-inventario flex flex-wrap items-end justify-between gap-5 border-t pt-8"
        aria-labelledby="acervo-inventario"
      >
        <div>
          <h2 id="acervo-inventario" className="text-xl">
            Inventário público
          </h2>
          <p className="mt-2 max-w-prose">
            A mesma lista, em arquivo único e legível por máquina, com endereço
            e licença de cada peça — útil para quem precisa consultar o acervo
            inteiro de uma vez.
          </p>
        </div>
        <span id="acervo-inventario-nova-guia" className="sr-only">
          Abre em nova guia.
        </span>
        <a
          href="/anexos.json"
          className="acervo-link"
          aria-describedby="acervo-inventario-nova-guia"
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar inventário em JSON <span aria-hidden="true">↗</span>
        </a>
      </section>
    </div>
  );
}
