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
		throw new Error('you have no need to use this, as this is meant to allow creation from a folder that you know for sure exists');
	}

	if (path.toLowerCase().indexOf(options.from.toLowerCase()) == -1) {
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
				var refObj = {name:'promise_makeDir', aCaught:aCaught};
				console.error('Caught - promise_makeDir - ', refObj);
				deferred_makeDir_Bug934283.reject(refObj); // throw aCaught;
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
		return; //just to exit further execution
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
				var refObj = {name:'promise_retryAttempt', aReason:aReason};
				console.warn('Rejected - promise_retryAttempt - ', refObj);
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(refObj); //throw refObj;
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'promise_retryAttempt', aCaught:aCaught};
				console.error('Caught - promise_retryAttempt - ', refObj);
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(refObj); // throw aCaught;
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
				var refObj = {name:'promise_makeDirsRecurse', aReason:aReason};
				console.warn('Rejected - promise_makeDirsRecurse - ', refObj);
				if (aReason.becauseNoSuchFile) {
					console.log('make dirs then do retryAttempt');
					makeDirs();
				} else {
					// did not get becauseNoSuchFile, which means the dirs exist (from my testing), so reject with this error
					deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(refObj); //throw refObj;
				}
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'promise_makeDirsRecurse', aCaught:aCaught};
				console.error('Caught - promise_makeDirsRecurse - ', refObj);
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(refObj); // throw aCaught;
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
			var refObj = {name:'promise_initialAttempt', aReason:aReason};
			console.warn('Rejected - promise_initialAttempt - ', refObj);
			if (aReason.becauseNoSuchFile) {
				console.log('make dirs then do secondAttempt');
				makeDirs();
			} else {
				deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(refObj); //throw refObj;
			}
		}
	).catch(
		function(aCaught) {
			var refObj = {name:'promise_initialAttempt', aCaught:aCaught};
			console.error('Caught - promise_initialAttempt - ', refObj);
			deferred_tryOsFile_ifDirsNoExistMakeThenRetry.reject(refObj); // throw aCaught;
		}
	);
	
	
	return deferred_tryOsFile_ifDirsNoExistMakeThenRetry.promise;
}
function immediateChildPaths(path_dir) {
	// returns promise
	// path_dir is string to path of dir
	// resolves to hold array of all paths that are immediate children of path_dir
	//var deferred_immediateChildPaths = new Deferred();
	
	var paths_children = [];
	var callback_collectChildPaths = function(entry) {
		paths_children.push(entry.path);
	};
	
	var itr_pathDir = new OS.File.DirectoryIterator(path_dir);
	var promise_collectChildPaths = itr_pathDir.forEach(callback_collectChildPaths);
	return promise_collectChildPaths;
	
	//return deferred_immediateChildPaths.promise;
}
// end - common helper functions

