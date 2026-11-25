import fs from "node:fs";

const arquivo = process.argv[2];
let svg = fs.readFileSync(arquivo, "utf8");

svg = svg.replace(/viewBox="[^"]+"/, 'viewBox="0 0 852 114"');
svg = svg.replace(/<svg([^>]*?) width="[^"]+"/, '<svg$1 width="852"');
svg = svg.replace(/<svg([^>]*?) height="[^"]+"/, '<svg$1 height="114"');
svg = svg.replaceAll("-16px", "0px");
svg = svg.replaceAll("--cs:purple", "--cs:#5ef0b0");
svg = svg.replaceAll("--ce:#ebedf0", "--ce:#21262d");
svg = svg.replaceAll("--c0:#ebedf0", "--c0:#21262d");
svg = svg.replaceAll("--c1:#9be9a8", "--c1:#3fb950");
svg = svg.replaceAll("--c2:#40c463", "--c2:#26a641");
svg = svg.replaceAll("--c3:#30a14e", "--c3:#006d32");
svg = svg.replaceAll("--c4:#216e39", "--c4:#5ef0b0");
svg = svg.replaceAll("--cb:#1b1f230a", "--cb:#30363d");

fs.writeFileSync(arquivo, svg);
