function jscEqual(obj1, obj2) {
	// ctypes numbers equal
	// compares obj1 and obj2
	// if equal returns true, else returns false
	
	// check if equal first
	var str1 = obj1;
	var str2 = obj2;
	
	var setToDeepest = function(obj) {
		while (isNaN(obj) && ('contents' in obj || 'value' in obj)) {
			if ('contents' in obj) {
				obj = obj.contents;
			} else if ('value' in obj) {
				obj = obj.value
			} else {
				throw new Error('huh, isNaN, but no contents or value in obj', 'obj:', obj);
			}
		}
		if (!isNaN(obj)) {
			obj = obj.toString();
		}
		
		return obj;
	}
	
	var str1 = setToDeepest(str1); //cuz apparently its not passing by reference
	var str2 = setToDeepest(str2); //cuz apparently its not passing by reference
	
	if (str1 == str2) {
		return true;
	} else {
		return false;
	}
}