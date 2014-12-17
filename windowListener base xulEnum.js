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
		
    //console.info('aDOMWindow.location:', aDOMWindow.location);
		if (aDOMWindow.location == 'chrome://global/content/commonDialog.xul') {
      console.log('aDOMWindow.document.readyState:', aDOMWindow.document.readyState);
      console.log('aDOMWindow:', aDOMWindow.confirm);
      aDOMWindow.addEventListener('load', function() {
        aDOMWindow.removeEventListener('load', arguments.callee, false);
        console.log('loaded');
      }, false)
      //console.info('aDOMWindow.location:', aDOMWindow.location);
      //console.info('aDOMWindow.document.documentElement.innerHTML:', aDOMWindow.document.documentElement.innerHTML);
      //console.info('aDOMWindow.document.documentElement.outerHTML:', aDOMWindow.document.documentElement.outerHTML);
      var infobody = aDOMWindow.args; //aDOMWindow.document.getElementById('info.body'); //if do this way then i have to wait for page to load so instead just check window.args object
      console.log('infobody:', infobody);
    }
		
	},
	unloadFromWindow: function (aDOMWindow, aXULWindow) {
		if (!aDOMWindow) {
			return;
		}
	}
};

windowListener.register();