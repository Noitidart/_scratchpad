Cu.import('resource://gre/modules/Services.jsm');
function isWindowFocusedAndTopMost(aDOMWindow) {
  // aDOMWindow is an XUL DOMWindow
  let childTargetWindow = {};
  Services.focus.getFocusedElementForWindow(aDOMWindow, true, childTargetWindow);
  childTargetWindow = childTargetWindow.value;

  let focusedChildWindow = {};
  if (Services.focus.activeWindow) {
    Services.focus.getFocusedElementForWindow(Services.focus.activeWindow, true, focusedChildWindow);
    focusedChildWindow = focusedChildWindow.value;
  }

  return (focusedChildWindow === childTargetWindow);
}

setTimeout(function() {
  Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService).showAlertNotification('chrome://branding/content/icon128.png', 'Is Window Top Most?', isWindowFocusedAndTopMost(Services.wm.getMostRecentWindow('navigator:browser')));
}, 5000);