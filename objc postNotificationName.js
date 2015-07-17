Cu.import('resource://gre/modules/ctypes.jsm');

var objc = ctypes.open(ctypes.libraryName('objc'));

// BASIC TYPES
var BOOL = ctypes.signed_char;
var CHAR = ctypes.char;
var ID = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var VOID = ctypes.void_t;

// CONSTANTS
var NIL_ID = ctypes.cast(ctypes.uint64_t(0x0), ID);
var YES = BOOL(1);
var NO = BOOL(0);

// COMMON FUNCTIONS
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, ID, CHAR.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, ID, ID, SEL, '...');
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, CHAR.ptr);

// COMMON SELECTORS
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

var shutdown = function() {
	if (NSString_myNoti) {
		console.log('releasing NSString_myNoti');
		objc_msgSend(NSString_myNoti, release);
	}
	objc.close();
	
	console.log('succesfully shutdown');
}

// my globals:
var NSString_myNoti;

function main() {
		
	// default_center = [NSDistributedNotificationCenter defaultCenter];
	var NSDistributedNotificationCenter = objc_getClass('NSDistributedNotificationCenter');
	var defaultCenter = sel_registerName('defaultCenter');
	var default_center = objc_msgSend(NSDistributedNotificationCenter, defaultCenter);
	console.info('default_center:', default_center, default_center.toString(), uneval(default_center), default_center.isNull());
	
	var NSString = objc_getClass('NSString');
	var initWithUTF8String = sel_registerName('initWithUTF8String:');
	NSString_myNoti = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, CHAR.array()('myNoti'));
	console.info('NSString_myNoti:', NSString_myNoti, NSString_myNoti.toString(), uneval(NSString_myNoti));
	
	var NSDictionary = objc_getClass('NSDictionary');
	var dictionary = sel_registerName('dictionary');
	var tempDict = objc_msgSend(NSDictionary, dictionary); //gives us temporary dicationary, one that gets auto released? well whatever its something not allocated so we dont have to release it
	console.info('tempDict:', tempDict, tempDict.toString(), uneval(tempDict));
	
	// postNotificationName:object:userInfo:deliverImmediately:
	var postNotificationName = sel_registerName('postNotificationName:object:userInfo:deliverImmediately:')
	var rez_postNotificationName = objc_msgSend(default_center, postNotificationName, NIL_ID, tempDict, NO); // returns void
	//docs say rez_postNotificationName is VOID
}

try {
	main();
} catch (ex) {
	console.error('Error Occured:', ex);
} finally {
	shutdown();
}