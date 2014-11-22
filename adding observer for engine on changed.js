try {
  Services.obs.removeObserver(myobs, 'browser-search-engine-modified', false);
} catch (ignore) {}
var myobs = {
  observe: function(aSubject, aTopic, aData) {
    if (aData == 'engine-current') {
      console.log('current engine was changed! it is now = ', Services.search.currentEngine.name);
      //console.log('aSubject on change:', aSubject); //aSubject is the engine
      //console.log('aTopic on change:', aTopic); //aTopic is obviously `browser-search-engine-modified`
      var win = Services.wm.getMostRecentWindow('navigator:browser');
      var submission = aSubject.getSubmission(win.BrowserSearch.searchBar.value, null, 'searchbar');
      if (win.gBrowser.selectedTab.linkedBrowser.contentWindow.document.location == submission.uri.spec) {
        console.log('load switch now');
      }
    }
  }
}
Services.obs.addObserver(myobs, 'browser-search-engine-modified', false);