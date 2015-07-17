var aDOMWin = Services.wm.getMostRecentWindow('navigator:browser');
aDOMWin.gBrowser.addEventListener('DOMContentLoaded', function(e) {
  console.log('e.location', e.originalTarget)
  var aXULDoc = e.originalTarget;
  console.log('e.location', aXULDoc.location)
  if (aXULDoc.location == 'chrome://browser/content/places/places.xul') {
    aDOMWin.gBrowser.removeEventListener('DOMContentLoaded', arguments.callee, false);
  }
}, false);

//end - listen for loadOneTab to finish loading per https://gist.github.com/Noitidart/0f076070bc77abd5e406
function init() {
  //run on load of the loadOneTab
  var win = tab.linkedBrowser.contentWindow;
  var doc = win.document;

  doc.onreadystatechange = function() {
    console.error('try adding now')
  }
  win.addEventListener('DOMContentLoaded', function() {
    console.error('loaded')
  }, false);
  
  console.info('readystate:', doc.readyState)
  win.arguments = ['Downloads'];
  //win.alert('loaded')
  

}
