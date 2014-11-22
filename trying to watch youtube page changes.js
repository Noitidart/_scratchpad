try {
  browserDOMWindow.gBrowser.removeProgressListener(progListener);
} catch (ignore) {}

var progListener = {
    onLocationChange: function (aProgress, aRequest, aURI, aFlags) {
        Cu.reportError('location changed!');
        if (aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) {
            Cu.reportError('anchor clicked!');
        } else {
            return
        }
        var domWin = aProgress.DOMWindow;
        var domDoc = domWin.document;
        if(!domDoc) {
            Cu.reportError('document not loaded yet');
            return;
        }
    }
}

browserDOMWindow.gBrowser.addProgressListener(progListener);