var my_jenv = null;
try {
	my_jenv = JNI.GetForThread();

	var SIG = {
		Environment: 'Landroid/os/Environment;',
		String: 'Ljava/lang/String;',
		File: 'Ljava/io/File;'
	};
	
	var Environment = JNI.LoadClass(my_jenv, SIG.Environment.substr(1, SIG.Environment.length - 2), {
		static_fields: [
			{ name: 'DIRECTORY_PICTURES', sig: SIG.String }
		],
		static_methods: [
			{ name:'getExternalStorageDirectory', sig:'()' + SIG.File }
		]
	});
	
	var jFile = JNI.LoadClass(my_jenv, SIG.File.substr(1, SIG.File.length - 2), {
		methods: [
			{ name:'getPath', sig:'()' + SIG.String },
			{ name:'getAbsolutePath', sig:'()' + SIG.String }
		]
	});

	var OSPath_dirExternalStorage = JNI.ReadString(my_jenv, Environment.getExternalStorageDirectory().getPath());
	var OSPath_dirFxDownloads = Services.dirsvc.get('UpdRootD', Ci.nsIFile).path;
	var OSPath_dirDefaultDownloads = Services.dirsvc.get('DfltDwnld', Ci.nsIFile).path;
	var OSPath_dirnamePics = JNI.ReadString(my_jenv, Environment.DIRECTORY_PICTURES);
	var OSPath_dirPics = OS.Path.join(OSPath_dirExternalStorage, OSPath_dirnamePics);
	
} finally {
	if (my_jenv) {
		JNI.UnloadClasses(my_jenv);
	}
}