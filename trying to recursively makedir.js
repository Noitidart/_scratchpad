//C:\Users\Vayeate\Desktop

var tp = OS.Path.join('C:','Users','Vayeate','Desktop','afol1','afol2', 'afol3');
var tp = '\\rawr\\rawr\\my new profile' //var typedPath
var tpSplit = OS.Path.split(tp);
//let promise = OS.File.makeDir(tp);

let promise = OS.File.makeDir(tp, {
   from: tpSplit.components[0]
});

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
       console.log('makeDir failed, aRejectReason = ', aRejectReason.toString())
       console.log('makeDir failed, aRejectReason = ', aRejectReason.toMsg())
    }
)