var inIDOMUtils = Cc['@mozilla.org/inspector/dom-utils;1'].getService(Ci.inIDOMUtils);
var cbHelper = Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper);

var props = inIDOMUtils.getCSSPropertyNames();
console.log('props:', props);

var dump = [];

var el = document.querySelector('#profilist_box');
var calcdProps = el.ownerDocument.defaultView.getComputedStyle(el, '');
for (var p in calcdProps) {
  if (!isNaN(p)) {
    dump.push(calcdProps[p] + ': ' + calcdProps.getPropertyValue(calcdProps[p]));
  } else if (typeof calcdProps[p] == 'string') {
   dump.push(p + ': ' + calcdProps[p]);
  } else {
    console.log('not dumping ' + p);
  }
}

cbHelper.copyString(dump.join('\n'));
//console.log(dump.join('\n'));


/**************
//actually using this
				var dump = [];

				var el = PUIsync_height;
				var calcdProps = el.ownerDocument.defaultView.getComputedStyle(el, '');
				for (var p in calcdProps) {
				  if (!isNaN(p)) {
					dump.push(calcdProps[p] + ': ' + calcdProps.getPropertyValue(calcdProps[p]));
				  } else if (typeof calcdProps[p] == 'string') {
				   dump.push(p + ': ' + calcdProps[p]);
				  } else {
					//console.log('not dumping ' + p);
				  }
				}

				cbHelper.copyString(dump.join('\n'));
				
****************/