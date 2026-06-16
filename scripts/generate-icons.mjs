import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "public", "logo.png");
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

/** חותך מסכה עגולה — רק העיגול, בלי רקע מרובע מסביב */
async function extractCircularLogo(input) {
  const image = sharp(input);
  const { width, height } = await image.metadata();
  const w = width ?? 512;
  const h = height ?? 512;
  const cx = w / 2;
  const cy = h / 2;
  const radius = (Math.min(w, h) / 2) * 0.96;

  const mask = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${radius}" fill="white"/>
    </svg>`
  );

  return sharp(input)
    .ensureAlpha()
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function buildIcon(circularLogo, size) {
  return sharp(circularLogo)
    .resize(size, size, {
      fit: "contain",
      background: transparent,
      position: "centre",
    })
    .png()
    .toBuffer();
}

const circularLogo = await extractCircularLogo(src);
const processed = path.join(root, "public", "logo-processed.png");
await fs.writeFile(processed, circularLogo);
await fs.rename(processed, src);

const faviconSizes = [16, 32, 48];
const faviconPngs = await Promise.all(faviconSizes.map((size) => buildIcon(circularLogo, size)));
const faviconIco = await pngToIco(faviconPngs);

const outputs = [
  ["app/favicon.ico", faviconIco],
  ["public/favicon.ico", faviconIco],
  ["app/icon.png", await buildIcon(circularLogo, 32)],
  ["public/icon.png", await buildIcon(circularLogo, 32)],
  ["app/apple-icon.png", await buildIcon(circularLogo, 180)],
  ["public/apple-icon.png", await buildIcon(circularLogo, 180)],
  ["public/icon-512.png", await buildIcon(circularLogo, 512)],
];

for (const [relativePath, data] of outputs) {
  await fs.writeFile(path.join(root, relativePath), data);
}

console.log("Generated circular logo and app icons from public/logo.png");
