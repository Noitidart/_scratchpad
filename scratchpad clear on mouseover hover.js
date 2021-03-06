var devtools = Cu.import("resource://gre/modules/devtools/Loader.jsm", {}).devtools;
var HUDService = devtools.require("devtools/webconsole/hudservice");

var hud = HUDService.getBrowserConsole();

var btnClear = hud.chromeWindow.document.querySelector('.webconsole-clear-console-button');
btnClear.addEventListener('mouseover', function() {
  hud.jsterm.clearOutput(true);
}, false);