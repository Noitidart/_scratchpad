var my_jenv = null;
try {
	my_jenv = JNI.GetForThread();

	var SIG = {
		String: 'Ljava/lang/String;',
		int: 'I'
	};

	JNI.LoadClass(my_jenv, '[' + SIG.String);
	JNI.LoadClass(my_jenv, '[' + SIG.int);
	
	// console.info('JNI.classes.java.lang.String.array:', uneval(JNI.classes));
	
	// console.info('JNI.classes.java.lang.String.array:', uneval(JNI.classes.java.lang.String.array)); // for this I needed `JNI.LoadClass(jenv, "["+String);`
	var StringArray = JNI.classes.java.lang.String.array;
	console.info('StringArray:', uneval(StringArray));
	
	var sa = StringArray.new(5);
	console.info('sa:', uneval(sa));
	
	var IntArray = JNI.classes.int.array;
	console.info('IntArray:', uneval(IntArray));
	
	var ia = IntArray.new(5);
	console.info('ia:', uneval(ia));
	
} finally {
	if (my_jenv) {
		JNI.UnloadClasses(my_jenv);
	}
}