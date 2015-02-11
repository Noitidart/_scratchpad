var libcf = ctypes.open('/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation');

// DEFINE TYPES
var CFIndex = ctypes.long;
var CFOptionFlags = ctypes.unsigned_long;
var CFTimeInterval = ctypes.double;
var SInt32 = ctypes.long;
var VOID = ctypes.void_t;

var __CFString = new ctypes.StructType("__CFString");
var CFStringRef = __CFString.ptr;

var __CFURL = new ctypes.StructType("__CFURL");
var CFURLRef = __CFURL.ptr;

var __CFAllocator = new ctypes.StructType("__CFAllocator");
var CFAllocatorRef = __CFAllocator.ptr;

var UniChar = ctypes.jschar;   // uint16 with automatic conversion

// DECLARE FUNCTIONS
/* https://developer.apple.com/library/mac/documentation/CoreFoundation/Reference/CFUserNotificationRef/index.html#//apple_ref/c/func/CFUserNotificationDisplayNotice
 * SInt32 CFUserNotificationDisplayNotice (
 *   CFTimeInterval timeout,
 *   CFOptionFlags flags,
 *   CFURLRef iconURL,
 *   CFURLRef soundURL,
 *   CFURLRef localizationURL,
 *   CFStringRef alertHeader,
 *   CFStringRef alertMessage,
 *   CFStringRef defaultButtonTitle
 * ); 
 */
var CFUserNotificationDisplayNotice = libcf.declare("CFUserNotificationDisplayNotice", ctypes.default_abi,
	SInt32,				// return
	CFTimeInterval,		// timeout
	CFOptionFlags,		// flags
	CFURLRef,			// iconURL
	CFURLRef,			// soundURL
	CFURLRef,			// localizationURL
	CFStringRef,		// alertHeader
	CFStringRef,		// alertMessage
	CFStringRef			// defaultButtonTitle
);

/* https://developer.apple.com/library/mac/documentation/CoreFoundation/Reference/CFTypeRef/#//apple_ref/c/func/CFRelease
 * void CFRelease (
 *   CFTypeRef cf
 * ); 
 */
var CFRelease = lib.CoreFoundation.declare('CFRelease', ctypes.default_abi,
	VOID,		// return
	CFTypeRef	// cf
);

/* https://developer.apple.com/library/mac/documentation/CoreFoundation/Reference/CFStringRef/#//apple_ref/c/func/CFStringCreateWithCharacters
 * CFStringRef CFStringCreateWithCharacters (
 *   CFAllocatorRef alloc,
 *   const UniChar *chars,
 *   CFIndex numChars
 * ); 
 */
var CFStringCreateWithCharacters = lib.CoreFoundation.declare('CFStringCreateWithCharacters', ctypes.default_abi,
	CFStringRef,		// return
	CFAllocatorRef,		// alloc
	UniChar.ptr,		// *chars
	CFIndex				// numChars
);

// HELPER FUNCTIONS
function makeCFStr(jsStr) {
	// js str is just a string
	// returns a CFStr that must be released with CFRelease when done
	return CFStringCreateWithCharacters(null, jsStr, jsStr.length);
}

// MAIN
var myCFStrs = {
	ok: makeCFStr('OK'),
	head: makeCFStr('My Alert Header'),
	body: makeCFStr('body of the alert'),
};

var myArgs = {
	timeout: 0,							// CFTimeInterval
	flags: 0,							// CFOptionFlags
	iconURL: null,						// CFURLRef
	soundURL: null,						// CFURLRef
	localizationURL: null,				// CFURLRef
	alertHeader: myCFStrs.head,			// CFStringRef
	alertMessage: myCFStrs.body,			// CFStringRef
	defaultButtonTitle: myCFStrs.ok		// CFStringRef		
};
var myArgsArr = [];
for (argName in myArgs) {
    if (myArgs.hasOwnProperty(argName)) {
		myArgsArr.push(myArgs[argName]);
    }
}
var rez = CFUserNotificationDisplayNotice.apply(null, myArgsArr);

for (var cfstr in myCFStrs) {
	if (myCFStrs.hasOwnProperty(cfstr)) {
		var rez_CFRelease = CFRelease(myCFStrs[cfstr]); // returns void
	}
}

libcf.close();