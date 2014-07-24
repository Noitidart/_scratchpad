Cu.import('resource://gre/modules/XPCOMUtils.jsm');
Cu.import('resource://gre/modules/Services.jsm');

var mimeService = Cc['@mozilla.org/mime;1'].getService(Ci.nsIMIMEService); //http://mxr.mozilla.org/mozilla-release/source/netwerk/mime/nsIMIMEService.idl
var handlerService = Cc['@mozilla.org/uriloader/handler-service;1'].getService(Ci.nsIHandlerService); //http://mxr.mozilla.org/mozilla-release/source/uriloader/exthandler/nsIHandlerService.idl

var listOfWrappedHandlers = handlerService.enumerate();
var i = 0;
while (listOfWrappedHandlers.hasMoreElements()) {
  let wrappedHandlerInfo = listOfWrappedHandlers.getNext().QueryInterface(Ci.nsIHandlerInfo);
  console.log(i, 'handler for', wrappedHandlerInfo.type, wrappedHandlerInfo);
  i++;
}
console.log('Listed ', i, ' handlers');

var CONTENT_TYPE = 'application/pdf';
var TYPE_EXTENSION = 'pdf';

var handlerInfo = mimeService.getFromTypeAndExtension(CONTENT_TYPE, TYPE_EXTENSION);
console.info('handlerInfo:', handlerInfo); //http://i.imgur.com/dUKox24.png

    // Change and save mime handler settings.
    handlerInfo.alwaysAskBeforeHandling = false;
    handlerInfo.preferredAction = Ci.nsIHandlerInfo.handleInternally;
    handlerService.store(handlerInfo);


/*
    // Also disable any plugins for pdfs.
    var stringTypes = '';
    var types = [];
    var PREF_DISABLED_PLUGIN_TYPES = 'plugin.disable_full_page_plugin_for_types';
    if (prefs.prefHasUserValue(PREF_DISABLED_PLUGIN_TYPES)) {
      stringTypes = prefs.getCharPref(PREF_DISABLED_PLUGIN_TYPES);
    }
    if (stringTypes !== '') {
      types = stringTypes.split(',');
    }

    if (types.indexOf(PDF_CONTENT_TYPE) === -1) {
      types.push(PDF_CONTENT_TYPE);
    }
    prefs.setCharPref(PREF_DISABLED_PLUGIN_TYPES, types.join(','));

    // Update the category manager in case the plugins are already loaded.
    let categoryManager = Cc["@mozilla.org/categorymanager;1"];
    categoryManager.getService(Ci.nsICategoryManager).deleteCategoryEntry("Gecko-Content-Viewers", CONTENT_TYPE, false);
*/
