Cu.import('resource://gre/modules/ctypes.jsm');

var is64bit = ctypes.voidptr_t.size == 4 ? false : true;
var ifdef_UNICODE = true;

var TYPES = {
    ABI: is64bit ? ctypes.default_abi : ctypes.winapi_abi,
    CALLBACK_ABI: is64bit ? ctypes.default_abi : ctypes.stdcall_cabi,

    CHAR: ctypes.char,
    DWORD: ctypes.uint32_t,
    LONG: ctypes.long,
    LPCVOID: ctypes.voidptr_t,
    ULONG_PTR: is64bit ? ctypes.uint64_t : ctypes.unsigned_long,
    WCHAR: ctypes.jschar
};

// advanced types - based on simple types
TYPES.LPSTR = TYPES.CHAR.ptr;
TYPES.LPCSTR = TYPES.CHAR.ptr;
TYPES.LPDWORD = TYPES.DWORD.ptr;
TYPES.LPCWSTR = TYPES.WCHAR.ptr;
TYPES.LPWSTR = TYPES.WCHAR.ptr;
TYPES.SCARDCONTEXT = TYPES.ULONG_PTR;

// advanced advanced types - based on advanced types
TYPES.LPCTSTR = ifdef_UNICODE ? TYPES.LPCWSTR : TYPES.LPCSTR;
TYPES.LPTSTR = ifdef_UNICODE ? TYPES.LPWSTR : TYPES.LPSTR;
TYPES.PSCARDCONTEXT = TYPES.SCARDCONTEXT.ptr;
TYPES.LPSCARDCONTEXT = TYPES.SCARDCONTEXT.ptr;

var CONST = {
    SCARD_AUTOALLOCATE: TYPES.DWORD('0xffffffff'),
    SCARD_SCOPE_SYSTEM: 2,
    SCARD_SCOPE_USER: 0,
    SCARD_S_SUCCESS: 0
};

var cardLib = ctypes.open('Winscard');
var SCardEstablishContext = cardLib.declare('SCardEstablishContext', TYPES.ABI, TYPES.DWORD, TYPES.DWORD, TYPES.LPCVOID, TYPES.LPCVOID, TYPES.LPSCARDCONTEXT);
var SCardListReaders = cardLib.declare(ifdef_UNICODE ? 'SCardListReadersW' : 'SCardListReadersA', TYPES.ABI, TYPES.LONG, TYPES.SCARDCONTEXT, TYPES.LPCTSTR, TYPES.LPTSTR.ptr, TYPES.LPDWORD);
var SCardFreeMemory = cardLib.declare('SCardFreeMemory', TYPES.ABI, TYPES.LONG, TYPES.SCARDCONTEXT, TYPES.LPCVOID);
var SCardReleaseContext = cardLib.declare('SCardReleaseContext', TYPES.ABI, TYPES.LONG, TYPES.SCARDCONTEXT);

// types, consts, and functions declarations complete, now lets use it
try {
    var hSC = TYPES.SCARDCONTEXT();
    var rez_SCEC = SCardEstablishContext(CONST.SCARD_SCOPE_SYSTEM, null, null, hSC.address());
    if (rez_SCEC.toString() != CONST.SCARD_S_SUCCESS.toString()) {
        console.error('failed to establish context! error code was: ' + rez_SCEC + ' in other terms it is: 0x' + rez_SCEC.toString(16) + ' you can look up this error value here: https://msdn.microsoft.com/en-us/library/windows/desktop/aa374738%28v=vs.85%29.aspx#smart_card_return_values');
        throw new Error('failed to establish context!');
    }

    try {
		var reader_count = TYPES.DWORD('0xffffffff');
        var reader_names = TYPES.LPTSTR();
		
		console.log('reader_names.toString()', reader_names.toString());
		console.log('reader_names.address().toString()', reader_names.address().toString());
		
        var rez_SCLR = SCardListReaders(hSC, null, reader_names.address(), reader_count.address());
        console.log('rez_SCLR:', rez_SCLR, rez_SCLR.toString());
        if (rez_SCLR.toString() != CONST.SCARD_S_SUCCESS.toString()) {
            console.error('failed to get list of readers! error code was: ' + rez_SCLR + ' in other terms it is: 0x' + rez_SCLR.toString(16) + ' you can look up this error value here: https://msdn.microsoft.com/en-us/library/windows/desktop/aa374738%28v=vs.85%29.aspx#smart_card_return_values');
            throw new Error('failed to get list of readers!');
        }

		console.error('reader_names.toString()', reader_names.toString());
		console.error('reader_names.address().toString()', reader_names.address().toString());
		
        var rez_free = SCardFreeMemory(hSC, reader_names);
        console.log('rez_free:', rez_free, rez_free.toString());
        if (rez_free.toString() != CONST.SCARD_S_SUCCESS.toString()) {
            console.error('failed to free the multi-string that lists the card readers! error code was: ' + rez_free + ' in other terms it is: 0x' + rez_free.toString(16) + ' you can look up this error value here: https://msdn.microsoft.com/en-us/library/windows/desktop/aa374738%28v=vs.85%29.aspx#smart_card_return_values');
            throw new Error('failed to free the multi-string that lists the card readers!');
        }
    } finally {
        var rez_release = SCardReleaseContext(hSC);
        console.log('rez_release:', rez_release, rez_release.toString());
        if (rez_release.toString() != CONST.SCARD_S_SUCCESS.toString()) {
            console.error('failed to release context! error code was: ' + rez_release + ' in other terms it is: 0x' + rez_release.toString(16) + ' you can look up this error value here: https://msdn.microsoft.com/en-us/library/windows/desktop/aa374738%28v=vs.85%29.aspx#smart_card_return_values');
            throw new Error('failed to release context!');
        }
    }

} finally {
    cardLib.close();
    console.log('cardLib closed');
}