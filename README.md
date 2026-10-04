# Insta2PDF

## Overview

Insta2PDF is a Manifest V3 browser extension for Chrome and Edge that saves any
public Instagram image carousel as a PDF — directly in the browser, with no
server, no Python, and no command line.

Click the extension on any carousel post. It rewinds to slide 1 automatically
(so deep-linked URLs like `?img_index=16` never produce a partial PDF), clicks
through every slide to collect the full-resolution images, builds the PDF in
memory, and hands it to your browser's Save As dialog. The whole process takes a
few seconds and leaves nothing running in the background.

Not for: video reels, Stories, or private accounts. It works on publicly visible
image carousels only.

## Demo

<!-- Record a GIF using ScreenToGif or ShareX, save it as demo.gif in the repo root, then this will autoplay on GitHub -->
![Insta2PDF Demo](demo.gif)

## Requirements

| Requirement | Version | Notes |
|---|---|---|
| Chrome or Edge | Any current release | Manifest V3 support required |
| Developer Mode | Enabled in the extensions page | Required for unpacked install |

No Node, Python, or build step. The extension is plain JavaScript and runs
entirely in the browser.

## Installation

1. Download or extract the project so the `extension` folder is on disk.

2. Open the extensions page in your browser.

   ```
   chrome://extensions/
   ```
   ```
   edge://extensions/
   ```

3. Enable **Developer mode** (toggle in the top-right corner).

4. Click **Load unpacked** and select the `extension` folder.

5. Pin the extension to the toolbar for quick access.

If you have an older version installed, disable or remove it before loading this
one — two versions loaded at the same time will conflict.

## Usage

1. Open any public Instagram post that contains multiple images (a carousel).

2. Click the **Insta2PDF** button in the toolbar.

3. Click **Convert current post to PDF** in the popup.

   Insta2PDF rewinds the carousel to slide 1, steps through every slide,
   downloads each image, assembles them into a single PDF, and opens a Save As
   dialog.

   ```
   Found 8 slide(s). Creating PDF…
   Done — 8 slides saved.
   ```

4. Choose a save location. The file is named after the post's shortcode (e.g.
   `C1aBcDeFgHi.pdf`).

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Open the Instagram carousel first." | The active tab is not on instagram.com | Navigate to the post, then click the extension |
| "No slides found." | Page not fully loaded, or unrecognised carousel layout | Scroll the post into view, wait for images to load, then retry |
| "Could not download slide N (403)." | CDN URL expired between collection and download | Click Convert again immediately after opening the post |
| PDF starts at a slide other than slide 1 | `?img_index=N` deep link and rewind didn't complete | Reload the page and retry |

## Contributing

Contributions are welcome from everyone! Whether it's a bug fix, new feature, improved docs, or a suggestion — feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit and push (`git commit -m "Add your feature"` then `git push`)
5. Open a Pull Request

No formal requirements — just keep the extension working in Manifest V3 and test your changes in Chrome or Edge before submitting.

## License

MIT — see [LICENSE](LICENSE).
