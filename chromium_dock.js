Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
var jsStrPath = '/Users/noi/Desktop/default profile.app';
/** END - edit these **/

// BASIC TYPES
var BOOL = ctypes.signed_char;
var CHAR = ctypes.char;
var ID = ctypes.voidptr_t;
var IMP = ctypes.voidptr_t;
var NSDICTIONARY = new ctypes.StructType('NSDictionary');
var NSMUTABLEARRAY = new ctypes.StructType('NSMutableArray');
var NSMUTABLEDICTIONARY = new ctypes.StructType('NSMutableDictionary');
var NSNOTIFICATION = new ctypes.StructType('NSNotification');
var NSUSERDEFAULTS = new ctypes.StructType('NSUserDefaults');
var OBJC_CLASS = new ctypes.StructType('objc_class');
var OBJC_SELECTOR = new ctypes.StructType('objc_selector');
var SIZE_T = ctypes.size_t;
var VOID = ctypes.voidptr_t;

// ADVANCDED TYPES (based on predefined types "basic")
var CLASS = OBJC_CLASS.ptr;
var SEL = OBJC_SELECTOR.ptr;

// CONSTANTS
var NIL = ctypes.voidptr_t(ctypes.UInt64('0x0'));

// FUNCTIONS
/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 * BOOL class_addMethod (
 *   Class cls,
 *   SEL name,
 *   IMP imp,
 *   const char *types
 * ); 
 */
var class_addMethod = objc.declare('class_addMethod', ctypes.default_abi,
	BOOL,		// return
	CLASS,		// cls
	SEL,		// name
	IMP,		// imp
	CHAR.ptr	// *types
);

/* https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/c/func/objc_getClass
 *  Class objc_allocateClassPair (
 *   Class superclass,
 *   const char *name,
 *   size_t extraBytes
 * );
 */
var objc_allocateClassPair = objc.declare('objc_allocateClassPair', ctypes.default_abi,
	CLASS,		// return
	CLASS,		// superclass
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
	ID,		// return
	ID,		// self
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

// NSAutoPool = [[NSAutoreleasePool alloc] init]
var NSAutoreleasePool = objc_getClass('NSAutoreleasePool');
var pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);

// NSString* kDockDomain = [[NSString alloc] initWithUTF8String: 'com.apple.dock'];
var NSString = objc_getClass('NSString');
var initWithUTF8String = sel_registerName('initWithUTF8String:');
var kDockDomain = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, CHAR.array()('com.apple.dock'));
console.info('kDockDomain:', kDockDomain, kDockDomain.toString(), uneval(kDockDomain), kDockDomain.isNull());

// NSUserDefaults* user_defaults = [NSUserDefaults standardUserDefaults];
var NSUserDefaults = objc_getClass('NSUserDefaults');
var standardUserDefaults = sel_registerName('standardUserDefaults');
var objc_msgSend_returnNSUserDefaults = objc.declare('objc_msgSend', ctypes.default_abi, NSUSERDEFAULTS, id, SEL, '...');
var user_defaults = objc_msgSend_returnNSUserDefaults(NSUserDefaults, standardUserDefaults);
console.info('user_defaults:', user_defaults, user_defaults.toString(), uneval(user_defaults), user_defaults.isNull());

//NSDictionary* dock_plist_const = [user_defaults persistentDomainForName:kDockDomain];
var persistentDomainForName = sel_registerName('persistentDomainForName:');
var objc_msgSend_returnNSDictionary = objc.declare('objc_msgSend', ctypes.default_abi, NSDICTIONARY, id, SEL, '...');
var dock_plist_const = objc_msgSend_returnNSDictionary(user_defaults, persistentDomainForName, kDockDomain);
console.info('dock_plist_const:', dock_plist_const, dock_plist_const.toString(), uneval(dock_plist_const), dock_plist_const.isNull());

//[dock_plist_const isKindOfClass:[NSDictionary class]]
//NSArray* kindOfClass [persistent_apps_const isKindOfClass:[NSArray class]]
var NSDictionary = objc_getClass('NSDictionary');
var sel_class = sel_registerName('class'); //cant use `class` cuz that's reserved
var nsd_class = objc_msgSend(NSDictionary, sel_class);


