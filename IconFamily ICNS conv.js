Cu.import('resource://gre/modules/ctypes.jsm')

var mactypesInit = function() {	
	// BASIC TYPES (ones that arent equal to something predefined by me)
	this.Ptr = ctypes.char.ptr;
	this.SInt16 = ctypes.short;
	this.SInt32 = ctypes.long;
	this.Size = ctypes.long;
	this.UInt32 = ctypes.unsigned_long;
	
	// ADVANCED TYPES
	this.OSErr = this.SInt16;
	this.Handle = this.Ptr.ptr;
	
	this.FourCharCode = this.UInt32;
	this.OSType = this.FourCharCode;
	this.IconFamilyElement = new ctypes.StructType("IconFamilyElement", [
		{ elementType: this.OSType },
		{ elementSize: this.SInt32 },
		{ elementData: ctypes.unsigned_char.array(1) }
	]);
	this.IconFamilyResource = new ctypes.StructType("IconFamilyResource", [
		{ resourceType: this.OSType },
		{ resourceSize: this.SInt32 },
		{ elements: this.IconFamilyElement.array(1) }
	]);
	this.IconFamilyPtr = this.IconFamilyResource.ptr;
	this.IconFamilyHandle = this.IconFamilyPtr.ptr;
	
	// CONSTANTS
    this.kIconServices16PixelDataARGB = 1768108084;
    this.kIconServices32PixelDataARGB = 1768108085;
    this.kIconServices48PixelDataARGB = 1768108086;
    this.kIconServices128PixelDataARGB = 1768108087;
    this.kIconServices256PixelDataARGB = 1768108088;
    this.kIconServices512PixelDataARGB = 1768108089;
	
}
var ostypes = new mactypesInit();

// start - skeleton, shouldn't have to edit
var lib = {};
function _lib(path) {
	//ensures path is in lib, if its in lib then its open, if its not then it adds it to lib and opens it. returns lib
	//path is path to open library
	//returns lib so can use straight away

	if (!(path in lib)) {
		//need to open the library
		//default it opens the path, but some things are special like libc in mac is different then linux or like x11 needs to be located based on linux version
		switch (path) {
			default:
				try {
					lib[path] = ctypes.open(path);
				} catch (e) {
					console.error('Integration Level 1: Could not get open path:', path, 'e:' + e);
					throw new Error('Integration Level 1: Could not get open path:"' + path + '" e: "' + e + '"');
				}
		}
	}
	return lib[path];
}

var dec = {};
function _dec(declaration) { // it means ensureDeclared and return declare. if its not declared it declares it. else it returns the previously declared.
	if (!(declaration in dec)) {
		dec[declaration] = preDec[declaration](); //if declaration is not in preDec then dev messed up
	}
	return dec[declaration];
}
// end - skeleton, shouldn't have to edit

// start - predefine your declares here
var preDec = { //stands for pre-declare (so its just lazy stuff) //this must be pre-populated by dev // do it alphabateized by key so its ez to look through
	DisposeHandle: function() {
		return _lib(lib_MacMemory).declare('DisposeHandle', ctypes.default_abi,
			ctypes.void_t,
			ostypes.Handle
		);
	},
	GetHandleSize: function() {
		return _lib(lib_MacMemory).declare('GetHandleSize', ctypes.default_abi,
			ostypes.Size,
			ostypes.Handle
		);
	},
	NewHandle: function() {
		return _lib(lib_MacMemory).declare('NewHandle', ctypes.default_abi,
			ostypes.Handle,
			ostypes.Size
		);
	},
	SetIconFamilyData: function() {
		return _lib(lib_HIServices).declare('SetIconFamilyData', ctypes.default_abi,
			ostypes.OSErr,					// return
			ostypes.IconFamilyHandle,		// 
			ostypes.OSType,					//
			ostypes.Handle					// 
		);
	}
}
// end - predefine your declares here

// start - helper functions

// end - helper functions

function shutdown() {
	// do in here what you want to do before shutdown
	
	for (var l in lib) {
		lib[l].close();
	}
}

// my globals
var lib_HIServices = '/System/Library/Frameworks/ApplicationServices.framework/Frameworks/HIServices.framework/HIServices'; // /System/Library/Frameworks/ApplicationServices.framework/Frameworks/HIServices.framework/Headers/Icons.h
var lib_MacMemory = '/System/Library/Frameworks/CoreServices.framework/Frameworks/CarbonCore.framework/CarbonCore'; // /System/Library/Frameworks/CoreServices.framework/Frameworks/CarbonCore.framework/Headers/MacMemory.h

function main() {
	//do code here
	var iconFamily = _dec('NewHandle')(0);
	console.info('iconFamily:', iconFamily, iconFamily.toString, uneval(iconFamily));

	var imgSizes = [16, 32, 48, 128, 256, 512];
	for (var i=0; i<imgSizes.length; i++) {
		var handle = NewHandle(imgSizes[i] * imgSizes[i] * 4);
		// fill handle with image data; buffer pointer is *handle
		
		var rez_SetIconFamilyData = _dec('SetIconFamilyData')(iconFamily, ostypes['kIconServices' + imgSizes[i] + 'PixelDataARGB'], handle);
		console.info('rez_SetIconFamilyData:', rez_SetIconFamilyData, rez_SetIconFamilyData.toString(), uneval(rez_SetIconFamilyData));
		
		var rez_DisposeHandle = _dec('DisposeHandle')(handle); // returns void, console.info on it should be VOID
		console.info('handle rez_DisposeHandle:', rez_DisposeHandle, rez_DisposeHandle.toString(), uneval(rez_DisposeHandle));
	}
	
	var rez_DisposeHandle = _dec('DisposeHandle')(iconFamily); // returns void, console.info on it should be VOID
	console.info('iconFamily rez_DisposeHandle:', rez_DisposeHandle, rez_DisposeHandle.toString(), uneval(rez_DisposeHandle));
}

try {
	main();
} catch(ex) {
	console.error('caught:', ex);
} finally {
	shutdown();
}