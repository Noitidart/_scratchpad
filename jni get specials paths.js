Cu.import('resource://gre/modules/ctypes.jsm');

var my_jenv = null;
try {
	my_jenv = JNI.GetForThread();

	var SIG = {
		Environment: 'Landroid/os/Environment;',
		String: 'Ljava/lang/String;',
		CharSequence: 'Ljava/lang/CharSequence;',
		boolean: 'Z',
		int: 'I',
		char: 'C',
		void: 'V',
		byte: 'B',
		CharsetEncoder: 'Ljava/nio/charset/CharsetEncoder;',
		Charset: 'Ljava/nio/charset/Charset;'
	};
	
	var jEnvironment = JNI.LoadClass(my_jenv, SIG.Environment.substr(1, SIG.Environment.length - 2), {
		static_fields: [
			{ name: 'DIRECTORY_PICTURES', sig: SIG.String }
		]
	});

	var CharsetEncoder = JNI.LoadClass(my_jenv, SIG.CharsetEncoder.substr(1, SIG.CharsetEncoder.length - 2), {
		methods: [
			{ name: 'charset', sig: '()' + SIG.Charset }
		]
	});

	var jString = JNI.LoadClass(my_jenv, SIG.String.substr(1, SIG.String.length - 2), {
		methods: [
			/* http://developer.android.com/reference/java/lang/String.html#charAt%28int%29
			 * public char charAt (
			 *   int index
			 * )
			 */
			/*
			{ name: 'charAt', sig:
				'(' + 
					SIG.int +				// int index
				')' +
				SIG.char					// return
			},
			*/
			/*
			{ name: 'indexOf', sig:
				'(' + 
					SIG.String +				// String string
				')' +
				SIG.int							// return
			}
			*/
			{ name: 'length', sig:
				'(' + 
				')' +
				SIG.int							// return
			},
			{ name: 'subSequence', sig:
				'(' + 
					SIG.int +		// int start
					SIG.int +		// int end
				')' +
				SIG.CharSequence							// return
			},
			//{ name: 'toCharArray', sig: '()[' + SIG.char }
			{ name: 'getBytes', sig: '(' + SIG.String + ')[' + SIG.byte }
		]
	});

	/*
	var len_dirPics = jEnvironment.DIRECTORY_PICTURES.length()
	console.info('len_dirPics:', len_dirPics);
	
	var cs_dirPics = jEnvironment.DIRECTORY_PICTURES.subSequence(0, len_dirPics);
	console.info('cs_dirPics:', cs_dirPics);
	*/
	
	var picsBytes = jEnvironment.DIRECTORY_PICTURES.getBytes('UTF16');
	console.info('picsBytes:', picsBytes);
	
	//var casted = ctypes.cast(picsBytes['js#obj'], ctypes.char.array(5).ptr);
	
} finally {
	if (my_jenv) {
		JNI.UnloadClasses(my_jenv);
	}
}