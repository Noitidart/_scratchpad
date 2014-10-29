//gBrowser.removeTab = 'alert("HA")'
alert(gBrowser.removeTab)


  // Keep a reference to the original function.
  var _original = gBrowser.removeTab;
  
  // Override a function.
  gBrowser.removeTab = function() {
    // Execute some action before the original function call.
    try {
        var closeit = confirm('are you sure you want to close the tab?')
    } catch (ex) { /* might handle this */ }

    // Execute original function.
    if (closeit) {
     var rv = _original.apply(gBrowser, arguments);
    }

    // return the original result
    return rv;
  };