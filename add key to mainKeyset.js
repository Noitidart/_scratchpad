var keyset = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'keyset'); //http://forums.mozillazine.org/viewtopic.php?f=19&t=2711165&p=12885299&hilit=mainKeyset#p12885299
//cant use mainKeyset see topic above
var key = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'key');
var props = {
  id: 'key_convert',
  modifiers: 'accel',
  keycode: 'VK_F12',
  oncommand: 'alert("tirggered")'
};
for (var p in props) {
  key.setAttribute(p, props[p]);
}
keyset.appendChild(key);
Services.wm.getMostRecentWindow('navigator:browser').document.documentElement.appendChild(keyset);