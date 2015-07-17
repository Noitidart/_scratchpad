Cu.import('resource://gre/modules/ctypes.jsm');
// http://www.opensource.apple.com/source/launchd/launchd-328/launchd/src/launch.h
var launchd = ctypes.open(ctypes.libraryName('launch'));

// BASIC TYPES
var TYPES = {
  bool: ctypes.bool,
  launch_data_t: ctypes.voidptr_t,
  launch_data_type_t: ctypes.short,
  siez_t: ctypes.size_t
};

var BOOL = ctypes.signed_char;
var CHAR = ctypes.char;
var ID = ctypes.voidptr_t;
var SEL = ctypes.voidptr_t;
var VOID = ctypes.void_t;

// CONSTANTS
var CONSTS = {
	LAUNCH_DATA_DICTIONARY: 1,
	LAUNCH_DATA_ARRAY: 2,
	LAUNCH_DATA_FD: 3,
	LAUNCH_DATA_INTEGER: 4,
	LAUNCH_DATA_REAL: 5,
	LAUNCH_DATA_BOOL: 6,
	LAUNCH_DATA_STRING: 7,
	LAUNCH_DATA_OPAQUE: 8,
	LAUNCH_DATA_ERRNO: 9,
	LAUNCH_DATA_MACHPORT: 10,
	
	LAUNCH_JOBKEY_PID: 'PID',
	LAUNCH_KEY_GETJOB: 'GetJob'
};
var NIL_ID = ctypes.cast(ctypes.uint64_t(0), ID);
var YES = BOOL(1);
var NO = BOOL(0);

// FUNCTIONS
var launch_data_alloc = launchd.declare('launch_data_alloc', ctypes.default_abi, )
var launch_data_dict_insert = launchd.declare('launch_data_dict_insert', ctypes.default_abi, )
var launch_data_dict_lookup = launchd.declare('launch_data_dict_lookup', ctypes.default_abi, )
var launch_data_free = launchd.declare('launch_data_free', ctypes.default_abi, )
var launch_data_get_errno = launchd.declare('launch_data_get_errno', ctypes.default_abi, )
var launch_data_get_type = launchd.declare('launch_data_get_type', ctypes.default_abi, )
var launch_data_new_string = launchd.declare('launch_data_new_string', ctypes.default_abi, )
var launch_msg = launchd.declare('launch_msg', ctypes.default_abi, )


// COMMON SELECTORS
var alloc = sel_registerName('alloc');
var init = sel_registerName('init');
var release = sel_registerName('release');

var shutdown = function() {
    
    launchd.close();

    console.log('succesfully shutdown');
}

// my globals:


function main() {


}

try {
    main();
} catch (ex) {
    console.error('Error Occured:', ex);
} finally {
    shutdown();
}