Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import('resource://gre/modules/ctypes.jsm');

var gdk = ctypes.open('libgdk-x11-2.0.so.0');

// types
var gint = ctypes.int;
var GdkDevice = ctypes.StructType('GdkDevice');
var GdkModifierType = ctypes.int;
var GdkWindow = ctypes.StructType('GdkWindow');
var VOID = ctypes.void_t;

// https://developer.gnome.org/gdk3/stable/gdk3-Windows.html#gdk-get-default-root-window
var gdk_get_default_root_window = gdk.declare('gdk_get_default_root_window', ctypes.default_abi,
	GdkWindow.ptr	// return - the root window, which is top most parent of all windows
);

// https://developer.gnome.org/gdk3/stable/gdk3-Windows.html#gdk-window-get-pointer
// in GDK2 we have to use gdk_window_get_pointer, but in GDK3 it was deprecated and have to use gdk_window_get_device_position
var gdk_window_get_pointer = gdk.declare('gdk_window_get_pointer', ctypes.default_abi,
	GdkWindow.ptr,		// return - the window containing the pointer (as with gdk_window_at_pointer()), or NULL if the window containing the pointer isn’t known to GDK.
	GdkWindow.ptr,		// window
	gint.ptr,			// x
	gint.ptr,			// y
	GdkModifierType.ptr	// mask
);

var winRoot_GdkWindowPtr = gdk_get_default_root_window();
console.info('winRoot_GdkWindowPtr:', winRoot_GdkWindowPtr, winRoot_GdkWindowPtr.toString());

// gdk2
var x = gint();
var y = gint();
var mask = GdkModifierType();
var win_underMouse = gdk_window_get_pointer(
	winRoot_GdkWindowPtr,
	x.address(),
	y.address(),
	mask.address()	
);
console.info('win_underMouse:', win_underMouse, win_underMouse.toString());
console.info('x:', x, x.toString());
console.info('y:', y, y.toString());
console.info('mask:', mask, mask.toString());

gdk.close();