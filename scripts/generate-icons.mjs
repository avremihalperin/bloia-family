import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = path.resolve(import.meta.dirname, "..");
const src = path.join(root, "public", "logo.png");
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

const even = (value) => Math.max(2, value - (value % 2));

async function detectTreeBounds(imagePath) {
  const { data, info } = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const scanHeight = Math.floor(info.height * 0.58);
  let minX = info.width;
  let minY = scanHeight;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < scanHeight; y++) {
    for (let x = 0; x < info.width; x++) {
      const index = (y * info.width + x) * info.channels;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const isInk = r < 215 || g < 215 || b < 215;

      if (isInk) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX <= minX || maxY <= minY) {
    throw new Error("Could not detect tree bounds in logo.png");
  }

  return { minX, minY, maxX, maxY };
}

function isBackgroundPixel(r, g, b) {
  const isLight = r > 218 && g > 214 && b > 206;
  const isMintCard = g > r + 8 && g > b && r > 190 && g > 220;
  return isLight || isMintCard;
}

async function removeBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (isBackgroundPixel(r, g, b)) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels,
    },
  })
    .png()
    .toBuffer();
}

async function buildTreeMaster() {
  const meta = await sharp(src).metadata();
  const bounds = await detectTreeBounds(src);
  const treeWidth = bounds.maxX - bounds.minX;
  const treeHeight = bounds.maxY - bounds.minY;
  const padding = Math.round(Math.max(treeWidth, treeHeight) * 0.04);

  const left = even(Math.max(0, bounds.minX - padding));
  const top = even(Math.max(0, bounds.minY - padding));
  const width = even(
    Math.min(meta.width - left, bounds.maxX - bounds.minX + padding * 2)
  );
  const height = even(
    Math.min(meta.height - top, bounds.maxY - bounds.minY + padding * 2)
  );
  const side = even(Math.max(width, height));
  const padTop = even(Math.max(0, Math.floor((side - height) / 2)));
  const padBottom = even(Math.max(0, side - height - padTop));
  const padLeft = even(Math.max(0, Math.floor((side - width) / 2)));
  const padRight = even(Math.max(0, side - width - padLeft));

  const cropped = await sharp(src)
    .extract({ left, top, width, height })
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: transparent,
    })
    .png()
    .toBuffer();

  return removeBackground(cropped);
}

async function buildIcon(treeMaster, size) {
  return sharp(treeMaster)
    .resize(size, size, {
      fit: "contain",
      background: transparent,
      position: "centre",
    })
    .png()
    .toBuffer();
}

const treeMaster = await buildTreeMaster();

const faviconSizes = [16, 32, 48];
const faviconPngs = await Promise.all(
  faviconSizes.map((size) => buildIcon(treeMaster, size))
);
const faviconIco = await pngToIco(faviconPngs);

const outputs = [
  ["app/favicon.ico", faviconIco],
  ["public/favicon.ico", faviconIco],
  ["app/icon.png", await buildIcon(treeMaster, 32)],
  ["public/icon.png", await buildIcon(treeMaster, 32)],
  ["app/apple-icon.png", await buildIcon(treeMaster, 180)],
  ["public/apple-icon.png", await buildIcon(treeMaster, 180)],
];

for (const [relativePath, data] of outputs) {
  await fs.writeFile(path.join(root, relativePath), data);
}

console.log("Generated transparent favicon and app icons from public/logo.png");
