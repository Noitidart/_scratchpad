var sm = Cc['@mozilla.org/gfx/screenmanager;1'].getService(Ci.nsIScreenManager);

function getScreens() {
	var screen = null;
	var screens = [];
	var screenManager = sm;
	var min = 0;
	var max = 0;
	for (x = 0; x < 15000; x += 600) {
		var s = screenManager.screenForRect(x, 20, 10, 10);
		if (s != screen) {
			screen = s;
			var left = {},
				top = {},
				width = {},
				height = {};
			screenManager.primaryScreen.GetRect(left, top, width, height);
			screens.push({
				width: width.value,
				height: height.value,
				min: min,
				max: min + width.value
			});
			min += width.value;
		}
	}
	return screens;
}

var screens = getScreens();
console.log('screens:', screens);