Cu.import("resource://gre/modules/ctypes.jsm"); 
var lib_kernel32 = ctypes.open("kernel32.dll");

// NOT SUPPORTED BY WINXP
var GetFinalPathNameByHandle = lib_kernel32.declare('GetFinalPathNameByHandleW', ctypes.winapi_abi, ctypes.uint32_t, //DWORD
ctypes.uint32_t, // HANDLE
ctypes.jschar.ptr, // LPTSTR
ctypes.uint32_t, // DWORD
ctypes.uint32_t // DWORD
);
//SYSTEM_HANDLE_TABLE_ENTRY_INFO(6588, 786435, 82138464, 3, 6588, 1048604, 225155216)"
var bufType = ctypes.ArrayType(ctypes.jschar);
var buffer = new bufType(256);
var ret = GetFinalPathNameByHandle(463392, buffer, buffer.length, 0);
Services.ww.activeWindow.alert('ret:' + ret)
Services.ww.activeWindow.alert('buffer:' + buffer.readString()) //always just a " " no idea why