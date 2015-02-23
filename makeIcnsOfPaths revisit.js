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
			var refObj = {name:'promise_collectChildPaths', aReason:aReason};
			console.warn('Rejected - promise_collectChildPaths - ', refObj);
			deferred_immediateChildPaths.reject(refObj);
		}
	).catch(
		function(aCaught) {
			var refObj = {name:'promise_collectChildPaths', aCaught:aCaught};
			console.error('Caught - promise_collectChildPaths - ', refObj);
			deferred_immediateChildPaths.reject(refObj);
		}
	);
	
	return deferred_immediateChildPaths.promise;
}
// end - common helper functions

function makeIcnsOfPaths(paths_base, path_targetDir, saveas_name, paths_badge, doc) {
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
		return deferred_makeIcnsOfPaths.promise; // to prevent deeper exec into func
	}
	if (!paths_badge.length) {
		console.warn('paths_badge error: required to have at least one path element');
		deferred_makeIcnsOfPaths.reject('paths_badge error: required to have at least one path element');
		return deferred_makeIcnsOfPaths.promise; // to prevent deeper exec into func
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
	var savePngToDisk = function(blob, ref_deferred, path_thisPng) {		
        var reader = Cc['@mozilla.org/files/filereader;1'].createInstance(Ci.nsIDOMFileReader); //new FileReader();
        reader.onloadend = function() {
            // reader.result contains the ArrayBuffer.
			var promise_makePng = tryOsFile_ifDirsNoExistMakeThenRetry('writeAtomic', [path_thisPng, new Uint8Array(reader.result), {tmpPath:path_thisPng + '.tmp', encoding:'utf-8'}], OS.Constants.Path.userApplicationDataDir);
			promise_makePng.then(
				function(aVal) {
					console.log('Fullfilled - promise_makePng - ', aVal);
					// start - do stuff here - promise_makePng
					ref_deferred.resolve('Saved png at path: "' + path_thisPng + '"');
					// end - do stuff here - promise_makePng
				},
				function(aReason) {
					var refObj = {name:'promise_makePng', aReason:aReason};
					console.warn('Rejected - promise_makePng - ', refObj);
					ref_deferred.reject(refObj);
				}
			).catch(
				function(aCaught) {
					var refObj = {name:'promise_makePng', aCaught:aCaught};
					console.error('Caught - promise_makePng - ', refObj);
					ref_deferred.reject(refObj);
				}
			);
        };
        reader.readAsArrayBuffer(blob);
	};
	// end - savePngToDisk
	
	// start - setup convToIcns
	var convToIcns = function() {
		// do convt to icns and on success delete dir
		deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + OS.Path.join(path_targetDir, saveas_name + '.icns') + '"');
		//delTDir();
	};
	// end - setup convToIcns
	
	// start - setup makeRequiredSizes
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
		var getImg_of_exactOrNearest_Bigger_then_Smaller = function(targetSize, objOfImgs) {
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
						// already have a key of something bigger than targetSize so dont take this to holder
					} else {
						// then nearestDiff in holder is something smaller then targetSize
						// take to holder if this is closer to 0 then nearestDiff
						if (Math.abs(cDiff - targetSize) < Math.abs(nearestDiff - targetSize)) {
							nearestDiff = cDiff;
							nearestKey = k;
						}
					}
				} else {
					// cDiff is > 0
					// bigger then targetSize takes priority so always take it, if its closer then nearestDiff in holder
					if (Math.abs(cDiff - targetSize) < Math.abs(nearestDiff - targetSize)) {
						nearestDiff = cDiff;
						nearestKey = k;
					}					
				}
			}
			
			console.log('the nearest found is of size: ', nearestKey, 'returning img:', objOfImgs[nearestKey].Image);
			
			return objOfImgs[nearestKey].Image;
		};
		
		for (var i=0; i<reqdBaseSizes.length; i++) {
			
			let canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			let ctx = canvas.getContext('2d');
			
			let size = reqdBaseSizes[i];
			canvas.width = size;
			canvas.height = size;
			ctx.clearRect(0, 0, size, size);
			
			// draw nearest sized base img
			let nearestImg = getImg_of_exactOrNearest_Bigger_then_Smaller(size, imgs_base);
			console.info('nearestImg:', nearestImg);
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
			let badgeSize = reqdBadgeSize_for_BaseSize[size];
			console.log('badgeSize needed for this size is:', badgeSize, 'size is:', size);
			let nearestImg2 = getImg_of_exactOrNearest_Bigger_then_Smaller(badgeSize, imgs_badge);
			console.info('nearestImg2:', nearestImg2);
			if (nearestImg2.naturalHeight == badgeSize) {
				// its exact
				console.log('badge is exact at ', nearestImg2.naturalHeight, 'so no need to scale, as badgeSize it is:', badgeSize);
				ctx.drawImage(nearestImg2, size-badgeSize, size-badgeSize);
			} else {
				// need to scale it
				console.log('scalling badge from size of ', nearestImg2.naturalHeight, 'to', badgeSize);
				ctx.drawImage(nearestImg2, size-badgeSize, size-badgeSize, badgeSize, badgeSize);
			}
			
			let deferred_saveThisImage = new Deferred();
			(canvas.toBlobHD || canvas.toBlob).call(canvas, function(b) { savePngToDisk(b, deferred_saveThisImage, OS.Path.join(path_dirIconSet, saveas_name + '_' + size + '.png')); }, 'image/png');
			
			promiseAllArr_makeRequiredSizes.push(deferred_saveThisImage.promise);
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
	var loadPathsAndMakeDir = function() {
		var promiseAllArr_makeDirAndLoadImgs = [];
		
		var path_dirIconSet = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profilist_data', 'launcher_icons', saveas_name + ' iconset');
		var promise_makeIconSetDir = makeDir_Bug934283(path_dirIconSet, {from:OS.Constants.Path.userApplicationDataDir, unixMode:FileUtils.PERMS_DIRECTORY, ignoreExisting:true});
		promiseAllArr_makeDirAndLoadImgs.push(promise_makeIconSetDir);
		
		var handleImgLoad = function() {
			var theImg = this;
			var k = theImg.src;
			console.log('handleImgLoad - k:', k);
			deferreds_loadImgs[k].resolve('loaded');
			/*
			console.log('Success on load of pathsArr[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
			if (theImg.naturalHeight != theImg.naturalWidth) {
				console.warn('Unsquare image on pathsArr[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
				deferreds_loadImgs[k].reject('Unsquare image on pathsArr[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
			} else if (theImg.naturalHeight in paths_concatenated[k].imgsObj) {
				console.warn('Multiple images with same size on pathsArr[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
				deferreds_loadImgs[k].reject('Multiple images with same size on pathsArr[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');				
			} else {
				paths_concatenated[k].imgsObj[theImg.naturalHeight] = {Image:theImg};
				deferreds_loadImgs[k].resolve('Success on load of pathsArr[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
			}
			*/
		};
		
		var handleImgAbort = function() {
			var theImg = this;
			var k = theImg.src;
			
			console.error('handleImgAbort - k:', k);
			deferreds_loadImgs[k].reject('aborted');
			/*
			console.warn('Abortion on load of paths_base[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
			deferreds_loadImgs[k].reject('Abortion on load of paths_base[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
			*/
		};
		
		var handleImgError = function() {
			var theImg = this;
			var k = theImg.src;
			
			console.error('handleImgError - k:', k);
			deferreds_loadImgs[k].reject('errored');
			/*
			console.warn('Error on load of paths_base[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
			deferreds_loadImgs[k].reject('Error on load of paths_base[' + paths_concatenated[k].iInPathArr + ']: "' + paths_concatenated[k].pathArr[paths_concatenated[k].iInPathArr] + '"');
			*/
		};
		
		// load paths_base and paths_badge
		var paths_concatenated = {};
		for (var i=0; i<paths_base.length; i++) {
			var imgIdentif = OS.Path.toFileURI(paths_base[i]) + '#' + Math.random(); //also file path
			paths_concatenated[imgIdentif] = {
				pathArr: paths_base,
				imgsObj: imgs_base,
				iInPathArr: i
			};
		}
		for (var i=0; i<paths_badge.length; i++) {
			var imgIdentif = OS.Path.toFileURI(paths_badge[i]) + '#' + Math.random(); //also file path
			paths_concatenated[imgIdentif] = {
				pathArr: paths_badge,
				imgsObj: imgs_badge,
				iInPathArr: i
			};
		}
		console.info('paths_concatenated:', paths_concatenated);
		var deferreds_loadImgs = {};
		for (var k in paths_concatenated) {			
			deferreds_loadImgs[k] = new Deferred();
			promiseAllArr_makeDirAndLoadImgs.push(deferreds_loadImgs[k].promise);
			/// guessssing
			deferreds_loadImgs[k].promise.then(
				function(aVal) {
					console.log('Fullfilled - deferreds_loadImgs[k].promise - ', aVal);
					// start - do stuff here - deferreds_loadImgs[k].promise
					// end - do stuff here - deferreds_loadImgs[k].promise
				},
				function(aReason) {
					var refObj = {name:'deferreds_loadImgs[k].promise', aReason:aReason};
					console.error('Rejected - deferreds_loadImgs[k].promise - ', refObj);
				}
			).catch(
				function(aCaught) {
					var refObj = {name:'deferreds_loadImgs[k].promise', aCaught:aCaught};
					console.error('Caught - deferreds_loadImgs[k].promise - ', refObj);
				}
			);
			/// end guessssing
			
			var img = new doc.defaultView.Image();
			img.onload = handleImgLoad; //function(ii) { try { handleImgLoad(img, paths_concatenated[ii].pathArr, paths_concatenated[ii].iInPathArr, paths_concatenated[ii].imgObj, deferred_imgLoad); } catch (ex) { console.error('ex caught:', ex); deferred_imgLoad.reject(ex); } }.bind(null, i);
			img.onabort = handleImgAbort; //function(ii) { try { handleImgAbort(paths_concatenated[ii].pathArr, paths_concatenated[ii].iInPathArr, deferred_imgLoad); } catch (ex) { console.error('ex caught:', ex); deferred_imgLoad.reject(ex); } }.bind(null, i);
			img.onerror = handleImgError; //function(ii) { try { handleImgError(paths_concatenated[ii].pathArr, paths_concatenated[ii].iInPathArr, deferred_imgLoad); } catch (ex) { console.error('ex caught:', ex); deferred_imgLoad.reject(ex); } }.bind(null, i);
			img.src = k;
				
		}
		
		console.info('paths_concatenated:', paths_concatenated);
		console.info('deferreds_loadImgs:', deferreds_loadImgs);
		
		var promiseAll_makeDirAndLoadImgs = Promise.all(promiseAllArr_makeDirAndLoadImgs);
		promiseAll_makeDirAndLoadImgs.then(
			function(aVal) {
				console.log('Fullfilled - promiseAll_makeDirAndLoadImgs - ', aVal);
				// do stuff here
				console.info('imgs_base:', imgs_base);
				console.info('imgs_badge:', imgs_badge);
				//makeRequiredSizes();
				deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + OS.Path.join(path_targetDir, saveas_name + '.icns') + '"'); // debug trying to find the "A promise chain failed to handle a rejection. Did you forget to '.catch', or did you forget to 'return'?"
				// end do stuff here
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
	};
	// end - make dir and load all imgs
	
	// start - func globals
	// vars used by all the funcs defined in this function
	var imgs_base = {};
	var imgs_badge = {};
	// end - func globals
	
	loadPathsAndMakeDir();
	//deferred_makeIcnsOfPaths.resolve('ICNS succesfully made at path: "' + OS.Path.join(path_targetDir, saveas_name + '.icns') + '"'); // debug trying to find the "A promise chain failed to handle a rejection. Did you forget to '.catch', or did you forget to 'return'?"
	return deferred_makeIcnsOfPaths.promise;
	
}

function doit() {
	var promiseAllArr_collectPaths = [];
	
	var promise_basePaths = immediateChildPaths('C:\\Users\\Vayeate\\Documents\\GitHub\\Profilist\\ff-channel-base-iconsets\\nightly');
	promiseAllArr_collectPaths.push(promise_basePaths);
	
	var promise_badgePaths = immediateChildPaths('C:\\Users\\Vayeate\\Desktop\\badge_iconsets\\badge1234');
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

doit();