Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/Promise.jsm');

var thisWin = Services.ww.activeWindow;
var rootPathDefault = FileUtils.getFile('DefProfRt', []).path;
var localPathDefault = FileUtils.getFile('DefProfLRt', []).path;
var pathProfilesIni = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profiles.ini');
var decoder;

function getProfileDetailsByName(profileName) {
  //provide either name or path
		if (Services.appinfo.version < 30) {
			var promise = OS.File.read(pathProfilesIni); // Read the complete file as an array
		} else {
			var promise = OS.File.read(pathProfilesIni, {encoding:'utf-8'}); // Read the complete file as an array
		}
		return promise.then(
			function(aVal) {
				if (Services.appinfo.version < 30) {
					if (!decoder) {
						decoder = new TextDecoder(); // This decoder can be reused for several reads
					}
					var readStr = decoder.decode(aVal); // Convert this array to a text
				} else {
					var readStr = aVal;
				}
        
        var details = new RegExp('^Name=' + escapeRegExp(profileName) + '$[\\s\\S]*?IsRelative=(\\d)[\\s\\S]*?Path=(.*?)$', 'mi').exec(readStr);
        if (!details) {
          return Promise.reject('profile with this name NOT FOUND');
          //console.error('profile with this name NOT FOUND');
          //throw new Error('profile with this name NOT FOUND');
        }
        var ret = {
          IsRelative: details[1],
          Path: details[2]
        };
        //Services.ww.activeWindow.alert(uneval(ret));
        
        console.log('ret:', ret);
        return Promise.resolve(ret);
      },
      function(aReason) {
        console.error('failed to read ini file, aReason:', aReason);
        throw('failed to read ini file, aReason:' + aReason)
        return Promise.reject('failed to read ini file, aReason:', aReason)
      }
    );
}

function getPidOfLockedFile(filepath) {  
  var env;
  var rootDirPathOfCurrentProfile = OS.Constants.Path.profileDir;
  var aDirectMACNIX = OS.Path.join(rootDirPathOfCurrentProfile, '.parentlock');
  var pathProfilesIni = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profiles.ini');

  if (!pathFor || pathFor.bash == 0) {
    var pathFor = {
      'bash': 0
    };
    var fileFor = {}; //populatdd based on pathsFor

    if (!env) {
     env = Cc['@mozilla.org/process/environment;1'].getService(Ci.nsIEnvironment);
    }
    var paths = env.get('PATH').split(':');
    var len = paths.length;

    for (var p in pathFor) {
        for (var i = 0; i < len; i++) {
          try {
            var fullyQualified = new FileUtils.File(OS.Path.join(paths[i], p));
            console.log('search for:', p, 'fullyQualified:', fullyQualified.path)
            if (fullyQualified.exists()) {
              fileFor[p] = fullyQualified;
              pathFor[p] = fullyQualified.path;
              break;
            }
          } catch (e) {
            // keep checking PATH if we run into NS_ERROR_FILE_UNRECOGNIZED_PATH
          }
        }
    }


    if (!fileFor.bash) {
      console.error("Error: a task list executable not found on filesystem");
      thisWin.alert('Error: a task list executable not found on filesystem');
      throw new Error("Error: a task list executable not found on filesystem");
    }
  }

  var procFinned = {
      observe: function (aSubject, aTopic, aData) {
        console.log('ps completed');
        var promise = OS.File.read(aDirectMACNIX)
      }
  };


  var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
  var pathOutput = OS.Path.join(OS.Constants.Path.desktopDir, 'newt.txt');
  var args = ['-c', 'lsof ' + aDirectMACNIX + ' > ' + pathOutput];
  process.init(fileFor.bash);
  process.runAsync(args, args.length, procFinned);
}

function escapeRegExp(text) {
  if (!arguments.callee.sRE) {
    var specials = ['/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\'];
    arguments.callee.sRE = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
  }
  return text.replace(arguments.callee.sRE, '\\$1');
}

function focusMostRecentWindowOfProfile(profileName) {
  try {
    //profileName is not case sensitive
    var profileDetails_promise = getProfileDetailsByName(profileName);
    return profileDetails_promise.then(
      function(aVal) {
        if (aVal.IsRelative == '1') {
          var dirName = OS.Path.basename(OS.Path.normalize(aVal.Path));
          var PathRootDir = OS.Path.join(rootPathDefault, dirName);

        } else {
          var PathRootDir = aVal.Path; //may need to normalize this for other os's than xp and 7  im not sure
        }

        var parentlock_path = [
          OS.Path.join(PathRootDir, '.parentlock'),
          OS.Path.join(PathRootDir, 'parent.lock')
        ]
        var promise_check_path0 = OS.File.exists(parentlock_path[0]);
        var promise_check_path1 = OS.File.exists(parentlock_path[1]);
        return Promise.all([promise_check_path0, promise_check_path1]).then(
          function(aVal) {
            console.log('race success, aVal:', aVal);
            if (aVal[0] == true)  {
              var parentlock_path_i = 0;
            } else if (aVal[1] == true) {
              var parentlock_path_i = 1;
            } else {
              console.log('neither file exists, so probably profile is not yet created, it definitely is not in use yet')
              //if failed on both, this should not happen as
              //http://mxr.mozilla.org/mozilla-release/source/profile/dirserviceprovider/src/nsProfileLock.cpp#430
              //the lock file name is either parent.lock or .parentlock
              return Promise.reject('profile is not in use');
            }
            var promise_check_if_locked = OS.File.open(parentlock_path[parentlock_path_i]);
            return promise_check_if_locked.then(
             function(aVal) {
               //profile is not in use
               console.exception('promise_check_if_locked suc, aVal:', aVal);
               aVal.close();
               return Promise.reject('profile is not in not in use, so no windows to focus');
             },
              function(aReason) {
                if ('winLastError' in aReason) {
                  if (aReason.winLastError == 32) {
                    console.exception('promise_check_if_locked rejected, aReason:', aReason);
                    return Promise.resolve('profile is in use now need to get pid and focus it')
                  }
                } else {
                  console.error('failed to open file and it wasnt for sharing violation so cant tell if its locked or not');
                  console.info('aReason.toMsg:', aReason.toMsg());
                  console.info('aReason.toString:', aReason.toString());
                  return Promise.resolve('could not verify if profile lock file is locked or not, in other words could not verify if profile is in use or not for some unknown reason, aReason: ' + aReason);
                }
              }
            )
          },
          function(aReason) {
            console.error('so weird both promises failed, aReason:', aReason)
            throw new Error('so weird both promises failed, aReason:' + aReason);
          }
        );
      },
      function(aReason) {
        if (aReason == 'profile with this name NOT FOUND') {
          thisWin.alert('profile with name "' + profileName + '" does not exist');
          return Promise.reject('blah');
        } else {
          return Promise.reject('getting profile details failed for aReason: ' + aReason);
        }
      }
    );
  } catch (ex) {
    throw ex;
    return Promise.reject('focusMostRecentWindowOfProfileByname failed for aReason: ' + aReason);
  }
}

var focus_promise = focusMostRecentWindowOfProfile('dev');
focus_promise.then(
  function(aVal) {
    //success
    thisWin.alert('suc: ' + uneval(aVal));
  },
  function(aReason) {
    //failed
    thisWin.alert('fail: ' + uneval(aReason));
  }
);

/*
    var profileDetails_promise = getProfileDetailsByName('dev');
    profileDetails_promise.then(
      function(aval) {
        thisWin.alert('done: ' + uneval(aVal));
      },
      function(aReason) {
        thisWin.alert('failed:' + uneval(aReason));
      }
     );
*/