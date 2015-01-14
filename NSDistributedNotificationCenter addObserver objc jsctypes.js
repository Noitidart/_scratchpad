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
var objc_class = new ctypes.StructType('objc_class');
var VOID = ctypes.voidptr_t;

// contstants
var nil = ctypes.voidptr_t(ctypes.UInt64('0x0'));

// common functions
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
var objc_disposeClassPair = objc.declare('objc_disposeClassPair', ctypes.default_abi, id, id);

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
var class_NoitidartsOnScreenSaverStartedDelegateClass = objc_allocateClassPair(NSObject, 'NoitidartsOnScreenSaverStartedDelegateClass', 0); //delegate is what callback is in js
if (class_NoitidartsOnScreenSaverStartedDelegateClass.isNull()) {
	console.info('class_NoitidartsOnScreenSaverStartedDelegateClass:', class_NoitidartsOnScreenSaverStartedDelegateClass, class_NoitidartsOnScreenSaverStartedDelegateClass.toString(), uneval(class_NoitidartsOnScreenSaverStartedDelegateClass));
	throw new Error('class_NoitidartsOnScreenSaverStartedDelegateClass is nil, so objc_allocateClassPair failed');
}

var class_addMethod = objc.declare('class_addMethod', ctypes.default_abi, BOOL, id, SEL, IMP, ctypes.char.ptr); // move this to functions section at top
//
var ftype_onScreenSaverStarted = ctypes.FunctionType(ctypes.default_abi, VOID, [id, SEL, id]);

function jsCallback_onScreenSaverStarted(c_arg1__self, c_arg2__sel, objc_arg1__NSNotificationP44tr) {
	console.log('TRIGGERD: onScreenSaverStarted');
}

var callback_onScreenSaverStarted = ftype_onScreenSaverStarted.ptr(jsCallback_onScreenSaverStarted);
//
var rez_class_addMethod = class_addMethod(class_NoitidartsOnScreenSaverStartedDelegateClass, notificationSelector_onScreenSaverStarted, callback_onScreenSaverStarted, 'v@:@'); // because return of callback is void, first argument is c_arg1__self which is `id` and c_arg2__id sel `SEL` and objc_arg1__NSNotificationPtr is `voidptr_t` // so per this page: https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100 // and this chat: https://gist.github.com/Noitidart/21b202611c62d74fecd0
console.info('rez_class_addMethod:', rez_class_addMethod, rez_class_addMethod.toString(), uneval(rez_class_addMethod));
if (rez_class_addMethod != 1) {
	throw new Error('rez_class_addMethod is not 1, so class_addMethod failed');
}

var objc_registerClassPair = objc.declare('objc_registerClassPair', ctypes.default_abi, VOID, id);
objc_registerClassPair(class_NoitidartsOnScreenSaverStartedDelegateClass);

var instance__class_NoitidartsOnScreenSaverStartedDelegateClass = objc_msgSend(objc_msgSend(class_NoitidartsOnScreenSaverStartedDelegateClass, alloc), init);

objc_msgSend(pool, release); //maybe do this instead on shutdown?
//end - onScreenSaverStarted

// [NSDistCent addObserver:selector:name:object: ***, ***, notificationName_****, nil] // copied block: `// [NSApp setApplicationIconImage: icon]`
var addObserver = sel_registerName('addObserver:selector:name:object:')
var rez_addObserver = objc_msgSend(NSDistCent, addObserver, instance__class_NoitidartsOnScreenSaverStartedDelegateClass, notificationSelector_onScreenSaverStarted, notificationName_onScreenSaverStarted, nil); // addObserver returns void so no need for `var rez_addObserver = `
console.info('rez_addObserver:', rez_addObserver, rez_addObserver.toString(), uneval(rez_addObserver), rez_addObserver.isNull());
// WEIRD: ASK ABOUT THIS: rez_addObserver is being returned as not null, its usually something like `ctypes.voidptr_t(ctypes.UInt64(0x30004))` docs say it should return void

function removeObsAndClose() {
	// [NSDistCent removeObserver:name:object: notificationName_****, nil] // copied block: `// [NSApp setApplicationIconImage: icon]`
	var removeObserver = sel_registerName('removeObserver:name:object:')
	var rez_removeObserver = objc_msgSend(NSDistCent, removeObserver, instance__class_NoitidartsOnScreenSaverStartedDelegateClass, notificationName_onScreenSaverStarted, nil);
	console.info('rez_removeObserver:', rez_removeObserver, rez_removeObserver.toString(), uneval(rez_removeObserver), rez_removeObserver.isNull());
	// verified: rez_removeObserver is void, it is returned as `ctypes.voidptr_t(ctypes.UInt64('0x0'))`
	
	var rez_objc_disposeClassPair = objc_disposeClassPair(class_NoitidartsOnScreenSaverStartedDelegateClass);
	console.info('rez_objc_disposeClassPair:', rez_objc_disposeClassPair, rez_objc_disposeClassPair.toString(), uneval(rez_objc_disposeClassPair), rez_objc_disposeClassPair.isNull());
	
	// [notificationName_**** release]
	objc_msgSend(notificationName_onScreenSaverStarted, release);

	objc.close();
}