Cu.import('resource://gre/modules/osfile.jsm');
Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

/** START - edit these **/
var jsStr_imagePath = OS.Path.join(OS.Constants.Path.desktopDir, 'beta.icns');
/** END - edit these **/

// types
var CLASS = ctypes.voidptr_t;
var ID = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var BOOL = ctypes.signed_char;
var NSUInteger = ctypes.unsigned_long;
var VOID = ctypes.void_t;

// advanced types
var IMP = ctypes.FunctionType(ctypes.default_abi, ID, [ID, SEL, '...']).ptr;

var objc_method = ctypes.StructType('objc_method', [
  { 'method_name': SEL },
  { 'method_types': ctypes.char.ptr },
  { 'method_imp': IMP },
]);
var METHOD = objc_method.ptr;

// constants
var NIL = ctypes.voidptr_t(0);

//common functions
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, ID, ctypes.char.ptr);
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, SEL, ctypes.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, ID, ID, SEL, '...');
var method_setImplementation = objc.declare('method_setImplementation', ctypes.default_abi, IMP, METHOD, IMP);
var class_getInstanceMethod = objc.declare('class_getInstanceMethod', ctypes.default_abi, METHOD, CLASS, SEL);
var method_getImplementation = objc.declare('method_getImplementation', ctypes.default_abi, IMP, METHOD);
var method_exchangeImplementations = objc.declare('method_exchangeImplementations', ctypes.default_abi, VOID, METHOD, METHOD);
var release = sel_registerName('release');

var shutdownFunc;
var myIcon;

var promise_makeMyNSImage = OS.File.read(jsStr_imagePath);

promise_makeMyNSImage.then(
	function(iconData) {
		// NOTE: iconData is Uint8Array
		var length = NSUInteger(iconData.length);
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
		
		var NSImage = objc_getClass('NSImage');
		var imageNamed = sel_registerName('imageNamed');
		var UTF8String = _sel_registerName('UTF8String');
		
		var js_swizzled_imageNamed = function(c_arg1__self, c_arg2__sel, objc_arg1__NSStringPtr) {
			console.log('SWIZZLED: imageNamed called');

			var tt_read = objc_msgSend(objc_arg1__NSStringPtr, UTF8String);
			console.info('tt_read:', tt_read, tt_read.toString(), uneval(tt_read), tt_read.isNull());
			var tt_read_casted = ctypes.cast(tt_read, ctypes.char.ptr);
			console.info('tt_read_casted:', tt_read_casted, tt_read_casted.toString(), uneval(tt_read_casted), tt_read_casted.isNull());
			var tt_read_jsStr = tt_read_casted.readStringReplaceMalformed();
			console.info('tt_read_jsStr:', tt_read_jsStr, tt_read_jsStr.toString(), uneval(tt_read_jsStr)); // TypeError: tt_read_jsStr.isNull is not a function 
			if (tt_read_jsStr == 'NSApplication') {
				return myIcon;
			} else {
				var icon = objc_msgSend(NSImage, imageNamed, objc_arg1__NSStringPtr);
				return icon;
			}
		}

		var swizzled_imageNamed = IMP.ptr(js_swizzled_imageNamed);
		
		var originalMethod = class_getInstanceMethod(NSImage, imageNamed);
		console.info('originalMethod:', originalMethod, originalMethod.toString(), uneval(originalMethod));
		// var alternateMethod = class_getInstanceMethod(alternateClass, alternateSelector);
		// console.info('alternateMethod:', alternateMethod, alternateMethod.toString(), uneval(alternateMethod));
		// var imp_of_alternateMethod = method_getImplementation(alternateMethod)
		// console.info('imp_of_alternateMethod:', imp_of_alternateMethod, imp_of_alternateMethod.toString(), uneval(imp_of_alternateMethod));
		
		// var rez = method_setImplementation(originalMethod, imp_of_alternateMethod);
		// console.info('rez:', rez, rez.toString(), uneval(rez));
		var alternateMethod = class_getInstanceMethod(NSImage, imageNamed);
		console.info('alternateMethod:', alternateMethod, alternateMethod.toString(), uneval(alternateMethod));
		
		var rez = method_exchangeImplementations(originalMethod, alternateMethod);
		// rez is void
		
		shutdownFunc = function() {
			//put code here to unswizzle it
			objc_msgSend(myIcon, release);
			objc.close();
		};

		console.log('SUCCESFULLY SWIZZLED');
	},
	function(aReason) {
	  var rejObj = {nameOfRejector:'promise_makeMyNSImage', aReason: aReason)};
	  console.warn(rejObj);
	  throw rejObj;
	}
).catch(function(aCaught) {
	if (myIcon) {
		objc_msgSend(myIcon, release);
	}
	objc.close();
	console.error('promise_makeMyNSImage Catch:', aCaught);
});