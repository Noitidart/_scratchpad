try {
  for (var o in observers) {
      observers[o].unreg();
  }
} catch (ignore) {}

var observers = {
	'quit-application-requested': {
		observe: function (aSubject, aTopic, aData) {
      console.info('quit-application-requested :: ', aSubject, aTopic, aData);
      aSubject.data = true; // cancels the quit
      console.log('quit cancelled');
		},
		reg: function () {
			Services.obs.addObserver(observers['quit-application-requested'], 'quit-application-requested', false);
		},
		unreg: function () {
			Services.obs.removeObserver(observers['quit-application-requested'], 'quit-application-requested');
		}
	}
};
    
for (var o in observers) {
    observers[o].reg();
}