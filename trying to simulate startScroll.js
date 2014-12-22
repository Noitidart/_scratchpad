/*
var mm = Cc["@mozilla.org/globalmessagemanager;1"].getService(Ci.nsIMessageListenerManager);
//mm.addMessageListener("Content:Click", this);
console.log(mm)
//console.log(mm.getChildAt(0).getChildAt(0))
gBrowser.selectedBrowser.ownerDocument.defaultView.focus();
//gBrowser.selectedBrowser.startScroll('NS', 300, 300);
mm.broadcastAsyncMessage('Autoscroll:Start', {scrolldir:"NSEW", screenX:300, screenY:300});
*/
//gBrowser.selectedBrowser.mapScreenCoordinatesFromContent(data.screenX, data.screenY);
//gBrowser.selectedBrowser.startScroll('NS', 300, 300);
//Services.ww.activeWindow.alert(gBrowser.selectedBrowser._startX)

var scrolldir = 'NS';
var screenX = 300;
var screenY = 300;
var thi = gBrowser.selectedBrowser;
thi.ownerDocument.defaultView.focus();
            if (!thi._autoScrollPopup) {
              if (thi.hasAttribute("autoscrollpopup")) {
                // our creator provided a popup to share
                thi._autoScrollPopup = document.getElementById(thi.getAttribute("autoscrollpopup"));
              }
              else {
                // we weren't provided a popup; we have to use the global scope
                thi._autoScrollPopup = thi._createAutoScrollPopup();
                document.documentElement.appendChild(thi._autoScrollPopup);
                thi._autoScrollNeedsCleanup = true;
              }
            }

            // we need these attributes so themers don't need to create per-platform packages
            if (screen.colorDepth > 8) { // need high color for transparency
              // Exclude second-rate platforms
              thi._autoScrollPopup.setAttribute("transparent", !/BeOS|OS\/2/.test(navigator.appVersion));
              // Enable translucency on Windows and Mac
              thi._autoScrollPopup.setAttribute("translucent", /Win|Mac/.test(navigator.platform));
            }

            thi._autoScrollPopup.setAttribute("scrolldir", scrolldir);
            thi._autoScrollPopup.addEventListener("popuphidden", thi, true);
            thi._autoScrollPopup.showPopup(document.documentElement,
                                            screenX,
                                            screenY,
                                            "popup", null, null);
            thi._ignoreMouseEvents = true;
            thi._scrolling = true;
            thi._startX = screenX;
            thi._startY = screenY;

var windo = thi.contentWindow;
Services.ww.activeWindow.alert(windo.document.innerHTML)
            windo.addEventListener("mousemove", thi, true);
            windo.addEventListener("mousedown", thi, true);
            windo.addEventListener("mouseup", thi, true);
            windo.addEventListener("contextmenu", thi, true);
            windo.addEventListener("keydown", thi, true);
            windo.addEventListener("keypress", thi, true);
            windo.addEventListener("keyup", thi, true);