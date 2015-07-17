var my_jenv = null;
try {
	my_jenv = JNI.GetForThread();

	var SIG = {
		Context: 'Landroid/content/Context;',
		Activity: 'Landroid/app/Activity;',
		GeckoAppShell: 'Lorg/mozilla/gecko/GeckoAppShell;',
		GeckoApp: 'Lorg/mozilla/gecko/GeckoApp;',
		GeckoInterface: 'Lorg/mozilla/gecko/GeckoAppShell$GeckoInterface;'
	};

	var GeckoAppShell = JNI.LoadClass(my_jenv, SIG.GeckoAppShell.substr(1, SIG.GeckoAppShell.length - 2), {
		static_methods: [
			{ name: 'getContext', sig: '()' + SIG.Context },
			{ name: 'getGeckoInterface', sig: '()' + SIG.GeckoInterface }
		]
	});
	
	var GeckoInterface = JNI.LoadClass(my_jenv, SIG.GeckoInterface.substr(1, SIG.GeckoInterface.length - 2), {
		methods: [
			{ name: 'getActivity', sig: '()' + SIG.Activity }
		]
	});
	
	var GeckoApp = JNI.LoadClass(my_jenv, SIG.GeckoApp.substr(1, SIG.GeckoApp.length - 2), {
		methods: [
			{ name: 'getContext', sig: '()' + SIG.Context },
			{ name: 'getActivity', sig: '()' + SIG.Activity }
		]
	});

	var geckoInterface = GeckoAppShell.getGeckoInterface();
	var activity = geckoInterface.getActivity();
	
} finally {
	if (my_jenv) {
		JNI.UnloadClasses(my_jenv);
	}
}