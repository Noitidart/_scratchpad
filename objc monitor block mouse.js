Cu.import('resource://gre/modules/ctypes.jsm');
var objc = ctypes.open(ctypes.libraryName('objc'));

var is64bit = ctypes.voidptr_t.size == 4 ? false : true;

// BASIC TYPES
var TYPES = {
	char: ctypes.char,
	ID: ctypes.voidptr_t,
	IMP: ctypes.voidptr_t,
	SEL: ctypes.voidptr_t,
	Class: ctypes.voidptr_t,
	NSEventMask: ctypes.unsigned_long_long,
	NSUInteger: is64bit ? ctypes.unsigned_long : ctypes.unsigned_int,
	NSInteger: is64bit ? ctypes.long: ctypes.int,
	BOOL: ctypes.signed_char
};

// advanced types
TYPES.NSEventType = TYPES.NSUInteger;
TYPES.NSEventMask = TYPES.NSUInteger;

// CONSTANTS
// event magic numbers from https://github.com/shannah/codenameone-avian/blob/84e2a17e99d2ff7db1da4246e833edb84e86f0f0/jdk7u-dev/build/macosx-x86_64/bridge_metadata/AppKit.headers/NSEvent.h#L79
var CONST = {
	NSLeftMouseDown: 1,				// TYPES.NSEventType
	NSLeftMouseUp: 2,				// TYPES.NSEventType
	NSRightMouseDown: 3,			// TYPES.NSEventType
	NSRightMouseUp: 4,				// TYPES.NSEventType
	NSMouseMoved: 5,				// TYPES.NSEventType
	NSLeftMouseDragged: 6,			// TYPES.NSEventType
	NSRightMouseDragged: 7,			// TYPES.NSEventType
	NSMouseEntered: 8,				// TYPES.NSEventType
	NSMouseExited: 9,				// TYPES.NSEventType
	NSKeyDown: 10,					// TYPES.NSEventType
	NSKeyUp: 11,					// TYPES.NSEventType
	NSFlagsChanged: 12,				// TYPES.NSEventType
	NSAppKitDefined: 13,			// TYPES.NSEventType
	NSSystemDefined: 14,			// TYPES.NSEventType
	NSApplicationDefined: 15,		// TYPES.NSEventType
	NSPeriodic: 16,					// TYPES.NSEventType
	NSCursorUpdate: 17,				// TYPES.NSEventType
	NSScrollWheel: 22,				// TYPES.NSEventType
	NSTabletPoint: 23,				// TYPES.NSEventType
	NSTabletProximity: 24,			// TYPES.NSEventType
	NSOtherMouseDown: 25,			// TYPES.NSEventType
	NSOtherMouseUp: 26,				// TYPES.NSEventType
	NSOtherMouseDragged: 27,		// TYPES.NSEventType
	NSEventTypeGesture: 29,			// TYPES.NSEventType
	NSEventTypeMagnify: 30,			// TYPES.NSEventType
	NSEventTypeSwipe: 31,			// TYPES.NSEventType
	NSEventTypeRotate: 18,			// TYPES.NSEventType
	NSEventTypeBeginGesture: 19,	// TYPES.NSEventType
	NSEventTypeEndGesture: 20,		// TYPES.NSEventType
	NSEventTypeSmartMagnify: 32,	// TYPES.NSEventType
	NSEventTypeQuickLook: 33,		// TYPES.NSEventType
	NSEventTypePressure: 34,		// TYPES.NSEventType
	NSUIntegerMax: TYPES.NSUInteger(is64bit ? '0xffffffff' : '0xffff')		// TYPES.NSUInteger
};

// the NSEventMask stuff is wrong in docs, the docs say here: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/ApplicationKit/Classes/NSEvent_Class/index.html#//apple_ref/doc/constant_group/NSEventMaskFromType
	// the actual source code says here: /System/Library/Frameworks/AppKit.framework/Versions/C/Headers/NSEvent.h   pasted the part here thanks to @arai - https://gist.github.com/Noitidart/9470ec02bd252e2ae7eb
	// see chat with @arai and @capella on Aug 29 2015
