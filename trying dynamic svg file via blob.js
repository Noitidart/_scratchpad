// globals
Cu.import('resource://gre/modules/Services.jsm');
var sss = Cc['@mozilla.org/content/style-sheet-service;1'].getService(Ci.nsIStyleSheetService);

try {
	sss.unregisterSheet(cssUri, sss.AUTHOR_SHEET);
} catch (ignore) {}

var cssUri;
var svgFilterUrl;
// end globals

if (Services.vc.compare(Services.appinfo.version, 34) < 0) {
	// for less then firefox v34
	if (!svgFilterUrl) {
		Cu.importGlobalProperties(['URL']);
		var oFileBody = '<svg xmlns="http://www.w3.org/2000/svg"><filter id="grayscale"><feColorMatrix type="saturate" values="0"/></filter></svg>';
		var oBlob = Blob([oFileBody], {
			type: "text/xml"
		});
		svgFilterUrl = URL.createObjectURL(oBlob);
		console.log(url)
	}
	var css = '#toggle-button--helloname-my-button1 { filter: url(' + url + '#grayscale); }';
} else {
	// for less then firefox >= v34
	var css = '#toggle-button--helloname-my-button1 { filter:grayscale(1) }';
}
var newURIParam = {
	aURL: 'data:text/css,' + encodeURIComponent(css),
	aOriginCharset: null,
	aBaseURI: null
};
var cssUri = Services.io.newURI(newURIParam.aURL, newURIParam.aOriginCharset, newURIParam.aBaseURI);
sss.loadAndRegisterSheet(cssUri, sss.AUTHOR_SHEET);