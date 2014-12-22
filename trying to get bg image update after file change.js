var XPIScope = Cu.import('resource://gre/modules/addons/XPIProvider.jsm');
var scope = XPIScope.XPIProvider.bootstrapScopes['Profilist@jetpack'];

if (!lastUsed) {
  var lastUsed = scope.myServices.sss.AUTHOR_SHEET;
}
scope.myServices.sss.unregisterSheet(scope.cssBuildIconsURI, lastUsed)
if (lastUsed == scope.myServices.sss.USER_SHEET) {
  lastUsed = scope.myServices.sss.AUTHOR_SHEET;
} else {
  lastUsed = scope.myServices.sss.USER_SHEET;
}
scope.myServices.sss.loadAndRegisterSheet(scope.cssBuildIconsURI, lastUsed)

//Services.ww.activeWindow.alert(scope.myServices.sss.loadAndRegisterSheet);


//myServices.sss.loadAndRegisterSheet(cssBuildIconsURI, myServices.sss.AUTHOR_SHEET);