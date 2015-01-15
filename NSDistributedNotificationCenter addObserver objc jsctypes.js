Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
var jsStrPath = '/Users/noi/Desktop/default profile.app';
/** END - edit these **/

// TYPES
var BOOL = ctypes.signed_char;
var CHAR = ctypes.char;
var CLASS = OBJC_CLASS.ptr;
var ID = ctypes.voidptr_t;
var IMP = ctypes.voidptr_t;
var NSNOTIFICATION = new ctypes.StructType('NSNOTIFICATION');
var OBJC_CLASS = new ctypes.StructType('objc_class');
var OBJC_SELECTOR = new ctypes.StructType('objc_selector');
var SEL = OBJC_SELECTOR.ptr;
var SIZE_T = ctypes.size_t;
var VOID = ctypes.voidptr_t;

// CONSTANTS
var nil = ctypes.voidptr_t(ctypes.UInt64('0x0'));

// FUNCTIONS
/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 *  Class objc_allocateClassPair (
 *   Class superclass,
 *   const char *name,
 *   size_t extraBytes
 * ); 
 */
var objc_allocateClassPair = objc.declare('objc_allocateClassPair', ctypes.default_abi,
	CLASS,		// return
	Class,		// superclass
	CHAR.ptr,	// *name
	SIZE_T		// extraBytes
);

/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 * void objc_disposeClassPair (
 *   Class cls
 * ); 
 */
var objc_disposeClassPair = objc.declare('objc_disposeClassPair', ctypes.default_abi,
	VOID,	// return
	CLASS	// cls
);

/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 * Class objc_getClass (
 *   const char *name
 * ); 
 */
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi,
	CLASS,		// return
	CHAR.ptr	// *name
);

/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 * id objc_msgSend (
 *   id self,
 *   SEL op,
 *   ... 
 * ); 
 */
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi,
	id,		// return
	id,		// self
	SEL,	// op
	'...'	// variable arguments
);

/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 * void objc_registerClassPair (
 *   Class cls
 * ); 
 */
var objc_registerClassPair = objc.declare('objc_registerClassPair', ctypes.default_abi,
	VOID,	// return
	CLASS	// cls
);

/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 * SEL sel_registerName (
 *   const char *str
 * ); 
 */
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi,
	SEL,		// return
	CHAR.ptr	// *str
);

// COMMON SELECTORS
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

// notificationName_**** = [[NSString alloc] initWithUTF8String: 'com.apple.****'];
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
var notificationName_onScreenSaverStarted = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, char.array()('com.apple.screensaver.didstart'));

/*
// NSAutoPool = [[NSAutoreleasePool alloc] init]
var NSAutoreleasePool = objc_getClass('NSAutoreleasePool');
var pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);
*/

var NSObject = objc_getClass('NSObject');
var class_NoitidartsOnScreenSaverStartedDelegateClass = objc_allocateClassPair(NSObject, 'NoitidartsOnScreenSaverStartedDelegateClass', 0); //delegate is what callback is in js
if (class_NoitidartsOnScreenSaverStartedDelegateClass.isNull()) {
	console.info('class_NoitidartsOnScreenSaverStartedDelegateClass:', class_NoitidartsOnScreenSaverStartedDelegateClass, class_NoitidartsOnScreenSaverStartedDelegateClass.toString(), uneval(class_NoitidartsOnScreenSaverStartedDelegateClass));
	throw new Error('class_NoitidartsOnScreenSaverStartedDelegateClass is nil, so objc_allocateClassPair failed');
}
//
var ftype_onScreenSaverStarted = ctypes.FunctionType(ctypes.default_abi, VOID, [ID, SEL, ID]);

function jsCallback_onScreenSaverStarted(c_arg1__self, c_arg2__sel, objc_arg1__NSNotificationPtr) {
	console.log('TRIGGERD: onScreenSaverStarted');
	return nil; // because i defined the as I'm going to return `VOID` so i must make my javascript callback return what i set it would `var ftype_onScreenSaverStarted = ctypes.FunctionType(ctypes.default_abi, VOID, [id, SEL, id]);`. // otherwise it throws two errors: FIRST: /* TypeError: expected type pointer, got (void 0)*/ SECOND: /*Error: JavaScript callback failed, and an error sentinel was not specified.*/
}

