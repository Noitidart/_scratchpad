var myServices = {};
Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');
XPCOMUtils.defineLazyGetter(myServices, 'ds', function () { return Services.dirsvc.QueryInterface(Ci.nsIDirectoryService) });

/*
// on profile launcher creation do this:
// start - write main app paths file
var pathsFileContentsJson = {
	mainAppPath: Services.dirsvc.get('XREExeF', Ci.nsIFile).parent.parent.parent.path,
	main_profLD_LDS_basename: Services.dirsvc.get('ProfLD', Ci.nsIFile).parent.path,
	
};
var pathsFileContents = JSON.stringify(pathsFileContentsJson);
var path_to_pathsFile = OS.Path.join(pathToFFApp, 'Contents', 'MacOS', 'profilist-main-paths.json');
var promise_writePathsFile = OS.File.writeAtomic(path_to_pathsFile, pathsFileContents, {{encoding:'utf-8', tmpPath:path_to_pathsFile+'.bkp'}});
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
*/
// start - for use in dirProvider, getFile
function overrideSpecialPaths(pathsFileContentsJson) {
	var nsIFile_origAlias = {};
	
	var aliasAppPath = Services.dirsvc.get('XREExeF', Ci.nsIFile).parent.parent.parent.path;
	
	var mainAppPath = pathsFileContentsJson.mainAppPath;
	var main_profLD_LDS_basename = pathsFileContentsJson.main_profLD_LDS_basename;
	
	var specialKeyReplaceType = {
		//group
		'XREExeF': 3,
		'XREAppDist': 3,
		'DefRt': 3,
		'PrfDef': 3,
		'profDef': 3,
		'ProfDefNoLoc': 3,
		'ARes': 3,
		'AChrom': 3,
		'APlugns': 3,
		'SrchPlugns': 3,
		'XPIClnupD': 3,
		'CurProcD': 3,
		'XCurProcD': 3,
		'XpcomLib': 3,
		'GreD': 3,
		'GreBinD': 3,
		//group
		'UpdRootD': 5,
		//group
		'ProfLDS': 4,
		'ProfLD': 4
	};
	
	var replaceTypes = {
		3: function(key) {
			//replace aliasAppPath with mainAppPath after getting orig key value
			var newpath = nsIFile_origAlias[key].replace(aliasAppPath, mainAppPath);
			return new FileUtils.File(newpath);
		},
		4: function(key) {
			// for ProfLD and ProfLDS
			// replace basename of alias with basename of main IF its IsRelative=1
			// ProfLD and ProfLDS are same in all cases, IsRelative==1 || 0 and reg || alias
			// DefProfLRt AND DefProfRt are same in alias and reg in both IsRelative 1 and 0
			// IsRelative=1 ProfLD and ProfLDS are based on DefProfLRt in regular, but on DefProfRt in alias
			// so to detect if IsRelative == 1 I can test to see if ProfLD and ProfLDS contain DefProfLRt OR DefProfRt
			if (nsIFile_origAlias[key].path.indexOf(Services.dirsvc.get('DefProfLRt', Ci.nsIFile).path) > -1 || nsIFile_origAlias[key].path.indexOf(Services.dirsvc.get('DefProfRt', Ci.nsIFile).path) > -1) {
				// ProfLD or ProfLDS are keys, and they contain either DefProfLRt or DefProfRt, so its a realtive profile
				// IsRelative == 1
				// so need fix up on ProfLD and ProfLDS
				var newAlias_ProfLD_or_ProfLDS = nsIFile_origAlias[key].path.replace(nsIFile_origAlias['ProfLD'].parent.path, main_profLD_LDS_basename);
				return new FileUtils.File(newAlias_ProfLD_or_ProfLDS);
			} else {
				//IsRelative == 0
				// so no need for fix up, just return what it was
				console.log('no need for fixup of ProfLD or ProfLDS as this is custom path profile, meaning its absolute path, meaning IsRelative==0');
				return nsIFile_origAlias[key];
			}
		},
		5: function() {
			// for UpdRootD
			// replaces the aliasAppPath (minus the .app) in UpdRootD with mainAppPath (minus the .app)
			var aliasAppPath_noExt = aliasAppPath.substr(0, aliasAppPath.length-('.app'.length));
			var mainAppPath_noExt = mainAppPath.substr(0, mainAppPath.length-('.app'.length));
			var newpath = nsIFile_origAlias['UpdRootD'].replace(aliasAppPath_noExt, mainAppPath_noExt);
			return new FileUtils.File(newpath);
		}
		// not yet cross checked with custom path
	};
	
	var dirProvider = {
		getFile: function(aProp, aPersistent) {
			aPersistent.value = true;
			if (replaceTypes[specialKeyReplaceType[aProp]]) {
				return replaceTypes[specialKeyReplaceType[aProp]](aProp);
			}
			return null;
		},
		QueryInterface: function(aIID) {
			if (aIID.equals(Ci.nsIDirectoryServiceProvider) || aIID.equals(Ci.nsISupports)) {
				return this;
			}
			throw Cr.NS_ERROR_NO_INTERFACE;
		}
	};

	for (var key in specialKeyReplaceType) {
		nsIFile_origAlias = Services.dirsvc.get(key, Ci.nsIFile);
		/*
		if (specialKeyReplaceType[key] == 2) {
			path_origAlias[key] = Services.dirsvc.get(key, Ci.nsIFile).path;
		}
		*/
		myServices.ds.QueryInterface(Ci.nsIProperties).undefine(key);
	}
	myServices.ds.registerProvider(dirProvider);
	//myServices.ds.unregisterProvider(dirProvider);
}
// end - for use in dirProvider, getFile

function checkIfShouldOverridePaths() {
	var path_to_ThisPathsFile = OS.Path.join(OS.Constatns.Path.libDir, 'profilist-main-paths.json');
	var promise_readThisPathsFile = read_encoded(path_to_ThisPathsFile, {encoding:'utf-8'});
	promise_readThisPathsFile.then(
		function(aVal) {
			console.log('Fulfilled - promise_readThisPathsFile - ', aVal);
			
			//deferred_readThenWritePlist.resolve();
		},
		function(aReason) {
			var rejObj = {
				promiseName: 'promise_readThisPathsFile',
				aReason: aReason
			};
			console.error('Rejected - ' + rejObj.promiseName + ' - ', rejObj);
			if (rejObj.becauseNoSuchFile) {
				console.error('Rejected - ' + rejObj.promiseName + ' - BUT if it doesnt exist that just means we dont need to override paths, so this is fine', rejObj);
			}
			//deferred_readThenWritePlist.reject(rejObj);
		}
	).catch(
		function(aCaught) {
			console.error('Caught - promise_readThisPathsFile - ', aCaught);
			throw aCaught;
		}
	);
}

checkIfShouldOverridePaths();