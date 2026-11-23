// ==================================================
// Batch Image Renamer — Version 1
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
// WORKFLOW:
// Run Script → Select Folder → Enter Project Name
// → Enter Starting Number → Confirm
//
// SUPPORTED FORMATS:
// PNG, JPG, JPEG, WEBP, GIF, HEIC, HEIF,
// TIF, TIFF, BMP, SVG, AVIF, ICO
//
// SAFETY:
// - Only images directly inside selected folder.
// - Never scans nested folders.
// - Original extensions are preserved.
// - Original image data is never modified.
// - Never overwrites existing files.
// - Checks all destination names before renaming.
// - Attempts rollback if an operation fails.

// --------------------------------------------------
// 1. INITIALIZE
// --------------------------------------------------

const fm = FileManager.local();

// --------------------------------------------------
// 2. SUPPORTED IMAGE EXTENSIONS
// --------------------------------------------------

const imageExtensions = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
  ".tif",
  ".tiff",
  ".bmp",
  ".svg",
  ".avif",
  ".ico"
]);

// --------------------------------------------------
// 3. SELECT FOLDER
// --------------------------------------------------

let folderPath;

try {
  folderPath = await DocumentPicker.openFolder();
} catch (error) {
  throw new Error(
    "Folder selection failed or was cancelled."
  );
}

if (!folderPath) {
  throw new Error("No folder selected.");
}

if (!fm.fileExists(folderPath)) {
  throw new Error(
    "Scriptable cannot access the selected folder."
  );
}

if (!fm.isDirectory(folderPath)) {
  throw new Error("Selected location is not a folder.");
}

// --------------------------------------------------
// 4. GET PROJECT NAME AND STARTING NUMBER
// --------------------------------------------------

const input = new Alert();

input.title = "Images Batch Renamer";

input.message =
  "Enter your project name and starting number.";

input.addTextField(
  "Project name",
  ""
);

input.addTextField(
  "Starting number",
  "001"
);

input.addAction("Continue");
input.addCancelAction("Cancel");

const inputResult = await input.presentAlert();

if (inputResult === -1) {
  throw new Error("Operation cancelled.");
}

const projectName = input.textFieldValue(0).trim();

const startingText =
  input.textFieldValue(1).trim() || "001";

if (!projectName) {
  throw new Error("Project name is required.");
}

if (!/^\d+$/.test(startingText)) {
  throw new Error(
    "Starting number must contain digits only."
  );
}

const startingNumber = Number(startingText);

if (
  !Number.isSafeInteger(startingNumber) ||
  startingNumber < 0
) {
  throw new Error("Invalid starting number.");
}

// --------------------------------------------------
// 5. GENERATE PROJECT SLUG
// --------------------------------------------------

function createSlug(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const slug = createSlug(projectName);

if (!slug) {
  throw new Error("Invalid project name.");
}

// --------------------------------------------------
// 6. SCAN ONLY SELECTED FOLDER
// --------------------------------------------------

let contents;

try {
  contents = fm.listContents(folderPath);
} catch (error) {
  throw new Error(
    "Cannot read selected folder: " + error.message
  );
}

const imageFiles = contents
  .filter(name => {
    const path = fm.joinPath(folderPath, name);

    if (
      !fm.fileExists(path) ||
      fm.isDirectory(path)
    ) {
      return false;
    }

    const dotIndex = name.lastIndexOf(".");

    if (dotIndex < 0) {
      return false;
    }

    const extension = name
      .substring(dotIndex)
      .toLowerCase();

    return imageExtensions.has(extension);
  })
  .sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );

if (imageFiles.length === 0) {
  throw new Error(
    "No supported image files found."
  );
}

// --------------------------------------------------
// 7. PREPARE RENAMING PLAN
// --------------------------------------------------

if (
  !Number.isSafeInteger(
    startingNumber + imageFiles.length - 1
  )
) {
  throw new Error("Numbering range is too large.");
}

const renameList = imageFiles.map((oldName, index) => {

  const number = String(
    startingNumber + index
  ).padStart(3, "0");

  // Preserve the complete original extension.
  const extension = oldName.substring(
    oldName.lastIndexOf(".")
  );

  const newName = `${number}_${slug}${extension}`;

  return {
    oldName,
    newName,
    oldPath: fm.joinPath(folderPath, oldName),
    newPath: fm.joinPath(folderPath, newName)
  };
});

// --------------------------------------------------
// 8. SEPARATE FILES THAT NEED RENAMING
// --------------------------------------------------

const changes = renameList.filter(
  item => item.oldPath !== item.newPath
);

if (changes.length === 0) {

  const done = new Alert();

  done.title = "Already Renamed";

  done.message =
    "All supported images already have the requested filenames.";

  done.addAction("OK");

  await done.presentAlert();

  Script.complete();
}

// --------------------------------------------------
// 9. CHECK DUPLICATE DESTINATION NAMES
// --------------------------------------------------

