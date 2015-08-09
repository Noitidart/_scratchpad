var win = Services.appShell.hiddenDOMWindow;
var doc = win.document;
var iframe = doc.createElementNS('http://www.w3.org/1999/xhtml', 'iframe');
iframe.addEventListener('load', function() {
  console.error('iframe loaded, print it');
  console.error('info', iframe.contentWindow)
  iframe.contentWindow.addEventListener('afterprint', function() {
    console.error('yaaa ah after print ev list');
    console.error('done printing, e:', arguments);
    doc.documentElement.removeChild(iframe);
    var ws = Services.wm.getEnumerator(null);
    while (ws.hasMoreElements()) {
      var w = ws.getNext();
      console.log('ok here going to find and close, w.document.location.href:', w.document.location.href);
      if (w.document.location.href == 'chrome://global/content/printProgress.xul') {
        // i have to do this cuz window.opener is null so it doesnt close: `TypeError: opener is null printProgress.js:83:10`
        //w.close();
        break;
      }
    }
  }, false);
  iframe.contentWindow.print();
  //winWithPpl.PrintUtils.printPreview(ppl);
}, true);
iframe.setAttribute('src', 'http://www.bing.com/');
doc.documentElement.appendChild(iframe); // src page wont load until i append to document