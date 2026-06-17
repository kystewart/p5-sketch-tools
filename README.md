# p5 Sketch Tools 🎨

A tiny, **no-build** p5.js toolkit for intro CS students. Click the canvas to trace shapes
and get copy-pasteable p5 code in the browser console, with a floating HUD for fill/stroke
colors and stroke weight. Built for the classroom — works on CodeHS today and any static
server later, with zero build step.

### ▶ [Try it live](https://kystewart.github.io/p5-sketch-tools/)
🔗 Repo: https://github.com/kystewart/p5-sketch-tools

## What's here
- **`sketchTools.js`** — the toolkit (the "engine room"). Copy it into any p5 sketch.
- **`sketch.js`** — the student's sketch (the "front door"); calls the tools.
- **`gradient.js`** — gradient drawing helpers.
- **`index.html`** — loads p5 + the scripts (CodeHS forces its own minimal version).
- **`docs/logo-assignment.md`** — a ready starter assignment, *"You, per p5.js."*
- **`CLAUDE.md`** — conventions, voice, accessibility notes, and how to test.
- **`dev/`** — Safari probe scripts for browser-testing.

## Use it
1. Serve the folder on a static server (`python3 -m http.server 8000`) and open it — or
   paste the files into a CodeHS web project.
2. Open your browser's developer console.
3. Click the canvas to drop points; copy the code it prints into your `draw()`.
4. Press `h` to show/hide the HUD. Comment out `enableSketchTools(...)` before you submit.

Runtime: **p5 1.11.x** (CodeHS's version).

## License
MIT — free for anyone. If you like it and use it, please buy me a coffee (or a Ferrari, if
your budget allows): https://buymeacoffee.com/kystewart · see [LICENSE](LICENSE).

Built by Kyle Stewart, with Claude as editor.
