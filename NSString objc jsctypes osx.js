var type_your_str_here = 'my string';
// path = [[NSString alloc] initWithUTF8String: type_your_str_here]; //copied block: `// pool = [[NSAutoreleasePool alloc] init]`
let NSString = objc_getClass('NSString');
let initWithUTF8String = sel_registerName('initWithUTF8String:');
let alloc = sel_registerName('alloc');
let string = objc_msgSend(objc_msgSend(NSString, alloc), initWithUTF8String, ctypes.char.array()(type_your_str_here)); //we use ctypes.char and not ctypes.jschar because jschar is UTF16

// [path release]
let release = sel_registerName('release');
objc_msgSend(path, release);