# dev/ — testing helpers (not part of the template students use)

Little scripts for verifying the sketch tools in a real browser without clicking by hand.
Not needed to run or teach the project — safe to ignore (or delete) if you don't want them.

## Safari probes (macOS)

Both need:
1. The dev server running from the project root: `python3 -m http.server 8000`
2. Safari ▸ Develop ▸ **Allow JavaScript from Apple Events** (turn it back off when done).

| Script | What it does |
| --- | --- |
| `safari-probe-state.applescript` | Prints a JSON snapshot: which functions exist, the HUD element, `hudVisible`, and whether the click guard tells HUD clicks from canvas clicks. |
| `safari-probe-clicks.applescript` | Fires real click events at the HUD and the canvas and reports the outcome (HUD should stay on a HUD click, dismiss on a canvas click). |

Run with: `osascript dev/safari-probe-state.applescript`

Healthy output from the clicks probe:
```
{"startVis":true,"afterHudClick_vis":true,"afterCanvasClick_vis":false,"log":["DIV","CANVAS"],"points":1}
```
