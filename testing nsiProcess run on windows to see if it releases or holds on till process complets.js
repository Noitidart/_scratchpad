console.time('nsIProcess runAsync');
var open = new FileUtils.File(Services.dirsvc.get('XREExeF', Ci.nsIFile).path, []);
var process = Cc['@mozilla.org/process/util;1'].createInstance(Ci.nsIProcess);
process.init(open);
var args = ['-P', 'Dev Profilist', '-no-remote'];
/*
if (url) {
  if (OS.Constants.Sys.Name != 'WINNT') {
   args.push('--args'); //for /usr/bin/open for nix/mac
  }
  args.push('about:home');
  args.push(url);
}
*/
var cb = function(s, t, d) {
  console.info('s:', s, 't:', t, 'd:', d);
  console.timeEnd('nsIProcess runAsync');
  if (s.exitValue == 0) {
    console.log('succesfully launched');
  } else if (s.exitValue == 1) {
    console.warn('error 1 happend, did not launch, app may already be open');
  } else {
    console.warn('an exitValue other then 0 or 1 happend i havent seen this happen yet in my couple days with it');
  }
}
process.runAsync(args, args.length, cb);