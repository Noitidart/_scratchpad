var tab = gBrowser.loadOneTab('data:text/html,<div class="profilist-icon-build-1">backround of this span is of icon on desktop</div><input type="button" value="applyCss"><input type="button" value="removeCss"> Change File on Desktop to: <input type="button" value="Release Img"><input type="button" value="Beta Img"><input type="button" value="Aurora Img"><input type="button" value="Nightly Img">', {inBackground:false});
//start - listen for loadOneTab to finish loading per https://gist.github.com/Noitidart/0f076070bc77abd5e406
var mobs = new window.MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {          
    if (mutation.attributeName == 'progress' && tab.getAttribute('progress') == '') {
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

  var btns = doc.querySelectorAll('input[type=button]');
  Array.prototype.forEach.call(btns, function(b) {
    b.addEventListener('click', handleBtnClick, false);
  });

}

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/osfile.jsm');
var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
var cssBuildIconsStr = '.profilist-icon-build-1 { background-image: url("' + OS.Path.toFileURI(OS.Path.join(OS.Constants.Path.desktopDir, 'build1.png')) + '"); ';
var newURIParam = {
  aURL: 'data:text/css,' + encodeURIComponent(cssBuildIconsStr),
  aOriginCharset: null,
  aBaseURI: null
};
var cssBuildIconsURI = Services.io.newURI(newURIParam.aURL, newURIParam.aOriginCharset, newURIParam.aBaseURI);

function handleBtnClick(e) {
  var targ = e.target;
  var doc = e.target.ownerDocument;
  var win = doc.defaultView;
  switch(targ.value) {
    case 'applyCss':
      if (sss.sheetRegistered(cssBuildIconsURI, sss.AUTHOR_SHEET)) {
        win.alert('ERROR: Sheet is already registered! Will not re-register...');
      } else {
       sss.loadAndRegisterSheet(cssBuildIconsURI, sss.AUTHOR_SHEET);
       win.alert('REGISTERED')
      }
      break;
    case 'removeCss':
      if (sss.sheetRegistered(cssBuildIconsURI, sss.AUTHOR_SHEET)) {
        sss.unregisterSheet(cssBuildIconsURI, sss.AUTHOR_SHEET);
        win.alert('UNregged');
      } else {
        win.alert('ERROR: Sheet is not registered! Nothing to unregister...');
      }
      break;
    case 'Release Img':
      xhr('https://raw.githubusercontent.com/Noitidart/Profilist/%2321/bullet_release.png', function(d){saveToDiskAsBuild1(d, win)});
      break;
    case 'Beta Img':
      xhr('https://raw.githubusercontent.com/Noitidart/Profilist/%2321/bullet_beta.png', function(d){saveToDiskAsBuild1(d, win)});
      break;
    case 'Aurora Img':
      xhr('https://raw.githubusercontent.com/Noitidart/Profilist/%2321/bullet_aurora.png', function(d){saveToDiskAsBuild1(d, win)});
      break;
    case 'Nightly Img':
      xhr('https://raw.githubusercontent.com/Noitidart/Profilist/%2321/bullet_nightly.png', function(d){saveToDiskAsBuild1(d, win)});
      break;
    default:
      win.alert('unknown button clicked, value = "' + targ.value + '"');
  }
}

function xhr(url, cb) {
    let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

    let handler = ev => {
        evf(m => xhr.removeEventListener(m, handler, !1));
        switch (ev.type) {
            case 'load':
                if (xhr.status == 200) {
                    cb(xhr.response);
                    break;
                }
            default:
                Services.prompt.alert(null, 'XHR Error', 'Error Fetching Package: ' + xhr.statusText + ' [' + ev.type + ':' + xhr.status + ']');
                break;
        }
    };

    let evf = f => ['load', 'error', 'abort'].forEach(f);
    evf(m => xhr.addEventListener(m, handler, false));

    xhr.mozBackgroundRequest = true;
    xhr.open('GET', url, true);
    xhr.channel.loadFlags |= Ci.nsIRequest.LOAD_ANONYMOUS | Ci.nsIRequest.LOAD_BYPASS_CACHE | Ci.nsIRequest.INHIBIT_PERSISTENT_CACHING;
    xhr.responseType = "arraybuffer"; //dont set it, so it returns string, you dont want arraybuffer. you only want this if your url is to a zip file or some file you want to download and make a nsIArrayBufferInputStream out of it or something
    xhr.send(null);
}

function saveToDiskAsBuild1(data, win) {
          var file = OS.Path.join(OS.Constants.Path.desktopDir, 'build1.png');
          var promised = OS.File.writeAtomic(file, new Uint8Array(data));
          promised.then(
              function() {
                  win.alert('succesfully saved image to desktop')
              },
              function(ex) {
                   win.alert('FAILED in saving image to desktop')
              }
          );
}