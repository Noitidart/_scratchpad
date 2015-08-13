function sendTwitterPasteEvent() {
	
	var aContentWindow = gBrowser.contentWindow;
	var aContentDocument = aContentWindow.document;
	
	var btnNewTweet = aContentDocument.getElementById('global-new-tweet-button');
	//console.info('btnNewTweet:', btnNewTweet);
	if (!btnNewTweet) {
		throw new Error('global tweet button not found, probably not logged in');
	}

	btnNewTweet.click();
  
  var richInputTweetMsg = aContentDocument.getElementById('tweet-box-global'); // <button#global-new-tweet-button.js-global-new-tweet.js-tooltip btn primary-btn tweet-btn js-dynamic-tooltip>
	
	var pasteEvent = new aContentWindow.ClipboardEvent('paste', {bubbles:true, cancelable:true});

  //var file = new File('C:\\Users\\Vayeate\\Pictures\\Screenshot - Tuesday, August 11, 2015 6-33-58 AM.png');
	//pasteEvent.clipboardData.mozSetDataAt("application/x-moz-file", file, 0);
	//window.focus();
	//setTimeout(function() {
		pasteEvent.clipboardData.setData('text/plain', 'rawr');

		console.info('pasteEvent:', pasteEvent);

		richInputTweetMsg.dispatchEvent(pasteEvent);
		console.log('sendt')
	//}, 1000);
}

sendTwitterPasteEvent();