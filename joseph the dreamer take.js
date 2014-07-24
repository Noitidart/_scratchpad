// So we define a function that loads images, and returns a promise for us to listen to
function loadImages(images){
  //alert(blah); //promise should catch on this error here
  
  // We can take advantage of `map` which iterates through an array and makes an array
  // out of the returns of each iteration. In this case, we return a promise for each
  // url, for `Promise.all` to listen to later.
  var promises = images.map(function(url){

    // Create a Deferred object and image, and handle the resolution stuff.
    var deferred = Promise.defer();
    var image = new Image();
    image.onload = function(){deferred.resolve('image success: '+ url);};
    image.onerror = function(){deferred.reject('image failed: ' + url);};
    image.onabort = function(){deferred.reject('image aborted: ' + url);};
    image.src = url;

    // Return the promise, which will be stored in the array, thanks to `map`
    return deferred.promise;
  });

  // Listen on the array of promises (aha moment: jQuery.when == Promises.all, more or less.)
  return Promise.all(promises);
}

// Now we use `loadImages`, loading an array of urls, and listening for notices
loadImages([
  'http://www.mozilla.org/media/img/firefox/favicon.png',
  'https://developer.cdn.mozilla.net/media/redesign/img/favicon32.png'
]).then(function(value){
  console.log('loadImages successful: ' + value);
},function(error){
  console.log('loadImages failed: ' + error);
});