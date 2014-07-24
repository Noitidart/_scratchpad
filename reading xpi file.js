var zw = Cc['@mozilla.org/zipwriter;1'].createInstance(Ci.nsIZipWriter);
var zr = Cc["@mozilla.org/libjar/zip-reader;1"].createInstance(Ci.nsIZipReader);
Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/FileUtils.jsm');

var reusableStreamInstance = Cc['@mozilla.org/scriptableinputstream;1'].createInstance(Ci.nsIScriptableInputStream);

//var pathExtFolder = OS.Path.join(OS.Constants.Path.profileDir, 'extensions');
var pathToXpiToRead = OS.Path.join(OS.Constants.Path.profileDir, 'extensions', 'PortableTester@jetpack.xpi');
var nsiFileXpi = new FileUtils.File(pathToXpiToRead);

//Services.ww.activeWindow.alert(pathToXpiToRead);

try {
  zr.open(nsiFileXpi); //if file dne it throws here
  var entries = zr.findEntries('*');
  while (entries.hasMore()) {
    var entryPointer = entries.getNext(); //just a string of "zip path" (this means path to file in zip, and it uses forward slashes remember)
    var entry = zr.getEntry(entryPointer); // should return true on `entry instanceof Ci.nsIZipEntry`
    console.log('entryPointer', entryPointer);
    /* CONSOLE OUTPUT
     * "entryPointer" "bootstrap.js" Scratchpad/1:18
     */
    console.info('entry', entry);
    /* CONSOLE OUTPUT
     * "entry" XPCWrappedNative_NoHelper { QueryInterface: QueryInterface(), compression: Getter, size: Getter, realSize: Getter, CRC32: Getter, isDirectory: Getter, lastModifiedTime: Getter, isSynthetic: Getter, permissions: Getter, compression: 8 } Scratchpad/1:19
     */
    if (!entry.isDirectory) {
      var inputStream = zr.getInputStream(entryPointer);
      reusableStreamInstance.init(inputStream);
      var fileContents = reusableStreamInstance.read(entry.realSize);
      console.log('contenst of file=', fileContents);
    } else {
      console.log('is directory, cannot read stream on it')
    }
  }
} catch (ex) {
  console.warn('exception occured = ', ex);
  if (ex.name == 'NS_ERROR_FILE_NOT_FOUND') {
    Services.ww.activeWindow.alert('XPI at path does not exist!\n\nPath = ' + pathToXpiToRead);
  }
} finally {
  zr.close();
  console.log('zr closed');
  //Cu.forceGC(); //im not sure shoud i do this here?
}