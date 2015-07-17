Cu.import('resource://gre/modules/osfile.jsm');

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

function read_encoded(path, options) {
	// because the options.encoding was introduced only in Fx30, this function enables previous Fx to use it
	// must pass encoding to options object, same syntax as OS.File.read >= Fx30
	// TextDecoder must have been imported with Cu.importGlobalProperties(['TextDecoder']);
	
	var deferred_read_encoded = new Deferred();
	
	if (options && !('encoding' in options)) {
		deferred_read_encoded.reject('Must pass encoding in options object, otherwise just use OS.File.read');
		return deferred_read_encoded.promise;
	}
	
	if (options && Services.vc.compare(Services.appinfo.version, 30) < 0) { // tests if version is less then 30
		//var encoding = options.encoding; // looks like i dont need to pass encoding to TextDecoder, not sure though for non-utf-8 though
		delete options.encoding;
	}
	var promise_readIt = OS.File.read(path, options);
	
	promise_readIt.then(
		function(aVal) {
			console.log('Fullfilled - promise_readIt - ', {a:{a:aVal}});
			// start - do stuff here - promise_readIt
			var readStr;
			if (Services.vc.compare(Services.appinfo.version, 30) < 0) { // tests if version is less then 30
				readStr = getTxtDecodr().decode(aVal); // Convert this array to a text
			} else {
				readStr = aVal;
			}
			deferred_read_encoded.resolve(readStr);
			// end - do stuff here - promise_readIt
		},
		function(aReason) {
			var rejObj = {name:'promise_readIt', aReason:aReason};
			console.warn('Rejected - promise_readIt - ', rejObj);
			deferred_read_encoded.reject(rejObj);
		}
	).catch(
		function(aCaught) {
			var rejObj = {name:'promise_readIt', aCaught:aCaught};
			console.error('Caught - promise_readIt - ', rejObj);
			deferred_read_encoded.reject(rejObj);
		}
	);
	
	return deferred_read_encoded.promise;
}

var _cache_bashToFile; // holds nsifile and paths to it
function bashToFile(bashArg) {
  // bashArg must be string
  // if have a path in your string make sure to do a .replace(/\W/g, '\\$&') on it otherwise it doesnt work right
  
  var deferredMain_bashToFile = new Deferred();
  
  if (!_cache_bashToFile) {
    _cache_bashToFile = {};
    var env = Cc['@mozilla.org/process/environment;1'].getService(Ci.nsIEnvironment);
    var paths = env.get('PATH').split(':');
    var len = paths.length;
    
    var pathFor = {
        'bash': 0
    };

    for (var p in pathFor) {
      for (var i = 0; i < len; i++) {
        try {
          var fullyQualified = new FileUtils.File(OS.Path.join(paths[i], p));
          console.log('search for:', p, 'fullyQualified:', fullyQualified.path)
          if (fullyQualified.exists()) {
            _cache_bashToFile[p] = {
              nsifile: fullyQualified,
              ospath: fullyQualified.path
            };
            break;
          }
        } catch (e) {
          // keep checking PATH if we run into NS_ERROR_FILE_UNRECOGNIZED_PATH
        }
      }
    }
    

    var throwErr = false;
    var errArr = [];
    for (var p in pathFor) {
      if (!(p in _cache_bashToFile)) {
        console.error("Error: a task list executable not found on filesystem:", 'p:', p, 'paths:', paths);
        throwErr = true;
      }
    }
    if (throwErr) {
      deferredMain_bashToFile.reject("Error: a task list executable not found on filesystem see browser console for dump lops");
      //throw new Error("Error: a task list executable not found on filesystem see browser console for dump lops");
      return deferredMain_bashToFile.promise; // to prevent furtehr exec
    }
  }
  
  var pathOutput = OS.Path.join(OS.Constants.Path.desktopDir, 'bashToFile_dump.txt');
  
    var procFinned = {
        observe: function (aSubject, aTopic, aData) {
          console.log('bash nsIProcess completed');
          
          var promise_readBashDump = read_encoded(pathOutput, {encoding:'utf-8'});
          promise_readBashDump.then(
            function(aVal) {
              console.log('Fullfilled - promise_readBashDump - ', aVal);
              // start - do stuff here - promise_readBashDump
              deferredMain_bashToFile.resolve(aVal);
              // remove dump file
              var promise_delDump = OS.File.remove(pathOutput); // i dont care to handle this promise
              promise_delDump.then(
                function(aVal) {
                  console.log('Fullfilled - promise_delDump - ', aVal);
                  // start - do stuff here - promise_delDump
                  // end - do stuff here - promise_delDump
                },
                function(aReason) {
                  var rejObj = {name:'promise_delDump', aReason:aReason};
                  console.error('Rejected - promise_delDump - ', rejObj);
                  //deferred_createProfile.reject(rejObj);
                }
              ).catch(
                function(aCaught) {
                  var rejObj = {name:'promise_delDump', aCaught:aCaught};
                  console.error('Caught - promise_delDump - ', rejObj);
                  //deferred_createProfile.reject(rejObj);
                }
              );
              // end - do stuff here - promise_readBashDump
            },
            function(aReason) {
              var rejObj = {name:'promise_readBashDump', aReason:aReason};
              console.warn('Rejected - promise_readBashDump - ', rejObj);
              deferredMain_bashToFile.reject(rejObj);
            }
          ).catch(
            function(aCaught) {
              var rejObj = {name:'promise_readBashDump', aCaught:aCaught};
              console.error('Caught - promise_readBashDump - ', rejObj);
              deferredMain_bashToFile.reject(rejObj);
            }
          );
        }
    };

    var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
    var args = ['-c', bashArg + ' > ' + pathOutput.replace(/\W/g, '\\$&')];
    process.init(_cache_bashToFile.bash.nsifile);
    process.runAsync(args, args.length, procFinned);
  
  return deferredMain_bashToFile.promise;
}

/* start example usage */
var aDirectMACNIX = OS.Path.join(OS.Constants.Path.profileDir, '.parentlock');

var promise_getpids = bashToFile('lsof ' + aDirectMACNIX.replace(/\W/g, '\\$&'));
promise_getpids.then(
	function(aVal) {
		console.log('Fullfilled - promise_getpids - ', aVal);
		// start - do stuff here - promise_getpids
		// end - do stuff here - promise_getpids
	},
	function(aReason) {
		var rejObj = {name:'promise_getpids', aReason:aReason};
		console.error('Rejected - promise_getpids - ', rejObj);
	}
).catch(
	function(aCaught) {
		var rejObj = {name:'promise_getpids', aCaught:aCaught};
		console.error('Caught - promise_getpids - ', rejObj);
	}
);