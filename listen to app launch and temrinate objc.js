Cu.import('resource://gre/modules/ctypes.jsm');

var objc = ctypes.open(ctypes.libraryName('objc'));

// BASIC TYPES
var BOOL = ctypes.signed_char;
var CHAR = ctypes.char;
var CLASS = ctypes.voidptr_t;
var ID = ctypes.voidptr_t;
var NSNOTIFICATIONPTR = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var SIZE_T = ctypes.size_t
var VOID = ctypes.void_t;

// ADVANCED TYPES
var IMP_for_notif_cb = ctypes.FunctionType(ctypes.default_abi, VOID, [ID, SEL, NSNOTIFICATIONPTR]).ptr; //repalced variadic with ID as its specific to my use otherwise doing class_addMethod throws error saying expected pointer blah blah //ctypes.FunctionType(ctypes.default_abi, ID, [ID, SEL, '...']).ptr;

// CONSTANTS
var NIL = ctypes.cast(ctypes.uint64_t(0x0), ctypes.voidptr_t);

// COMMON FUNCTIONS
var class_addMethod = objc.declare('class_addMethod', ctypes.default_abi, BOOL, CLASS, SEL, IMP_for_notif_cb, CHAR.ptr);
var objc_allocateClassPair = objc.declare('objc_allocateClassPair', ctypes.default_abi, CLASS, CLASS, CHAR.ptr, SIZE_T);
var objc_disposeClassPair = objc.declare('objc_disposeClassPair', ctypes.default_abi, VOID, CLASS);
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, ID, CHAR.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, ID, ID, SEL, '...');
var objc_registerClassPair = objc.declare('objc_registerClassPair', ctypes.default_abi, VOID, CLASS);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, CHAR.ptr);

// COMMON SELECTORS
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

// my personal globals for this code
var NoitNotifCB_imp; // important to make this global otherwise on callback trigger firefox will crash, because this got GC'ed before calback triggered
var releaseThese = [];
var shutdown = function() {
	for (var i=0; i<releaseThese.length; i++) {
		objc_msgSend(releaseThese[i], release);
	}
	
	objc.close();
	
	console.log('succesfully shutdown');
}

