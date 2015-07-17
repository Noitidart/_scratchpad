function drawFile(imgPath) {
    var doc = gBrowser.contentDocument;
    var img = new Image();
    img.onload = function() {
        var canvas = doc.createElement('canvas');
        doc.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        canvas.width = this.width;
        canvas.height = this.height;

        ctx.drawImage(this, 0, 0);

        var idata = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var rgba_ = idata.data;
        console.log(idata.data)

        var rgba = []
        for (var i=0; i<idata.data.length; i += 4) {
            var r = idata.data[i];
            var g = idata.data[i+1];
            var b = idata.data[i+2];
            var a = idata.data[i+3];

            rgba.push(r);
            rgba.push(g);
            rgba.push(b);
            rgba.push(a);
        }
        console.log(rgba);

        var gClipboardHelper =Cc["@mozilla.org/widget/clipboardhelper;1"].getService(Ci.nsIClipboardHelper);
        gClipboardHelper.copyString('[\n\t\'' + idata.data.join('\',\n\t\'') + '\'\n]');

}
img.src = imgPath;
}

var filePath = OS.Path.toFileURI(OS.Path.join(OS.Constants.Path.desktopDir, 'firefox icons linux mint', 'firefox16.png'));

drawFile(filePath);