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

function makeIcoOfPaths(paths, pathToSaveIt) {
	// paths is array of paths
	// returns promise, aSuccessVal will be the icoBuffer
	// pathToSaveIt is optional, it is a string path like `OS.Path.join(OS.Constants.Path.desktopDir, 'my.ico')` which tells where to save the ico file
	
	//start - define callbacks
	var loadPathToImgAndStoreData = function(path) {
		//returns promise
		var defer_loadPathToImgAndStoreData = Promise.defer();
		try {
			path_data[path] = {};
			path_data[path].Image = new Image();
			path_data[path].Image.onload = function() { turnImgToData(path); console.log('Succesfully loaded image and stored data of path: "' + path + '"'); defer_loadPathToImgAndStoreData.resolve(path); }
			path_data[path].Image.onabort = function() { defer_loadPathToImgAndStoreData.reject('Abortion on image load of path: "' + path + '"'); };
			path_data[path].Image.onerror = function() { defer_loadPathToImgAndStoreData.reject('Error on image load of path: "' + path + '"'); };
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
		console.log('in putDatasIntoIco');
		//return ico
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
			var sumof__prior_sizeof_ICONIMAGE = 0;
			for (var p in path_data) {
				/*
				var countof_ICONIMAGES_prior_to_this_ICONIMAGE = paths.indexOf(p);
				var sizeof_ICONIMAGES_prior_to_this_ICONIMAGE = 0;
				for (var i=0; i<countof_ICONIMAGES_prior_to_this_ICONIMAGE; i++) {
					sizeof_ICONIMAGES_prior_to_this_ICONIMAGE += path_data[paths[i]].sizeof_ICONIMAGE;
				}
				*/
				
				view = new DataView(buffer, sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.indexOf(p) /* sum_of_ICONDIRENTRYs_before_this_one */));
				view.setUint8(0, path_data[p].Image.naturalWidth /* % 256 i dont understand why the modulus?? */ );									// BYTE        bWidth;          // Width, in pixels, of the image
				view.setUint8(1, path_data[p].Image.naturalHeight /* % 256 i dont understand why the modulus?? */);									// BYTE        bHeight;         // Height, in pixels, of the image
				//view.setUint8(2, 0);																												// BYTE        bColorCount;     // Number of colors in image (0 if >=8bpp)
				//view.setUint8(3, 0);																												// BYTE        bReserved;       // Reserved ( must be 0)
				view.setUint16(4, 1, true);																											// WORD        wPlanes;         // Color Planes
				view.setUint16(6, 32, true);																										// WORD        wBitCount;       // Bits per pixel
				view.setUint32(8, path_data[p].sizeof_ICONIMAGE /* sizeof_BITMAPHEADER + path_data[p].XOR + path_data[p].AND */, true);													// DWORD       dwBytesInRes;    // How many bytes in this resource?			// data size
				view.setUint32(12, sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.length) + sumof__prior_sizeof_ICONIMAGE /*sizeof_ICONIMAGES_prior_to_this_ICONIMAGE*/, true);		// DWORD       dwImageOffset;   // Where in the file is this image?			// data start
				
				sumof__prior_sizeof_ICONIMAGE += path_data[p].sizeof_ICONIMAGE;
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
				  DWORD biSize;				4
				  LONG  biWidth;			4
				  LONG  biHeight;			4
				  WORD  biPlanes;			2
				  WORD  biBitCount;			2
				  DWORD biCompression;		4
				  DWORD biSizeImage;		4
				  LONG  biXPelsPerMeter;	4
				  LONG  biYPelsPerMeter;	4
				  DWORD biClrUsed;			4
				  DWORD biClrImportant;		4
				} BITMAPINFOHEADER, *PBITMAPINFOHEADER;		40
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
				for (var i = 0; i < path_data[p].XOR; i += 4) {
					var temp = path_data[p].data[i];
					path_data[p].data[i] = path_data[p].data[i + 2];
					path_data[p].data[i + 2] = temp;
				}
				var ico = new Uint8Array(buffer, sizeof_ICONDIR + (sizeof_ICONDIRENTRY * paths.length) + sumof__prior_sizeof_ICONIMAGE + sizeof_BITMAPHEADER);
				var stride = path_data[p].Image.naturalWidth * 4;
				
				// Write bottom to top
				for (var i = 0; i < path_data[p].Image.naturalHeight; ++i) {
					var su = path_data[p].data.subarray(path_data[p].XOR - i * stride, path_data[p].XOR - i * stride + stride);
					ico.set(su, i * stride);
				}
				
				sumof__prior_sizeof_ICONIMAGE += path_data[p].sizeof_ICONIMAGE; /*path_data[p].XOR + path_data[p].AND + sizeof_BITMAPHEADER;*/
			}
			
			return buffer;
	}
	
	//end - define callbacks
	
	//start - main of this function
	var path_data = {};
	var promiseArr_loadPathToImgAndStoreData = [];
	for (var i=0; i<paths.length; i++) {
		promiseArr_loadPathToImgAndStoreData.push(loadPathToImgAndStoreData(paths[i]));
	}
	var promise_loadPathToImgAndStoreData = Promise.all(promiseArr_loadPathToImgAndStoreData);
	return promise_loadPathToImgAndStoreData.then(
		function(aSuccessVal) {
			//aSuccessVal is path
			console.log('promise_loadPathToImgAndStoreData succesfull, meaning all images and datas loaded', 'aSuccessVal:', aSuccessVal);
			var icoBuffer = putDatasIntoIco();
			console.log('succesfully made ico buffer');
			
			if (pathToSaveIt) {
				console.log('will now save to file');
				var promise_writeAtomic = OS.File.writeAtomic(pathToSaveIt, new Uint8Array(icoBuffer), { tmpPath: pathToSaveIt + '.tmp' });
				return promise_writeAtomic.then(
					function(aSuccessVal) {
						console.log('Succesfully completed `promise_writeAtomic`', 'aSuccessVal:', aSuccessVal);
						return Promise.resolve(icoBuffer);
					},
					function(aRejectReason) {
						console.error('Promise Rejected `promise_writeAtomic` - ', ex);
						return Promise.reject('Promise Rejected `promise_writeAtomic` - ' + ex);
					}
				);
			} else {
				console.log('dev does not want to save ico to file');
				return Promise.resolve(icoBuffer);
			}
		},
		function(aRejectReason) {
			console.error('Promise Rejected `defer_loadPathToImgAndStoreData` on path `' + path + '` - ', ex);
			return Promise.reject('Promise Rejected `defer_loadPathToImgAndStoreData` on path `' + path + '` - ' + ex);
		}
	);
	//end - main of this function
}

var promise_makeIcoOfPaths = makeIcoOfPaths([
	'chrome://branding/content/icon16.png',
	'chrome://branding/content/icon32.png',
	'chrome://branding/content/icon64.png',
	'chrome://branding/content/icon128.png'
], OS.Path.join(OS.Constants.Path.desktopDir, 'my.ico'));

promise_makeIcoOfPaths.then(
	function(aSuccessVal) {
		console.log('Succesfully completed `promise_makeIcoOfPaths`', 'aSuccessVal:', aSuccessVal);
	},
	function(aRejectReason) {
		console.error('Promise Rejected `promise_makeIcoOfPaths` - ', ex);
		throw new Error('Promise Rejected `promise_makeIcoOfPaths` - ' + ex);
	}
);

promise_makeIcoOfPaths.catch(
	function(aCatch) {
		console.warn('Promise Caught `promise_makeIcoOfPaths` - ', ex);
	}
)