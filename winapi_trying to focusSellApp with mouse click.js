Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');

function myFocus() {

    if (ctypes.voidptr_t.size == 4 /* 32-bit */ ) {
        var is64bit = false;
    } else if (ctypes.voidptr_t.size == 8 /* 64-bit */ ) {
        var is64bit = true;
    } else {
        throw new Error('huh??? not 32 or 64 bit?!?!');
    }


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

    var hwndString = baseWindow.nativeHandle;



    var user32 = ctypes.open('user32.dll');

    /* http://msdn.microsoft.com/en-us/library/ms633539%28v=vs.85%29.aspx
     * BOOL WINAPI SetForegroundWindow(
     *   __in_ HWND hWnd
     * );
     */
    var SetForegroundWindow = user32.declare('SetForegroundWindow', ctypes.winapi_abi,
        ctypes.bool, // return BOOL
        ctypes.voidptr_t // HWND
    );

    var SetCapture = user32.declare('SetCapture', ctypes.winapi_abi,
        ctypes.voidptr_t, // return
        ctypes.voidptr_t // HWND
    );

    var ShowWindow = user32.declare('ShowWindow', ctypes.winapi_abi,
        ctypes.bool, // return
        ctypes.voidptr_t, // hWnd
        ctypes.int // nCmdShow
    );

    var SW_SHOW = 5;

    var SwitchToThisWindow = user32.declare('SwitchToThisWindow', ctypes.winapi_abi,
        ctypes.void_t, // return
        ctypes.voidptr_t, // hWnd
        ctypes.bool // fAltTab
    );
    var SetWindowPos = user32.declare('SetWindowPos', ctypes.winapi_abi,
        ctypes.bool, //return
        ctypes.voidptr_t, //hwnd
        ctypes.voidptr_t, //hWndInsertAfter
        ctypes.int, //X
        ctypes.int, //Y
        ctypes.int, //cx
        ctypes.int, //cy
        ctypes.unsigned_int //uFlags
    );

    var RECT = ctypes.StructType('_RECT', [
		{left: ctypes.long},
		{top: ctypes.long},
		{right: ctypes.long},
		{bottom: ctypes.long}
	]);
    var LPRECT = RECT.ptr;
    var GetWindowRect = user32.declare('GetWindowRect', ctypes.winapi_abi,
        ctypes.bool, // return
        ctypes.voidptr_t, // hwnd
        LPRECT // lpRect
    );

    var SetCursorPos = user32.declare('SetCursorPos', ctypes.winapi_abi,
        ctypes.bool, // return
        ctypes.int, // x
        ctypes.int // y
    );

    var POINT = ctypes.StructType('_tagPoint', [
		{x: ctypes.long},
		{y: ctypes.long}
	]);
    var LPPOINT = POINT.ptr;

    var GetCursorPos = user32.declare('GetCursorPos', ctypes.winapi_abi,
        ctypes.bool, // return
        LPPOINT // lpPoint
    );

    // send mouse stuff
    var ULONG_PTR = is64bit ? ctypes.uint64_t : ctypes.unsigned_long;
    var DWORD = ctypes.uint32_t;
    var MOUSEINPUT = ctypes.StructType('tagMOUSEINPUT', [
		{'dx': ctypes.long},
		{'dy': ctypes.long},
		{'mouseData': DWORD},
		{'dwFlags': DWORD},
		{'time': ULONG_PTR},
		{'dwExtraInfo': DWORD}
	]);

    var INPUT = ctypes.StructType('tagINPUT', [
		{'type': DWORD},
		{'mi': MOUSEINPUT} // union, pick which one you want, we want keyboard input
    ]);
    var LPINPUT = INPUT.ptr;

    var SendInput = user32.declare('SendInput', ctypes.winapi_abi, ctypes.unsigned_int, ctypes.unsigned_int, LPINPUT, ctypes.int);

    var INPUT_MOUSE = 0;
    var MOUSEEVENTF_LEFTDOWN = 2;
    var MOUSEEVENTF_LEFTUP = 4;
    var MOUSEEVENTF_ABSOLUTE = 0x8000;
    // end send mouse stuff

    var HWND_TOP = ctypes.voidptr_t(-1); //ctypes.cast(ctypes.int(-1), ctypes.voidptr_t);
    var HWND_NOTOPMOST = ctypes.voidptr_t(-2);
    var SWP_NOMOVE = 2;
    var SWP_NOSIZE = 1;

    var hwnd = ctypes.voidptr_t(ctypes.UInt64(hwndString));


    window.focus(); // this is important, withou this, i dont know why, but the window will not become "always on top" from the SetWindowPos code on the next line
    var rez_SetWindowPos = SetWindowPos(hwnd, HWND_TOP, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE);
    console.log('rez_SetWindowPos:', rez_SetWindowPos);

    var myRect = RECT();
    var rez_GetWindowRect = GetWindowRect(hwnd, myRect.address());
    console.log('rez_SetWindowPos:', rez_SetWindowPos);

    var myRectLeft = parseInt(myRect.left.toString());
    var myRectTop = parseInt(myRect.top.toString());
    console.log('myRect.left', myRectLeft);
    console.log('myRect.top', myRectTop);

    var rez_SetCursorPos = SetCursorPos(myRect.left, myRect.top);
    console.log('rez_SetWindowPos:', rez_SetWindowPos);

    // may need to wait for the window to come to top
    // send click - i dont know why but the x and y coords of these send clicks is not being respected, it is just clicking where the mouse is, so im having to use SetCursorPos as temp hack
    var js_pInputs = [
        INPUT(INPUT_MOUSE, MOUSEINPUT(myRectLeft, myRectTop, 0, MOUSEEVENTF_LEFTDOWN | MOUSEEVENTF_ABSOLUTE, 0, 0)),
        INPUT(INPUT_MOUSE, MOUSEINPUT(myRectLeft, myRectTop, 0, MOUSEEVENTF_LEFTUP | MOUSEEVENTF_ABSOLUTE, 0, 0))
    ];

    var pInputs = INPUT.array()(js_pInputs);

    var rez_SI = SendInput(pInputs.length, pInputs, INPUT.size);
    console.log('rez_SI:', rez_SI.toString());
    // end send click

    var rez_SetWindowPos = SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE);
    console.log('rez_SetWindowPos:', rez_SetWindowPos);


    user32.close();

}
setTimeout(function() {
    myFocus();
}, 5000);