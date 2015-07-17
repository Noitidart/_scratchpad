// start - helper functions
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
// end - helper functions

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
/*
// test what error is returned by initialAttempt when dir doesnt exist for writeAtomic
var doit_func = 'writeAtomic';
var doit_path = OS.Path.join(OS.Constants.Path.desktopDir, 'my folder', 'rawr.txt');
var doit_args = [
	doit_path,
	'dummy contents',
	{
		tmpPath: doit_path + '.tmp',
		encoding: 'utf-8'
	}
];
var doit_from = OS.Constants.Path.desktopDir;
*/

// test what error is returned by initialAttempt when dir doesnt exist for copy
var doit_func = 'copy';
var doit_args = [
	OS.Path.join(OS.Constants.Path.desktopDir, 'icon.ico'), // sourcePath
	OS.Path.join(OS.Constants.Path.desktopDir, 'my folder', 'copied.ico'), // destPath
	{
		noOverwrite: true
	}
];
var doit_from = OS.Constants.Path.desktopDir;

var promise_doit = tryOsFile_ifDirsNoExistMakeThenRetry(doit_func, doit_args, doit_from);
promise_doit.then(
	function(aVal) {
		console.log('Fullfilled - promise_doit - ', aVal);
	},
	function(aReason) {
		var refObj = {name:'promise_doit', aReason:aReason};
		console.error('Rejected - promise_doit - ', refObj);
	}
).catch(
	function(aCaught) {
		var refObj = {name:'promise_doit', aCaught:aCaught};
		console.error('Caught - promise_doit - ', refObj);
	}
);