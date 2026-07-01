import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const svg = readFileSync(join(publicDir, "icon.svg"));

async function generate() {
  await sharp(svg).resize(192, 192).png().toFile(join(publicDir, "icon-192.png"));
  await sharp(svg).resize(512, 512).png().toFile(join(publicDir, "icon-512.png"));
  await sharp(svg)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 109, g: 40, b: 217, alpha: 1 },
    })
    .png()
    .toFile(join(publicDir, "icon-maskable-512.png"));

  console.log("[pwa] Ícones PNG gerados em public/");
}

generate().catch((error) => {
  console.error("[pwa] Erro ao gerar ícones:", error);
  process.exit(1);
});
