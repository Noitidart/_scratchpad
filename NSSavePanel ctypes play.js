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
	var NSSavePanel = objc_getClass('NSSavePanel');
	var savePanel = sel_registerName('savePanel');
	var aSavePanel = objc_msgSend(NSSavePanel, savePanel);
	
	var runModal = sel_registerName('runModal')
	var rez = objc_msgSend(aSavePanel, runModal);

	console.log('rez:', rez, rez.toString());

	objc.close(); 
}, 5000);