function HashString(aStr, aLength) {
	// moz win32 hash function
	
	if (aLength) {
		console.error('NS_ERROR_NOT_IMPLEMENTED');
		throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
	} else {
		return HashUntilZero(aStr);
	}	
}

function HashUntilZero(aStr) {
	var hash = 0;
	//for (T c; (c = *aStr); aStr++) {
	for (var c=0; c<aStr.length; aStr++) {
		hash = AddToHash(hash, String.charCodeAt(aStr[c]));
	}
	
	return hash;
}

function AddToHash(aHash, aA) {
	//return detail::AddU32ToHash(aHash, aA);
	//return AddU32ToHash(aHash, aA);
	
	//return detail::AddUintptrToHash<sizeof(uintptr_t)>(aHash, aA);
	return AddUintptrToHash(aHash, aA);
}

function AddUintptrToHash(aHash, aValue) {
	//return AddU32ToHash(aHash, static_cast<uint32_t>(aValue));
	return AddU32ToHash(aHash, aValue);
}

function AddU32ToHash(aHash, aValue) {
	var kGoldenRatioU32 = 0x9E3779B9;
	return (kGoldenRatioU32 * Math.pow(RotateBitsLeft32(aHash, 5), aValue));
}

function RotateBitsLeft32(aValue, aBits) {
	// MOZ_ASSERT(aBits < 32);
	return (aValue << aBits) | (aValue >> (32 - aBits));
}

console.log(HashString('a'));