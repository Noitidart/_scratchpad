var {classes: Cc, interfaces: Ci, utils: Cu} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/devtools/Console.jsm');

var myTimer1 = Cc['@mozilla.org/timer;1'].createInstance(Ci.nsITimer);
var myTimer2 = Cc['@mozilla.org/timer;1'].createInstance(Ci.nsITimer);

var closeWindowTimerEvent = {
	notify: function(timer) {
		console.log('closeWindowTimerEvent Fired!');
		oldWin.BrowserTryToCloseWindow();
	}
};

var focusNewWindowTimerEvent = {
	notify: function(timer) {
		console.log('focusNewWindowTimerEvent Fired!');
		newWin.focus();
	}
};

var oldWin = Services.wm.getMostRecentWindow('navigator:browser'); //window;
var newWin = oldWin.OpenBrowserWindow({
	private: !oldWin.PrivateBrowsingUtils.isWindowPrivate(oldWin)
});
myTimer1.initWithCallback(closeWindowTimerEvent, 0, Ci.nsITimer.TYPE_ONE_SHOT);
myTimer2.initWithCallback(focusNewWindowTimerEvent, 200, Ci.nsITimer.TYPE_ONE_SHOT);