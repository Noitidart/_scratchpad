/*
    var xulwindows = Services.wm.getEnumerator('navigator:browser');
    var xulactivewindow = Services.wm.getMostRecentWindow('navigator:browser');
    var xulactivetab = xulactivewindow.gBrowser.selectedTab;

    xulwindows.forEach(function(win){
      if(win === xulactivewindow)
        return;
      var duplicatedtab = win.gBrowser.duplicateTab(xulactivetab);
      win.gBrowser.moveTabTo(duplicatedtab, 0); // the second argument is the index
    });
*/

function paaMethod_dupeTabAcrossAllWin(aTab) {
  var DOMWindows = Services.wm.getEnumerator('navigator:browser');
  var activeDOMWindow = Services.wm.getMostRecentWindow('navigator:browser');
  while (DOMWindows.hasMoreElements()) {
    var aDOMWindow = DOMWindows.getNext();
    if (aDOMWindow == activeDOMWindow) {
      continue;
    }
    var duplicatedTab = aDOMWindow.gBrowser.duplicateTab(aTab);
    aDOMWindow.gBrowser.moveTabTo(duplicatedTab, 0); // the second argument is the index
  }
}

paaMethod_moveTabToNewWin(Services.wm.getMostRecentWindow('navigator:browser').gBrowser.selectedTab);