function main() {
	
	// the reason i create the class first is because it starts off by running objc_allocateClassPair, if that errors, then that means theres no need to continue and do teh other stuff, that will mess up the unloadings in shutdown() and it wont shutdown properly, this was evident because i ran this code again and it couldn't allocate even after i ran shutdown(). well actually shutdown() didnt shutdown properly on consequent run because i redefined `var shutdown` before running main so duh tahts what broke it. but i would still like to place this first because then i dont unnecessarily allocate an extra NSString etc.
	// start - create class and callback
	var NSObject = objc_getClass('NSObject');
	var NoitNotifCls_class = objc_allocateClassPair(NSObject, 'NoitNotifCls', 0);
	console.info('NoitNotifCls_class:', NoitNotifCls_class, NoitNotifCls_class.toString(), uneval(NoitNotifCls_class), NoitNotifCls_class.isNull());
	if (NoitNotifCls_class.isNull()) {
		throw new Error('NoitNotifCls_class is NIL, so objc_allocateClassPair failed. objc_registerClassPair likely already ran prior to this on NoitNoitfCls_class and objc_disposeOfClassPair was not yet run on NoitNoitfCls_class'); // this happens on consequent runs after `objc_registerClassPair` is run on `NoitNotifCls_class`
	}

	function NoitNotifCB_js(c_arg1__self, c_arg2__sel, objc_arg1_NSNOTIFICATIONPTR) {
		console.log('NoitNotifCB_js Triggered');
		return NIL;
	}
	
	NoitNotifCB_imp = IMP_for_notif_cb(NoitNotifCB_js);
	
	var NoitNotifCB_selector = sel_registerName('NoitNoitfCB_objc');
	var rez_class_addMethod = class_addMethod(NoitNotifCls_class, NoitNotifCB_selector, NoitNotifCB_imp, 'v@:@'); // because return of callback is void, first argument is c_arg1__self which is `id` and c_arg2__id sel `SEL` and objc_arg1__NSNotificationPtr is `voidptr_t` // so per this page: https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100 // and this chat: https://gist.github.com/Noitidart/21b202611c62d74fecd0
	console.info('rez_class_addMethod:', rez_class_addMethod, rez_class_addMethod.toString(), uneval(rez_class_addMethod));
	if (rez_class_addMethod != 1) {
		throw new Error('rez_class_addMethod is not 1, so class_addMethod failed');
	}

	objc_registerClassPair(NoitNotifCls_class); // returns void // once this line runs ,running objc_allocateClassPair on NoiTNotifCls_class will result it in being NIL

	var NoitNotifCls_instance = objc_msgSend(objc_msgSend(NoitNotifCls_class, alloc), init); // if don't do alloc init on NoitNotifCls_class then the NoitNotifCB_js never triggers
	console.info('NoitNotifCls_instance:', NoitNotifCls_instance, NoitNotifCls_instance.toString(), uneval(NoitNotifCls_instance), NoitNotifCls_instance.isNull());
	releaseThese.push(NoitNotifCls_instance);
	// end - create class and callback
	
	// notif_name = [[NSString initWithUTF8String:] 'NSWorkspaceWillLaunchApplicationNotification'];
	var jsStr_notifName = 'NSWorkspaceWillLaunchApplicationNotification';
	var NSString = objc_getClass('NSString');
	var initWithUTF8String = sel_registerName('initWithUTF8String:');
	var nsworkspace_will_launch_application_notification = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, CHAR.array()(jsStr_notifName));
	console.info('nsworkspace_will_launch_application_notification:', nsworkspace_will_launch_application_notification, nsworkspace_will_launch_application_notification.toString(), uneval(nsworkspace_will_launch_application_notification));
	releaseThese.push(nsworkspace_will_launch_application_notification);
	
	/*
	// default_center = [NSDistributedNotificationCenter defaultCenter];
	var NSDistributedNotificationCenter = objc_getClass('NSDistributedNotificationCenter');
	var defaultCenter = sel_registerName('defaultCenter');
	var default_center = objc_msgSend(NSDistributedNotificationCenter, defaultCenter);
	console.info('default_center:', default_center, default_center.toString(), uneval(default_center), default_center.isNull());
	*/
	
	// shared_workspace = [NSWorkspace sharedWorkspace];
	var NSWorkspace = objc_getClass('NSWorkspace');
	var sharedWorkspace = sel_registerName('sharedWorkspace');
	var shared_workspace = objc_msgSend(NSWorkspace, sharedWorkspace);
	console.info('shared_workspace:', shared_workspace, shared_workspace.toString(), uneval(shared_workspace), shared_workspace.isNull());

	// notification_center = [[NSWorkspace sharedWorkspace] notificationCenter];
	var notificationCenter = sel_registerName('notificationCenter');
	var notification_center = objc_msgSend(shared_workspace, notificationCenter);
	console.info('notification_center:', notification_center, notification_center.toString(), uneval(notification_center));

	// addObserver
	var addObserver = sel_registerName('addObserver:selector:name:object:')
	objc_msgSend(notification_center, addObserver, NoitNotifCls_instance, NoitNotifCB_selector, nsworkspace_will_launch_application_notification, NIL); // addObserver returns void
	
	shutdown = function() {
		var removeObserver = sel_registerName('removeObserver:name:object:')
		objc_msgSend(notification_center, removeObserver, NoitNotifCls_instance, nsworkspace_will_launch_application_notification, NIL); // returns void

		
		for (var i=0; i<releaseThese.length; i++) {
			objc_msgSend(releaseThese[i], release);
		}
		
		objc_disposeClassPair(NoitNotifCls_class); // return is void // must do objc_disposeClassPair AFTER release. if you do release AFTER disposeClasPair then firefox will crash
		
		objc.close();
		
		console.log('succesfully shutdown');
	}
}

try {
	main();
} catch (ex) {
	console.error('Error Occured:', ex);
} finally {
	//shutdown();
}