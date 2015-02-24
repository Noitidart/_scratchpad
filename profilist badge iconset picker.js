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
// end - common helper functions

function showPick(win) {
	// returns nothing
	var deferred_badgeProcess;
	var msgsToUser = [];
	var reqdSizes = [16, 32, 64, 128, 256, 512]; //for mac
	var uniqueName = new Date().getTime() + '';
	var destPathBase = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profilist_data', 'badge_iconsets', uniqueName, uniqueName); //without the extensions
	var fromPathBase = OS.Constants.Path.userApplicationDataDir; // for dir recurse
	var fileUri_to_platformPath = {};
	// load imgs, if any error, notify user
		// do OS.File.copy on paths of images that meet exact size
		// scale the ones that dont meet exact size from nearestSized then OS.File.writeAtomic, and keep a record of this, i want to notify user that badges were made but X Y and Z had to be scaled so suffer suboptimal quality
	var collectionImgs = {}; // with key equal to size
	
	// start - setup image load stuff
	var handleImgLoad = function(refDeffered) {
		var img = this;
		var platformPath = fileUri_to_platformPath[img.src];
		var imgBaseName = OS.Path.basename(platformPath);
		
		if (this.naturalHeight != this.naturalWidth) {
			msgsToUser.push('Did not use "' + imgBaseName + '" as it is unsquare, image must have same height and width.');
		} else if (this.naturalHeight in collectionImgs) {
			var alreadyExistingImgBaseName = OS.Path.basename(fileUri_to_platformPath[collectionImgs[this.naturalHeight].Image.src]);
			msgsToUser.push('Did not use "' + imgBaseName + '" has same size as "' + alreadyExistingImgBaseName + '".');
		} else {
			collectionImgs[this.naturalHeight] = {
				platformPath: platformPath,
				Image: img
			};
		}
		
		refDeffered.resolve('Loaded: "' + img.src + '"');
	};	
	var handleImgAbort = function(refDeffered) {
		var img = this;
		var imgBaseName = OS.Path.basename(OS.Path.fromFileURI(img.src));
		msgsToUser.push('Could not use "' + imgBaseName + '" as image load was unexpectedly aborted.');
		refDeffered.resolve('Unexpected abortion on : "' + img.src + '"');
	};	
	var handleImgError = function(refDeffered) {
		var img = this;
		var imgBaseName = OS.Path.basename(OS.Path.fromFileURI(img.src));
		msgsToUser.push('Did not use "' + imgBaseName + '" as it failed to load, ensure the file is an image and not corrupt.');
		refDeffered.resolve('Unexpected error on : "' + img.src + '"');
	};
	
	var loadImgAndSaveData = function(platformPath) {
		var deferred_loadImgAndSaveData = new Deferred();
		var img = new Services.appShell.hiddenDOMWindow.Image();
		
		img.onload = handleImgLoad.bind(img, deferred_loadImgAndSaveData);
		img.onabort = handleImgAbort.bind(img, deferred_loadImgAndSaveData);
		img.onerror = handleImgError.bind(img, deferred_loadImgAndSaveData);
		
		var fileUri = OS.Path.toFileURI(platformPath);
		fileUri_to_platformPath[fileUri/*.toLowerCase()*/] = platformPath; //note: may need to lower case it, im not sure, it depdns on after load if it maintins the same casing, as i use it to get matching in fileUri_to_platformPath object
		img.src = fileUri;
		
		return deferred_loadImgAndSaveData.promise;
	};
	// end - setup image load stuff
	
	// start - setup blobAndWrite
	var blobCallback = function(path_to_save_at, refDeferred, blob) {
        var reader = Cc['@mozilla.org/files/filereader;1'].createInstance(Ci.nsIDOMFileReader); //new FileReader();
        reader.onloadend = function() {
            // reader.result contains the ArrayBuffer.			
			var arrview = new Uint8Array(reader.result);
			
			var promise_writeArrView = tryOsFile_ifDirsNoExistMakeThenRetry('writeAtomic', [path_to_save_at, arrview, {tmpPath:path_to_save_at+'.tmp', encoding:'utf-8'}], fromPathBase);

			promise_writeArrView.then(
				function(aVal) {
					console.log('Fullfilled - promiseAllArr_writePngs - ', aVal);
					// start - do stuff here - promiseAllArr_writePngs
					refDeferred.resolve('Saved blob to png: "' + OS.Path.basename(path_to_save_at) + '"');
					// end - do stuff here - promiseAllArr_writePngs
				},
				function(aReason) {
					var refObj = {name:'promiseAllArr_writePngs.promise', aReason:aReason};
					console.warn('Rejected - promiseAllArr_writePngs - ', refObj);
					refDeferred.reject(refObj);
				}
			).catch(
				function(aCaught) {
					var refObj = {name:'promiseAllArr_writePngs', aCaught:aCaught};
					console.error('Caught - promiseAllArr_writePngs - ', refObj);
					refDeferred.reject(refObj);
				}
			);
        };
		reader.onabort = function() {
			refDeferred.reject('Abortion on nsIDOMFileReader, failed reading blob for saving: "' + OS.Path.basename(path_to_save_at) + '"');
		};
		reader.onerror = function() {
			refDeferred.reject('Error on nsIDOMFileReader, failed reading blob for saving: "' + OS.Path.basename(path_to_save_at) + '"');
		};
        reader.readAsArrayBuffer(blob);
	};
	// end - setup blobAndWrite
	
	// start - copy to badge_iconsets folder
	var scaleAndWriteAll = function() {
		var promiseAllArr_scaleAndWriteAll = [];
		
		for (var i=0; i<reqdSizes.length; i++) {
			var canvas = Services.appShell.hiddenDOMWindow.document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
			var ctx = canvas.getContext('2d');
			canvas.width = reqdSizes[i];
			canvas.height = reqdSizes[i];
			//ctx.clearRect(0, 0, reqdSizes[i], reqdSizes[i]);
			
			var destPath = destPathBase + '_' + reqdSizes[i] + '.png';
			
			var nearestImg = getImg_of_exactOrNearest_Bigger_then_Smaller(reqdSizes[i], collectionImgs);
			if (nearestImg.naturalHeight == reqdSizes[i]) {
				console.log('nearest found is exact of required size, so no need for scalling. just OS.File.copy this image. required size:', reqdSizes[i], 'nearest size:', nearestImg.naturalHeight);
				//promiseAllArr_scaleAndWriteAll.push(tryOsFile_ifDirsNoExistMakeThenRetry('copy', [fileUri_to_platformPath[nearestImg.src], destPath, {tmpPath:destPath+'.tmp', encoding:'utf-8'}], fromPathBase));
				// i dont do the copy anymore, as the file may not be a png, we want to draw and save it as a png
				ctx.drawImage(nearestImg, 0, 0);
			} else {
				console.log('nearest found is not exact of required size, so scalling. required size:', reqdSizes[i], 'nearest size:', nearestImg.naturalHeight);
				ctx.drawImage(nearestImg, 0, 0, reqdSizes[i], reqdSizes[i]);
				
				msgsToUser.push('Exact match for size of ' + reqdSizes[i] + ' was not available among files you selected, therefore the image for this size was scaled from "' + OS.Path.basename(fileUri_to_platformPath[nearestImg.src]) + '" which was had a size of ' + nearestImg.naturalHeight + 'px');
			}			
			var deferred_blobAndWriteScaled = new Deferred();
			promiseAllArr_scaleAndWriteAll.push(deferred_blobAndWriteScaled.promise);
			(canvas.toBlobHD || canvas.toBlob).call(canvas, blobCallback.bind(null, destPath, deferred_blobAndWriteScaled), 'image/png');						
		}
		
		var promiseAll_scaleAndWriteAll = Promise.all(promiseAllArr_scaleAndWriteAll);
		promiseAll_scaleAndWriteAll.then(
			function(aVal) {
				console.log('Fullfilled - promiseAll_scaleAndWriteAll - ', aVal);
				// start - do stuff here - promiseAll_scaleAndWriteAll
				msgsToUser.splice(0, 0, 'Successfully created iconset of this badge!\n');
				deferred_badgeProcess.resolve('Badges succesfully saved to iconset folder');
				// end - do stuff here - promiseAll_scaleAndWriteAll
			},
			function(aReason) {
				var refObj = {name:'promiseAll_scaleAndWriteAll', aReason:aReason};
				console.warn('Rejected - promiseAll_scaleAndWriteAll - ', refObj);
				deferred_badgeProcess.reject(refObj);
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'promiseAll_scaleAndWriteAll', aCaught:aCaught};
				console.error('Caught - promiseAll_scaleAndWriteAll - ', refObj);
				deferred_badgeProcess.reject(refObj);
			}
		);
	};
	// end - copy to badge_iconsets folder
	var fp = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
	fp.init(win, 'Profilist - Select Badge Images', Ci.nsIFilePicker.modeOpenMultiple);
	fp.appendFilters(Ci.nsIFilePicker.filterImages);

	var startDir = Services.dirsvc.get('UAppData', Ci.nsIFile);
	startDir.append('profilist_data');
	startDir.append('badge_iconsets'); //OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profilist_data', 'badge_iconsets');
	//console.log('the path:', startDir.path, startDir.exists());
	fp.displayDirectory = startDir;

	var rv = fp.show();
	if (rv == Ci.nsIFilePicker.returnOK) {
		deferred_badgeProcess = new Deferred();
		deferred_badgeProcess.promise.then(
			function(aVal) {
				console.log('Fullfilled - deferred_badgeProcess - ', aVal);
				// start - do stuff here - deferred_badgeProcess
				if (msgsToUser.length > 0) {
					Services.prompt.alert(win, 'Profilist - Badging Successful', msgsToUser.join('\n'));
				}
				// end - do stuff here - deferred_badgeProcess
			},
			function(aReason) {
				var refObj = {name:'deferred_badgeProcess', aReason:aReason};
				console.warn('Rejected - deferred_badgeProcess - ', refObj);
				if (msgsToUser.length >0) {
					Services.prompt.alert(win, 'Profilist - Badging Failed', msgsToUser.join('\n'));
				}
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'deferred_badgeProcess', aCaught:aCaught};
				console.error('Caught - deferred_badgeProcess - ', refObj);
				if (msgsToUser.length >0) {
					Services.prompt.alert(win, 'Profilist - Badging Errored', msgsToUser.join('\n'));
				}
			}
		);
		var files = fp.files;
		console.log('files:', files);

		var promiseAllArr_loadAllImgs = [];
		while (files.hasMoreElements()) {
			var aFile = files.getNext().QueryInterface(Ci.nsIFile);
			console.log('aFile:', aFile.path);

			// go through images, and see what all sizes they have
			promiseAllArr_loadAllImgs.push(loadImgAndSaveData(aFile.path));
		}
		var promiseAll_loadAllImgs = Promise.all(promiseAllArr_loadAllImgs);
		promiseAll_loadAllImgs.then(
			function(aVal) {
				console.log('Fullfilled - promiseAll_loadAllImgs - ', aVal);
				// start - do stuff here - promiseAll_loadAllImgs
				if (Object.keys(collectionImgs).length == 0) {
					msgsToUser.splice(0, 0, 'No badge images created all, as out of the files selected files, none were suitable for image creation.\n');
					deferred_badgeProcess.reject('No badge images created all, as out of the files selected files, none were suitable for image creation.');
				} else {
					scaleAndWriteAll();
				}
				// end - do stuff here - promiseAll_loadAllImgs
			},
			function(aReason) {
				var refObj = {name:'promiseAll_loadAllImgs', aReason:aReason};
				console.warn('Rejected - promiseAll_loadAllImgs - ', refObj);
				deferred_badgeProcess.reject('Should never get here, I never reject it');
			}
		).catch(
			function(aCaught) {
				var refObj = {name:'promiseAll_loadAllImgs', aCaught:aCaught};
				console.error('Caught - promiseAll_loadAllImgs - ', refObj);
				msgsToUser.splice(0, 0, 'Error during code exectuion, this one is fault of developer.\n');
				deferred_badgeProcess.reject('Error during code exectuion, this one is fault of developer.');
			}
		);
	}
	
}

showPick(Services.wm.getMostRecentWindow(null));