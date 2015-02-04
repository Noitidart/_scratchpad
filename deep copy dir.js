//start - helper function
function escapeRegExp(text) {
  if (!arguments.callee.sRE) {
    var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
    arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
   }
  return text.replace(arguments.callee.sRE, '\\$1');
}

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

function enumChildEntries(pathToDir, delegate, max_depth, runDelegateOnRoot, depth) {
	// IMPORTANT: as dev calling this functiopn `depth` arg must ALWAYS be null/undefined (dont even set it to 0). this arg is meant for internal use for iteration
	// `delegate` is required
	// pathToDir is required, it is string
	// max_depth should be set to null/undefined/<0 if you want to enumerate till every last bit is enumerated. paths will be iterated to including max_depth.
	// if runDelegateOnRoot, then delegate runs on the root path with depth arg of -1
	// this function iterates all elements at depth i, then after all done then it iterates all at depth i + 1, and then so on
	// if arg of `runDelegateOnRoot` is true then minimum depth is -1, else it is 0
	
	var deferred_enumChildEntries = new Deferred();
	var promise_enumChildEntries = deferred_enumChildEntries.promise;

	console.log('running enumChildEntries on: ' + pathToDir);
	if (depth === undefined || depth === undefined) {
		// at root pathDir
		depth = 0;
		if (runDelegateOnRoot) {
			var entry = {isDir:true, name:OS.Path.basename(pathToDir), path:pathToDir};
			var rez_delegate = delegate(entry, -1);
			if (rez_delegate) {
				deferred_enumChildEntries.resolve(entry);
				return promise_enumChildEntries; // to break out of this func, as if i dont break here it will go on to iterate through this dir
			}
		}
	} else {
		depth++;
	}
	console.log('now, depth:', depth);
	/*
	if (max_depth && max_depth >= 0) {
	  if (depth > max_depth) {
		console.log('Reached depth of max_depth, ' + max_depth + '! Will not enumChildEntries on path of directory of: "' + pathToDir + '"');
		if (depth == 0) {
			deferred_enumChildEntries.resolve('Reached depth of max_depth, ' + max_depth + '! Will not enumChildEntries on path of directory of: "' + pathToDir + '"');
			return promise_enumChildEntries;
		}
	  } else {
		console.log('will enum as depth is:', depth, 'and max_depth not yet equalled:', max_depth)
	  }
	} else {
	  console.log('no depth limit set, as max_depth is nul, undefined, or less than 0');
	}
	*/
	if ((max_depth === null || max_depth === undefined) || (/*max_depth !== undefined && max_depth !== null && *//*this isnt needed as it was tested in the previous if group on this line*/ depth <= max_depth)) {
		console.log('continue to iterate because either max_depth not exceeded, or max_depth set to go infinite', 'max_depth:', max_depth, 'depth:', depth);
		//start working here
		var iterrator = new OS.File.DirectoryIterator(pathToDir);
		var subdirs = [];
		var promise_batch = iterrator.nextBatch();
		promise_batch.then(
			function(aVal) {
				console.info('Fullfilled - promise_batch - ', aVal);
				for (var i=0; i<aVal.length; i++) {
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
					for (var i=0; i<subdirs.length; i++) {
						promiseArr_itrSubdirs.push(enumChildEntries(subdirs[i].path, delegate, max_depth, null, depth)); //the runDelegateOnRoot arg doesnt matter here anymore as depth arg is specified
					}
					var promiseAll_itrSubdirs = Promise.all(promiseArr_itrSubdirs);
					promiseAll_itrSubdirs.then(
						function(aVal) {
							console.log('Fullfilled - promiseArr_itrSubdirs - ', 'meaning finished iterating all subdirs in dir of:', pathToDir, 'aVal:', aVal);
							deferred_enumChildEntries.resolve('done iterating all - including subdirs iteration is done - in pathToDir of: ' + pathToDir);
						},
						function(aReason) {
							var rejObj = {name:'promiseAll_itrSubdirs', aReason:aReason, aExtra:'meaning finished iterating all subdirs in dir of pathToDir', pathToDir:pathToDir};
							console.error('Rejected - promiseArr_itrSubdirs - ', rejObj);
							deferred_enumChildEntries.reject(rejObj);
						}
					).catch(
						function(aCaught) {
							console.error('Caught - promiseAll_itrSubdirs - ', aCaught);
							throw aCaught; //throw here as its not final catch
						}
					);
				} else {
					console.log('finished enumerating through all entries in dir, there were no subdirectories in:', pathToDir);
					deferred_enumChildEntries.resolve('done iterating all - no subdirs - in pathToDir of: ' + pathToDir);
				}
			 },
			 function(aReason) {
				var rejObj = {rejectorOf:'promise_batch', aReason:aReason};
				if (aReason.winLastError == 2) {
					rejObj.probableReason = 'targetPath dir doesnt exist';
				}
				console.error('Rejected - ' + rejObj.rejectorOf + ' - ', rejObj);
				//throw rejObj; // dont throw, we are rejecting, not erroring
				deferred_enumChildEntries.reject(rejObj);
				// no need for `return promise_enumChildEntries` here as there is no code running after this
			 }
		).catch(
			function(aCaught) {
				console.error('Caught - promise_batch - ', aCaught);
				throw aCaught; //throw here as its not final catch
			}
		);
		//end working here
	} else {
		console.log('max depth exceeded', 'max_depth:', max_depth, 'depth:', depth);
		deferred_enumChildEntries.resolve('max depth exceeded, so will not do it, at pathToDir of: ' + pathToDir);
	}
	
	return promise_enumChildEntries;
}