var callback_onScreenSaverStarted = ftype_onScreenSaverStarted.ptr(jsCallback_onScreenSaverStarted);
//
var rez_class_addMethod = class_addMethod(class_NoitidartsOnScreenSaverStartedDelegateClass, notificationSelector_onScreenSaverStarted, callback_onScreenSaverStarted, 'v@:@'); // because return of callback is void, first argument is c_arg1__self which is `id` and c_arg2__id sel `SEL` and objc_arg1__NSNotificationPtr is `voidptr_t` // so per this page: https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100 // and this chat: https://gist.github.com/Noitidart/21b202611c62d74fecd0
console.info('rez_class_addMethod:', rez_class_addMethod, rez_class_addMethod.toString(), uneval(rez_class_addMethod));
if (rez_class_addMethod != 1) {
	throw new Error('rez_class_addMethod is not 1, so class_addMethod failed');
}

objc_registerClassPair(class_NoitidartsOnScreenSaverStartedDelegateClass);

var instance__class_NoitidartsOnScreenSaverStartedDelegateClass = objc_msgSend(objc_msgSend(class_NoitidartsOnScreenSaverStartedDelegateClass, alloc), init);
/*
objc_msgSend(pool, release); //maybe do this instead on shutdown?
*/
//end - onScreenSaverStarted

// [NSDistCent addObserver:selector:name:object: ***, ***, notificationName_****, nil]
var addObserver = sel_registerName('addObserver:selector:name:object:')
var rez_addObserver = objc_msgSend(NSDistCent, addObserver, instance__class_NoitidartsOnScreenSaverStartedDelegateClass, notificationSelector_onScreenSaverStarted, notificationName_onScreenSaverStarted, nil); // addObserver returns void so no need for `var rez_addObserver = `
console.info('rez_addObserver:', rez_addObserver, rez_addObserver.toString(), uneval(rez_addObserver), rez_addObserver.isNull());
// WEIRD: ASK ABOUT THIS: rez_addObserver is being returned as not null, its usually something like `ctypes.voidptr_t(ctypes.UInt64(0x30004))` docs say it should return void
// verified: if run addObserver twice, it returns the same thing, it really adds two observers, the return value is same in both situations, doing a single removeObserver removes both

function removeObsAndClose() {
	// [NSDistCent removeObserver:name:object: notificationName_****, nil]
	var removeObserver = sel_registerName('removeObserver:name:object:')
	var rez_removeObserver = objc_msgSend(NSDistCent, removeObserver, instance__class_NoitidartsOnScreenSaverStartedDelegateClass, notificationName_onScreenSaverStarted, nil);
	console.info('rez_removeObserver:', rez_removeObserver, rez_removeObserver.toString(), uneval(rez_removeObserver), rez_removeObserver.isNull());
	// verified: rez_removeObserver is void, it is returned as `ctypes.voidptr_t(ctypes.UInt64('0x0'))`
	// verified if i remove twice then rez_removeObserver is not null
	if (!rez_removeObserver.isNull()) {
		console.error('WARNING: removeObserver failed as rez_removeObserver was NOT null:', 'rez_removeObserver:', rez_removeObserver, rez_removeObserver.toString());
	}
	var rez_objc_disposeClassPair = objc_disposeClassPair(class_NoitidartsOnScreenSaverStartedDelegateClass);
	console.info('rez_objc_disposeClassPair:', rez_objc_disposeClassPair, rez_objc_disposeClassPair.toString(), uneval(rez_objc_disposeClassPair), rez_objc_disposeClassPair.isNull());
	
	// [notificationName_**** release]
	objc_msgSend(notificationName_onScreenSaverStarted, release);

	objc.close();
}