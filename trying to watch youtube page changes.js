try {
  window.gBrowser.removeProgressListener(progListener);
} catch (ignore) {}

var progListener = {
    onStateChange: function(aProgress, aRequest, aFlags, aStatus) {
        var arrAFlags = [];
        if (aFlags) {
            for (var f in Ci.nsIWebProgressListener) {
                if (aFlags & Ci.nsIWebProgressListener[f]) {
                    arrAFlags.push(f);
                }
            }
        }
        console.log('onStateChange', {aProgress: aProgress, aRequest: aRequest, aFlags:arrAFlags, aStatus: aStatus});
    }/*,
    onLocationChange: function (aProgress, aRequest, aURI, aFlags) {
        var arrAFlags = [];
        if (aFlags) {
            for (var f in Ci.nsIWebProgressListener) {
                if (aFlags & Ci.nsIWebProgressListener[f]) {
                    arrAFlags.push(f);
                }
            }
        }
        console.log('onLocationChange', {aProgress: aProgress, aRequest: aRequest, aURI:aURI, aFlags:arrAFlags});
        if (!aRequest && aFlags == 0) {
            console.log('onLocationChange', 'just a tab switch');
        }
        if (aFlags & Ci.nsIWebProgressListener.LOCATION_CHANGE_SAME_DOCUMENT) {
            console.log('onLocationChange', 'anchor clicked!');
        }
        var domWin = aProgress.DOMWindow;
        var domDoc = domWin.document;
        if(!domDoc) {
            console.warn('document not loaded yet');
            return;
        }
    },
    onProgressChange: function(aProgress, aRequest, curSelf, maxSelf, curTot, maxTot) {
        console.log('onProgressChange', {aProgress:aProgress, aRequest:aRequest, curSelf:curSelf, maxSelf:maxSelf, curTot:curTot, maxTot:maxTot});
    },
    onStatusChange: function(aProgress, aRequest, aStatus, aMessage) {
        console.log('onProgressChange', {aProgress:aProgress, aRequest:aRequest, aStatus:aStatus, aMessage:aMessage});
    }*/
}

window.gBrowser.addProgressListener(progListener);