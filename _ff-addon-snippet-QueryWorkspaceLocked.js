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
var CFTypeRef = ctypes.void_t.ptr;
var __CFString = new ctypes.StructType('__CFString');
var CFStringRef = __CFString.ptr;
var __CFAllocator = new ctypes.StructType('__CFAllocator');
var CFAllocatorRef = __CFAllocator.ptr;
var CFHashCode = ctypes.unsigned_long;
var CFIndex = ctypes.long;
var CFTypeID = ctypes.unsigned_long;
var CFRange = new ctypes.StructType('CFRange', [{location: CFIndex}, {length: CFIndex}]);
//end CoreFoundationTypes

//dictionary functionality
var __CFDictionary = new ctypes.StructType('__CFDictionary');
var CFDictionaryRef = __CFDictionary.ptr;
var CFMutableDictionaryRef = __CFDictionary.ptr;
var CFDictionaryRetainCallBack = new ctypes.FunctionType(ctypes.default_abi, ctypes.void_t.ptr, [CFAllocatorRef, ctypes.void_t.ptr]).ptr;
var CFDictionaryReleaseCallBack = new ctypes.FunctionType(ctypes.default_abi, ctypes.void_t, [CFAllocatorRef, ctypes.void_t.ptr]).ptr;
var CFDictionaryCopyDescriptionCallBack = new ctypes.FunctionType(ctypes.default_abi, CFStringRef, [ctypes.void_t.ptr]).ptr;
var CFDictionaryEqualCallBack = new ctypes.FunctionType(ctypes.default_abi, Boolean, [ctypes.void_t.ptr, ctypes.void_t.ptr]).ptr;
var CFDictionaryHashCallBack = new ctypes.FunctionType(ctypes.default_abi, CFHashCode, [ctypes.void_t.ptr]).ptr;
var CFDictionaryKeyCallBacks = new ctypes.StructType('CFDictionaryKeyCallBacks', [{version: CFIndex}, {retain: CFDictionaryRetainCallBack}, {release: CFDictionaryReleaseCallBack}, {copyDescription: CFDictionaryCopyDescriptionCallBack}, {equal: CFDictionaryEqualCallBack}, {hash: CFDictionaryHashCallBack}]);
var kCFTypeDictionaryKeyCallBacks = lib.CoreFoundation.declare('kCFTypeDictionaryKeyCallBacks', CFDictionaryKeyCallBacks);
var kCFCopyStringDictionaryKeyCallBacks = lib.CoreFoundation.declare('kCFCopyStringDictionaryKeyCallBacks', CFDictionaryKeyCallBacks);
var CFDictionaryValueCallBacks = new ctypes.StructType('CFDictionaryValueCallBacks', [{version: CFIndex}, {retain: CFDictionaryRetainCallBack}, {release: CFDictionaryReleaseCallBack}, {copyDescription: CFDictionaryCopyDescriptionCallBack}, {equal: CFDictionaryEqualCallBack}]);
var kCFTypeDictionaryValueCallBacks = lib.CoreFoundation.declare('kCFTypeDictionaryValueCallBacks', CFDictionaryValueCallBacks);
var CFDictionaryApplierFunction = new ctypes.FunctionType(ctypes.default_abi, ctypes.void_t, [ctypes.void_t.ptr, ctypes.void_t.ptr, ctypes.void_t.ptr]).ptr;
var CFDictionaryGetTypeID = lib.CoreFoundation.declare('CFDictionaryGetTypeID', ctypes.default_abi, CFTypeID);
var CFDictionaryCreate = lib.CoreFoundation.declare('CFDictionaryCreate', ctypes.default_abi, CFDictionaryRef, CFAllocatorRef, ctypes.void_t.ptr.ptr, ctypes.void_t.ptr.ptr, CFIndex, CFDictionaryKeyCallBacks.ptr, CFDictionaryValueCallBacks.ptr);
var CFDictionaryCreateCopy = lib.CoreFoundation.declare('CFDictionaryCreateCopy', ctypes.default_abi, CFDictionaryRef, CFAllocatorRef, CFDictionaryRef);
var CFDictionaryCreateMutable = lib.CoreFoundation.declare('CFDictionaryCreateMutable', ctypes.default_abi, CFMutableDictionaryRef, CFAllocatorRef, CFIndex, CFDictionaryKeyCallBacks.ptr, CFDictionaryValueCallBacks.ptr);
var CFDictionaryCreateMutableCopy = lib.CoreFoundation.declare('CFDictionaryCreateMutableCopy', ctypes.default_abi, CFMutableDictionaryRef, CFAllocatorRef, CFIndex, CFDictionaryRef);
var CFDictionaryGetCount = lib.CoreFoundation.declare('CFDictionaryGetCount', ctypes.default_abi, CFIndex, CFDictionaryRef);
var CFDictionaryGetCountOfKey = lib.CoreFoundation.declare('CFDictionaryGetCountOfKey', ctypes.default_abi, CFIndex, CFDictionaryRef, ctypes.void_t.ptr);
var CFDictionaryGetCountOfValue = lib.CoreFoundation.declare('CFDictionaryGetCountOfValue', ctypes.default_abi, CFIndex, CFDictionaryRef, ctypes.void_t.ptr);
var CFDictionaryContainsKey = lib.CoreFoundation.declare('CFDictionaryContainsKey', ctypes.default_abi, Boolean, CFDictionaryRef, ctypes.void_t.ptr);
var CFDictionaryContainsValue = lib.CoreFoundation.declare('CFDictionaryContainsValue', ctypes.default_abi, Boolean, CFDictionaryRef, ctypes.void_t.ptr);
var CFDictionaryGetValue = lib.CoreFoundation.declare('CFDictionaryGetValue', ctypes.default_abi, ctypes.void_t.ptr/*returns CFTypeRef*/, CFDictionaryRef, ctypes.void_t.ptr/*CFStringRef*/);
var CFDictionaryGetValueIfPresent = lib.CoreFoundation.declare('CFDictionaryGetValueIfPresent', ctypes.default_abi, Boolean, CFDictionaryRef, ctypes.void_t.ptr, ctypes.void_t.ptr.ptr);
var CFDictionaryGetKeysAndValues = lib.CoreFoundation.declare('CFDictionaryGetKeysAndValues', ctypes.default_abi, ctypes.void_t, CFDictionaryRef, ctypes.void_t.ptr.ptr, ctypes.void_t.ptr.ptr);
var CFDictionaryApplyFunction = lib.CoreFoundation.declare('CFDictionaryApplyFunction', ctypes.default_abi, ctypes.void_t, CFDictionaryRef, CFDictionaryApplierFunction, ctypes.void_t.ptr);
var CFDictionaryAddValue = lib.CoreFoundation.declare('CFDictionaryAddValue', ctypes.default_abi, ctypes.void_t, CFMutableDictionaryRef, ctypes.void_t.ptr, ctypes.void_t.ptr);
var CFDictionarySetValue = lib.CoreFoundation.declare('CFDictionarySetValue', ctypes.default_abi, ctypes.void_t, CFMutableDictionaryRef, ctypes.void_t.ptr, ctypes.void_t.ptr);
var CFDictionaryReplaceValue = lib.CoreFoundation.declare('CFDictionaryReplaceValue', ctypes.default_abi, ctypes.void_t, CFMutableDictionaryRef, ctypes.void_t.ptr, ctypes.void_t.ptr);
var CFDictionaryRemoveValue = lib.CoreFoundation.declare('CFDictionaryRemoveValue', ctypes.default_abi, ctypes.void_t, CFMutableDictionaryRef, ctypes.void_t.ptr);
var CFDictionaryRemoveAllValues = lib.CoreFoundation.declare('CFDictionaryRemoveAllValues', ctypes.default_abi, ctypes.void_t, CFMutableDictionaryRef);
//end dictionary functionality

