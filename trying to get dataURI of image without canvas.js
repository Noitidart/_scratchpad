var {Cu: utils, Cc: classes, Ci: instances} = Components;
Cu.import('resource://gre/modules/Services.jsm');
Cu.importGlobalProperties(['Blob']);
var FileReader =  Cc["@mozilla.org/files/filereader;1"].createInstance(Ci.nsIDOMFileReader);

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

function dataURItoBlob(/*dataURI*/ arrayBuffer, mimeString) {
/*
    // convert base64 to raw binary data held in a string
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var arrayBuffer = new ArrayBuffer(byteString.length);

    var _ia = new Uint8Array(arrayBuffer);
    for (var i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
    }
*/
    var dataView = new DataView(arrayBuffer);
    var blob = new Blob([dataView], { type: mimeString });
    return blob;
}



xhr('https://www.gravatar.com/avatar/eb9895ade1bd6627e054429d1e18b576?s=24&d=identicon&r=PG&f=1', data => {
    Services.prompt.alert(null, 'XHR Success', data);
  console.log('xhr success, data:', data);
    // convert arraybuffer to blob
var myBlob = dataURItoBlob(data, 'image/png');

// convert blob to dataurl
  //var testBase64;
  var reader = FileReader;
  reader.onload = function() {
    var dataUrl = reader.result;
    //testBase64 = dataUrl.split(',')[1];
console.log('dataUrl:', dataUrl);
  };
  reader.readAsDataURL(myBlob);

});