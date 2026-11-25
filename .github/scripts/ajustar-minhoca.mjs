import fs from "node:fs";

const arquivo = process.argv[2];
const original = fs.readFileSync(arquivo, "utf8");

const colunas = 53;
const linhas = 7;
const passo = 16;
const origem = 2;
const tamanho = 11;

const comida = new Set();
for (const achado of original.matchAll(/class="c c\d+" x="([\d.]+)" y="([\d.]+)"/g)) {
  comida.add(`${Math.round(Number(achado[1]))},${Math.round(Number(achado[2]))}`);
}

const casas = [];
for (let linha = 0; linha < linhas; linha++) {
  for (let coluna = 0; coluna < colunas; coluna++) {
    const x = origem + (linha % 2 === 0 ? coluna : colunas - 1 - coluna) * passo;
    const y = origem + linha * passo;
    casas.push([x, y]);
  }
}

const percurso = [...casas, ...casas.slice(0, -1).reverse()];
const voltas = percurso.length - 1;

function quadros(atraso) {
  const partes = [];
  for (let passoAtual = 0; passoAtual <= voltas; passoAtual++) {
    const casa = percurso[(passoAtual - atraso + voltas) % voltas];
    const ponto = ((passoAtual / voltas) * 100).toFixed(2);
    partes.push(`${ponto}%{transform:translate(${casa[0]}px,${casa[1]}px)}`);
  }
  return partes.join("");
}

const quadrados = [];
for (let linha = 0; linha < linhas; linha++) {
  for (let coluna = 0; coluna < colunas; coluna++) {
    const x = origem + coluna * passo;
    const y = origem + linha * passo;
    const classe = comida.has(`${x},${y}`) ? " casa comida" : " casa";
    quadrados.push(`<rect class="${classe}" x="${x}" y="${y}" width="${tamanho}" height="${tamanho}" rx="2"/>`);
  }
}

const largura = origem + colunas * passo + 4;
const altura = origem + linhas * passo + 4;
const svg = `<svg viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" xmlns="http://www.w3.org/2000/svg">
<style>
.casa{fill:#21262d;stroke:#30363d;stroke-width:1}
.comida{fill:#3fb950;stroke:#3fb950}
.corpo{fill:#9eeec8}
.bola{fill:#5ef0b0}
.mover{animation:anda 18s linear infinite}
@keyframes anda{${quadros(0)}}
.b1{animation-name:b1}
@keyframes b1{${quadros(1)}}
.b2{animation-name:b2}
@keyframes b2{${quadros(2)}}
.b3{animation-name:b3}
@keyframes b3{${quadros(3)}}
.b4{animation-name:b4}
@keyframes b4{${quadros(4)}}
</style>
${quadrados.join("")}
<rect class="corpo mover b4" width="${tamanho}" height="${tamanho}" rx="3"/>
<rect class="corpo mover b3" width="${tamanho}" height="${tamanho}" rx="3"/>
<rect class="corpo mover b2" width="${tamanho}" height="${tamanho}" rx="3"/>
<rect class="corpo mover b1" width="${tamanho}" height="${tamanho}" rx="3"/>
<circle class="bola mover" cx="5.5" cy="5.5" r="4"/>
</svg>
`;

fs.writeFileSync(arquivo, svg);
