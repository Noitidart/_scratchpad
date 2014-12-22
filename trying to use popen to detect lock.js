Cu.import('resource://gre/modules/ctypes.jsm');


function doit() {
	try {
		_x11 = ctypes.open('libX11.so.6');
	} catch (e) {
		try {
			var libName = ctypes.libraryName('X11');
		} catch (e) {
			_x11 = false;
			console.error('Integration: Could not get libX11 name; not activating');
			return;
		}

		try {
			_x11 = ctypes.open(libName);
		} catch (e) {
			_x11 = false;
			console.error('Integration: Could not open ' + libName + '; not activating');
			return;
		}
	}

	//start - type constants
	X11Atom = ctypes.unsigned_long;
	X11Bool = ctypes.int;
	X11Display = new ctypes.StructType('Display');
	X11Window = ctypes.unsigned_long;
	X11Status = ctypes.int;
	//end - type constants
	
	//start - constants
	var XA_CARDINAL = 6; //https://github.com/foudfou/FireTray/blob/d0c49867ea7cb815647bf13f2f1edb26439506ff/src/modules/ctypes/linux/x11.jsm#L117
	var None = 0; //https://github.com/foudfou/FireTray/blob/d0c49867ea7cb815647bf13f2f1edb26439506ff/src/modules/ctypes/linux/x11.jsm#L63
	var Success = 0;
	//end - constants

	/*
	 * typedef struct {
	 *     int type;
	 *     unsigned long serial;	/ * # of last request processed by server * /
	 *     Bool send_event;			/ * true if this came from a SendEvent request * /
	 *     Display *display;		/ * Display the event was read from * /
	 *     Window window;
	 *     Atom message_type;
	 *     int format;
	 *     union {
	 *         char b[20];
	 *         short s[10];
	 *         long l[5];
	 *     } data;
	 * } XClientMessageEvent;
	 */
	XClientMessageEvent = new ctypes.StructType('XClientMessageEvent', [
		{'type': ctypes.int},
		{'serial': ctypes.unsigned_long},
		{'send_event': X11Bool},
		{'display': X11Display.ptr},
		{'window': X11Window},
		{'message_type': X11Atom},
		{'format': ctypes.int},
		{'l0': ctypes.long},
		{'l1': ctypes.long},
		{'l2': ctypes.long},
		{'l3': ctypes.long},
		{'l4': ctypes.long}
	]);

	/*
	 * Status XFetchName(
	 *    Display*		display,
	 *    Window		w,
	 *    char**		window_name_return
	 * );
	 */
	XFetchName = _x11.declare('XFetchName', ctypes.default_abi, X11Status,
		X11Display.ptr, X11Window, ctypes.char.ptr.ptr);

	/*
	 * Status XQueryTree(
	 *    Display*		display,
	 *    Window		w,
	 *    Window*		root_return,
	 *    Window*		parent_return,
	 *    Window**		children_return,
	 *    unsigned int*	nchildren_return
	 * );
	 */
	XQueryTree = _x11.declare('XQueryTree', ctypes.default_abi, X11Status,
		X11Display.ptr, X11Window, X11Window.ptr, X11Window.ptr, X11Window.ptr.ptr,
		ctypes.unsigned_int.ptr);

	/*
	 * int XFree(
	 *    void*		data
	 * );
	 */
	XFree = _x11.declare('XFree', ctypes.default_abi, ctypes.int, ctypes.voidptr_t);

	/*
	 * Display *XOpenDisplay(
	 *     _Xconst char*	display_name
	 * );
	 */
	XOpenDisplay = _x11.declare('XOpenDisplay', ctypes.default_abi, X11Display.ptr,
		ctypes.char.ptr);

	/*
	 * int XCloseDisplay(
	 *     Display*		display
	 * );
	 */
	XCloseDisplay = _x11.declare('XCloseDisplay', ctypes.default_abi, ctypes.int,
		X11Display.ptr);

	/*
	 * int XFlush(
	 *     Display*		display
	 * );
	 */
	XFlush = _x11.declare('XFlush', ctypes.default_abi, ctypes.int, X11Display.ptr);

	/*
	 * Window XDefaultRootWindow(
	 *     Display*		display
	 * );
	 */
	XDefaultRootWindow = _x11.declare('XDefaultRootWindow', ctypes.default_abi,
		X11Window, X11Display.ptr);

	/*
	 * Atom XInternAtom(
	 *     Display*			display,
	 *     _Xconst char*	atom_name,
	 *     Bool				only_if_exists
	 * );
	 */
	XInternAtom = _x11.declare('XInternAtom', ctypes.default_abi, X11Atom,
		X11Display.ptr, ctypes.char.ptr, X11Bool);

	/*
	 * Status XSendEvent(
	 *     Display*		display,
	 *     Window		w,
	 *     Bool			propagate,
	 *     long			event_mask,
	 *     XEvent*		event_send
	 * );
	 */
	XSendEvent = _x11.declare('XSendEvent', ctypes.default_abi, X11Status,
		X11Display.ptr, X11Window, X11Bool, ctypes.long, XClientMessageEvent.ptr);

	/*
	 * int XMapRaised(
	 *     Display*		display,
	 *     Window		w
	 * );
	 */
	XMapRaised = _x11.declare('XMapRaised', ctypes.default_abi, ctypes.int,
		X11Display.ptr, X11Window);

	/*
	 * extern int XGetWindowProperty(
	 *     Display*		 display,
	 *     Window		 w,
	 *     Atom		 property,
	 *     long		 long_offset,
	 *     long		 long_length,
	 *     Bool		 delete,
	 *     Atom		 req_type,
	 *     Atom*		 actual_type_return,
	 *     int*		 actual_format_return,
	 *     unsigned long*	 nitems_return,
	 *     unsigned long*	 bytes_after_return,
	 *     unsigned char**	 prop_return
	 * );
	 */
	XGetWindowProperty = _x11.declare('XGetWindowProperty', ctypes.default_abi,
		ctypes.int, X11Display.ptr, X11Window, X11Atom, ctypes.long, ctypes.long,
		X11Bool, X11Atom, X11Atom.ptr, ctypes.int.ptr, ctypes.unsigned_long.ptr,
		ctypes.unsigned_long.ptr, ctypes.char.ptr.ptr);

	////////////////////////
	////END DECLARATIONS
	////////////////////////
	
	var popen = _x11.declare('popen', ctypes.default_abi, ctypes.voidptr_t, // Return int
		ctypes.char.ptr, // Param1 const char *command
		ctypes.char.ptr // Param1 const char *command
	);
  
	var fread = _x11.declare('fread', ctypes.default_abi, ctypes.size_t, // Return int
		ctypes.voidptr_t,
		ctypes.size_t,
		ctypes.size_t,
		ctypes.voidptr_t
	);
	
	var pclose = _x11.declare('pclose', ctypes.default_abi, ctypes.int, // Return int
		ctypes.voidptr_t
	);
	
	
	
	//var rez = popen('readlink -q "/home/noi/.mozilla/firefox/q0rlb7ap.Unnamed Profile 1/.parentlock"', 'r')
	//console.log('rez:', rez.toString())
	
	var file = popen('readlink -q "/home/noi/.mozilla/firefox/q0rlb7ap.Unnamed Profile 1/.parentlock"', 'r')
	var bufferSize = 1000;
	var buffer = ctypes.char.array(bufferSize)('');
	var size = bufferSize;
	var outList = [];
	while (size == bufferSize) {
		size = fread(buffer, 1, bufferSize, file);
		outList.push(buffer.readString().substring(0, size));
	}
	pclose(file);
	
	console.log(outList.join(''));
	
	
}

doit();