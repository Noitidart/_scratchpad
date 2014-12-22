/*
var handlerService = Cc['@mozilla.org/uriloader/handler-service;1'].getService(Ci.nsIHandlerService);
var listOfWrappedHandlers = handlerService.enumerate();
var i = 0;
while (listOfWrappedHandlers.hasMoreElements()) {
  var handlerInfo = listOfWrappedHandlers.getNext().QueryInterface(Ci.nsIHandlerInfo);
  //console.log(i, 'handler for', wrappedHandlerInfo.type, wrappedHandlerInfo);
  if (handlerInfo.type == 'mailto') {
    break;
  }
  i++;
}
console.log('handlerServicehandlerInfo=', handlerInfo); //is the mailto one as we broke the loop once it found that
*/


var eps = Cc["@mozilla.org/uriloader/external-protocol-service;1"].getService(Ci.nsIExternalProtocolService);
var handlerInfo = eps.getProtocolHandlerInfo('mailto');
console.log('epsHandlerInfo', handlerInfo)


/*
var mimeService = Cc['@mozilla.org/mime;1'].getService(Ci.nsIMIMEService);
var CONTENT_TYPE = 'mailto';
var TYPE_EXTENSION = '';

var handlerInfo = mimeService.getFromTypeAndExtension(CONTENT_TYPE, TYPE_EXTENSION);
console.info('mimeServiceHandlerInfo:', handlerInfo); //http://i.imgur.com/dUKox24.png
*/

console.log('handlerInfo.preferredApplicationHandler', handlerInfo.preferredApplicationHandler);
console.log('handlerInfo.possibleApplicationHandlers', handlerInfo.possibleApplicationHandlers);
console.log('handlerInfo.possibleLocalHandlers', handlerInfo.possibleLocalHandlers);

/*
     //this way does not list the "Microsoft Outlook", it only lists the gmail, ymail and things i added, weird
     var handlers = handlerInfo.possibleLocalHandlers;
     console.log('handlers', handlers)
     for (var i = 0; i < handlers.length; ++i) {
       var handler = handlers.queryElementAt(i, Ci.nsIHandlerApp);
       console.log('handler', i, handler, handler.uriTemplate);

     }
*/


     //this way also does not list "Microsoft Outlook" i suspect thats a local app handler
     var handlers = handlerInfo.possibleApplicationHandlers.enumerate();
     while (handlers.hasMoreElements()) {
       var handler = handlers.getNext().QueryInterface(Ci.nsIWebHandlerApp); //QIwith nsIWebHandlerApp so it exposes `uriTemplate` //if dont QIwith either of these two then you will not see the name key on handler
       console.log('handler', handler);
     }


//start - demo make handler for mailto be y! mail
     var handlers = handlerInfo.possibleApplicationHandlers.enumerate();
     var foundYahooMailHandler = false;
     while (handlers.hasMoreElements()) {
       var handler = handlers.getNext();
       if (handler.QueryInterface(Ci.nsIWebHandlerApp).uriTemplate == 'https://compose.mail.yahoo.com/?To=%s') { //this is how i decided to indentify if the handler is of yahoo mail
         foundYahooMailHandler = true;
         break;
       }
     }

    if (foundYahooMailHandler) {
      //it was found. and in the while loop when i found it, i "break"ed out of the loop which left handlerInfo set at the yahoo mail handler
      //set this to the prefered handler as this handler is the y! mail handler
      handlerInfo.preferredAction = Ci.nsIHandlerInfo.useHelperApp; //Ci.nsIHandlerInfo has keys: alwaysAsk:1, handleInternally:3, saveToDisk:0, useHelperApp:2, useSystemDefault:4
      handlerInfo.preferredApplicationHandler = handler;
      handlerInfo.alwaysAskBeforeHandling = false;
      var hs = Cc["@mozilla.org/uriloader/handler-service;1"].getService(Ci.nsIHandlerService);
      hs.store(handlerInfo);
    } else {
      alert('could not find yahoo mail handler. meaning i couldnt find a handler with uriTemplate of ...compose.mail.yahoo....')
    }
//end - demo make handler for mailto be y! mail*/

// start - demo code to add a handler that will be handled by my extension to a protocol

// end - demo code to add a handler that will be handled by my extension to a protocol