Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

// types
var ID = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var BOOL = ctypes.signed_char;
var NSUInteger = ctypes.unsigned_long;

// constants
var NIL = ctypes.voidptr_t(ctypes.UInt64('0x0'));

//common functions
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');

//common selectors
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

// start helper functions
var __sel_registerName = {};
function _sel_registerName(jsStr) {
	if (!(jsStr in __sel_registerName)) {
		__sel_registerName[jsStr] = objc_getClass(jsStr);
	}
	return __sel_registerName[jsStr];
}

var __objc_getClass = {};
function _objc_getClass(jsStr) {
	if (!(jsStr in __objc_getClass)) {
		__objc_getClass[jsStr] = objc_getClass('NSAutoreleasePool');
	}
	return __objc_getClass[jsStr];
}

var __NSString = {};
function _NSString(jsStr) {
	if (!(jsStr in __NSString)) {
		var NSString = _objc_getClass('NSString');
		var initWithUTF8String = _sel_registerName('initWithUTF8String:');
		__NSString[jsStr] = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, CHAR.array()(jsStr));
		console.info('NSString.alloc ::', jsStr + ':', __NSString[jsStr], __NSString[jsStr].toString(), uneval(__NSString[jsStr]), __NSString[jsStr].isNull());
	}
	return __NSString[jsStr];
}

var __isKindOfClassHelper = {};
function _isKindOfClassHelper(jsStr) {
	if (!(jsStr in __isKindOfClassHelper)) {
		var isKindOfClass = _objc_getClass('isKindOfClass:');
		var obj = _objc_getClass(jsStr);
		var sel_class = _sel_registerName('class');
		__isKindOfClassHelper[jsStr] = objc_msgSend(obj, sel_class);
		console.info('__isKindOfClassHelper ::', jsStr + ':', __isKindOfClassHelper[jsStr], __isKindOfClassHelper[jsStr].toString(), uneval(__isKindOfClassHelper[jsStr]), __isKindOfClassHelper[jsStr].isNull());
	}
	return __isKindOfClassHelper[jsStr];
}
// end helper functions

