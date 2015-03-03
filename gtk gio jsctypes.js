Cu.import('resource://gre/modules/ctypes.jsm');

var gio = ctypes.open('libgio-2.0.so.0');

// BASIC TYPES
var TYPES = {
	gchar: ctypes.char,
	gint: ctypes.int,
	GAppInfo: ctypes.voidptr_t, //ctypes.StructType('GAppInfo'),
	GAppLaunchContext: ctypes.voidptr_t, //ctypes.StructType('GAppLaunchContext'),
	GDesktopAppInfo: ctypes.voidptr_t, //ctypes.StructType('GDesktopAppInfo'),
	//GError: ctypes.voidptr_t, //ctypes.StructType('GError'),
	
    GError: new ctypes.StructType('GError', [
		{'domain': ctypes.int32_t},
		{'code': ctypes.int32_t},
		{'message': ctypes.char.ptr}
    ]),
	
	//GList: ctypes.voidptr_t, //ctypes.StructType('GList')
	
    GList: new ctypes.StructType('GList', [
		{'data': ctypes.voidptr_t},
		{'next': ctypes.voidptr_t},
		{'prev': ctypes.voidptr_t}
    ])
	
	
};

// ADVANCED TYPES
TYPES.gboolean = TYPES.gint;

// CONSTANTS
var CONSTS = {
	None: 0
};

// FUNCTIONS
/* https://developer.gnome.org/gio/unstable/gio-Desktop-file-based-GAppInfo.html#g-desktop-app-info-new-from-filename
 * GDesktopAppInfo * g_desktop_app_info_new_from_filename(
 *   const char *filename
 * );
 */
var new_from_filename = gio.declare('g_desktop_app_info_new_from_filename', ctypes.default_abi,
	TYPES.GDesktopAppInfo,	// return
	TYPES.gchar.ptr			// *filename
);

/* https://developer.gnome.org/gio/unstable/GAppInfo.html#g-app-info-launch-uris
 * gboolean g_app_info_launch_uris (
 *   GAppInfo *appinfo,
 *   GList *uris,
 *   GAppLaunchContext *launch_context,
 *   GError **error
 * );
 */
var launch_uris = gio.declare('g_app_info_launch_uris', ctypes.default_abi,
	TYPES.gboolean,				// return
	TYPES.GAppInfo.ptr,			// *appinfo
	TYPES.GList.ptr,			// *uris
	TYPES.GAppLaunchContext,	// *launch_context
	TYPES.GError.ptr.ptr		// **error
);

// start - helper functions

// end - helper functions

var shutdown = function() {
    
    gio.close();
    console.log('succesfully shutdown');
}

function main() {
	var jsStr_pathToDesktopFile = OS.Path.join(OS.Constants.Path.desktopDir, 'Firefox - Profile Manager.desktop');
	var launcher = new_from_filename(OS.Path.join(OS.Constants.Path.desktopDir, jsStr_pathToDesktopFile));
	console.info('launcher:', launcher, launcher.toString(), uneval(launcher));
	
	if (launcher.isNull()) {
		throw new Error('No file exists at path: "' + jsStr_pathToDesktopFile + '"');
	}
	
	var uris = new TYPES.GList();
	var launch_context = ctypes.cast(ctypes.uint64_t(0x0), TYPES.GAppLaunchContext);
	var error = new TYPES.GError.ptr();
	var rez_launch_uris = launch_uris(launcher.address(), uris.address(), launch_context.address(), error.address());
	console.info('rez_launch_uris:', rez_launch_uris, rez_launch_uris.toString(), uneval(rez_launch_uris));
	console.info('error:', error, error.toString(), uneval(error));
}

try {
    main();
} catch (ex) {
    console.error('Error Occured:', ex);
} finally {
    shutdown();
}