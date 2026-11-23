// ==================================================
// Image Watermark — Version 1
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
// SUPPORTED: JPG, JPEG, PNG
// DEFAULT WATERMARK: MyTreasureHub
// DEFAULT OPACITY: 12%
// DEFAULT SIZE: Medium
// PATTERN: 12 randomized watermark placements
// COLOUR: White
// SHADOW: Off
// JPEG QUALITY: 95%
//
// SAFETY:
// - Uses native Scriptable folder picker.
// - Original images are never modified.
// - Scans subfolders recursively.
// - Skips Output folders.
// - Never overwrites existing output files.
// - Verifies saved images after processing.

// --------------------------------------------------
// SETTINGS
// --------------------------------------------------

const fm = FileManager.local();

const DEFAULT_WATERMARK = "MyTreasureHub";
const DEFAULT_OPACITY = "12";

const WATERMARK_COUNT = 12;
const JPEG_QUALITY = 0.95;

const SUPPORTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png"
];

// --------------------------------------------------
// WATERMARK SETTINGS DIALOG
// --------------------------------------------------

const prompt = new Alert();

prompt.title = "Image Watermark";
prompt.message =
  "Customize your repeated watermark pattern.";

prompt.addTextField(
  "Watermark text",
  DEFAULT_WATERMARK
);

prompt.addTextField(
  "Opacity (1–100%)",
  DEFAULT_OPACITY
);

prompt.addAction("Continue");
prompt.addCancelAction("Cancel");

const promptResult = await prompt.present();

if (promptResult === -1) {
  Script.complete();
  return;
}

const watermark = prompt.textFieldValue(0).trim();
const opacityInput = prompt.textFieldValue(1).trim();

const watermarkOpacity = Number(opacityInput) / 100;

if (!watermark) {
  throw new Error("Watermark text cannot be empty.");
}

if (
  !Number.isFinite(watermarkOpacity) ||
  watermarkOpacity <= 0 ||
  watermarkOpacity > 1
) {
  throw new Error(
    "Invalid opacity. Enter a number between 1 and 100."
  );
}

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

const sizeMultipliers = [
  0.016,  // Small
  0.022,  // Medium
  0.028   // Large
];

const sizeLabels = [
  "Small",
  "Medium",
  "Large"
];

const selectedSize = sizeMultipliers[sizeResult];
const selectedSizeLabel = sizeLabels[sizeResult];

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

    const extension = getExtension(path);

    if (SUPPORTED_EXTENSIONS.includes(extension)) {
      imageFiles.push(path);
    }
  }
}

collectImages(root);

// --------------------------------------------------
// RANDOM NUMBER HELPER
// --------------------------------------------------

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// --------------------------------------------------
// CREATE RANDOMIZED WATERMARK PATTERN
// --------------------------------------------------

function createWatermarkedImage(original) {

  const width = original.size.width;
  const height = original.size.height;

  const shortSide = Math.min(width, height);

  const margin = Math.round(shortSide * 0.025);

  // Three columns across the image.
  const columns = 3;

  // Calculate rows according to watermark count.
  const rows = Math.ceil(WATERMARK_COUNT / columns);

  const cellWidth = width / columns;
  const cellHeight = height / rows;

  // Estimate text width and keep it inside each cell.
const fontSize = Math.max(
  8,
  Math.round(shortSide * selectedSize)
);

const textWidth = Math.min(
  cellWidth - margin * 2,
  Math.ceil(watermark.length * fontSize * 0.75) + 12
);

  const textHeight = Math.ceil(fontSize * 2.2);

  const ctx = new DrawContext();

  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = false;

  // Draw original image.
  ctx.drawImageInRect(
    original,
    new Rect(0, 0, width, height)
  );

  ctx.setFont(Font.systemFont(fontSize));

  ctx.setTextColor(
    new Color("#FFFFFF", watermarkOpacity)
  );

  // Create randomized cell order.
  const cells = [];

  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) {

      cells.push({
        row: row,
        column: column
      });
    }
  }

  // Shuffle positions.
  for (let i = cells.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    const temp = cells[i];
    cells[i] = cells[j];
    cells[j] = temp;
  }

  // Draw watermark in each randomized cell.
  for (let i = 0; i < WATERMARK_COUNT; i++) {

    const cell = cells[i];

    const availableX = Math.max(
      0,
      cellWidth - textWidth - margin * 2
    );

    const availableY = Math.max(
      0,
      cellHeight - textHeight - margin * 2
    );

    // Randomize position inside the cell.
    const x =
      cell.column * cellWidth +
      margin +
      randomBetween(0, availableX);

    const y =
      cell.row * cellHeight +
      margin +
      randomBetween(0, availableY);

    const safeX = Math.max(
      0,
      Math.min(x, width - textWidth)
    );

    const safeY = Math.max(
      0,
      Math.min(y, height - textHeight)
    );

    ctx.drawTextInRect(
      watermark,
      new Rect(
        safeX,
        safeY,
        textWidth,
        textHeight
      )
    );
  }

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

    const relativePath = sourcePath.substring(
      root.length + 1
    );

    const destinationPath = fm.joinPath(
      outputRoot,
      relativePath
    );

    const destinationDirectory =
      destinationPath.substring(
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

    const original = fm.readImage(sourcePath);

    if (!original) {
      throw new Error("Unable to read original image.");
    }

    const originalWidth = original.size.width;
    const originalHeight = original.size.height;

    const watermarked = createWatermarkedImage(original);

    if (!watermarked) {
      throw new Error("Watermark rendering failed.");
    }

    if (
      watermarked.size.width !== originalWidth ||
      watermarked.size.height !== originalHeight
    ) {
      throw new Error("Image dimensions changed.");
    }

    const extension = getExtension(sourcePath);

    let outputData;

    if (extension === ".png") {

      outputData = Data.fromPNG(watermarked);

    } else {

      outputData = Data.fromJPEG(
        watermarked,
        JPEG_QUALITY
      );
    }

    if (!outputData) {
      throw new Error("Image encoding failed.");
    }

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
      "OK — " +
      originalWidth + " × " + originalHeight
    );

  } catch (error) {

    failed++;

    const errorMessage = String(
      error.message || error
    );

    errors.push(
      filename + "\n" + errorMessage
    );

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
  "Opacity: " +
  Math.round(watermarkOpacity * 100) + "%\n" +
  "Size: " + selectedSizeLabel + "\n" +
  "Pattern: " + WATERMARK_COUNT + " randomized marks\n" +
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
