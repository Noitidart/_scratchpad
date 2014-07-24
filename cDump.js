Cu.import('resource://gre/modules/Services.jsm');

/*start - cdump module*/
function cDump(args) {
	//oldway: obj, title, deep, outputTarget
	//args is object with keys:
	//obj - required, the obj to dump
	//title - optional, if given, the cdump will be titled
	//deep - optional, if given it will go deeper in //not implemented yet: integer of how many levels deep to go
	//target - where to dump
	//if target == 0, can define inBackground: true
	//if target not in targetsDisableDeep then can specify initDisplayed to true which will make all sub divs be block
	//inBackground set to tru to load tab in bg
	
	//Services jsm must be imported
	//set args.deep to 1 to make it args.deep but initialize args.deeps div at none.
	//se args.deep to 2 to initialize at block
	//args.target == 0 then new tab, if set args.target to false then will do 0 but will load tab in background, if set to 0 or leave undefined it will load tab in foreground
	//args.target == 1 then reportError (cannot do args.deep in this args.target)
	//args.target == 2 then new window (not yet setup)
	//args.target == 3 then Services.console.logStringMessage
	//args.target == nsIFile, file at that path
	var targetsDisableDeep = [1,3];
    var tstr = '';
    var bstr = '';
    if (args.deep && targetsDisableDeep.indexOf(args.target) == -1) {
        bstr = '<a href="javascript:void(0)" onclick="var subdivs = document.querySelectorAll(\'div > div\'); for(var i=0;i<subdivs.length;i++) { subdivs[i].style.display = subdivs[i].style.display==\'block\'?\'none\':\'block\'; }">Toggle All</a>\n\n';
    }
	
	if (!args.deep) {
		args.deep = 0;
	}
	
    var fstr = '';
    for (var b in args.obj) {
        try{
            bstr += b+'='+args.obj[b]+'\n';
            if (args.deep && targetsDisableDeep.indexOf(args.target) == -1) {
				var sstr = '';
                for (var c in args.obj[b]) {
                    try {
                        sstr += '\t\t\t' + c+'='+args.obj[b][c]+'\n';
                    } catch(e0) {
                        sstr += '\t\t\t' + c+'=exception_occured_on_read='+e0+'\n';
                    }	
                }
				if (sstr != '') {
					bstr += '<div style="margin-left:35px;color:gray;cursor:pointer;border:1px solid blue;" onclick="this.childNodes[1].style.display=this.childNodes[1].style.display==\'block\'?\'none\':\'block\';window.setScroll(window.scrollX,this.offsetTop-this.offsetHeight);">click to toggle<div style="display:' + (args.initDisplayed ? 'block' : 'none') + ';">' + sstr + '</div></div>';
				}
            }
        } catch (e) {
                fstr = b+'='+e+'\n';
        }
    }
    tstr += '<b>BSTR::</b>\n' + bstr;
    tstr += '\n<b>FSTR::</b>\n' + fstr;
    
	if (!args.target) {
		var cWin = Services.wm.getMostRecentWindow('navigator:browser');
		
		var onloadFunc = function() {
			//cWin.gBrowser.selectedTab = cWin.gBrowser.tabContainer.childNodes[cWin.gBrowser.tabContainer.childNodes.length-1];
			newTabBrowser.removeEventListener('load', onloadFunc, true);
			if (args.title) { newTabBrowser.contentDocument.title = args.title; }
			newTabBrowser.contentDocument.body.innerHTML = tstr.replace(/\n/g,'<br>')
		};
		
		var newTabBrowser = cWin.gBrowser.getBrowserForTab(cWin.gBrowser.loadOneTab('about:blank',{inBackground:args.inBackground}));
		newTabBrowser.addEventListener('load', onloadFunc, true);
	} else if (args.target == 1) {
		tstr = 'CDUMP OF "' + args.title + '">>>\n\n' + tstr + ' "\n\nEND: CDUMP OF "' + args.title + '" ^^^';
		Cu.reportError(tstr);
	} else if (args.target == 2) {
		//to new window
	} else if (args.target == 3) {
		tstr = 'CDUMP OF "' + args.title + '">>>\n\n' + tstr + ' "\n\nEND: CDUMP OF "' + args.title + '" ^^^';
		Services.console.logStringMessage(tstr);
	} else if (args.target instanceof Ci.nsIFile) {
		var html = '<div style="display:flex;align-items:flex-start;broder:1px dashed black;"><div style="width:15em;font-weight:bold;display:inline-block;">' + [new Date().toLocaleTimeString(), 'Title: ' + args.title].join('<br>') + '</div><div class="dumpCol" style="display:inline-block;>' + tstr.replace(/\n/g,'<br>') + '</div></div>';
		writeFile(args.target, html, false, function(status) {
			if (!Components.isSuccessCode(status)) {
				Services.wm.getMostRecentWindow(null).alert('cDump to file failed');
			} else {
				//Services.wm.getMostRecentWindow(null).alert('writeFile SUCCESFUL');
			}
		});
	}

}


Cu.import('resource://gre/modules/FileUtils.jsm');
Cu.import('resource://gre/modules/NetUtil.jsm');
function writeFile(nsiFile, data, overwrite, callback) {
    //overwrite is true false, if false then it appends
    //nsiFile must be nsiFile
    if (!(nsiFile instanceof Ci.nsIFile)) {
        Cu.reportError('ERROR: must supply nsIFile ie: "FileUtils.getFile(\'Desk\', [\'rawr.txt\']" OR "FileUtils.File(\'C:\\\\\')"');
        return;
    }
    if (overwrite) {
        var openFlags = FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_TRUNCATE;
    } else {
        var openFlags = FileUtils.MODE_WRONLY | FileUtils.MODE_CREATE | FileUtils.MODE_APPEND;
    }
   //data is data you want to write to file
   //if file doesnt exist it is created
   var ostream = FileUtils.openFileOutputStream(nsiFile, openFlags)
 
  var converter = Cc['@mozilla.org/intl/scriptableunicodeconverter'].createInstance(Ci.nsIScriptableUnicodeConverter);
   converter.charset = 'UTF-8';
   var istream = converter.convertToInputStream(data);
   // The last argument (the callback) is optional.
   NetUtil.asyncCopy(istream, ostream, function (status) {
      if (!Components.isSuccessCode(status)) {
         // Handle error!
         Cu.reportError('error on write isSuccessCode = ' + status);
         callback(status);
         return;
      }
      // Data has been written to the file.
      callback(status)
   });
}

function readFile(nsiFile, callback) {
   //you must pass a callback like function(dataReadFromFile, status) { }
   //then within the callback you can work with the contents of the file, it is held in dataReadFromFile
   //callback gets passed the data as string
   NetUtil.asyncFetch(file, function (inputStream, status) {
      //this function is callback that runs on completion of data reading
      if (!Components.isSuccessCode(status)) {
         alert('error on file read isSuccessCode = ' + status);
         return;
      }
      var data = NetUtil.readInputStreamToString(inputStream, inputStream.available());
      callback(data, status);
   });
}
/*end - cdump module*/

