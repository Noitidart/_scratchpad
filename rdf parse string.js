var xmlString = '<?xml version="1.0" encoding="utf-8"?><RDF xmlns="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:em="http://www.mozilla.org/2004/em-rdf#"><Description about="urn:mozilla:install-manifest"><em:id>PortableTester@jetpack</em:id><em:version>initial</em:version><em:type>2</em:type><em:bootstrap>true</em:bootstrap><em:unpack>false</em:unpack><!--Firefox--><em:targetApplication><Description><em:id>{ec8030f7-c20a-464f-9b0e-13a3a9e97384}</em:id><em:minVersion>7.0</em:minVersion><em:maxVersion>27.0</em:maxVersion></Description></em:targetApplication><!--Front End MetaData--><em:name>PortableTester</em:name><em:description>Test addon that tries to figure out if Firefox is portable or not.</em:description><em:creator>Noitidart</em:creator><em:optionsURL>options url here</em:optionsURL></Description></RDF>';

//var aUri = Services.io.newURI('https://raw.githubusercontent.com/Noitidart/PortableTester/master/install.rdf', null, null);

let file = FileUtils.getFile('Desk', ['install.rdf']);
if (!file.exists() || !file.isFile())
	throw new Error("Directory " + aDir.path + " does not contain a valid " + "install manifest");

var aUri = Services.io.newURI(file.path, null, null);

let fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
fis.init(file, -1, -1, false);

let bis = Cc["@mozilla.org/network/buffered-input-stream;1"].createInstance(Ci.nsIBufferedInputStream);
bis.init(fis, 4096);

var aStream = bis;
try {
	//start let addon = loadManifestFromRDF(Services.io.newFileURI(file), bis);
	var rdfParser = Cc['@mozilla.org/rdf/xml-parser;1'].createInstance(Ci.nsIRDFXMLParser);
	var ds = Cc['@mozilla.org/rdf/datasource;1?name=in-memory-datasource'].createInstance(Ci.nsIRDFDataSource);
	var listener = rdfParser.parseAsync(ds, aUri);
	var channel = Cc['@mozilla.org/network/input-stream-channel;1'].
	createInstance(Ci.nsIInputStreamChannel);
	channel.setURI(aUri);
	channel.contentStream = aStream;
	channel.QueryInterface(Ci.nsIChannel);
	channel.contentType = 'text/xml';

	listener.onStartRequest(channel, null);

	try {
		let pos = 0;
		let count = aStream.available();
		while (count > 0) {
			listener.onDataAvailable(channel, null, aStream, pos, count);
			pos += count;
			count = aStream.available();
		}
		listener.onStopRequest(channel, null, Components.results.NS_OK);
	} catch (e) {
		listener.onStopRequest(channel, null, e.result);
		throw e;
	}
	getRDFProperty(ds, root, aProp);
	//end let addon = loadManifestFromRDF(Services.io.newFileURI(file), bis);
	
	//addon._sourceBundle = file.clone();
	//return addon;
} finally {
	bis.close();
	fis.close();
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

var PREFIX_NS_EM = "http://www.mozilla.org/2004/em-rdf#";
function EM_R(aProperty) {
return gRDF.GetResource(PREFIX_NS_EM + aProperty);
}

/*
//https://github.com/BrunoReX/palemoon/blob/f2625d22bb597db7a7ec5a1d97529c61f3fda99b/toolkit/mozapps/extensions/XPIProvider.jsm#L920
let fis = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
fis.init(file, -1, -1, false);

var bis = Cc["@mozilla.org/network/buffered-input-stream;1"].createInstance(Ci.nsIBufferedInputStream);
bis.init(fis, 4096);



*/

//var emptyUri = Services.io.newURI('urn:none', null, null);
//rdfParser.parseString(ds, emptyUri, xmlString);