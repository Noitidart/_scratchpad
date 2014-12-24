"use strict";

let { utils: Cu } = Components;
let { ctypes } = Cu.import("resource://gre/modules/ctypes.jsm", {});
let { OS } = Cu.import("resource://gre/modules/osfile.jsm", {});

/* **** please replace following string before run **** */
let IMAGE_PATH = OS.Path.join(OS.Constants.Path.desktopDir, 'aurora.icns');

OS.File.read(IMAGE_PATH).then(function(iconData) {
  // NOTE: iconData is Uint8Array
  let length = ctypes.unsigned_long(iconData.length);
  let bytes = ctypes.uint8_t.array()(iconData);

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

  // NSApp = [NSApplication sharedApplication];
  let NSApplication = objc_getClass("NSApplication");
  let sharedApplication = sel_registerName("sharedApplication");
  let NSApp = objc_msgSend(NSApplication, sharedApplication);

  // data = [NSData dataWithBytes: bytes length: length];
  let NSData = objc_getClass("NSData");
  let dataWithBytes_length = sel_registerName("dataWithBytes:length:");
  let data = objc_msgSend(NSData, dataWithBytes_length, bytes, length);

  // icon = [[NSImage alloc] initWithData: data];
  let NSImage = objc_getClass("NSImage");
  let initWithData = sel_registerName("initWithData:");
  let alloc = sel_registerName("alloc");
  let icon = objc_msgSend(objc_msgSend(NSImage, alloc), initWithData, data);

  if (icon.isNull()) {
    throw new Error("Image file is corrupted.");
  }

  // [NSApp setApplicationIconImage: icon]
  let setApplicationIconImage = sel_registerName("setApplicationIconImage:");
  objc_msgSend(NSApp, setApplicationIconImage, icon);

  // [icon release]
  let release = sel_registerName("release");
  objc_msgSend(icon, release);

  objc.close();
}, function(e) {
  console.log("Failed to read from file:", e);
}).catch(function(e) {
  console.log(e);
});