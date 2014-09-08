var pathProfilesIni = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profiles.ini');
var ini;

function readIni() {
//non reg
//is promise
	try {
	//	console.log('in read');
		//if (!decoder) {
	//		console.log('decoder not inited');
			var decoder = new TextDecoder(); // This decoder can be reused for several reads
		//}
	//	console.log('decoder got');
	//	console.log('starting read');
		let promise = OS.File.read(pathProfilesIni); // Read the complete file as an array
	//	console.log('read promise started');
		return promise.then(
			function(ArrayBuffer) {
				var readStr = decoder.decode(ArrayBuffer); // Convert this array to a text
	//			//console.log(readStr);
				ini = {};
				var patt = /\[(.*?)(\d*?)\](?:\s+?(.+?)=(.*))(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?/mg; //supports 10 lines max per block `(?:\s+?(.+?)=(.*))?` repeat that at end
				var blocks = [];

				var match;
				while (match = patt.exec(readStr)) {
	//				//console.log('MAAAAAAAAAAATCH', match);

					var group = match[1];
					ini[group] = {};

					if (group == 'Profile') {
						ini[group]['num'] = match[2];
					}

					ini[group].props = {};

					for (var i = 3; i < match.length; i = i + 2) {
						var prop = match[i];
						if (prop === undefined) {
							break;
						}
						var propVal = match[i + 1]
						ini[group].props[prop] = propVal;
					}

					if (group == 'Profile') {
						//Object.defineProperty(ini, ini[group].props.Name, Object.getOwnPropertyDescriptor(ini[group], group));
						ini[ini[group].props.Name] = ini[group];
						delete ini[group];
					}
				}
	//			console.log('successfully read ini = ', ini);
				return Promise.resolve(ini);
			},
			function(aRejectReason) {
	//			console.error('Read ini failed');
				return Promise.reject('Profiles.ini could not be read to memoery. ' + aRejectReason.message);
			}
		);
	} catch (ex) {
		console.error('Promise Rejected `readIni` - ', ex);
		return Promise.reject('Promise Rejected `readIni` - ' + ex);
	}
}

/*start - salt generator from http://mxr.mozilla.org/mozilla-aurora/source/toolkit/profile/content/createProfileWizard.js?raw=1*/
var kSaltTable = [
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
	'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
];

function saltName(aName) {
	var kSaltString = '';
	for (var i = 0; i < 8; ++i) {
		kSaltString += kSaltTable[Math.floor(Math.random() * kSaltTable.length)];
	}
	return kSaltString + '.' + aName;
}
/*end - salt generator*/

function createProfile(refreshIni, profName) {
	//profName must be either just a name (IsRelative=1) OR an absolte path (IsRelative=0)
	
//is promise
	try {
		//refreshIni is 0,1 or programmatically 2
		if (refreshIni == 1) {
			var promise = readIni();
			return promise.then(
				function() {
	//				console.log('now that ini read it will now createProfile with name = ' + profName);
					return createProfile(2, profName);
				},
				function(aRejectReason) {
	//				console.error('Failed to refresh ini object from file during renameProfile');
					return Promise.reject(aRejectReason.message);
				}
			);
		} else {
	//		console.log('in createProfile create part');
			if (profName in ini) {
				//Services.prompt.alert(null, self.name + ' - ' + 'EXCEPTION', 'Cannot create profile with name "' + newName + '" because this name is already taken by another profile.');
				return Promise.reject('Cannot create profile with name "' + newName + '" because this name is already taken by another profile.');
			}
			//create folder in root dir (in it, one file "times.json" with contents:
			/*
			{
			"created": 1395861287491
			}

			*/
			//todo: im curious i should ask at ask.m.o how come when profile is custom driectory, a folder in local path is not created, of course the one to the custom path will be root. b ut why not make a local folder? like is done for IsRelative createds?
			//create folder in local dir if root dir is different (this one is empty)
			//add to profiles ini
			//check if profile exists first
			var numProfiles = profToolkit.profileCount; //Object.keys(ini) - 1;
			
			if (IsRelative == 1) {
				var dirName = saltName(profName);
				//get relative path
				var mRootDir = new FileUtils.File(OS.Constants.Path.userApplicationDataDir);
				var IniPathStr = FileUtils.getFile('DefProfRt', [dirName]);
				var PathToWriteToIni = IniPathStr.getRelativeDescriptor(mRootDir); //returns "Profiles/folderName"
				//end get relative path
			} else {
				var dirName = OS.Path.basename(profName);
				var PathToWriteToIni = profName;
			}
			
			if (IsRelative == 1) {
				var rootPathDefaultDirPath = OS.Path.join(profToolkit.rootPathDefault, dirName);
				var localPathDefaultDirPath = OS.Path.join(profToolkit.localPathDefault, dirName);
				if (rootPathDefaultDirPath == localPathDefaultDirPath) {
					localPathDefaultDirPath = null; //just checking if root dir and local dir have different paths, if not then no need to create
				}
			} else {
				var rootPathDefaultDirPath = profName;
				var localPathDefaultDirPath = null; //for absolute profile paths, local dir is same as root dir //this is just how ff does it
			}
			
			console.log('rootPathDefaultDirPath=',rootPathDefaultDirPath);
			console.log('localPathDefaultDirPath=',localPathDefaultDirPath);
			
			
			
			ini[profName] = {
				num: numProfiles,
				props: {
					Name: profName,
					IsRelative: IsRelative,
					Path: PathToWriteToIni
				}
			}
	//		console.log('created ini entry for profName', ini[profName]);

			console.log('starting promise for make root dir');
			var PromiseAllArr = [];
			if (IsRelative == 1) {
				var promise = OS.File.makeDir(rootPathDefaultDirPath);
				//can do this because for sure everything is created except the final component
			} else {
				//have to go recursive because dirs before final componenet may not exist
				var pnSplit = OS.Path.split(profName);
				var promise = OS.File.makeDir(profName, {
					 from: pnSplit.components[0]
				});
			}
			promise.then(
				function() {
	//				console.log('successfully created root dir for profile ' + profName + ' the path is = ', rootPathDefaultDirPath);
					if (!encoder) {
						encoder = new TextEncoder(); // This encoder can be reused for several writes
					}
					let BufferArray = encoder.encode('{\n"created": ' + new Date().getTime() + '}\n');
					var timesJsonPath = OS.Path.join(rootPathDefaultDirPath, 'times.json');
					let promise3 = OS.File.writeAtomic(timesJsonPath, BufferArray, {tmpPath: timesJsonPath + '.profilist.tmp'});
					return promise3.then(
						function() {
//							console.log('succesfully created times.json for profName of ' + profName + ' path is = ', OS.Path.join(rootPathDefaultDirPath, 'times.json'));
							//rootDirMakeDirDone = true;
							return Promise.resolve('succesfully created rootPathDefaultDirPath and times.json');
						},
						function() {
//							console.error('FAILED creating times.json for profName of ' + profName + ' failed times.json path is = ', OS.Path.join(rootPathDefaultDirPath, 'times.json'));
							return Promise.reject('FAILED creating times.json for profName of ' + profName + ' failed times.json path is = ' + OS.Path.join(rootPathDefaultDirPath, 'times.json'));
						}
					);
				},
				function() {
	//				console.error('FAILED to create root dir for profile ' + profName + ' the path is = ', rootPathDefaultDirPath);
					return Promise.reject('FAILED to create root dir for profile ' + profName + ' the path is = ' + rootPathDefaultDirPath);
				}
			);
			PromiseAllArr.push(promise);
			if (localPathDefaultDirPath !== null) {
				var promise2 = OS.File.makeDir(localPathDefaultDirPath);
				promise2.then(
					function() {
	//					console.log('successfully created local dir for profile ' + profName + ' the path is = ', localPathDefaultDirPath);
						//localDirMakeDirDone = true;
						//checkReadyAndLaunch();
						return Promise.resolve('localPathDefaultDirPath made');
					},
					function() {
	//					console.error('FAILED to create local dir for profile "' + profName + '" the path is = ', localPathDefaultDirPath);
						return Promise.reject('FAILED to create local dir for profile "' + profName + '" the path is = ' + localPathDefaultDirPath);
					}
				);
				PromiseAllArr.push(promise2);
			}
			var promise4 = writeIni();
			promise4.then(
				function() {
	//				console.log('SUCCESS on updating ini with new profile');
					//profilesIniUpdateDone = true;
					//checkReadyAndLaunch();
					return Promise.resolve('writeIni success');
				},
				function() {
	//				console.log('updating ini with newly created profile failed');
					return Promise.reject('updating ini with newly created profile failed');
				}
			);
			PromiseAllArr.push(promise4);
			
			return Promise.all(PromiseAllArr).then(
				function onSuc(aDat) {
					//checkReadyAndLaunch();
					//create profile process is done, if you want, you can now launch the profile here
					if (launchProfileOnCreate) {
						myServices.as.showAlertNotification(self.aData.resourceURI.asciiSpec + 'icon.png', self.name + ' - ' + 'Creating Profile', 'Name: "' + profName + '"', false, null, null, 'Profilist');
						launchProfile(null, profName, 1, self.aData.installPath.path);
					}
	//				console.log('profile launched and now updating prof toolkit with refreshIni 1');
					return updateProfToolkit(1, 1).then(
						function() {
							return Promise.resolve('updateProfToolkit success');
						},
						function() {
							return Promise.reject('updateProfToolkit failed');
						}
					);
				},
				function onRej(aReas) {
					console.error('PromiseAllArr of failed:', aReas);
					return Promise.reject('PromiseAllArr of failed:' + aReas);
				}
			);
			//see here: http://mxr.mozilla.org/mozilla-aurora/source/toolkit/profile/content/createProfileWizard.js
			
	/*
	29     var dirService = C["@mozilla.org/file/directory_service;1"].getService(I.nsIProperties);
	30     gDefaultProfileParent = dirService.get("DefProfRt", I.nsIFile);
	73   var defaultProfileDir = gDefaultProfileParent.clone();
	74   defaultProfileDir.append(saltName(document.getElementById("profileName").value));
	75   gProfileRoot = defaultProfileDir;
	*/

			//see here for internal: http://mxr.mozilla.org/mozilla-aurora/source/toolkit/profile/content/profileSelection.js#139
			//actually see here for internal: http://mxr.mozilla.org/mozilla-central/source/toolkit/profile/nsToolkitProfileService.cpp#699
			
		}
	} catch(ex) {
		console.error('Promise Rejected `createProfile` - ', ex);
		return Promise.reject('Promise Rejected `createProfile` - ' + ex);
	}
}

var promise = readIni();
console.time('readIni');
promise.then(
  function() {
   console.timeEnd('readIni');
   console.log('done reading, ini:', ini);
  },
  function(aReason) {
    console.timeEnd('readIni');
    console.error('failed reading ini, aReason:', aReason);
  }
)