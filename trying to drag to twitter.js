var XPIScope = Cu.import('resource://gre/modules/addons/XPIProvider.jsm');
var scope = XPIScope.XPIProvider.bootstrapScopes['ChromeUtils@jetpack'];

function sendTwitterDropEvent() {
	
	var aContentWindow = gBrowser.contentWindow;
	var aContentDocument = aContentWindow.document;

	var dragSrc = aContentDocument.createElement('div');
	dragSrc.style.backgroundColor = 'steelblue';
	dragSrc.style.zIndex = '11'; // enough to blocks whats underneath so starts the drag
	dragSrc.style.width = '100px';
	dragSrc.style.height = '100px';
	dragSrc.style.position = 'absolute';
	dragSrc.style.display = 'block';
	dragSrc.setAttribute('draggable', true);
	
	dragSrc.addEventListener('dragstart', function() {
		console.error('GOOD drag started');
	}, false);
	
	var btnNewTweet = aContentDocument.getElementById('global-new-tweet-button');
	console.info('btnNewTweet:', btnNewTweet);
	if (!btnNewTweet) {
		throw new Error('global tweet button not found, probably not logged in');
	}

	btnNewTweet.click();

	var inputAddPhoto = aContentDocument.getElementById('global-tweet-dialog').querySelector('input[type=file]');
	if (!inputAddPhoto) {
		throw new Error('add photo button not found! i have no idea what could cause this');
	}

	var formTweet = aContentDocument.getElementById('global-tweet-dialog-dialog').querySelector('form'); //<form.t1-form.tweet-form has-preview has-thumbnail dynamic-photos photo-square-4>
	if (!formTweet) {
		throw new Error('tweet form not found! i have no idea what could cause this');
	}
	console.info('formTweet:', formTweet);
	
	formTweet.parentNode.appendChild(dragSrc);
	scope.ChromeUtils.synthesizeDrop(dragSrc, formTweet, [[{type: "text/plain", data: "sAAAAA"}]], "copy", aContentWindow, aContentWindow);
	
	//setTimeout(function() {
		formTweet.parentNode.removeChild(dragSrc);
	//}, 3000);
}

sendTwitterDropEvent();