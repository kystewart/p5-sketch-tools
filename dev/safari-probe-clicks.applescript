-- safari-probe-clicks.applescript
-- End-to-end click test: fires real click events at the HUD and at the canvas,
-- then reports whether the HUD correctly stayed (HUD click) and dismissed (canvas
-- click), which event targets p5 delivered, and how many points were recorded.
--
-- Expected healthy output:
--   {"startVis":true,"afterHudClick_vis":true,"afterCanvasClick_vis":false,
--    "log":["DIV","CANVAS"],"points":1}
--
-- Requires:
--   1. dev server running:  python3 -m http.server 8000   (from the project dir)
--   2. Safari > Develop > "Allow JavaScript from Apple Events"  (enabled)
--
-- Run:  osascript dev/safari-probe-clicks.applescript

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
	do JavaScript "var R={};if(typeof showHud==='function'){showHud();}R.startVis=hudVisible;window.mouseButton=window.LEFT;window.mouseX=20;window.mouseY=20;var log=[];var orig=window.mouseClicked;window.mouseClicked=function(e){log.push(e&&e.target?e.target.tagName:'NOEVENT');return orig.apply(this,arguments);};hud.elt.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));R.afterHudClick_vis=hudVisible;if(!hudVisible)showHud();var cv=document.querySelector('canvas');cv.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,view:window}));R.afterCanvasClick_vis=hudVisible;window.mouseClicked=orig;R.log=log;R.points=(typeof clickedPoints!=='undefined')?clickedPoints.length:null;JSON.stringify(R);" in front document
end tell