/* start - aRDFObserver structure */
// is a nsIRDFObserver
var aRDFObserver = {
  onAssert: function (aDataSource, aSource, aProperty, aTarget) {
    console.log('onAssert', {'aDataSource': aDataSource, 'aSource': aSource, 'aProperty': aProperty, 'aTarget': aTarget});
  },
  onUnassert: function(aDataSource, aSource, aProperty, aTarget) {
    console.log('onUnassert', {'aDataSource': aDataSource, 'aSource': aSource, 'aProperty': aProperty, 'aTarget': aTarget});
  },
  onChange: function(aDataSource, aSource, aProperty, aOldTarget, aNewTarget) { 
   console.log('onChange', {'aDataSource': aDataSource, 'aSource': aSource, 'aProperty': aProperty, 'aOldTarget': aOldTarget, 'aNewTarget': aNewTarget});
  },
  onMove: function(aDataSource, aOldSource, aNewSource, aProperty, aTarget) { 
   console.log('onMove', {'aDataSource': aDataSource, 'aOldSource': aOldSource, 'aNewSource': aNewSource, 'aProperty': aProperty, 'aTarget': aTarget});
  },
  onBeginUpdateBatch: function(aDataSource) {
    console.log('onBeginUpdateBatch', {'aDataSource': aDataSource});
  },
  onEndUpdateBatch: function(aDataSource) {
    console.log('onEndUpdateBatch', {'aDataSource': aDataSource});
  }
};
/* end - aRDFObserver structure */

Cu.import('resource://gre/modules/FileUtils.jsm');
var rdfs = Cc['@mozilla.org/rdf/rdf-service;1'].getService(Ci.nsIRDFService);
var file = FileUtils.getFile('UMimTyp', []);
var fileHandler = Services.io.getProtocolHandler('file').QueryInterface(Ci.nsIFileProtocolHandler);
var ds = rdfs.GetDataSourceBlocking(fileHandler.getURLSpecFromFile(file));

ds.AddObserver(aRDFObserver);