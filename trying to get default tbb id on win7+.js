var wrk = Cc['@mozilla.org/windows-registry-key;1'].createInstance(Components.interfaces.nsIWindowsRegKey);
var keypath = 'Software\\Mozilla\\' + Services.appinfo.name + '\\TaskBarIDs'; //Services.appinfo.name == appInfo->GetName(appName) // http://mxr.mozilla.org/comm-central/source/mozilla/widget/windows/WinTaskbar.cpp#284
try {
  wrk.open(wrk.ROOT_KEY_LOCAL_MACHINE, keypath, wrk.ACCESS_READ);
} catch(ex) {
  //console.warn(ex)
  if (ex.message != 'Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIWindowsRegKey.open]') {
    throw ex;
  } else {
    try {
      wrk.open(wrk.ROOT_KEY_CURRENT_USER, keypath, wrk.ACCESS_READ);
    } catch (ex) {
      throw ex;
    }
  }
}
//list children
var numVals = wrk.valueCount;
for (var i=0; i<numVals; i++) {
  var keyval = {
    Name: wrk.getValueName(i)
  };
  keyval.Type = wrk.getValueType(keyval.Name);
  keyval.TypeStr = win_RegTypeStr_from_RegTypeInt(keyval.Type);
  if (keyval.Type == 0) {
    throw new Error('keyval.Type is `0` I have no idea how to read this value keyval.Type == `' + keyval.Type + '` and keyval. Name == `' + keyval.Name + '`');    
  }
  keyval.Value = wrk['read' + keyval.TypeStr + 'Value'](keyval.Name)
  console.log('keyval:', uneval(keyval), keyval);
}
wrk.close();

function win_RegTypeStr_from_RegTypeInt(int) {
  if (int == 1) {
    return 'String';
  } else if (int == 3) {
    return 'Binary';
  } else if (int == 4) {
    return 'Int';
  } else if (int == 11) {
    return 'Int64';
  } else if (int == 0) {
    return 'NONE';
  } else {
    throw new Error('keyval.Type is not any of the expected values of 0, 2, 3, 4, or 11 so am now confused. keyval.Type == `' + int + '`');
  }
}