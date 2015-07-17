var DSP = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
var keywords = [];
var str = [];


function doit() {
    for (var i=0; i<keywords.length; i++) {
        str.push('Keyword: "' + keywords[i] + '"');
        try {
           var methodFU = FileUtils.getFile(keywords[i], ['']);
            str[str.length-1] += '|FU = "' + methodFU.path + '"';
        } catch(ex) {
            str[str.length-1] += '|FU = "' + ex.message + '"';
        }
        try {
           var methodDS = DSP.get(keywords[i], Ci.nsIFile);
            str[str.length-1] += '|DS = "' + methodDS.path + '"';
        } catch(ex) {
            str[str.length-1] += '|DS = "' + ex.message + '"';
        }
    }
var gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
gClipboardHelper.copyString(str.join('\n'))
    console.log(str.join('\n'));
}

var keywords = [
    //http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsAppDirectoryServiceDefs.h
    'AppRegF',
    'AppRegD',
    'DefRt',
    'PrfDef',
    'current',
    'default',
    'DefProfRt',
    'DefProfLRt',
    'ARes',
    'AChrom',
    'APlugns',
    'SrchPlugns',
    'AChromDL',
    'APluginsDL',
    'SrchPluginsDL',
    'SHARED',
    'PrefD',
    'PrefF',
    'MetroPrefF',
    'PrefDL',
    'ExtPrefDL',
    'PrefDOverride',
    'ProfD',
    'ProfLD',
    'UChrm',
    'UsrSrchPlugns',
    'LclSt',
    'UPnls',
    'UMimTyp',
    'cachePDir',
    'BMarks',
    'DLoads',
    'SrchF',
    'XPIClnupD',
    'indexedDBPDir',
    'permissionDBPDir',
    //http://mxr.mozilla.org/mozilla-central/source/xpcom/io/nsDirectoryServiceDefs.h
    'Home',
    'TmpD',
    'CurWorkD',
    'Home',
    'Desk',
    'CurProcD',
    'XCurProcD',
    'XpcomLib',
    'GreD',
    'SysD',
    'Trsh',
    'Strt',
    'Shdwn',
    'ApplMenu',
    'CntlPnl',
    'Exts',
    'Fnts',
    'Prfs',
    'Docs',
    'ISrch',
    'DfltDwnld',
    'ULibDir',
    'UsrDsk',
    'LocDsk',
    'UsrApp',
    'LocApp',
    'UsrDocs',
    'LocDocs',
    'UsrIntrntPlgn',
    'LoclIntrntPlgn',
    'UsrFrmwrks',
    'LocFrmwrks',
    'UsrPrfs',
    'LocPrfs',
    'Pct',
    'Mov',
    'Music',
    'IntrntSts',
    'WinD',
    'ProgF',
    'DeskV',
    'Progs',
    'Cntls',
    'Prnts',
    'Pers',
    'Favs',
    'Strt',
    'Rcnt',
    'SndTo',
    'Buckt',
    'Strt',
    'DeskP',
    'Drivs',
    'NetW',
    'netH',
    'Fnts',
    'Tmpls',
    'CmStrt',
    'CmPrgs',
    'CmDeskP',
    'CmAppData',
    'AppData',
    'LocalAppData',
    'PrntHd',
    'CookD',
    'DfltDwnld',
    'Docs',
    'Pict',
    'Music',
    'Vids',
    'Locl',
    'LibD',
    'XDGDesk',
    'XDGDocs',
    'XDGDwnld',
    'XDGMusic',
    'XDGPict',
    'XDGPubSh',
    'XDGTempl',
    'XDGVids',
    'DfltDwnld',
    'DrvD',
    //http://mxr.mozilla.org/mozilla-release/source/toolkit/mozapps/update/nsUpdateService.js#76
    'GreD',
    'UpdRootD',
    'XREExeF',
    //http://mxr.mozilla.org/mozilla-release/source/toolkit/mozapps/update/tests/shared.js#55
    'ProfDS',
    'ProfD',
    'GreD',
    'XCurProcD',
    'XREExeF',
    'UpdRootD',
    //http://mxr.mozilla.org/mozilla-release/source/xpcom/build/nsXULAppAPI.h
    'UAppData',
    'XREExtDL',
    'XREExeF',
    'started',
    'ProfDS',
    'started',
    'ProfLDS',
    'XRESysLExtPD',
    'XRESysSExtPD',
    'XREUSysExt',
    'XREAppDist',
    'UpdRootD',
    'UpdArchD',
    'OSUpdApplyToD'
];

doit();