var me = Services.ww.activeWindow;
let XULWindows = Services.wm.getXULWindowEnumerator(null);
while (XULWindows.hasMoreElements()) {
let aXULWindow = XULWindows.getNext();
let aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
  me.alert(aDOMWindow.document.documentElement.getAttribute('windowtype')) //does not work: me.alert(aDOMWindow.document.documentElement.windowtype)
  me.alert(aDOMWindow.location)
}