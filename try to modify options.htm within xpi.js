var {classes: Cc, interfaces: Ci, results: Cr, Constructor: CC, utils: Cu } = Components;

let ZipFileReader = CC("@mozilla.org/libjar/zip-reader;1", "nsIZipReader", "open");
let ZipFileWriter = CC("@mozilla.org/zipwriter;1", "nsIZipWriter", "open");
let ScriptableInputStream = CC("@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream", "init");
var gCont = '';

function handleEntry(name) {
  try {
    let entry = this.getEntry(name);
    if (entry.isDirectory) {
      console.log(name + " is directory, no stream to read");
      return false;
    }
    let stream = new ScriptableInputStream(this.getInputStream(name));
    try {
      // Use readBytes to get binary data, read to read a (null-terminated) string
      let contents = stream.readBytes(entry.realSize);
      gCont = contents;
      console.log("Contents of " + name, contents);
    }
    finally {
      stream.close();
    }
    return true;
  }
  catch (ex) {
    console.warn("Failed to read " + name);
  }
  return false;
}

try {
  var xpi = Services.dirsvc.get("ProfD", Ci.nsIFile);   
  "extensions/MailtoWebmails@jetpack.xpi".
    split("/").forEach(p => xpi.append(p));

  let reader = new ZipFileReader(xpi);
  try {
    let entries = reader.findEntries('options/prefs.html');
    while (entries.hasMore()) {
      let name = entries.getNext();
      if (handleEntry.call(reader, name)) {
        console.debug("Handled entry " + name);
      }
    }
  }
  finally {
    reader.close();
      //start - edit it and write it back
      //console.log('xpi:', xpi)
      let writer = new ZipFileWriter(xpi, 0x2c);
      try {
       /*let is = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
       console.log('contents:', gCont)
       is.data = gCont.replace('Add/Remove Handlers', 'hacked');
       writer.addEntryStream(entry, Date.now(), Ci.nsIZipWriter.COMPRESSION_FASTEST, is, !1);*/
      } catch(subEx) {
        console.warn("Failed to write " + name, 'subEx:', subEx);
      } finally {
       writer.close();
      }
      //let is = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
      //is.data = ...querySelector(...).value;
      //zipWriter.addEntryStream(n, Date.now(), Ci.nsIZipWriter.COMPRESSION_FASTEST, is, !1);
      //end - edit it and write it back
  }
}
catch (ex if ex.result == Cr.NS_ERROR_FILE_NOT_FOUND) {
  Services.ww.activeWindow.alert("XPI at path does not exist!\n\nPath = " + xpi.path);
}
catch (ex) {
  console.warn("exceptional exception", ex);
}