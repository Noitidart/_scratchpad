Cu.import('resource://gre/modules/ctypes.jsm');

var launchd = ctypes.open('/usr/lib/system/liblaunch.dylib'/*ctypes.libraryName('launch')*/); // http://www.opensource.apple.com/source/launchd/launchd-328/launchd/src/launch.h

// BASIC TYPES
var TYPES = {
	bool: ctypes.bool,
	char: ctypes.char,
	int: ctypes.int,
	launch_data_t: ctypes.voidptr_t,
	launch_data_type_t: ctypes.short,
	longlong: ctypes.long_long,
	size_t: ctypes.size_t,
	void: ctypes.void_t
};

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
	LAUNCH_KEY_GETJOB: 'GetJob',
	
	NULL: ctypes.cast(ctypes.uint64_t(0x0), TYPES.launch_data_t)
};

// FUNCTIONS
var launch_data_alloc = launchd.declare('launch_data_alloc', ctypes.default_abi, TYPES.launch_data_t, TYPES.launch_data_type_t);
var launch_data_dict_insert = launchd.declare('launch_data_dict_insert', ctypes.default_abi, TYPES.bool, TYPES.launch_data_t, TYPES.launch_data_t, TYPES.char.ptr);
var launch_data_dict_lookup = launchd.declare('launch_data_dict_lookup', ctypes.default_abi, TYPES.launch_data_t, TYPES.launch_data_t, TYPES.char.ptr);
var launch_data_free = launchd.declare('launch_data_free', ctypes.default_abi, TYPES.void, TYPES.launch_data_t);
var launch_data_get_errno = launchd.declare('launch_data_get_errno', ctypes.default_abi, TYPES.int, TYPES.launch_data_t);
var launch_data_get_integer = launchd.declare('launch_data_get_integer', ctypes.default_abi, TYPES.longlong, TYPES.launch_data_t);
var launch_data_get_type = launchd.declare('launch_data_get_type', ctypes.default_abi, TYPES.launch_data_type_t, TYPES.launch_data_t);
var launch_data_new_string = launchd.declare('launch_data_new_string', ctypes.default_abi, TYPES.launch_data_t, TYPES.char.ptr);
var launch_msg = launchd.declare('launch_msg', ctypes.default_abi, TYPES.launch_data_t, TYPES.launch_data_t);

// start - helper functions

// MessageForJob sends a single message to launchd with a simple dictionary
// mapping |operation| to |job_label|, and returns the result of calling
// launch_msg to send that message. On failure, returns NULL. The caller
// assumes ownership of the returned launch_data_t object.
function MessageForJob(job_label/*TYPES.string.address()*/, operation /*TYPES.char.ptr*/) {
	// launch_data_alloc returns something that needs to be freed.	
	var message = launch_data_alloc(CONSTS.LAUNCH_DATA_DICTIONARY);
	console.info('message:', message, message.toString(), uneval(message));
	
	if (message.isNull()) {
		console.warn('message.isNull so returning null');
		return CONSTS.NULL;
	}
	
	// launch_data_new_string returns something that needs to be freed, but
	// the dictionary will assume ownership when launch_data_dict_insert is
	// called, so put it in a scoper and .release() it when given to the
	// dictionary.
	var job_label_launchd = launch_data_new_string(job_label);
	console.info('job_label_launchd:', job_label_launchd, job_label_launchd.toString(), uneval(job_label_launchd));
	if (job_label_launchd.isNull()) {
		console.warn('job_label_launchd.isNull so returning null');
		return CONSTS.NULL;
	}
	
	var rez_launch_data_dict_insert = launch_data_dict_insert(message, job_label_launchd/*.release()*/, operation);
	console.info('rez_launch_data_dict_insert:', rez_launch_data_dict_insert, rez_launch_data_dict_insert.toString(), uneval(rez_launch_data_dict_insert));
	if (!rez_launch_data_dict_insert) {
		console.warn('rez_launch_data_dict_insert.isNull so returning null');
		return CONSTS.NULL;
	}
	
	var rez_launch_msg = launch_msg(message);
	console.info('rez_launch_msg:', rez_launch_msg, rez_launch_msg.toString(), uneval(rez_launch_msg));
	
	return rez_launch_msg;
}

function PIDForJob(job_label/*TYPES.string.address()*/) {
	var response = MessageForJob(job_label, CONSTS.LAUNCH_KEY_GETJOB);
	console.info('response:', response, response.toString(), uneval(response));
	if (!response) {
		console.warn('returning -1 due to `!response`');
		return -1;
	}
	
	var response_type = launch_data_get_type(response);
	console.info('response_type:', response_type, response_type.toString(), uneval(response_type));
	if (response_type != CONSTS.LAUNCH_DATA_DICTIONARY) {
		if (response_type == CONSTS.LAUNCH_DATA_ERRNO) {
			var rez_launch_data_get_errno = launch_data_get_errno(response);
			console.error('PIDForJob: error ', rez_launch_data_get_errno, rez_launch_data_get_errno.toString(), uneval(rez_launch_data_get_errno));
		} else {
			console.error('PIDForJob: expected dictionary, got ', response_type, response_type.toString(), uneval(response_type));;
		}
		return -1;
	}
	
	var pid_data = launch_data_dict_lookup(response, CONSTS.LAUNCH_JOBKEY_PID);
	console.info('pid_data:', pid_data, pid_data.toString(), uneval(pid_data));
	if (pid_data.isNull()) {
		console.warn('pid_data is null so returning 0');
		return 0;
	}
	
	var rez_launch_data_get_type = launch_data_get_type(pid_data);
	console.info('rez_launch_data_get_type:', rez_launch_data_get_type, rez_launch_data_get_type.toString(), uneval(rez_launch_data_get_type));
	if (rez_launch_data_get_type != CONSTS.LAUNCH_DATA_INTEGER) {
		console.error('PIDForJob: expected integer');
		return -1;
	}
	
	var rez_launch_data_get_integer = launch_data_get_integer(pid_data);
	console.info('rez_launch_data_get_integer:', rez_launch_data_get_integer, rez_launch_data_get_integer.toString(), uneval(rez_launch_data_get_integer));
	return rez_launch_data_get_integer;
}

// end - helper functions

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