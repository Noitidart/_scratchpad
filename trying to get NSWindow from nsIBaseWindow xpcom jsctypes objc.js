var tWin = Services.wm.getMostRecentWindow('navigator:browser'); // tWin means target_window, we can pass here aDOMWindow
var tBaseWin = tWin.QueryInterface(Ci.nsIInterfaceRequestor)
	.getInterface(Ci.nsIWebNavigation)
	.QueryInterface(Ci.nsIDocShellTreeItem)
	.treeOwner.QueryInterface(Ci.nsIInterfaceRequestor)
	.getInterface(Ci.nsIBaseWindow);
var tWinHwnd = tBaseWin.nativeHandle; //we want to take this to NSWindow // see this note, if this tWinHwnd turns out to be a WindowRef we have to do some handling: https://github.com/kunitoki/juced/blob/3fa2634ff344de3da1aed94fdd056be72049c7ea/juce/extras/audio%20plugins/wrapper/VST/juce_VST_Wrapper.mm#L42 // this is handle to our window in iwndows its hwnd, in linux its gtk_window, its something in mac im not sure yet, but its returning something
//var tWinHwnd = ctypes.voidptr_t(ctypes.UInt64(tBaseWin.nativeHandle)); // we do it this way on windows
console.info('tWinHwnd:', tWinHwnd, tWinHwnd.toString(), uneval(tWinHwnd));

//im going to continue assuming tWinHwnd is a NSWindow

//start ctypes
Cu.import('resource://gre/modules/ctypes.jsm');

// types
let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;
let BOOL = ctypes.signed_char;
let NSUInteger = ctypes.unsigned_long;

// constants
let nil = ctypes.voidptr_t(0);

//common functions
let objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
let sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
let objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');

//common selectors
let alloc = sel_registerName('alloc');
let init = sel_registerName('init');
let release = sel_registerName('release');

//now using docs here: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NSApplication_Class/index.html#//apple_ref/occ/instp/NSApplication/hidden
