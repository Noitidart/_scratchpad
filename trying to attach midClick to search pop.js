try {
  pop.removeEventListener('click', midClickd, false)
} catch (ignore) {}

var win = Services.wm.getMostRecentWindow('navigator:browser');
var pop = win.document.getAnonymousElementByAttribute(win.BrowserSearch.searchBar, 'anonid', 'searchbar-popup');
var midClickd = function(e) {
  if (e.button != 1) {
    //not middle button
    return;
  }
  var popup = this;
  //console.log('eee:', e);  
  console.log('ey:', e.target);

  
  var openTabForMidClick = Services.prefs.getBoolPref('browser.tabs.opentabfor.middleclick');
  if (!openTabForMidClick) {
    console.warn('dont do anything as `browser.tabs.opentabfor.middleclick` pref is set to false, so middleclick is not meant for new tabs')
    return;
  }
  
  var win = e.view; //Services.wm.getMostRecentWindow('navigator:browser');
  if (!win) {
    console.error('no win found, this is real weird and should never happen');
    throw new Error('no win found, this is real weird and should never happen');
  }
  var shiftNotDown_focusNewTab = Services.prefs.getBoolPref('browser.tabs.loadInBackground');
  var shiftDown_focusNewTab = !shiftNotDown_focusNewTab;
  
  //var engineName = e.target.label;
  //console.log('enigneName:', engineName)
  var engine = e.target.engine; //Services.search.getEngineByName(engineName)
  if (!engine) {
    throw new Error('could not get engine from e.target "' + e.target + '"');
  }
  var submission = engine.getSubmission(win.BrowserSearch.searchBar.value, null, 'searchbar');
  var useNewTab = true; //always true as is mid click and openTabForMidClick == true
  if (e.shiftKey) {
    win.openLinkIn(submission.uri.spec,
               useNewTab ? 'tab' : 'current',
               { postData: submission.postData,
                 inBackground: shiftDown_focusNewTab,
                 relatedToCurrent: true });
  } else {
   win.openLinkIn(submission.uri.spec,
               useNewTab ? 'tab' : 'current',
               { postData: submission.postData,
                 inBackground: shiftNotDown_focusNewTab,
                 relatedToCurrent: true });
  }
  popup.hidePopup();
}
pop.addEventListener('click', midClickd, false)