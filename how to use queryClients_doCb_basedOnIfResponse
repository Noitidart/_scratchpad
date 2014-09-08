var XPIScope = Cu.import('resource://gre/modules/addons/XPIProvider.jsm');
var scope = XPIScope.XPIProvider.bootstrapScopes['Profilist@jetpack'];
console.time('rawr');
scope.queryClients_doCb_basedOnIfResponse(
  function onResponse() {
    console.timeEnd('rawr');
    alert('SOMETHINGS ALIVE');
  },
  function onNoResp(){
    console.timeEnd('rawr');
    alert('all dead');
  }
);