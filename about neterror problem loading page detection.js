try {
  window.gBrowser.removeEventListener('DOMContentLoaded', listenToPageLoad_IfProblemLoadingPage, false);
} catch(ignore) {}
var listenToPageLoad_IfProblemLoadingPage = function(event) {

    var win = event.originalTarget.defaultView;
    var webnav = win.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation);
    //console.log('webnav:', webnav, 'webnav ofselectedtab:', window.gBrowser.webNavigation);
    var docuri = webnav.document.documentURI; //can also try event.originalTarget.linkedBrowser.webNavigation.document.documentURI <<i didnt test this linkedBrowser theory but its gotta be something like that
    var location = win.location + ''; //I add a " + ''" at the end so it makes it a string so we can use string functions like location.indexOf etc

    if (win.frameElement) {
      // Frame within a tab was loaded. win should be the top window of
      // the frameset. If you don't want do anything when frames/iframes
      // are loaded in this web page, uncomment the following line:
      // return;
      // Find the root document:
      //win = win.top;
      if (docuri.indexOf('about:neterror') == 0) {
            console.warn('IN FRAME - PROBLEM LOADING PAGE LOADED docuri = "' + docuri + '"');
      }
    } else {
        if (docuri.indexOf('about:neterror') == 0) {
            console.warn('IN TAB - PROBLEM LOADING PAGE LOADED docuri = "' + docuri + '"');
        }
    }
}


window.gBrowser.addEventListener('DOMContentLoaded', listenToPageLoad_IfProblemLoadingPage, false);