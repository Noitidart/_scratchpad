Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');
let objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
let jsStrPath = OS.Path.join(OS.Constants.Path.desktopDir, 'ctypes make.js');
/** END - edit these **/

// types
let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;
let BOOL = ctypes.signed_char;

// constants
let nil = ctypes.voidptr_t(0);

let objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
let sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
let objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');

// path = [[NSString alloc] initWithUTF8String: jsStrPath]; //copied block: `// pool = [[NSAutoreleasePool alloc] init]`
let NSString = objc_getClass('NSString');
let initWithUTF8String = sel_registerName('initWithUTF8String:');
let alloc = sel_registerName('alloc');
let path = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()(jsStrPath)); //we use ctypes.char and not ctypes.jschar because jschar is UTF16

// NSDfltMgr = [NSFileManager defaultManager]; // copied block: `// NSApp = [NSApplication sharedApplication];`
let NSFileManager = objc_getClass('NSFileManager');
let defaultManager = sel_registerName('defaultManager');
let NSDfltMgr = objc_msgSend(NSFileManager, defaultManager);

// [NSDfltMgr createFileAtPath:contents:attributes: NSString path, NSData contents, NSDictionary attributes] // copied block: `// [NSApp setApplicationIconImage: icon]`
let createFileAtPath = sel_registerName('createFileAtPath:contents:attributes:');
let objc_msgSend_returnBool = objc.declare('objc_msgSend', ctypes.default_abi, BOOL, id, SEL, '...'); //this is return value
let rez_createFileAtPath = objc_msgSend_returnBool(NSDfltMgr, createFileAtPath, path, nil, nil);

console.info('rez_createFileAtPath:', rez_createFileAtPath, rez_createFileAtPath.toString(), uneval(rez_createFileAtPath));

// [path release]
let release = sel_registerName('release');
objc_msgSend(path, release);

objc.close();