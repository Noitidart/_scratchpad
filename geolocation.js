var {Cu: utils, Cc: classes, Ci: instances} = Components;
Cu.import('resource://gre/modules/Services.jsm');
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
    //xhr.responseType = "arraybuffer"; //dont set it, so it returns string, you dont want arraybuffer. you only want this if your url is to a zip file or some file you want to download and make a nsIArrayBufferInputStream out of it or something
    xhr.send(null);
}


//start the geolocation stuff
try {
  var geolocation = Cc["@mozilla.org/geolocation;1"].getService(Ci.nsIDOMGeoGeolocation);
} catch (ex if ex.result == Cr.NS_ERROR_XPC_BAD_IID) { //http://codereview.stackexchange.com/questions/56821/improvements-to-nsizipreader-and-nsiscriptableinputstream
  var geolocation = Cc["@mozilla.org/geolocation;1"].getService(Ci.nsISupports);
}
//console.log(geolocation.lastPosition)

var cb_glSuc = function(pos) {
  console.log('glSucCb', 'pos:', pos);
  xhr('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + pos.coords.latitude + ',' + pos.coords.longitude + '&sensor=true', data => {
    var googleApi = JSON.parse(data)
    console.log('googleApi:', googleApi);
    Services.prompt.alert(null, 'XHR Success', data);
    Services.prompt.alert(null, 'XHR Success', googleApi.results[4].formatted_address);
  });
}
geolocation.getCurrentPosition(cb_glSuc)
