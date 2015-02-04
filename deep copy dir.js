//start - helper functions
function Deferred() {
	// this function gets the Deferred object depending on what is available, if not available it throws
	
	if (Promise && Promise.defer) {
		//need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
		return Promise.defer();
	} else if (PromiseUtils && PromiseUtils.defer) {
		//need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
		return PromiseUtils.defer();
	} else {
		try {
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
		} catch (ex) {
			throw new Error('Promise/Deferred is not available');
		}
	}
}

function enumChildEntries(pathToDir, delegate, max_depth, runDelegateOnRoot, depth) {
	// IMPORTANT: as dev calling this functiopn `depth` arg must ALWAYS be null/undefined (dont even set it to 0). this arg is meant for internal use for iteration
	// `delegate` is required
	// pathToDir is required, it is string
	// max_depth should be set to null/undefined/<0 if you want to enumerate till every last bit is enumerated. paths will be iterated to including max_depth.
	// if runDelegateOnRoot, then delegate runs on the root path with depth arg of -1
	// this function iterates all elements at depth i, then after all done then it iterates all at depth i + 1, and then so on
	// if arg of `runDelegateOnRoot` is true then minimum depth is -1 (and is of the root), otherwise min depth starts at 0, contents of root

	var deferred_enumChildEntries = new Deferred();
	var promise_enumChildEntries = deferred_enumChildEntries.promise;

	if (depth === undefined || depth === undefined) {
		// at root pathDir
		depth = 0;
		if (runDelegateOnRoot) {
			var entry = {
				isDir: true,
				name: OS.Path.basename(pathToDir),
				path: pathToDir
			};
			var rez_delegate = delegate(entry, -1);
			if (rez_delegate) {
				deferred_enumChildEntries.resolve(entry);
				return promise_enumChildEntries; // to break out of this func, as if i dont break here it will go on to iterate through this dir
			}
		}
	} else {
		depth++;
	}
	
	if ((max_depth === null || max_depth === undefined) || ( depth <= max_depth)) {
		var iterrator = new OS.File.DirectoryIterator(pathToDir);
		var subdirs = [];
		var promise_batch = iterrator.nextBatch();
		promise_batch.then(
			function(aVal) {
				for (var i = 0; i < aVal.length; i++) {
					if (aVal[i].isDir) {
						subdirs.push(aVal[i]);
					}
					var rez_delegate_on_root = delegate(aVal[i], depth);
					if (rez_delegate_on_root) {
						deferred_enumChildEntries.resolve(aVal[i]);
						return promise_enumChildEntries; //to break out of this if loop i cant use break, because it will get into the subdir digging, so it will not see the `return promise_enumChildEntries` after this if block so i have to return promise_enumChildEntries here
					}
				}
				// finished running delegate on all items at this depth and delegate never returned true

				if (subdirs.length > 0) {
					var promiseArr_itrSubdirs = [];
					for (var i = 0; i < subdirs.length; i++) {
						promiseArr_itrSubdirs.push(enumChildEntries(subdirs[i].path, delegate, max_depth, null, depth)); //the runDelegateOnRoot arg doesnt matter here anymore as depth arg is specified
					}
					var promiseAll_itrSubdirs = Promise.all(promiseArr_itrSubdirs);
					promiseAll_itrSubdirs.then(
						function(aVal) {
							deferred_enumChildEntries.resolve('done iterating all - including subdirs iteration is done - in pathToDir of: ' + pathToDir);
						},
						function(aReason) {
							var rejObj = {
								promiseName: 'promiseAll_itrSubdirs',
								aReason: aReason,
								aExtra: 'meaning finished iterating all entries INCLUDING subitering subdirs in dir of pathToDir',
								pathToDir: pathToDir
							};
							deferred_enumChildEntries.reject(rejObj);
						}
					).catch(
						function(aCaught) {
							throw aCaught; //throw here as its not final catch
						}
					);
				} else {
					deferred_enumChildEntries.resolve('done iterating all - no subdirs - in pathToDir of: ' + pathToDir);
				}
			},
			function(aReason) {
				var rejObj = {
					promiseName: 'promise_batch',
					aReason: aReason
				};
				if (aReason.winLastError == 2) {
					rejObj.probableReason = 'targetPath dir doesnt exist';
				}
				deferred_enumChildEntries.reject(rejObj);
			}
		).catch(
			function(aCaught) {
				throw aCaught;
			}
		);
	} else {
		deferred_enumChildEntries.resolve('max depth exceeded, so will not do it, at pathToDir of: ' + pathToDir);
	}

	return promise_enumChildEntries;
}

function escapeRegExp(text) {
	if (!arguments.callee.sRE) {
		var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
		arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
	}
	return text.replace(arguments.callee.sRE, '\\$1');
}

