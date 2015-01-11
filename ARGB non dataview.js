function doit(path, doc) {
    var path_data = {};
    //path is path to a image like 'http://api.flattr.com/button/flattr-badge-large.png'
    path_data[path] = {};
    path_data[path].Image = new Image();
    path_data[path].Image.onload = function() {

        console.log('Succesfully loaded image and stored data of path: "' + path + '"');
        var canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvas.width = path_data[path].Image.naturalWidth;
        canvas.height = path_data[path].Image.naturalHeight;

        var ctx = canvas.getContext('2d');
        ctx.drawImage(path_data[path].Image, 0, 0);


        var ARGBpixmap = [16, 16];
        var image_data = ctx.getImageData(0, 0, can.width, can.height);
        for (var x = 0; x < image_data.width; x++) {
            for (var y = 0; y < image_data.height; y++) {
                var i = x * 4 + y * 4 * image_data.width;
                var r = image_data.data[i];
                var g = image_data.data[i + 1];
                var b = image_data.data[i + 2];
                var a = image_data.data[i + 3];
                ARGBpixmap.push(((a << 24) + (r << 16) + (g << 8) + b) >>> 0);
            }
        }

        console.log(ARGBpixmap.toString());
    }
    path_data[path].Image.src = path;
}
doit(OS.Path.toFileURI(OS.Path.join('C:', 'Users', 'Vayeate', 'Pictures', 'profilist-ff-channel-logos', 'dev48.png')), document);