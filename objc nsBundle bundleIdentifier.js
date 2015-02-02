Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

// BASIC TYPES
var CHAR = ctypes.char;
var ID = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var BOOL = ctypes.signed_char;
var NSUINTEGER = ctypes.unsigned_long;
var NSBUNDLE = ctypes.voidptr_t;

// COMMON FUNCTIONS
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, ID, CHAR.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, ID, ID, SEL, '...');
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, CHAR.ptr);

// COMMON SELECTORS
var release = sel_registerName('release');

// my personal globals for this code
var releaseThese = [];

function shutdown() {
	//put code here to unswizzle it
	for (var i=0; i<releaseThese.length; i++) {
		objc_msgSend(releaseThese[i], release);
	}
	objc.close();
};

function main() {
	// main_bundle = [NSBundle mainBundle];
	var NSBundle = objc_getClass('NSBundle');
	var mainBundle = sel_registerName('mainBundle');
	var main_bundle = objc_msgSend(NSBundle, mainBundle);
	console.info('main_bundle:', main_bundle, main_bundle.toString(), uneval(main_bundle));
	
	// bundle_identifier = [[NSBundle mainBundle] bundleIdentifier];
	var bundleIdentifier = sel_registerName('bundleIdentifier');
	var bundle_identifier = objc_msgSend(main_bundle, bundleIdentifier); // returns NSString
	
	// read bundle_identifier
	var UTF8String = sel_registerName('UTF8String');
	var tt_read = objc_msgSend(bundle_identifier, UTF8String);
	var tt_read_casted = ctypes.cast(tt_read, CHAR.ptr);
	var tt_read_jsStr = tt_read_casted.readStringReplaceMalformed();
	console.info('tt_read_jsStr:', tt_read_jsStr, tt_read_jsStr.toString(), uneval(tt_read_jsStr));
}

try {
	main();
} catch(ex) {
	console.error('Exception Occoured:', ex);
} finally {
	shutdown();
}