// ==================================================
// Image Watermark — Version 1.1
//
// Part of: Etsy A-Z Clipart Creator Toolkit
//
// Website:
// https://FinSavvyLlama.com
//
// GitHub Profile:
// https://github.com/vBorn2Rock
//
// Project Repository:
// https://github.com/vBorn2Rock/etsy-clipart-creator-toolkit
//
// --------------------------------------------------
//
// WHAT'S NEW IN 1.1
// - "Engraved" two-tone watermark: a soft light layer plus a
//   soft dark shadow layer. Nearly invisible at normal size,
//   clearly readable when zoomed in, on light AND dark areas.
// - Cleaner font: Avenir Next Demi Bold (instead of thin system font).
// - Text is centered on its position, so it never gets clipped
//   or wrapped by a wrong width estimate.
// - Staggered grid with light jitter: even coverage across the
//   whole image (hard to crop out) but never in a straight,
//   ugly line. Mark count adapts to image shape.
// - Text auto-shrinks if a long watermark would not fit a cell.
//
// SUPPORTED: JPG, JPEG, PNG
// DEFAULT WATERMARK: MyTreasureHub
// OPACITY: choose at runtime
// DEFAULT SIZE: Medium
// PATTERN: ~12 staggered placements with slight jitter
// FONT: choose at runtime (handwritten / script / sans)
// JPEG QUALITY: 95%
//
// SAFETY:
// - Uses native Scriptable folder picker.
// - Original images are never modified.
// - Scans subfolders recursively.
// - Skips Output folders.
// - Never overwrites existing output files.
// - Verifies saved images after processing.
//
// ==================================================


// --------------------------------------------------
// SETTINGS
// --------------------------------------------------

const fm = FileManager.local();

// Typed input is not readable in Scriptable on this iPad,
// so watermark text is chosen from this list (edit freely).
// If the list has only one item, no question is asked.
const WATERMARK_OPTIONS = [
  "MyTreasureHub",
  "© MyTreasureHub"
];


// Font choices (all built into iPadOS).
// scale   = size adjustment (script fonts look smaller)
// charW   = average glyph width vs font size (for fitting)
const FONT_OPTIONS = [
  { label: "Bradley Hand (Recommended)", name: "BradleyHandITCTT-Bold", scale: 1.2, charW: 0.5 },
  { label: "Handwritten (Noteworthy)", name: "Noteworthy-Bold", scale: 1.1, charW: 0.55 },
  { label: "Elegant script (Snell)", name: "SnellRoundhand-Bold", scale: 1.3, charW: 0.48 },
  { label: "Clean sans (Avenir)", name: "AvenirNext-DemiBold", scale: 1.0, charW: 0.62 }
];

// Target number of marks (actual count adapts to image shape).
const WATERMARK_COUNT = 12;

// Random shift of each mark inside its cell (0 = none, 0.1 = ±10%).
const JITTER = 0.1;

// Dark shadow layer strength relative to the light layer.
const SHADOW_STRENGTH = 0.9;

const JPEG_QUALITY = 0.95;

const SUPPORTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png"
];


// --------------------------------------------------
// WATERMARK TEXT (chosen from WATERMARK_OPTIONS)
// --------------------------------------------------

let watermark = WATERMARK_OPTIONS[0];

if (WATERMARK_OPTIONS.length > 1) {

  const textPrompt = new Alert();

  textPrompt.title = "Watermark Text";
  textPrompt.message = "Choose the watermark text.";

  for (const option of WATERMARK_OPTIONS) {
    textPrompt.addAction(option);
  }

  textPrompt.addCancelAction("Cancel");

  const textResult = await textPrompt.presentAlert();

  if (textResult === -1) {
    Script.complete();
    return;
  }

  watermark = WATERMARK_OPTIONS[textResult];
}

// Opacity is chosen with buttons (typed numbers are not
// reliably returned by Scriptable on this iPadOS version).
const RECOMMENDED_OPACITY = 14;
const opacityOptions = [10, 14, 16, 20, 25, 30];

const opacityPrompt = new Alert();

opacityPrompt.title = "Watermark Opacity";
opacityPrompt.message =
  "Lower = more subtle. 14% is recommended for Etsy covers.";

for (const option of opacityOptions) {
  opacityPrompt.addAction(option + "%" + (option === RECOMMENDED_OPACITY ? " (Recommended)" : ""));
}

opacityPrompt.addCancelAction("Cancel");

const opacityResult = await opacityPrompt.presentAlert();

if (opacityResult === -1) {
  Script.complete();
  return;
}

const opacityNumber = opacityOptions[opacityResult];


// --------------------------------------------------
// VALIDATE INPUTS
// --------------------------------------------------

watermark = watermark.trim();

if (!watermark) {
  throw new Error("Watermark text cannot be empty.");
}

const watermarkOpacity = opacityNumber / 100;

console.log("Watermark: " + watermark);
console.log("Opacity applied: " + watermarkOpacity);


// --------------------------------------------------
// WATERMARK SIZE
// --------------------------------------------------

