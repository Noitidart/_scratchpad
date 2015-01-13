Cu.import("resource://gre/modules/ctypes.jsm");

let objc = ctypes.open(ctypes.libraryName("objc"));

let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;

let objc_getClass = objc.declare("objc_getClass",
                                 ctypes.default_abi,
                                 id,
                                 ctypes.char.ptr);

let sel_registerName = objc.declare("sel_registerName",
                                    ctypes.default_abi,
                                    SEL,
                                    ctypes.char.ptr);

let objc_msgSend = objc.declare("objc_msgSend",
                                ctypes.default_abi,
                                id,
                                id,
                                SEL,
                                "...");

let NSDistributedNotificationCenter = objc_getClass("NSDistributedNotificationCenter");
let defaultCenter = sel_registerName("defaultCenter");
let nC = objc_msgSend(NSDistributedNotificationCenter, defaultCenter);

let addObserver = sel_registerName("addObserver:selector:name:object:");
let removeObserver = sel_registerName("removeObserver:name:object:")

function rT(x, y, z){
  console.log('in rT callback')
  return true;
}
let fType = ctypes.FunctionType( ctypes.default_abi, ctypes.bool, [id, SEL, id] );
let callback = fType.ptr( rT );

let NSObject = objc_getClass("NSObject");

let r = class_addMethod( delegate, shouldPresentNotification, callback, "{NSUserNotification=#}");
