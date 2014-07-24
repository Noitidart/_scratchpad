Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");

//example1 - append to file
var logFile = FileUtils.getFile('Desk', ['rawr.txt']); //this gets file on desktop named 'rawr.txt'
writeFile(logFile, '\nthis is line 1, gets appended to any contents already there', true, function (status) {
    if (!Components.isSuccessCode(status)) {
        Services.wm.getMostRecentWindow(null).alert('writeFile failed');
    } else {
        Services.wm.getMostRecentWindow(null).alert('writeFile SUCCESFUL');
    }
});
writeFile(logFile, '\nthis is line 2 this gets appended', true, function (status) {
    if (!Components.isSuccessCode(status)) {
        Services.wm.getMostRecentWindow(null).alert('writeFile failed');
    } else {
        Services.wm.getMostRecentWindow(null).alert('writeFile SUCCESFUL');
    }
});

//example 2 - overwrite file
writeFile(logFile, '\nthis overwrites the file', true, function (status) {
    if (!Components.isSuccessCode(status)) {
        Services.wm.getMostRecentWindow(null).alert('writeFile failed');
    } else {
        Services.wm.getMostRecentWindow(null).alert('writeFile SUCCESFUL');
    }
});

//example 3 read file
readFile(file, function (dataReadFromFile, status) {
    if (!Components.isSuccessCode(status)) {
        Cu.reportError('read failed, file may not exist');
        Services.wm.getMostRecentWindow(null).alert('read failed, file may not exist');
    } else {
        Cu.reportError('read succesful, contents of file is:\n' + dataReadFromFile);
        Services.wm.getMostRecentWindow(null).alert('read succesful, contents of file is:\n' + dataReadFromFile);
    }
    
});

//end example

function writeFile(nsiFile, data, overwrite, callback) {
    //overwrite is true false, if false then it appends
    //nsiFile must be nsiFile
    if (!(nsiFile instanceof Ci.nsIFile)) {
        Cu.reportError('ERROR: must supply nsIFile ie: "FileUtils.getFile(\'Desk\', [\'rawr.txt\']" OR "FileUtils.File(\'C:\\\\\')"');
        return;
    }
    if (overwrite) {
        var openFlags = FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;
    } else {
        var openFlags = FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_APPEND;
    }
   //data is data you want to write to file
   //if file doesnt exist it is created
   var ostream = FileUtils.openFileOutputStream(nsiFile, openFlags)
 
  var converter = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);
   converter.charset = 'UTF-8';
   var istream = converter.convertToInputStream(data);
   // The last argument (the callback) is optional.
   NetUtil.asyncCopy(istream, ostream, function (status) {
      if (!Components.isSuccessCode(status)) {
         // Handle error!
         Cu.reportError('error on write isSuccessCode = ' + status);
         callback(status);
         return;
      }
      // Data has been written to the file.
      callback(status)
   });
}

function readFile(file, callback) {
    //file does not have to be nsIFile
   //you must pass a callback like function(dataReadFromFile, status) { }
   //then within the callback you can work with the contents of the file, it is held in dataReadFromFile
   //callback gets passed the data as string
   NetUtil.asyncFetch(file, function (inputStream, status) {
      //this function is callback that runs on completion of data reading
      if (!Components.isSuccessCode(status)) {
         Cu.reportError('error on file read isSuccessCode = ' + status);
         callback(null, status)
         return;
      }
      var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
      callback(data, status);
   });
}