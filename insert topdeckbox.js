var win = Services.wm.getMostRecentWindow('navigator:browser'); //this is the target window
var deck = win.document.getElementById('content-deck');
var topDeckBox = win.document.getElementById('myTopDeckBox');
if (!topDeckBox) {
  topDeckBox = win.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'notificationbox');
  deck.parentNode.insertBefore(topDeckBox, deck);
} else {
  console.log('already there')
}

var message = 'Another pop-up blocked';
var nb = topDeckBox; //win.gBrowser.getNotificationBox(); //use _gNB for window level notification. use `win.gBrowser.getNotificationBox()` for tab level
var n = nb.getNotificationWithValue('popup-blocked2');
//console.log('nb:', nb)

if(n) {
    n.label = message;
} else {
    var _actionTaken = false;
    var buttons = [{
        label: 'Button',
        accessKey: 'B',
        popup: null,
        callback: function(blah) {
          _actionTaken = true;
          console.log('blah:', blah);
        }
    }];

    var notifCallback = function(what) {
          console.log('what:', what);
      /*
          var fObj = {};
          var fRes = Services.focus.getFocusedElementForWindow(win.gBrowser.selectedTab.linkedBrowser.contentWindow, true, fObj);
      console.log('fRes:', fRes);
      console.log('fObj:', fObj);
      //"fObj:" Object { value: Window → notification.xml }
      //"fRes:" <html>
      //focus messes up so was trying to fix, needs more research
      //on close mxr code move focus forward 1: http://mxr.mozilla.org/mozilla-release/source/toolkit/content/widgets/notification.xml#187
      */
          if (what == 'removed') {
            if (!_actionTaken) {
             console.log('user closed the pop up by clicking "X" he dissmissed the popup');
            } else {
              console.log('popup disappeared with user clicking button');
            }
          }
    }
    var priority = 1;
    var myNotif = nb.appendNotification(message, 'popup-blocked2',
                         'chrome://browser/skin/Info.png',
                          priorit, buttons, notifCallback);

}