const destinationNames = renameList.map(
  item => item.newName.toLowerCase()
);

if (
  new Set(destinationNames).size !==
  destinationNames.length
) {
  throw new Error(
    "Duplicate destination filenames detected. Nothing changed."
  );
}

// --------------------------------------------------
// 10. CHECK EXISTING FILES — NEVER OVERWRITE
// --------------------------------------------------

const conflicts = changes.filter(
  item => fm.fileExists(item.newPath)
);

if (conflicts.length > 0) {

  const conflictList = conflicts
    .slice(0, 8)
    .map(item => item.newName)
    .join("\n");

  const error = new Alert();

  error.title = "Renaming Aborted";

  error.message =
    `${conflicts.length} destination files already exist.\n\n` +
    `${conflictList}\n\n` +
    "No files have been renamed.";

  error.addAction("OK");

  await error.presentAlert();

  Script.complete();
}

// --------------------------------------------------
// 11. CONFIRM OPERATION
// --------------------------------------------------

const firstNumber = String(
  startingNumber
).padStart(3, "0");

const lastNumber = String(
  startingNumber + imageFiles.length - 1
).padStart(3, "0");

const confirm = new Alert();

confirm.title = "Confirm Image Renaming";

confirm.message =
  `Project: ${slug}\n\n` +
  `Starting number: ${firstNumber}\n` +
  `Ending number: ${lastNumber}\n` +
  `Total images: ${imageFiles.length}\n` +
  `Files to rename: ${changes.length}\n\n` +
  `First file:\n${renameList[0].newName}\n\n` +
  `Last file:\n${renameList[renameList.length - 1].newName}\n\n` +
  "Original extensions will be preserved. Image contents and nested folders will remain untouched.";

confirm.addAction("Rename All Images");
confirm.addCancelAction("Cancel");

const confirmed = await confirm.presentAlert();

if (confirmed === -1) {
  throw new Error("Renaming cancelled.");
}

// --------------------------------------------------
// 12. RENAME IMAGES
// --------------------------------------------------

const renamed = [];

try {

  for (const item of changes) {

    // Never overwrite an existing destination.
    if (fm.fileExists(item.newPath)) {
      throw new Error(
        `Destination already exists: ${item.newName}`
      );
    }

    fm.move(item.oldPath, item.newPath);

    // Verify rename.
    if (
      !fm.fileExists(item.newPath) ||
      fm.fileExists(item.oldPath)
    ) {
      throw new Error(
        `Rename verification failed: ${item.newName}`
      );
    }

    renamed.push(item);
  }

} catch (error) {

  // ------------------------------------------------
  // 13. ROLLBACK
  // ------------------------------------------------

  const failedAfterCount = renamed.length;
  const rollbackErrors = [];

  for (
    const item of [...renamed].reverse()
  ) {

    try {

      if (fm.fileExists(item.oldPath)) {
        rollbackErrors.push(item.oldName);
        continue;
      }

      if (!fm.fileExists(item.newPath)) {
        rollbackErrors.push(item.oldName);
        continue;
      }

      fm.move(item.newPath, item.oldPath);

      if (
        !fm.fileExists(item.oldPath) ||
        fm.fileExists(item.newPath)
      ) {
        rollbackErrors.push(item.oldName);
      }

    } catch (rollbackError) {

      rollbackErrors.push(
        `${item.oldName}: ${rollbackError.message}`
      );
    }
  }

  const failure = new Alert();

  failure.title = "Renaming Error";

  failure.message =
    `Error:\n${error.message}\n\n` +
    `Successfully renamed before error: ${failedAfterCount}\n` +
    `Rollback problems: ${rollbackErrors.length}\n\n` +
    (
      rollbackErrors.length === 0
        ? "All previously renamed files were restored."
        : "Files requiring attention:\n" +
          rollbackErrors.join("\n")
    );

  failure.addAction("OK");

  await failure.presentAlert();

  Script.complete();
}

// --------------------------------------------------
// 14. FINAL VERIFICATION
// --------------------------------------------------

const missing = renameList.filter(
  item => !fm.fileExists(item.newPath)
);

const success = new Alert();

success.title =
  missing.length === 0
    ? "Renaming Completed!"
    : "Verification Warning";

success.message =
  `Images processed: ${imageFiles.length}\n` +
  `Images renamed: ${renamed.length}\n` +
  `Starting number: ${firstNumber}\n` +
  `Ending number: ${lastNumber}\n\n` +
  `Image contents: Not modified\n` +
  `Original extensions: Preserved\n` +
  `Nested folders: Not accessed\n` +
  `Overwrites: None\n\n` +
  (
    missing.length === 0
      ? "All filenames verified successfully."
      : `Files requiring inspection: ${missing.length}`
  );

success.addAction("Done");

await success.presentAlert();

Script.complete();
