gBrowser.removeEventListener('DOMContentLoaded', processNewURL, false);

var processNewURL = function(e) {
  console.log('e:', e);
       var win = e.originalTarget.defaultView;
     
     //start - method 1 to get to webNav:
     var webNav = win.QueryInterface(Ci.nsIInterfaceRequestor)
.getInterface(Ci.nsIWebNavigation);
     var referredFromURI = webNav.referringURI;
     //end - method 1
     
     //start - method 2 long winded way:
     /*
       var domWin = win.QueryInterface(Ci.nsIInterfaceRequestor)
                         .getInterface(Ci.nsIWebNavigation)
                         .QueryInterface(Ci.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Ci.nsIInterfaceRequestor)
                         .getInterface(Ci.nsIDOMWindow);
       var tab = domWin.gBrowser._getTabForContentWindow(win);
       //console.log('tab:', tab);
       var referredFromURI = tab.linkedBrowser.webNavigation.referringURI;
       */
     //end - method 2
     
     if (referredFromURI != null) {
          win.alert('referred from:' + referredFromURI.spec);
     } else {
          win.alert('not redirected');
     }
}

gBrowser.addEventListener('DOMContentLoaded', processNewURL, false);