function AddIcon(installed_path /* NSString* */, dmb_app_path /* NSString* */) {

	// autorelease_pool = [[NSAutoreleasePool alloc] init]
	var NSAutoreleasePool = _objc_getClass('NSAutoreleasePool');
	var autorelease_pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);

	// NSUserDefaults* user_defaults = [NSUserDefaults standardUserDefaults];
	var NSUserDefaults = _objc_getClass('NSUserDefaults');
	var standardUserDefaults = _sel_registerName('standardUserDefaults');
	var user_defaults = objc_msgSend(NSUserDefaults, standardUserDefaults);

	// NSString* const kDockDomain = @"com.apple.dock";
	var kDockDomain = _NSString('com.apple.dock');

	// NSDictionary* dock_plist_const = [user_defaults persistentDomainForName:kDockDomain];
	var persistentDomainForName = _sel_registerName('persistentDomainForName:');
	var dock_plist_const = objc_msgSend(user_defaults, persistentDomainForName, kDockDomain);

	// Bool dpc_class_is_nsd [dock_plist_const isKindOfClass:[NSDictionary class]]
	 // Class nsd_class [NSDictionary class]
	 var nsd_class = _isKindOfClassHelper('NSDictionary');
	 // Bool dpc_class_is_nsd [dock_plist_const isKindOfClass:nsd_class]
	 var isKindOfClass = _sel_registerName('isKindOfClass:');
	 var dpc_class_is_nsd = objc_msgSend(dock_plist_const, isKindOfClass, nsd_class);
	console.info('dpc_class_is_nsd:', dpc_class_is_nsd, dpc_class_is_nsd.toString(), uneval(dpc_class_is_nsd), dpc_class_is_nsd.isNull());

	if (dpc_class_is_nsd.contents == 0) {
		throw 'IconAddFailure :: dock_plist_const not NSDictionary';
	}

	// NSMutableDictionary* dock_plist = [NSMutableDictionary dictionaryWithDictionary:dock_plist_const];
	var NSMutableDictionary = _objc_getClass('NSMutableDictionary');
	var dictionaryWithDictionary = _sel_registerName('dictionaryWithDictionary:');
	var dock_plist = objc_msgSend(NSMutableDictionary, dictionaryWithDictionary, dock_plist_const);
	console.info('dock_plist:', dock_plist, dock_plist.toString(), uneval(dock_plist), dock_plist.isNull());

	// NSString* const kDockPersistentAppsKey = @"persistent-apps";
	var kDockPersistentAppsKey = _NSString('persistent-apps');

	// NSArray* persistent_apps_const = [dock_plist objectForKey:kDockPersistentAppsKey];
	var objectForKey = _sel_registerName('objectForKey');
	var persistent_apps_const = objc_msgSend(dock_plist, objectForKey, kDockPersistentAppsKey);

	// Bool pac_class_is_nsa [persistent_apps_const isKindOfClass:[NSArray class]]
	 // [NSArray class]
	 var nsa_class = _isKindOfClassHelper('NSArray');
	 // Bool pac_class_is_nsa [persistent_apps_const isKindOfClass:nsa_class]
	 var pac_class_is_nsa = objc_msgSend(persistent_apps_const, isKindOfClass, nsa_class);
	console.info('pac_class_is_nsa:', pac_class_is_nsa, pac_class_is_nsa.toString(), uneval(pac_class_is_nsa), pac_class_is_nsa.isNull());

	if (pac_class_is_nsa.contents == 0) {
		throw 'IconAddFailure :: persistent_apps_const not NSArray';
	}

	// NSMutableArray* persistent_apps = [NSMutableArray arrayWithArray:persistent_apps_const];
	var NSMutableArray = _objc_getClass('NSMutableArray');
	var arrayWithArray = _sel_registerName('arrayWithArray:');
	var persistent_apps = objc_msgSend(NSMutableArray, arrayWithArray, persistent_apps_const);
	console.info('persistent_apps:', persistent_apps, persistent_apps.toString(), uneval(persistent_apps), persistent_apps.isNull());

	// NSMutableArray* persistent_app_paths = PersistentAppPaths(persistent_apps);
	var persistent_app_paths = PersistentAppPaths(persistent_apps)

}

