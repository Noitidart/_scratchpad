Components.utils.import('resource://gre/modules/ctypes.jsm');
let objc = ctypes.open(ctypes.libraryName('objc'));

let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;
let objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
let sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
let objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
let CGFloat = ctypes.float64_t;
let NSPoint = new ctypes.StructType('NSPoint',[ { 'x' : CGFloat }, { 'y' : CGFloat } ]);

// note: [NSEvent mouseLocation] returns NSPoint struct,
// which is small enough to return in register,
// so we don't need to use objc_msgSend_stret.
let objc_msgSend_NSPoint = objc.declare('objc_msgSend', ctypes.default_abi, NSPoint, id, SEL, '...'); //this is return value

// pool = [[NSAutoreleasePool alloc] init]
let NSAutoreleasePool = objc_getClass('NSAutoreleasePool');
let alloc = sel_registerName('alloc');
let init = sel_registerName('init');
let pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);

// loc = [NSEvent mouseLocation]
let NSEvent = objc_getClass('NSEvent');
let mouseLocation = sel_registerName('mouseLocation');
let loc = objc_msgSend_NSPoint(NSEvent, mouseLocation); // i was working on noteFileSystemChanged and I realize that this we do objc_msgSend_NSPoint function as NSPoint is the return value. so if i was expecting a return of INT i would do a objc_msgSend_INT function

// [pool release]
let release = sel_registerName('release');
objc_msgSend(pool, release);

Cu.reportError(loc);

objc.close();