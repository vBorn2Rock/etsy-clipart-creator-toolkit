🛡️ Professional Image Watermarker

Part of the Etsy A-Z Clipart Creator Toolkit

A batch image watermarking utility for Etsy sellers and digital creators. Add a subtle, repeated watermark to JPG, JPEG, and PNG images using Scriptable on iPhone or iPad.

The script places 12 randomized watermark marks across each image, helping creators protect their product previews while keeping the original files untouched.

⸻

✨ Features

* 12 randomized placements — Repeated watermark text distributed across a 3 × 4 grid.
* Custom watermark text — Use your own shop or brand name.
* Adjustable opacity — Choose any value from 1% to 100%.
* Three text sizes — Small, Medium, and Large.
* White watermark — Clean white text with no shadow.
* Batch processing — Process multiple images in one run.
* Recursive scanning — Automatically searches selected folders and their subfolders.
* Original file protection — Never modifies source images.
* Duplicate protection — Skips output files that already exist.
* Image verification — Checks that saved images can be opened and retain their original dimensions.

⚙️ Default Settings

* Watermark text: MyTreasureHub
* Opacity: 12%
* Text size: Medium
* Watermark placements: 12
* Watermark colour: White
* Text shadow: Off
* JPEG quality: 95%

📁 Supported Formats

* .jpg
* .jpeg
* .png

PNG images are saved as PNG. JPG and JPEG images are saved as JPEG at 95% quality.

📲 Requirements

* iPhone or iPad
* Scriptable app
* Access to the folder containing your images

🚀 Installation

1. Install Scriptable from the App Store.
2. Open Scriptable.
3. Create a new script.
4. Name it Image Watermark.
5. Copy the complete Image-Watermarker.js code into the editor.
6. Save the script.

🔧 Scriptable Settings

This utility uses Scriptable’s native folder picker.

Setting	Configuration
Run in App	ON
Show in Share Sheet	OFF

No Share Sheet input is required.

📝 How to Use

1. Open Scriptable.
2. Run Image Watermark.
3. Enter your watermark text.
4. Enter the desired opacity between 1 and 100.
5. Select Small, Medium, or Large.
6. Choose the source folder containing your images.
7. Wait for batch processing to finish.
8. Review the final processing report.

🎨 Watermark Pattern

The script creates a 3-column × 4-row layout containing 12 watermark positions.

Each position is shuffled, and the watermark is placed at a randomized location within its assigned cell.

This creates a repeated pattern rather than placing one large watermark in the centre of the image.

📂 Output Structure

Watermarked images are saved inside an Output folder in the selected source folder.

The original folder structure is preserved.

Example:

* My Clipart Collection:
1. image-01.png
2. image-02.jpg

* Output:
1. image-01.png
2. image-02.jpg

The script skips folders named Output during scanning, preventing previously generated output images from being processed again.

🔒 Safety

* Original images are never modified.
* Existing output files are never overwritten.
* Source subfolders are scanned recursively.
* Output folders are excluded from scanning.
* Saved images are checked for readability.
* Original image dimensions are verified after saving.

🧰 Part of the Toolkit

This utility is part of the Etsy A-Z Clipart Creator Toolkit, a collection of practical tools for Etsy digital product creators.

Explore the complete project:

* [Project Repository](https://github.com/vBorn2Rock/etsy-clipart-creator-toolkit)
* [GitHub Profile](https://github.com/vBorn2Rock/)

📌 Disclaimer

This is an independent community project. It is not affiliated with, endorsed by, or officially connected to Etsy or Scriptable.

Always review your watermarked images before publishing them in your shop.
