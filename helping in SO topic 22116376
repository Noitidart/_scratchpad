var me = Services.wm.getMostRecentWindow(null);
var navBar = document.querySelector('#nav-bar');

var myToolBarButton = document.createElement('toolbarbutton');
var props = {
    id: 'personaswitcher-button',
    label: 'personaswitcher-button.label;',
    tooltiptext: 'personaswitcher-button.tooltip',
    type: 'menu'
}
for (var p in props) {
    myToolBarButton.setAttribute(p, props[p]);
}

var menuPopup = document.createElement('menupopup');
var props = {
    id: 'personaswithcer-addon',
    onpopupshowing: 'PersonaSwitcher.buttonPopup (event);',
    onpopuphidden: 'PersonaSwitcher.hideSubMenu();'
}
for (var p in props) {
    menuPopup.setAttribute(p, props[p]);
}

var myMenuItem = document.createElement('menuitem');
myMenuItem.setAttribute('label','a menu item');

menuPopup.appendChild(myMenuItem);
myToolBarButton.appendChild(menuPopup);
navBar.appendChild(myToolBarButton);