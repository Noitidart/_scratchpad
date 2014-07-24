var doc = document;
var win = doc.defaultView;

var toolbox = doc.querySelector('#navigator-toolbox');

var buttonId = 'bpMyBtn';
var button = doc.getElementById(buttonId);
if (!button) {
	button = doc.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'toolbarbutton');
	button.setAttribute('id', buttonId);
	button.setAttribute('label', 'My Button');
	button.setAttribute('tooltiptext', 'My buttons tool tip if you want one');
	button.setAttribute('class', 'toolbarbutton-1 chromeclass-toolbar-additional');
	button.style.listStyleImage = 'url("https://gist.githubusercontent.com/Noitidart/9266173/raw/06464af2965cb5968248b764b4669da1287730f3/my-urlbar-icon-image.png")';
	button.addEventListener('command', function() {
		alert('you clicked my button')
	}, false);

	toolbox.palette.appendChild(button);
}

var targetToolbar = doc.querySelector('#nav-bar');
//move button into last postion in targetToolbar
targetToolbar.insertItem(buttonId); //if you want it in first position in targetToolbar do: targetToolbar.insertItem(buttonId, navBar.firstChild);
targetToolbar.setAttribute('currentset', targetToolbar.currentSet);
doc.persist(targetToolbar.id, 'currentset');

/*
//move button into last postion in TabsToolbar (i tested in this Australis I dont know if version less than 29 allow icons in toolbar)
var tabsToolbar = doc.querySelector('#TabsToolbar');
tabsToolbar.insertItem(buttonId); //if you want it in first position in tabsToolbar do: tabsToolbar.insertItem(buttonId, tabsToolbar.firstChild);

//move button into last postion in addon-bar (Australis doesnt have addon bar anymore, but a shim is in place so it will auto get moved to navBar)
var addonBar = doc.querySelector('#addon-bar');
addonBar.insertItem(buttonId); //if you want it in first position in navBar do: addonBar.insertItem(buttonId, addonBar.firstChild);
//move button into last postion in PanelUI-popup (Australis ONLY)
Cu.import('resource:///modules/CustomizableUI.jsm');
var panelUiPopup = doc.querySelector('#PanelUI-contents');
panelUiPopup.insertItem(buttonId); //if you want it in first position in navBar do: panelUiPopup.insertItem(buttonId, panelUiPopup.firstChild);
*/