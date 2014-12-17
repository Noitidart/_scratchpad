/*
// Objective-C code
NSEvent loc = [NSEvent mouseLocation];

// pseudo C code
NSEvent loc = (NSPoint)objc_msgSend(objc_getClass("NSEvent"),
                                    sel_registerName("mouseLocation")
                                    
//Objective-C code
myImage = [NSImage imageNamed: @"ChangedIcon"];
[NSApp setApplicationIconImage: myImage];
                                    
// pseudo C code
NSImage myImage = (NSImage)objc_msgSend(objc_getClass('NSImage'), sel_registerName('setApplicationIconImage'));
*/
/* example from: https://developer.mozilla.org/en-US/docs/Mozilla/js-ctypes/Standard_OS_Libraries#Cocoa
Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

var id = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
var CGFloat = ctypes.float64_t;
var NSPoint = new ctypes.StructType('NSPoint', [{'x': CGFloat}, {'y': CGFloat}]);
// note: [NSEvent mouseLocation] returns NSPoint struct, which is small enough to return in register, so we don't need to use objc_msgSend_stret.
var objc_msgSend_NSPoint = objc.declare('objc_msgSend', ctypes.default_abi, NSPoint, id, SEL, '...');

// pool = [[NSAutoreleasePool alloc] init]
var NSAutoreleasePool = objc_getClass('NSAutoreleasePool');
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);

// loc = [NSEvent mouseLocation]
var NSEvent = objc_getClass('NSEvent');
var mouseLocation = sel_registerName('mouseLocation');
var loc = objc_msgSend_NSPoint(NSEvent, mouseLocation);

var release = sel_registerName('release');
objc_msgSend(pool, release);

console.log('loc:', loc);

objc.close();
*/

Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

var id = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...'); //https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/doc/c_ref/objc_msgSend
var obj_msgSend_stret = objc.declare('obj_msgSend_stret', ctypes.default_abi, ctypes.voidptr_t, id, SEL, '...'); //https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ObjCRuntimeRef/index.html#//apple_ref/doc/c_ref/objc_msgSend_stret
var NSImage = ctypes.voidptr_t;

// note: [NSEvent mouseLocation] returns NSPoint struct, which is small enough to return in register, so we don't need to use objc_msgSend_stret.
// noida note: i doubt NSImage is as small as NSPoint so ill have to use obj_msgSend_stret
var objc_msgSend_NSImage = objc.declare('objc_msgSend', ctypes.default_abi, NSImage, id, SEL, '...');

// pool = [[NSAutoreleasePool alloc] init]
var NSAutoreleasePool = objc_getClass('NSAutoreleasePool');
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var pool = objc_msgSend(objc_msgSend(NSAutoreleasePool, alloc), init);

// rez = [NSImage setApplicationIcon]
var NSEvent = objc_getClass('NSImage');
var setApplicationIcon = sel_registerName('setApplicationIcon');
var rez = objc_msgSend_NSPoint(NSImage, setApplicationIcon);

var release = sel_registerName('release');
objc_msgSend(pool, release);

console.log('rez:', rez);

objc.close();