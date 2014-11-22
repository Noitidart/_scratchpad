var sa = Cc["@mozilla.org/supports-array;1"].createInstance(Ci.nsISupportsArray);
var wuri = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
wuri.data = 'http://www.bing.com/';
let aCharset = 'UTF-8';
let charset = Cc["@mozilla.org/supports-string;1"].createInstance(Ci.nsISupportsString);
charset.data = "charset=" + aCharset;
var aReferrerURI = null;
var aPostData = null;
var aAllowThirdPartyFixup = false;
var allowThirdPartyFixupSupports = Cc["@mozilla.org/supports-PRBool;1"].createInstance(Ci.nsISupportsPRBool);
allowThirdPartyFixupSupports.data = aAllowThirdPartyFixup;
sa.AppendElement(wuri);
sa.AppendElement(charset);
sa.AppendElement(aReferrerURI);
sa.AppendElement(aPostData);
sa.AppendElement(allowThirdPartyFixupSupports);
let features = "chrome,dialog=no,all";
if (PrivateBrowsingUtils.permanentPrivateBrowsing) {
   features += ",private";
} else {
   features += ",non-private";
}
Services.ww.openWindow(null, 'chrome://browser/content/browser.xul', null, features, sa);

//if mess up order, like dont appendElement of aReferrerURI or aPostData it wont open the wuri, weird i dont understand exactly why