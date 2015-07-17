//Cu.import('resource://gre/modules/FileUtils.jsm');
//Cu.import('resource://gre/modules/osfile.jsm');
//Cu.importGlobalProperties(['TextDecoder']);

var exePath = FileUtils.getFile('XREExeF', []).path;
var path_iniDir = OS.Constants.Path.userApplicationDataDir;

// helper functions
var vcLs30; //jsBool for if this ff version is < 30
function getVcLs30() {
	if (vcLs30 === null || vcLs30 === undefined) {
		vcLs30 = (Services.vc.compare(Services.appinfo.version, 30) < 0);
	}
}

var txtDecodr; // holds TextDecoder if created
function getTxtDecodr() {
	if (!txtDecodr) {
		txtDecodr = new TextDecoder();
	}
	return txtDecodr;
}

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

function read_encoded(path, options) {
	// because the options.encoding was introduced only in Fx30, this function enables previous Fx to use it
	// must pass encoding to options object, same syntax as OS.File.read >= Fx30
	// TextDecoder must have been imported with Cu.importGlobalProperties(['TextDecoder']);
	
	var deferred_read_encoded = new Deferred();
	var promise_read_encoded = deferred_read_encoded.promise;
	
	if (!options || !('encoding' in options)) {
		throw new Error('Must pass encoding in options object');
	}
	
	if (getVcLs30()) {
		//var encoding = options.encoding; // looks like i dont need to pass encoding to TextDecoder, not sure though for non-utf-8 though
		delete options.encoding;
	}
	var promise_read = OS.File.read(path, options);
	
	promise_read.then(
		function(aVal) {
			console.log('Fulfilled - promise_read - ');
			var readStr;
			if (getVcLs30()) {
				readStr = getTxtDecodr().decode(aVal); // Convert this array to a text
			} else {
				readStr = aVal;
			}
			deferred_read_encoded.resolve(readStr);
		},
		function(aReason) {
			var rejObj = {
				promiseName: 'promise_read',
				aReason: aReason
			};
			console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
			deferred_read_encoded.reject(aReason); // i return aReason here instead of my usual rejObj so it works just like OS.File.read
		}
	).catch(
		function(aCaught) {
			console.error('Caught - promise_read - ', aCaught);
			throw aCaught;
		}
	);
	
	return promise_read_encoded;
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
						var copyToPath = stuffToMakeAtDepth[i].path.replace(new RegExp(escapeRegExp(pathToSrcDir), 'i'), pathToDestDir);
						promiseAllArr_madeForCurDepth.push(
							stuffToMakeAtDepth[i].isDir // if (stuffToMakeAtDepth[i].isDir) {
							?
								OS.File.makeDir(copyToPath)
							: // } else {
								OS.File.unixSymLink(stuffToMakeAtDepth[i].path, stuffToMakeAtDepth[i].path.replace(new RegExp(escapeRegExp(pathToSrcDir), 'i'), pathToDestDir))
								//OS.File.copy(stuffToMakeAtDepth[i].path, copyToPath)
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
// end helper functions

function makeMacFFProfileLauncher(path_profileDir, pathToBuildsApp, launcher_file_name, path_icon, dir_to_place_launcher) {
	// launcher_file_name no need for .app, if omitted, then path_profileDir will be the name
	// if path_icon is omitted, then same icon of that in pahtToFFApp is used
	// path_profileDir is REQUIRED, path_profileDir is the path to the profile to launch, like: OS.Constants.Path.profileDir
	// if pathToBuildsApp is null/undefined, then the current build you are running this code from will be used
	var deferred_makeMacFFProfileLauncher = new Deferred();
	var promise_makeMacFFProfileLauncher = deferred_makeMacFFProfileLauncher.promise;
	
	// path_profileDir is a jsStr of the path to the profile to launch (such as OS.Constants.Path.profileDir)
	
	var pathToFFApp;
	if (pathToBuildsApp) {
		pathToFFApp = pathToBuildsApp;
	} else {
		pathToFFApp = OS.Path.split(exePath);
		for (var i=0; i<pathToFFApp.components.length; i++) {
			console.log(pathToFFApp.components[i]);
			if (pathToFFApp.components[i].substr(pathToFFApp.components[i].length-4) == '.app') {
				pathToFFApp = OS.Path.join.apply(OS.Path, pathToFFApp.components.slice(0, i+1));
				console.log(pathToFFApp);
				break;
			}
		}
	}
	var launcherName = (launcher_file_name ? launcher_file_name : OS.Path.basename(path_profileDir)) + '.app';
	var pathToLauncher = dir_to_place_launcher ? OS.Path.join(dir_to_place_launcher, launcherName) : OS.Path.join(path_iniDir, 'profilist_data', 'profile_launchers', launcherName);
	
	var promise_copyFxApp = duplicateDirAndContents(pathToFFApp,  pathToLauncher);
	promise_copyFxApp.then(
		function(aVal) {
			console.log('Fulfilled - promise_copyFxApp - ', aVal);
			
			// start - write main app paths file
			var pathsFileContentsJson = {
				mainAppPath: Services.dirsvc.get('XREExeF', Ci.nsIFile).parent.parent.parent.path,
				main_profLD_LDS_basename: Services.dirsvc.get('ProfLD', Ci.nsIFile).parent.path,
			};
			var pathsFileContents = JSON.stringify(pathsFileContentsJson);
			var path_to_pathsFile = OS.Path.join(pathToLauncher, 'Contents', 'MacOS', 'profilist-main-paths.json');
			var promise_writePathsFile = OS.File.writeAtomic(path_to_pathsFile, pathsFileContents, {encoding:'utf-8', tmpPath:path_to_pathsFile+'.bkp'});
			promise_writePathsFile.then(
				function(aVal) {
					console.log('Fulfilled - promise_writePathsFile - ', aVal);
					//deferred_readThenWritePlist.resolve();
				},
				function(aReason) {
					var rejObj = {
						promiseName: 'promise_writePathsFile',
						aReason: aReason
					};
					console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
					//deferred_readThenWritePlist.reject(rejObj);
				}
			).catch(
				function(aCaught) {
					console.error('Caught - promise_writePathsFile - ', aCaught);
					throw aCaught;
				}
			);
			// end - write main app paths file
			
			//start - promise_readThenWritePlist
			var deferred_readThenWritePlist = new Deferred();
			var promise_readThenWritePlist = deferred_readThenWritePlist.promise;
			
			var path_infoPlist_inSrc = OS.Path.join(pathToFFApp, 'Contents', 'Info.plist');
			var promise_readPlist = read_encoded(path_infoPlist_inSrc, {encoding:'utf-8'});
			promise_readPlist.then(
				function(aVal) {
					console.log('Fulfilled - promise_readPlist - ');
					var modifiedReadStr = aVal.replace(/<key>CFBundleExecutable<\/key>[\s\S]*?<string>(.*?)<\/string>/, function(a, b) {
						// this function gets the original executable name (i cant assume its firefox, it might nightly etc)
						// it also replaces it with profilist-exec
						return a.replace(b, 'profilist-exec');
					});
					
					modifiedReadStr = modifiedReadStr.replace(/<key>CFBundleIconFile<\/key>[\s\S]*?<string>(.*?)<\/string>/, function(a, b, c) {
						// this function replaces icon with profilist-badged.icns, so in future i can easily replace it without having to know name first, like i dont know if its firefox.icns for nightly etc
						return a.replace(b, 'profilist-badged');
					});

					modifiedReadStr = modifiedReadStr.replace(/<key>CFBundleIdentifier<\/key>[\s\S]*?<string>(.*?)<\/string>/, function(a, b, c) {
						// this function replaces the bundle identifier
						return a.replace(b, OS.Path.basename(path_profileDir).replace(/[^a-z\.0-9]/ig, '-'));
						//The bundle identifier string identifies your application to the system. This string must be a uniform type identifier (UTI) that contains only alphanumeric (A-Z,a-z,0-9), hyphen (-), and period (.) characters. The string should also be in reverse-DNS format. For example, if your company’s domain is Ajax.com and you create an application named Hello, you could assign the string com.Ajax.Hello as your application’s bundle identifier. The bundle identifier is used in validating the application signature. source (apple developer: https://developer.apple.com/library/ios/#documentation/CoreFoundation/Conceptual/CFBundles/BundleTypes/BundleTypes.html#//apple_ref/doc/uid/10000123i-CH101-SW1)
						//An identifier used by iOS and Mac OS X to recognize any future updates to your app. Your Bundle ID must be registered with Apple and unique to your app. Bundle IDs are app-type specific (either iOS or Mac OS X). The same Bundle ID cannot be used for both iOS and Mac OS X apps. source https://itunesconnect.apple.com/docs/iTunesConnect_DeveloperGuide.pdf
					});
					
					var path_infoPlist_inDest = OS.Path.join(pathToLauncher, 'Contents', 'Info.plist');
					var promise_writePlist = OS.File.writeAtomic(path_infoPlist_inDest, modifiedReadStr, {encoding:'utf-8', tmpPath:path_infoPlist_inDest+'.profilist.bkp'});
					promise_writePlist.then(
						function(aVal) {
							console.log('Fulfilled - promise_writePlist - ', aVal);
							deferred_readThenWritePlist.resolve();
						},
						function(aReason) {
							var rejObj = {
								promiseName: 'promise_writePlist',
								aReason: aReason
							};
							console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
							deferred_readThenWritePlist.reject(rejObj);
						}
					).catch(
						function(aCaught) {
							console.error('Caught - promise_writePlist - ', aCaught);
							throw aCaught;
						}
					);
				},
				function(aReason) {
					var rejObj = {
						promiseName: 'promise_readPlist',
						aReason: aReason
					};
					console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
					deferred_readThenWritePlist.reject(rejObj);
				}
			).catch(
				function(aCaught) {
					console.error('Caught - promise_readPlist - ', aCaught);
					throw aCaught;
				}
			);
			//end - promise_readThenWritePlist
			
			// start - xattr
			var deferred_xattr = new Deferred();
			var promise_xattr = deferred_xattr.promise;
			
			var xattr = Cc['@mozilla.org/file/local;1'].createInstance(Ci.nsILocalFile);
			xattr.initWithPath('/usr/bin/xattr');
			var proc = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
			proc.init(xattr);
			
			var procFinXattr = {
				observe: function(aSubject, aTopic, aData) {
					console.log('incoming procFinXattr', 'aSubject:', aSubject, 'aTopic:', aTopic, 'aData', aData);
					if (aSubject.exitValue == '0') {
						deferred_xattr.resolve('success xattr');
					} else {
						deferred_xattr.reject('exitValue is not 0, thus xattr failed, exitValue is: "' + aSubject.exitValue + '"');
					}
				}
			};
			
			var xattrAargs = ['-d', 'com.apple.quarantine', pathToLauncher];
			proc.runAsync(xattrAargs, xattrAargs.length, procFinXattr);
			
			promise_xattr.then(
				function(aVal) {
					console.log('Fulfilled - promise_xattr - ', aVal);
				},
				function(aReason) {
					var rejObj = {
						promiseName: 'promise_xattr',
						aReason: aReason
					};
					console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
				}
			).catch(
				function(aCaught) {
					console.error('Caught - promise_xattr - ', aCaught);
					throw aCaught;
				}
			);
			// end - xattr
			
			// start - copy icns
			var path_iconDestination = OS.Path.join(pathToLauncher, 'Contents', 'Resources', 'profilist-badged.icns');
			var path_IconToCopy = path_icon ? path_icon : OS.Path.join(pathToFFApp, 'Contents', 'Resources', 'firefox.icns');
			var promise_copyIcon = OS.File.copy(path_IconToCopy, path_iconDestination);
			promise_copyIcon.then(
				function(aVal) {
					console.log('Fulfilled - promise_copyIcon - ', aVal);
				},
				function(aReason) {
					var rejObj = {
						promiseName: 'promise_copyIcon',
						aReason: aReason
					};
					console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
				}
			).catch(
				function(aCaught) {
					console.error('Caught - promise_copyIcon - ', aCaught);
					throw aCaught;
				}
			);
			// end - copy icns
			
			// start - write exec
			var deferred_execWrittenAndPermed = new Deferred();
			var promise_execWrittenAndPermed = deferred_execWrittenAndPermed.promise;
			
			var path_profilistExec = OS.Path.join(pathToLauncher, 'Contents', 'MacOS', 'profilist-exec');
			var path_originalExec = OS.Path.join(pathToLauncher, 'Contents', 'MacOS', 'firefox');
			var promise_writeExec = OS.File.writeAtomic(path_profilistExec, '#!/bin/sh\nexec "' + path_originalExec + '" -profile "' + path_profileDir + '" -no-remote', {tmpPath:path_profilistExec+'.profilist.bkp'});
			promise_writeExec.then(
				function(aVal) {
					console.log('Fulfilled - promise_writeExec - ', aVal);
					var promise_setPermsScript = OS.File.setPermissions(path_profilistExec, {
						unixMode: FileUtils.PERMS_DIRECTORY
					});
					promise_setPermsScript.then(
						function(aVal) {
							console.log('Fulfilled - promise_setPermsScript - ', aVal);
							deferred_execWrittenAndPermed.resolve('perms set');
						},
						function(aReason) {
							var rejObj = {
								promiseName: 'promise_setPermsScript',
								aReason: aReason
							};
							console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
							deferred_execWrittenAndPermed.reject(rejObj);
						}
					).catch(
						function(aCaught) {
							console.error('Caught - promise_setPermsScript - ', aCaught);
							throw aCaught;
						}
					);
				},
				function(aReason) {
					var rejObj = {
						promiseName: 'promise_writeExec',
						aReason: aReason
					};
					console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
					deferred_execWrittenAndPermed.reject(rejObj);
				}
			).catch(
				function(aCaught) {
					console.error('Caught - promise_writeExec - ', aCaught);
					throw aCaught;
				}
			);	
			// end - write exec
			
			// start - reflect mods
			var reflectMods = function() {
				var path_toDummy = OS.Path.join(pathToLauncher, 'profilist-reflect-mods-dummy-dir');
				var promise_makeDummy = OS.File.makeDir(path_toDummy);
				promise_makeDummy.then(
					function(aVal) {
						console.log('Fulfilled - promise_makeDummy - ', aVal);
						var promise_removeDummy = OS.File.removeDir(path_toDummy);
						promise_removeDummy.then(
							function(aVal) {
								console.log('Fulfilled - promise_removeDummy - ', aVal);
								deferred_reflectMods.resolve('change should be reflecting now on dir, need to reflect on dock now');
							},
							function(aReason) {
								var rejObj = {
									promiseName: 'promise_removeDummy',
									aReason: aReason
								};
								console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
								deferred_reflectMods.reject(rejObj);
							}
						).catch(
							function(aCaught) {
								console.error('Caught - promise_removeDummy - ', aCaught);
								throw aCaught;
							}
						);
					},
					function(aReason) {
						var rejObj = {
							promiseName: 'promise_makeDummy',
							aReason: aReason
						};
						console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
						deferred_reflectMods.reject(rejObj);
					}
				).catch(
					function(aCaught) {
						console.error('Caught - promise_makeDummy - ', aCaught);
						throw aCaught;
					}
				);
			};
			// start timer for reflect mods
			var reflectTimerEvent = {
				notify: function() {
					console.log('triggering reflectMods()');
					reflectMods();
				}
			};
			// end timer for reflect mods
			// end - reflect mods
			
			// start - promiseAll_makeMods and promise_All_reflectMods
			var deferred_reflectMods = new Deferred();
			var promise_reflectMods = deferred_reflectMods.promise;
			
			var promiseAllArr_makeMods = [
				promise_readThenWritePlist,
				promise_copyIcon,
				promise_execWrittenAndPermed,
				promise_xattr,
				promise_writePathsFile
			];
			var promiseAll_makeMods = Promise.all(promiseAllArr_makeMods);
			promiseAll_makeMods.then(
				function(aVal) {
					console.log('Fulfilled - promiseAll_makeMods - ', aVal);
					var reflectTimer = Cc['@mozilla.org/timer;1'].createInstance(Ci.nsITimer); // refelct mods block was here
					reflectTimer.initWithCallback(reflectTimerEvent, 1000, Ci.nsITimer.TYPE_ONE_SHOT);
				},
				function(aReason) {
					var rejObj = {
						promiseName: 'promiseAll_makeMods',
						aReason: aReason
					};
					console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
				}
			).catch(
				function(aCaught) {
					console.error('Caught - promiseAll_makeMods - ', aCaught);
					throw aCaught;
				}
			);
			// end - promiseAll_makeMods and promise_All_reflectMods
			
			// start - promiseAll_transformed
			var promiseAllArr_transformed = [promiseAll_makeMods, promise_reflectMods];
			var promiseAll_transformed = Promise.all(promiseAllArr_transformed);
			promiseAll_transformed.then(
				function(aVal) {
					console.log('Fulfilled - promiseAll_transformed - ', aVal);
					deferred_makeMacFFProfileLauncher.resolve('transformation completed, clicking this app wil now launch into profile of build of dir copied');
				},
				function(aReason) {
					var rejObj = {
						promiseName: 'promiseAll_transformed',
						aReason: aReason
					};
					console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
					promise_makeMacFFProfileLauncher.reject(rejObj);
				}
			).catch(
				function(aCaught) {
					console.error('Caught - promiseAll_transformed - ', aCaught);
					throw aCaught;
				}
			);
			// end - promiseAll_transformed
		},
		function(aReason) {
			var rejObj = {
				promiseName: 'promise_copyFxApp',
				aReason: aReason
			};
			console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
			deferred_makeMacFFProfileLauncher.reject(rejObj);
		}
	).catch(
		function(aCaught) {
			console.error('Caught - promise_read - ', aCaught);
			throw aCaught;
		}
	);
	
	return promise_makeMacFFProfileLauncher;
}


var promise_makeLauncher = makeMacFFProfileLauncher(OS.Constants.Path.profileDir, OS.Path.join(OS.Constants.Path.macLocalApplicationsDir, 'Firefox.app'), 'Firefox - current profile name here', null /*OS.Path.join(OS.Constants.Path.desktopDir, 'nightly.icns')*/, OS.Constants.Path.desktopDir);
promise_makeLauncher.then(
	function(aVal) {
		console.log('Fulfilled - promise_makeLauncher - ', aVal);
	},
	function(aReason) {
		var rejObj = {
			promiseName: 'promise_makeLauncher',
			aReason: aReason
		};
		console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
	}
).catch(
	function(aCaught) {
		console.error('Caught - promise_makeLauncher - ', aCaught);
	}
);