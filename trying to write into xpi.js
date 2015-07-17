var path = 'C:\\Users\\Vayeate\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\aksozfjt.Unnamed Profile 10\\extensions\\jid0-zDuE7MQZjTEpOLHPvhw3GbDyhIg@jetpack.xpi';
console.log('path:', path);
var xpi = new FileUtils.File(path);
console.log('xpi.exists:', xpi.exists());

var pr = {PR_RDONLY: 0x01, PR_WRONLY: 0x02, PR_RDWR: 0x04, PR_CREATE_FILE: 0x08, PR_APPEND: 0x10, PR_TRUNCATE: 0x20, PR_SYNC: 0x40, PR_EXCL: 0x80};

var zipWriter = Cc["@mozilla.org/zipwriter;1"].createInstance(Ci.nsIZipWriter);
try {
  zipWriter.open(xpi, pr.PR_RDWR | pr.PR_CREATE_FILE | pr.PR_TRUNCATE);
} catch (ex) {
  console.error('open ex:', ex)
}

var is = Cc["@mozilla.org/io/string-input-stream;1"].createInstance(Ci.nsIStringInputStream);
var fileConts_modsJson = 'rawr';
is.data = fileConts_modsJson;
zipWriter.addEntryStream('r.txt', Date.now(), Ci.nsIZipWriter.COMPRESSION_DEFAULT, is, false);

try {
  zipWriter.close();
} catch (ex) {
  console.error('close ex:', ex)
}
/*
Exception: [Exception... "Component returned failure code: 0xc1f30001 (NS_ERROR_NOT_INITIALIZED) [nsIZipWriter.addEntryStream]"  nsresult: "0xc1f30001 (NS_ERROR_NOT_INITIALIZED)"  location: "JS frame :: Scratchpad/1 :: <TOP_LEVEL> :: line 18"  data: no]
*/