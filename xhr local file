var {Cu: utils, Cc: classes, Ci: instances} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/osfile.jsm');

var pathh = OS.Path.toFileURI(OS.Path.join(OS.Constants.Path.desktopDir, 'mdn.png'));
xhr(pathh, data => {
    Services.prompt.alert(null, 'XHR Success', data);
});



/****my xhr func****/
function xhr(url, cb) {
    let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);

    let handler = ev => {
        evf(m => xhr.removeEventListener(m, handler, !1));
        Services.ww.activeWindow.alert('ev.type=' + ev.type);
        switch (ev.type) {
            case 'load':
                if (xhr.status == 200) {
                    cb(xhr.response);
                    break;
                } else if (xhr.status == 0) {
                    var uritest = Services.io.newURI(url, null, null);
                    if (uritest.schemeIs("file")) {
                       //http://stackoverflow.com/a/25585661/1828637
                       //xhr'ing file uri always returns status 0 so this is not a real error
                       //so lets call cb and break
                        cb(xhr.response);
                        break;
                     } else {
                       //dont break so it goes into default error report
                         console.log('uri scheme is not file so it was real error, scheme was: ', uritest.scheme);
                     }
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
    //xhr.responseType = "arraybuffer"; //dont set it, so it returns string, you dont want arraybuffer. you only want this if your url is to a zip file or some file you want to download and make a nsIArrayBufferInputStream out of it or something
    xhr.send(null);
}