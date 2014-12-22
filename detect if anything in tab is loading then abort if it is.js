function ifAnyFrameLoadingThenAbort(tab) {
    var topWin = tab.linkedBrowser.contentWindow;
    var winArr = [topWin];
    var frames = topWin.frames;
    for (var j = 0; j < frames.length; j++) {
        winArr.push(frames[j].window);
    }
    var winReadyStates = [];
    var somethingLoading = false;
    for (var j = 0; j < winArr.length; j++) {
        winReadyStates.push(winArr[j].document.readyState);
        if (winArr[j].document.readyState != 'complete') {            
            somethingLoading = true;
            //pWin.alert('winArr j = ' + j + ' readState == ' + winArr[j].document.readyState);
        }
    }
    if (somethingLoading) {
            tab.linkedBrowser.stop();
            tab.ownerDocument.defaultView.alert('something was loading within the tab so aborted it all')
    } else {
       tab.ownerDocument.defaultView.alert('did not find anything that was loading in this tab');
    }
    tab.ownerDocument.defaultView.alert('readyStaes of all windows in this tab =\n' + winReadyStates);
}
ifAnyFrameLoadingThenAbort(gBrowser.tabContainer.childNodes[gBrowser.selectedTab._tPos]);