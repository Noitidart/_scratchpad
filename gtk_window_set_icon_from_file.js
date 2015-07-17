Components.utils.import('resource://gre/modules/Services.jsm');
var browserWindow = Services.wm.getMostRecentWindow('navigator:browser');
if (!browserWindow) {
    throw new Error('No browser window found');
}

var baseWindow = browserWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                              .getInterface(Ci.nsIWebNavigation)
                              .QueryInterface(Ci.nsIDocShellTreeItem)
                              .treeOwner
                              .QueryInterface(Ci.nsIInterfaceRequestor)
                              .getInterface(Ci.nsIBaseWindow);

var GDKWindowPtrString = baseWindow.nativeHandle;

Components.utils.import('resource://gre/modules/ctypes.jsm');

var gdk = ctypes.open('libgdk-x11-2.0.so.0');
var gtk = ctypes.open('libgtk-x11-2.0.so.0');

// types
let guint32 = ctypes.uint32_t;
let GdkWindow = ctypes.StructType('GdkWindow');
let gpointer = ctypes.voidptr_t;
let gboolean = ctypes.bool;
let GtkWindow = ctypes.StructType('GtkWindow');
let GtkWidget = ctypes.StructType('GtkWidget');
let gchar = ctypes.char;
let GQuark = ctypes.uint32_t;
let gint = ctypes.int;

// adv types
let GError = ctypes.StructType('GError', [
	{'domain': GQuark},
	{'code': gint},
	{'message': gchar.ptr}
]);

var gdk_window_get_user_data = gdk.declare('gdk_window_get_user_data', ctypes.default_abi, ctypes.void_t, GdkWindow.ptr, gpointer.ptr);

var gtk_widget_get_window = gtk.declare('gtk_widget_get_window', ctypes.default_abi, GtkWidget.ptr); // for getGdkWindowFromGtkWindow
var gtk_window_set_icon_from_file = gtk.declare('gtk_window_set_icon_from_file', ctypes.default_abi, gboolean, GtkWindow.ptr, gchar.ptr, GError.ptr.ptr)

var browserWindow_madeIntoGdkWinPtr = GdkWindow.ptr(ctypes.UInt64(GDKWindowPtrString));

var gptr = gpointer();
var rez_gwgud = gdk_window_get_user_data(browserWindow_madeIntoGdkWinPtr, gptr.address());
console.info('rez_gwgud:', rez_gwgud, /*rez_gwgud.toString(),*/ uneval(rez_gwgud)); // return is void so cant do .toString on it

var browserWindow_madeIntoGtkWindowPtr = ctypes.cast(gptr, GtkWindow.ptr);

var err = GError.ptr();
var rez = gtk_window_set_icon_from_file(browserWindow_madeIntoGtkWindowPtr, OS.Path.join(OS.Constants.Path.desktopDir, 'profilist-ff-channel-logos', 'aurora48.png'), err.address());
console.info('rez:', rez, rez.toString(), uneval(rez));
if (ctypes.errno != 0) { console.error('Failed rez, errno:', ctypes.errno); }
console.info(err.toString());

gdk.close();
gtk.close();