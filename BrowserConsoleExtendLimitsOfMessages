logLimits(1); //set to false to reset back


function logLimits(enableDev) {
    //enableDev is true or false, if true it sets the loglimits to really hi, if false it returns the defaults
    var hudLogLimitPrefs = Services.prefs.getBranch('devtools.hud.loglimit.');
    var devSettings = {
        console: 2000,
        exception: 2000
    }

    for (var p in devSettings) {
        if (enableDev) {
           hudLogLimitPrefs.setIntPref(p, devSettings[p]);
        } else {
            hudLogLimitPrefs.clearUserPref(p);
        }
    }
}