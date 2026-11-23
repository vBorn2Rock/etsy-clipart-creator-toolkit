// ==================================================
// PNG → 300 DPI (pHYs)
// Version 1 — Base64 splice method
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
// SUPPORTED INPUT
//
// 1. Select multiple PNG files → Share → Run Script
// 2. Select a folder → Share → Run Script
//
// The script asks you to select the source folder.
//
// OUTPUT
//
// <picked folder>/Output/<same relative path>.png
//
// SAFETY
//
// Original PNG files are never modified.
// IDAT image data is preserved byte-for-byte.
// ==================================================

const PPM = 11811; // 300 DPI in pixels per metre
const SIG = [137, 80, 78, 71, 13, 10, 26, 10];

// ==================================================
// CRC32
// ==================================================

const T = [];

for (let n = 0; n < 256; n++) {
  let c = n;

  for (let k = 0; k < 8; k++) {
    c = c & 1
      ? 0xEDB88320 ^ (c >>> 1)
      : c >>> 1;
  }

  T[n] = c >>> 0;
}

function crc32(a) {
  let c = 0xFFFFFFFF;

  for (let i = 0; i < a.length; i++) {
    c = T[(c ^ a[i]) & 255] ^ (c >>> 8);
  }

  return (c ^ 0xFFFFFFFF) >>> 0;
}

const u32 = n => [
  (n >>> 24) & 255,
  (n >>> 16) & 255,
  (n >>> 8) & 255,
  n & 255
];

const rd32 = (a, i) =>
  (
    (a[i] << 24) |
    (a[i + 1] << 16) |
    (a[i + 2] << 8) |
    a[i + 3]
  ) >>> 0;

// ==================================================
// Build PNG pHYs chunk
// ==================================================

function buildPhys() {
  const body = [
    0x70, 0x48, 0x59, 0x73, // pHYs
    ...u32(PPM),
    ...u32(PPM),
    1
  ];

  return [
    ...u32(9),
    ...body,
    ...u32(crc32(body))
  ];
}

// ==================================================
// Base64 helpers
// ==================================================

function fromB64(s) {
  const d = Data.fromBase64String(s);

  if (!d) {
    throw new Error("Could not decode Base64 data.");
  }

  return d;
}

function base64ByteLength(s) {
  const padding = s.endsWith("==")
    ? 2
    : s.endsWith("=")
      ? 1
      : 0;

  return Math.floor(s.length * 3 / 4) - padding;
}

// ==================================================
// PNG conversion
// ==================================================

