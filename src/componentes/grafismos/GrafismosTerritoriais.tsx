/**
 * Grafismos territoriais.
 *
 * São peças decorativas, sem conteúdo alternativo e sem interação. O traçado
 * do rio deriva da geometria pública do OpenStreetMap já versionada em
 * `territoriovivo/local/entorno-jacare.json`; o perfil da serra é evocativo,
 * não uma representação altimétrica.
 */

export function GrafismoRioReal() {
  return (
    <svg
      aria-hidden="true"
      className="hl-grafismo hl-grafismo--rio"
      data-grafismo-territorial="rio-real"
      focusable="false"
      viewBox="0 0 1000 300"
    >
      <path
        d="M0 34.2L16.9 31.5 18.7 27.2 91.3 23.2 140 26.8 175.8 36.9 154.9 44 168.9 52.2 192 58.7 176.5 64.4 232 71.5 240.7 78.3 275.6 82.3 281 89.3 319.4 93.5 337.8 102.2 321 109 303.6 114.2 290.3 121.2 277.5 127.3 261.1 129.9 229.4 133.1 242.2 137.1 264.3 142.6 281.2 150.1 312.3 152.9 378.8 153.5 407.3 158.4 406.3 165.5 402.2 170.2 375.1 177.3 374.6 182.7 396.7 190.8 395.7 199.8 416.2 205 426.2 209.1 432.7 215.4 460.6 220.7 481.3 220.5 517 221.4 529 228.1 566 224.4 602.4 225.3 663.9 223.8 691.3 226.2 717.7 228.3 775 236.8 757.4 235.2 840.2 242 910.2 244.2 930.2 242.6 978.4 240.7 951.9 247.4 948.9 262 982.6 268.3 939.4 277.1 920.4 280"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function GrafismoSerra() {
  return (
    <svg
      aria-hidden="true"
      className="hl-grafismo hl-grafismo--serra"
      data-grafismo-territorial="serra"
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 1200 180"
    >
      <path
        d="M0 162C88 151 118 121 191 126c56 4 86-25 139-31 66-8 91 34 150 26 58-8 89-72 158-77 70-5 102 82 169 76 55-5 86-42 142-35 71 9 98 65 171 55 46-6 77-23 120-14"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M0 174c105-7 151-28 231-24 92 5 137-17 213-13 97 5 143 31 233 18 93-13 144-15 231 0 101 18 171-9 292-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
