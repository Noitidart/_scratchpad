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
	
	var _x11Display = XOpenDisplay(null);
	if (!_x11Display) {
		console.error('Integration: Could not open display; not activating');
		_x11 = false;
		return;
	}	


	var _x11RootWindow = XDefaultRootWindow(_x11Display);
	if (!_x11RootWindow) {
		console.error('Integration: Could not get root window; not activating');
		_x11 = false;
		return;
	}

	//start - WindowsMatchingPid from  http://stackoverflow.com/questions/151407/how-to-get-an-x11-window-from-a-process-id
	//start - searchForPidStartingAtWindow func
	var _atomPIDInited = false;
	var _atomTIME;
	var _atomPID;
	var _matchingWins = [];
	function searchForPidStartingAtWindow(w, _disp, targetPid, isRecurse) { // when you call must always leave isRecurse null or false, its only used by the function to identify when to clear out _matchingWins
		if (!isRecurse) {
			//user just called this function so clear _matchingWins
			_matchingWins = [];
		}
		//console.log('h1');
		//make sure to clear _matchingWins arr before running this
		if (!_atomPIDInited) {
			_atomPID = XInternAtom(_disp, '_NET_WM_PID', true);
			//console.log('_atomPID:', _atomPID, _atomPID.toString(), parseInt(_atomPID));
			if(_atomPID == None) {
				console.error('No such atom ("_NET_WM_PID"), _atomPID:', _atomPID);
				throw new Error('No such atom ("_NET_WM_PID"), _atomPID:' + _atomPID);
			}
			_atomPIDInited = true;
			
			_atomTIME = XInternAtom(_disp, '_NET_WM_USER_TIME', true);
			//console.log('_atomTIME:', _atomTIME, _atomTIME.toString(), parseInt(_atomTIME));
			if(_atomTIME == None) {
				console.error('No such atom ("_NET_WM_USER_TIME"), _atomTIME:', _atomTIME);
				throw new Error('No such atom ("_NET_WM_USER_TIME"), _atomTIME:' + _atomTIME);
			}
		}
		
		var returnType = new X11Atom(),
		returnFormat = new ctypes.int(),
		nItemsReturned = new ctypes.unsigned_long(),
		nBytesAfterReturn = new ctypes.unsigned_long(),
		propData = new ctypes.char.ptr();
		
		var windowMatchesPID = false;
		var shouldPushWindow = false;
		var pushObj = {};
		
		//start - get pid
		var rez = XGetWindowProperty(_disp, w, _atomPID, 0, 1024, false, XA_CARDINAL, returnType.address(), returnFormat.address(), nItemsReturned.address(), nBytesAfterReturn.address(), propData.address());
		//console.log('h3');
		//console.log('XGetWindowProperty', 'rez:', rez, 'returnType:', returnType, 'nItemsReturned:', nItemsReturned, 'nBytesAfterReturn:', nBytesAfterReturn, 'propData:', propData);
		if (rez == Success) {
			var nElements = ctypes.cast(nItemsReturned, ctypes.unsigned_int).value;
			if(nElements) {
				//var rezArr = [propData, nElements];
				//console.log('nElements > 0:', nElements, '(should always be one, as per window should have only one pid, but its an array so lets loop through just to make sure)');
				
				if (nElements > 1) {
					throw new Error('how on earth??? nElements is > 1, windows should only have one pid...', 'nElements:', nElements);
				}
				//var clientList = ctypes.cast(res[0], X11Window.array(nClients).ptr).contents,
				
				var pidList = ctypes.cast(propData, ctypes.unsigned_long.array(nElements).ptr).contents;
				for (var i=0; i<nElements; i++) {
					var pid = pidList.addressOfElement(i).contents;
					//console.log('pid:', pid);
					//if (pid == targetPid) {
					if (ctypes.UInt64.compare(pid, ctypes.UInt64(targetPid)) == 0) { //if == 0 then they are equal
						//console.log('pid match at', pid.toString(), targetPid);
						windowMatchesPID = true;
						shouldPushWindow = true;
						pushObj.window = w;
					}
				}
				//var rez = XFree(propData); //i dont know if i should xfree anything
				//console.log('rez of XFree on propData:', rez);
			} else {
				//console.log('no elements, nElements:', nElements, 'THUS meaning no pid on this window');
			}
		} else {
			console.error('failed on XGetWindowProperty, rez:', rez);
		}
		//end - get pid
		
		//start - get last user activity time
			if (windowMatchesPID) { //only bother to get time access if the pid matches
			var rez = XGetWindowProperty(_disp, w, _atomTIME, 0, 1024, false, XA_CARDINAL, returnType.address(), returnFormat.address(), nItemsReturned.address(), nBytesAfterReturn.address(), propData.address());
			//console.log('h3');
			//console.log('XGetWindowProperty', 'rez:', rez, 'returnType:', returnType, 'nItemsReturned:', nItemsReturned, 'nBytesAfterReturn:', nBytesAfterReturn, 'propData:', propData);
			if (rez == Success) {
				var nElements = ctypes.cast(nItemsReturned, ctypes.unsigned_int).value;
				if(nElements) {
					//var rezArr = [propData, nElements];
					//console.log('nElements > 0:', nElements, '(should always be one, as per window should have only one lasttime, but its an array so lets loop through just to make sure)');
					
					if (nElements > 1) {
						throw new Error('how on earth??? nElements is > 1, windows should only have one lasttime...', 'nElements:', nElements);
					}
					//var clientList = ctypes.cast(res[0], X11Window.array(nClients).ptr).contents,
					
					var lasttimeList = ctypes.cast(propData, ctypes.unsigned_long.array(nElements).ptr).contents;
					for (var i=0; i<nElements; i++) {
						var lasttime = lasttimeList.addressOfElement(i).contents;
						//console.log('lasttime:', lasttime, lasttime.toString());
						pushObj.lasttime = lasttime.toString();
					}
					//var rez = XFree(propData); //i dont know if i should xfree anything
					//console.log('rez of XFree on propData:', rez);
				} else {
					shouldPushWindow = false;
					//console.log('no elements, nElements:', nElements, 'THUS meaning no lasttime on this window');
				}
			} else {
				console.error('failed on XGetWindowProperty, rez:', rez);
			}
		}
		//end - get last user activity time
		
		if (shouldPushWindow) {
			_matchingWins.push(pushObj);
		}
		
		// recurse into child windows
		var wRoot = new X11Window();
		var wParent = new X11Window();
		var wChild = new X11Window.ptr();
		var nChildren = new ctypes.unsigned_int();
		
		var rez = XQueryTree(_disp, w, wRoot.address(), wParent.address(), wChild.address(), nChildren.address());
		if(rez != 0) { //can probably test this against `None` instead of `0`
			var nChildrenCasted = ctypes.cast(nChildren, ctypes.unsigned_int).value;
			//console.log('nChildrenCasted:', nChildrenCasted);
			
			if (nChildrenCasted > 0) {
				var wChildCasted = ctypes.cast(wChild, X11Window.array(nChildrenCasted).ptr).contents; //SAME AS: `var wChildCasted = ctypes.cast(wChild, ctypes.ArrayType(X11Window, nChildrenCasted).ptr).contents;`
				
				for(var i=0; i<wChildCasted.length; i++) {
					var wChildElementCasted = wChildCasted.addressOfElement(i).contents; //DO NOT DO `var wChildElementCasted = ctypes.cast(wChildCasted.addressOfElement(i), X11Window).value;`, it crashes on line 234 when passing as `w` into `XGetWindowProperty`
					//console.log('wChildElementCasted:', wChildElementCasted, 'w:', w);
					searchForPidStartingAtWindow(wChildElementCasted, _disp, targetPid, true);
				}
			} else {
				//console.log('this window has no children, nChildrenCasted:', nChildrenCasted);
			}
		} else {
			console.warn('XQueryTree failed:', rez);
		}
		
		return _matchingWins;
	}
	//end - searchForPidStartingAtWindow func
	
	var wins = searchForPidStartingAtWindow(_x11RootWindow, _x11Display, 4398); //dont pass isRecurse here, important, otherwise if use this func multiple times, you'll have left over windows in the returned array from a previous run of this func
	console.log('wins:', wins.join('\n'));
	if (wins.length > 0) {
		//find win with most recent time
		wins.sort(function(a, b) {
			if ('lasttime' in a && !('lasttime' in b) ) {
				return 0;
			} else if ('lasttime' in b && !('lasttime' in a) ) {
				return 1;
			} else {
				//both have lasttime
				return a.lasttime < b.lasttime;
			}
		});
		console.log('wins sorted:', wins);
		/*
		var mostRecentTime = 0;
		var mostRecentWin = 0;
		var secondToLastMostRecentWin = 0;
		for (var i=0; i<wins.length; i++) {
			if (wins[i].lasttime > mostRecentTime) {
				mostRecentWin = wins[i].window;
				break;
			}
		}
		*/
		
		var mostRecentWin = wins[0].window;
		if (mostRecentWin !== 0) {
			//focus it now
			//start - activate window
			var event = new XClientMessageEvent();
			event.type = 33; /* ClientMessage*/
			event.serial = 0;
			event.send_event = 1;
			event.message_type = XInternAtom(_x11Display, '_NET_ACTIVE_WINDOW', 0);
			event.display = _x11Display;
			event.window = mostRecentWin;
			event.format = 32;
			event.l0 = 2;
			var mask = 1 << 20 /* SubstructureRedirectMask */ | 1 << 19 /* SubstructureNotifyMask */ ;
			if (XSendEvent(_x11Display, _x11RootWindow, 0, mask, event.address())) {
				XMapRaised(_x11Display, mostRecentWin);
				XFlush(_x11Display);
				console.info("Integration: Activated successfully");
			} else {
				console.error("Integration: An error occurred activating the window");
			}
			//end - activate window
			
			
			return true;
		} else {
			console.warn('no most recent window found');
			return false;
		}
	} else {
		console.warn('no windows with such pid found');
		return false;
	}
	//end - WindowsMatchingPid
	
	XCloseDisplay(_x11Display);

	//_X11BringToForeground(win, intervalID);
}

doit();