/* DataView Guide for Windows OS
 *   BYTE  setUint8		1
 *   WORD  setUint16	2
 *   DWORD setUint32	4
 *   LONG  setInt32		4
*/
/* http://stackoverflow.com/questions/3236115/which-icon-sizes-should-my-windows-applications-icon-include
 * Which icon sizes should my Windows application's icon include?
Windows XP:
    Explorer views:
        Details / List: 16
        Icons: 32
        Tiles / Thumbnails: 48
    Right-click->Properties / choosing a new icon: 32
    Quickstart area: 16
    Desktop: 32

Windows 7:
    Explorer views:
        Details / List / Small symbols: 16
        All other options: 256 (resized, if necessary)
    Right-click->Properties / choosing a new icon: 32
    Pinned to taskbar: 32
        Right-click-menu: 16
    Desktop:
        Small symbols: 32
        Medium symbols: 48
        Large symbols: 256 (resized, if necessary)
        Zooming using Ctrl+Mouse wheel: 16, 32, 48, 256
*/
// i decide to go with 16, 32, 48, 64, 256 // Vista uses 64 // note though the firefox.ico only has 16 32 48 and 256: http://mxr.mozilla.org/mozilla-release/source/browser/branding/official/firefox.ico

Cu.import('resource://gre/modules/Promise.jsm');
Cu.import('resource://gre/modules/osfile.jsm');

var win = Services.wm.getMostRecentWindow(null);
var me = win;
//these should be global vars
var sizes = []; //os dependent 
var img = {}; //holds Image for each size image

