//moves the top content window (usually a tab, or the only page of a non-tabbed window) to another window
function moveTabToWin(aTab, tDOMWin) {
  //tDOMWin means target DOMWindow means the window you want the tab in
  //if tDOMWin == 'tabbed' or == 'non-tabbed' it opens in a new window
  //if aTopContWin is the last in its window, then its window is closed
  if (tDOMWin == 'tabbed' || tDOMWin == 'non-tabbed') {
    var sa = Cc["@mozilla.org/supports-array;1"].createInstance(Ci.nsISupportsArray);
    var wuri = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
    wuri.data = 'http://www.bing.com/';
    let aCharset = 'UTF-8';
    let charset = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
    charset.data = "charset=" + aCharset;
    var aAllowThirdPartyFixup = false;
    var allowThirdPartyFixupSupports = Cc["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
    allowThirdPartyFixupSupports.data = aAllowThirdPartyFixup;
    sa.AppendElement(wuri);
    sa.AppendElement(charset);
    sa.AppendElement(allowThirdPartyFixupSupports);
    let features = "chrome,dialog=no";
    if (tDOMWin == 'tabbed') {
      features += ',all';
    }
    var sDOMWin = aTab.ownerGlobal; //source DOMWindow
    if (PrivateBrowsingUtils.permanentPrivateBrowsing || PrivateBrowsingUtils.isWindowPrivate(sDOMWin)) {
       features += ",private";
    } else {
       features += ",non-private";
    }
    var XULWindow = Services.ww.openWindow(null, 'chrome://browser/content/browser.xul', null, features, sa);
    XULWindow.addEventListener('load', function() {
      console.error('LOADED, XULWindow:', XULWindow);
      var DOMWindow = XULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
      console.error('DOMWindow.gBrowser:', DOMWindow.gBrowser);
      DOMWindow.alert('rawr');
    }, false);
  } else if (tDOMWin) {
    //existing dom window
    //if targetWindow has tabContainer then add new tab to target window
    //swap to that new tab, close tab in sourceWindow, assuming sourceWindow has tabs
  }/* else {
    //tDOMWin is null
  }
  */
}

moveTabToWin(gBrowser.selectedTab, 'tabbed');