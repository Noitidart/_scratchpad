var tp = OS.Path.join(OS.Constants.Path.desktopDir,'as_~`!@#$%^&*()_-+={[}]|\\:;"\'<,>.?/_as');
let promise = OS.File.makeDir(tp, {ignoreExisting:false});

promise.then(
    function() {
       console.log('makeDir succesfull')
    },
    function(aRejectReason) {
       console.log('makeDir failed, aRejectReason = ', aRejectReason)
       console.log('aRejectReason.becauseAccessDenied = ', aRejectReason.becauseAccessDenied)
       console.log('aRejectReason.becauseClosed = ', aRejectReason.becauseClosed)
       console.log('aRejectReason.becauseExists = ', aRejectReason.becauseExists)
       console.log('aRejectReason.becauseInvalidArgument = ', aRejectReason.becauseInvalidArgument)
       console.log('aRejectReason.becauseNoSuchFile = ', aRejectReason.becauseNoSuchFile)
       console.log('aRejectReason.becauseNotEmpty = ', aRejectReason.becauseNotEmpty)
       console.log('makeDir failed, toString = ', aRejectReason.toString())
       console.log('makeDir failed, toMsg = ', aRejectReason.toMsg())
    }
)