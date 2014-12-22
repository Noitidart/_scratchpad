var shortcutName = 'my sc';
var shortcutIconPath =  OS.Path.join(OS.Constants.Path.desktopDir, 'icon.ico');
var shortcutTarget = FileUtils.getFile('XREExeF', []).path + ' -P -no-remote'; //what shortcut should open
var shortcutLocation = OS.Constants.Path.desktopDir; //where to place the shortcut file
var promise_createApp = _createDirectoryStructure(shortcutName, shortcutIconPath, shortcutTarget, shortcutLocation);
promise_createApp.then(
  function(aVal) {
    console.log('promise_createApp successfully exuted');
  },
  function(aReason) {
    console.error('promise_createApp FAILED, aReason:', aReason);
  }
);
function _createDirectoryStructure(name, iconpath, target, locpath) {
  var dirApp = OS.Path.join(shortcutLocation, shortcutName + '.app');
  var dirContents = OS.Path.join(dirApp, 'Contents');
  var dirMacOS = OS.Path.join(dirContents, 'MacOS');
  var fileScript = OS.Path.join(dirMacOS, name);
  var dirResources = OS.Path.join(dirContents, 'Resources');
  var fileIcon = OS.Path.join(dirResources, 'appicon.icns');
  var fileZip = OS.Path.join(dirResources, 'application.zip');
  var filePlist = OS.Path.join(dirContents, 'Info.plist');

  var promise_makeApp = OS.File.makeDir(dirApp, {unixMode: FileUtils.PERMS_DIRECTORY, ignoreExisting: true});
  return promise_makeApp.then(
   function(aVal) {
     console.log('app folder succesfully made');
     var promise_makeContents = OS.File.makeDir(dirContents, {unixMode: FileUtils.PERMS_DIRECTORY, ignoreExisting: true});
     return promise_makeContents.then(
       function(aVal) {
         console.log('contents folder succesfully made');
         var promiseAll_make_MacOS_Resoruces_Plist;
         var deferred_writeScript = Promise.defer();
         var deferred_setPermsScript = Promise.defer();
         var doPromiseScriptSetPerm = function() {
           var promise_setPermsScript = OS.File.setPermissions(fileScript, {unixMode: FileUtils.PERMS_FILE});
           promise_setPermsScript.then(
             function(aVal) {
               console.log('promise_setPermsScript success, aVal:', aVal);
               deferred_setPermsScript.resolve('promise_setPermsScript success');
             },
             function(aReason) {
               console.error('promise_setPermsScript failed, aReason:', aReason);
               deferred_setPermsScript.reject('promise_setPermsScript failed, aReason:' + aReason);
             }
           );
         };
         var promise_makeMacOS = OS.File.makeDir(dirMacOS, {unixMode: FileUtils.PERMS_DIRECTORY, ignoreExisting: true});
         promise_makeMacOS.then(
           function(aVal) {
             console.log('macos folder succesfully made');
             var promise_writeScript = OS.File.writeAtomic(fileScript, '#!/bin/sh\nexec ' + target, {encoding:'utf-8', /*unixMode: FileUtils.PERMS_DIRECTORY,*/ noOverwrite: true});
             promise_writeScript.then(
              function(aVal) {
                console.log('script succesfully wrote, aVal:', aVal);
                deferred_writeScript.resolve('script succesfully made');
                doPromiseScriptSetPerm();
              },
              function(aReason) {
                if (aReason.becauseExists) {
                  console.log('scriptFile already exists so just go to success func, i dont know how so i go to doScriptSetPerm');
                  deferred_writeScript.resolve('script succesfully made');
                  doPromiseScriptSetPerm();
                } else {
                  console.error('script failed to write, aReason:', aReason);
                  deferred_writeScript.reject('script folder failed to make, aReason:' + aReason);
                }
              }
             );
           },
           function(aReason) {
             console.error('macos folder failed to make, aReason:', aReason);
             return Promise.reject('macos folder failed to make, aReason:' + aReason);
           }
         );
         var deferred_copyIcon = Promise.defer();
         var promise_makeResources = OS.File.makeDir(dirResources, {unixMode: FileUtils.PERMS_DIRECTORY, ignoreExisting: true});
         promise_makeResources.then(
           function(aVal) {
             console.log('resources folder succesfully made');
             var promise_copyIcon = OS.File.copy(iconpath, fileIcon, {noOverwrite:false}); //we want the icon overwritten as user may have badged it
             return promise_copyIcon.then(
               function(aVal) {
                 console.log('icon file succesfully copied');
                 deferred_copyIcon.resolve('icon file succesfully copied');
               },
               function(aReason) {
                 console.error('icon file failed to copy, aReason:', aReason);
                 deferred_copyIcon.reject('icon file failed to copy, aReason:' + aReason);
               }
             );
           },
           function(aReason) {
             console.error('resources folder failed to make, aReason:', aReason);
             return Promise.reject('resources folder failed to make, aReason:' + aReason);
           }
         );
         var doPromisePlistSetPerm = function(aVal) {
           var promise_setPermPlist = OS.File.setPermissions(filePlist, {unixMode: FileUtils.PERMS_FILE});
           return promise_setPermPlist.then(
             function(aVal) {
               console.log('plist setperm successfully done');
               //return Promise.resolve('plist setperm successfully done');
               deferred_setPermPlist.resolve('plist setperm success');
             },
             function(aReason) {
               console.error('failed to setPermissions on filePlist, aReason:', aReason);
               deferred_setPermPlist.reject('failed to setPermissions on filePlist, aReason:' + aReason);
             }
           );
         }
         var deferred_makePlist = Promise.defer(); //need this because if push promise_makePlist, if rejected because it exists, then it rejects the promise.all
         var deferred_setPermPlist = Promise.defer(); //need this because if i do return doPromisePlistSetPerm() in promise_makePlist it doesnt chain the Promise.all completes prematurely
         var promise_makePlist = OS.File.writeAtomic(filePlist, plistContent({ CFBundleDisplayName:name, CFBundleIdentifier:name + Math.random(), CFBundleName:name }), {encoding:'utf-8', /*unixMode: FileUtils.PERMS_DIRECTORY,*/ noOverwrite: true}); //note: i dont think writeAtomic has unixMode option so i do setPermissions
         promise_makePlist.then(
           function(aVal) {
             console.log('plist file succesfully made');
             deferred_makePlist.resolve('plist file succesfully made');
             doPromisePlistSetPerm();
           },
           function(aReason) {
             if (aReason.becauseExists) {
               console.log('plistInfo already exists so just go to success func, i dont know how so i go to doPromisePlistSetPerm');
               deferred_makePlist.resolve('plist file succesfully made');
               doPromisePlistSetPerm();
             } else {
              console.error('plist file failed to make, aReason:', aReason);
              return Promise.reject('plist file failed to make, aReason:' + aReason);
             }
           }
         );
         promiseAll_make_MacOS_Resoruces = [promise_makeMacOS, promise_makeResources, deferred_makePlist.promise, deferred_copyIcon.promise, deferred_setPermPlist.promise, deferred_writeScript.promise, deferred_setPermsScript.promise];
         return Promise.all(promiseAll_make_MacOS_Resoruces).then(
           function(aVal) {
             console.log('promiseAll_make_MacOS_Resoruces succeeded');
           },
           function(aReason) {
             console.error('promiseAll_make_MacOS_Resoruces failed, aReason:', aReason);
             return Promise.reject('promiseAll_make_MacOS_Resoruces failed, aReason:' + aReason);
           }
         );
       },
       function(aReason) {
         console.error('contents folder failed to make, aReason:', aReason);
         return Promise.reject('contents folder failed to make, aReason:' + aReason);
       }
     );
   },
   function(aReason) {
     console.error('app folder failed to make, aReason:', aReason);
     return Promise.reject('app folder failed to make, aReason:' + aReason);
   }
  );
}

