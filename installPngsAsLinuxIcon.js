Cu.import('resource://gre/modules/Promise.jsm');
Cu.import('resource://gre/modules/osfile.jsm');

function installPngsAsLinuxIcon(paths, nameOfIcon, doc) {
	//doc is document element to use for canvas
	// paths is array of paths of images, based on size of it i figure out which folder to put it into in `$prefix/share/icons/hicolor/48x48/apps`
	// nameOfIcon is the name it will be saved as in all icon folders, dont include the `.png` ending
	// returns promise, aSuccessVal will true
	
	//start - define callbacks	
	var loadPathToImg = function(path) {
		//returns promise
		var defer_loadPathToImg = Promise.defer();
		try {
			path_data[path] = {};
			path_data[path].Image = new Image();
			path_data[path].Image.onload = function() { turnImgToBlob(path); console.log('Succesfully loaded image and stored data of path: "' + path + '"'); defer_loadPathToImg.resolve(path); }
			path_data[path].Image.onabort = function() { defer_loadPathToImg.reject('Abortion on image load of path: "' + path + '"'); };
			path_data[path].Image.onerror = function() { defer_loadPathToImg.reject('Error on image load of path: "' + path + '"'); };
			path_data[path].Image.src = path;
			return defer_loadPathToImg.promise;
		} catch(ex) {
			console.error('Promise Rejected `defer_loadPathToImg` on path `' + path + '` - ', ex);
			return Promise.reject('Promise Rejected `defer_loadPathToImg` on path `' + path + '` - ' + ex);
		}
	}
	
	var turnImgToBlob = function(path) {
		var defer_turnImgToBlob = Promise.defer();
		var canvas = doc.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		canvas.width = path_data[path].Image.naturalWidth;
		canvas.height = path_data[path].Image.naturalHeight;
		var ctx = canvas.getContext('2d');
		ctx.drawImage(path_data[path].Image, 0, 0);
		(canvas.toBlobHD || canvas.toBlob).call(canvas, function(b) {
			var r = new FileReader();
			r.onloadend = function() {
				// r.result contains the ArrayBuffer.
				path_data[path].ArrayBuffer = r.result;
				defer_turnImgToBlob.resolve(path);
			};
			r.onabort = function() { defer_turnImgToBlob.reject('Abortion on toBlob of path: "' + path +'"') }
			r.onerror = function() { defer_turnImgToBlob.reject('Error on toBlob of path: "' + path +'"') }
			r.readAsArrayBuffer(b);
		}, 'image/png');
	};
	
	var saveBlobAsPngToRespectiveDir = function(path) {
		var defer_saveBlobAsPngToRespectiveDir = Promise.defer();

		var dirs = [ //these are the dirs that png should be made in, the dirs are created if they dont exist
			[OS.Constants.Path.homeDir, '.local', 'share', 'icons', 'hicolor', path_data[path].Image.naturalHeight + 'x' + path_data[path].Image.naturalWidth, 'apps'],
			[OS.Constants.Path.homeDir, '.kde4', 'share', 'icons', 'hicolor', path_data[path].Image.naturalHeight + 'x' + path_data[path].Image.naturalWidth, 'apps']
		];
		
		var writeToPaths = []; //holds strings of paths created basdd on dirs and icon name
		for (var i=0; i<dirs.length; i++) {
			writeToPaths.push(OS.Path.join.apply(OS.Path, dirs[i].concat([nameOfIcon + '.png'])));
		}
		
		var promiseArr_writeAtomic = [];
		for (var i=0; i<writeToPaths.length; i++) {
			promiseArr_writeAtomic.push(OS.File.writeAtomic(writeToPaths[i], new Uint8Array(path_data[path].ArrayBuffer), { tmpPath: writeToPaths[i] + '.tmp' }));
		}
		var promise_writeAtomic = Promise.all(promiseArr_writeAtomic);				
		promise_writeAtomic.then(
			function(aVal) {
				console.log('Succesfully exected promise: `promise_writeAtomic` - aVal:', aVal);
				defer_saveBlobAsPngToRespectiveDir.resolve(aVal);
			},
			function(aReason) {
				console.error('Rejected promise: `promise_installPngsAsLinuxIcon` - aReason:', aReason);
				defer_saveBlobAsPngToRespectiveDir.reject({rejectorOf_promiseName:'promise_writeAtomic', aReason:aReason});
			}
		);
		
		return defer_saveBlobAsPngToRespectiveDir.promise;
		
	};
	//end - define callbacks
	
	//start - main of this function
	var path_data = {};
	
	var main = function(path) {
		return promise_loadPathToImg.then(
			function(aVal) {
				var promise_turnImgToBlob = turnImgToBlob(path);
				return promise_turnImgToBlob.then(
					function(aVal) {
						var promise_saveBlobAsPngToRespectiveDir = saveBlobAsPngToRespectiveDir(path);
						return promise_saveBlobAsPngToRespectiveDir.then(
							function(aVal) {
								return Promise.resolve('Succesfully loaded image, converted to blob, and saved in respective directory on path: "' + path + '"');
							},
							function(aReason) {
								return Promise.reject({rejectorOf_promiseName:'promise_saveBlobAsPngToRespectiveDir', aReason:aReason});
							}
						);
					},
					function(aReason) {
						return Promise.reject({rejectorOf_promiseName:'promise_turnImgToBlob', aReason:aReason});
					}
				);
			},
			function(aReason) {
				return Promise.reject({rejectorOf_promiseName:'promise_loadPathToImg', aReason:aReason});
			}
		);
	};
	
	var promiseArr_main = [];
	for (var i=0; i<paths.length; i++) {
		promiseArr_main.push(main(paths[i]));
	}
	var promise_main = Promise.all(promiseArr_main);
	return promise_main.then(
		function(aVal) {
			//aSuccessVal is path
			console.log('Succesfully exected promise: `promise_main` - aVal:', aVal);
			return Promise.resolve('Succesfully exected promise `promise_main` - aVal:' + aVal);
		},
		function(aReason) {
			console.error('Rejected promise: `promise_main` - aReason:', aReason);
			return Promise.reject({rejectorOf_promiseName:'promise_main', aReason:aReason});
		}
	);
	//end - main of this function
}

var promise_installPngsAsLinuxIcon = installPngsAsLinuxIcon([
	'chrome://branding/content/icon16.png',
	'chrome://branding/content/icon24.png',
	'chrome://branding/content/icon32.png',
	'chrome://branding/content/icon48.png',
	'chrome://branding/content/icon64.png',
	'chrome://branding/content/icon96.png',
	'chrome://branding/content/icon128.png',
	'chrome://branding/content/icon256.png',
	'chrome://branding/content/icon512.png',
	'chrome://branding/content/icon1024.png'
], 'profilist_beta', document);
promise_installPngsAsLinuxIcon.then(
	function(aSuccessVal) {
		console.log('Succesfully exected promise: `promise_installPngsAsLinuxIcon` - aVal:', aVal);
	},
	function(aRejectReason) {
		console.error('Rejected promise: `promise_installPngsAsLinuxIcon` - aReason:', aReason);
		//return Promise.reject({rejectorOf_promiseName:'promise_main', aReason:aReason}); //we dont return promise on this then as its not chaining, so after this .then we're done, but we dont have to tell anyone/anything so no return
		throw new Error({rejectorOf_promiseName:'promise_installPngsAsLinuxIcon', aReason:aReason});
	}
);