var nsd_class = objc_msgSend_returnNSDictionary(dock_plist_const, isKindOfClass, sel_class);
var isKindOfClass = sel_registerName('isKindOfClass:');
var kindOfClass = objc_msgSend_returnNSDictionary(dock_plist_const, isKindOfClass, nsd_class);
console.info('kindOfClass:', kindOfClass, kindOfClass.toString(), uneval(kindOfClass), kindOfClass.isNull());

if (kindOfClass.isNull()) {
	throw 'IconAddFailure :: dock_plist_const not NSDictionary';
}

// NSMutableDictionary* dock_plist = [NSMutableDictionary dictionaryWithDictionary:dock_plist_const];
var NSMutableDictionary = objc_getClass('NSMutableDictionary');
var arrayWithArray = sel_registerName('arrayWithArray:');
var dictionaryWithDictionary = sel_registerName('dictionaryWithDictionary:');
var objc_msgSend_returnNSMutableDictionary = objc.declare('objc_msgSend', ctypes.default_abi, NSMUTABLEDICTIONARY, id, SEL, '...');
var dock_plist = objc_msgSend_returnNSMutableDictionary(NSMutableArray, dictionaryWithDictionary, dock_plist_const);
console.info('dock_plist:', dock_plist, dock_plist.toString(), uneval(dock_plist), dock_plist.isNull());

178   if (![persistent_apps_const isKindOfClass:[NSArray class]]) {
179     LOG(ERROR) << "persistent_apps_const not NSArray";
180     return IconAddFailure;
181   }

//[dock_plist_const isKindOfClass:[NSDictionary class]]
//NSArray* kindOfClass [persistent_apps_const isKindOfClass:[NSArray class]]
var NSArray = objc_getClass('NSArray');
var kDockDomain = objc_msgSend(NSArray, sel_class);

var nsa_class = objc_msgSend_returnNSDictionary(persistent_apps_const, isKindOfClass, sel_class);
var isKindOfClass = sel_registerName('isKindOfClass:');
var kindOfClass = objc_msgSend_returnNSDictionary(persistent_apps_const, isKindOfClass, nsd_class);
console.info('kindOfClass:', kindOfClass, kindOfClass.toString(), uneval(kindOfClass), kindOfClass.isNull());

if (kindOfClass.isNull()) {
	throw 'IconAddFailure :: persistent_apps_const not NSDictionary';
}

//create notificationObserver's
var notificationSelector_onScreenSaverStarted = sel_registerName('onScreenSaverStarted:'); // because of description here: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Miscellaneous/Foundation_Functions/index.html#//apple_ref/c/func/NSSelectorFromString  and because this is how js-macosx demo sets selector here: https://github.com/Noitidart/js-macosx/blob/notificationCenter/bootstrap.js#L91
var notificationName_onScreenSaverStarted = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, CHAR.array()('com.apple.screensaver.didstart'));
console.info('notificationName_onScreenSaverStarted:', notificationName_onScreenSaverStarted, notificationName_onScreenSaverStarted.toString(), uneval(notificationName_onScreenSaverStarted), notificationName_onScreenSaverStarted.isNull());

var NSObject = objc_getClass('NSObject');
var class_NoitidartsOnScreenSaverStartedDelegateClass = objc_allocateClassPair(NSObject, 'NoitidartsOnScreenSaverStartedDelegateClass', 0); //delegate is what callback is in js
console.info('class_NoitidartsOnScreenSaverStartedDelegateClass:', class_NoitidartsOnScreenSaverStartedDelegateClass, class_NoitidartsOnScreenSaverStartedDelegateClass.toString(), uneval(class_NoitidartsOnScreenSaverStartedDelegateClass), class_NoitidartsOnScreenSaverStartedDelegateClass.isNull());
if (class_NoitidartsOnScreenSaverStartedDelegateClass.isNull()) {
	console.info('class_NoitidartsOnScreenSaverStartedDelegateClass:', class_NoitidartsOnScreenSaverStartedDelegateClass, class_NoitidartsOnScreenSaverStartedDelegateClass.toString(), uneval(class_NoitidartsOnScreenSaverStartedDelegateClass));
	throw new Error('class_NoitidartsOnScreenSaverStartedDelegateClass is NIL, so objc_allocateClassPair failed');
}
//
var ftype_onScreenSaverStarted = ctypes.FunctionType(ctypes.default_abi, VOID, [ID, SEL, NSNOTIFICATION.ptr]);

