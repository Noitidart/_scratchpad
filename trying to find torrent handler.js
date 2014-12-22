var win = Services.wm.getMostRecentWindow('Browser:Preferences');
console.log(win.gApplicationsPane)

for (var i=0; i<win.gApplicationsPane._visibleTypes.length; i++) {
  var blah = win.gApplicationsPane._visibleTypes[i];
  try {
    console.log(i, blah.description, blah._type, {blah:blah}); //double wrapping blah so console.log is readable
  } catch(ex) {
    //sometimes its wrappedHandlerInfo.description doesnt exist, its weird
    console.log(i, blah._type, {blah:blah}, ex)
  }
}