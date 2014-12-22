var eps = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
var handlerInfo = eps.getProtocolHandlerInfo('mailto');
console.log('epsHandlerInfo', handlerInfo)

console.log('handlerInfo.preferredApplicationHandler', handlerInfo.preferredApplicationHandler);
console.log('handlerInfo.possibleApplicationHandlers', handlerInfo.possibleApplicationHandlers);

var handlers = handlerInfo.possibleApplicationHandlers;
console.log('handlers', handlers)
for (var i = 0; i < handlers.length; ++i) {
	var handler = handlers.queryElementAt(i, Ci.nsIWebHandlerApp);
	console.log('handler', i, handler, handler.uriTemplate);

	if (Services.wm.getMostRecentWindow(null).confirm('delete handler at position ' + i + '? its uriTemplate = "' + handler.uriTemplate + '" and name = "' + handler.name + '"')) {
		if (handler.equals(handlerInfo.preferredApplicationHandler)) {
			Services.wm.getMostRecentWindow(null).alert('the preferredApplicationHandler was the one we are removing now, so null the preferredAppHand and set to always ask');
			//if the last preferredApplicationHandler was this then nullify it, just me trying to keep things not stale
			handlers.preferredApplicationHandler = null;
			if (handlerInfo.preferredAction == Ci.nsIHandlerInfo.useHelperApp) {
				//it looks like the preferredAction was to use this helper app, so now that its no longer there we will have to ask what the user wants to do next time the uesrs clicks a mailto: link
				handlers.alwaysAskBeforeHandling = true;
				handlerInfo.preferredAction = Ci.nsIHandlerInfo.alwaysAsk; //this doesnt really do anything but its just nice to be not stale. it doesnt do anything because firefox checks handlerInfo.alwaysAskBeforeHandling to decide if it should ask. so me doing this is just formality to be looking nice
			}
		}
		handlers.removeElementAt(i);
		i--;
	}
	var hs = Cc["@mozilla.org/uriloader/handler-service;1"].getService(Ci.nsIHandlerService);
	hs.store(handlerInfo);
}