const sizePrompt = new Alert();

sizePrompt.title = "Watermark Size";
sizePrompt.message = "Choose the watermark text size.";

sizePrompt.addAction("Small");
sizePrompt.addAction("Medium (Recommended)");
sizePrompt.addAction("Large");
sizePrompt.addCancelAction("Cancel");

const sizeResult = await sizePrompt.present();

if (sizeResult === -1) {
  Script.complete();
  return;
}

// Fraction of the image's shorter side used as font size.
const sizeMultipliers = [0.016, 0.022, 0.028];
const sizeLabels = ["Small", "Medium", "Large"];

if (sizeResult < 0 || sizeResult >= sizeMultipliers.length) {
  throw new Error("Invalid watermark size selection.");
}

const selectedSize = sizeMultipliers[sizeResult];
const selectedSizeLabel = sizeLabels[sizeResult];


// --------------------------------------------------
// WATERMARK FONT
// --------------------------------------------------

const fontPrompt = new Alert();

fontPrompt.title = "Watermark Font";
fontPrompt.message = "Choose the watermark font style.";

for (const option of FONT_OPTIONS) {
  fontPrompt.addAction(option.label);
}

fontPrompt.addCancelAction("Cancel");

const fontResult = await fontPrompt.presentAlert();

if (fontResult === -1) {
  Script.complete();
  return;
}

const selectedFont = FONT_OPTIONS[fontResult];


// --------------------------------------------------
// SELECT SOURCE FOLDER
// --------------------------------------------------

const root = await DocumentPicker.openFolder();

if (
  !root ||
  !fm.fileExists(root) ||
  !fm.isDirectory(root)
) {
  throw new Error("Invalid folder selected.");
}

const outputRoot = fm.joinPath(root, "Output");

if (!fm.fileExists(outputRoot)) {
  fm.createDirectory(outputRoot, true);
}


// --------------------------------------------------
// GET FILE EXTENSION
// --------------------------------------------------

function getExtension(path) {

  const filename = fm.fileName(path, true);
  const dot = filename.lastIndexOf(".");

  if (dot < 0) return "";

  return filename.substring(dot).toLowerCase();
}


// --------------------------------------------------
// COLLECT IMAGES
// --------------------------------------------------

const imageFiles = [];

function collectImages(directory) {

  const contents = fm.listContents(directory);

  for (const name of contents) {

    const path = fm.joinPath(directory, name);

    if (fm.isDirectory(path)) {

      if (name.toLowerCase() === "output") {
        continue;
      }

      collectImages(path);
      continue;
    }

    if (SUPPORTED_EXTENSIONS.includes(getExtension(path))) {
      imageFiles.push(path);
    }
  }
}

collectImages(root);


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}


// --------------------------------------------------
// CREATE WATERMARKED IMAGE
// --------------------------------------------------

let lastMarkCount = 0;

function createWatermarkedImage(original, isPng) {

  const width = original.size.width;
  const height = original.size.height;
  const shortSide = Math.min(width, height);

  const margin = Math.round(shortSide * 0.03);


  // Grid shape adapts to the image's aspect ratio
  // (4:3 -> 4x3, square -> 3x4, wide -> 5x3).
  const columns = Math.max(
    2,
    Math.round(Math.sqrt(WATERMARK_COUNT * width / height))
  );

  const rows = Math.max(
    2,
    Math.ceil(WATERMARK_COUNT / columns)
  );

  const cellWidth = width / columns;
  const cellHeight = height / rows;


  // Font size, shrunk if the text would not fit a cell.
  const CHAR_WIDTH = selectedFont.charW;

  let fontSize = Math.max(
    10,
    Math.round(shortSide * selectedSize * selectedFont.scale)
  );

  const maxTextWidth = cellWidth * 0.8;

  if (watermark.length * fontSize * CHAR_WIDTH > maxTextWidth) {
    fontSize = Math.max(
      10,
      Math.floor(maxTextWidth / (watermark.length * CHAR_WIDTH))
    );
  }

  const estTextWidth = watermark.length * fontSize * CHAR_WIDTH;

  // Draw box is deliberately wider than the text; text is
  // centered, so a wrong estimate can never clip or wrap it.
  const boxWidth = Math.ceil(estTextWidth * 1.6) + 20;
  const boxHeight = Math.ceil(fontSize * 1.8);

  const shadowOffset = Math.max(1, Math.round(fontSize * 0.05));


  // Drawing context.
  const ctx = new DrawContext();

  ctx.size = new Size(width, height);
  ctx.opaque = !isPng;
  ctx.respectScreenScale = false;

  ctx.drawImageInRect(
    original,
    new Rect(0, 0, width, height)
  );

  ctx.setFont(new Font(selectedFont.name, fontSize));
  ctx.setTextAlignedCenter();

  const lightColor = new Color("#FFFFFF", watermarkOpacity);

  const darkColor = new Color(
    "#000000",
    Math.min(1, watermarkOpacity * SHADOW_STRENGTH)
  );


  // Staggered grid: odd rows are shifted half a cell.
  let count = 0;

  for (let row = 0; row < rows; row++) {

    for (let column = 0; column < columns; column++) {

      const baseX =
        (column + (row % 2 === 0 ? 0.3 : 0.7)) * cellWidth;

      const baseY = (row + 0.5) * cellHeight;

      let cx =
        baseX + randomBetween(-JITTER, JITTER) * cellWidth;

      let cy =
        baseY + randomBetween(-JITTER, JITTER) * cellHeight;

      // Keep the whole text inside the image.
      cx = clamp(
        cx,
        margin + estTextWidth / 2,
        width - margin - estTextWidth / 2
      );

      cy = clamp(
        cy,
        margin + fontSize,
        height - margin - fontSize
      );

      const rectX = cx - boxWidth / 2;
      const rectY = cy - fontSize * 0.8;

      // 1) Dark shadow layer (offset down-right).
      ctx.setTextColor(darkColor);

      ctx.drawTextInRect(
        watermark,
        new Rect(
          rectX + shadowOffset,
          rectY + shadowOffset,
          boxWidth,
          boxHeight
        )
      );

      // 2) Light layer on top.
      ctx.setTextColor(lightColor);

      ctx.drawTextInRect(
        watermark,
        new Rect(rectX, rectY, boxWidth, boxHeight)
      );

      count++;
    }
  }

  lastMarkCount = count;

  return ctx.getImage();
}