//string functionality
var CFStringCreateWithCharacters = lib.CoreFoundation.declare('CFStringCreateWithCharacters', ctypes.default_abi, CFStringRef, CFAllocatorRef, UniChar.ptr, CFIndex);
var CFStringGetLength = lib.CoreFoundation.declare('CFStringGetLength', ctypes.default_abi, CFIndex, CFStringRef);
//var CFStringGetCharacterAtIndex = lib.CoreFoundation.declare('CFStringGetCharacterAtIndex', ctypes.default_abi, UniChar, CFStringRef, CFIndex); //needed this for michaelrhanson port of `convertCFString` but i couldnt get that working, besides he even says `CFStringGetCharacters` is faster, and philikon did it like that so i went that direction
var CFStringGetCharacters = lib.CoreFoundation.declare('CFStringGetCharacters', ctypes.default_abi, ctypes.void_t, CFStringRef, CFRange, UniChar.ptr);
//end string functionality

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

//start - from https://github.com/michaelrhanson/contact-server/blob/3a92cd50f9b50b2b69e937425c294ed39f503921/contacts_jetpack/lib/main.js#L471
/* noit note: i couldnt get `convertCFString` this to work with philikon's stuff, but then i found his readme
// CFStringGetCharacters would be faster, but it isn't working for some reason
function convertCFString(aString) {
	if (aString && !aString.isNull()) {
		var strLen = CFStringGetLength(aString);
		var targetBuffer = ctypes.jschar.array(strLen)();
		for (var i = 0; i < strLen; i++) {
			targetBuffer[i] = CFStringGetCharacterAtIndex(aString, i);
		}
		var ret = targetBuffer.readString();
		if (ret && ret.length > 0) return ret;
		return null;
	} else {
		return null;
	}
}
*/
function makeCFStr(input) { //input is just a js string so like `var input = 'blah';`
	return CFStringCreateWithCharacters(null, input, input.length);
}
//end - from https://github.com/michaelrhanson/contact-server/blob/3a92cd50f9b50b2b69e937425c294ed39f503921/contacts_jetpack/lib/main.js#L471

