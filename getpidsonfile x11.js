Cu.import('resource://gre/modules/osfile.jsm');
var decoder;

function getPidsOfFile(filepath) {  
  try {
    var env;

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

    var pathOutput = OS.Path.join(OS.Constants.Path.desktopDir, 'getingpidsonfile.txt');

    var procFinned = {
        observe: function (aSubject, aTopic, aData) {
          console.log('ps completed');
          if (Services.appinfo.version < 30) {
            var promise_read_pidsonfile = OS.File.read(pathOutput);
          } else {
            var promise_read_pidsonfile = OS.File.read(pathOutput, {encoding:'utf-8'});
          }

          return promise_read_pidsonfile.then(
           function(aVal) {
            if (Services.appinfo.version < 30) {
              if (!decoder) {
                decoder = new TextDecoder(); // This decoder can be reused for several reads
              }
              var readStr = decoder.decode(aVal); // Convert this array to a text
            } else {
              var readStr = aVal;
            }
             var retPids = readStr;
             var promise_del_pidsonfile = OS.File.remove(pathOutput);
              promise_del_pidsonfile.then(
                function() {
                 //ok nice
                  console.log('succesfully deleted pidsonfile.txt');
                },
                function(aReason) {
                 console.warn('Failed to delete pathOutput file for reason: ', aReason);
                 //just an exception no need to break code for error
                }
              );
             
             return Promise.resolve(retPids); //purposely not passing aVal to this suc func so it takes aVal from above
           },
            function(aReason) {
              console.error('failed to read pidsonfile for aReason:' + aReason);
              return Promise.reject('failed to read pidsonfile for aReason:' + aReason);
            }
          );
        }
    };


    var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
    var args = ['-c', 'lsof ' + filepath.replace(/\W/g, '\\$&') + ' > ' + pathOutput.replace(/\W/g, '\\$&')];
    process.init(fileFor.bash);
    process.runAsync(args, args.length, procFinned);
  } catch (ex) {
    console.error('getPidsOfFile failed for aReason: ', aReason);
    return Promise.reject('getPidsOfFile failed for aReason: ' + aReason);
  }
}