function duplicateDirAndContents(pathToSrcDir, pathToDestDir, max_depth, targetDirExists) {
	// returns promise
	// copies all stuff at depth i, then does depth i + 1, then i + 2 depth, so on // does not start at depth i and if subdir found it doesnt start copying into that right away, it completes depth levels first, i should make this change in future though as enhancement
	// if targetDirExists mark as true, else, set to false. if you set to true when it does not exist, then promise will reject due to failing to copy to non-existant dir. if it does exist, and you set it to false, then you are just wasting a couple extra function calls, function will complete succesfully though, as it tries to make the dir but it will not overwrite if already found

	var deferred_duplicateDirAndContents = new Deferred();
	var promise_duplicateDirAndContents = deferred_duplicateDirAndContents.promise;

	var stuffToMakeAtDepth = [];
	var smallestDepth = 0;
	var largestDepth = 0;

	var delegate_handleEntry = function(entry, depth) {
		// return true to make enumeration stop
		if (depth < smallestDepth) {
			smallestDepth = depth;
		}
		if (depth > largestDepth) {
			largestDepth = depth;
		}
		stuffToMakeAtDepth.push({
			depth: depth,
			isDir: entry.isDir,
			path: entry.path
		});
	};

	var promise_collectAllPathsInSrcDir = enumChildEntries(pathToSrcDir, delegate_handleEntry, max_depth, !targetDirExists);
	promise_collectAllPathsInSrcDir.then(
		function(aVal) {
			// start - promise generator func
			var curDepth = smallestDepth;
			var makeStuffsFor_CurDepth = function() {
				var promiseAllArr_madeForCurDepth = [];
				for (var i = 0; i < stuffToMakeAtDepth.length; i++) {
					if (stuffToMakeAtDepth[i].depth == curDepth) {
						var copyToPath = stuffToMakeAtDepth[i].path.replace(new RegExp(escapeRegExp(pathToTarget), 'i'), pathToDestDir);
						promiseAllArr_madeForCurDepth.push(
							stuffToMakeAtDepth[i].isDir // if (stuffToMakeAtDepth[i].isDir) {
							?
								OS.File.makeDir(copyToPath)
							: // } else {
								//OS.File.unixSymLink(stuffToMakeAtDepth[i].path, stuffToMakeAtDepth[i].path.replace(new RegExp(escapeRegExp(pathToTarget), 'i'), pathToDestDir))
								OS.File.copy(stuffToMakeAtDepth[i].path, copyToPath)
							// }
						);
					}
				}
				var promiseAll_madeForCurDepth = Promise.all(promiseAllArr_madeForCurDepth);
				promiseAll_madeForCurDepth.then(
					function(aVal) {
						if (curDepth < largestDepth) {
							curDepth++;
							makeStuffsFor_CurDepth();
						} else {
							deferred_duplicateDirAndContents.resolve('all depths made up to and including:' + largestDepth);
						}
					},
					function(aReason) {
						var rejObj = {
							promiseName: 'promiseAll_madeForCurDepth',
							aReason: aReason,
							curDepth: curDepth
						};
						console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
						deferred_duplicateDirAndContents.reject(rejObj);
					}
				).catch(
					function(aCaught) {
						throw aCaught;
					}
				);
			};
			// end - promise generator func
			makeStuffsFor_CurDepth();
		},
		function(aReason) {
			var rejObj = {
				promiseName: 'promise_collectAllPathsInSrcDir',
				aReason: aReason
			};
			deferred_duplicateDirAndContents.reject(rejObj);
		}
	).catch(
		function(aCatch) {
			throw aCatch;
		}
	);

	return promise_duplicateDirAndContents;
}
// end - helper functions

var pathToTarget = OS.Path.join(OS.Constants.Path.desktopDir, 'trgt folder');
var pathToCreate = OS.Path.join(OS.Constants.Path.desktopDir, 'deep copied dir'); // does not have to exist, but if it doesnt, then make sure to pass last argument of duplicateDirAndContents of `targetDirExists` as false or null or undefined. dont pass true, otherwise you lied to it and it will reject as the destintation dir doesnt exist

var promise_dupeTrgFol = duplicateDirAndContents(pathToTarget, pathToCreate, 0, false);
promise_dupeTrgFol.then(
	function(aVal) {
		console.log('Fullfilled - promise_dupeTrgFol - ', aVal);
		return 'promise for enumChildEntries completed succesfully';
	},
	function(aReason) {
		var rejObj = {
			promiseName: 'promise_dupeTrgFol',
			aReason: aReason
		};
		console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
		//throw rejObj; // //dont throw here as its final
	}
).catch(
	function(aCaught) {
		console.error('Caught - promise_dupeTrgFol - ', aCaught);
		//throw aCaught; //dont throw here as its final
	}
);