# CLAUDE.md — p5.js Sketch Tools

Guidance for anyone (human or AI) working on this project. Read this first.

## What this is
A p5.js starter template for **intro CS students**. The star is `sketchTools.js`: students
click the canvas and get copy-pasteable p5 code (line / triangle / beginShape / curve,
etc.) printed to the browser dev console, plus a floating HUD with fill/stroke/weight
controls. `gradient.js` has gradient helpers. `sketch.js` is the student's own file — the
"front door."

## Hard rules
- **No build tooling. Ever.** Plain static files + `<script>` tags — no npm, bundler,
  modules, or transpile step. This is exactly why the same files run on **CodeHS today**
  and a **self-hosted classroom static server later** with zero changes. Never add a
  dependency that needs a build.
- **p5-first, not raw JavaScript.** We teach p5 *because* it shields beginners from
  verbose JS. Use p5 idioms (`mouseClicked`, `keyPressed`, `mouseX`, `createColorPicker`…).
  Do **not** re-implement subsystems in raw DOM. Reach past p5 only at tiny, clearly
  commented "seams" when genuinely necessary (e.g. one `document.activeElement` or
  `event.target` check) and label them as such.

## Architecture
- `sketch.js` — the **front door** students edit. Holds the p5 callbacks, which delegate
  to the engine room. The wiring *is* the lesson (functions calling functions).
- `sketchTools.js` — the **engine room**. Public API:
  - `enableSketchTools(mode)` — setup; turn the kit on + build the HUD. `"lines" | "curves" | "dots"`
  - `displayWelcomeText()` — setup; prints the console greeting.
  - `sketchToolsClicked(event)` — from p5 `mouseClicked(event)`.
  - `sketchToolsKey()` — from p5 `keyPressed`. Keys: `c` line/curve · Backspace undo · `x` clear · `a` arrays · `h` HUD.
  - `drawSketchTools()` — from p5 `draw()`, kept last.
  - All of these **no-op safely when the kit is disabled**, so a submitted sketch with
    `enableSketchTools` commented out never throws.
- `gradient.js` — gradient helpers over a shared `getColor()` lerp. Leave alone unless asked.

## Deliberate design choices — do NOT "fix" these
- **The canvas never clears** (no `background()`/`clear()`). Dots + preview **smear on
  purpose**: it previews why animation needs a background and nudges students to pick
  their own. They add `background()` when ready.
- **Output goes to the dev console on purpose.** It forces students to open dev tools,
  where p5's real errors live (CodeHS hides them). The greeting literally says "RTFE:
  Read the ___ Errors." Don't move output off the console.
- **HUD = DOM widgets floating over the canvas**, shown by default (so it's obvious the
  tools are on → disable before submitting), hides on first canvas click, toggles with
  `h`. Clicks on the HUD are guarded so they don't drop points.
- **Named colors → variables**: picked colors become `let myName = "#hex"; fill(myName);`
  — variables taught through something students actually want.

## Voice & tone (match this in comments and HUD text)
Casual, wry, a sly wink for the sharp kid — but crystal-clear for beginners. The engine
room is written "for aspiring superusers." Live examples in the code:
- "RTFE: Read the ___ Errors. You'll find them here."
- "welcome to the engine room, mind the grease. (Claude was my editor.)"
- "bold choice, Picasso." / "Same name for both? Maybe you want noStroke()."
- License footer: "stop electing lawyers… start electing makers."

Keep that energy. Do not sand it into corporate-doc voice.

## Code style (for student-readable files)
Beginner-friendly JS: indexed `for` loops, `if/else`, `+` string concatenation, `let`,
`===`, descriptive names (`clickedPoints`, never `px`). Avoid `.map` / arrow functions /
spread in code a student might read (deep string-plumbing like `sanitizeName` is the
allowed exception). Frame functions as **THE core CS skill** — lean into it.

## How to verify changes
- **Syntax, no browser:** macOS ships JavaScriptCore. Parse a file without running it via
  `osascript -l JavaScript` + `new Function(src)` (see git history for the one-liner).
- **Real browser behavior:** start the server, then run the probes in `dev/`:
  ```
  python3 -m http.server 8000
  osascript dev/safari-probe-state.applescript     # functions/HUD/guard snapshot
  osascript dev/safari-probe-clicks.applescript    # HUD vs canvas click test
  ```
  Requires Safari ▸ Develop ▸ "Allow JavaScript from Apple Events" ON. Turn it back OFF
  after — keep standing browser access to a minimum.

## Notes for AI collaborators
- Beginner readability and pedagogy beat cleverness, every time.
- The author wants to be **pushed back on** — red-team the plan, "well, actually" the weak
  spots, don't rubber-stamp. But don't over-engineer; say so when a fancier approach isn't
  worth it. Humor is welcome.
- Commit at milestones with clear messages. Only add a `Co-Authored-By: Claude` trailer to
  commits whose content you actually wrote (not the author's own code or boilerplate).

## Roadmap
GitHub push · `gradient.js` license header + direction-vocabulary polish · rect/ellipse
interactive tool · `style.css` · August self-hosting.
