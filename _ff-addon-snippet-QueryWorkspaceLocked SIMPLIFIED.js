Cu.import('resource://gre/modules/ctypes.jsm');
var lib = {
  CoreGraphics: '/System/Library/Frameworks/CoreGraphics.framework/CoreGraphics',
  CoreFoundation: '/System/Library/Frameworks/CoreFoundation.framework/CoreFoundation'
};
for (var l in lib) {
  lib[l] = ctypes.open(lib[l]);
}

//start mactypes
var Boolean = ctypes.unsigned_char;
var UniChar = ctypes.jschar;   // uint16 with automatic conversion
//end mactypes

//start CoreFoundationTypes
var __CFBoolean = new ctypes.StructType('__CFBoolean');
var CFBooleanRef = __CFBoolean.ptr;
var __CFNumber = new ctypes.StructType('__CFNumber');
var CFNumberRef = __CFNumber.ptr;
var CFTypeRef = ctypes.void_t.ptr;
var __CFString = new ctypes.StructType('__CFString');
var CFStringRef = __CFString.ptr;
var CFIndex = ctypes.long;
var CFNumberType = CFIndex;
var CFRange = new ctypes.StructType('CFRange', [{location: CFIndex}, {length: CFIndex}]);
var __CFAllocator = new ctypes.StructType('__CFAllocator');
var CFAllocatorRef = __CFAllocator.ptr;
//end CoreFoundationTypes

//dictionary functionality
var __CFDictionary = new ctypes.StructType('__CFDictionary');
var CFDictionaryRef = __CFDictionary.ptr;
var CFDictionaryGetValue = lib.CoreFoundation.declare('CFDictionaryGetValue', ctypes.default_abi, ctypes.void_t.ptr/*returns CFTypeRef*/, CFDictionaryRef, ctypes.void_t.ptr/*CFStringRef*/);
//end dictionary functionality

//string functionality
var CFStringCreateWithCharacters = lib.CoreFoundation.declare('CFStringCreateWithCharacters', ctypes.default_abi, CFStringRef, CFAllocatorRef, UniChar.ptr, CFIndex);
var CFStringGetLength = lib.CoreFoundation.declare('CFStringGetLength', ctypes.default_abi, CFIndex, CFStringRef);
var CFStringGetCharacters = lib.CoreFoundation.declare('CFStringGetCharacters', ctypes.default_abi, ctypes.void_t, CFStringRef, CFRange, UniChar.ptr);
//end string functionality

var CFNumberGetValue = lib.CoreFoundation.declare('CFNumberGetValue', ctypes.default_abi, Boolean, CFNumberRef, CFNumberType, ctypes.void_t.ptr);
var CFBooleanGetValue = lib.CoreFoundation.declare('CFBooleanGetValue', ctypes.default_abi, Boolean, CFBooleanRef);

//common declares
var CFRelease = lib.CoreFoundation.declare('CFRelease', ctypes.default_abi, ctypes.void_t, CFTypeRef);

function convertCFString(CFStr) { //CFStr is something like that is returned by `CFStringCreateWithCharacters` see: https://github.com/philikon/osxtypes/blob/b359c655b39e947d308163994f7cce94ca14d98f/README.txt#L20
	//start from: https://github.com/philikon/osxtypes/blob/b359c655b39e947d308163994f7cce94ca14d98f/README.txt#L22
	var length = CFStringGetLength(CFStr);
	var chars = ctypes.jschar.array(length)()
	CFStringGetCharacters(CFStr, CFRange(0, length), chars);
	var back = chars.readString();
	//end from: //start from: https://github.com/philikon/osxtypes/blob/b359c655b39e947d308163994f7cce94ca14d98f/README.txt#L22
	return back;
}

function makeCFStr(input) { //input is just a js string so like `var input = 'blah';`
	return CFStringCreateWithCharacters(null, input, input.length);
}
//end common declares

var CGSessionCopyCurrentDictionary = lib.CoreGraphics.declare('CGSessionCopyCurrentDictionary', ctypes.default_abi, CFDictionaryRef);

var CGSessionDict = CGSessionCopyCurrentDictionary();
console.log(uneval(CGSessionDict));

var kCGSSessionOnConsoleKey_str = 'kCGSSessionOnConsoleKey';
var kCGSSessionOnConsoleKey = CFStringCreateWithCharacters(null, kCGSSessionOnConsoleKey_str, kCGSSessionOnConsoleKey_str.length); //works // i figured it should be a string because of: https://github.com/JuliaEichler/Mac_OSX_SDKs/blob/392649d7112884481a94b8cd1f601f3a5edae999/MacOSX10.6.sdk/System/Library/Frameworks/ApplicationServices.framework/Versions/A/Frameworks/CoreGraphics.framework/Versions/A/Headers/CGSession.h#L38 here they are making CFSTR of a text string

var kCGSSessionOnConsoleKey_val = CFDictionaryGetValue(CGSessionDict, kCGSSessionOnConsoleKey);
console.log('kCGSSessionOnConsoleKey_val:', kCGSSessionOnConsoleKey_val, uneval(kCGSSessionOnConsoleKey_val)); //printing `"kCGSSessionOnConsoleKey_val:" CData {  } "ctypes.voidptr_t(ctypes.UInt64("0x7fff7a13b7f0"))"`
if (kCGSSessionOnConsoleKey_val.isNull()) {
	console.log('CFDictionaryGetValue isNull so the key is not present in the dictionary, I am guesing');
} else {
	var rez = CFBooleanGetValue(kCGSSessionOnConsoleKey_val);
	console.log('rez:', rez);
	
	var casted = ctypes.cast(kCGSSessionOnConsoleKey_val, CFBooleanRef.ptr).contents;
	console.log('casted:', casted);
	var rez = CFBooleanGetValue(casted);
	console.log('rez:', rez);
}

CFRelease(kCGSSessionOnConsoleKey); //do release on things made with CFStringCreateWithCharacters per https://github.com/philikon/osxtypes/blob/master/examples/content/iphoto.js#L89
for (var l in lib) {
  lib[l].close();
}