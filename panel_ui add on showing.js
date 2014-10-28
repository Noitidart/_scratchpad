var PUI = document.querySelector('#PanelUI-popup');
try {
PUI.removeEventListener('popuphiding', previt, false);
} catch (ignore) {}
var previt = function(e) {
  PUI.removeEventListener('popupshowing', previt, false);
  console.log('popit showing');
}
PUI.addEventListener('popupshowing', previt, false);