Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');
let objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
let jsStr_fullPath = OS.Path.join(OS.Constants.Path.desktopDir, 'default profile.app');
let jsStr_iconPath = OS.Path.join(OS.Constants.Path.desktopDir, 'beta.icns');
/** END - edit these **/

// types
let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;
let BOOL = ctypes.signed_char;

// constants
let nil = ctypes.voidptr_t(0);

//common functions
let objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
let sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
let objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
let alloc = sel_registerName('alloc');
let release = sel_registerName('release');

OS.File.read(jsStr_iconPath).then(function(iconData) {
	// NOTE: iconData is Uint8Array
	let length = ctypes.unsigned_long(iconData.length);
	let bytes = ctypes.uint8_t.array()(iconData);
	
	// data = [NSData dataWithBytes: bytes length: length];
	let NSData = objc_getClass('NSData');
	let dataWithBytes_length = sel_registerName('dataWithBytes:length:');
	let data = objc_msgSend(NSData, dataWithBytes_length, bytes, length);
	
	// icon = [[NSImage alloc] initWithData: data];
	let NSImage = objc_getClass('NSImage');
	let initWithData = sel_registerName('initWithData:');
	let icon = objc_msgSend(objc_msgSend(NSImage, alloc), initWithData, data);
	
	// fullPath = [[NSString alloc] initWithUTF8String: jsStr_fullPath]; //copied block: `// pool = [[NSAutoreleasePool alloc] init]`
	let NSString = objc_getClass('NSString');
	let initWithUTF8String = sel_registerName('initWithUTF8String:');
	let fullPath = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()(jsStr_fullPath)); //we use ctypes.char and not ctypes.jschar because jschar is UTF16

	// `options` is third argument of `setIcon` and it is `NSUInteger` so lets try to get that
	// options = [[NSNumber alloc] numberWithUnsignedLong: jsStr_fullPath]; //copied block: `// pool = [[NSAutoreleasePool alloc] init]`
	let NSNumber = objc_getClass('NSNumber');
	let numberWithUnsignedLong = sel_registerName('numberWithUnsignedLong:');
	let options = objc_msgSend(objc_msgSend(NSNumber, alloc), numberWithUnsignedLong, ctypes.unsigned_long(0));

	
	//i tried using `notificationCenter` but it crashed so i switched to use `sharedWorkspace` and it worked. I guessed I should do this because with `setApplicationIconImage` he took it to `sharedApplication` first, i need to learn how to recognize if it should go to something like this though
	// NSWrkSpc = [NSWorkspace sharedWorkspace]; // copied block: `// NSApp = [NSApplication sharedApplication];`
	let NSWorkspace = objc_getClass('NSWorkspace');
	let sharedWorkspace = sel_registerName('sharedWorkspace');
	let NSWrkSpc = objc_msgSend(NSWorkspace, sharedWorkspace);

	// [NSWrkSpc setIcon:forFile:options: ] // copied block: `// [NSApp setApplicationIconImage: icon]`
	let setIcon = sel_registerName('setIcon:forFile:options:');
	let objc_msgSend_returnBool = objc.declare('objc_msgSend', ctypes.default_abi, BOOL, id, SEL, '...'); //this is return value because `setIcon:forFile:options:` returns a BOOL per the docs
	let rez_setIcon = objc_msgSend_returnBool(NSWrkSpc, setIcon, fullPath, icon, options);

	// [fullPath release]
	objc_msgSend(fullPath, release);

	// [icon release]
	objc_msgSend(icon, release);

	// [options release]
	objc_msgSend(options, release);
	
	objc.close();
}, function(aReason) {
	console.log("Failed to read from file:", aReason);
}).catch(function(ex) {
	console.error(ex);
	throw ex;
});