function duplicateDirAndContents(pathToSrcDir, pathToDestDir, max_depth, targetDirExists) {
	// returns promise
	// copies all stuff at depth i, then does depth i + 1, then i + 2 depth, so on // does not start at depth i and if subdir found it doesnt start copying into that right away, it completes depth levels first, i should make this change in future though as enhancement
	// if targetDirExists mark as true, it will save couple functions from running, but if you forget to its ok it wont error, it wont overwrite either, so you're ok

	var deferred_duplicateDirAndContents = new Deferred();
	var promise_duplicateDirAndContents = deferred_duplicateDirAndContents.promise;

	var totalEntriesEnummed = 0; //meaning total number of entries ran delegate on, includes root dir if runDelegateOnRoot set to true

	var stuffToMakeAtDepth = [];
	var smallestDepth = 0;
	var largestDepth = 0;

	function delegate_handleEntry(entry, depth) {
		// return true to make enumeration stop
		if (depth < smallestDepth) {
			smallestDepth = depth;
		}
		if (depth > largestDepth) {
			largestDepth = depth;
		}
		totalEntriesEnummed++;
		stuffToMakeAtDepth.push({
			depth: depth,
			isDir: entry.isDir,
			path: entry.path
		});
	}

	var promise_collectAllPathsInSrcDir = enumChildEntries(pathToSrcDir, delegate_handleEntry, max_depth, !targetDirExists);
	promise_collectAllPathsInSrcDir.then(
		function(aVal) {
			// on resolve, aVal is undefined if it went through all possible entries
			console.log('Fullfilled - promise_collectAllPathsInSrcDir - ', aVal);
			console.info('totalEntriesEnummed:', totalEntriesEnummed);
			console.info('smallestDepth:', smallestDepth);
			console.info('largestDepth:', largestDepth);
			console.log('stuffToMakeAtDepth', stuffToMakeAtDepth);
			var deferred_allStuffsMadeForCollectedPaths = new Deferred();
			var promise_allStuffsMadeForCollectedPaths = deferred_allStuffsMadeForCollectedPaths.promise;

			// start - trigger make promises
			var curDepth = smallestDepth;
			var makeStuffsFor_CurDepth = function() {
				var promiseAllArr_madeForCurDepth = [];
				for (var i=0; i<stuffToMakeAtDepth.length; i++) {
					if (stuffToMakeAtDepth[i].depth == curDepth) {
						var copyToPath = stuffToMakeAtDepth[i].path.replace(new RegExp(escapeRegExp(pathToTarget), 'i'), pathToDestDir);
						console.log('copyToPath', copyToPath);
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
						console.log('Fullfilled - promiseAll_madeForCurDepth - ', 'curDepth:', curDepth, aVal);
						if (curDepth < largestDepth) {
							curDepth++;
							makeStuffsFor_CurDepth();
						} else {
							deferred_allStuffsMadeForCollectedPaths.resolve('all depths made up to and including:' + largestDepth);
						}
					},
					function(aReason) {
						var rejObj = {
							name: 'promiseAll_madeForCurDepth',
							aReason: aReason,
							curDepth: curDepth
						};
						console.error('Rejected - promiseAll_madeForCurDepth - ', rejObj);
						deferred_allStuffsMadeForCollectedPaths.reject(rejObj); // do this instead of throw
						//throw rejObj; // throw here as its not final // stupid of me, just dont throw so it rejects gracefully
					}
				).catch(
					function(aCaught) {
						console.error('Caught - promiseAll_madeForCurDepth - ', aCaught);
						throw aCaught; //throw here as its not final catch
					}
				);
			};
			makeStuffsFor_CurDepth(); //start the making loop
			// end - trigger make promises
			return promise_allStuffsMadeForCollectedPaths; //this is the final then, we leave that to the dev who is using this helper function, so i dont return .then, i return the promise, the dev handles the .then, so commented out following block:
				/*
				return promise_allStuffsMadeForCollectedPaths.then(
					function(aVal) {
						console.log('Fullfilled - promise_allStuffsMadeForCollectedPaths - ', aVal);
						// this line here is stuipd: `deferred_allStuffsMadeForCollectedPaths.resolve('promise for enumChildEntries completed succesfully');` as doing that resolve would get into this resolver, meaning we're already in its resolver duhh
					},
					function(aReason) {
						var rejObj = {
							name: 'promise_allStuffsMadeForCollectedPaths',
							aReason: aReason
						};
						console.error('Rejected - promise_allStuffsMadeForCollectedPaths - ', rejObj);
						deferred_allStuffsMadeForCollectedPaths.reject(rejObj); // do this instead of throw
						//throw rejObj; // throw here as its not final // stupid of me, just dont throw so it rejects gracefully
					}
				).catch(
					function(aCaught) {
						console.error('Caught - promise_allStuffsMadeForCollectedPaths - ', aCaught);
						throw aCaught; //throw here as its not final catch
					}
				);
				*/
		},
		function(aReason) {
			var rejObj = {
				rejectorOf_promiseName: 'promise_collectAllPathsInSrcDir',
				aReason: aReason
			};
			console.error('Rejected - promise_collectAllPathsInSrcDir - ', rejObj);
			deferred_duplicateDirAndContents.reject(rejObj); // do this instead of throw
			//throw rejObj; // man i always was throwing on reject, this was stupid of me, this is not PromiseWorker, i should only throw when a real error occurs, otherwise it will go into the catch of the final statement instead of the reject
		}
	).catch(
		function(aCatch) {
			console.error('Caught - promise_collectAllPathsInSrcDir - ', aCatch);
			throw aCatch;
		}
	);
	
	return promise_duplicateDirAndContents;
}
// end - helper function

