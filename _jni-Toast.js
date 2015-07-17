var jenv = null;
try {
	jenv = JNI.GetForThread();

	// We declare the classes, methods, etc we will be using: this part is not seen in the native example
	var SIG = {
		CharSequence: 'Ljava/lang/CharSequence;',
		Context: 'Landroid/content/Context;',
		GeckoAppShell: 'Lorg.mozilla.gecko.GeckoAppShell;',
		Toast: 'Landroid/widget/Toast;', // can use .'s or /'s so `android.widget.Toast` and `android/widget/Toast` both work // from docs page header http://developer.android.com/reference/android/widget/Toast.html#makeText%28android.content.Context,%20int,%20int%29
		int: 'I', // from https://docs.oracle.com/javase/7/docs/technotes/guides/jni/spec/types.html#wp9502
		void: 'V' // from http://www.rgagnon.com/javadetails/java-0286.html
	};

	var Toast = JNI.LoadClass(jenv, SIG.Toast.substr(1, SIG.Toast.length - 2), {
		static_fields: [
			{ name: 'LENGTH_SHORT', sig: SIG.int }],
		static_methods: [
			{ name: 'makeText', sig: '(' + SIG.Context + SIG.CharSequence + SIG.int + ')' + SIG.Toast } // http://developer.android.com/reference/android/widget/Toast.html#makeText%28android.content.Context,%20int,%20int%29
		],
		methods: [
			{ name: 'show', sig: '()' + SIG.void } // http://developer.android.com/reference/android/widget/Toast.html#show%28%29
		]
	});

	var geckoAppShell = JNI.LoadClass(jenv, SIG.GeckoAppShell.substr(1, SIG.GeckoAppShell.length - 2), {
		static_methods: [
			{ name: 'getPreferredIconSize', sig: '()' + SIG.int },
			{ name: 'getContext', sig: '()' + SIG.Context },
		]
	});

	// ok this ends the JNI specific stuff, now below you will see native-by-jni side-by-side

	// Context context = getApplicationContext();
	var context = geckoAppShell.getContext();

	// CharSequence text = 'Hello toast!';
	var text = 'Hello toast!';

	// int duration = Toast.LENGTH_SHORT;
	var duration = Toast.LENGTH_SHORT;

	// Toast toast = Toast.makeText(context, text, duration);
	var toast = Toast.makeText(context, text, duration);

	toast.show();

} finally {
	if (jenv) {
		JNI.UnloadClasses(jenv);
	}
}