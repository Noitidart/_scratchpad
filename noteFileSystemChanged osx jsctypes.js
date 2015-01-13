Cu.import('resource://gre/modules/ctypes.jsm');
let objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
let jsStrPath = '/Users/noi/Desktop/default profile.app';
/** END - edit these **/

let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;
let objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
let sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
let objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');

// path = [[NSString alloc] initWithUTF8String: jsStrPath]; //copied block: `// pool = [[NSAutoreleasePool alloc] init]`
let NSString = objc_getClass('NSString');
let initWithUTF8String = sel_registerName('initWithUTF8String:');
let alloc = sel_registerName('alloc');
let path = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()(jsStrPath)); //we use ctypes.char and not ctypes.jschar because jschar is UTF16

//i tried using `notificationCenter` but it crashed so i switched to use `sharedWorkspace` and it worked. I guessed I should do this because with `setApplicationIconImage` he took it to `sharedApplication` first, i need to learn how to recognize if it should go to something like this though
// NSWrkSpc = [NSWorkspace sharedWorkspace]; // copied block: `// NSApp = [NSApplication sharedApplication];`
let NSWorkspace = objc_getClass('NSWorkspace');
let sharedWorkspace = sel_registerName('sharedWorkspace');
let NSWrkSpc = objc_msgSend(NSWorkspace, sharedWorkspace);

// [NSWrkSpc noteFileSystemChanged: path] // copied block: `// [NSApp setApplicationIconImage: icon]`
let noteFileSystemChanged = sel_registerName('noteFileSystemChanged:');
/*var rez_noteFileSystemChanged = */objc_msgSend(NSWrkSpc, noteFileSystemChanged, path); // noteFileSystemChanged returns void so no need for `var rez_noteFileSystemChanged = `

// [path release]
let release = sel_registerName('release');
objc_msgSend(path, release);

objc.close();