function jsCallback_onScreenSaverStarted(c_arg1__self, c_arg2__sel, objc_arg1__NSNotificationPtr) {
	console.log('TRIGGERD: onScreenSaverStarted');
	return NIL; // because i defined the as I'm going to return `VOID` so i must make my javascript callback return what i set it would `var ftype_onScreenSaverStarted = ctypes.FunctionType(ctypes.default_abi, VOID, [id, SEL, id]);`. // otherwise it throws two errors: FIRST: /* TypeError: expected type pointer, got (void 0)*/ SECOND: /*Error: JavaScript callback failed, and an error sentinel was not specified.*/
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
console.info('instance__class_NoitidartsOnScreenSaverStartedDelegateClass:', instance__class_NoitidartsOnScreenSaverStartedDelegateClass, instance__class_NoitidartsOnScreenSaverStartedDelegateClass.toString(), uneval(instance__class_NoitidartsOnScreenSaverStartedDelegateClass), instance__class_NoitidartsOnScreenSaverStartedDelegateClass.isNull());
/*
objc_msgSend(pool, release); //maybe do this instead on shutdown?
*/
//end - onScreenSaverStarted

// [NSDistCent addObserver:selector:name:object: ***, ***, notificationName_****, NIL]
var addObserver = sel_registerName('addObserver:selector:name:object:')
var rez_addObserver = objc_msgSend(NSDistCent, addObserver, instance__class_NoitidartsOnScreenSaverStartedDelegateClass, notificationSelector_onScreenSaverStarted, notificationName_onScreenSaverStarted, NIL); // addObserver returns void so no need for `var rez_addObserver = `
console.info('rez_addObserver:', rez_addObserver, rez_addObserver.toString(), uneval(rez_addObserver), rez_addObserver.isNull());
// WEIRD: ASK ABOUT THIS: rez_addObserver is being returned as not null, its usually something like `ctypes.voidptr_t(ctypes.UInt64(0x30004))` docs say it should return void
// verified: if run addObserver twice, it returns the same thing, it really adds two observers, the return value is same in both situations, doing a single removeObserver removes both

// [NSDistCent removeObserver:name:object: notificationName_****, NIL]
var removeObserver = sel_registerName('removeObserver:name:object:')
var rez_removeObserver = objc_msgSend(NSDistCent, removeObserver, instance__class_NoitidartsOnScreenSaverStartedDelegateClass, notificationName_onScreenSaverStarted, NIL);
console.info('rez_removeObserver:', rez_removeObserver, rez_removeObserver.toString(), uneval(rez_removeObserver), rez_removeObserver.isNull());
// verified: rez_removeObserver is void, it is returned as `ctypes.voidptr_t(ctypes.UInt64('0x0'))`
// verified if i remove twice then rez_removeObserver is not null
if (!rez_removeObserver.isNull()) {
	console.error('WARNING: removeObserver failed as rez_removeObserver was NOT null:', 'rez_removeObserver:', rez_removeObserver, rez_removeObserver.toString());
}
var rez_objc_disposeClassPair = objc_disposeClassPair(class_NoitidartsOnScreenSaverStartedDelegateClass);
console.info('rez_objc_disposeClassPair:', rez_objc_disposeClassPair, rez_objc_disposeClassPair.toString(), uneval(rez_objc_disposeClassPair), rez_objc_disposeClassPair.isNull());

// [kDockDomain release]
objc_msgSend(kDockDomain, release);

// [instance__class_NoitidartsOnScreenSaverStartedDelegateClass release]
objc_msgSend(instance__class_NoitidartsOnScreenSaverStartedDelegateClass, release);

objc.close();