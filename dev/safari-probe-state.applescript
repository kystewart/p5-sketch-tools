-- safari-probe-state.applescript
-- Loads the sketch in Safari and prints a JSON snapshot of sketch-tool state:
-- which functions exist, the HUD element + hudVisible, and whether the click guard
-- correctly distinguishes a HUD click from a canvas click.
--
-- Requires:
--   1. dev server running:  python3 -m http.server 8000   (from the project dir)
--   2. Safari > Develop > "Allow JavaScript from Apple Events"  (enabled)
--
-- Run:  osascript dev/safari-probe-state.applescript

tell application "Safari"
	activate
	if (count of documents) = 0 then
		make new document with properties {URL:"http://localhost:8000"}
	else
		set URL of front document to "http://localhost:8000"
	end if
end tell
delay 3
tell application "Safari"
	do JavaScript "var o={};o.fn=typeof sketchToolsClicked;o.guard=typeof clickLandedOnHud;o.hud=(typeof hud!=='undefined'&&!!hud);o.hudElt=(typeof hud!=='undefined'&&hud&&hud.elt)?hud.elt.tagName:null;o.vis=(typeof hudVisible!=='undefined')?hudVisible:null;o.canvases=document.querySelectorAll('canvas').length;try{o.gHud=clickLandedOnHud({target:hud.elt});o.gCanvas=clickLandedOnHud({target:document.querySelector('canvas')});}catch(e){o.err=String(e);}JSON.stringify(o);" in front document
end tell