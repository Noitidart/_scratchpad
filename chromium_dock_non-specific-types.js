Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));
var libcf = ctypes.open('/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation');

// CoreFoundation Types
var TYPES = {
	CFURLRef: ctypes.voidptr_t,
	CFPropertyListRef: ctypes.voidptr_t,
	CFAllocatorRef: ctypes.voidptr_t,
	CFPropertyListRef: ctypes.voidptr_t
}

// CoreFoundation Declares
var _CFURLCopyPropertyListRepresentation = libcf.declare('_CFURLCopyPropertyListRepresentation', ctypes.default_abi, TYPES.CFPropertyListRef, TYPES.CFURLRef);
var _CFURLCreateFromPropertyListRepresentation = libcf.declare('_CFURLCopyPropertyListRepresentation', ctypes.default_abi, TYPES.CFURLRef, TYPES.CFAllocatorRef, TYPES.CFPropertyListRef);

// types
var ID = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var BOOL = ctypes.signed_char;
var CHAR = ctypes.char;
if (bit64) {
	var NSUInteger = ctypes.unsigned_long;
} else {
	var NSUInteger = ctypes.unsigned_int;
}

// constants
var bit64 = (ctypes.voidptr_t.size == 8);
var NIL = ctypes.voidptr_t(ctypes.UInt64('0x0'));
var NO = ctypes.voidptr_t(ctypes.UInt64('0x0'));
var YES = ctypes.voidptr_t(ctypes.UInt64('0x1'))
if (bit64) {
	var NSIntegerMax = ctypes.Int64('0x7FFFFFFFFFFFFFFF'); /*toString: 9223372036854775807 /*python: 2 ** 63 -1) */
	var NSIntegerMin = ctypes.Int64('-9223372036854775808'); /*python: -(2 ** 63)) */
	var NSUIntegerMax = ctypes.UInt64('0xffffffffffffffff'); /*toString: 18446744073709551615*/ /*python: 2**64-1) */
} else {
	var NSIntegerMax = Math.pow(2, 31) - 1; /*python: 2 ** 31 -1) */
	var NSIntegerMin = Math.pow(2, 31) * -1; /*python: -(2 ** 31)) */
	var NSUIntegerMax = Math.pow(2, 32) - 1; /*python: 2**32-1) */
}
var NSNotFound = NSIntegerMax; // NSNotFound is different on 32 bit vs 64 bit platforms, so don't hardcode or store that value anywhere. // http://stackoverflow.com/questions/6360574/nsnotfound-nsinteger-nsuinteger-and-nsrange-location

//common functions
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, ID, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, ID, ID, SEL, '...');

//common selectors
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

// start helper functions
var __sel_registerName = {};
function _sel_registerName(jsStr) {
	if (!(jsStr in __sel_registerName)) {
		__sel_registerName[jsStr] = sel_registerName(jsStr);
		console.info('__sel_registerName ::', jsStr + ':', __sel_registerName[jsStr], __sel_registerName[jsStr].toString(), uneval(__sel_registerName[jsStr]), __sel_registerName[jsStr].isNull());
	}
	return __sel_registerName[jsStr];
}

