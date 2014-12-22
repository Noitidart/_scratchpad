    var {Cu: utils, Cc: classes, Ci: instances} = Components;
    Cu.import('resource://gre/modules/Services.jsm');
    function xhr(url, cb) {
    	let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
    
    	let handler = ev => {
    		evf(m => xhr.removeEventListener(m, handler, !1));
    		switch (ev.type) {
    			case 'load':
    				if (xhr.status == 200) {
    					cb(xhr.response);
    					break;
    				}
    			default:
    				Services.prompt.alert(null, 'XHR Error', 'Error Fetching Package: ' + xhr.statusText + ' [' + ev.type + ':' + xhr.status + ']');
    				break;
    		}
    	};
    
    	let evf = f => ['load', 'error', 'abort'].forEach(f);
    	evf(m => xhr.addEventListener(m, handler, false));
    
    	xhr.mozBackgroundRequest = true;
    	xhr.open('GET', url, true);
    	xhr.channel.loadFlags |= Ci.nsIRequest.LOAD_ANONYMOUS | Ci.nsIRequest.LOAD_BYPASS_CACHE | Ci.nsIRequest.INHIBIT_PERSISTENT_CACHING;
    	//xhr.responseType = "arraybuffer"; //dont set it, so it returns string, you dont want arraybuffer
    	xhr.send(null);
    }
    
    
    
    var href = 'http://www.bing.com/'
    xhr(href, data => {
    	prompt('XHR Success', data);
    });