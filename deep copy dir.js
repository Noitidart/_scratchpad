// creates a .app on desktop of all symlinks of Firefox.app
//target must be a dir
// all files are symlinked, and dirs of target are created

//start - helper function
function enumChildEntries(pathToDir, delegate, max_depth, depth, specialCase_runDelegateOnRoot) {
  var deferred_enumEntries = Promise.defer();
   if (specialCase_runDelegateOnRoot && !depth /* meaning depth is either 0, undefined, or null so then obviously pathToDir is root which is what dev passed into the func to start at */) {
    var entry = {isDir:true, name:OS.Path.basename(pathToDir), path:pathToDir};
    var rez_delegate = delegate(entry, -1);
   } else {
    var rez_delegate = false;
   }
  if (rez_delegate) {
    return deferred_enumEntries.resolve(entry);
  } else {
		var typeofDepth = typeof depth;
		if (typeofDepth != 'number' /*typeofDepth == 'undefined' || typeofDepth == 'object' /*null*/) {
			depth = 0;
		} else {
			depth++;
		}
		console.log('na, depth:', depth);
    if (max_depth && max_depth >= 0) {
      if (depth > max_depth) {
        'Reached depth of max_depth, ' + max_depth + '! Will not enumChildEntries on path of directory of: "' + pathToDir + '"'
        return deferred_enumEntries.resolve('Reached depth of max_depth, ' + max_depth + '! Will not enumChildEntries on path of directory of: "' + pathToDir + '"');
      } else {
        console.log('will enum as depth is:', depth, 'and max_depth not yet equalled:', max_depth)
      }
    } else {
      console.log('ignoring depth');
    }
		//console.log('n');
    var iterrator = new OS.File.DirectoryIterator(pathToDir);
    var subdirs = [];
    var promise_batch = iterrator.nextBatch();
    return promise_batch.then(
     function(aVal) {
       console.info('Fullfilled - promise_batch - ', aVal);
       for (var i=0; i<aVal.length; i++) {
         if (aVal[i].isDir) {
           subdirs.push(aVal[i])
         }
         rez_delegate_e = delegate(aVal[i], depth);
         if (rez_delegate_e) {
           return deferred_enumEntries.resolve(aVal[i]);
         }
       }

       var promiseArr_itrSubdirs = [];    
       for (var i=0; i<subdirs.length; i++) {
         promiseArr_itrSubdirs.push(enumChildEntries(subdirs[i].path, delegate, max_depth, depth));
       }
       var promiseAll_itrSubdirs = Promise.all(promiseArr_itrSubdirs);
       return promiseAll_itrSubdirs.then(
         function(aVal) {
           console.log('Fullfilled - promiseArr_itrSubdirs - ', aVal);
         },
         function(aReason) {
           console.error('Rejected - promiseArr_itrSubdirs - ', aReason);
           return deferred_enumEntires.reject({rejectorOf_promiseName:'promiseArr_itrSubdirs', aReason:aReason, pathToDir:pathToDir});
         }
       );
     },
     function(aReason) {
       console.error('Rejected - promise_batch - ', aReason);
				var refObj = {name:'promise_batch', aReason:aReason};
			 if (aReason.winLastError == 2) {
				 refObj.probableReason = 'targetPath dir doesnt exist';
			 }
				console.error('Rejected - ' + refObj.name + ' - ', refObj);
				//throw refObj; // throw here as its not final
       	return deferred_enumEntires.reject(refObj);
     }
    );
  }
  console.error('i thought it would never get here but it did, wat the hek');
}
// end - helper function

//var pathToTarget = OS.Path.join(OS.Constants.Path.macLocalApplicationsDir, 'Firefox.app');
var pathToTarget = OS.Path.join(OS.Constants.Path.desktopDir, 'trgt folder');
//var pathToCreate = OS.Path.join(OS.Constants.Path.desktopDir, 'myff.app'); // does not have to exist, it will be created, IF run enumChildEntries with specialCase_runDelegateOnRoot true. ELSE this pathToCreate must exist.
var pathToCreate = OS.Path.join(OS.Constants.Path.desktopDir, 'deep copied dir'); // does not have to exist, it will be created, IF run enumChildEntries with specialCase_runDelegateOnRoot true. ELSE this pathToCreate must exist.
var totalEntriesEnummed = 0; //meaning total number of entries ran delegate on, includes root dir if specialCase_runDelegateOnRoot set to true

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
  stuffToMakeAtDepth.push({depth:depth, isDir:entry.isDir, path:entry.path});
}

var promise_enumEntries = enumChildEntries(pathToTarget, delegate_handleEntry, null, null, true);
promise_enumEntries.then(
  function(aVal) {
    // on resolve, aVal is undefined if it went through all possible entries
    console.log('Fullfilled - promise_enumEntries - ', aVal);
    console.info('totalEntriesEnummed:', totalEntriesEnummed);
		console.info('smallestDepth:', smallestDepth);
		console.info('largestDepth:', largestDepth);
		console.log('stuffToMakeAtDepth', stuffToMakeAtDepth);
		var deferred_allDepthsMade = new Deferred();
		var promise_allDepthsMade = deferred_allDepthsMade.promise;

		// start - trigger make promises
		var curDepth = smallestDepth;
		var makeStuffsFor_CurDepth = function() {
			var promiseAllArr_madeForCurDepth = [];
			for (var i=0; i<stuffToMakeAtDepth.length; i++) {
				if (stuffToMakeAtDepth[i].depth == curDepth) {
					var copyToPath = stuffToMakeAtDepth[i].path.replace(new RegExp(escapeRegExp(pathToTarget), 'i'), pathToCreate);
					console.log('copyToPath', copyToPath);
					promiseAllArr_madeForCurDepth.push(
						stuffToMakeAtDepth[i].isDir
						?
							OS.File.makeDir(copyToPath)
						:
							//OS.File.unixSymLink(stuffToMakeAtDepth[i].path, stuffToMakeAtDepth[i].path.replace(new RegExp(escapeRegExp(pathToTarget), 'i'), pathToCreate))
							OS.File.copy(stuffToMakeAtDepth[i].path, copyToPath)
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
						deferred_allDepthsMade.resolve('all depths made up to and including:' + largestDepth);
					}
				},
				function(aReason) {
					var refObj = {name:'promiseAll_madeForCurDepth', aReason:aReason, curDepth: curDepth};
					console.error('Rejected - promiseAll_madeForCurDepth - ', refObj);
					throw refObj; // throw here as its not final
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

		return promise_allDepthsMade.then(
			function(aVal) {
				console.log('Fullfilled - promise_allDepthsMade - ', aVal);
				return 'promise for enumChildEntries completed succesfully';
			},
			function(aReason) {
				var refObj = {name:'promise_allDepthsMade', aReason:aReason};
				console.error('Rejected - promise_allDepthsMade - ', refObj);
				throw refObj; // throw here as its not final
			}
		).catch(
			function(aCaught) {
				console.error('Caught - promise_allDepthsMade - ', aCaught);
				throw aCaught; //throw here as its not final catch
			}
		);
  },
  function(aReason) {
	var rejObj = {rejectorOf_promiseName:'promise_enumEntries', aReason:aReason};
    console.error('Rejected - promise_enumEntries - ', rejObj);
	// DONT throw here as it is final onRejected
  }
).catch(
  function(aCatch) {
    console.error('Caught - promise_enumEntries - ', aCatch);
    //throw aCatch;
  }  
);

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