var __objc_getClass = {};
function _objc_getClass(jsStr) {
	if (!(jsStr in __objc_getClass)) {
		__objc_getClass[jsStr] = objc_getClass(jsStr);
		console.info('__objc_getClass ::', jsStr + ':', __objc_getClass[jsStr], __objc_getClass[jsStr].toString(), uneval(__objc_getClass[jsStr]), __objc_getClass[jsStr].isNull());
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
var autorelease_pool;

function AddIcon(installed_path /* NSString* */, dmg_app_path /* NSString* */) {

	// autorelease_pool = [[NSAutoreleasePool alloc] init]
	var NSAutoreleasePool = _objc_getClass('NSAutoreleasePool');
	autorelease_pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);
	
	// NSUserDefaults* user_defaults = [NSUserDefaults standardUserDefaults];
	var NSUserDefaults = _objc_getClass('NSUserDefaults');
	var standardUserDefaults = _sel_registerName('standardUserDefaults');
	var user_defaults = objc_msgSend(NSUserDefaults, standardUserDefaults);
	console.info('user_defaults:', user_defaults, user_defaults.toString(), uneval(user_defaults), user_defaults.isNull());
	
	// NSString* const kDockDomain = @"com.apple.dock";
	var kDockDomain = _NSString('com.apple.dock');
	
	// NSDictionary* dock_plist_const = [user_defaults persistentDomainForName:kDockDomain];
	var persistentDomainForName = _sel_registerName('persistentDomainForName:');
	var dock_plist_const = objc_msgSend(user_defaults, persistentDomainForName, kDockDomain);
	console.info('dock_plist_const:', dock_plist_const, dock_plist_const.toString(), uneval(dock_plist_const), dock_plist_const.isNull());
	
	// Bool dpc_class_is_nsd [dock_plist_const isKindOfClass:[NSDictionary class]]
	 // Class nsd_class [NSDictionary class]
	 var nsd_class = _isKindOfClassHelper('NSDictionary');
	 // Bool dpc_class_is_nsd [dock_plist_const isKindOfClass:nsd_class]
	 var isKindOfClass = _sel_registerName('isKindOfClass:');
	 var dpc_class_is_nsd = objc_msgSend(dock_plist_const, isKindOfClass, nsd_class);
	console.info('dpc_class_is_nsd:', dpc_class_is_nsd, dpc_class_is_nsd.toString(), uneval(dpc_class_is_nsd), dpc_class_is_nsd.isNull());

	if (dpc_class_is_nsd.toString() == NO.toString()) {
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
	var objectForKey = _sel_registerName('objectForKey:');
	var persistent_apps_const = objc_msgSend(dock_plist, objectForKey, kDockPersistentAppsKey);
	console.info('persistent_apps_const:', persistent_apps_const, persistent_apps_const.toString(), uneval(persistent_apps_const), persistent_apps_const.isNull());

	// Bool pac_class_is_nsa [persistent_apps_const isKindOfClass:[NSArray class]]
	 // [NSArray class]
	 var nsa_class = _isKindOfClassHelper('NSArray');
	 // Bool pac_class_is_nsa [persistent_apps_const isKindOfClass:nsa_class]
	 var pac_class_is_nsa = objc_msgSend(persistent_apps_const, isKindOfClass, nsa_class);
	console.info('pac_class_is_nsa:', pac_class_is_nsa, pac_class_is_nsa.toString(), uneval(pac_class_is_nsa), pac_class_is_nsa.isNull());

	if (pac_class_is_nsa.toString() == NO.toString()) {
		throw 'IconAddFailure :: persistent_apps_const not NSArray';
	}

	// NSMutableArray* persistent_apps = [NSMutableArray arrayWithArray:persistent_apps_const];
	var NSMutableArray = _objc_getClass('NSMutableArray');
	var arrayWithArray = _sel_registerName('arrayWithArray:');
	var persistent_apps = objc_msgSend(NSMutableArray, arrayWithArray, persistent_apps_const);
	console.info('persistent_apps:', persistent_apps, persistent_apps.toString(), uneval(persistent_apps), persistent_apps.isNull());

	// NSMutableArray* persistent_app_paths = PersistentAppPaths(persistent_apps);
	var persistent_app_paths = PersistentAppPaths(persistent_apps);
return; //debug	
	if (persistent_app_paths.isNull()) {
		throw 'IconAddFailure';
	}
	
	//NSUInteger already_installed_app_index = NSNotFound;
	var already_installed_app_index = NSNotFound;
	
	//NSUInteger app_index = NSNotFound;
	var app_index = NSNotFound
}

function PersistentAppPaths(persistent_apps /* NSArray* */) {
	// Returns an array parallel to |persistent_apps| containing only the
	// pathnames of the Dock tiles contained therein. Returns nil on failure, such
	// as when the structure of |persistent_apps| is not understood.
	
	// returns NSMutableArray*
	
	// NSMutableArray* app_paths = [NSMutableArray arrayWithCapacity:[persistent_apps count]];
	 // NSUInteger pac [persistent_apps count]
	 var count = _sel_registerName('count');
	 var objc_msgSend_NSUInteger = objc.declare('objc_msgSend', ctypes.default_abi, NSUInteger, ID, SEL, '...');
	 var pac = objc_msgSend_NSUInteger(persistent_apps, count);
	 console.info('pac:', pac, pac.toString(), uneval(pac), parseInt(pac)); // this is number of "kept in dock" items
	 // NSMutableArray* app_paths = [NSMutableArray arrayWithCapacity:pac];
	 var NSMutableArray = _objc_getClass('NSMutableArray');
	 var arrayWithCapacity = _sel_registerName('arrayWithCapacity:');
	 var app_paths = objc_msgSend(NSMutableArray, arrayWithCapacity, ctypes.voidptr_t(pac)); //have to voidptr_t pac as objc_msgSend is declared to take ID which voidptr_t
	console.info('app_paths:', app_paths, app_paths.toString(), uneval(app_paths), app_paths.isNull());
	
	// for (NSDictionary* app in persistent_apps) {
	for (var i=0; i<parseInt(pac); i++) {
		// NSDictionary* app = [persistent_apps objectAtIndex: [NSUInteger i]] // can use objectAtIndexo n persistent_apps even though its a NSMutableArray because NSMutalbleArray inherites from NSArray (per docs) and NSArray has the objectAtIndex: function
		var iCasted = ctypes.cast(NSUInteger(i), ctypes.voidptr_t); //`ctypes.voidptr_t(NSUInteger(i));` wouldn't work it would say "expected type pointer got ctyeps.usnigned_long(ctypes.UInt64(0))" where 0 was the value of i
		var objectAtIndex = _sel_registerName('objectAtIndex:');
		var app = objc_msgSend(persistent_apps, objectAtIndex, iCasted);
		console.info('app:', app, app.toString(), uneval(app), app.isNull());
		
		// Bool app_class_is_nsd [app isKindOfClass:[NSDictionary class]]
		 // Class nsd_class [NSDictionary class]
		 var nsd_class = _isKindOfClassHelper('NSDictionary');
		 // Bool app_class_is_nsd [app isKindOfClass:nsd_class]
		 var isKindOfClass = _sel_registerName('isKindOfClass:');
		 var app_class_is_nsd = objc_msgSend(app, isKindOfClass, nsd_class);
		console.info('app_class_is_nsd:', app_class_is_nsd, app_class_is_nsd.toString(), uneval(app_class_is_nsd), app_class_is_nsd.isNull());

		if (app_class_is_nsd.toString() == NO.toString()) {
			throw 'app not NSDictionary';
		}
		
		var kDockTileDataKey = _NSString('tile-data');
		
		// NSDictionary* tile_data = [app objectForKey:kDockTileDataKey];
		var objectForKey = _sel_registerName('objectForKey:');
		var tile_data = objc_msgSend(app, objectForKey, kDockTileDataKey);
		console.info('tile_data:', tile_data, tile_data.toString(), uneval(tile_data), tile_data.isNull());
		
		// Bool td_class_is_nsd [tile_data isKindOfClass:[NSDictionary class]]
		var nsd_class = _isKindOfClassHelper('NSDictionary')
		var td_class_is_nsd = objc_msgSend(tile_data, isKindOfClass, nsd_class);
		console.info('td_class_is_nsd:', td_class_is_nsd, td_class_is_nsd.toString(), uneval(td_class_is_nsd), td_class_is_nsd.isNull());
		
		if (td_class_is_nsd.toString() == NO.toString()) {
			throw 'tile_data not NSDictionary';
		}
		
		var kDockFileDataKey = _NSString('file-data');
		
		// NSDictionary* file_data = [app objectForKey:kDockFileDataKey];
		var objectForKey = _sel_registerName('objectForKey:');
		var file_data = objc_msgSend(app, objectForKey, kDockFileDataKey);
		console.info('file_data:', file_data, file_data.toString(), uneval(file_data), file_data.isNull());
		
		// Bool fd_class_is_nsd [file_data isKindOfClass:[NSDictionary class]]
		var nsd_class = _isKindOfClassHelper('NSDictionary')
		var fd_class_is_nsd = objc_msgSend(file_data, isKindOfClass, nsd_class);
		console.info('fd_class_is_nsd:', fd_class_is_nsd, fd_class_is_nsd.toString(), uneval(fd_class_is_nsd), fd_class_is_nsd.isNull());
		
		if (fd_class_is_nsd.toString() == NO.toString()) {
			// Some apps (e.g. Dashboard) have no file data, but instead have a
			// special value for the tile-type key. For these, add an empty string to
			// align indexes with the source array.
			
			// start - just me doing checking - comment says tile-type should be some specail value i want to see that
			var kDockTileTypeKey = _NSString('tile-type');
			var objectForKey = _sel_registerName('objectForKey:');
			var tile_type = objc_msgSend(app, objectForKey, kDockTileTypeKey);
			console.info('tile_type:', tile_type, tile_type.toString(), uneval(tile_type), tile_type.isNull());
			// im guessing tile_type is NSString, lets test it
			var nss_class = _isKindOfClassHelper('NSString')
			var tt_class_is_nss = objc_msgSend(tile_type, isKindOfClass, nss_class);
			console.info('tt_class_is_nss:', tt_class_is_nss, tt_class_is_nss.toString(), uneval(tt_class_is_nss), tt_class_is_nss.isNull());
			// yes this verifies that it is NSString, lets try to read it
			var UTF8String = _sel_registerName('UTF8String');
			var tt_read = objc_msgSend(tile_type, UTF8String);
			console.info('tt_read:', tt_read, tt_read.toString(), uneval(tt_read), tt_read.isNull());
			var tt_read_casted = ctypes.cast(tt_read, ctypes.unsigned_char.ptr); //had to use ctypes.unsigned_char cuz when i used ctypes.char the contents was -96 (note teh negative), with ctypes.unsigned_char it was 128. althought doing readStr with negative contents worked, way weird. and sometimes using ctypes.char doesnt reutrn negative contents number, weird
			console.info('tt_read_casted:', tt_read_casted, tt_read_casted.toString(), uneval(tt_read_casted), tt_read_casted.isNull());
			var tt_read_jsStr = tt_read_casted.readString();
			console.info('tt_read_jsStr:', tt_read_jsStr, tt_read_jsStr.toString(), uneval(tt_read_jsStr)); // TypeError: tt_read_jsStr.isNull is not a function
			// tt_read_jsStr value i ahve seen are: "file-tile"
			// end - just me doing checking - comment says tile-type should be some specail value i want to see that

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
return; //debug
		// Bool url_isfileurl [url isFileURL]
		var isFileURL = _sel_registerName('isFileURL');
		var url_isfileurl = objc_msgSend(url, isFileURL);
		console.info('url_isfileurl:', url_isfileurl, url_isfileurl.toString(), uneval(url_isfileurl), url_isfileurl.isNull());
		if (url_isfileurl.toString() == NO.toString()) {
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

function NSURLCreateFromDictionary(dictionary /* NSDictionary* */) {
	// CFDictionaryRef dictionary_cf = base::mac:NSToCFCast(dictionary);
	var dictionary_cf = dictionary; // i'm guessing because i use ctypes.voidptr_t for everything, i dont have to NSToCFCast, i'm testing it out now
	
	// base::ScopedCFTypeRef<CFURLRef> url_cf( _CFURLCreateFromPropertyListRepresentation(NULL, dictionary_cf) );
	var aCFURLRef = _CFURLCreateFromPropertyListRepresentation(NIL, dictionary_cf);
	console.info('aCFURLRef:', aCFURLRef, aCFURLRef.toString(), uneval(aCFURLRef), aCFURLRef.isNull());
	var scopedCFURLRef = aCFURLRef; //url_cf(aCFURLRef); // i found here https://code.google.com/p/chromium/codesearch#chromium/src/chrome/common/mac/cfbundle_blocker.mm&ct=rc&cd=2&q=url_cf&sq=package:chromium&l=205&dr=C that `NSURL* url_ns = base::mac::CFToNSCast(url_cf);` so i'm guessing `url_cf` is just NSToCFCast and is CFURL* im guessing
	console.info('scopedCFURLRef:', scopedCFURLRef, scopedCFURLRef.toString(), uneval(scopedCFURLRef), scopedCFURLRef.isNull());
	
	// NSURL* url = base::mac::CFToNSCast(url_cf);
	var url = url_cf; //same guess here, because i use voidptr_t for everything i'm guessing no need to CFToNSCast
	console.info('url:', url, url.toString(), uneval(url), url.isNull());
	
	// if (!url) { return nil }
	if (url.isNull()) {
		return NIL;
	}
	// NSMakeCollectable(url_cf.release());
	//i cant find which library NSMakeCollectable is defined in
	// i dont have to `.release()` it looks like from here it's just clearing the variable, comment clearly states its not CFRelease: https://github.com/loopCM/chromium/blob/8db1d931e4e1609d7d8f021ecb4fd2db0b92cb87/base/mac/scoped_cftyperef.h#L95
	
	// return [url autorelease];
	var autorelease = _sel_registerName('autorelease');
	var url_ar = objc_msgSend(url, autorelease);
	console.info('url_ar:', url_ar, url_ar.toString(), uneval(url_ar), url_ar.isNull());
	reutrn url_ar;
}

function CFToNSCast(cf_val /* TypeCF##Ref */) {
	// returns TypeNS*
}

function NSToCFCast(ns_val /* TypeNS* */) {
	// returns TypeCF##Ref
	// https://code.google.com/p/chromium/codesearch#chromium/src/base/mac/foundation_util.h&ct=rc&cd=2&q=NSToCFCast&sq=package:chromium&l=192&dr=C
	// Convert toll-free bridged CFTypes to NSTypes and vice-versa. This does not
	// autorelease |cf_val|. This is useful for the case where there is a CFType in
	// a call that expects an NSType and the compiler is complaining about const
	// casting problems.
	// The calls are used like this:
	// NSString *foo = CFToNSCast(CFSTR("Hello"));
	// CFStringRef foo2 = NSToCFCast(@"Hello");
	// The macro magic below is to enforce safe casting. It could possibly have
	// been done using template function specialization, but template function
	// specialization doesn't always work intuitively,
	// (http://www.gotw.ca/publications/mill17.htm) so the trusty combination
	// of macros and function overloading is used instead.
}

try {
	AddIcon();
} catch (ex) {
	console.error('ex happend:', ex)
} finally {
	// [__NSString release]
	for (var p in __NSString) {
		objc_msgSend(__NSString[p], release);
	}

	// [autorelease_pool release]
	objc_msgSend(autorelease_pool, release);

	objc.close();
	libcf.close();
}