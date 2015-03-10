Components.utils.import('resource://gre/modules/ctypes.jsm');

var gdk = ctypes.open('libgdk-x11-2.0.so.0');
var gdk3 = ctypes.open('libgdk-3.so.0');

// types
var gint = ctypes.int;
var GdkDevice = ctypes.StructType('GdkDevice');
var GdkDeviceManager = ctypes.StructType('GdkDeviceManager');
var GdkDisplay = ctypes.StructType('GdkDisplay');
var GdkModifierType = ctypes.int;
var GdkWindow = ctypes.StructType('GdkWindow');

// https://developer.gnome.org/gdk3/stable/gdk3-Windows.html#gdk-get-default-root-window
var gdk_get_default_root_window = gdk.declare('gdk_get_default_root_window', ctypes.default_abi,
	GdkWindow.ptr	// return - the root window, which is top most parent of all windows
);

// in GDK2 we have to use gdk_window_get_pointer, but in GDK3 it was deprecated and have to use gdk_window_get_device_position
// https://developer.gnome.org/gdk3/stable/gdk3-Windows.html#gdk-window-get-device-position
var gdk_window_get_device_position = gdk3.declare('gdk_window_get_device_position', ctypes.default_abi,
	GdkWindow.ptr,		// return - The window underneath device or NULL if the window is not known to GDK
	GdkWindow.ptr,		// window
	GdkDevice.ptr,		// device
	gint.ptr,			// x
	gint.ptr,			// y
	GdkModifierType.ptr	// mask
);

// https://developer.gnome.org/gdk3/stable/gdk3-Windows.html#gdk-window-get-display
var gdk_window_get_display = gdk.declare('gdk_window_get_display', ctypes.default_abi,
	GdkDisplay.ptr,	// return
	GdkWindow.ptr	// *window
);

// https://developer.gnome.org/gdk3/stable/GdkDisplay.html#gdk-display-get-device-manager
var gdk_display_get_device_manager = gdk3.declare('gdk_display_get_device_manager', ctypes.default_abi,
	GdkDeviceManager.ptr,	// return
	GdkDisplay.ptr	// *display
);

// https://developer.gnome.org/gdk3/stable/GdkDeviceManager.html#gdk-device-manager-get-client-pointer
var gdk_device_manager_get_client_pointer = gdk3.declare('gdk_device_manager_get_client_pointer', ctypes.default_abi,
	GdkDevice.ptr,	// return
	GdkDeviceManager.ptr	// *device_manager
);

var winRoot_GdkWindowPtr = gdk_get_default_root_window();
var displayPtr = gdk_window_get_display(winRoot_GdkWindowPtr);
var device_managerPtr = gdk_display_get_device_manager(displayPtr);
var devicePtr = gdk_device_manager_get_client_pointer(device_managerPtr);


var x = gint();
var y = gint();
var mask = GdkModifierType();
var win_underMouse = gdk_window_get_device_position(
	winRoot_GdkWindowPtr,
	devicePtr,
	x.address(),
	y.address(),
	mask.address()	
);
console.info('win_underMouse:', win_underMouse, win_underMouse.toString());
console.info('x:', x, x.toString());
console.info('y:', y, y.toString());
console.info('mask:', mask, mask.toString());

gdk.close();
gdk3.close();