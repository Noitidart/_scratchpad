Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
var jsStr_imagePath = OS.Path.join(OS.Constants.Path.desktopDir, 'ff-logos', 'beta48.png');
/** END - edit these **/

// types
var CHAR = ctypes.char;
var CLASS = ctypes.voidptr_t;
var ID = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var BOOL = ctypes.signed_char;
var NSUINTEGER = ctypes.unsigned_long;
var SIZE_T = ctypes.size_t;
var VOID = ctypes.void_t;

// advanced types
var IMP = ctypes.FunctionType(ctypes.default_abi, ID, [ID, SEL, ID]).ptr;  //repalced variadic with ID as its specific to my use otherwise doing class_addMethod throws error saying expected pointer blah blah //ctypes.FunctionType(ctypes.default_abi, ID, [ID, SEL, '...']).ptr;

var objc_method = ctypes.StructType('objc_method', [
  { 'method_name': SEL },
  { 'method_types': ctypes.char.ptr },
  { 'method_imp': IMP },
]);
var METHOD = objc_method.ptr;

// constants
var NIL = ctypes.voidptr_t(0);

//common functions
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, ID, CHAR.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, CHAR.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, ID, ID, SEL, '...');
var method_setImplementation = objc.declare('method_setImplementation', ctypes.default_abi, IMP, METHOD, IMP);
var class_getInstanceMethod = objc.declare('class_getInstanceMethod', ctypes.default_abi, METHOD, CLASS, SEL);
var method_getImplementation = objc.declare('method_getImplementation', ctypes.default_abi, IMP, METHOD);
var method_exchangeImplementations = objc.declare('method_exchangeImplementations', ctypes.default_abi, VOID, METHOD, METHOD);
var objc_disposeClassPair = objc.declare('objc_disposeClassPair', ctypes.default_abi, VOID, CLASS);
var objc_allocateClassPair = objc.declare('objc_allocateClassPair', ctypes.default_abi, CLASS, CLASS, CHAR.ptr, SIZE_T);
var class_addMethod = objc.declare('class_addMethod', ctypes.default_abi, BOOL, CLASS, SEL, IMP, CHAR.ptr);
var objc_registerClassPair = objc.declare('objc_registerClassPair', ctypes.default_abi, VOID, CLASS);
var class_getClassMethod = objc.declare('class_getClassMethod', ctypes.default_abi, METHOD, CLASS, SEL);
// COMMON SELECTORS
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

// my globals
var myIcon;
var instance__class_NoitSwizzler;
var class_NoitSwizzler;

function shutdown() {
	//put code here to unswizzle it
	if (myIcon) {
		objc_msgSend(myIcon, release);
	}
	
	if (instance__class_NoitSwizzler) {
		objc_msgSend(instance__class_NoitSwizzler, release);
	}
	
	if (class_NoitSwizzler) {
		objc_disposeClassPair(class_NoitSwizzler);
	}
	objc.close();
};

var promise_makeMyNSImage = OS.File.read(jsStr_imagePath);

promise_makeMyNSImage.then(
	function(iconData) {
		// NOTE: iconData is Uint8Array
		var length = NSUINTEGER(iconData.length);
		var bytes = ctypes.uint8_t.array()(iconData);

		// data = [NSData dataWithBytes: bytes length: length];
		var NSData = objc_getClass('NSData');
		var dataWithBytes_length = sel_registerName('dataWithBytes:length:');
		var data = objc_msgSend(NSData, dataWithBytes_length, bytes, length);

		// myIcon = [[NSImage alloc] initWithData: data];
		var NSImage = objc_getClass('NSImage');
		var initWithData = sel_registerName('initWithData:');
		myIcon = objc_msgSend(objc_msgSend(NSImage, alloc), initWithData, data);

		if (myIcon.isNull()) {
			throw new Error('Image file is corrupted. Will not continue to swizzle.');
		}
		
		var imageNamed = sel_registerName('imageNamed:');
		var UTF8String = sel_registerName('UTF8String');
		
		var classs = sel_registerName('class');
		var js_swizzled_imageNamed = function(c_arg1__self, c_arg2__sel, objc_arg1__NSStringPtr) {
			console.log('SWIZZLED: imageNamed called');

			var tt_read = objc_msgSend(objc_arg1__NSStringPtr, UTF8String);
			console.info('tt_read:', tt_read, tt_read.toString(), uneval(tt_read), tt_read.isNull());
			var tt_read_casted = ctypes.cast(tt_read, CHAR.ptr);
			console.info('tt_read_casted:', tt_read_casted, tt_read_casted.toString(), uneval(tt_read_casted), tt_read_casted.isNull());
			var tt_read_jsStr = tt_read_casted.readStringReplaceMalformed();
			console.info('tt_read_jsStr:', tt_read_jsStr, tt_read_jsStr.toString(), uneval(tt_read_jsStr)); // TypeError: tt_read_jsStr.isNull is not a function 
			if (tt_read_jsStr == 'NSApplication') {
				// do my hook
				return myIcon;
			} else {
				// do normal
				var icon = objc_msgSend(NSImage, imageNamed, objc_arg1__NSStringPtr);
				return icon;
			}
		}

		//var IMP_specific = ctypes.FunctionType(ctypes.default_abi, ID, [ID, SEL, ID]).ptr; // return of ID is really NSIMAGE and third arg is NSSTRING
		var swizzled_imageNamed = IMP(js_swizzled_imageNamed); //if use IMP_specific and have variadic IMP defined above, it keeps throwing expecting pointer blah blah. and it wouldnt accept me putting in variadic on this line if do use varidic, on this line it throws `Can't delcare a variadic callback function`
		
		// add swizzled_imageNamed to NSImage
		var selector_swizzled_imageNamed = sel_registerName('swizzled_imageNamed:');
		var rez_class_addMethod = class_addMethod(NSImage, selector_swizzled_imageNamed, swizzled_imageNamed, '@@:@'); // because return of callback is NSImage so `ctypes.voidptr_t`, first argument is c_arg1__self which is `id` and c_arg2__id sel `SEL` and objc_arg1__NSStringPtr is `voidptr_t`
		console.info('rez_class_addMethod:', rez_class_addMethod, rez_class_addMethod.toString(), uneval(rez_class_addMethod));
		if (rez_class_addMethod != 1) {
			throw new Error('rez_class_addMethod is not 1, so class_addMethod failed');
		}
		
		var originalMethod = class_getClassMethod(NSImage, imageNamed); //verified i dont need to do this //may need to use `NSImageClass` instead of `NSImage`
		console.info('originalMethod:', originalMethod, originalMethod.toString(), uneval(originalMethod));		
		var alternateMethod = class_getClassMethod(NSImage, selector_swizzled_imageNamed);
		console.info('alternateMethod:', alternateMethod, alternateMethod.toString(), uneval(alternateMethod));
		
		//results of class_getClassMethod on both:

	
		//results of class_getInstanceMethod on both:

	
		//var rez = method_exchangeImplementations(originalMethod, alternateMethod);
		// rez is void
		console.log('SUCCESFULLY SWIZZLED');
	},
	function(aReason) {
	  var rejObj = {nameOfRejector:'promise_makeMyNSImage', aReason: aReason};
	  console.warn(rejObj);
	  throw rejObj;
	}
).catch(function(aCaught) {
	shutdown();
	console.error('promise_makeMyNSImage Catch:', aCaught);
});