Cu.import('resource://gre/modules/Promise.jsm');

// start - helper functions
function Deferred() {
	if (Promise.defer) {
		//need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
		return Promise.defer();
	} else if (PromiseUtils.defer) {
		//need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
		return PromiseUtils.defer();
	} else {
		/* A method to resolve the associated Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} value : This value is used to resolve the promise
		 * If the value is a Promise then the associated promise assumes the state
		 * of Promise passed as value.
		 */
		this.resolve = null;

		/* A method to reject the assocaited Promise with the value passed.
		 * If the promise is already settled it does nothing.
		 *
		 * @param {anything} reason: The reason for the rejection of the Promise.
		 * Generally its an Error object. If however a Promise is passed, then the Promise
		 * itself will be the reason for rejection no matter the state of the Promise.
		 */
		this.reject = null;

		/* A newly created Pomise object.
		 * Initially in pending state.
		 */
		this.promise = new Promise(function(resolve, reject) {
			this.resolve = resolve;
			this.reject = reject;
		}.bind(this));
		Object.freeze(this);
	}
}
// end - helper functions

function myUserDefinedPromise() {
	var deferred_myUserDefinedPromise = new Deferred();
	var imagePaths = ['http://www.mozilla.org/media/img/firefox/favicon.png', 'https://developer.cdn.mozilla.net/media/redesign/img/favicon32.png'];
	
	// imagePaths must have no duplicates
	//asfd(); //not caught by .catch
	
	var handleLoad = function() {
		var img = this;
		//asfd(); //not caught by .catch
		console.log('loaded, img:', img);
		deferreds_loadImgs[img.src].resolve('loaded: ' + img.src);
	};
	var handleAbort = function() {
		var img = this;
		console.error('aborted, img:', img);
		deferreds_loadImgs[img.src].reject('aborted: ' + img.src);
	};
	var handleError = function() {
		var img = this;
		console.error('errored, img:', img);
		deferreds_loadImgs[img.src].reject('errored: ' + img.src);
	};
	
	var promiseAllArr_loadImgs = [];
	var deferreds_loadImgs = {};
	for (var i=0; i<imagePaths.length; i++) {
		deferreds_loadImgs[imagePaths[i]] = new Deferred();
		promiseAllArr_loadImgs.push(deferreds_loadImgs[imagePaths[i]].promise);
		
		var myImage = new Services.appShell.hiddenDOMWindow.Image();
		
		myImage.onload = handleLoad;
		myImage.onabort = handleAbort;
		myImage.onerror = handleError;
		
		myImage.src = imagePaths[i];
	}
	
	var promiseAll_loadImgs = Promise.all(promiseAllArr_loadImgs);
	promiseAll_loadImgs.then(
		function(aVal) {
			console.log('Fullfilled - promiseAll_loadImgs - ', aVal);
			// start - do stuff here - promiseAll_loadImgs
			deferred_myUserDefinedPromise.resolve('all images loaded');
			// end - do stuff here - promiseAll_loadImgs
		},
		function(aReason) {
			var refObj = {name:'promiseAll_loadImgs', aReason:aReason};
			console.warn('Rejected - promiseAll_loadImgs - ', refObj);
			deferred_myUserDefinedPromise.reject(refObj);
		}
	).catch(
		function(aCaught) {
			var refObj = {name:'promiseAll_loadImgs', aCaught:aCaught};
			console.error('Caught - promiseAll_loadImgs - ', refObj);
			deferred_myUserDefinedPromise.reject(refObj);
		}
	);
	
	return deferred_myUserDefinedPromise.promise;
}

/////// do it

function main() {
	var myPromise = myUserDefinedPromise();
	myPromise.then(
		function(aVal) {
			console.log('Fullfilled - myPromise - ', aVal);
		},
		function(aReason) {
			var refObj = {name:'myPromise', aReason:aReason};
			console.warn('Rejected - myPromise - ', refObj);
		}
	).catch(
		function(aCaught) {
			var refObj = {name:'myPromise', aCaught:aCaught};
			console.error('Caught - myPromise - ', refObj);
		}
	);
}

try {
	main();
} catch (ex) {
	console.error('caught main ex:', ex);
}