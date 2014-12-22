Cu.import('resource://gre/modules/osfile.jsm');

var rootDirPathOfCurrentProfile = OS.Constants.Path.profileDir;

var aDirectMACNIX = rootDirPathOfCurrentProfile;

Cu.import('resource://gre/modules/FileUtils.jsm');
var tps = Cc['@mozilla.org/toolkit/profile-service;1'].createInstance(Ci.nsIToolkitProfileService); //toolkitProfileService

var aDirect = new FileUtils.File(aDirectMACNIX);
//var aTemp = new FileUtils.File(OS.Path.join(localPathDefault, folderOfProfile));
try {
    var locker = tps.lockProfilePath(aDirect, null)
    Services.ww.activeWindow.alert('NOT open');
    locker.unlock();
} catch (ex) {
    if (ex.result == Cr.NS_ERROR_FILE_ACCESS_DENIED) {
        Services.ww.activeWindow.alert('its in use');
    } else {
        throw ex;
    }
}