//end common declares

var CGSessionCopyCurrentDictionary = lib.CoreGraphics.declare('CGSessionCopyCurrentDictionary', ctypes.default_abi, CFDictionaryRef);

var CGSessionDict = CGSessionCopyCurrentDictionary();
console.log(uneval(CGSessionDict));

var kCGSSessionOnConsoleKey_str = 'kCGSSessionOnConsoleKey';
var kCGSSessionOnConsoleKey = CFStringCreateWithCharacters(null, kCGSSessionOnConsoleKey_str, kCGSSessionOnConsoleKey_str.length); //works // i figured it should be a string because of: https://github.com/JuliaEichler/Mac_OSX_SDKs/blob/392649d7112884481a94b8cd1f601f3a5edae999/MacOSX10.6.sdk/System/Library/Frameworks/ApplicationServices.framework/Versions/A/Frameworks/CoreGraphics.framework/Versions/A/Headers/CGSession.h#L38 here they are making CFSTR of a text string
/*
var kCGSSessionOnConsoleKey_contained = CFDictionaryContainsKey(CGSessionDict, kCGSSessionOnConsoleKey); //works
console.log('kCGSSessionOnConsoleKey_contained:', uneval(kCGSSessionOnConsoleKey_contained));


var kCGSSessionOnConsoleKey_val = ctypes.void_t.ptr();
var rez = CFDictionaryGetValueIfPresent(CGSessionDict, kCGSSessionOnConsoleKey, kCGSSessionOnConsoleKey_val.address());
console.log('rez:', uneval(rez), rez);
CFRelease(kCGSSessionOnConsoleKey); //do release on things made with CFStringCreateWithCharacters per https://github.com/philikon/osxtypes/blob/master/examples/content/iphoto.js#L89

console.log('kCGSSessionOnConsoleKey_val:', uneval(kCGSSessionOnConsoleKey_val));
//trying to unwrap it:
console.log('kCGSSessionOnConsoleKey_val:', uneval(kCGSSessionOnConsoleKey_val), uneval(kCGSSessionOnConsoleKey_val.address().contents), uneval(ctypes.cast(kCGSSessionOnConsoleKey_val, CFStringRef)), uneval(ctypes.cast(kCGSSessionOnConsoleKey_val, ctypes.uintptr_t).value)); //trying to unwrap it, just thinking that is is what `convertCFString` needs

//start - this is not working yet
var kCGSSessionOnConsoleKey_val_str = convertCFString(kCGSSessionOnConsoleKey_val);
//end - this is not working yet
console.log('kCGSSessionOnConsoleKey_val_str:', uneval(kCGSSessionOnConsoleKey_val_str), kCGSSessionOnConsoleKey_val_str);
*/

var kCGSSessionOnConsoleKey_val = CFDictionaryGetValue(CGSessionDict, kCGSSessionOnConsoleKey);
CFRelease(kCGSSessionOnConsoleKey); //do release on things made with CFStringCreateWithCharacters per https://github.com/philikon/osxtypes/blob/master/examples/content/iphoto.js#L89
console.log('kCGSSessionOnConsoleKey_val:', kCGSSessionOnConsoleKey_val, uneval(kCGSSessionOnConsoleKey_val)); //printing `"kCGSSessionOnConsoleKey_val:" CData {  } "ctypes.voidptr_t(ctypes.UInt64("0x7fff7a13b7f0"))"`
if (kCGSSessionOnConsoleKey_val.isNull()) {
	console.log('CFDictionaryGetValue isNull so the key is not present in the dictionary, I am guesing');
}

var kCGSSessionOnConsoleKey_val_str = convertCFString(kCGSSessionOnConsoleKey_val); //throwing `Exception: expected type pointer, got ctypes.voidptr_t(ctypes.UInt64("0x7fff7a13b7f0"))`


for (var l in lib) {
  lib[l].close();
}