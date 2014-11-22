/*
 * Comination of
 * https://github.com/BrunoReX/palemoon/blob/f2625d22bb597db7a7ec5a1d97529c61f3fda99b/toolkit/mozapps/extensions/XPIProvider.jsm#L920
 * https://github.com/johan/greasemonkey-old-partial-history/blob/2431aa17187e7a84ed2f7a5f5f757bcc4a34e4d1/src/chrome/chromeFiles/content/updater.js#L198
 */
//start stuff straing ocpied from https://github.com/johan/greasemonkey-old-partial-history/blob/2431aa17187e7a84ed2f7a5f5f757bcc4a34e4d1/src/chrome/chromeFiles/content/updater.js#L198
var RDFURI_INSTALL_MANIFEST_ROOT = 'urn:mozilla:install-manifest';
var PREFIX_NS_EM = 'http://www.mozilla.org/2004/em-rdf#';
var PROP_METADATA = ["id", "version", "type", "internalName", "updateURL", "updateKey", "optionsURL", "optionsType", "aboutURL", "iconURL", "icon64URL"];

var gRDF = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService)

function EM_R(aProperty) {
	return gRDF.GetResource(PREFIX_NS_EM + aProperty);
}

function getRDFValue(aLiteral) {
	if (aLiteral instanceof Ci.nsIRDFLiteral)
		return aLiteral.Value;
	if (aLiteral instanceof Ci.nsIRDFResource)
		return aLiteral.Value;
	if (aLiteral instanceof Ci.nsIRDFInt)
		return aLiteral.Value;
	return null;
}

function getRDFProperty(aDs, aResource, aProperty) {
		return getRDFValue(aDs.GetTarget(aResource, EM_R(aProperty), true));
}
//end stuff straing ocpied from https://github.com/johan/greasemonkey-old-partial-history/blob/2431aa17187e7a84ed2f7a5f5f757bcc4a34e4d1/src/chrome/chromeFiles/content/updater.js#L198

var xmlString = '<?xml version="1.0" encoding="utf-8"?><RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#"><Description about="urn:mozilla:install-manifest"><em:id>PortableTester@jetpack</em:id><em:version>initial</em:version><em:type>2</em:type><em:bootstrap>true</em:bootstrap><em:unpack>false</em:unpack><!--Firefox--><em:targetApplication><Description><em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id><em:minVersion>7.0</em:minVersion><em:maxVersion>27.0</em:maxVersion></Description></em:targetApplication><!--Front End MetaData--><em:name>PortableTester</em:name><em:description>Test addon that tries to figure out if Firefox is portable or not.</em:description><em:creator>Noitidart</em:creator><em:optionsURL>options url here</em:optionsURL></Description></RDF>';

var uri = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI('urn:empty', null, null);
var parser = Cc["@mozilla.org/rdf/xml-parser;1"].createInstance(Ci.nsIRDFXMLParser);
var memoryDS = Cc["@mozilla.org/rdf/datasource;1?name=in-memory-datasource"].createInstance(Ci.nsIRDFDataSource);
parser.parseString(memoryDS, uri, xmlString);

var dsResources = memoryDS.GetAllResources();

let root = gRDF.GetResource(RDFURI_INSTALL_MANIFEST_ROOT);

let addon = {};
addon.unpack = getRDFProperty(ds, root, 'unpack');
PROP_METADATA.forEach(function(aProp) {
	addon[aProp] = getRDFProperty(ds, root, aProp);
});
console.log('addon:', addon);