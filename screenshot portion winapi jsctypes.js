Cu.import('resource://gre/modules/ctypes.jsm');

var lib = {
	gdi32: ctypes.open('gdi32.dll'),
	user32: ctypes.open('user32.dll')
};

/***wintypes***/
var wintypesInit = function() {
	this.BOOL = ctypes.bool;
	this.BYTE = ctypes.unsigned_char;
	this.DWORD = ctypes.uint32_t;
	this.HANDLE = ctypes.voidptr_t;
	this.HBITMAP = this.HANDLE;
	this.HGDIOBJ = this.HANDLE;
	this.HDC = this.HANDLE;
	this.HWND = this.HANDLE;
	this.INT = ctypes.int;
	this.LONG = ctypes.long;
	this.LPVOID = ctypes.voidptr_t;
	this.COLORREF = this.DWORD; // 0x00bbggrr
	this.UINT = ctypes.unsigned_int;
	this.USHORT = ctypes.unsigned_short;
	this.WORD = this.USHORT;
	
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd162897%28v=vs.85%29.aspx
	 * typedef struct _RECT {
	 *   LONG left;
	 *   LONG top;
	 *   LONG right;
	 *   LONG bottom;
	 * } RECT, *PRECT;
	 */
	this.RECT = ctypes.StructType('_RECT', [
		{left: this.LONG},
		{top: this.LONG},
		{right: this.LONG},
		{bottom: this.LONG}
	]);
	this.PRECT = this.RECT.ptr;
	this.LPRECT = this.RECT.ptr;

	/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd162938%28v=vs.85%29.aspx
	 * typedef struct tagRGBQUAD {
	 *   BYTE rgbBlue;
	 *   BYTE rgbGreen;
	 *   BYTE rgbRed;
	 *   BYTE rgbReserved;
	 *   } RGBQUAD;
	 */
	this.RGBQUAD = ctypes.StructType('tagRGBQUAD', [
		{'rgbBlue': this.BYTE},
		{'rgbGreen': this.BYTE},
		{'rgbRed': this.BYTE},
		{'rgbReserved': this.BYTE}
	]);
	
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd183376%28v=vs.85%29.aspx
	 * typedef struct tagBITMAPINFOHEADER {
	 *   DWORD biSize;
   *   LONG  biWidth;
   *   LONG  biHeight;
   *   WORD  biPlanes;
   *   WORD  biBitCount;
   *   DWORD biCompression;
   *   DWORD biSizeImage;
   *   LONG  biXPelsPerMeter;
   *   LONG  biYPelsPerMeter;
   *   DWORD biClrUsed;
   *   DWORD biClrImportant;
   * } BITMAPINFOHEADER, *PBITMAPINFOHEADER;
	 */
	this.BITMAPINFOHEADER = ctypes.StructType('BITMAPINFO', [
		{'biSize': this.DWORD},
		{'biWidth': this.LONG},
		{'biHeight': this.LONG},
		{'biPlanes': this.WORD},
		{'biBitCount': this.WORD},
		{'biCompression': this.DWORD},
		{'biSizeImage': this.DWORD},
		{'biXPelsPerMeter': this.LONG},
		{'biYPelsPerMeter': this.LONG},
		{'biClrUsed': this.DWORD},
		{'biClrImportant': this.DWORD}
	]);
	this.PBITMAPINFOHEADER = this.BITMAPINFOHEADER.ptr;
	
	/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd183375%28v=vs.85%29.aspx
	 * typedef struct tagBITMAPINFO {
	 *   BITMAPINFOHEADER bmiHeader;
	 *   RGBQUAD          bmiColors[1];
	 * } BITMAPINFO, *PBITMAPINFO;
	 */
	this.BITMAPINFO = ctypes.StructType('BITMAPINFO', [
		{'bmiHeader': this.BITMAPINFOHEADER},
		{'bmiColors': this.RGBQUAD.array(1)}
	]);
	this.PBITMAPINFO = this.BITMAPINFO.ptr;
	this.LPBITMAPINFO = this.BITMAPINFO.ptr;
	
	if (ctypes.size_t.size == 8) {
	  this.CallBackABI = ctypes.default_abi;
	  this.WinABI = ctypes.default_abi;
	} else {
	  this.CallBackABI = ctypes.stdcall_abi;
	  this.WinABI = ctypes.winapi_abi;
	}
	
	// CONSTANTS
	//this.NULL = ctypes.cast(ctypes.uint64_t(0x0), ctypes.voidptr_t);
	this.SRCCOPY = this.DWORD(0x00CC0020);
	this.DIB_RGB_COLORS = 0;
};
var ostypes = new wintypesInit();
/***wintypes***/

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd144871%28v=vs.85%29.aspx
 * HDC GetDC(
 *   __in_ HWND hWnd
 * );
 */