function PersistentAppPaths(persistent_apps /* NSArray* */) {
	// Returns an array parallel to |persistent_apps| containing only the
	// pathnames of the Dock tiles contained therein. Returns nil on failure, such
	// as when the structure of |persistent_apps| is not understood.
	
	// returns NSMutableArray*
	
	// NSMutableArray* app_paths = [NSMutableArray arrayWithCapacity:[persistent_apps count]];
	 // NSUInteger pac [persistent_apps count]
	 var pac = NSUINTEGER(persistent_apps.length);
	 // NSMutableArray* app_paths = [NSMutableArray arrayWithCapacity:pac];
	 var NSMutableArray = _objc_getClass('NSMutableArray');
	 var arrayWithCapacity = _sel_registerName('arrayWithCapacity:');
	 var app_paths = objc_msgSend(NSMutableArray, arrayWithCapacity, pac);
	console.info('app_paths:', app_paths, app_paths.toString(), uneval(app_paths), app_paths.isNull());
	
	// for (NSDictionary* app in persistent_apps) {
	for (var i=0; i<persistent_apps.length; i++) {
		var app = persistent_apps[i];
		
		// Bool app_class_is_nsd [app isKindOfClass:[NSDictionary class]]
		 // Class nsd_class [NSDictionary class]
		 var nsd_class = _isKindOfClassHelper('NSDictionary');
		 // Bool app_class_is_nsd [app isKindOfClass:nsd_class]
		 var isKindOfClass = _sel_registerName('isKindOfClass:');
		 var app_class_is_nsd = objc_msgSend(app, isKindOfClass, nsd_class);
		console.info('app_class_is_nsd:', app_class_is_nsd, app_class_is_nsd.toString(), uneval(app_class_is_nsd), app_class_is_nsd.isNull());

		if (app_class_is_nsd.contents == 0) {
			throw 'app not NSDictionary';
		}
		
		var kDockTileDataKey = _NSString('tile-data');
		
		// NSDictionary* tile_data = [app objectForKey:kDockTileDataKey];
		var objectForKey = _sel_registerName('objectForKey');
		var tile_data = objc_msgSend(app, objectForKey, kDockTileDataKey);
		console.info('tile_data:', tile_data, tile_data.toString(), uneval(tile_data), tile_data.isNull());
		
		// Bool td_class_is_nsd [tile_data isKindOfClass:[NSDictionary class]]
		var nsd_class = _isKindOfClassHelper('NSDictionary')
		var td_class_is_nsd = objc_msgSend(tile_data, isKindOfClass, nsd_class);
		
		if (td_class_is_nsd.contents == 0) {
			throw 'tile_data not NSDictionary';
		}
		
		var kDockFileDataKey = _NSString('file-data');
		
		// NSDictionary* file_data = [app objectForKey:kDockFileDataKey];
		var objectForKey = _sel_registerName('objectForKey');
		var file_data = objc_msgSend(app, objectForKey, kDockFileDataKey);
		console.info('file_data:', file_data, file_data.toString(), uneval(file_data), file_data.isNull());
		
		// Bool fd_class_is_nsd [file_data isKindOfClass:[NSDictionary class]]
		var nsd_class = _isKindOfClassHelper('NSDictionary')
		var fd_class_is_nsd = objc_msgSend(file_data, isKindOfClass, nsd_class);
		
		if (fd_class_is_nsd.contents == 0) {
			// Some apps (e.g. Dashboard) have no file data, but instead have a
			// special value for the tile-type key. For these, add an empty string to
			// align indexes with the source array.
			
			// [app_paths addObject:@""];
			var addObject = _sel_registerName('addObject:');
			var rez_addObject = objc_msgSend(app_paths, addObject, _NSString(''));
			console.info('rez_addObject:', rez_addObject, rez_addObject.toString(), uneval(rez_addObject), rez_addObject.isNull());
		}
		
		// NSURL* url = NSURLCreateFromDictionary(file_data);
		var url = NSURLCreateFromDictionary(file_data);
		if (url.isNull()) {
			throw 'no URL';
		}
		
		// Bool url_isfileurl [url isFileURL]
		var isFileURL = _sel_registerName('isFileURL');
		var url_isfileurl = objc_msgSend(url, isFileURL);
		console.info('url_isfileurl:', url_isfileurl, url_isfileurl.toString(), uneval(url_isfileurl), url_isfileurl.isNull());
		if (url_isfileurl.contenst == 0) {
			throw 'non-file URL';
		}
		
		// NSString* path = [url path];
		var path = _sel_registerName('path');
		var path_NSString = objc_msgSend(url, path);
		
		// [app_paths addObject:path];
		var addObject = _sel_registerName('addObject:');
		var rez_addObject = objc_msgSend(app_paths, addObject, path_NSString);
		console.info('rez_addObject:', rez_addObject, rez_addObject.toString(), uneval(rez_addObject), rez_addObject.isNull());
	}
	
	return app_paths;
}





// NSApp = [NSApplication sharedApplication];
var NSApplication = objc_getClass('NSApplication');
var sharedApplication = sel_registerName('sharedApplication');
var NSApp = objc_msgSend(NSApplication, sharedApplication);

// [NSApp isHidden]
var isHidden = sel_registerName('isHidden');
var objc_msgSend_returnBool = objc.declare('objc_msgSend', ctypes.default_abi, BOOL, id, SEL, '...'); //this is return value because `isHidden` returns a BOOL per the docs
var rez_isHidden = objc_msgSend_returnBool(NSApp, isHidden);
console.info('rez_isHidden:', rez_isHidden, rez_isHidden.toString(), uneval(rez_isHidden));

if (rez_isHidden == 0) {
	console.log('Firefox is HIDDEN!');
} else if (rez_isHidden == 1) {
	console.log('Firefox is showing.');
} else {
	console.warn('rez_isHidden was not 0 or 1, this should never happen, if it did, objc should error and crash the browser');
}






// [__NSString release]
for (var p in __NSString) {
	objc_msgSend(__NSString[p], release);
}

// [autorelease_pool release]
objc_msgSend(autorelease_pool, release);

objc.close();