function makeIcoOfPaths(paths) {
	// paths is array of paths
	
	//start - define callbacks
	var loadPathToImgAndStoreData = function(path) {
		//returns promise
		var defer_loadPathToImgAndStoreData = Promise.defer();
		try {
			path_data[path] = {};
			path_data[path].Image = new Image();
			path_data[path].Image.onload = function() { turnImgToData(path); deferred_loadPathToImg.resolve(path, 'Succesfully loaded image and stored data of path: "' + path + '"'); }
			path_data[path].Image.onabort = function(){ deferred_loadPathToImg.reject('Abortion on image load of path: "' + path + '"'); };
			path_data[path].Image.onerror = function(){ deferred_loadPathToImg.reject('Error on image load of path: "' + path + '"'); };
			path_data[path].Image.src = path;
			return defer_loadPathToImgAndStoreData.promise;
		} catch(ex) {
			console.error('Promise Rejected `defer_loadPathToImgAndStoreData` on path `' + path + '` - ', ex);
			return Promise.reject('Promise Rejected `defer_loadPathToImgAndStoreData` on path `' + path + '` - ' + ex);
		}
	}
	
	var turnImgToData = function(path) {
		//doesnt return anything, so a macro basically
		var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		canvas.width = path_data[path].Image.naturalWidth;
		canvas.height = path_data[path].Image.naturalHeight;
		gBrowser.contentDocument.documentElement.appendChild(canvas);
		
		var ctx = canvas.getContext('2d');
		//ctx.clearRect(0, 0, canvas.width, canvas.height); //not needed

		ctx.drawImage(path_data[path].Image, 0, 0);
		path_data[path].data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
	}
	
	var putDatasIntoIco = function() {
		//return promise
		//takes all the loaded datas and makes an ico of it
		// start - ico make proc
		var sizeof_ICONDIR = 6;
		var sizeof_ICONDIRENTRY = 16;
		var sizeof_BITMAPHEADER = 40;
		var sizeof_ICONIMAGEs = 0;
		
		for (var p in path_data) {
			path_data[p].XOR = path_data[p].data.length;
			path_data[p].AND = path_data[p].Image.naturalWidth * path_data[p].Image.naturalHeight / 8;
			sizeof_ICONIMAGEs += path_data[p].XOR;
			sizeof_ICONIMAGEs += path_data[p].AND;
			sizeof_ICONIMAGEs += sizeof_BITMAPHEADER;
			path_data[p].sizeof_ICONIMAGE = path_data[p].XOR + path_data[p].AND + sizeof_BITMAPHEADER;
		}
		
		// let XOR = data.length;
		// let AND = canvas.width * canvas.height / 8;
		// let csize = 22 /* ICONDIR + ICONDIRENTRY */ + 40 /* BITMAPHEADER */ + XOR + AND;
		var csize = sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.length) + sizeof_ICONIMAGEs;
		var buffer = new ArrayBuffer(csize);
	   
		// Every ICO file starts with an ICONDIR
		// ICONDIR
		/* 
		typedef struct																	6+?
		{
			WORD           idReserved;   // Reserved (must be 0)						2
			WORD           idType;       // Resource Type (1 for icons)					2
			WORD           idCount;      // How many images?							2
			ICONDIRENTRY   idEntries[1]; // An entry for each image (idCount of 'em)	?
		} ICONDIR, *LPICONDIR;
		*/
		var view = new DataView(buffer);
		//view.setUint16(0, 0, true);			//	WORD	//	idReserved	//	Reserved (must be 0) /* i commented this out because its not needed, by default the view value is 0 */
		view.setUint16(2, 1, true);				//	WORD	//	idType		//	Resource Type (1 for icons)
		view.setUint16(4, paths.length, true);	//	WORD	//	idCount;	// How many images?
		
		// There exists one ICONDIRENTRY for each icon image in the file
		/*
		typedef struct																16
		{
			BYTE        bWidth;          // Width, in pixels, of the image			1
			BYTE        bHeight;         // Height, in pixels, of the image			1
			BYTE        bColorCount;     // Number of colors in image (0 if >=8bpp)	1
			BYTE        bReserved;       // Reserved ( must be 0)					1
			WORD        wPlanes;         // Color Planes							2
			WORD        wBitCount;       // Bits per pixel							2
			DWORD       dwBytesInRes;    // How many bytes in this resource?		4
			DWORD       dwImageOffset;   // Where in the file is this image?		4
		} ICONDIRENTRY, *LPICONDIRENTRY;
		*/
		// ICONDIRENTRY creation for each image
		for (var p in path_data) {
			view = new DataView(buffer, sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.indexOf(p) /* sum_of_ICONDIRENTRYs_before_this_one */));
			view.setUint8(0, path_data[p].Image.naturalWidth /* % 256 i dont understand why the modulus?? */ );	// BYTE        bWidth;          // Width, in pixels, of the image
			view.setUint8(1, path_data[p].Image.naturalHeight /* % 256 i dont understand why the modulus?? */);	// BYTE        bHeight;         // Height, in pixels, of the image
			//view.setUint8(2, 0);																				// BYTE        bColorCount;     // Number of colors in image (0 if >=8bpp)
			//view.setUint8(3, 0);																				// BYTE        bReserved;       // Reserved ( must be 0)
			view.setUint16(4, 1, true);																			// WORD        wPlanes;         // Color Planes
			view.setUint16(6, 32, true);																		// WORD        wBitCount;       // Bits per pixel
			view.setUint32(8, sizeof_BITMAPHEADER + path_data[p].XOR + path_data[p].AND, true);									// DWORD       dwBytesInRes;    // How many bytes in this resource?			// data size
			view.setUint32(12, sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.indexOf(p) /* sum_of_ICONDIRENTRYs_before_this_one */), true);																		// DWORD       dwImageOffset;   // Where in the file is this image?			// data start
		}
		/*
		typdef struct
		{
		   BITMAPINFOHEADER   icHeader;      // DIB header
		   RGBQUAD         icColors[1];   // Color table
		   BYTE            icXOR[1];      // DIB bits for XOR mask
		   BYTE            icAND[1];      // DIB bits for AND mask
		} ICONIMAGE, *LPICONIMAGE;
		*/
		// ICONIMAGE creation for each image
		var sumof__prior_sizeof_ICONIMAGE = 0;
		for (var p in path_data) {
			/*
			typedef struct tagBITMAPINFOHEADER {
			  DWORD biSize;
			  LONG  biWidth;
			  LONG  biHeight;
			  WORD  biPlanes;
			  WORD  biBitCount;
			  DWORD biCompression;
			  DWORD biSizeImage;
			  LONG  biXPelsPerMeter;
			  LONG  biYPelsPerMeter;
			  DWORD biClrUsed;
			  DWORD biClrImportant;
			} BITMAPINFOHEADER, *PBITMAPINFOHEADER;
			*/
			// BITMAPHEADER
			view = new DataView(buffer, sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.length) + sumof__prior_sizeof_ICONIMAGE);
			view.setUint32(0, sizeof_BITMAPHEADER, true); // BITMAPHEADER size
			view.setInt32(4, path_data[p].Image.naturalWidth, true);
			view.setInt32(8, path_data[p].Image.naturalHeight * 2, true);
			view.setUint16(12, 1, true); // Planes
			view.setUint16(14, 32, true); // BPP
			view.setUint32(20, path_data[p].XOR + path_data[p].AND, true); // size of data
			
			// Reorder RGBA -> BGRA
			for (let i = 0; i < path_data[p].XOR; i += 4) {
				let temp = data[i];
				data[i] = data[i + 2];
				data[i + 2] = temp;
			}
			let ico = new Uint8Array(buffer, sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.length) + sizeof_BITMAPHEADER);
			let stride = path_data[p].Image.naturalWidth * 4;
			
			// Write bottom to top
			for (let i = 0; i < path_data[p].Image.naturalHeight; ++i) {
				let su = data.subarray(path_data[p].XOR - i * stride, path_data[p].XOR - i * stride + stride);
				ico.set(su, i * stride);
			}
			
			sumof__prior_sizeof_ICONIMAGE += path_data[p].sizeof_ICONIMAGE; /*path_data[p].XOR + path_data[p].AND + sizeof_BITMAPHEADER;*/
		}

		// Write the icon to inspect later. (We don't really need to write it at all)
		var writePath = OS.Path.join(OS.Constants.Path.desktopDir, 'profilist' + size + '.' + osIconFileType);
		var p = OS.File.writeAtomic(writePath, new Uint8Array(buffer), {
		   tmpPath: writePath + '.tmp'
		});
		
		// end - ico make proc
		
		var deferred_putDatasIntoIco = Promise.defer();
		try {
			var csize = 0;
			var buffer = new ArrayBuffer(csize);
			return deferred_putDatasIntoIco.promise;
		} catch(ex) {
			console.error('Promise Rejected `deferred_putDatasIntoIco` - ', ex);
			return Promise.reject('Promise Rejected `deferred_putDatasIntoIco` - ' + ex);
		}
	}
	
	//end - define callbacks
	
	//start - main of this function
	var path_data = {};
	var promiseArr_loadPathToImgAndStoreData = [];
	for (var i=0; i<paths.length; i++) {
		promiseArr_loadPathToImgAndStoreData.push(loadPathToImgAndStoreData(paths[i]));
	}
	var promise_loadPathToImgAndStoreData = Promise.all(promiseArr_loadPathToImgAndStoreData);	return promise_loadPathToImgAndStoreData.then(
		function(aSuccessVal, aSuccessVal2) {
			//aSuccessVal is path
			console.log('promise_loadPathToImgAndStoreData succesfull, meaning all images and datas loaded', 'aSuccessVal2:', aSuccessVal2);
			return putDatasIntoIco();
		}
		function(aRejectReason) {
			console.error('Promise Rejected `defer_loadPathToImgAndStoreData` on path `' + path + '` - ', ex);
			return Promise.reject('Promise Rejected `defer_loadPathToImgAndStoreData` on path `' + path + '` - ' + ex);
		}
	);
	//end - main of this function
}