var pathProfilesIni = OS.Path.join(OS.Constants.Path.userApplicationDataDir, 'profiles.ini');
var ini;

function readIniRegex() {
//non reg
//is promise
	try {
	//	console.log('in read');
		//if (!decoder) {
	//		console.log('decoder not inited');
			var decoder = new TextDecoder(); // This decoder can be reused for several reads
		//}
	//	console.log('decoder got');
	//	console.log('starting read');
		let promise = OS.File.read(pathProfilesIni); // Read the complete file as an array
	//	console.log('read promise started');
		return promise.then(
			function(ArrayBuffer) {
				var readStr = decoder.decode(ArrayBuffer); // Convert this array to a text
	//			//console.log(readStr);
				ini = {};
				var patt = /\[(.*?)(\d*?)\](?:\s+?(.+?)=(.*))(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?/mg; //supports 10 lines max per block `(?:\s+?(.+?)=(.*))?` repeat that at end
				var blocks = [];

				var match;
				while (match = patt.exec(readStr)) {
	//				//console.log('MAAAAAAAAAAATCH', match);

					var group = match[1];
					ini[group] = {};

					if (group == 'Profile') {
						ini[group]['num'] = match[2];
					}

					ini[group].props = {};

					for (var i = 3; i < match.length; i = i + 2) {
						var prop = match[i];
						if (prop === undefined) {
							break;
						}
						var propVal = match[i + 1]
						ini[group].props[prop] = propVal;
					}

					if (group == 'Profile') {
						//Object.defineProperty(ini, ini[group].props.Name, Object.getOwnPropertyDescriptor(ini[group], group));
						ini[ini[group].props.Name] = ini[group];
						delete ini[group];
					}
				}
	//			console.log('successfully read ini = ', ini);
				return Promise.resolve(ini);
			},
			function(aRejectReason) {
	//			console.error('Read ini failed');
				return Promise.reject('Profiles.ini could not be read to memoery. ' + aRejectReason.message);
			}
		);
	} catch (ex) {
		console.error('Promise Rejected `readIni` - ', ex);
		return Promise.reject('Promise Rejected `readIni` - ' + ex);
	}
}

function readIniPlain() {
//non reg
//is promise
	try {
	//	console.log('in read');
		//if (!decoder) {
	//		console.log('decoder not inited');
			var decoder = new TextDecoder(); // This decoder can be reused for several reads
		//}
	//	console.log('decoder got');
	//	console.log('starting read');
		let promise = OS.File.read(pathProfilesIni); // Read the complete file as an array
	//	console.log('read promise started');
		return promise.then(
			function(ArrayBuffer) {
				var readStr = decoder.decode(ArrayBuffer); // Convert this array to a text
	//			//console.log(readStr);
				ini = {};
        var lines = readStr.split(/$/m);
        ini = lines;
        return Promise.resolve(ini);
				var patt = /\[(.*?)(\d*?)\](?:\s+?(.+?)=(.*))(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?(?:\s+?(.+?)=(.*))?/mg;
				var blocks = [];

				var match;
				while (match = patt.exec(readStr)) {
	//				//console.log('MAAAAAAAAAAATCH', match);

					var group = match[1];
					ini[group] = {};

					if (group == 'Profile') {
						ini[group]['num'] = match[2];
					}

					ini[group].props = {};

					for (var i = 3; i < match.length; i = i + 2) {
						var prop = match[i];
						if (prop === undefined) {
							break;
						}
						var propVal = match[i + 1]
						ini[group].props[prop] = propVal;
					}

					if (group == 'Profile') {
						//Object.defineProperty(ini, ini[group].props.Name, Object.getOwnPropertyDescriptor(ini[group], group));
						ini[ini[group].props.Name] = ini[group];
						delete ini[group];
					}
				}
	//			console.log('successfully read ini = ', ini);
				return Promise.resolve(ini);
			},
			function(aRejectReason) {
	//			console.error('Read ini failed');
				return Promise.reject('Profiles.ini could not be read to memoery. ' + aRejectReason.message);
			}
		);
	} catch (ex) {
		console.error('Promise Rejected `readIni` - ', ex);
		return Promise.reject('Promise Rejected `readIni` - ' + ex);
	}
}

var promise = readIniRegex();
console.time('readIni');
promise.then(
  function() {
   console.timeEnd('readIni');
   console.log('done reading, ini:', ini);
  },
  function(aReason) {
    console.timeEnd('readIni');
    console.error('failed reading ini, aReason:', aReason);
  }
)