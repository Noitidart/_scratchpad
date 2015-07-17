var aDOMWin = Services.wm.getMostRecentWindow('navigator:browser');
var tab = aDOMWin.gBrowser.loadOneTab('chrome://browser/content/places/places.xul', {inBackground:false});
//start - listen for loadOneTab to finish loading per https://gist.github.com/Noitidart/0f076070bc77abd5e406

var mobs = new aDOMWin.MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {          
    if (mutation.attributeName == 'progress'/* && tab.getAttribute('progress') == ''*/) {
      //alert('tab done loading');
      init();
      mobs.disconnect();
    }

  });
});
mobs.observe(tab, {attributes: true});
//end - listen for loadOneTab to finish loading per https://gist.github.com/Noitidart/0f076070bc77abd5e406
function init() {
  //run on load of the loadOneTab
  var win = tab.linkedBrowser.contentWindow;
  var doc = win.document;

  win.arguments = ['Downloads'];
  //win.alert('loaded')
  

}
