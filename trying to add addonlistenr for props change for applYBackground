Cu.import('resource://gre/modules/AddonManager.jsm');
var addonListener = {
  onPropertyChanged: function(addon, properties) {
    console.log('props changed on addon:', addon, 'properties:', properties);
  }
};
/*
AddonManager.getAddonByID('Profilist@jetpack', function(addon) {
console.info('addon:', addon);
console.info('addon.applyBackgroundUpdates:', addon.applyBackgroundUpdates);
addon.applyBackgroundUpdates = 0; //off
//addon.applyBackgroundUpdates = 1; //default
//addon.applyBackgroundUpdates = 2; //on
});
*/

AddonManager.addAddonListener(addonListener);