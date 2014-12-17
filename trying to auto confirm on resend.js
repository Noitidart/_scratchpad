var stringBundle = Services.strings.createBundle('chrome://browser/locale/appstrings.properties');

try {
  windowListener.unregister();
} catch (ignore) {}

var windowListener = {
	//DO NOT EDIT HERE
	onOpenWindow: function (aXULWindow) {
		// Wait for the window to finish loading
		let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
		aDOMWindow.addEventListener('load', function () {
			aDOMWindow.removeEventListener('load', arguments.callee, false);
			windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
		}, false);
	},
	onCloseWindow: function (aXULWindow) {},
	onWindowTitleChange: function (aXULWindow, aNewTitle) {},
	register: function () {
		// Load into any existing windows
		let XULWindows = Services.wm.getXULWindowEnumerator(null);
		while (XULWindows.hasMoreElements()) {
			let aXULWindow = XULWindows.getNext();
			let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
			windowListener.loadIntoWindow(aDOMWindow, aXULWindow);
		}
		// Listen to new windows
		Services.wm.addListener(windowListener);
	},
	unregister: function () {
		// Unload from any existing windows
		let XULWindows = Services.wm.getXULWindowEnumerator(null);
		while (XULWindows.hasMoreElements()) {
			let aXULWindow = XULWindows.getNext();
			let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
			windowListener.unloadFromWindow(aDOMWindow, aXULWindow);
		}
		//Stop listening so future added windows dont get this attached
		Services.wm.removeListener(windowListener);
	},
	//END - DO NOT EDIT HERE
	loadIntoWindow: function (aDOMWindow, aXULWindow) {
		if (!aDOMWindow) {
			return;
		}
		if (aDOMWindow.location == 'chrome://global/content/commonDialog.xul') {
			var repostString = stringBundle.GetStringFromName('confirmRepostPrompt');
			var repostStringFormatted = stringBundle.formatStringFromName('confirmRepostPrompt', [aDOMWindow.Application.name], 1);
      aDOMWindow.setTimeout(function() {
        console.log('setimeout val 00:', aDOMWindow.args)
				//aDOMWindow.args and aDOMWindow.Dialog is not available till after setTimeout of 0 so weird
        if (aDOMWindow.args.text == repostString || aDOMWindow.args.text == repostStringFormatted) {
					console.log('this is resend prompt so accept it');
					//aDOMWindow.Dialog.ui.button0.click(); //doesnt work
					//aDOMWindow.Dialog.onButton0(); // doesnt work
					//aDOMWindow.ondialogaccept(); //doesnt work
					var dialog = aDOMWindow.document.getElementById('commonDialog');
					var btnAccept = aDOMWindow.document.getAnonymousElementByAttribute(dialog, 'dlgtype', 'accept');
					btnAccept.click();
					console.log('clicked');
				}
      }, 0);
    }
		
	},
	unloadFromWindow: function (aDOMWindow, aXULWindow) {
		if (!aDOMWindow) {
			return;
		}
	}
};

windowListener.register();