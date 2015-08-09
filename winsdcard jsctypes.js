Cu.import('resource://gre/modules/ctypes.jsm');
//const NULL = ctypes.voidptr_t(0); // no need for this, just use js null

var is64bit = ctypes.voidptr_t.size == 4 ? false : true;
var TYPES = {
  ABI: is64bit ? ctypes.default_abi : ctypes.winapi_abi,
  CALLBACK_ABI: is64bit ? ctypes.default_abi : ctypes.stdcall_cabi,
  DWORD: ctypes.unsigned_long,
  LPCVOID: ctypes.voidptr_t,
  LPSCARDCONTEXT: ctypes.voidptr_t
}

var CONST = {
  SCARD_SCOPE_USER: 0,
  SCARD_SCOPE_SYSTEM: 2,
  SCARD_S_SUCCESS: 0
};

var cardLib = ctypes.open('Winscard');

var SCardEstablishContext = cardLib.declare("SCardEstablishContext", TYPES.ABI, TYPES.DWORD, TYPES.DWORD, TYPES.LPCVOID, TYPES.LPCVOID, TYPES.LPSCARDCONTEXT);

var ContextHandle = TYPES.LPSCARDCONTEXT();
var ret = SCardEstablishContext(CONST.SCARD_SCOPE_SYSTEM, null, null, ContextHandle.address());

console.info('ret:', ret, ret.toString());

if (ret.toString() != CONST.SCARD_S_SUCCESS.toString()) {
  console.error('failed to establish context! error code was: ' + ret + ' in other terms it is: 0x' + ret.toString(16) + ' you can look up this error value here: https://msdn.microsoft.com/en-us/library/windows/desktop/aa374738%28v=vs.85%29.aspx#smart_card_return_values');
}

cardLib.close();