🖼️ PNG 300 DPI Converter

A lossless PNG metadata utility for iPhone and iPad using Scriptable.

Set your PNG images to 300 DPI without resizing, recompressing, or changing the original image pixels.

⸻

✨ Features

* 🎯 300 DPI Resolution: Updates PNG resolution metadata to 300 DPI.
* 🔒 Lossless Processing: Does not decode or recompress image pixels.
* 📦 Batch Processing: Processes multiple PNG files in one run.
* 📁 Folder Support: Supports selected folders and nested folders.
* 🛡️ Original Files Protected: Saves processed images separately in an Output folder.
* 🔄 Metadata Replacement: Replaces existing PNG resolution metadata when necessary.
* 📝 Processing Log: Creates a log file showing processing results.

⸻

⚙️ Technical Details

PNG files store resolution information through the pHYs metadata chunk.

This script sets the following values:

* Horizontal Resolution	11,811 pixels/metre
* Vertical Resolution	11,811 pixels/metre
* Target Resolution	300 DPI

The script uses a Base64 splice method to update PNG metadata. It preserves the existing image data rather than decoding and re-encoding the image.

⸻

📱 Requirements

* iPhone or iPad
* Scriptable app
* PNG image files

⸻

🚀 Installation

1. Install Scriptable

Download and install [Scriptable](https://apps.apple.com/app/scriptable/id1405459188) from the App Store.

2. Download the Script

1. Open the PNG-300-DPI.js file in this repository.
2. Copy the complete JavaScript code.
3. Open Scriptable.
4. Create a new script.
5. Paste the copied code.
6. Save it as PNG 300 DPI Converter.

3. Configure Script Settings

* Script Name:	PNG 300 DPI Converter
* Always Run in App: OFF
* Share Sheet Inputs: ✅ Images | ✅ File URLs

Note: Scriptable settings and available options may vary by app version. The script uses its native folder and file picker, so grant access when iPadOS or iOS asks for it.

⸻

📖 How to Use

1. Open Scriptable.
2. Run PNG 300 DPI Converter.
3. Select the folder or PNG files you want to process.
4. Allow the script to access the selected files.
5. Wait for processing to finish.
6. Open the generated Output folder to access your processed images.

Your original files remain unchanged.

⸻

📂 Output

The script creates an Output folder containing the processed PNG files.

A processing log named _log.txt is also generated to help you review the results.

⸻

⚠️ Important Notes

* This utility changes PNG resolution metadata only.
* It does not increase image dimensions or add image detail.
* It does not convert JPG, JPEG, or other image formats.
* Setting an image to 300 DPI does not automatically make it suitable for every print requirement. Pixel dimensions still matter.
* Keep a backup of important files before processing.

⸻

🧰 Part of the Etsy A-Z Clipart Creator Toolkit

A collection of practical tools and resources designed to help digital product creators and Etsy sellers create, prepare, organize, and publish their products.

⸻

📄 License

See the repository’s root LICENSE file for licensing information.
