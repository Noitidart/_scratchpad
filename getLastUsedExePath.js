function getLastUsedExePath(aProfileDirPath) {
	// last used exe path regardless of profilist installed
	path_aProfileCompatIni = OS.Path.join(aProfileDirPath, 'compatibility.ini');
	var promise_readCompatIni = OS.File.read(path_aProfileCompatIni, {encoding:'utf-8'});

	promise_readCompatIni.then(
		function(aVal) {
			console.log('Fullfilled - promise_readCompatIni - ', aVal);
			// start - do stuff here - promise_readCompatIni
			var path_aProfileLastPlatformDir = /^LastPlatformDir=(.*?)$/m.exec(aVal); //aVal.substr(aVal.indexOf(''), aVal.indexOf(// equivalent of Services.dirsvc.get('SrchPlugns', Ci.nsIFile) from within that running profile
			if (!path_aProfileLastPlatformDir) {
				console.error('regex failed');
				//deferredMain_getProfileSpecs.reject('regex failed to extract path_aProfileLastPlatformDir');
			} else {
				path_aProfileLastPlatformDir = path_aProfileLastPlatformDir[1];
				var specObj = {};
				if (OS.Constants.Sys.Name == 'Darwin') {
					if (path_aProfileLastPlatformDir.indexOf('profilist_data') > -1) {
						var nsifile_aProfileLastPlatformDir = new FileUtils.File(path_aProfileLastPlatformDir);
						path_aProfileLastPlatformDir = nsifile_aProfileLastPlatformDir.target;
					}						
					var split_exeCur = OS.Path.split(Services.dirsvc.get('XREExeF', Ci.nsIFile).path).components;
					var endingArr_exeCur = split_exeCur.slice(split_exeCur.indexOf('MacOS'));
					var endingStr_exeCur = OS.Path.join.apply(OS.File, endingArr_exeCur);
					
					var split_aProfileLastPlatformDir = OS.Path.split(path_aProfileLastPlatformDir).components;
					var startArr_aProfileLastPlatformDir = split_aProfileLastPlatformDir.slice(0, split_aProfileLastPlatformDir.indexOf('Contents') + 1);
					var startStr_aProfileLastPlatformDir = OS.Path.join.apply(OS.File, startArr_aProfileLastPlatformDir);
					specObj.path_exeForProfile = OS.Path.join(startStr_aProfileLastPlatformDir, endingStr_exeCur);
					console.info('darwin specObj.path_exeForProfile:', specObj.path_exeForProfile);				
				} else {
					var split_exeCur = OS.Path.split(Services.dirsvc.get('XREExeF', Ci.nsIFile).path).components;
					var endingStr_exeCur = split_exeCur[split_exeCur.length-1];
					console.info(path_aProfileLastPlatformDir, endingStr_exeCur);
					specObj.path_exeForProfile = OS.Path.join(path_aProfileLastPlatformDir, endingStr_exeCur);
				}
				console.log('success, the last exe path used was:', specObj.path_exeForProfile);
			}
			// end - do stuff here - promise_readCompatIni
		},
		function(aReason) {
			var rejObj = {name:'promise_readCompatIni', aReason:aReason};
			console.warn('Rejected - promise_readCompatIni - ', rejObj);
			//deferredMain_getProfileSpecs.reject(rejObj);
		}
	).catch(
		function(aCaught) {
			var rejObj = {name:'promise_readCompatIni', aCaught:aCaught};
			console.error('Caught - promise_readCompatIni - ', rejObj);
			//deferredMain_getProfileSpecs.reject(rejObj);
		}
	);
}

getLastUsedExePath(OS.Constants.Path.profileDir)