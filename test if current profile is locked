Cu.import('resource://gre/modules/osfile.jsm');

var rootDirPathOfCurrentProfile = OS.Constants.Path.profileDir;

var aDirectMACNIX = OS.Path.join(rootDirPathOfCurrentProfile, '.parentlock');
var aDirectELSE = OS.Path.join(rootDirPathOfCurrentProfile, 'parent.lock');

var promise = OS.File.open(aDirectELSE); //if mac or *nix change aDirectELSE to aDirectMACNIX
promise.then(
    function(aVal) {
      console.log('success aVal:', aVal);
        Services.ww.activeWindow.alert('file is NOT locked, aVal = ' + uneval(aVal));
    },
    function(aReason) {
        console.info('reject aReason:', aReason)
        Services.ww.activeWindow.alert('file is probably LOCKED as promise rejected, but lets check the reject reason. aReason = ' + uneval(aReason));
        
        var __proto__all = Object.getOwnPropertyNames(aReason.__proto__);
        var __proto__enum = Object.keys(aReason.__proto__);
        var __proto__nonenum = __proto__all.filter(function (k) { //Array [ "becauseExists", "becauseNoSuchFile", "becauseNotEmpty", "becauseClosed", "becauseAccessDenied", "becauseInvalidArgument" ]
            return __proto__enum.indexOf(k) == -1;
        });

        var aReasonStr = [];
        Array.prototype.forEach.call(__proto__nonenum, function (k) {
            if (aReason[k]) {
                aReasonStr.push(k);
            }
        });
        Services.ww.activeWindow.alert('aReasonStr: ' + aReasonStr)
        Services.ww.activeWindow.alert('aReason instanceof OS.File.Error ' + (aReason instanceof OS.File.Error))
    }
);