function convert(b64) {

  // Remove any line breaks or whitespace in Base64.
  if (/\s/.test(b64)) {
    b64 = b64.replace(/\s+/g, "");
  }

  let want = 262143;

  while (true) {

    const chars = Math.min(
      (want / 3) * 4,
      b64.length
    );

    const whole = chars === b64.length;

    const h = fromB64(
      b64.slice(0, chars)
    ).getBytes();

    // PNG signature validation.
    if (
      h.length < 33 ||
      SIG.some((v, i) => h[i] !== v)
    ) {
      throw new Error("Invalid PNG signature.");
    }

    let pos = 8;
    let I = -1;
    let ihdr = null;
    let oldPhys = false;
    let physInserted = false;

    const chunks = [];

    // Scan chunks before the first IDAT.
    while (pos + 8 <= h.length) {

      const len = rd32(h, pos);

      const type = String.fromCharCode(
        h[pos + 4],
        h[pos + 5],
        h[pos + 6],
        h[pos + 7]
      );

      if (!ihdr && type !== "IHDR") {
        throw new Error("First PNG chunk is not IHDR.");
      }

      if (type === "IDAT") {
        I = pos;
        break;
      }

      const end = pos + 12 + len;

      if (end > h.length) {
        break;
      }

      const chunk = h.slice(pos, end);

      if (type === "IHDR") {

        if (ihdr !== null) {
          throw new Error("Duplicate IHDR chunk.");
        }

        ihdr = chunk;

      } else if (type === "pHYs") {

        oldPhys = true;

        // Replace the first existing pHYs chunk
        // at its original position.
        if (!physInserted) {
          chunks.push(buildPhys());
          physInserted = true;
        }

        // Additional pHYs chunks are removed.

      } else {

        // Preserve every other pre-IDAT chunk
        // in its original order.
        chunks.push(chunk);
      }

      pos = end;
    }

    // IDAT not found in the inspected prefix.
    if (I < 0) {

      if (whole) {
        throw new Error("No IDAT chunk found.");
      }

      want *= 4;
      continue;
    }

    // If no old pHYs existed, insert it immediately
    // before the first IDAT chunk.
    if (!physInserted) {
      chunks.push(buildPhys());
      physInserted = true;
    }

    // Rebuild PNG header.
    const head = [
      ...SIG,
      ...ihdr
    ];

    for (const chunk of chunks) {
      for (let i = 0; i < chunk.length; i++) {
        head.push(chunk[i]);
      }
    }

    // Align the rebuilt header to a Base64 boundary.
    // Copy only the necessary original IDAT bytes.
    const k = (3 - (head.length % 3)) % 3;

    if (I + k > h.length) {
      if (whole) {
        throw new Error("Insufficient IDAT alignment bytes.");
      }

      want *= 4;
      continue;
    }

    for (let i = 0; i < k; i++) {
      head.push(h[I + i]);
    }

    if (head.length % 3 !== 0) {
      throw new Error("Base64 alignment error.");
    }

    // Everything after the aligned prefix is reused
    // directly from the original Base64 string.
    const outputB64 =
      Data.fromBytes(head).toBase64String() +
      b64.slice(((I + k) / 3) * 4);

    return {
      b64: outputB64,
      hadPhys: oldPhys
    };
  }
}

// ==================================================
// Folder traversal
// ==================================================

const fm = FileManager.local();

function walk(dir, rel, list) {

  for (const n of fm.listContents(dir)) {

    // Never process the root Output directory.
    if (
      rel === "" &&
      n.toLowerCase() === "output"
    ) {
      continue;
    }

    const p = fm.joinPath(dir, n);

    const r = rel
      ? rel + "/" + n
      : n;

    if (fm.isDirectory(p)) {

      walk(p, r, list);

    } else if (/\.png$/i.test(n)) {

      list.push({
        p: p,
        rel: r,
        name: n
      });
    }
  }
}

// ==================================================
// Alerts
// ==================================================

async function report(title, msg) {

  const a = new Alert();

  a.title = title;
  a.message = msg;

  a.addAction("OK");

  await a.present();
}

// ==================================================
// Selected file names
// ==================================================

function getSelectedPNGNames() {

  const urls = args.fileURLs || [];
  const names = [];

  for (const u of urls) {

    let name = String(u).split("/").pop();

    try {
      name = decodeURIComponent(name);
    } catch (e) {
      // Keep the original name if decoding fails.
    }

    if (/\.png$/i.test(name)) {
      names.push(name);
    }
  }

  return names;
}

// ==================================================
// Main
// ==================================================