//var pathToTarget = OS.Path.join(OS.Constants.Path.macLocalApplicationsDir, 'Firefox.app');
var pathToTarget = OS.Path.join(OS.Constants.Path.desktopDir, 'trgt folder');
//var pathToCreate = OS.Path.join(OS.Constants.Path.desktopDir, 'myff.app'); // does not have to exist, it will be created, IF run enumChildEntries with runDelegateOnRoot true. ELSE this pathToCreate must exist.
var pathToCreate = OS.Path.join(OS.Constants.Path.desktopDir, 'deep copied dir'); // does not have to exist, it will be created, IF run enumChildEntries with runDelegateOnRoot true. ELSE this pathToCreate must exist.

var promise_duplicateDirAndContents = duplicateDirAndContents(pathToTarget, pathToCreate, 0, false);
promise_duplicateDirAndContents.then(
	function(aVal) {
		console.log('Fullfilled - promise_duplicateDirAndContents - ', aVal);
		return 'promise for enumChildEntries completed succesfully';
	},
	function(aReason) {
		var rejObj = {name:'promise_duplicateDirAndContents', aReason:aReason};
		console.error('Rejected - promise_duplicateDirAndContents - ', rejObj);
		//throw rejObj; // //dont throw here as its final
	}
).catch(
	function(aCaught) {
		console.error('Caught - promise_duplicateDirAndContents - ', aCaught);
		//throw aCaught; //dont throw here as its final
	}
);