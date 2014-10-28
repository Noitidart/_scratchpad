var win = Services.wm.getMostRecentWindow('navigator:browser');
var stack = win.document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', 'stack');
var iframe = win.document.createElementNS('http://www.w3.org/1999/xhtml','iframe');
var props = {
  style: 'width:500px;height:500px;background-color:rgba(0,0,0,0.3);'
}
for (var p in props) {
  iframe.setAttribute(p, props[p]);
}
var props = {
  top: 0,
  left: 100
}
for (var p in props) {
  stack.setAttribute(p, props[p]);
}
stack.appendChild(iframe);


var mw = win.document.querySelector('deck');
mw.appendChild(stack);

iframe.setAttribute('src', 'chrome://roarpanels/content/roar.htm');