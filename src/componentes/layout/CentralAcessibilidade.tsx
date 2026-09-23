"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CHAVE_MOVIMENTO,
  CHAVE_TEXTO,
  CHAVES_PREFERENCIAS,
} from "../../lib/preferencias-interface";
import {
  atributoDoTema,
  CHAVE_TEMA,
  TEMAS,
  type Tema,
  temaArmazenado,
} from "../../lib/tema";
import { Button } from "../ui/Button";

const ROTULOS: Record<Tema, string> = {
  sistema: "Sistema",
  claro: "Claro",
  escuro: "Escuro",
};
function gravar(chave: string, valor: string | null) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, valor);
  } catch {
    /* A escolha continua válida nesta visita. */
  }
}
function atributo(nome: string, valor: string | null) {
  if (valor === null) document.documentElement.removeAttribute(nome);
  else document.documentElement.setAttribute(nome, valor);
}

export function CentralAcessibilidade() {
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);
  const [tema, setTema] = useState<Tema>("sistema");
  const [reduzir, setReduzir] = useState(false);
  const [maior, setMaior] = useState(false);
  const [sistemaReduzido, setSistemaReduzido] = useState(false);
  const [aviso, setAviso] = useState("");
  const gatilho = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDialogElement>(null);
  const idPainel = useId();
  const idTitulo = useId();

  useEffect(() => {
    /* Só depois da hidratação existe <body> para receber o painel. */
    setMontado(true);
    try {
      setTema(temaArmazenado(localStorage.getItem(CHAVE_TEMA)));
      setReduzir(localStorage.getItem(CHAVE_MOVIMENTO) === "reduzido");
      setMaior(localStorage.getItem(CHAVE_TEXTO) === "maior");
    } catch {
      /* Padrões do sistema quando o armazenamento está bloqueado. */
    }
    const consulta = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSistemaReduzido(consulta.matches);
    const mudar = (evento: MediaQueryListEvent) =>
      setSistemaReduzido(evento.matches);
    consulta.addEventListener("change", mudar);
    return () => consulta.removeEventListener("change", mudar);
  }, []);

  function aplicarTema(valor: Tema) {
    setAviso("");
    setTema(valor);
    atributo("data-tema", atributoDoTema(valor));
    gravar(CHAVE_TEMA, valor === "sistema" ? null : valor);
  }
  function restaurar() {
    setTema("sistema");
    setReduzir(false);
    setMaior(false);
    for (const chave of CHAVES_PREFERENCIAS) gravar(chave, null);
    for (const nome of ["data-tema", "data-movimento", "data-texto"])
      atributo(nome, null);
    setAviso("Preferências restauradas.");
  }

  /*
    O painel vive em <body>, e não ao lado do gatilho, no cabeçalho. O
    cabeçalho tem `backdrop-filter`, e um ancestral com filtro vira o bloco
    recipiente dos descendentes `position: fixed` — inclusive de um <dialog>
    modal, nos motores que não o retiram dessa cadeia ao promovê-lo à camada
    superior. Medido nesta árvore, o painel deixava de ser centrado na
    viewport e passava a ser centrado na faixa de 81 px do cabeçalho: topo
    fora da tela e rodapé cortado, que é o relato vindo de celular real.

    O portal não muda marcação, foco nem semântica: o <dialog> continua o
    mesmo elemento, `aria-controls` continua a apontar para ele pelo id, e o
    foco segue preso pelo modal nativo.
  */
  const painelDaCentral = (
    <dialog
      closedby="any"
      ref={painel}
      id={idPainel}
      className="central"
      aria-labelledby={idTitulo}
      onClose={() => {
        setAberto(false);
        gatilho.current?.focus();
      }}
    >
      <div className="central__topo">
        <h2 id={idTitulo}>Acessibilidade</h2>
        <Button variant="text" onClick={() => painel.current?.close()}>
          Fechar
        </Button>
      </div>
      <fieldset>
        <legend>Tema</legend>
        <div className="central__temas">
          {TEMAS.map((opcao) => (
            <Button
              key={opcao}
              variant="secondary"
              aria-pressed={tema === opcao}
              onClick={() => aplicarTema(opcao)}
            >
              {ROTULOS[opcao]}
            </Button>
          ))}
        </div>
        <p className="central__nota">Em uso: {ROTULOS[tema]}</p>
      </fieldset>
      <fieldset>
        <legend>Movimento</legend>
        <label className="central__opcao">
          <input
            type="checkbox"
            checked={reduzir}
            onChange={(evento) => {
              const ativo = evento.target.checked;
              setAviso("");
              setReduzir(ativo);
              atributo("data-movimento", ativo ? "reduzido" : null);
              gravar(CHAVE_MOVIMENTO, ativo ? "reduzido" : null);
            }}
          />
          Reduzir animações
        </label>
        <p className="central__nota">
          {sistemaReduzido
            ? "Seu sistema pede menos animação, e o site já respeita isso."
            : reduzir
              ? "Animações reduzidas nesta visita e nas próximas."
              : "Seguindo a preferência de animação do seu sistema."}
        </p>
      </fieldset>
      <fieldset>
        <legend>Leitura</legend>
        <label className="central__opcao">
          <input
            type="checkbox"
            checked={maior}
            onChange={(evento) => {
              const ativo = evento.target.checked;
              setAviso("");
              setMaior(ativo);
              atributo("data-texto", ativo ? "maior" : null);
              gravar(CHAVE_TEXTO, ativo ? "maior" : null);
            }}
          />
          Texto maior
        </label>
        <p className="central__nota">
          {maior ? "Texto ampliado." : "Texto no tamanho padrão."} Você também
          pode usar o zoom do navegador.
        </p>
      </fieldset>
      <Button variant="secondary" onClick={restaurar}>
        Restaurar preferências
      </Button>
      <p role="status" className="central__nota">
        {aviso}
      </p>
      <p className="central__ajuda">
        As preferências ficam neste navegador. Encontrou uma barreira?{" "}
        <a href="mailto:obstobiassoueu@gmail.com">Relatar ao Observatório</a>.
      </p>
    </dialog>
  );

  return (
    <div>
      <Button
        variant="utility"
        className="hl-topo__acessibilidade"
        ref={gatilho}
        aria-controls={idPainel}
        aria-expanded={aberto}
        aria-haspopup="dialog"
        onClick={() => {
          painel.current?.showModal();
          setAberto(true);
        }}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="4" r="2" />
          <path d="M4 9h16M12 7v7m0 0-5 7m5-7 5 7" />
        </svg>
        <span>Acessibilidade</span>
      </Button>
      {montado && createPortal(painelDaCentral, document.body)}
    </div>
  );
}
