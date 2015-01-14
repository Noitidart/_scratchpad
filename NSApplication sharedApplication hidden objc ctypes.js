Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

// types
var id = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var BOOL = ctypes.signed_char;
var NSUInteger = ctypes.unsigned_long;

// constants
var nil = ctypes.voidptr_t(0);

//common functions
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');

//common selectors
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

//now using docs here: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NSApplication_Class/index.html#//apple_ref/occ/instp/NSApplication/hidden

// pool = [[NSAutoreleasePool alloc] init]
var NSAutoreleasePool = objc_getClass('NSAutoreleasePool');
var pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);

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

// [pool release]
objc_msgSend(pool, release);

objc.close();