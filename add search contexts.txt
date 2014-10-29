try {
    windowListener.unregister();
} catch (ignore) {}

funciton showMyContexts(e) {
	var parentContext = e.target;
	if (parentContext.searchTerms) {
		//show them
		var myContexts = parentContext.querySelector('.myContextWeev');
		for (var i=0; i<myContexts.length; i++) {
			myContexts[i].removeAttribute('hidden');
		}
	}
}

function hideMyContexts(e) {
	var parentContext = e.target;
	if (parentContext.searchTerms) {
		//hide them
		var myContexts = parentContext.querySelector('.myContextWeev');
		for (var i=0; i<myContexts.length; i++) {
			myContexts[i].setAttribute('hidden', 'true');
		}

	}
}

/*start - windowlistener*/
var windowListener = {
    //DO NOT EDIT HERE
    onOpenWindow: function (aXULWindow) {
        // Wait for the window to finish loading
        let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
        aDOMWindow.addEventListener("load", function () {
            aDOMWindow.removeEventListener("load", arguments.callee, false);
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
        var contextSearchselect = aDOMWindow.document.getElementById('context-searchselect');
		if (contextSearchselect) {
			var parentContext = contextSearchselect.parentNode; //should be id `contentAreaContextMenu`
			parentContext.addEventListener('popupshowing', showMyContexts, false);
			parentContext.addEventListener('popuphiding', hideMyContexts, false);
			var myContext = contextSearchselect.cloneNode(true);
			myContext.removeAttribute('id');
			myContext.setAttribute('class', 'myContextWeev');
			parentContext.insertBefore(myContext, contextSearchselect);
		}
    },
    unloadFromWindow: function (aDOMWindow, aXULWindow) {
        if (!aDOMWindow) {
            return;
        }
        var contextSearchselect = aDOMWindow.document.getElementById('context-searchselect');
		if (contextSearchselect) {
			var parentContext = contextSearchselect.parentNode; //should be id `contentAreaContextMenu`
			parentContext.removeEventListener('popupshowing', showMyContexts, false);
			parentContext.removeEventListener('popuphiding', hideMyContexts, false);
			var myContexts = parentContext.querySelector('.myContextWeev');
			for (var i=0; i<myContexts.length; i++) {
				parentContext.removeChild(myContexts[i]);
			}
		}
    }
};
/*end - windowlistener*/

windowListener.register();