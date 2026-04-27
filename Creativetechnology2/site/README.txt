Digital Materiality — Web Gallery
=================================

This folder is a self-contained static website. To view it:

  1) Open index.html directly in a modern browser (Chrome, Safari, Firefox).
     - On macOS, double-click index.html.
  2) Or run a local server from this folder, e.g.:
       python3 -m http.server 8000
     and open http://localhost:8000/

To publish on the web:
  - Upload the entire `site/` folder to any static host (Netlify drop, Vercel,
    GitHub Pages, S3, etc.). The page is one HTML file plus the videos/ and
    thumbs/ folders.

Folder structure:
  index.html          — The page
  videos/             — All artifact videos + 2 documentation videos
  thumbs/             — Poster frames (used as preview while videos load)

