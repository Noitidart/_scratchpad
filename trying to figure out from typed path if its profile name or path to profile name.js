var tp = 'C:\\rawr\\rawr\\my new profile' //var typedPath
var tpSplit = OS.Path.split(tp); //var typedPathSplit
console.info('tpSplit:', tpSplit);
var IsAbsolute = 'winIsAbsolute' in OS.Path ? tpSplit.winDrive ? true : false : tpSplit.absolute;
var IsRelative = !IsAbsolute;

//do not normalize as i expect the user typing hte path to know their file system
var pattDisallowedChars = /([\\*:?<>|\/\"])/
if (IsAbsolute) {
  if (pattDisallowedChars.test(tp)) {
    
  }
  console.log('RegExp', RegExp)
}

Services.prompt.alert(null, 'kind of prof', IsRelative + '\n\n' + uneval(tpSplit) + '\n\nIsAbsolute:' + IsAbsolute)