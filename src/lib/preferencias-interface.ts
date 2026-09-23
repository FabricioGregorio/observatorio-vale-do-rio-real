import { CHAVE_TEMA, SCRIPT_TEMA_INICIAL } from "./tema";

export const CHAVE_MOVIMENTO = "observatorio-movimento";
export const CHAVE_TEXTO = "observatorio-texto";
export const CHAVES_PREFERENCIAS = [CHAVE_TEMA, CHAVE_MOVIMENTO, CHAVE_TEXTO];
export const SCRIPT_PREFERENCIAS_INICIAIS = `${SCRIPT_TEMA_INICIAL};try{if(localStorage.getItem('${CHAVE_MOVIMENTO}')==='reduzido')document.documentElement.setAttribute('data-movimento','reduzido');if(localStorage.getItem('${CHAVE_TEXTO}')==='maior')document.documentElement.setAttribute('data-texto','maior')}catch{}`;
