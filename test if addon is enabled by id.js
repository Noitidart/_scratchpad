//this checks to see if AdBlock Plus is enabled
AddonManager.getAddonsByIDs(["{d10d0bf8-f5b5-c8b4-a8b2-2b9879e08c5d}"], function ([aAddon1]) {
	console.log(aAddon1);
	var isAddonEnabled = aAddon1.isActive;
	alert('AdBlock plus enabled = ' + isAddonEnabled)
	//for other properties see here: https://developer.mozilla.org/en-US/Add-ons/Add-on_Manager/Addon#Required_properties
});