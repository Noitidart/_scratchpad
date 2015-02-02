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
	// all_bundles = [NSBundle allBundles];
	var NSBundle = objc_getClass('NSBundle');
	var allBundles = sel_registerName('allBundles');
	var all_bundles = objc_msgSend(NSBundle, allBundles);
	console.info('all_bundles:', all_bundles, all_bundles.toString(), uneval(all_bundles));
	
	var count = _sel_registerName('count');
	var objc_msgSend_NSUInteger = objc.declare('objc_msgSend', ctypes.default_abi, NSUInteger, ID, SEL, '...');
	var _count = objc_msgSend_NSUInteger(all_bundles, count);
	console.info('_count:', _count, _count.toString(), uneval(_count), parseInt(_count));
	_count = parseInt(_count);
	
	var objectAtIndex = sel_registerName('objectAtIndex:'); // used in for loop
	var bundleIdentifier = sel_registerName('bundleIdentifier'); // used in for loop
	var UTF8String = sel_registerName('UTF8String');  // used in for loop
	for (var i=0; i<_count; i++) {
		var bundle = objc_msgSend(all_bundles, objectAtIndex, NSUINTEGER(i));
		console.info('bundle:', bundle, bundle.toString(), uneval(bundle));
		
		var bundle_identifier = objc_msgSend(bundle, bundleIdentifier); // returns NSString
		console.info('bundle_identifier:', bundle_identifier, bundle_identifier.toString(), uneval(bundle_identifier));
		
		var tt_read = objc_msgSend(bundle_identifier, UTF8String);
		var tt_read_casted = ctypes.cast(tt_read, CHAR.ptr);
		var tt_read_jsStr = tt_read_casted.readStringReplaceMalformed();
		console.info('tt_read_jsStr:', tt_read_jsStr, tt_read_jsStr.toString(), uneval(tt_read_jsStr));
	}
}

try {
	main();
} catch(ex) {
	console.error('Exception Occoured:', ex);
} finally {
	shutdown();
}