function plistContent(contentObj) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n\
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n\
          <plist version="1.0">\n\
          <dict>\n\
          <key>CFBundleDevelopmentRegion</key>\n\
          <string>English</string>\n\
          <key>CFBundleDisplayName</key>\n\
          <string>' + escapeXML(contentObj.CFBundleDisplayName) + '</string>\n\
          <key>CFBundleExecutable</key>\n\
          <string>webapprt</string>\n\
          <key>CFBundleIconFile</key>\n\
          <string>appicon</string>\n\
          <key>CFBundleIdentifier</key>\n\
          <string>' + escapeXML(contentObj.CFBundleIdentifier) + '</string>\n\
          <key>CFBundleInfoDictionaryVersion</key>\n\
          <string>6.0</string>\n\
          <key>CFBundleName</key>\n\
          <string>' + escapeXML(contentObj.CFBundleName) + '</string>\n\
          <key>CFBundlePackageType</key>\n\
          <string>APPL</string>\n\
          <key>CFBundleVersion</key>\n\
          <string>0</string>\n\
          <key>NSHighResolutionCapable</key>\n\
          <true/>\n\
          <key>NSPrincipalClass</key>\n\
          <string>GeckoNSApplication</string>\n\
          <key>FirefoxBinary</key>\n\
          #expand <string>__MOZ_MACBUNDLE_ID__</string>\n\
          </dict>\n\
          </plist>';
}

function escapeXML(aStr) {
  return aStr.toString()
             .replace(/&/g, '&amp;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&apos;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;');
}
/*
"app folder succesfully made" Scratchpad/1:27
"contents folder succesfully made" Scratchpad/1:31
"macos folder succesfully made" Scratchpad/1:51
"resources folder succesfully made" Scratchpad/1:80
"plistInfo already exists so just go to success func, i dont know how so i go to doPromisePlistSetPerm" Scratchpad/1:123
"scriptFile already exists so just go to success func, i dont know how so i go to doScriptSetPerm" Scratchpad/1:61
"icon file succesfully copied" Scratchpad/1:84
"plist setperm successfully done" Scratchpad/1:102
"promise_setPermsScript success, aVal:" undefined Scratchpad/1:39
"promiseAll_make_MacOS_Resoruces succeeded" Scratchpad/1:135
"promise_createApp successfully exuted"
*/