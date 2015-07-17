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

	// current_application = [NSRunningApplication currentApplciation];
	var NSProcessInfo = objc_getClass('NSProcessInfo');
	var processInfo = sel_registerName('processInfo');
	var process_info = objc_msgSend(NSProcessInfo, processInfo);
	
	
	// bundle_identifier = [current_application bundleIdentifier]
	var arguments = sel_registerName('arguments');
	var args = objc_msgSend(process_info, arguments);
	console.info('args:', args, args.toString(), uneval(args));

	var count = sel_registerName('count');
	var objc_msgSend_NSUInteger = objc.declare('objc_msgSend', ctypes.default_abi, NSUINTEGER, ID, SEL, '...');
	var _count = objc_msgSend_NSUInteger(all_bundles, count);
	console.info('_count:', _count, _count.toString(), uneval(_count), parseInt(_count));
	_count = parseInt(_count); 
	
	var objectAtIndex = sel_registerName('objectAtIndex:'); // used in for loop
	var bundleIdentifier = sel_registerName('bundleURL'); // used in for loop
	var UTF8String = sel_registerName('UTF8String'); // used in for loop
	
	for (var i=0; i<_count; i++) {
		var arg = objc_msgSend(all_bundles, objectAtIndex, NSUINTEGER(i));
		console.info('arg:', arg, arg.toString(), uneval(arg));
		
		var tt_read = objc_msgSend(arg, UTF8String);
		var tt_read_casted = ctypes.cast(tt_read, CHAR.ptr);
		var tt_read_jsStr = tt_read_casted.readStringReplaceMalformed();
		console.error('tt_read_jsStr:', tt_read_jsStr, tt_read_jsStr.toString(), uneval(tt_read_jsStr));
	} 
}

try {
	main();
} catch(ex) {
	console.error('Exception Occoured:', ex);
} finally {
	shutdown();
}