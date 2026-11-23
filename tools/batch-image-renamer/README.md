📁 Batch Image Renamer

A powerful batch image renaming utility for iPhone and iPad, powered by [Scriptable](https://scriptable.app/).

Rename hundreds of images in seconds using your own project name and starting number. Organize your Etsy clipart collections with consistent, professional filenames.

⸻

✨ Features

* 📦 Batch Renaming: Rename multiple images in a single operation.
* 🏷️ Custom Project Names: Use your own project name for image filenames.
* 🔢 Custom Numbering: Choose your preferred starting number.
* 🔤 Automatic Naming: Generates clean, lowercase, SEO-friendly filename slugs.
* 🖼️ Multiple Image Formats: Supports 13 common image extensions.
* 🔠 Extension Preservation: Retains each image’s original file extension and casing.
* 📂 Folder Selection: Select the folder containing your images.
* 🔍 Natural Sorting: Sorts filenames naturally before renaming.
* 🛡️ No Overwriting: Checks destination filenames before making changes.
* ↩️ Rollback Protection: Attempts to restore previously renamed files if an operation fails.
* ✅ Final Verification: Checks renamed files after processing.

⸻

🖼️ Supported Image Formats

The utility supports the following image extensions:

1. PNG	.png
2. JPEG	.jpg, .jpeg
3. WebP	.webp
4. GIF	.gif
5. HEIC	.heic
6. HEIF	.heif
7. TIFF	.tif, .tiff
8. BMP	.bmp
9. SVG	.svg
10. AVIF	.avif
11. ICO	.ico

Total: 13 supported extensions.

⸻

🔢 Filename Structure

The utility creates filenames using this structure: 001_project-name.png

For example, suppose your project name is: Premium Christmas Clipart

And your starting number is: 001

The generated filenames will look like this:

* 001_premium-christmas-clipart.png
* 002_premium-christmas-clipart.png
* 003_premium-christmas-clipart.jpg
* 004_premium-christmas-clipart.webp
* 005_premium-christmas-clipart.png

🏷️ Automatic Filename Formatting

The script automatically:

* Converts project names to lowercase.
* Removes unnecessary special characters.
* Replaces spaces with hyphens.
* Removes leading and trailing hyphens.
* Preserves the original file extensions.

⸻

📱 Requirements

* iPhone or iPad
* Scriptable installed
* Image files in a supported format
* Access to the Files app and selected folder

⸻

🚀 Installation

1. Install Scriptable

Download and install Scriptable from the App Store.

2. Add the Script

1. Download Batch-Image-Renamer.js from this repository.
2. Open the JavaScript file in Scriptable.
3. Add it to your Scriptable library.
4. Rename it to Batch Image Renamer if necessary.

3. Configure Script Settings

Open the script’s settings in Scriptable and configure:

* Script Name: Batch Image Renamer
* Always Run in App: ❌ OFF
* Share Sheet Input: ✅ ON

⸻

📖 How to Use

Step 1 — Run the Script

Open Scriptable and run Batch Image Renamer.

Step 2 — Select Your Folder

Choose the folder containing the images you want to rename.

Step 3 — Enter Project Details

A dialog will ask for two details:

* Project Name: Enter your desired project name.
* Starting Number: Enter the first number in your sequence.

Step 4 — Review the Renaming Structure

Before renaming, the script displays a confirmation showing:

* Project name
* Starting number
* Ending number
* Total images found
* Number of files to rename
* First and last generated filenames

Step 5 — Confirm Renaming

Tap Rename All Images to begin.

The script renames the images directly inside the selected folder.

⸻

🛡️ Safety & File Protection

Your original image data is never modified.

The script includes several safeguards:

* Only processes supported image files directly inside the selected folder.
* Does not scan nested folders.
* Preserves original file extensions.
* Never intentionally overwrites existing destination files.
* Checks for duplicate destination filenames before renaming.
* Verifies each rename operation.
* Attempts rollback if an operation fails.
* Provides a final verification report.

Important: Renaming changes filenames only. It does not resize, compress, convert, or edit image contents.

⸻

📂 Folder Processing Rules

Folder Content	Behaviour
Supported image files	Renamed
Unsupported files	Ignored
Subfolders	Ignored
Existing destination filenames	Operation aborted before renaming
Already correctly named images	Left unchanged

The script processes only the files directly inside the selected folder.

⸻

⚠️ Important Notes

* Always review the confirmation dialog before starting.
* Keep a backup of important files before batch renaming.
* The script does not modify image metadata or image contents.
* Starting numbers are formatted with at least three digits. Numbers above 999 retain their full length.
* If a renaming operation fails, the script attempts to restore files already renamed. Check the error report if rollback problems occur.
* File types are identified by their extensions; the script does not inspect image contents.

⸻

🧰 Part of the Etsy A-Z Clipart Creator Toolkit

A collection of practical tools and resources designed to help Etsy sellers and digital product creators:

* 🎨 Create digital clipart.
* 🖼️ Prepare images for digital products.
* 📦 Organize image collections.
* 🔐 Protect listing images.
* 🛍️ Prepare and publish Etsy listings.

⸻

📄 License

See the repository’s root LICENSE file for licensing information.
