//i only tested this with img_path as png files, havent tested with non-png files
//img_path is path to non ico image.
var img_path = OS.Path.join('D:', 'SONY VAIO', 'Documents and Settings', 'SONY VAIO', 'My Documents', 'My Pictures', 'mdn.png');
var img_path_fileuri = OS.Path.toFileURI(img_path);

var img_path_fileuri = 'chrome://branding/content/icon64.png';

//var path_to_write_ico = OS.Path.join(OS.Constants.Path.desktopDir, 'converted.ico');
/*
let promise = OS.File.read(img_pth);
promise = promise.then(
  function onSuccess(array) {

  }
);
*/

var img = new Image();
img.onload = function() {
    Services.ww.activeWindow.alert('loaded')
    var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

       // Our own little ico encoder
       // http://msdn.microsoft.com/en-us/library/ms997538.aspx
       // Note: We would have been able to skip ICONDIR/ICONDIRENTRY,
       // if we were to use CreateIconFromResourceEx only instead of also
       // writing the icon to a file.
       let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
       let XOR = data.length;
       let AND = canvas.width * canvas.height / 8;
       let size = 22 /* ICONDIR + ICONDIRENTRY */ + 40 /* BITMAPHEADER */ + XOR + AND;
       let buffer = new ArrayBuffer(size);

       // ICONDIR
       let view = new DataView(buffer);
       view.setUint16(2, 1, true); // type 1
       view.setUint16(4, 1, true); // count;

       // ICONDIRENTRY
       view = new DataView(buffer, 6);
       view.setUint8(0, canvas.width % 256);
       view.setUint8(1, canvas.height % 256);
       view.setUint16(4, 1, true); // Planes
       view.setUint16(6, 32, true); // BPP
       view.setUint32(8, 40 + XOR + AND, true); // data size
       view.setUint32(12, 22, true); // data start

       // BITMAPHEADER
       view = new DataView(buffer, 22);
       view.setUint32(0, 40, true); // BITMAPHEADER size
       view.setInt32(4, canvas.width, true);
       view.setInt32(8, canvas.height * 2, true);
       view.setUint16(12, 1, true); // Planes
       view.setUint16(14, 32, true); // BPP
       view.setUint32(20, XOR + AND, true); // size of data

       // Reorder RGBA -> BGRA
       for (let i = 0; i < XOR; i += 4) {
          let temp = data[i];
          data[i] = data[i + 2];
          data[i + 2] = temp;
       }
       let ico = new Uint8Array(buffer, 22 + 40);
       let stride = canvas.width * 4;
       // Write bottom to top
       for (let i = 0; i < canvas.height; ++i) {
          let su = data.subarray(XOR - i * stride, XOR - i * stride + stride);
          ico.set(su, i * stride);
       }

       var promise = OS.File.writeAtomic(path_to_write_ico, new Uint8Array(buffer), {tmpPath: path_to_write_ico + '.tmp'});
       promise.then(
          function(aVal) {
              Services.ww.activeWindow.alert('Converted and saved to disk');
          },
          function(aReason) {
              Services.ww.activeWindow.alert('Converted but failed to write to disk reason = ' + aReason)
          }
       );


};
img.src = img_path_fileuri;