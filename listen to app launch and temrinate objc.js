Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
var jsStr_imagePath = OS.Path.join(OS.Constants.Path.desktopDir, 'ff-logos', 'beta48.png');
var jsStr_notifName = 'com.apple.screensaver.didstart';
/** END - edit these **/

// BASIC TYPES
var BOOL = ctypes.signed_char;
var CHAR = ctypes.char;
var CLASS = ctypes.voidptr_t;
var ID = ctypes.voidptr_t;
var METHOD = ctypes.voidptr_t;
var NSNOTIFICATIONPTR = ctypes.voidptr_t;
var NSUINTEGER = ctypes.unsigned_long;
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
var notif_name;
var cb_onNotif; // important to make this global otherwise the callback will be GC'ed and firefox will crash
// my personal globals for this code
var releaseThese = [];

var shutdown = function() {
	for (var i=0; i<releaseThese.length; i++) {
		objc_msgSend(releaseThese[i], release);
	}
	
	objc.close();
	
	console.log('succesfully shutdown');
}

function main() {
	/*
	// notif_name = [[NSString initWithUTF8String:] jsStr_notifName]' 
	var NSString = objc_getClass('NSString');
	var initWithUTF8String = sel_registerName('initWithUTF8String:');
	notif_name = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, CHAR.array()(jsStr_notifName));
	releaseThese.push(notif_name);
	console.info('notif_name:', notif_name, notif_name.toString(), uneval(notif_name));
	*/
	
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
	
	// nsworkspace_will_launch_application_notification = [[[NSWorkspace sharedWorkspace] notificationCenter] NSWorkspaceWillLaunchApplicationNotification];
	var NSWorkspaceWillLaunchApplicationNotification = sel_registerName('NSWorkspaceWillLaunchApplicationNotification');
	var nsworkspace_will_launch_application_notification = objc_msgSend(notification_center, NSWorkspaceWillLaunchApplicationNotification);
	
	// start - create class and callback
	var NSObject = objc_getClass('NSObject');
	var NoitNotifCls_class = objc_allocateClassPair(NSObject, 'NoitNotifCls', 0);
	console.info('NoitNotifCls_class:', NoitNotifCls_class, NoitNotifCls_class.toString(), uneval(NoitNotifCls_class), NoitNotifCls_class.isNull());
	if (NoitNotifCls_class.isNull()) {
		throw new Error('NoitNotifCls_class is NIL, so objc_allocateClassPair failed');
	}
	
	function NoitNotifCB_js() {
		console.log('NoitNotifCB_js Triggered');
	}
	
	var NoitNotifCB_imp = IMP_for_notif_cb.ptr(NoitNotifCB_js);
	
	var rez_class_addMethod = class_addMethod(NoitNotifCls_class, NoitNotifCB_selector, NoitNotifCB_imp, 'v@:@'); // because return of callback is void, first argument is c_arg1__self which is `id` and c_arg2__id sel `SEL` and objc_arg1__NSNotificationPtr is `voidptr_t` // so per this page: https://developer.apple.com/library/ios/documentation/Cocoa/Conceptual/ObjCRuntimeGuide/Articles/ocrtTypeEncodings.html#//apple_ref/doc/uid/TP40008048-CH100 // and this chat: https://gist.github.com/Noitidart/21b202611c62d74fecd0
	console.info('rez_class_addMethod:', rez_class_addMethod, rez_class_addMethod.toString(), uneval(rez_class_addMethod));
	if (rez_class_addMethod != 1) {
		throw new Error('rez_class_addMethod is not 1, so class_addMethod failed');
	}

	objc_registerClassPair(NoitNotifCls_class);

	var NoitNotifCls_instance = objc_msgSend(objc_msgSend(NoitNotifCls_class, alloc), init);
	console.info('NoitNotifCls_class_instance:', NoitNotifCls_class_instance, NoitNotifCls_class_instance.toString(), uneval(NoitNotifCls_class_instance), instance__NoitNotifCls_class.isNull());
	releaseThese.push(NoitNotifCls_instance);
	// end - create class and callback
	
	// addObserver
	var addObserver = sel_registerName('addObserver:selector:name:object:')
	objc_msgSend(notification_center, addObserver, NoitNotifCls_instance, NoitNotifCB_selector, nsworkspace_will_launch_application_notification, NIL); // addObserver returns void
	
	shutdown = function() {
		var removeObserver = sel_registerName('removeObserver:name:object:')
		objc_msgSend(notification_center, removeObserver, NoitNotifCls_instance, nsworkspace_will_launch_application_notification, NIL); // returns void

		var rez_objc_disposeClassPair = objc_disposeClassPair(NoitNotifCls_class);
		console.info('rez_objc_disposeClassPair:', rez_objc_disposeClassPair, rez_objc_disposeClassPair.toString(), uneval(rez_objc_disposeClassPair));
		
		for (var i=0; i<releaseThese.length; i++) {
			objc_msgSend(releaseThese[i], release);
		}
		
		objc.close();
		
		console.log('succesfully shutdown');
	}
}

try {
	main();
} catch (ex) {
	console.error('Error Occured:', ex);
} finally {
	shutdown();
}