// --------------------------------------------------
// PROCESS IMAGES
// --------------------------------------------------

let successful = 0;
let failed = 0;
let skipped = 0;

const errors = [];

for (let i = 0; i < imageFiles.length; i++) {

  const sourcePath = imageFiles[i];
  const filename = fm.fileName(sourcePath, true);

  console.log(
    "[" + (i + 1) + "/" + imageFiles.length +
    "] START: " + filename
  );

  try {

    const relativePath = sourcePath.substring(root.length + 1);

    const destinationPath = fm.joinPath(outputRoot, relativePath);

    const destinationDirectory = destinationPath.substring(
      0,
      destinationPath.lastIndexOf("/")
    );

    if (!fm.fileExists(destinationDirectory)) {
      fm.createDirectory(destinationDirectory, true);
    }

    // Never overwrite existing files.
    if (fm.fileExists(destinationPath)) {
      skipped++;
      console.log("SKIPPED — Already exists");
      continue;
    }

    // Read original image.
    const original = fm.readImage(sourcePath);

    if (!original) {
      throw new Error("Unable to read original image.");
    }

    const originalWidth = original.size.width;
    const originalHeight = original.size.height;

    const extension = getExtension(sourcePath);
    const isPng = extension === ".png";

    // Apply watermark.
    const watermarked = createWatermarkedImage(original, isPng);

    if (!watermarked) {
      throw new Error("Watermark rendering failed.");
    }

    // Verify dimensions.
    if (
      watermarked.size.width !== originalWidth ||
      watermarked.size.height !== originalHeight
    ) {
      throw new Error("Image dimensions changed.");
    }

    // Encode output.
    const outputData = isPng
      ? Data.fromPNG(watermarked)
      : Data.fromJPEG(watermarked, JPEG_QUALITY);

    if (!outputData) {
      throw new Error("Image encoding failed.");
    }

    // Save output.
    fm.write(destinationPath, outputData);

    // Verify saved image.
    if (!fm.fileExists(destinationPath)) {
      throw new Error("Output file was not created.");
    }

    const verification = fm.readImage(destinationPath);

    if (!verification) {
      throw new Error("Saved image cannot be opened.");
    }

    if (
      verification.size.width !== originalWidth ||
      verification.size.height !== originalHeight
    ) {
      throw new Error("Saved image dimensions do not match.");
    }

    successful++;

    console.log(
      "OK — " + originalWidth + " × " + originalHeight +
      " (" + lastMarkCount + " marks)"
    );

  } catch (error) {

    failed++;

    const errorMessage = String(error.message || error);

    errors.push(filename + "\n" + errorMessage);

    console.log("FAILED: " + errorMessage);
  }
}


// --------------------------------------------------
// FINAL REPORT
// --------------------------------------------------

const report = new Alert();

report.title = "Watermarking Finished";

report.message =

  "Watermark: " + watermark + "\n" +

  "Opacity: " + Math.round(watermarkOpacity * 100) + "%\n" +

  "Size: " + selectedSizeLabel + "\n" +

  "Font: " + selectedFont.label + "\n" +

  "Pattern: ~" + WATERMARK_COUNT + " staggered marks\n" +

  "JPEG quality: 95%\n\n" +

  "Files found: " + imageFiles.length + "\n" +

  "Successful: " + successful + "\n" +

  "Skipped: " + skipped + "\n" +

  "Failed: " + failed +

  (errors.length > 0
    ? "\n\nERROR DETAILS:\n\n" + errors.join("\n\n")
    : "") +

  "\n\nSaved inside:\nOutput";

report.addAction("OK");

await report.present();

Script.complete();
