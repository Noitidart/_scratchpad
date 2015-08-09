Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');

var objc = ctypes.open(ctypes.libraryName('objc'));

// types
let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;
var NSUInteger = ctypes.unsigned_long;
var BOOL = ctypes.signed_char;

// constants
var NSWindowCollectionBehaviorStationary = 1 << 4;
var NSWindowCollectionBehaviorCanJoinAllSpaces = 1 << 0;
var NSWindowCollectionBehaviorFullScreenAuxiliary = 1 << 8;
var NSWindowCollectionBehaviorMoveToActiveSpace = 1 << 1;
var YES = BOOL(1);
var NIL = ctypes.void_t.ptr(ctypes.UInt64('0x0'))

//common functions
let sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
let objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
let objc_getClass = objc.declare("objc_getClass", ctypes.default_abi, id, ctypes.char.ptr);


var browserWindow = Services.wm.getMostRecentWindow(null);
if (!browserWindow) {
    throw new Error('No browser window found');
}

var NSWindowString = browserWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebNavigation).QueryInterface(Ci.nsIDocShellTreeItem).treeOwner.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIBaseWindow).nativeHandle;
var NSWindowPtr = ctypes.voidptr_t(ctypes.UInt64(NSWindowString));

setTimeout(function() {
	//var NSApplication = objc_getClass('NSApplication');
	//var NSApp = objc_msgSend(NSApplication, sel_registerName('sharedApplication'));
	//objc_msgSend(NSApp, sel_registerName('activateIgnoringOtherApps:'), YES);
 
	var setB = objc_msgSend(NSWindowPtr, sel_registerName('setCollectionBehavior:'), NSUInteger(NSWindowCollectionBehaviorStationary | NSWindowCollectionBehaviorMoveToActiveSpace | NSWindowCollectionBehaviorFullScreenAuxiliary));
	//objc_msgSend(NSWindowPtr, sel_registerName('orderFront:'), NIL);
	console.log('setB:', setB.toString(), setB);
	
	var setL = objc_msgSend(NSWindowPtr, sel_registerName('setLevel:'), ctypes.long(5));
	console.log('setL:', setL.toString(), setL);

	objc.close(); 
}, 5000);