async function main() {

  // Ask for the folder to grant write access.
  const root = await DocumentPicker.openFolder();

  if (!root) {
    return report(
      "Cancelled",
      "No source folder was selected."
    );
  }

  // Find PNG files.
  let files = [];

  walk(root, "", files);

  // If PNG files were selected in the Share Sheet,
  // process only those selected PNGs.
  const selectedNames = getSelectedPNGNames();

  if (selectedNames.length > 0) {

    // Count duplicate filenames so selecting one file
    // does not automatically select every same-named file.
    const remaining = new Map();

    for (const name of selectedNames) {
      const key = name.toLowerCase();

      remaining.set(
        key,
        (remaining.get(key) || 0) + 1
      );
    }

    files = files.filter(f => {

      const key = f.name.toLowerCase();
      const count = remaining.get(key) || 0;

      if (count > 0) {
        remaining.set(key, count - 1);
        return true;
      }

      return false;
    });
  }

  if (files.length === 0) {

    return report(
      "Nothing to process",
      "No matching PNG files were found in the selected folder."
    );
  }

  // ==================================================
  // Output folder and log
  // ==================================================

  const outRoot = fm.joinPath(root, "Output");

  if (!fm.fileExists(outRoot)) {
    fm.createDirectory(outRoot, true);
  }

  const logPath = fm.joinPath(outRoot, "_log.txt");

  const log = [];

  function flush() {
    try {
      fm.writeString(
        logPath,
        log.join("\n")
      );
    } catch (e) {
      // Logging must not stop PNG processing.
    }
  }

  let ok = 0;
  let fail = 0;
  let replaced = 0;
  let inserted = 0;

  log.push("PNG 300 DPI — Version 1");
  log.push("Files found: " + files.length);
  log.push("Target resolution: 300 DPI");
  log.push("--------------------------------");

  flush();

  // ==================================================
  // Process files
  // ==================================================

  for (let i = 0; i < files.length; i++) {

    const f = files[i];

    log.push(
      `[${i + 1}/${files.length}] START: ${f.rel}`
    );

    flush();

    try {

      // Create matching output path.
      const dest = fm.joinPath(
        outRoot,
        f.rel
      );

      const parent = dest.substring(
        0,
        dest.lastIndexOf("/")
      );

      if (!fm.fileExists(parent)) {
        fm.createDirectory(parent, true);
      }

      // Read original PNG and convert to Base64.
      let b64 = fm.read(f.p).toBase64String();

      // Add or replace pHYs metadata.
      let result = convert(b64);

      // Release original Base64 reference.
      b64 = null;

      const outputB64 = result.b64;
      const hadPhys = result.hadPhys;

      const expectedSize = base64ByteLength(outputB64);

      result = null;

      // Convert output Base64 back to Scriptable Data.
      let outputData = fromB64(outputB64);

      // Write output without modifying original.
      fm.write(dest, outputData);

      outputData = null;

      // Release output Base64 reference.
      // The file has already been written.
      const expected = expectedSize;


      // Verify file existence and size.
      // Scriptable reports fileSize in KB, not bytes.
      if (!fm.fileExists(dest)) {
      throw new Error("Output file was not created.");
}

      const actualSize = fm.fileSize(dest);
      const expectedSizeKB = Math.floor(expected / 1024);

      if (actualSize !== expectedSizeKB) {
      throw new Error(
      "File size mismatch. Expected approximately " +
      expectedSizeKB +
      " KB, received " +
      actualSize +
      " KB"
  );
}


      if (hadPhys) {
        replaced++;
      } else {
        inserted++;
      }

      log.push(
        `    OK — ${actualSize} bytes — ` +
        (hadPhys ? "pHYs replaced" : "pHYs inserted")
      );

      ok++;

    } catch (e) {

      log.push(
        "    FAILED: " +
        String(e.message || e)
      );

      fail++;
    }

    flush();
  }

  // ==================================================
  // Final report
  // ==================================================

  log.push("--------------------------------");
  log.push("FINISHED");
  log.push("Successful: " + ok);
  log.push("Failed: " + fail);
  log.push("Existing pHYs replaced: " + replaced);
  log.push("New pHYs inserted: " + inserted);
  log.push("Output: " + outRoot);

  flush();

  await report(
    "300 DPI processing complete",
    "Successful: " + ok +
    "\nFailed: " + fail +
    "\n\nExisting metadata replaced: " + replaced +
    "\nNew metadata inserted: " + inserted +
    "\n\nOutput folder:\n" + outRoot +
    "\n\nSee Output/_log.txt for details."
  );
}

// ==================================================
// Run
// ==================================================

try {

  await main();

} catch (e) {

  await report(
    "Script Error",
    String(e.message || e)
  );
}

Script.complete();
