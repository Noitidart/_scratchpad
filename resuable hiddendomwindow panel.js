var win = window; //Services.appShell.hiddenDOMWindow;
var panel = win.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul','panel');
var props = {
	type: 'arrow',
	style: 'width:300px;height:100px;'
}
for (var p in props) {
	panel.setAttribute(p, props[p]);
}

var popupset = win.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul','popupset');
popupset.appendChild(panel);
win.document.documentElement.appendChild(popupset);

panel.addEventListener('popuphiding', function (e) {
	e.preventDefault();
	e.stopPropagation();
	//panel.removeEventListener('popuphiding', arguments.callee, false); //if dont have this then cant do hidepopup after animation as hiding will be prevented
	panel.addEventListener('transitionend', function () {
		panel.hidePopup(); //just hide it, if want this then comment out line 19 also uncomment line 16
		//panel.parentNode.removeChild(panel); //remove it from dom //if want this then comment out line 18
	}, false);
	panel.ownerDocument.getAnonymousNodes(panel)[0].setAttribute('style', 'transform:translate(0,-50px);opacity:0.9;transition: transform 0.2s ease-in, opacity 0.15s ease-in');
}, false);

panel.openPopup(Services.wm.getMostRecentWindow(null).document.documentElement, 'overlap', 100, 100);