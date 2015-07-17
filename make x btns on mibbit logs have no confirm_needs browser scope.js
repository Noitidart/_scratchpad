var logsIframe = gBrowser.contentDocument.querySelector('[src="https://my.chat.mibbit.com/pmlogs"]');
if (!logsIframe) {
  alert('could not find logs iframe');
} else {
  var btns = logsIframe.contentWindow.document.querySelectorAll('[onclick*=confirm]');
  for (var i=0; i<btns.length; i++) {
    btns[i].removeAttribute('onclick');
  }
}