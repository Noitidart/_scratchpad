var retProm = function() {
  var defer = Promise.defer();
  defer.reject();
  return defer.promise;
}

function throwIt(aThrow) {
  //setTimeout(function(){ throw aThrow }, 0);
}

var promise_retProm = retProm();
promise_retProm.then(
  function(aVal) {
    console.log('Promise succesfully executed - `promise_retProm');
  },
  function(aReason) {
    asdfadsf('asd'); //example of error here, this will not trigger the normal throw. even doing a throw 'asdfadsf' wont work from here
    console.error('Promise rejected - `promise_retProm` :: ', aReason)
  }
).catch( //catches if an error happens within resolve/reject functions, as errors there dont trigger the normal throw
  function(aCaught) {
    console.warn('aCaught:', aCaught);
    throwIt(aCaught);
  }
);