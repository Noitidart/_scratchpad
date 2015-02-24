Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/FileUtils.jsm');

// start - common helper functions
function Deferred() {
	if (Promise.defer) {
		//need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
		return Promise.defer();
	} else if (PromiseUtils.defer) {
		//need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
		return PromiseUtils.defer();
	} else {
		/* A method to resolve the associated Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} value : This value is used to resolve the promise
		 * If the value is a Promise then the associated promise assumes the state
		 * of Promise passed as value.
		 */
		this.resolve = null;

		/* A method to reject the assocaited Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} reason: The reason for the rejection of the Promise.
		 * Generally its an Error object. If however a Promise is passed, then the Promise
		 * itself will be the reason for rejection no matter the state of the Promise.
		 */
		this.reject = null;

		/* A newly created Pomise object.
		 * Initially in pending state.
		 */
		this.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
		Object.freeze(this);
	}
}

function makeDir_Bug934283(path, options) {
	// pre FF31, using the `from` option would not work, so this fixes that so users on FF 29 and 30 can still use my addon
	// the `from` option should be a string of a folder that you know exists for sure. then the dirs after that, in path will be created
	// for example: path should be: `OS.Path.join('C:', 'thisDirExistsForSure', 'may exist', 'may exist2')`, and `from` should be `OS.Path.join('C:', 'thisDirExistsForSure')`

	if (!('from' in options)) {
		console.error('you have no need to use this, as this is meant to allow creation from a folder that you know for sure exists');
		throw new Error('you have no need to use this, as this is meant to allow creation from a folder that you know for sure exists');
	}

	if (path.toLowerCase().indexOf(options.from.toLowerCase()) == -1) {
		console.error('The `from` string was not found in `path` string');
		throw new Error('The `from` string was not found in `path` string');
	}

	var options_from = options.from;
	delete options.from;

	var dirsToMake = OS.Path.split(path).components.slice(OS.Path.split(options_from).components.length);
	console.log('dirsToMake:', dirsToMake);

	var deferred_makeDir_Bug934283 = new Deferred();
	var promise_makeDir_Bug934283 = deferred_makeDir_Bug934283.promise;

	var pathExistsForCertain = options_from;
	var makeDirRecurse = function() {
		pathExistsForCertain = OS.Path.join(pathExistsForCertain, dirsToMake[0]);
		dirsToMake.splice(0, 1);
		var promise_makeDir = OS.File.makeDir(pathExistsForCertain);
		promise_makeDir.then(
			function(aVal) {
				console.log('Fullfilled - promise_makeDir - ', 'ensured/just made:', pathExistsForCertain, aVal);
				if (dirsToMake.length > 0) {
					makeDirRecurse();
				} else {
					deferred_makeDir_Bug934283.resolve('this path now exists for sure: "' + pathExistsForCertain + '"');
				}
			},
			function(aReason) {
				var rejObj = {
					promiseName: 'promise_makeDir',
					aReason: aReason,
					curPath: pathExistsForCertain
				};
				console.warn('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
				deferred_makeDir_Bug934283.reject(rejObj);
			}
		).catch(
			function(aCaught) {
				var rejObj = {name:'promise_makeDir', aCaught:aCaught};
				console.error('Caught - promise_makeDir - ', rejObj);
				deferred_makeDir_Bug934283.reject(rejObj); // throw aCaught;
			}
		);
	};
	makeDirRecurse();

	return promise_makeDir_Bug934283;
}

function tryOsFile_ifDirsNoExistMakeThenRetry(nameOfOsFileFunc, argsOfOsFileFunc, fromDir) {
	// i use this with writeAtomic, copy, i havent tested with other things
	// argsOfOsFileFunc is array of args
	// will execute nameOfOsFileFunc with argsOfOsFileFunc, if rejected and reason is directories dont exist, then dirs are made then rexecute the nameOfOsFileFunc
	// returns promise
	
	var deferred_tryOsFile_ifDirsNoExistMakeThenRetry = new Deferred();
	
	if (['writeAtomic', 'copy'].indexOf(nameOfOsFileFunc) == -1) {
		deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject('nameOfOsFileFunc of "' + nameOfOsFileFunc + '" is not supported');
		// not supported because i need to know the source path so i can get the toDir for makeDir on it
		return deferred_tryOsFile_ifDirsNoExistMakeThenRetry.promise; //just to exit further execution
	}
	
	// setup retry
	var retryIt = function() {
		var promise_retryAttempt = OS.File[nameOfOsFileFunc].apply(OS.File, argsOfOsFileFunc);
		promise_retryAttempt.then(
			function(aVal) {
				console.log('Fullfilled - promise_retryAttempt - ', aVal);
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.resolve('retryAttempt succeeded');
			},
			function(aReason) {
				var rejObj = {name:'promise_retryAttempt', aReason:aReason};
				console.warn('Rejected - promise_retryAttempt - ', rejObj);
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(rejObj); //throw rejObj;
			}
		).catch(
			function(aCaught) {
				var rejObj = {name:'promise_retryAttempt', aCaught:aCaught};
				console.error('Caught - promise_retryAttempt - ', rejObj);
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(rejObj); // throw aCaught;
			}
		);
	};
	
	// setup recurse make dirs
	var makeDirs = function() {
		var toDir;
		switch (nameOfOsFileFunc) {
			case 'writeAtomic':
				toDir = OS.Path.dirname(argsOfOsFileFunc[0]);
				break;
				
			case 'copy':
				toDir = OS.Path.dirname(argsOfOsFileFunc[1]);
				break;
				
			default:
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject('nameOfOsFileFunc of "' + nameOfOsFileFunc + '" is not supported');
				return; // to prevent futher execution
		}
		var promise_makeDirsRecurse = makeDir_Bug934283(toDir, {from: fromDir});
		promise_makeDirsRecurse.then(
			function(aVal) {
				console.log('Fullfilled - promise_makeDirsRecurse - ', aVal);
				retryIt();
			},
			function(aReason) {
				var rejObj = {name:'promise_makeDirsRecurse', aReason:aReason};
				console.warn('Rejected - promise_makeDirsRecurse - ', rejObj);
				if (aReason.becauseNoSuchFile) {
					console.log('make dirs then do retryAttempt');
					makeDirs();
				} else {
					// did not get becauseNoSuchFile, which means the dirs exist (from my testing), so reject with this error
					deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(rejObj); //throw rejObj;
				}
			}
		).catch(
			function(aCaught) {
				var rejObj = {name:'promise_makeDirsRecurse', aCaught:aCaught};
				console.error('Caught - promise_makeDirsRecurse - ', rejObj);
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(rejObj); // throw aCaught;
			}
		);
	};
	
	// do initial attempt
	var promise_initialAttempt = OS.File[nameOfOsFileFunc].apply(OS.File, argsOfOsFileFunc);
	promise_initialAttempt.then(
		function(aVal) {
			console.log('Fullfilled - promise_initialAttempt - ', aVal);
			deferred_tryOsFile_ifDirsNoExistMakeThenRetry.resolve('initialAttempt succeeded');
		},
		function(aReason) {
			var rejObj = {name:'promise_initialAttempt', aReason:aReason};
			console.warn('Rejected - promise_initialAttempt - ', rejObj);
			if (aReason.becauseNoSuchFile) {
				console.log('make dirs then do secondAttempt');
				makeDirs();
			} else {
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(rejObj); //throw rejObj;
			}
		}
	).catch(
		function(aCaught) {
			var rejObj = {name:'promise_initialAttempt', aCaught:aCaught};
			console.error('Caught - promise_initialAttempt - ', rejObj);
			deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(rejObj); // throw aCaught;
		}
	);
	
	
	return deferred_tryOsFile_ifDirsNoExistMakeThenRetry.promise;
}
function immediateChildPaths(path_dir) {
	// returns promise
	// path_dir is string to path of dir
	// resolves to hold array of all paths that are immediate children of path_dir
	var deferred_immediateChildPaths = new Deferred();
	
	var paths_children = [];
	var callback_collectChildPaths = function(entry) {
		paths_children.push(entry.path);
	};
	
	var itr_pathDir = new OS.File.DirectoryIterator(path_dir);
	var promise_collectChildPaths = itr_pathDir.forEach(callback_collectChildPaths);
	promise_collectChildPaths.then(
		function(aVal) {
			console.log('Fullfilled - promise_collectChildPaths - ', aVal);
			// start - do stuff here - promise_collectChildPaths
			deferred_immediateChildPaths.resolve(paths_children);
			// end - do stuff here - promise_collectChildPaths
		},
		function(aReason) {
			var rejObj = {name:'promise_collectChildPaths', aReason:aReason};
			console.warn('Rejected - promise_collectChildPaths - ', rejObj);
			deferred_immediateChildPaths.reject(rejObj);
		}
	).catch(
		function(aCaught) {
			var rejObj = {name:'promise_collectChildPaths', aCaught:aCaught};
			console.error('Caught - promise_collectChildPaths - ', rejObj);
			deferred_immediateChildPaths.reject(rejObj);
		}
	);
	
	return deferred_immediateChildPaths.promise;
}
// end - common helper functions

function getImg_of_exactOrNearest_Bigger_then_Smaller(targetSize, objOfImgs) {
	// objOfImgs should be an object with key's representing the size of the image. images are expected to be square. so size is == height == width of image
	// objOfImgs should hvae the Image() loaded in objOfImgs[k].Image
	// finds and returns the image which matches targetSize, if not found then it returns the image in objOfImgs that is immediately bigger, if nothing bigger, then returns what it is immediately smaller
	
	//objOfImgs should have key of the size of the image. the size of the img should be square. and each item should be an object of {Image:Image()}			
	var nearestDiff;
	var nearestKey;
	for (var k in objOfImgs) {
		var cDiff = k - targetSize;
		if (cDiff === 0) {
			nearestKey = k;
			nearestDiff = 0;
			break;
		} else if (nearestKey === undefined) {
			nearestKey = k;
			nearestDiff = cDiff;					
		} else if (cDiff < 0) {
			// k.Image is smaller then targetSize
			if (nearestDiff > 0) {
				// already have a key of something bigger than targetSize so dont take this to holder, as k.Image a smaller
			} else {
				// then nearestDiff in holder is something smaller then targetSize
				// take to holder if this is closer to 0 then nearestDiff
				if (cDiff - targetSize < nearestDiff - targetSize) {
					nearestDiff = cDiff;
					nearestKey = k;
				}
			}
		} else {
			// cDiff is > 0
			if (nearestDiff < 0) {
				// the current in holder is a smaller then targetSize, so lets take this one as its a bigger
				nearestDiff = cDiff;
				nearestKey = k;
			} else {
				//nearestDiff is positive, and so is cDiff // being positive means that the k.thatKey is bigger then targetSize
				//take the key of whichever is closer to target, so whichever is smaller
				if (cDiff < nearestDiff) {
					nearestDiff = cDiff;
					nearestKey = k;
				}
			}
			// bigger then targetSize takes priority so always take it, if its closer then nearestDiff in holder
			if (cDiff - targetSize < nearestDiff - targetSize) {
				nearestDiff = cDiff;
				nearestKey = k;
			}					
		}
	}
	
	console.log('the nearest found is of size: ', nearestKey, 'returning img:', objOfImgs[nearestKey].Image.toString());
	
	return objOfImgs[nearestKey].Image;
}

function makeIcnsOfPaths(paths_base, path_targetDir, saveas_name, paths_badge, doc) {
	// path_targetWithoutExt is path to save it to without the extension. so like `C:\blahFolder\myImage`
	// doc is document element to use for canvas // typically use Services.appShell.hiddenDOMWindow.document for doc
	// paths_base is array of paths, ideally should have 7, but if not it will take the nearest and resize: 16, 32, 64, 128, 256, 512, and 1024px sqaure images
	// paths_badge is array of paths to badge, ideally it should have 6 elements, 512, 256, 128, 64, 32, 16, 8 but its ok to have less, it will be resized
	
	// returns promise, aSuccessVal will be the icoBuffer
	// pathToSaveIt is optional, it is a string path like `OS.Path.join(OS.Constants.Path.desktopDir, 'my.ico')` which tells where to save the ico file

	var deferred_makeIcnsOfPaths_MAIN = new Deferred();
	
	var deferred_makeIcnsOfPaths = new Deferred();
	
	if (!paths_base.length) {
		console.warn('paths_base error: required to have at least one path element');
		deferred_makeIcnsOfPaths_MAIN.reject('paths_base error: required to have at least one path element');
		return deferred_makeIcnsOfPaths_MAIN.promise; // to prevent deeper exec into func
	}
	if (!paths_badge.length) {
		console.warn('paths_badge error: required to have at least one path element');
		deferred_makeIcnsOfPaths_MAIN.reject('paths_badge error: required to have at least one path element');
		return deferred_makeIcnsOfPaths_MAIN.promise; // to prevent deeper exec into func
	}
	
	//algo:		
		// load all image paths, base and badge, and make iconset dir at same time
		// draw nearest sized to canvas, and overlay badge on it also at nearest needed size
		// save drawing to disk as png
		// iconutil
		// delete iconset dir
	
	// start - delete dir
	var delTDir = function() {
		var promise_delIt = OS.File.removeDir(path_dirIconSet, {ignoreAbsent:true, ignorePermissions:false});
		promise_delIt.then(
			function(aVal) {
				console.log('Fullfilled - promise_delIt - ', aVal);
			},
			function(aReason) {
				var rejObj = {name:'promise_delIt', aReason:aReason};
				console.warn('Rejected - promise_delIt - ', rejObj);
				deferred_makeIcnsOfPaths.reject(rejObj);
			}
		).catch(
			function(aCaught) {
				var rejObj = {name:'promise_delIt', aCaught:aCaught};
				console.error('Caught - promise_delIt - ', rejObj);
				deferred_makeIcnsOfPaths.reject(rejObj);
			}
		);
	};
	// end - delete dir
	
	// start - setup runIconutil
	var runIconutil = function() {		
		var iconutil = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
		iconutil.initWithPath('/usr/bin/iconutil');
		
		var proc = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
		proc.init(iconutil);
		
		var procFin = {
			observe: function(aSubject, aTopic, aData) {
				//console.log('incoming procFinOSA', 'aSubject:', aSubject, 'aTopic:', aTopic, 'aData', aData);
				//console.log('incoming procFinOSA unevaled', 'aSubject:', uneval(aSubject), 'aTopic:', uneval(aTopic), 'aData', uneval(aData));
				//console.log('aSubject.exitValue:', aSubject.exitValue);
				if (aSubject.exitValue === 0) {
					console.log('Succesfully ran iconutil as exitValue was 0');
					deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + OS.Path.join(path_targetDir, saveas_name + '.icns') + '"');
				} else {
					// i have only seen it error with exitValue of 1
					console.warn('FAILED to create ICNS, exitValue was something other than 0, it was:', aSubject.exitValue);
					deferred_makeIcnsOfPaths.reject('Fail during running iconutil as exitValue was not 0, it was: ' + aSubject.exitValue);
				}
			}
		};

		var args = ['-c', 'icns', path_dirIconSet];
		proc.runAsync(args, args.length, procFin);
	};
	// end - setup runIconutil
	
	// start - setup convToIcns
	var convToIcns = function() {
		// do convt to icns and on success delete dir
		
		var userAgent = Cc['@mozilla.org/network/protocol;1?name=http'].getService(Ci.nsIHttpProtocolHandler).userAgent;
		console.log('userAgent:', userAgent);
		var version_osx = userAgent.match(/Mac OS X 10\.([\d]+)/);
		console.log('version_osx matched:', version_osx);
		
		if (!version_osx) {
			deferred_makeIcnsOfPaths.reject('Could not identify Mac OS X version.');
			return;
		}
		
		version_osx = parseFloat(version_osx[1]);
		console.log('version_osx parseFloated:', version_osx);
		if (version_osx >= 0 && version_osx < 6) {
			//will never happen, as my min support of profilist is for FF29 which is min of osx10.6
			deferred_makeIcnsOfPaths.reject('OS X < 10.6 is not supported, your version is: ' + version_osx);
		} else if (version_osx >= 6 && version_osx < 7) {
			deferred_makeIcnsOfPaths.reject('Mac OS X 10.6 support coming soon. I need to figure out how to use MacMemory functions then follow the outline here: https://github.com/philikon/osxtypes/issues/3');
		} else if (version_osx >= 7) {
			// ok use iconutil
			runIconutil();
		} else {
			deferred_makeIcnsOfPaths.reject('Some unknown value of version_osx was found:' + version_osx);
		}
		
		//deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + OS.Path.join(path_targetDir, saveas_name + '.icns') + '"');
		//delTDir();
	};
	// end - setup convToIcns
	
	// start - savePngToDisk
	var savePngToDisk = function(size, refDeferred, blob) {
		var sizeToName = {
			'16': ['icon_16x16'],
			'32': ['icon_16x16@2x', 'icon_32x32'],
			'64': ['icon_32x32@2x'],
			'128': ['icon_128x128'],
			'256': ['icon_128x128@2x', 'icon_256x256'],
			'512': ['icon_256x256@2x', 'icon_512x512'],
			'1024': ['icon_512x512@2x']
		};
		console.info('savePngToDisk, this:', this.toString(), 'blob:', blob, 'size:', size, 'refDeferred:', refDeferred);
        var reader = Cc['@mozilla.org/files/filereader;1'].createInstance(Ci.nsIDOMFileReader); //new FileReader();
        reader.onloadend = function() {
            // reader.result contains the ArrayBuffer.
			var promiseAllArr_writePngs = [];
			
			var arrview = new Uint8Array(reader.result);
			
			for (var i=0; i<sizeToName[size].length; i++) {
				var savePth = OS.Path.join(path_dirIconSet, sizeToName[size][i] + '.png');
				promiseAllArr_writePngs.push(tryOsFile_ifDirsNoExistMakeThenRetry('writeAtomic', [savePth, arrview, {tmpPath:savePth+'.tmp', encoding:'utf-8'}], OS.Constants.Path.userApplicationDataDir));
			}
			var promiseAll_writePngs = Promise.all(promiseAllArr_writePngs);
			promiseAll_writePngs.then(
				function(aVal) {
					console.log('Fullfilled - promiseAllArr_writePngs.promise - ', aVal);
					// start - do stuff here - promiseAllArr_writePngs.promise
					refDeferred.resolve('Saved PNG at path: "' + savePth + '"');
					// end - do stuff here - promiseAllArr_writePngs.promise
				},
				function(aReason) {
					var refObj = {name:'promiseAllArr_writePngs.promise', aReason:aReason};
					console.warn('Rejected - promiseAllArr_writePngs.promise - ', refObj);
					refDeferred.reject(refObj);
				}
			).catch(
				function(aCaught) {
					var refObj = {name:'promiseAllArr_writePngs.promise', aCaught:aCaught};
					console.error('Caught - promiseAllArr_writePngs.promise - ', refObj);
					refDeferred.reject(refObj);
				}
			);
        };
		reader.onabort = function() {
			refDeferred.reject('Abortion on nsIDOMFileReader, failed reading blob of size: "' + blob.size + '"');
		};
		reader.onerror = function() {
			refDeferred.reject('Error on nsIDOMFileReader, failed reading blob of size: "' + blob.size + '"');
		};
        reader.readAsArrayBuffer(blob);
	};
	// end - savePngToDisk
	
	// start - setup makeRequiredSizes
	var makeRequiredSizes = function() {
		// draws the base with nearest sized avail, and overlays with badge with nearest sized avail, and makes it a png
		//var promiseAllArr_makeRequiredSizes = [];
		var reqdBaseSizes = [16, 32, 64, 128, 256, 512, 1024];
		var reqdBadgeSize_for_BaseSize = {
			16: 10,
			32: 16,
			64: 32,
			128: 64,
			256: 128,
			512: 256,
			1024: 512
		};

		var promiseAllArr_saveAllPngs = [];
		for (var i=0; i<reqdBaseSizes.length; i++) {
			
			var canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			var ctx = canvas.getContext('2d');
			
			var size = reqdBaseSizes[i];
			canvas.width = size;
			canvas.height = size;
			ctx.clearRect(0, 0, size, size);
			
			// draw nearest sized base img
			var nearestImg = getImg_of_exactOrNearest_Bigger_then_Smaller(size, imgs_base);
			console.info('nearestImg:', nearestImg.toString());
			if (nearestImg.naturalHeight == size) {
				// its exact
				console.log('base is exact at ', nearestImg.naturalHeight , 'so no need to scale, as size it is:', size);
				ctx.drawImage(nearestImg, 0, 0);
			} else {
				// need to scale it
				console.log('scalling base from size of ', nearestImg.naturalHeight , 'to', size);
				ctx.drawImage(nearestImg, 0, 0, size, size);
			}
			
			// overlay nearest sized badge
			var badgeSize = reqdBadgeSize_for_BaseSize[size];
			console.log('badgeSize needed for this size is:', badgeSize, 'size is:', size);
			var nearestImg2 = getImg_of_exactOrNearest_Bigger_then_Smaller(badgeSize, imgs_badge);
			console.info('nearestImg2:', nearestImg2.toString());
			if (nearestImg2.naturalHeight == badgeSize) {
				// its exact
				console.log('badge is exact at ', nearestImg2.naturalHeight, 'so no need to scale, as badgeSize it is:', badgeSize);
				ctx.drawImage(nearestImg2, size-badgeSize, size-badgeSize);
			} else {
				// need to scale it
				console.log('scalling badge from size of ', nearestImg2.naturalHeight, 'to', badgeSize);
				ctx.drawImage(nearestImg2, size-badgeSize, size-badgeSize, badgeSize, badgeSize);
			}
			
			var deferred_savePng = new Deferred();
			promiseAllArr_saveAllPngs.push(deferred_savePng.promise);
			
			(canvas.toBlobHD || canvas.toBlob).call(canvas, savePngToDisk.bind(null, size, deferred_savePng), 'image/png');
		}
		
		var promiseAll_saveAllPngs = Promise.all(promiseAllArr_saveAllPngs);
		promiseAll_saveAllPngs.then(
			function(aVal) {
				console.log('Fullfilled - promiseAll_saveAllPngs - ', aVal);
				// start - do stuff here - promiseAll_saveAllPngs
				convToIcns();
				// end - do stuff here - promiseAll_saveAllPngs
			},
			function(aReason) {
				var refObj = {name:'promiseAll_saveAllPngs', aReason:aReason};
				console.warn('Rejected - promiseAll_saveAllPngs - ', refObj);
				deferred_makeIcnsOfPaths.reject(refObj);
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'promiseAll_saveAllPngs', aCaught:aCaught};
				console.error('Caught - promiseAll_saveAllPngs - ', refObj);
				deferred_makeIcnsOfPaths.reject(refObj);
			}
		);
	};
	// end - setup makeRequiredSizes
	
	// start - make dir and load and verify all imgs
	var loadPathsAndMakeDir = function() {
		var promiseAllArr_makeDirAndLoadImgs = [];
		
		var promise_makeIconSetDir = makeDir_Bug934283(path_dirIconSet, {from:OS.Constants.Path.userApplicationDataDir, unixMode:FileUtils.PERMS_DIRECTORY, ignoreExisting:true});
		promiseAllArr_makeDirAndLoadImgs.push(promise_makeIconSetDir);
		
		var handleImgLoad = function(refDeferred, imgsObj) {
			var theImg = this;
			console.log('Success on load of path: "' + theImg.src + '"');
			if (theImg.naturalHeight != theImg.naturalWidth) {
				console.warn('Unsquare image on path: "' + theImg.src + '"');
				refDeferred.reject('Unsquare image on paths: "' + theImg.src + '"');
			} else if (theImg.naturalHeight in imgsObj) {
				console.warn('Multiple images with same size on path: "' + theImg.src + '"');
				refDeferred.reject('Multiple images with same size on path: "' + theImg.src + '"');
			} else {
				imgsObj[theImg.naturalHeight] = {Image:theImg};
				refDeferred.resolve('Success on load of path: "' + theImg.src + '"');
			}
		};
		
		var handleImgAbort = function(refDeferred) {
			var theImg = this;
			console.warn('Abortion on load of path: "' + theImg.src + '"');
			refDeferred.reject('Abortion on load of path: "' + theImg.src + '"');
		};
		
		var handleImgError = function(refDeferred) {
			var theImg = this;
			console.warn('Error on load of path: "' + theImg.src + '"');
			refDeferred.reject('Error on load of path: "' + theImg.src + '"');
		};
		
		// load paths_base and paths_badge
		var paths_concatenated = [];
		for (var i=0; i<paths_base.length; i++) {
			paths_concatenated.push({
				imgsObj: imgs_base,
				path: paths_base[i]
			});
		}
		for (var i=0; i<paths_badge.length; i++) {
			paths_concatenated.push({
				imgsObj: imgs_badge,
				path: paths_badge[i]
			});
		}
		console.info('paths_concatenated:', paths_concatenated.toString());
		for (var i=0; i<paths_concatenated.length; i++) {
			var deferred_loadImg = new Deferred();
			promiseAllArr_makeDirAndLoadImgs.push(deferred_loadImg.promise);
			
			var img = new doc.defaultView.Image();
			img.onload = handleImgLoad.bind(img, deferred_loadImg, paths_concatenated[i].imgsObj);
			img.onabort = handleImgAbort.bind(img, deferred_loadImg);
			img.onerror = handleImgError.bind(img, deferred_loadImg);
			
			console.info('img.src:', OS.Path.toFileURI(paths_concatenated[i].path));
			img.src = OS.Path.toFileURI(paths_concatenated[i].path);
		}
		
		//console.info('paths_concatenated:', paths_concatenated);
		//console.info('deferreds_loadImgs:', deferreds_loadImgs);
		
		var promiseAll_makeDirAndLoadImgs = Promise.all(promiseAllArr_makeDirAndLoadImgs);
		promiseAll_makeDirAndLoadImgs.then(
			function(aVal) {
				console.log('Fullfilled - promiseAll_makeDirAndLoadImgs - ', aVal);
				// do stuff here
				console.info('imgs_base:', imgs_base.toString());
				console.info('imgs_badge:', imgs_badge.toString());
				makeRequiredSizes();
				//deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + OS.Path.join(path_targetDir, saveas_name + '.icns') + '"'); // debug trying to find the "A promise chain failed to handle a rejection. Did you forget to '.catch', or did you forget to 'return'?"
				// end do stuff here
			},
			function(aReason) {
				var rejObj = {name:'promiseAll_makeDirAndLoadImgs', aReason:aReason};
				console.warn('Rejected - promiseAll_makeDirAndLoadImgs - ', rejObj);
				deferred_makeIcnsOfPaths.reject(rejObj);
			}
		).catch(
			function(aCaught) {
				var rejObj = {name:'promiseAll_makeDirAndLoadImgs', aCaught:aCaught};
				console.error('Caught - promiseAll_makeDirAndLoadImgs - ', rejObj);
				deferred_makeIcnsOfPaths.reject(rejObj);
			}
		);
	};
	// end - make dir and load all imgs
	
	// start - func globals
	// vars used by multiple the funcs defined in this function
	var imgs_base = {};
	var imgs_badge = {};
	var path_dirIconSet = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profilist_data', 'launcher_icons', saveas_name + '.iconset');
	// end - func globals
	
	loadPathsAndMakeDir();
	//deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + OS.Path.join(path_targetDir, saveas_name + '.icns') + '"'); // debug trying to find the "A promise chain failed to handle a rejection. Did you forget to '.catch', or did you forget to 'return'?"
	//return deferred_makeIcnsOfPaths.promise;
	
	deferred_makeIcnsOfPaths.promise.then(
		function(aVal) {
			console.log('Fullfilled - deferred_makeIcnsOfPaths.promise - ', aVal);
			// start - do stuff here - deferred_makeIcnsOfPaths.promise
			deferred_makeIcnsOfPaths_MAIN.resolve(aVal);
			delTDir();
			// end - do stuff here - deferred_makeIcnsOfPaths.promise
		},
		function(aReason) {
			delTDir();
			var refObj = {name:'deferred_makeIcnsOfPaths.promise', aReason:aReason};
			console.warn('Rejected - deferred_makeIcnsOfPaths.promise - ', refObj);
			deferred_makeIcnsOfPaths_MAIN.reject(refObj);
		}
	).catch(
		function(aCaught) {
			delTDir();
			var refObj = {name:'deferred_makeIcnsOfPaths.promise', aCaught:aCaught};
			console.error('Caught - deferred_makeIcnsOfPaths.promise - ', refObj);
			deferred_makeIcnsOfPaths_MAIN.reject(refObj);
		}
	);
	
	return deferred_makeIcnsOfPaths_MAIN.promise;
	
}