CONST.NSLeftMouseDownMask = 1 << CONST.NSLeftMouseDown;
CONST.NSLeftMouseUpMask = 1 << CONST.NSLeftMouseUp;
CONST.NSRightMouseDownMask = 1 << CONST.NSRightMouseDown;
CONST.NSRightMouseUpMask = 1 << CONST.NSRightMouseUp;
CONST.NSMouseMovedMask = 1 << CONST.NSMouseMoved;
CONST.NSLeftMouseDraggedMask = 1 << CONST.NSLeftMouseDragged;
CONST.NSRightMouseDraggedMask = 1 << CONST.NSRightMouseDragged;
CONST.NSMouseEnteredMask = 1 << CONST.NSMouseEntered;
CONST.NSMouseExitedMask = 1 << CONST.NSMouseExited;
CONST.NSKeyDownMask = 1 << CONST.NSKeyDown;
CONST.NSKeyUpMask = 1 << CONST.NSKeyUp;
CONST.NSFlagsChangedMask = 1 << CONST.NSFlagsChanged;
CONST.NSAppKitDefinedMask = 1 << CONST.NSAppKitDefined;
CONST.NSSystemDefinedMask = 1 << CONST.NSSystemDefined;
CONST.NSApplicationDefinedMask = 1 << CONST.NSApplicationDefined;
CONST.NSPeriodicMask = 1 << CONST.NSPeriodic;
CONST.NSCursorUpdateMask = 1 << CONST.NSCursorUpdate;
CONST.NSScrollWheelMask = 1 << CONST.NSScrollWheel;
CONST.NSTabletPointMask = 1 << CONST.NSTabletPoint;
CONST.NSTabletProximityMask = 1 << CONST.NSTabletProximity;
CONST.NSOtherMouseDownMask = 1 << CONST.NSOtherMouseDown;
CONST.NSOtherMouseUpMask = 1 << CONST.NSOtherMouseUp;
CONST.NSOtherMouseDraggedMask = 1 << CONST.NSOtherMouseDragged;
CONST.NSEventMaskGesture = 1 << CONST.NSEventTypeGesture;
CONST.NSEventMaskMagnify = 1 << CONST.NSEventTypeMagnify;
CONST.NSEventMaskSwipe = 1 << CONST.NSEventTypeSwipe;	// 1U << NSEventTypeSwipe
CONST.NSEventMaskRotate = 1 << CONST.NSEventTypeRotate;
CONST.NSEventMaskBeginGesture = 1 << CONST.NSEventTypeBeginGesture;
CONST.NSEventMaskEndGesture = 1 << CONST.NSEventTypeEndGesture;
CONST.NSEventMaskSmartMagnify = 1 << CONST.NSEventTypeSmartMagnify;	// 1ULL << NSEventTypeSmartMagnify;
CONST.NSEventMaskPressure = 1 << CONST.NSEventTypePressure;	// 1ULL << NSEventTypePressure
CONST.NSAnyEventMask = CONST.NSUIntegerMax; //0xffffffffU

// COMMON FUNCTIONS
var objc_getClass = objc.declare('objc_getClass', ctypes.default_abi, TYPES.ID, TYPES.char.ptr);
var objc_msgSend = objc.declare('objc_msgSend', ctypes.default_abi, TYPES.ID, TYPES.ID, TYPES.SEL, '...');
var sel_registerName = objc.declare('sel_registerName', ctypes.default_abi, TYPES.SEL, TYPES.char.ptr);

// COMMON SELECTORS
var release = sel_registerName('release');

// my personal globals for this code
var releaseThese = [];

function shutdown() {
	//put code here to unswizzle it
	for (var i=0; i<releaseThese.length; i++) {
		objc_msgSend(releaseThese[i], release);
	}
	objc.close();
};

var myHandler_js;
var myHandler_c;
function main() {

	// current_application = [NSRunningApplication currentApplciation];
	var NSEvent = objc_getClass('NSEvent');
	var addLocalMonitorForEventsMatchingMask = sel_registerName('addLocalMonitorForEventsMatchingMask:handler:');

	myHandler_js = function(c_arg1__self, c_arg2__sel) {
		console.log('in myHandler', c_arg2__sel.toString());
		return TYPES.ID(0);
	};
	var IMP_for_imageNamed = ctypes.FunctionType(ctypes.default_abi, TYPES.ID, [TYPES.ID, TYPES.ID]);
	myHandler_c = IMP_for_imageNamed.ptr(myHandler_js);
	
	var rez_add = objc_msgSend(NSEvent, addLocalMonitorForEventsMatchingMask, TYPES.NSEventMask(CONST.NSKeyDownMask), myHandler_c);
	console.log('rez_add:', rez_add, rez_add.toString());
}

try {
	main();
} catch(ex) {
	console.error('Exception Occoured:', ex);
} finally {
	shutdown();
}