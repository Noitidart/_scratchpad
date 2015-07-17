		var size = 16;

		var littleEndian = (function() {
		  var buffer = new ArrayBuffer(2);
		  new DataView(buffer).setInt16(0, 256, true);
		  return new Int16Array(buffer)[0] === 256;
		})();
		

		var buffer = new ArrayBuffer(4 + 4 + (size*size*4));
		var view = new DataView(buffer);
		view.setUint32(0, size, littleEndian);
		view.setUint32(4, size, littleEndian);

var pos = 8;
view.setUint8(pos++, 3); // a
view.setUint8(pos++, 0); // r
view.setUint8(pos++, 0); // g
view.setUint8(pos++, 0); // b

var s = view.getUint32(8, littleEndian);
console.log(s)