function doit() {
	var promiseAllArr_collectPaths = [];
	
	var promise_basePaths = immediateChildPaths(OS.Path.join(OS.Constants.Path.desktopDir, 'ff-channel-base-iconsets', 'nightly'));
	promiseAllArr_collectPaths.push(promise_basePaths);
	
	var promise_badgePaths = immediateChildPaths(OS.Path.join(OS.Constants.Path.desktopDir, 'badge_iconsets', 'badge1234'));
	promiseAllArr_collectPaths.push(promise_badgePaths);
	
	var promiseAll_collectPaths = Promise.all(promiseAllArr_collectPaths);
	
	promiseAll_collectPaths.then(
		function(aVal) {
			console.log('Fullfilled - promiseAll_collectPaths - ', aVal);
			// do stuff here - promiseAll_collectPaths
			var promise_makeIcns = makeIcnsOfPaths(aVal[0], OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profilist_data', 'launcher_icons'), 'myGenIcns', aVal[1], Services.appShell.hiddenDOMWindow.document);
			promise_makeIcns.then(
				function(aVal) {
					console.log('Fullfilled - promise_makeIcns - ', aVal);
					// start - do stuff here - promise_makeIcns
					Services.prompt.alert(null, 'icns made', 'done made icns you can use it now');
					// end - do stuff here - promise_makeIcns
				},
				function(aReason) {
					var rejObj = {name:'promise_makeIcns', aReason:aReason};
					console.error('Rejected - promise_makeIcns - ', rejObj);
					Services.prompt.alert(null, 'icns failed', 'icns generation failed see browser console');
				}
			).catch(
				function(aCaught) {
					var rejObj = {name:'promise_makeIcns', aCaught:aCaught};
					console.error('Caught - promise_makeIcns - ', rejObj);
					Services.prompt.alert(null, 'icns failed', 'icns generation errored see browser console');
				}
			);
			// end do stuff here - promiseAll_collectPaths
		},
		function(aReason) {
			var rejObj = {name:'promiseAll_collectPaths', aReason:aReason};
			console.error('Rejected - promiseAll_collectPaths - ', rejObj);
			Services.prompt.alert(null, 'failed', 'failed to collect paths see browser console');
		}
	).catch(
		function(aCaught) {
			var rejObj = {name:'promiseAll_collectPaths', aCaught:aCaught};
			console.error('Caught - promiseAll_collectPaths - ', rejObj);
			Services.prompt.alert(null, 'errored', 'errored to collect paths see browser console');
		}
	);
}

doit();