Cu.import('resource://gre/modules/Promise.jsm');
Cu.import('resource://gre/modules/osfile.jsm');

function makeIcnsOfPaths(paths, pathToSaveIt, doc) {
	//doc is document element to use for canvas
	// paths is array of paths, required to have to 7 elements: 16, 32, 64, 128, 256, 512, and 1024px sqaure images, IN ORDER
	// returns promise, aSuccessVal will be the icoBuffer
	// pathToSaveIt is optional, it is a string path like `OS.Path.join(OS.Constants.Path.desktopDir, 'my.ico')` which tells where to save the ico file
	
	if (paths.length != 7) {
		throw new Error('paths error: required to have to 7 elements: 16, 32, 64, 128, 256, 512, and 1024px sqaure images, IN ORDER');
	}
	
	var funcStartDate = new Date();
	
	//algo:
		//in parallel with makeIconSetDir do loadPathToImg
		//then drawToCanvasAndSave
		//then iconutil
		//then ensure exists
		//then delete iconset dir
	
	//start - define callbacks
	var makeIconSetDir = function() {
		return OS.File.makeDir(pathToSaveIt.replace(/icns$/i, 'iconset'), {unixMode: FileUtils.PERMS_DIRECTORY, ignoreExisting: true});
	}
	
	var loadPathToImg = function(path) {
		//returns promise
		var defer_loadPathToImg = Promise.defer();
		try {
			path_data[path] = {};
			path_data[path].Image = new Image();
			path_data[path].Image.onload = function() { turnImgToData(path); console.log('Succesfully loaded image and stored data of path: "' + path + '"'); defer_loadPathToImg.resolve(path); }
			path_data[path].Image.onabort = function() { defer_loadPathToImg.reject('Abortion on image load of path: "' + path + '"'); };
			path_data[path].Image.onerror = function() { defer_loadPathToImg.reject('Error on image load of path: "' + path + '"'); };
			path_data[path].Image.src = path;
			return defer_loadPathToImg.promise;
		} catch(ex) {
			console.error('Promise Rejected `defer_loadPathToImg` on path `' + path + '` - ', ex);
			return Promise.reject('Promise Rejected `defer_loadPathToImg` on path `' + path + '` - ' + ex);
		}
	}
	
	var verifyRequirementsMet = function() {
		//doesnt return anything, macro
		var shouldBe = [
			16,
			32,
			64,
			128,
			256,
			512,
			1024
		];
		for (var i=0; i<paths.length; i++) {
			if (path_data[paths[i]].Image.naturalHeight != shouldBe[i] || path_data[paths[i]].Image.naturalWidth != shouldBe[i]) {
				throw new Error('wrong dimensions on image with url path: "' + paths[i] + '", it should be: "' + (shouldBe) + '"px in width and height');
			}
		}
		
		var userAgent = Cc['@mozilla.org/network/protocol;1?name=http'].getService(Ci.nsIHttpProtocolHandler).userAgent;
		var version_osx = /Mac OS X (10[\.\d]+?)/.match(userAgent)[1];
		version_osx = parseFloat(version_osx);
		console.log('version_osx:', version_osx);
		if (version_osx >= 10 && version_osx < 10.5) {
			throw new Error('Mac OS X 10.0 to 10.4 not supported because Firefox min requirement is 10.5');
		} else if (version_osx >= 10.5 && version_osx < 10.7) {
			throw new Error('Mac OS X 10.5 & 10.6 support coming soon. I need to figure out how to use MacMemory functions then follow the outline here: https://github.com/philikon/osxtypes/issues/3');
		} else if (version_osx < 10) {
			throw new Error('Huh? Mac OS X is less than version 10.0 this is werid, it should not be. If it is true, not supported.');
		} else {
			//it should be version_osx > 10.7
			//ok will use iconutils
		}
	}
	
	var drawSizeToCanvasAndSaveToSubFiles = function(path) {
		//returns promise
		var defer_drawToCanvasAndSave = Promise.defer();
		var canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		canvas.width = path_data[path].Image.naturalWidth;
		canvas.height = path_data[path].Image.naturalHeight;
		//gBrowser.contentDocument.documentElement.appendChild(canvas);
		
		var ctx = canvas.getContext('2d');
		//ctx.clearRect(0, 0, canvas.width, canvas.height); //not needed

		ctx.drawImage(path_data[path].Image, 0, 0);
		//path_data[path].data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
		
		(canvas.toBlobHD || canvas.toBlob).call(canvas, function(b) {
			var r = Cc['@mozilla.org/files/filereader;1'].createInstance(Ci.nsIFileReader); //new FileReader();
			r.onloadend = function() {
				// r.result contains the ArrayBuffer.
				var promiseArr_writeAtomic = [];
				for (var i=0; i<sizeToSubPngName[path_data[path].Image.naturalWidth].length; i++) {
					var writePath = OS.Path.join(dirpath, sizeToSubPngName[path_data[path].Image.naturalWidth][i] + '.png');
					promiseArr_writeAtomic.push(OS.File.writeAtomic(writePath, new Uint8Array(r.result), { tmpPath: writePath + '.tmp' }));
				}
				var promise_writeAtomic = Promise.all(promiseArr_writeAtomic);				
				promise_writeAtomic.then(
					function(aSuccessVal) {
						console.error('Promise Succesful `promise_writeAtomic` on paths `' + aSuccessVal + '`');
						defer_drawToCanvasAndSave.resolve(aSuccessVal);
					},
					function(aRejectReason) {
						console.error('Promise Rejected `promise_writeAtomic`, aRejectReason: ', aRejectReason);
						defer_drawToCanvasAndSave.reject(aRejectReason);
					}
				);
			};
			r.readAsArrayBuffer(b);
		}, 'image/png');
		
		return defer_drawToCanvasAndSave.promise;
	}
	
	var runIconutil = function() {
		// return promise from async process run
		var defer_runIconutil = Promise.defer();

		var iconutil = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		iconutil.initWithPath('/usr/bin/iconutil');

		var proc = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
		proc.init(iconutil);

		var procFin = {
		  observe: function(aSubject, aTopic, aData) {
			//console.log('incoming procFinOSA', 'aSubject:', aSubject, 'aTopic:', aTopic, 'aData', aData);
			//console.log('incoming procFinOSA unevaled', 'aSubject:', uneval(aSubject), 'aTopic:', uneval(aTopic), 'aData', uneval(aData));
			//console.log('aSubject.exitValue:', aSubject.exitValue);
			if (aSubject.exitValue == 0) {
			  console.log('SUCCESFULLY created ICNS');
			  defer_runIconutil.resolve('Succesfully ran iconutil as exitValue was 0');
			} else {
			  // i have only seen it error with exitValue of 1
			  console.warn('FAILED to create ICNS, exitValue was something other than 0, it was:', aSubject.exitValue);
			  defer_runIconutil.reject('Fail during running iconutil as exitValue was not 0, it was: ' + aSubject.exitValue);
			}
		  }
		};

		  var args = ['-c', 'icns', pathToSaveIt.replace(/icns$/i, 'iconset')];
		  proc.runAsync(args, args.length, procFin);
		
		return defer_runIconutil.promise;
	}
	
	var verifyExists = function() {
		// return promise
		//do a stat on it, and make sure the lastModificationDate is >= to when i started this function
		var defer_verifyExists = Promise.defer();
		
		var promise_stat = OS.File.stat(pathToSaveIt);
		promise_stat.then(
			function(aSuccessVal) {
				console.log('it exists, now checking mod date');
				if (aSuccessVal.lastModificationDate > funcStartDate) {
					defer_verifyExists.resolve('incs exists and was modified by this funciton');
				} else {
					console.error('exists but not modded');
					defer_verifyExists.reject('incs exists but its modified time was before this function was run, so its not due to this funciton, so reject');
				}
			},
			function(aRejectReason) {
				console.error('Promise Rejected: `promise_stat` on path,', pathToSaveIt, 'aRejectReason: ', aRejectReason);
				defer_verifyExists.reject('Promise Rejected: `promise_stat` on path, "' + pathToSaveIt + '", aRejectReason: ' + aRejectReason);
			}
		);
		
		return defer_verifyExists.promise;
	}
	
	var deleteIconset = function() {
		// return promise
		return OS.File.removeDir(pathToSaveIt.replace(/icns$/i, 'iconset'), {ignoreAbsent:true, ignorePermissions:false});
	}
	//end - define callbacks
	
	var dirpath = OS.Path.dirname(pathToSaveIt);
	var sizeToSubPngName = {
		'16':  ['icon_16x16'],
		'32': ['icon_16x16@2x', 'icon_32x32'],
		'64': ['icon_32x32@2x'],
		'128': ['icon_128x128'],
		'256': ['icon_128x128@2x', 'icon_256x256'],
		'512': ['icon_256x256@2x', 'icon_512x512'],
		'1024': ['icon_512x512@2x']
	};
	
	//start - main of this function
	var path_data = {};
	var promiseArr_loadPathToImg = [];
	promiseArr_loadPathToImg.push(makeIconSetDir());
	for (var i=0; i<paths.length; i++) {
		promiseArr_loadPathToImg.push(loadPathToImg(paths[i]));
	}
	var promise_loadPathToImg = Promise.all(promiseArr_loadPathToImg);
	return promise_loadPathToImg.then(
		function(aSuccessVal) {
			//aSuccessVal is path
			console.log('promise_loadPathToImg succesfull, meaning all images and datas loaded', 'aSuccessVal:', aSuccessVal);
			
			var met = verifyRequirementsMet();
			if (!met) {
				return Promise.reject('Failed to meet requirements');
			}
			
			//drawSizeToCanvasAndSaveToSubFiles
			
			var promiseArr_drawSizeToCanvasAndSaveToSubFiles = [];
			promiseArr_drawSizeToCanvasAndSaveToSubFiles.push(makeIconSetDir());
			for (var i=0; i<paths.length; i++) {
				promiseArr_drawSizeToCanvasAndSaveToSubFiles.push(drawSizeToCanvasAndSaveToSubFiles(paths[i]));
			}
			var promise_drawSizeToCanvasAndSaveToSubFiles = Promise.all(promiseArr_drawSizeToCanvasAndSaveToSubFiles);
			
			return promise_drawSizeToCanvasAndSaveToSubFiles.then(
				function(aSuccessVal) {
					console.log('succesfully saved all subfiles');
					var promise_runIconutil = runIconutil();
					return promise_runIconutil.then(
						function(aSuccessVal) {
							console.log('succesfully completed promise `promise_runIconutil`, aSuccessVal:', aSuccessVal);
							var promise_verifyExists = verifyExists();
							
							var promise_deleteIconset = deleteIconset();
							promise_deleteIconset.then(
								function(aSuccessVal) {
									console.log('succesfully completed promise `promise_deleteIconset`, aSuccessVal:', aSuccessVal);
								},
								function(aRejectReason) {
									console.warn('Promise SemiFailed - `promise_deleteIconset` - aRejectReason: ', aRejectReason);
									console.log('note though that the icon was created, just iconset wasnt deleted');
								}
							);
							
							return promise_verifyExists.then(
								function(aSuccessVal) {
									console.log('succesfully completed promise `promise_verifyExists`, aSuccessVal:', aSuccessVal);
									return Promise.resolve('Succesfully Created .ICNS at: "' + pathToSaveIt + '"');
								},
								function(aRejectReason) {
									console.error('Promise Failed - `promise_verifyExists` - aRejectReason: ', aRejectReason)
									return Promise.reject('Promise Failed - `promise_verifyExists` - ' + aRejectReason);
								}
							);
						},
						function(aRejectReason) {
							console.error('Promise Failed - `promise_runIconutil` - aRejectReason: ', aRejectReason)
							return Promise.reject('Promise Failed - `promise_runIconutil` - ' + aRejectReason);
						}
					);
				},
				function(aRejectReason) {
					console.error('Promise Failed - `promise_drawSizeToCanvasAndSaveToSubFiles` - aRejectReason: ', aRejectReason)
					return Promise.reject('Promise Failed - `promise_drawSizeToCanvasAndSaveToSubFiles` - ' + aRejectReason);
				}
			);
		},
		function(aRejectReason) {
			console.error('Promise Rejected `defer_loadPathToImg` on path `' + path + '` - ', ex);
			return Promise.reject('Promise Rejected `defer_loadPathToImg` on path `' + path + '` - ' + ex);
		}
	);
	//end - main of this function
}

var promise_makeIcnsOfPaths = makeIcnsOfPaths([
	'chrome://branding/content/icon16.png',
	'chrome://branding/content/icon32.png',
	'chrome://branding/content/icon64.png',
	'chrome://branding/content/icon128.png',
	'chrome://branding/content/icon256.png',
	'chrome://branding/content/icon512.png',
	'chrome://branding/content/icon1024.png'
], OS.Path.join(OS.Constants.Path.desktopDir, 'my.icns'), document);

promise_makeIcnsOfPaths.then(
	function(aSuccessVal) {
		console.log('Succesfully completed `promise_makeIcnsOfPaths`', 'aSuccessVal:', aSuccessVal);
	},
	function(aRejectReason) {
		console.error('Promise Rejected `promise_makeIcnsOfPaths` - ', ex);
		throw new Error('Promise Rejected `promise_makeIcnsOfPaths` - ' + ex);
	}
);