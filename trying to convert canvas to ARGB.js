//var img_path = OS.Path.join('D:', 'SONY VAIO', 'Documents and Settings', 'SONY VAIO', 'My Documents', 'My Pictures', 'mdn.png');
//var img_path_fileuri = OS.Path.toFileURI(img_path);

var promise_16_data = Promise.defer();
var promise_32_data = Promise.defer();
var promise_16_32_data = Promise.all([promise_16_data, promise_32_data]);

var img16_ARGB;
var img32_ARGB;

var img16_path = 'chrome://branding/content/icon16.png';
var img16 = new Image();
img16.onload = function() {
    //Services.ww.activeWindow.alert('loaded')
    var canvas = gBrowser.contentDocument.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    gBrowser.contentDocument.documentElement.appendChild(canvas);
    canvas.width = img16.naturalWidth;
    canvas.height = img16.naturalHeight;
    var ctx = canvas.getContext('2d');
    //ctx.drawImage(img16, 0, 0);
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(0, 0, 16, 16);
    
    img16_ARGB = getARGB_data(ctx, canvas.width, canvas.height);
    promise_16_data.resolve('success');
};
img16.src = img16_path;

var img32_path = 'http://mxr.mozilla.org/mozilla-release/source/browser/branding/aurora/default32.png?raw=1';
var img32 = new Image();
img32.onload = function() {
    //Services.ww.activeWindow.alert('loaded')
    var canvas = gBrowser.contentDocument.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    gBrowser.contentDocument.documentElement.appendChild(canvas);
    canvas.width = img32.naturalWidth;
    canvas.height = img32.naturalHeight;
    var ctx = canvas.getContext('2d');
    //ctx.drawImage(img32, 0, 0);
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillRect(0, 0, 32, 32);
    
    img32_ARGB = getARGB_data(ctx, canvas.width, canvas.height);
    promise_32_data.resolve('success');
};
img32.src = img32_path;


promise_16_32_data.then(
  function(aVal) {
    console.log('promise_16_32 success');
    console.log('promise_16_32 data:', img16_ARGB);
    console.log('img16_ARGB:', img16_ARGB);
    var img16_32_data = [];
    for (var i=0; i<img16_ARGB.length; i++) {
      img16_32_data.push(img16_ARGB[i]);
    }
    for (var i=0; i<img32_ARGB.length; i++) {
      img16_32_data.push(img32_ARGB[i]);
    }
    Services.ww.activeWindow.prompt('img16_32_data:', img16_32_data.join(','));
  },
  function(aReason) {
    console.error('ARGB failed, aReason:', aReason);
  }
)

function getARGB_data(ctx, w, h) {
  // Getting pixels as a byte (uint8) array
  var imageData = ctx.getImageData(0, 0, w, h);
  var pixels8BitsRGBA = imageData.data;

  // Reverting bytes from RGBA to ARGB
  var pixels8BitsARGB = new Uint8Array(pixels8BitsRGBA.length + 8); // +8 bytes for the two leading 32 bytes integers
  for(var i = 0 ; i < pixels8BitsRGBA.length ; i += 4) {
      pixels8BitsARGB[i+8 ] = pixels8BitsRGBA[i+3];
      pixels8BitsARGB[i+9 ] = pixels8BitsRGBA[i  ];
      pixels8BitsARGB[i+10] = pixels8BitsRGBA[i+1];
      pixels8BitsARGB[i+11] = pixels8BitsRGBA[i+2];
  }
  console.log('pixels8BitsRGBA:', pixels8BitsRGBA);
  // Converting array buffer to a uint32 one, and adding leading width and height
  var pixelsAs32Bits = new Uint32Array(pixels8BitsARGB.buffer);
  pixelsAs32Bits[0] = w;
  pixelsAs32Bits[1] = h;

  console.log('pixelsAs32Bits:', pixelsAs32Bits);
  
  return pixelsAs32Bits;
}