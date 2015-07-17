function do_get_file(path, allowNonexistent) { //https://dxr.mozilla.org/mozilla-central/source/mobile/android/base/tests/robocop_head.js#803
  try {
    let lf = Components.classes["@mozilla.org/file/directory_service;1"]
      .getService(Components.interfaces.nsIProperties)
      .get("CurWorkD", Components.interfaces.nsILocalFile);

    let bits = path.split("/");
    for (let i = 0; i < bits.length; i++) {
      if (bits[i]) {
        if (bits[i] == "..")
          lf = lf.parent;
        else
          lf.append(bits[i]);
      }
    }

    if (!allowNonexistent && !lf.exists()) {
      // Not using do_throw(): caller will continue.
      _passed = false;
      var stack = Components.stack.caller;
      console.error("TEST-UNEXPECTED-FAIL | " + stack.filename + " | [" +
            stack.name + " : " + stack.lineNumber + "] " + lf.path +
            " does not exist\n");
    }

    return lf;
  }
  catch (ex) {
    console.error(ex.toString(), Components.stack.caller);
  }

  return null;
}

var gTestID = 'gTestID/';
function getApplyDirPath() {
  return gTestID + "/dir.app/";
}

function getApplyDirFile(aRelPath, aAllowNonexistent) {
  let relpath = getApplyDirPath() + (aRelPath ? aRelPath : "");
  return do_get_file(relpath, aAllowNonexistent);
}
var DIR_MACOS = 'DIR_MACOS';
var FILE_APP_BIN = 'FILE_APP_BIN';
var XRE_EXECUTABLE_FILE = 'XREExeF';
var XRE_UPDATE_ROOT_DIR = 'XRE_UPDATE_ROOT_DIR';
let dirProvider = {
    getFile: function AGP_DP_getFile(aProp, aPersistent) {
      aPersistent.value = true;
      switch (aProp) {
        case XRE_EXECUTABLE_FILE:
            return getApplyDirFile(DIR_MACOS + FILE_APP_BIN, true);
          break;
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

var ds = Services.dirsvc.QueryInterface(Ci.nsIDirectoryService);
ds.QueryInterface(Ci.nsIProperties).undefine('XREExeF');
console.log(rez)
ds.registerProvider(dirProvider);