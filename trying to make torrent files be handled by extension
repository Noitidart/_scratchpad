// start - demo code to add a handler that will be handled by my extension to a protocol

/*
1. create your own handler of instance Ci.nsIWebHandlerApp
2. insert your handler (from 1) into the list of valid handlers torrent protocol
3. set the active handler for the torrent protocol to your inserted handler (from 2)
*/

/*
var handlerService = Cc['@mozilla.org/uriloader/handler-service;1'].getService(Ci.nsIHandlerService);
var listOfWrappedHandlers = handlerService.enumerate();
var i = 0;
while (listOfWrappedHandlers.hasMoreElements()) {
  var handlerInfo = listOfWrappedHandlers.getNext().QueryInterface(Ci.nsIHandlerInfo);
  //console.log(i, 'handler for', wrappedHandlerInfo.type, wrappedHandlerInfo);
  if (handlerInfo.type == 'application/x-download') {
    break;
  }
  i++;
}
console.log('handlerServicehandlerInfo=', handlerInfo); //is the mailto one as we broke the loop once it found that
*/

var mimeService = Cc['@mozilla.org/mime;1'].getService(Ci.nsIMIMEService);
var CONTENT_TYPE = ''; //'application/x-download'; can leave this blank
var TYPE_EXTENSION = 'torrent';

var handlerInfo = mimeService.getFromTypeAndExtension(CONTENT_TYPE, TYPE_EXTENSION);
console.info('handlerInfo:', handlerInfo); //http://i.imgur.com/dUKox24.png
// end - demo code to add a handler that will be handled by my extension to a protocol


//start - create handler
var handler = Cc["@mozilla.org/uriloader/web-handler-app;1"].createInstance(Ci.nsIWebHandlerApp);
handler.name = 'Torrent MyExt Handler';
handler.uriTemplate = 'tor-my-exit:%s';
//end - create handler

//start - add handler
handlerInfo.possibleApplicationHandlers.appendElement(handler, false);
//end - add handler

//start - set as active handler
handlerInfo.preferredAction = Ci.nsIHandlerInfo.useHelperApp; //Ci.nsIHandlerInfo has keys: alwaysAsk:1, handleInternally:3, saveToDisk:0, useHelperApp:2, useSystemDefault:4
handlerInfo.preferredApplicationHandler = handler;
handlerInfo.alwaysAskBeforeHandling = false;
//end - set as active handler

var hs = Cc["@mozilla.org/uriloader/handler-service;1"].getService(Ci.nsIHandlerService);
hs.store(handlerInfo);

//start - create `tor-my-exit` protocol:
var {classes: Cc,
     interfaces: Ci,
     manager: Cm,
     results: Cr,
     Constructor: CC
    } = Components;
Cm.QueryInterface(Ci.nsIComponentRegistrar);

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

var SCHEME = "tor-my-exit";
var DDG_URI = Services.io.newURI("https://duckduckgo.com/?q=%s", null, null);

var nsIURI = CC("@mozilla.org/network/simple-uri;1", "nsIURI");

function MyProtocolHandler() {}
MyProtocolHandler.prototype = Object.freeze({
  classDescription: "My Protocol Handler",
  contractID: "@mozilla.org/network/protocol;1?name=" + SCHEME,
  classID: Components.ID('{858ea860-129a-11e4-9191-0800200c9a66}'),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIProtocolHandler]),

  // nsIProtocolHandler
  scheme: SCHEME,
  defaultPort: -1, // No default port.

  // nsIProtocolHandler
  allowPort: function(port, scheme) {
    // This protocol handler does not support ports.
    return false;
  },

  // nsIProtocolHandler
  // Our protocol handler does not support authentication,
  // but it is OK to be loaded from any web-page, not just privileged pages""
  protocolFlags: Ci.nsIProtocolHandler.URI_NOAUTH |
                 Ci.nsIProtocolHandler.URI_LOADABLE_BY_ANYONE,

  // nsIProtocolHandler
  newURI: function(aSpec, aOriginCharset, aBaseURI) {
    // Nothing special here, actually. We were asked to create a new URI.

    // If there is a base-URI, this means that the browser tries to resolve
    // a dependent resource (an image, script) or the user clicked on a relative link.
    // In this case we cannot really return another "ddg" URI, but need to return
    // the proper https URI.
    if (aBaseURI && aBaseURI.scheme == SCHEME) {
      return Services.io.newURI(aSpec, aOriginCharset, DDG_URI);
    }

    // We don't care about the charset, so just ignore that
    // (we support what nsIURI supports).
    let rv = new nsIURI();
    rv.spec = aSpec;
    return rv;
  },

  // nsIProtocolHandler
  newChannel: function(aURI) {
    // We were asked to open a new channel.
    // We could implement an entirely custom channel that supports
    // (most of) nsIChannel. But that is tremendous work and outside
    // of the scope of this basic example (which is about protocol handlers and
    // not channels).
    // Or we can just return any other channel we can create.
    // Since we're going to implement the "ddg:" protocol, lets just open a
    // regular https channel to duckduckgo.com, use the URI as the search term
    // and return that channel.
    let spec = DDG_URI.spec.replace("%s", aURI.path);
    let channel = Services.io.newChannel(spec, aURI.originCharset, null);
    channel.cancel(Cr.NS_BINDING_ABORTED);
    Services.prompt.alert(null, 'do what you want', 'do what you want with the torrent link, like download it to a certain folder then open in something or bwhatever, teh torrent uri is:' + aURI.spec);
    return channel;
    
    let spec = DDG_URI.spec.replace("%s", aURI.path);
    let channel = Services.io.newChannel(spec, aURI.originCharset, null);

    // Setting .originalURI will not only let other code know where this
    // originally came from, but the UI will actually show that .originalURI.
    channel.originalURI = aURI;

    return channel;
  }
});

var NSGetFactory = XPCOMUtils.generateNSGetFactory([MyProtocolHandler]);

function Factory(component) {
  this.createInstance = function(outer, iid) {
    if (outer) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return new component();
  };
  this.register = function() {
    Cm.registerFactory(component.prototype.classID,
                       component.prototype.classDescription,
                       component.prototype.contractID,
                       this);
  };
  this.unregister = function() {
    Cm.unregisterFactory(component.prototype.classID, this);
  }
    Object.freeze(this);
  this.register();
}
var factory = new Factory(MyProtocolHandler);

//3nd - create `tor-my-exit` protocol