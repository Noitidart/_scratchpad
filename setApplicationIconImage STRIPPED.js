Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');
let objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
let jsStr_imagePath = OS.Path.join(OS.Constants.Path.desktopDir, 'beta.icns');
/** END - edit these **/

// types
let id = ctypes.voidptr_t;
let SEL = ctypes.voidptr_t;
let BOOL = ctypes.signed_char;
let NSUInteger = ctypes.unsigned_long;

// constants
let nil = ctypes.voidptr_t(0);

//common functions
let objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, id, ctypes.char.ptr);
let sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
let objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, id, id, SEL, '...');
let alloc = sel_registerName('alloc');
let release = sel_registerName('release');

OS.File.read(jsStr_imagePath).then(function(iconData) {
  // NOTE: iconData is Uint8Array
  let length = NSUInteger(iconData.length);
  let bytes = ctypes.uint8_t.array()(iconData);

  // NSApp = [NSApplication sharedApplication];
  let NSApplication = objc_getClass('NSApplication');
  let sharedApplication = sel_registerName('sharedApplication');
  let NSApp = objc_msgSend(NSApplication, sharedApplication);

  // data = [NSData dataWithBytes: bytes length: length];
  let NSData = objc_getClass('NSData');
  let dataWithBytes_length = sel_registerName('dataWithBytes:length:');
  let data = objc_msgSend(NSData, dataWithBytes_length, bytes, length);

  // icon = [[NSImage alloc] initWithData: data];
  let NSImage = objc_getClass('NSImage');
  let initWithData = sel_registerName('initWithData:');
  let icon = objc_msgSend(objc_msgSend(NSImage, alloc), initWithData, data);

  if (icon.isNull()) {
    throw new Error('Image file is corrupted.');
  }

  // [NSApp setApplicationIconImage: icon]
  let setApplicationIconImage = sel_registerName('setApplicationIconImage:');
  objc_msgSend(NSApp, setApplicationIconImage, icon);

  // [icon release]
  let release = sel_registerName('release');
  objc_msgSend(icon, release);

  objc.close();
}, function(aReason) {
  console.error('Failed to read from file:', aReason);
}).catch(function(ex) {
  console.error(ex);
  throw ex;
});