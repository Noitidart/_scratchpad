var my_jenv = null;
try {
	my_jenv = JNI.GetForThread();

	var SIG = {
		WindowManager: 'Landroid/view/WindowManager;',
		WindowManager_LayoutParams: 'Landroid/view/WindowManager$LayoutParams;',
		ViewGroup_LayoutParams: 'Landroid/view/ViewGroup$LayoutParams;',
		View: 'Landroid/view/View;',
		void: 'V',
		PixelFormat: 'Landroid/graphics/PixelFormat;',
		int: 'I',
		Context: 'Landroid/content/Context;',
		String: 'Ljava/lang/String;',
		Object: 'Ljava/lang/Object;',
		GeckoAppShell: 'Lorg/mozilla/gecko/GeckoAppShell;',
		LayoutInflater: 'Landroid/view/LayoutInflater;',
		R_layout: 'Landroid/R$layout;',
		ViewGroup: 'Landroid/view/ViewGroup;'
	};

	var GeckoAppShell = JNI.LoadClass(my_jenv, SIG.GeckoAppShell.substr(1, SIG.GeckoAppShell.length - 2), {
		static_methods: [
			{ name: 'getContext', sig: '()' + SIG.Context }
		]
	});
	
	var Context = JNI.LoadClass(my_jenv, SIG.Context.substr(1, SIG.Context.length - 2), {
		methods: [
			{ name: 'getSystemService', sig: '(' + SIG.String + ')' + SIG.Object }
		],
		static_fields: [
			{ name: 'WINDOW_SERVICE', sig: SIG.String},
			{ name: 'LAYOUT_INFLATER_SERVICE', sig: SIG.String}
		]
	});
	
	var WindowManager = JNI.LoadClass(my_jenv, SIG.WindowManager.substr(1, SIG.WindowManager.length - 2), {
		methods: [
			{ name: 'addView', sig: '(' + SIG.View + SIG.ViewGroup_LayoutParams + ')' + SIG.void },
			{ name: 'removeView', sig: '(' + SIG.View + ')' + SIG.void }
		]
	});
	
	var WindowManager_LayoutParams = JNI.LoadClass(my_jenv, SIG.WindowManager_LayoutParams.substr(1, SIG.WindowManager_LayoutParams.length - 2), {
		constructors: [
			{ /*name: '<init>', /*not needed*/ sig:
				'(' + 
					SIG.int +			// int w
					SIG.int +			// int h
					SIG.int +			// int _type
					SIG.int +			// int _flags
					SIG.int +			// int _format
				')' +
				SIG.void				// return
			}
		],
		static_fields: [
			{ name: 'FLAG_NOT_FOCUSABLE', sig: SIG.int },
			{ name: 'MATCH_PARENT', sig: SIG.int },
			{ name: 'TYPE_PHONE', sig: SIG.int },
			{ name: 'TYPE_SYSTEM_ALERT', sig: SIG.int }
		],
		fields: [
			{ name: 'gravity', sig: SIG.int },
			{ name: 'x', sig: SIG.int },
			{ name: 'y', sig: SIG.int }
		]
	});
	
	var PixelFormat = JNI.LoadClass(my_jenv, SIG.PixelFormat.substr(1, SIG.PixelFormat.length - 2), {
		static_fields: [
			{ name: 'TRANSLUCENT', sig: SIG.int }
		]
	});
	
	var LayoutInflater = JNI.LoadClass(my_jenv, SIG.LayoutInflater.substr(1, SIG.LayoutInflater.length - 2), {
		methods: [
			{ name: 'inflate', sig: '(' + SIG.int + SIG.ViewGroup + ')' + SIG.View }
		]
	});
	
	var R_layout = JNI.LoadClass(my_jenv, SIG.R_layout.substr(1, SIG.R_layout.length - 2), {
		static_fields: [
			// { name: 'my_view', sig: SIG.View }
		]
	});
	
	var View = JNI.LoadClass(my_jenv, SIG.View.substr(1, SIG.View.length - 2), {
		constructors: [
			{ /*name: '<init>', /*not needed*/ sig:
				'(' + 
					SIG.Context +	// Context context
				')' +
				SIG.void			// return
			}
		]
	});
	
	var aContext = GeckoAppShell.getContext();
	var wm = aContext.getSystemService(Context.WINDOW_SERVICE);
	wm = JNI.classes.android.view.WindowManager.__cast__(wm);
	
	// var inflater = aContext.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
	// inflater = JNI.classes.android.view.LayoutInflater.__cast__(inflater);
	// inflater.inflate(R_layout.my_view, null);
	var myView = View.new(aContext);
	
	var params = WindowManager_LayoutParams.new(
		WindowManager_LayoutParams.MATCH_PARENT,
		WindowManager_LayoutParams.MATCH_PARENT,
		WindowManager_LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager_LayoutParams.FLAG_NOT_FOCUSABLE,
		PixelFormat.TRANSLUCENT
	);
	
	params.x = 0;
	params.y = 0;
	
	wm.addView(myView, params);
	console.log('will block/make fx unresponsive until `wm.removeView(myView)` is done');

	setTimeout(function() {
		wm.removeView(myView);
		console.log('view removed')
	}, 5000);
	
} finally {
	if (my_jenv) {
		JNI.UnloadClasses(my_jenv);
	}
}