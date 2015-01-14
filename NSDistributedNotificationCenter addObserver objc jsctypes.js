Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
var jsStrPath = '/Users/noi/Desktop/default profile.app';
/** END - edit these **/

// types
var id = ctypes.voidptr_t;
var objc_selector = new ctypes.StructType('objc_selector');
var SEL = objc_selector.ptr;
var BOOL = ctypes.signed_char;
var IMP = ctypes.voidptr_t;

// contstants
var nil = ctypes.voidptr_t(0);

// common functions
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');

// common selectors
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

// notificationName_**** = [[NSString alloc] initWithUTF8String: 'com.apple.****']; //copied block: `// pool = [[NSAutoreleasePool alloc] init]`
var NSString = objc_getClass('NSString');
var initWithUTF8String = sel_registerName('initWithUTF8String:');
//var notificationName_SSStopped = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()('com.apple.screensaver.didstop'));
//var notificationName_SLocked = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()('com.apple.screenIsLocked'));
//var notificationName_SUnlocked = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()('com.apple.screenIsUnlocked'));

// NSDistCent = [NSDistributedNotificationCenter defaultCenter];
var NSDistributedNotificationCenter = objc_getClass('NSDistributedNotificationCenter');
var defaultCenter = sel_registerName('defaultCenter');
var NSDistCent = objc_msgSend(NSDistributedNotificationCenter, defaultCenter);

//create notificationObserver's
var notificationSelector_onScreenSaverStarted = sel_registerName('onScreenSaverStarted:'); // because of description here: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Miscellaneous/Foundation_Functions/index.html#//apple_ref/c/func/NSSelectorFromString  and because this is how js-macosx demo sets selector here: https://github.com/Noitidart/js-macosx/blob/notificationCenter/bootstrap.js#L91
var notificationName_onScreenSaverStarted = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()('com.apple.screensaver.didstart'));

// NSAutoPool = [[NSAutoreleasePool alloc] init]
var NSAutoreleasePool = objc_getClass('NSAutoreleasePool');
var pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);

var objc_allocateClassPair = objc.declare('objc_allocateClassPair', ctypes.default_abi, id, id, ctypes.char.ptr, ctypes.size_t);

var NSObject = objc_getClass('NSObject');
var delegate_onScreenSaverStarted = objc_allocateClassPair(NSObject, 'onScreenSaverStarted', 0);

var class_addMethod = objc.declare('class_addMethod', ctypes.default_abi, BOOL, id, SEL, IMP, ctypes.char.ptr); // move this to functions section at top
//
var ftype_onScreenSaverStarted = ctypes.FunctionType(ctypes.default_abi, ctypes.void_t, [])

function jsCallback_onScreenSaverStarted(self, sel) {
	console.log('TRIGGERD: onScreenSaverStarted');
}

var callback_onScreenSaverStarted = ftype_onScreenSaverStarted.ptr(jsCallback_onScreenSaverStarted);
//
var rez_class_addMethod = class_addMethod(delegate_onScreenSaverStarted, notificationSelector_onScreenSaverStarted, callback_onScreenSaverStarted, 'onScreenSaverStarted:');
console.info('rez_class_addMethod:', rez_class_addMethod, rez_class_addMethod.toString(), uneval(rez_class_addMethod));

var objc_registerClassPair = objc.declare('objc_registerClassPair', ctypes.default_abi, id, id);
objc_registerClassPair(delegate_onScreenSaverStarted);

var delegateInstance_onScreenSaverStarted = objc_msgSend(objc_msgSend(delegate_onScreenSaverStarted, alloc), init);

objc_msgSend(pool, release); //maybe do this instead on shutdown?
//end - onScreenSaverStarted

// [NSDistCent addObserver:selector:name:object: ***, ***, notificationName_****, nil] // copied block: `// [NSApp setApplicationIconImage: icon]`
var addObserver = sel_registerName('addObserver:selector:name:object:')
/*var rez_addObserver = */objc_msgSend(NSDistCent, addObserver, delegateInstance_onScreenSaverStarted, notificationSelector_onScreenSaverStarted, notificationName_onScreenSaverStarted, nil); // addObserver returns void so no need for `var rez_addObserver = `

function removeObsAndClose() {
	// [NSDistCent removeObserver:name:object: notificationName_****, nil] // copied block: `// [NSApp setApplicationIconImage: icon]`
	var removeObserver = sel_registerName('removeObserver:name:object:')
	/*var rez_removeObserver = */objc_msgSend(NSDistCent, removeObserver, delegateInstance_onScreenSaverStarted, notificationName_onScreenSaverStarted, nil);

	// [notificationName_**** release]
	objc_msgSend(notificationName_onScreenSaverStarted, release);

	objc.close();
|