// code from http://stackoverflow.com/questions/27842615/how-to-find-specific-cache-entries-in-firefox-and-turn-them-into-a-file-or-blob

var cacheWaiter = {
  //This function essentially tells the cache service whether or not we want
  //this cache descriptor. If ENTRY_WANTED is returned, the cache descriptor is
  //passed to onCacheEntryAvailable()
  onCacheEntryCheck: function( descriptor, appcache )
  {
    //First, we want to be sure the cache entry is not currently being written
    //so that we can be sure that the file is complete when we go to open it.
    //If predictedDataSize > dataSize, chances are it's still in the process of
    //being cached and we won't be able to get an exclusive lock on it and it
    //will be incomplete, so we don't want it right now.
    try{
      if( descriptor.dataSize < descriptor.predictedDataSize )
        //This tells the nsICacheService to call this function again once the
        //currently writing process is done writing the cache entry.
        return Components.interfaces.nsICacheEntryOpenCallback.RECHECK_AFTER_WRITE_FINISHED;
    }
    catch(e){
      //Also return the same value for any other error
      return Components.interfaces.nsICacheEntryOpenCallback.RECHECK_AFTER_WRITE_FINISHED;
    }
    //If no exceptions occurred and predictedDataSize == dataSize, tell the
    //nsICacheService to pass the descriptor to this.onCacheEntryAvailable()
    return Components.interfaces.nsICacheEntryOpenCallback.ENTRY_WANTED;
  },

  //Once we are certain we want to use this descriptor (i.e. it is done
  //downloading and we want to read it), it gets passed to this function
  //where we can do what we wish with it.
  //At this point we will have full control of the descriptor until this
  //function exits (or, I believe that's how it works)
  onCacheEntryAvailable: function( descriptor, isnew, appcache, status )
  {
    console.log('entry found!!!!!!!!!!!', descriptor, isnew, appcache, status);
  /*
    //In this function, you can do your cache descriptor reads and store
    //it in a Blob() for upload. I haven't actually tested the code I put
    //here, modifications may be needed.
    var cacheentryinputstream = descriptor.openInputStream(0);
    var blobarray = new Array(0);
    var buffer;      

    for( var i = descriptor.dataSize; i > 1024; i -= 1024)
    {
      try{
        cacheentryinputstream.read( buffer, 1024 );
      }
      catch(e){
        //Nasty NS_ERROR_WOULD_BLOCK exceptions seem to happen to me
        //frequently. The Mozilla guys don't provide a way around this,
        //since they want a responsive UI at all costs. So, just keep
        //trying until it succeeds.
        i += 1024;
      }
      for( var j = 0; j < 1024; j++ )
      {
        blobarray.push(buffer.charAt(j));
      }
    }
    var theblob = new Blob(blobarray);
    //Do an AJAX POST request here.
    */
  }

}

var theuri = "file:///C:/Users/Vayeate/Desktop/build1.png";

//Load the cache service
var cacheservice = Components.classes["@mozilla.org/netwerk/cache-storage-service;1"].getService(Components.interfaces.nsICacheStorageService);

//Load context info about the various caches
var {LoadContextInfo} = Components.utils.import("resource://gre/modules/LoadContextInfo.jsm",{})

//Select the default disk cache.
var hdcache = cacheservice.diskCacheStorage(LoadContextInfo.default, true);

//Request a cache entry for the URI. OPEN_NORMALLY requests write access.
hdcache.asyncOpenURI(Services.io.newURI(theuri, null, null), "", hdcache.OPEN_NORMALLY, cacheWaiter);