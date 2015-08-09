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
		Window: 'Landroid/view/Window;',
		Canvas: 'Landroid/graphics/Canvas;',
		Buffer: 'Ljava/nio/Buffer;',
		ByteBuffer: 'Ljava/nio/ByteBuffer;',
		byte: 'B'
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
			},
			{ name: 'copyPixelsToBuffer', sig:
				'(' + 
					SIG.Buffer +			// Buffer dst
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

	var Canvas = JNI.LoadClass(my_jenv, SIG.Canvas.substr(1, SIG.Canvas.length - 2), {
		constructors: [
			{ name: '<init>', sig: '(' + SIG.Bitmap + ')V' }, // http://developer.android.com/reference/android/graphics/Canvas.html#Canvas%28android.graphics.Bitmap%29
		]
	});
	
	var View = JNI.LoadClass(my_jenv, SIG.View.substr(1, SIG.View.length - 2), {
		methods: [
			{ name: 'draw', sig: '(' + SIG.Canvas + ')V' }, // http://developer.android.com/reference/android/view/View.html#draw%28android.graphics.Canvas%29
		]
	});

	var ByteBuffer = JNI.LoadClass(my_jenv, SIG.ByteBuffer.substr(1, SIG.ByteBuffer.length - 2), {
		static_methods: [
			{ name: 'wrap', sig: '(' + '[' + SIG.byte + ')' + SIG.ByteBuffer } // actually never mind my thought was wrong: // link498066 - because of this i dont need a `JNI.LoadClass(my_jenv, '[' + SIG.byte);` in order to use `JNI.classes.byte.array`
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
	
	var canvas = Canvas['new'](bmp);
	console.info('canvas:', canvas);
	
	rootView.draw(canvas);
	
	console.log('drwaing done');
	
	var imagedata = new ImageData(width, height);
	var dataRef = imagedata.data;
	
	///* getPixels method
	JNI.LoadClass(my_jenv, '[' + SIG.int);
	var IntArray = JNI.classes.int.array;
	var pixels = IntArray.new(width * height);
	//var pixels = JNI.jint.array(width * height)(); // bad way, caused crash
	
	bmp.getPixels(pixels, 0, width, 0, 0, width, height);
	console.info('pixels:', pixels['js#obj'].toString());
	
	console.time('getPixels post work');

	var pixels_data = pixels.getElements(0, pixels.length);
	
	var j=0;
	var numPixels = width * height; // pixels.length
	for (var i=0; i<numPixels; i++) {
		// var pixel = pixels.get(i);
		var pixel = pixels_data[i];
		dataRef[j] = (pixel >> 16) & 0xff; // r
		dataRef[j+1] = (pixel >> 8) & 0xff; // g
		dataRef[j+2] = pixel & 0xff; // b
		dataRef[j+3] = 255; // a
		j += 4;
	}
	console.timeEnd('getPixels post work');
	//*/
	
	/* // copyPixelsToBuffer method
	JNI.LoadClass(my_jenv, '[' + SIG.byte); // actually still needed despit so what i thought was wrong: // not needed because i loaded this in the methods above see link498066
	var ByteArray = JNI.classes.byte.array;
	var rgba_arr = ByteArray.new(width * 4 * height);
	
	var rgba_buf = ByteBuffer.wrap(rgba_arr);
	bmp.copyPixelsToBuffer(rgba_buf);
	
	
	console.time('copyPixelsToBuffer post work');
	
	var numPixels = width * height; // pixels.length
	for (var i=0; i<numPixels; i=i+4) {
		dataRef[i] = rgba_arr.get(i);
		dataRef[i+1] = rgba_arr.get(i+1);
		dataRef[i+2] = rgba_arr.get(i+2);
		dataRef[i+3] = 255;
	}
	console.timeEnd('copyPixelsToBuffer post work');
	//*/
	
	var NS_HTML = 'http://www.w3.org/1999/xhtml';

	var aLinkedBrowser = BrowserApp._tabs[1];
	var aContentWindow = aLinkedBrowser.window;
	var aContentDocument = aContentWindow.document;

	var aCanvas = aContentDocument.createElementNS(NS_HTML, 'canvas');
	var aCtx = aCanvas.getContext('2d');

	aCanvas.width = width;
	aCanvas.height = height;
	
	aCtx.putImageData(imagedata, 0, 0);
	
	// aCtx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	// aCtx.fillRect(0, 0, width, height);
	
	aContentDocument.documentElement.appendChild(aCanvas);
	


    (aCanvas.toBlobHD || aCanvas.toBlob).call(aCanvas, function(b) {
        var r = Cc['@mozilla.org/files/filereader;1'].createInstance(Ci.nsIDOMFileReader); //new FileReader();
        r.onloadend = function() {
            // r.result contains the ArrayBuffer.
            var writePath = OS.Path.join(Services.dirsvc.get('UpdRootD', Ci.nsIFile).path, 'jniViewShot.png');
            var promise = OS.File.writeAtomic(writePath, new Uint8Array(r.result), { tmpPath: writePath + '.tmp' });
            promise.then(
                function(aVal) {
                    console.log('successfully saved image to disk');
                },
                function(aReason) {
                    console.log('writeAtomic failed for reason:', aReason);
                }
            );
        };
        r.readAsArrayBuffer(b);
    }, 'image/png');

	
} finally {
	if (my_jenv) {
		JNI.UnloadClasses(my_jenv);
	}
}