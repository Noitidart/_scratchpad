/*
var img = new Image();
img.onload = function() {
    var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
		console.time('sta');
    (canvas.toBlobHD || canvas.toBlob).call(canvas, function(b) {
        var r = Cc['@mozilla.org/files/filereader;1'].createInstance(Ci.nsIDOMFileReader); //new FileReader();
        r.onloadend = function() {
            // r.result contains the ArrayBuffer.
            var writePath = OS.Path.join(OS.Constants.Path.desktopDir, 'savedImage.png');
					console.log('r.result:', r.result);
            var promise = OS.File.writeAtomic(writePath, new Uint8Array(r.result), { tmpPath: writePath + '.tmp' });
            promise.then(
                function(aVal) {
                    console.log('successfully saved image to disk');
										console.timeEnd('sta');
                },
                function(aReason) {
                    console.log('writeAtomic failed for reason:', aReason);
                }
            );
        };
        r.readAsArrayBuffer(b);
    }, 'image/png');
};
//var path = OS.Path.toFileURI(OS.Path.join(OS.Contants.Path.desktopDir, 'my.png')); //do it like this for images on disk
var path = 'https://mozorg.cdn.mozilla.net/media/img/firefox/channel/toggler-beta.png?2013-06'; //do like this for images online
img.src = path;
//*/

//
var img = new Image();
img.onload = function() {
    var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
		console.time('sta');
		var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		console.log('imgData:', imgData.data);
		var writePath = OS.Path.join(OS.Constants.Path.desktopDir, 'savedImage.png');
            var promise = OS.File.writeAtomic(writePath, new Uint8Array(imgData.data.buffer), { tmpPath: writePath + '.tmp' });
            promise.then(
                function(aVal) {
                    console.log('successfully saved image to disk');
										console.timeEnd('sta');
                },
                function(aReason) {
                    console.log('writeAtomic failed for reason:', aReason);
                }
            );
};
//var path = OS.Path.toFileURI(OS.Path.join(OS.Contants.Path.desktopDir, 'my.png')); //do it like this for images on disk
var path = 'https://mozorg.cdn.mozilla.net/media/img/firefox/channel/toggler-beta.png?2013-06'; //do like this for images online
img.src = path;
//*/