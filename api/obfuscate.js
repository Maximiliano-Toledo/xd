// obfuscate.js
const fs = require("fs");
const path = require("path");
const obfuscator = require("javascript-obfuscator");

const inputDir = path.join(__dirname);
const outputDir = path.join(__dirname, "api-dist");

function shouldSkip(filePath) {
  return filePath.includes("node_modules");
}

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function obfuscateFile(inputPath, outputPath) {
  const code = fs.readFileSync(inputPath, "utf8");
  const obfuscatedCode = obfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
  }).getObfuscatedCode();

  ensureDirSync(path.dirname(outputPath));
  fs.writeFileSync(outputPath, obfuscatedCode, "utf8");
  console.log(`✅ Ofuscado: ${inputPath} → ${outputPath}`);
}

function walkDir(currentPath) {
  const items = fs.readdirSync(currentPath);

  for (const item of items) {
    const fullPath = path.join(currentPath, item);

    if (shouldSkip(fullPath)) continue;

    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (stat.isFile() && fullPath.endsWith(".js")) {
      const relativePath = path.relative(inputDir, fullPath);
      const outputPath = path.join(outputDir, relativePath);
      obfuscateFile(fullPath, outputPath);
    }
  }
}

// Eliminar carpeta de salida si existe
if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}

walkDir(inputDir);
console.log("🎉 Ofuscación completa.");
