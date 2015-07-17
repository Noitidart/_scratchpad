Cu.import('resource://gre/modules/ctypes.jsm');
// start - build dirent sttruct
	var createStructTypeBasedOnOffsets = function(structName, arrFields) {
		// remove fields for which offset is undefined, this means that this OS does not have this field
		for (var i=0; i<arrFields.length; i++) {
			if (arrFields[i][2] === undefined) {
				console.warn('removing field named ' + arrFields[i][0])
				arrFields.splice(i, 1);
				i--;
			}
		}
		
		// sort fields in asc order of offset
		arrFields.sort(function(a, b) {
			return a[2] > b[2]; // sorts ascending
		});
		
		// add padding of ctypes.uint8_t in between fields
		var paddingFieldCnt = 0;
		var cOffset = 0;
		for (var i=0; i<arrFields.length; i++) {
			var nextOffset = arrFields[i][2];
			console.log('cOffset:', cOffset, 'nextOffset:', nextOffset);
			if (nextOffset == cOffset) {
				// this field should be here, so go on to next
			} else if (nextOffset > cOffset) {
				console.log('nextOffset is greater then cOffset');
				var paddingFieldName = 'padding_' + paddingFieldCnt;
				arrFields.splice(i, 0, [paddingFieldName, ctypes.ArrayType(ctypes.uint8_t, nextOffset-cOffset), cOffset]);
				paddingFieldCnt++;
			}
			cOffset += arrFields[i][1].size;
		}
		console.log('total size:', cOffset);
		console.log('arrFields:', arrFields.join('|||').toString());
		
		//return ctypes.StructType(structName, arrFields);
	}

	var OSFILE_OFFSETOF_DIRENT_D_INO = 0; // im guessing this is always at 0, by looking at a bunch of places and d_ino was always first
	var dirent_extra_size = 0;
	if (OS.Constants.libc.OSFILE_SIZEOF_DIRENT_D_NAME < 8) {
		// d_name is defined like "char d_name[1];" on some platforms (e.g. Solaris), we need to give it more size for our structure.
		dirent_extra_size = 255;
	}
	this.dirent = createStructTypeBasedOnOffsets('dirent', [
		['d_ino', this.ino_t, OSFILE_OFFSETOF_DIRENT_D_INO],
		['d_name', this.char.array(OS.Constants.libc.OSFILE_SIZEOF_DIRENT_D_NAME + dirent_extra_size), OS.Constants.libc.OSFILE_OFFSETOF_DIRENT_D_NAME],
		['d_type', this.unsigned_char, OS.Constants.libc.OSFILE_OFFSETOF_DIRENT_D_TYPE]
	]);