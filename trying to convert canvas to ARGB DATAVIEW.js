//var img_path = OS.Path.join('D:', 'SONY VAIO', 'Documents and Settings', 'SONY VAIO', 'My Documents', 'My Pictures', 'mdn.png');
//var img_path_fileuri = OS.Path.toFileURI(img_path);

var promise_16_data = fetchImgARGB('http://mxr.mozilla.org/mozilla-release/source/browser/branding/official/default16.png?raw=1');
//var promise_32_data = fetchImgARGB('http://mxr.mozilla.org/mozilla-release/source/browser/branding/official/default32.png?raw=1');
//var promise_48_data = fetchImgARGB('http://mxr.mozilla.org/mozilla-release/source/browser/branding/official/default48.png?raw=1');
//var promise_64_data = fetchImgARGB('http://mxr.mozilla.org/mozilla-release/source/browser/branding/official/default64.png?raw=1');
//var promise_128_data = fetchImgARGB('http://mxr.mozilla.org/mozilla-release/source/browser/branding/official/default128.png?raw=1');
var promise_alls_data = Promise.all([promise_16_data]);
//var promise_alls_data = Promise.all([promise_16_data, promise_32_data]);

function fetchImgARGB(img_path) {
  var promise_fetchImgARGB = Promise.defer();
  var img = new Image();
  img.onload = function() {
    var width = img.naturalWidth;
    var height = img.naturalHeight;
    var canvas = gBrowser.contentDocument.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    gBrowser.contentDocument.documentElement.appendChild(canvas);
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    //ctx.fillStyle = "rgba(255,0,0, 1)";
    //ctx.fillRect(0, 0, width, height);
    
    var ARGB = getARGB_data(ctx, width, height);
    promise_fetchImgARGB.resolve(ARGB);
  };
  img.src = img_path;
  return promise_fetchImgARGB.promise;
}

promise_alls_data.then(
  function(aVal) {
    console.log('promise_alls_data success');
    console.log('promise_alls_data data:', aVal);
    var img_alls_data = [];
    for (var i=0; i<aVal.length; i++) {
      for (var j=0; j<aVal[i].length; j++) {
        img_alls_data.push(aVal[i][j]);
      }
    }
    console.log('img_alls_data:', img_alls_data);
    /*
    var path_icon_c = OS.Path.join(OS.Constants.Path.desktopDir, 'c', 'icon.c');
    var promise_read = OS.File.read(path_icon_c, {encoding:'utf-8'});
    promise_read.then(
      function(aVal) {
        var writeStr = aVal.replace(/\{.*?\};/, '{' + img_alls_data.join(',') + '};');
        writeStr = writeStr.replace(/length = \d+/, 'length = ' + img_alls_data.length);
        var promise_write = OS.File.writeAtomic(path_icon_c, writeStr, {encoding:'utf-8'});
        promise_write.then(
          function(aVal) {
            console.log('success write');
          },
          function(aReason) {
            console.error('failed to write');
          }
        );
      },
      function(aReason) {
        console.error('failed to read');
      }
    );
    */
  },
  function(aReason) {
    console.error('ARGB failed, aReason:', aReason);
  }
)

function getARGB_data_old(ctx, w, h) {
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

function getARGB_data_middle(ctx, w, h) {
  var imageData = ctx.getImageData(0, 0, w, h);
  var pixelsRGBA = imageData.data;
  var pixelCount = pixelsRGBA.length / 4;

  var pixelsARGBPacked = new Array(2 + pixelCount);
  pixelsARGBPacked[0] = w;
  pixelsARGBPacked[1] = h;
  for(var i = 0 ; i < pixelCount ; i++) {
      pixelsARGBPacked[i+2] = parseInt(
            pixelsRGBA[i * 4 + 3].toString(16)
          + pixelsRGBA[i * 4    ].toString(16)
          + pixelsRGBA[i * 4 + 1].toString(16)
          + pixelsRGBA[i * 4 + 2].toString(16)
      , 16);
  }

  console.log(w, 'pixelsARGBPacked:', pixelsARGBPacked);
  return pixelsARGBPacked;
}

function getARGB_data(ctx, w, h) {
  // Getting pixels as a byte (uint8) array
  var imageData = ctx.getImageData(0, 0, w, h);
  var pixels8BitsRGBA = imageData.data;

  var size = 2 + w * h;
  console.log('size:', size);
  var buffer = new ArrayBuffer(size);
  var view = new DataView(buffer);
  
  // Reverting bytes from RGBA to ARGB
  //var pixels8BitsARGB = new Uint8Array(pixels8BitsRGBA.length + 8); // +8 bytes for the two leading 32 bytes integers
  view.setUint8(0, w);
  view.setUint8(1, h);
  var j = 2;
  for(var i = 0 ; i < pixels8BitsRGBA.length ; i += 4) {
      //pixels8BitsARGB[i+8 ] = pixels8BitsRGBA[i+3];
      //pixels8BitsARGB[i+9 ] = pixels8BitsRGBA[i  ];
      //pixels8BitsARGB[i+10] = pixels8BitsRGBA[i+1];
      //pixels8BitsARGB[i+11] = pixels8BitsRGBA[i+2];
    try {
      view.setUint32(j, pixels8BitsRGBA[i+3] + pixels8BitsRGBA[i] + pixels8BitsRGBA[i+1] + pixels8BitsRGBA[i+2]);
    } catch(ex) {
      console.error('j:', j);
      throw ex;
    }
  }
  //console.log('pixels8BitsRGBA:', pixels8BitsRGBA);

  console.log('view:', view.getUint32(0));
  // Converting array buffer to a uint32 one, and adding leading width and height
  //var pixelsAs32Bits = new Uint32Array(pixels8BitsARGB.buffer);
  //pixelsAs32Bits[0] = w;
  //pixelsAs32Bits[1] = h;

  //console.log('pixelsAs32Bits:', pixelsAs32Bits);
  
  return view;
}