function makeIcnsOfPaths(paths_base, path_targetWithoutExt, paths_badge, doc) {
	// path_targetWithoutExt is path to save it to without the extension. so like `C:\blahFolder\myImage`
	// doc is document element to use for canvas // typically use Services.appShell.hiddenDOMWindow.document for doc
	// paths_base is array of paths, ideally should have 7, but if not it will take the nearest and resize: 16, 32, 64, 128, 256, 512, and 1024px sqaure images
	// paths_badge is array of paths to badge, ideally it should have 6 elements, 512, 256, 128, 64, 32, 16, 8 but its ok to have less, it will be resized
	
	// returns promise, aSuccessVal will be the icoBuffer
	// pathToSaveIt is optional, it is a string path like `OS.Path.join(OS.Constants.Path.desktopDir, 'my.ico')` which tells where to save the ico file

	var deferred_makeIcnsOfPaths = new Deferred();
	
	if (!paths_base.length) {
		console.warn('paths_base error: required to have at least one path element');
		deferred_makeIcnsOfPaths.reject('paths_base error: required to have at least one path element');
		return; // to prevent deeper exec into func
	}
	if (!paths_badge.length) {
		console.warn('paths_badge error: required to have at least one path element');
		deferred_makeIcnsOfPaths.reject('paths_badge error: required to have at least one path element');
		return; // to prevent deeper exec into func
	}
	
	//algo:
		// load all paths_base and paths_badge and arrange into object // in parallel with makeIconSetDir [promiseAllArr_makeDirAndLoadImgs]
		// then draw to canvas the nearest size, if there is one smaller and one bigger, take the bigger one as scalling big to small is much better for quality [promise_makeRequiredSizes]
		//then iconutil
		//then ensure exists
		//then delete iconset dir
	
	// start - delete dir
	var delTDir = function() {
		var promise_delIt = OS.File.removeDir(path_dirIconSet, {ignoreAbsent:true, ignorePermissions:false});
		promise_delIt.then(
			function(aVal) {
				console.log('Fullfilled - promise_delIt - ', aVal);
			},
			function(aReason) {
				var refObj = {name:'promise_delIt', aReason:aReason};
				console.warn('Rejected - promise_delIt - ', refObj);
				deferred_makeIcnsOfPaths.reject(refObj);
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'promise_delIt', aCaught:aCaught};
				console.error('Caught - promise_delIt - ', refObj);
				deferred_makeIcnsOfPaths.reject(refObj);
			}
		);
	};
	// end - delete dir
	
	// start - savePngToDisk
	
	// end - savePngToDisk
	
	// start - setup convToIcns
	var convToIcns = function() {
		// do convt to icns and on success delete dir
		deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + path_targetWithoutExt + '.icns"');
		delTDir();
	};
	// end - setup convToIcns
	
	// start - setup makeRequiredSizes
	var imgs_final = {};
	var makeRequiredSizes = function() {
		// draws the base with nearest sized avail, and overlays with badge with nearest sized avail, and makes it a png
		var promiseAllArr_makeRequiredSizes = [];
		
		var reqdBaseSizes = [16, 32, 64, 128, 256, 512, 1024];
		var reqdBadgeSize_for_BaseSize = {
			16: 8,
			32: 16,
			64: 32,
			128: 64,
			256: 128,
			512: 256,
			1024: 512
		};
		var canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		var ctx = canvas.getContext('2d');
		
		var getImg_of_exactOrNearest_Bigger_then_Smaller = function(targetSize, objOfImgs) {
			//objOfImgs should have key of the size of the image. the size of the img should be square. and each item should be an object of {Image:Image()}
			var nearestDiff_Smaller = 999999;
			var nearestDiff_Bigger = 999999;
			var sizeOfNearestSmaller = 0; //key of image that is exact size or nearest and greater (if nothing greater, then its the nearest thats lesser) // size of the image to take is also the key, as thats how i stored them in imgs_base and imgs_badge
			var sizeOfNearestBigger = 0;
			var keyOfExact = null;
			var keyOfNearestSmaller = null;
			var keyOfNearestBigger = null;
			for (var k in objOfImgs) {
				if (k == targetSize) {
					keyOfExact = k;
					break;
				}
				if (k < targetSize) {
					if (Math.abs(targetSize - k) < nearestDiff_Smaller) {
						nearestDiff_Smaller = Math.abs(targetSize - k);
						sizeOfNearestSmaller = k;
						keyOfNearestSmaller = k;
					}
				} else {
					// its greater obviously, as if it was == i took it and break'ed
					if (Math.abs(targetSize - k) < nearestDiff_Bigger) {
						nearestDiff_Bigger = Math.abs(targetSize - k);
						sizeOfNearestBigger = k;
						keyOfNearestBigger = k;
					}					
				}
			}
			
			if (keyOfExact !== null) {
				return objOfImgs[keyOfExact].Image;
			} else if (keyOfNearestBigger !== null) {
				return objOfImgs[keyOfNearestBigger].Image;
			} else {
				// use smaller as bigger and exact is not available. and smaller has to be available, as theres gotta be at least one image
				return objOfImgs[keyOfNearestSmaller].Image;
			}
		};
		
		for (var i=0; i<reqdBaseSizes.length; i++) {
			var size = reqdBaseSizes[i];
			canvas.width = size;
			canvas.height = size;
			ctx.clearRect(0, 0, size, size);
			
			// draw nearest sized base img
			var nearestImg = getImg_of_exactOrNearest_Bigger_then_Smaller(size, imgs_base);
			if (nearestImg.naturalHeight == size) {
				// its exact
				ctx.drawImage(nearestImg, 0, 0);
			} else {
				// need to scale it
				ctx.drawImage(nearestImg, 0, 0, size, size);
			}
			
			// overlay nearest sized badge
			var badgeSize = reqdBadgeSize_for_BaseSize[size];
			nearestImg = getImg_of_exactOrNearest_Bigger_then_Smaller(badgeSize, imgs_badge);
			if (nearestImg.naturalHeight == badgeSize) {
				// its exact
				ctx.drawImage(nearestImg, size-nearestImg.naturalWidth, size-nearestImg.naturalHeight);
			} else {
				// need to scale it
				ctx.drawImage(nearestImg, size-nearestImg.naturalWidth, size-nearestImg.naturalHeight, badgeSize, badgeSize);
			}
			
			//(canvas.toBlobHD || canvas.toBlob).call(canvas, savePngToDisk, 'image/png');
			var path_thisPng = path_targetWithoutExt + '.png';
			let promise_makePng = ('writeAtomic', [path_thisPng, writeStrJoined, {tmpPath:path_thisPng + '.tmp', encoding:'utf-8'}], OS.Constants.Path.userApplicationDataDir);
			
			promiseAllArr_makeRequiredSizes.push(promise_makePng);
		}
		
		var promiseAll_makeRequiredSizes = Promise.all(promiseAllArr_makeRequiredSizes);
		promiseAll_makeRequiredSizes.then(
			function(aVal) {
				console.log('Fullfilled - promiseAll_makeRequiredSizes - ', aVal);
				// do stuff here
				convToIcns();
			},
			function(aReason) {
				var refObj = {name:'promiseAll_makeRequiredSizes', aReason:aReason};
				console.warn('Rejected - promiseAll_makeRequiredSizes - ', refObj);
				deferred_makeIcnsOfPaths.reject(refObj);
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'promiseAll_makeRequiredSizes', aCaught:aCaught};
				console.error('Caught - promiseAll_makeRequiredSizes - ', refObj);
				deferred_makeIcnsOfPaths.reject(refObj);
			}
		);
	};
	// end - setup makeRequiredSizes
	
	// start - make dir and load all imgs
	var promiseAllArr_makeDirAndLoadImgs = [];
	
	var path_dirIconSet = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profilist_data', 'launcher_icons');
	var promise_makeIconSetDir = makeDir_Bug934283(path_dirIconSet, {from:OS.Constants.Path.userApplicationDataDir, unixMode:FileUtils.PERMS_DIRECTORY, ignoreExisting:true});
	promiseAllArr_makeDirAndLoadImgs.push(promise_makeIconSetDir);
	
	var imgs_base = {};
	var imgs_badge = {};
	
	// load paths_base
	for (var i=0; i<paths_base.length; i++) {
		let iHoisted = i;
		let deferred_imgLoad = new Deferred();
		promiseAllArr_makeDirAndLoadImgs.push(deferred_imgLoad.promise);
		
		let img = new doc.defaultView.Image();
		img.onload = function() {
			console.log('Success on load of paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
			if (img.naturalHeight != img.naturalWidth) {
				console.warn('Unsquare image on paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
				deferred_imgLoad.reject('Unsquare image on paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
			} else {
				imgs_base[img.naturalHeight] = {Image:img};
				deferred_imgLoad.resolve('Success on load of paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
			}
		};
		img.onabort = function() {
			console.warn('Abortion on load of paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
			defer_loadPathToImg.reject('Abortion on load of paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
		};
		img.onerror = function() {
			console.warn('Error on load of paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
			defer_loadPathToImg.reject('Error on load of paths_base[' + iHoisted + ']: "' + paths_base[iHoisted] + '"');
		};
		img.src = paths_base[iHoisted];
	}
	
	// load paths_badge
	for (var i=0; i<paths_badge.length; i++) {
		let iHoisted = i;
		let deferred_imgLoad = new Deferred();
		promiseAllArr_makeDirAndLoadImgs.push(deferred_imgLoad.promise);
		
		let img = new doc.defaultView.Image();
		img.onload = function() {
			console.log('Success on load of paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
			if (img.naturalHeight != img.naturalWidth) {
				console.warn('Unsquare image on paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
				deferred_imgLoad.reject('Unsquare image on paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
			} else {
				imgs_badge[img.naturalHeight] = {Image:img};
				deferred_imgLoad.resolve('Success on load of paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
			}
		};
		img.onabort = function() {
			console.warn('Abortion on load of paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
			defer_loadPathToImg.reject('Abortion on load of paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
		};
		img.onerror = function() {
			console.warn('Error on load of paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
			defer_loadPathToImg.reject('Error on load of paths_badge[' + iHoisted + ']: "' + paths_badge[iHoisted] + '"');
		};
		img.src = paths_badge[iHoisted];
	}
	
	var promiseAll_makeDirAndLoadImgs = Promise.all(promiseAllArr_makeDirAndLoadImgs);
	promiseAll_makeDirAndLoadImgs.then(
		function(aVal) {
			console.log('Fullfilled - promiseAll_makeDirAndLoadImgs - ', aVal);
			// do stuff here
		},
		function(aReason) {
			var refObj = {name:'promiseAll_makeDirAndLoadImgs', aReason:aReason};
			console.warn('Rejected - promiseAll_makeDirAndLoadImgs - ', refObj);
			deferred_makeIcnsOfPaths.reject(refObj);
		}
	).catch(
		function(aCaught) {
			var refObj = {name:'promiseAll_makeDirAndLoadImgs', aCaught:aCaught};
			console.error('Caught - promiseAll_makeDirAndLoadImgs - ', refObj);
			deferred_makeIcnsOfPaths.reject(refObj);
		}
	);
	// end - make dir and load all imgs
	
	return deferred_makeIcnsOfPaths.promise;
	
}

function doit() {
	var promiseAllArr_collectPaths = [];
	
	var promise_basePaths = immediateChildPaths();
	promiseAllArr_collectPaths.push(promise_basePaths);
	
	var promise_badgePaths = immediateChildPaths();
	promiseAllArr_collectPaths.push(promise_badgePaths);
	
	var promiseAll_collectPaths = Promise.all(promiseAllArr_collectPaths);
	
	promiseAll_collectPaths.then(
		function(aVal) {
			console.log('Fullfilled - promiseAll_collectPaths - ', aVal);
			// do stuff here - promiseAll_collectPaths
			/* debug collect paths
			var promise_makeIcns = makeIcnsOfPaths(aVal[0], OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profilist_data', 'launcher_icons', 'myGenIcn'), aVal[1], Services.appShell.hiddenDOMWindow.document);
			promise_makeIcns.then(
				function(aVal) {
					console.log('Fullfilled - promise_makeIcns - ', aVal);
					// start - do stuff here - promise_makeIcns
					Services.prompt.alert(null, 'icns made', 'done made icns you can use it now');
					// end - do stuff here - promise_makeIcns
				},
				function(aReason) {
					var refObj = {name:'promise_makeIcns', aReason:aReason};
					console.error('Rejected - promise_makeIcns - ', refObj);
					Services.prompt.alert(null, 'icns failed', 'icns generation failed see browser console');
				}
			).catch(
				function(aCaught) {
					var refObj = {name:'promise_makeIcns', aCaught:aCaught};
					console.error('Caught - promise_makeIcns - ', refObj);
					Services.prompt.alert(null, 'icns failed', 'icns generation errored see browser console');
				}
			);
			*/
			// end do stuff here - promiseAll_collectPaths
		},
		function(aReason) {
			var refObj = {name:'promiseAll_collectPaths', aReason:aReason};
			console.error('Rejected - promiseAll_collectPaths - ', refObj);
			Services.prompt.alert(null, 'failed', 'failed to collect paths see browser console');
		}
	).catch(
		function(aCaught) {
			var refObj = {name:'promiseAll_collectPaths', aCaught:aCaught};
			console.error('Caught - promiseAll_collectPaths - ', refObj);
			Services.prompt.alert(null, 'errored', 'errored to collect paths see browser console');
		}
	);
}