var GetDC = lib.user32.declare('GetDC', ostypes.WinABI, ostypes.HDC, //return
	ostypes.HWND // hWnd
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633504%28v=vs.85%29.aspx
 * HWND WINAPI GetDesktopWindow(void);
 */
var GetDesktopWindow = lib.user32.declare('GetDesktopWindow', ostypes.WinABI, ostypes.HWND //return
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/ms633503%28v=vs.85%29.aspx
 * BOOL WINAPI GetClientRect(
 *   __in_   HWND hWnd,
 *   __out_  LPRECT lpRect
 * );
 */
var GetClientRect = lib.user32.declare('GetClientRect', ostypes.WinABI, ostypes.BOOL, //return
	ostypes.HWND, // hWnd
	ostypes.LPRECT // lpRect
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd183488%28v=vs.85%29.aspx
 * HBITMAP CreateCompatibleBitmap(
 *   __in_  HDC hdc,
 *   __in_  int nWidth,
 *   __in_  int nHeight
 * );
 */
var CreateCompatibleBitmap = lib.gdi32.declare('CreateCompatibleBitmap', ostypes.WinABI, ostypes.HBITMAP, //return
	ostypes.HDC, // hdc
	ostypes.INT, // nWidth
	ostypes.INT // nHeight
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd183489%28v=vs.85%29.aspx
 * HDC CreateCompatibleDC(
 *   __in_  HDC hdc
 * );
 */
var CreateCompatibleDC = lib.gdi32.declare('CreateCompatibleDC', ostypes.WinABI, ostypes.HDC, //return
	ostypes.HDC // hdc
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd183489%28v=vs.85%29.aspx
 * HGDIOBJ SelectObject(
 *   __in_  HDC hdc,
 *   __in_  HGDIOBJ hgdiobj
 * );
 */
var SelectObject = lib.gdi32.declare('CreateCompatibleDC', ostypes.WinABI, ostypes.HGDIOBJ, //return
	ostypes.HDC, // hdc
	ostypes.HGDIOBJ // hgdiobj
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd183370%28v=vs.85%29.aspx
 * BOOL BitBlt(
 *   __in_  HDC hdcDest,
 *   __in_  int nXDest,
 *   __in_  int nYDest,
 *   __in_  int nWidth,
 *   __in_  int nHeight,
 *   __in_  HDC hdcSrc,
 *   __in_  int nXSrc,
 *   __in_  int nYSrc,
 *   __in_  DWORD dwRop
 * );
 */
var BitBlt = lib.gdi32.declare('BitBlt', ostypes.WinABI, ostypes.BOOL, //return
	ostypes.HDC, // hdcDest
	ostypes.INT, // nXDest
	ostypes.INT, // nYDest
	ostypes.INT, // nWidth
	ostypes.INT, // nHeight
	ostypes.HDC, // hdcSrc
	ostypes.INT, // nXSrc
	ostypes.INT, // nYSrc
	ostypes.DWORD // dwRop
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd183489%28v=vs.85%29.aspx
 * BOOL DeleteDC(
 *   __in_  HDC hdc
 * );
 */
var DeleteDC = lib.gdi32.declare('DeleteDC', ostypes.WinABI, ostypes.BOOL, //return
	ostypes.HDC // hdc
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd162920%28v=vs.85%29.aspx
 * int ReleaseDC(
 *   __in_  HWND hWnd,
 *   __in_  HDC hDC
 * );
 */
var ReleaseDC = lib.user32.declare('ReleaseDC', ostypes.WinABI, ostypes.INT, //return
	ostypes.HWND, // hWnd
	ostypes.HDC // hDc
);

/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd144909%28v=vs.85%29.aspx
 * COLORREF GetPixel(
 *   __in_  HDC hdc,
 *   __in_  int nXPos,
 *   __in_  int nYPos
 * );
 */
var GetPixel = lib.gdi32.declare('GetPixel', ostypes.WinABI, ostypes.COLORREF, //return
	ostypes.HDC, // hdc
	ostypes.INT, // nXPos
	ostypes.INT // nYPos
);


/* http://msdn.microsoft.com/en-us/library/windows/desktop/dd144879%28v=vs.85%29.aspx
 * int GetDIBits(
 *   __in_     HDC hdc,
 *   __in_     HBITMAP hbmp,
 *   __in_     UINT uStartScan,
 *   __in_     UINT cScanLines,
 *   __out_    LPVOID lpvBits,
 *   __inout_  LPBITMAPINFO lpbi,
 *   __in_     UINT uUsage
);

 */
var GetDIBits = lib.gdi32.declare('GetDIBits', ostypes.WinABI, ostypes.INT, //return
	ostypes.HDC, // hdc
	ostypes.HBITMAP, // hbmp
	ostypes.UINT, // uStartScan
	ostypes.UINT, // cScanLines
	ostypes.LPVOID, // lpvBits
	ostypes.LPBITMAPINFO, // lpbi
	ostypes.UINT // uUsage
);

function takeScreenshot() {
  var hWindow = GetDesktopWindow();
  var hdcScreen = GetDC(hWindow);
  var rect = ostypes.RECT();
  
  var rez_GCR = GetClientRect(hWindow, rect.address());
  console.log('rez_GCR:', rez_GCR);
  
  console.log(rect.toString());
	
	var hbmC = CreateCompatibleBitmap(hdcScreen, rect.right, rect.bottom);
	console.log('hbmC.isNull():', hbmC.isNull());
	console.log('hbmC.toString():', hbmC.toString());
	//console.log('hbmC:', hbmC.toString(), 'hbmC == NULL', hbmC == ostypes.NULL, 'NULL:', ostypes.NULL.toString());
	if (!hbmC.isNull()) {
		var hdcC = CreateCompatibleDC(hdcScreen);
		console.log('hdcC:', hdcC.toString());
		if (!hdcC.isNull()) {
			var hbmOld = SelectObject(hdcC, hbmC);
			console.log('hbmOld:', hbmOld.toString());

			var rez_BB = BitBlt(hdcC,0,0,rect.right,rect.bottom,hdcScreen,0,0,ostypes.SRCCOPY);
			
			if (!rez_BB) {
				console.log('rez_BB:', rez_BB, 'winError:', ctypes.winLastError);
			} else {
				var rez_SO = SelectObject(hdcC, hbmOld);
				console.log('rez_SO:', rez_SO.toString());
				var rez_DDC = DeleteDC(hdcC);
				console.log('rez_DDC:', rez_DDC);
			}
		}
	}
	
	var rez_RDC = ReleaseDC(hWindow, hdcScreen);
	console.log('rez_RDC:', rez_RDC);
	
	return {
		hdc: hdcC,
		width: rect.right,
		height: rect.bottom,
		hbmp: hbmC
	};
}

function drawHdcToCanvas(myHdcObj) {
	/*
	//myHdcObj must be an object like this:
		{
			hdc: hdcC,
			width: rect.right,
			height: rect.bottom,
			hbmp: hbmC
		}
	*/
	var canvas = gBrowser.contentDocument.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
	gBrowser.contentDocument.documentElement.appendChild(canvas);
	canvas.width = myHdcObj.width;
	canvas.height = myHdcObj.height;
	var ctx = canvas.getContext('2d');
	
	var data32 = new Uint32Array();
	
	for (var y=0; y<myHdcObj.height; y++) {
		for (var x=0; x<myHdcObj.width; x++) {
			var colorRefAtPt = GetPixel(myHdcObj.hdc, x, y);
			//console.log(x, y, 'colorRefAtPt:', colorRefAtPt, colorRefAtPt.toString());
			/*var r = (colorRefAtPt.toString(16) & 0x00ff0000) >> 16;
			var g = (colorRefAtPt.toString(16) & 0x0000ff00) >> 8;
			var b = colorRefAtPt.toString(16) & 0x000000ff;
			if (r + g + b != 255*3) {
				console.log(r, g, b);
			}*/
			
			
			var cfapStr = parseInt(colorRefAtPt.toString());
			if (cfapStr != '4294967295') {
				console.log(x, y, 'cfapStr:', cfapStr);
			}
			if (x > 200) {
				//break;
			}
		}
		if (y > 200) {
			//break;
		}
	}

}

function tryGetDIBits(myHdcObj) {
	var bi = ostypes.BITMAPINFO();
	var buffer = ostypes.RGBQUAD.array(myHdcObj.width * myHdcObj.height)(); //lpvBits
	ctypes.winLastError = 0;
	console.log('reset winLastError:', ctypes.winLastError);
	var rez_GDIB = GetDIBits(myHdcObj.hdc, myHdcObj.hbmp, 0, myHdcObj.height, buffer.address(), bi.address(), ostypes.DIB_RGB_COLORS);
	console.log('rez_GDIB:', rez_GDIB, 'winLastError:', ctypes.winLastError); //its thrwoing winLastError 87 which is ERROR_INVALID_PARAMETER //http://msdn.microsoft.com/en-us/library/windows/desktop/ms681382%28v=vs.85%29.aspx
}

var hdcs = takeScreenshot();
drawHdcToCanvas(hdcs);
tryGetDIBits(hdcs);

for (var l in lib) {
	lib[l].close();
}