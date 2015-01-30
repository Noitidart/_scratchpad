Cu.import('resource://gre/modules/ctypes.jsm')
var shell32 = ctypes.open('shell32.dll');

var TYPES = {
	HRESULT: ctypes.long,
	WCHAR: ctypes.jschar
};
  
// advanced types
TYPES.LPWSTR = new ctypes.PointerType(TYPES.WCHAR);
TYPES.PWSTR = TYPES.LPWSTR; // PWSTR and LPWSTR are the same. The L in LPWSTR stands for "long/far pointer" and it is a leftover from 16 bit when pointers were "far" or "near". Such a distinction no longer exists on 32/64 bit, all pointers have the same size. SOURCE: https://social.msdn.microsoft.com/Forums/vstudio/en-US/52ab8d94-f8f8-427f-ad66-5b38db9a61c9/difference-between-lpwstr-and-pwstr?forum=vclanguage

var CONSTS = {
	S_OK: 0,
};

/* https://msdn.microsoft.com/en-us/library/windows/desktop/dd378419.aspx
 * HRESULT GetCurrentProcessExplicitAppUserModelID(
 *   __out_  PWSTR *AppID
 * );
 */
var GetCurrentProcessExplicitAppUserModelID = shell32.declare('GetCurrentProcessExplicitAppUserModelID', ctypes.winapi_abi, TYPES.HRESULT, TYPES.PWSTR.ptr);
   
	var myPWSTR = TYPES.PWSTR();
	var rez = GetCurrentProcessExplicitAppUserModelID(myPWSTR.address());

	//console.info('rez:', rez, rez.toString(), uneval(rez), parseInt(rez));
	//console.info('CONSTS.S_OK:', CONSTS.S_OK, CONSTS.S_OK.toString(), uneval(CONSTS.S_OK), parseInt(CONSTS.S_OK));
   
	if (parseInt(rez) == CONSTS.S_OK) {
		console.log('succesfully obatined, lets do readString now');
		var jsstr = myPWSTR.readString();
		console.log('jsstr:', jsstr);
	} else {
		console.warn('failed to get it, reason is:', rez.toString());
	}

shell32.close();