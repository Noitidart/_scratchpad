var trans = Cc["@mozilla.org/widget/transferable;1"].createInstance(Ci.nsITransferable);
trans.addDataFlavor("text/unicode");
Services.clipboard.getData(trans, Services.clipboard.kGlobalClipboard);
var str = {};
var strLength = {};
trans.getTransferData("text/unicode", str, strLength);

console.log('str:', str, 'strLength:', strLength);
var strConvertedToNsiSupportsString = str.value.QueryInterface(Ci.nsISupportsString).data;
console.log('strConvertedToNsiSupportsString:', strConvertedToNsiSupportsString, strConvertedToNsiSupportsString.length)