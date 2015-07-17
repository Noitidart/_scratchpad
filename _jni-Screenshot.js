// http://stackoverflow.com/questions/2661536/how-to-programatically-take-a-screenshot-on-android/16109978#16109978
// public Bitmap screenShot(View view) {
//     Bitmap bitmap = Bitmap.createBitmap(view.getWidth(),
//             view.getHeight(), Config.ARGB_8888);
//     Canvas canvas = new Canvas(bitmap);
//     view.draw(canvas);
//     return bitmap;
// }


var my_jenv = null;
try {
	my_jenv = JNI.GetForThread();

	var SIG = {
		Bitmap: 'Landroid/graphics/Bitmap;',
		Activity: 'Landroid/app/Activity;',
		Bitmap_Config: 'Landroid/graphics/Bitmap$Config;', // `android.graphics.Bitmap.Config` in slash notation is with dollar sign as Config is subclass so use `android/graphics/Bitmap$Config` IMPORTANT: cannot even use the dot notation for LoadClass must use the slash slash dollar sign
		Context: 'Landroid/content/Context;',
		GeckoApp: 'Lorg/mozilla/gecko/GeckoApp;',
		GeckoAppShell: 'Lorg/mozilla/gecko/GeckoAppShell;',
		GeckoInterface: 'Lorg/mozilla/gecko/GeckoAppShell$GeckoInterface;',
		int: 'I',
		R: 'Landroid/R$id;',
		View: 'Landroid/view/View;', // MUST USE `/`'s instead of `.`'s using dots is ok in the LoadClass, but in the method declaration its not and will cause crash
		void: 'V',
		Window: 'Landroid/view/Window;'
	};

	var View = JNI.LoadClass(my_jenv, SIG.View.substr(1, SIG.View.length - 2), {
		methods: [
			{ name: 'getRootView', sig: '()' + SIG.View }, // http://developer.android.com/reference/android/view/View.html#getRootView%28%29
			{ name: 'getWidth', sig: '()' + SIG.int }, // http://developer.android.com/reference/android/view/View.html#getWidth%28%29
			{ name: 'getHeight', sig: '()' + SIG.int } // http://developer.android.com/reference/android/view/View.html#getHeight%28%29
		]
	});
	
	var R = JNI.LoadClass(my_jenv, SIG.R.substr(1, SIG.R.length - 2), {
		static_fields: [
			{ name: 'content', sig: SIG.int } // http://developer.android.com/reference/android/R.id.html#content
		]
	});	
	
	var Activity = JNI.LoadClass(my_jenv, SIG.Activity.substr(1, SIG.Activity.length - 2), {
		methods: [
			{ name: 'findViewById', sig: '(' + SIG.int + ')' + SIG.View }, // http://developer.android.com/reference/android/app/Activity.html#findViewById%28int%29
			{ name: 'getWindow', sig: '()' + SIG.Window } // http://developer.android.com/reference/android/app/Activity.html#getWindow%28%29
		]
	});	
	
	var Window = JNI.LoadClass(my_jenv, SIG.Window.substr(1, SIG.Window.length - 2), {
		methods: [
			{ name: 'getDecorView', sig: '()' + SIG.View } // http://developer.android.com/reference/android/view/Window.html#getDecorView%28%29
		]
	});
	
	var Bitmap_Config = JNI.LoadClass(my_jenv, SIG.Bitmap_Config.substr(1, SIG.Bitmap_Config.length - 2), {
		static_fields: [
			{ name: 'ARGB_8888', sig: SIG.Bitmap_Config }
		]
	});

	var Bitmap = JNI.LoadClass(my_jenv, SIG.Bitmap.substr(1, SIG.Bitmap.length - 2), {
		static_methods: [
			/* http://developer.android.com/reference/android/graphics/Bitmap.html#createBitmap%28int,%20int,%20android.graphics.Bitmap.Config%29
			 * public static Bitmap createBitmap (
			 *   int width,
			 *   int height,
			 *   Bitmap.Config config
			 * )
			 */
			{ name: 'createBitmap', sig:
				'(' + 
					SIG.int +				// int width
					SIG.int +				// int height
					SIG.Bitmap_Config +		// Bitmap.Config config
				')' +
				SIG.Bitmap					// return
			}
		],
		methods: [
			/* http://developer.android.com/reference/android/graphics/Bitmap.html#getPixels%28int[],%20int,%20int,%20int,%20int,%20int,%20int%29
			 * public void getPixels (
			 *   int[] pixels,
			 *   int offset,
			 *   int stride,
			 *   int x,
			 *   int y,
			 *   int width,
			 *   int height
			 * )
			 */
			{ name: 'getPixels', sig:
				'(' + 
					'[' + SIG.int +			// int[] pixels
					SIG.int +				// int offset
					SIG.int +				// int stride
					SIG.int +				// int x
					SIG.int +				// int y
					SIG.int +				// int width
					SIG.int +				// int height
				')' +
				SIG.void					// return
			}
		]
	});
	
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
	var win = activity.getWindow();
	var view = win.getDecorView();
	var rootView = view.getRootView();
	
	var width = rootView.getWidth();
	var height = rootView.getHeight();
	
	console.info('width:', width, 'height:', height);

	var bmp = Bitmap.createBitmap(width, height, Bitmap_Config.ARGB_8888);
	console.info('bmp:', bmp);

	var rgba = JNI.jint.array(width * height)();
	console.info('rgba:', rgba.toString());
	bmp.getPixels(rgba, 0, width, 0, 0, width, height);
	console.info('rgba:', rgba.toString());
	
} finally {
	if (my_jenv) {
		JNI.UnloadClasses(my_jenv);
	}
}