
function showMyContexts(e) {
    console.log('pop showing, e:', e)
	var parentContext = e.target;
  //var win = e.view;
  var searchContext = parentContext.querySelector('#context-searchselect');
	if (!searchContext.hasAttribute('hidden')) {
      //var searchTermsQuoted = searchContext.searchTerms;
   //var searchTermsQuoted = searchContext.getAttribute('label').match(/".*"/);
		//show them
		var myContexts = parentContext.querySelectorAll('.myContextWeev');
		for (var i=0; i<myContexts.length; i++) {
			myContexts[i].removeAttribute('hidden');
      var newLbl = searchContext.getAttribute('label').replace(Services.search.currentEngine.name, 'myCustomEngine'); //win.gNavigatorBundle.getFormattedString("contextMenuSearch", [Services.search.currentEngine.name, 'rawrr']); //myContexts[i].getAttribute('label').replace(/".*"/,  searchTermsQuoted);
      myContexts[i].setAttribute('label', newLbl);
      console.log('removing hiddnes')
		}
	}
}

function hideMyContexts(e) {
    console.log('pop hiding')
    var parentContext = e.target;
    //hide them
    var myContexts = parentContext.querySelectorAll('.myContextWeev');
    for (var i=0; i<myContexts.length; i++) {
        myContexts[i].setAttribute('hidden', 'true');
      console.log('hid it')
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
          myContext.setAttribute('hidden', 'true');
          myContext.setAttribute('label', 'Search rawr for "*"');
          parentContext.insertBefore(myContext, contextSearchselect.nextSibling);
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
          var myContexts = parentContext.querySelectorAll('.myContextWeev');
          for (var i=0; i<myContexts.length; i++) {
            parentContext.removeChild(myContexts[i]);
          }
        }
    }
};
/*end - windowlistener*/

windowListener.register();