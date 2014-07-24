Cu.import('resource://gre/modules/Services.jsm');
var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);
try {
    sss.unregisterSheet(cssUri, sss.USER_SHEET);
} catch (ex) {}

var css = '';
/*css += '[anonid="close-button"] .toolbarbutton-icon:after { content:"rawr"; position:absolute; z-index:999999; width:10px; height:10px; background-color:red; }';*/ //i dont know why but i cant seem to put a before or after pseduo element on the image so i put it on the toolbar-button, if yo ucan figure this one out share with us
css += '[anonid="close-button"]:before { position:absolute; top:5px; background-color:black; width:20px; height:20px; content:""}';
css += '[anonid="close-button"] { pointer-events:none !important; }';
var cssEnc = encodeURIComponent(css);
	var newURIParam = {
        aURL: 'data:text/css,' + cssEnc,
        aOriginCharset: null,
        aBaseURI: null
}
var cssUri = Services.io.newURI(newURIParam.aURL, newURIParam.aOriginCharset, newURIParam.aBaseURI);
sss.loadAndRegisterSheet(cssUri, sss.USER_SHEET);

