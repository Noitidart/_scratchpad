// Getting pixels as a byte (uint8) array
var imageData = ctx.getImageData(0, 0, can.width, can.height);
var pixels8BitsRGBA = imageData.data;

var buffer = new ArrayBuffer(pixels8BitsRGBA.length + 8);

// Reverting bytes from RGBA to ARGB
//var pixels8BitsARGB = 
var view = new DataView(pixels8BitsRGBA.length + 8); // +8 bytes for the two leading 32 bytes integers
for(var i = 0 ; i < pixels8BitsRGBA.length ; i += 4) {
    view.setUint32((i+4)*2, pixels8BitsRGBA[i+3], true);
    view.setUint32(((i+4)*2)+1, pixels8BitsRGBA[i  ], true);
    view.setUint32(((i+4)*2)+2, pixels8BitsRGBA[i+1], true);
    view.setUint32(((i+4)*2)+3, pixels8BitsRGBA[i+2], true);
}

// Converting array buffer to a uint32 one, and adding leading width and height
var pixelsAs32Bits = new Uint32Array(pixels8BitsARGB.buffer);
view.setUint32(0, can.width, true);
view.setUint32(4, can.height, true);

console.log(pixelsAs32Bits);