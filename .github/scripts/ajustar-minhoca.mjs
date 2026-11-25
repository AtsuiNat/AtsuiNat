import fs from "node:fs";

const arquivo = process.argv[2];
const original = fs.readFileSync(arquivo, "utf8");

const colunas = 53;
const linhas = 7;
const passo = 16;
const origem = 2;
const tamanho = 12;
const cores = {
  c0: "#9be9a8",
  c1: "#40c463",
  c2: "#30a14e",
  c3: "#216e39",
  c4: "#5ef0b0",
};

const frutas = [];
for (const achado of original.matchAll(/class="c (c\d+)" x="([\d.]+)" y="([\d.]+)"/g)) {
  const coluna = Math.round((Number(achado[2]) - origem) / passo);
  const linha = Math.round((Number(achado[3]) - origem) / passo);
  if (coluna < 0 || coluna >= colunas || linha < 0 || linha >= linhas) continue;
  frutas.push({ coluna, linha, cor: cores[achado[1]] || "#3fb950" });
}
frutas.sort((a, b) => a.coluna - b.coluna || a.linha - b.linha);

function andar(de, para, destino) {
  let coluna = de.coluna;
  let linha = de.linha;
  while (coluna !== para.coluna || linha !== para.linha) {
    const faltaColuna = Math.abs(para.coluna - coluna);
    const faltaLinha = Math.abs(para.linha - linha);
    if (faltaLinha > faltaColuna) linha += Math.sign(para.linha - linha);
    else coluna += Math.sign(para.coluna - coluna);
    destino.push({ coluna, linha });
    if (coluna === para.coluna && linha === para.linha) {
      destino.push({ coluna, linha });
    }
  }
}

const percurso = [];
if (frutas.length) {
  const inicio = {
    coluna: Math.max(0, frutas[0].coluna - 4),
    linha: frutas[0].linha,
  };
  percurso.push(inicio);
  let atual = inicio;
  for (const fruta of frutas) {
    andar(atual, fruta, percurso);
    atual = fruta;
  }
  andar(atual, inicio, percurso);
} else {
  percurso.push({ coluna: 0, linha: 0 }, { coluna: 1, linha: 0 }, { coluna: 0, linha: 0 });
}

if (percurso.length > 1 && percurso.at(-1).coluna === percurso[0].coluna && percurso.at(-1).linha === percurso[0].linha) {
  percurso.pop();
}

const voltas = percurso.length;
const lugar = (indice) => percurso[(indice + voltas) % voltas];
const px = (casa) => `${origem + casa.coluna * passo}px,${origem + casa.linha * passo}px`;

function quadros(atraso) {
  const partes = [];
  for (let passoAtual = 0; passoAtual <= voltas; passoAtual++) {
    const casa = lugar(passoAtual - atraso);
    const ponto = ((passoAtual / voltas) * 100).toFixed(2);
    partes.push(`${ponto}%{transform:translate(${px(casa)})}`);
  }
  return partes.join("");
}

function sumir(fruta) {
  const indice = percurso.findIndex((casa) => casa.coluna === fruta.coluna && casa.linha === fruta.linha);
  const chegada = Math.max(0.6, (indice / voltas) * 100);
  const antes = Math.max(0, chegada - 0.35).toFixed(2);
  return `0%,${antes}%{opacity:1}${chegada.toFixed(2)}%,99.6%{opacity:0}100%{opacity:1}`;
}

const quadrados = [];
for (let linha = 0; linha < linhas; linha++) {
  for (let coluna = 0; coluna < colunas; coluna++) {
    const x = origem + coluna * passo;
    const y = origem + linha * passo;
    quadrados.push(`<rect class="casa" x="${x}" y="${y}" width="${tamanho}" height="${tamanho}" rx="2"/>`);
  }
}

const frutasSvg = frutas.map((fruta, indice) => {
  const x = origem + fruta.coluna * passo + 6;
  const y = origem + fruta.linha * passo + 6;
  return `<circle class="fruta f${indice}" cx="${x}" cy="${y}" r="4.5" fill="${fruta.cor}"/>`;
});

const estilosFruta = frutas.map((fruta, indice) => `.f${indice}{animation:come${indice} 9s linear infinite}@keyframes come${indice}{${sumir(fruta)}}`).join("");
const largura = origem + colunas * passo + 6;
const altura = origem + linhas * passo + 6;

const svg = `<svg viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" xmlns="http://www.w3.org/2000/svg">
<style>
.casa{fill:#21262d;stroke:#30363d}
.fruta{transform-box:fill-box}
${estilosFruta}
.corpo{fill:#d9fff0}
.cabeca{fill:#5ef0b0}
.mover{animation-duration:9s;animation-timing-function:linear;animation-iteration-count:infinite}
@keyframes cabeca{${quadros(0)}}
@keyframes c1{${quadros(1)}}
@keyframes c2{${quadros(2)}}
@keyframes c3{${quadros(3)}}
</style>
${quadrados.join("")}
${frutasSvg.join("")}
<rect class="corpo mover" style="animation-name:c3" width="${tamanho}" height="${tamanho}" rx="3"/>
<rect class="corpo mover" style="animation-name:c2" width="${tamanho}" height="${tamanho}" rx="3"/>
<rect class="corpo mover" style="animation-name:c1" width="${tamanho}" height="${tamanho}" rx="3"/>
<rect class="cabeca mover" style="animation-name:cabeca" width="${tamanho}" height="${tamanho}" rx="4"/>
</svg>
`;

fs.writeFileSync(arquivo, svg);
