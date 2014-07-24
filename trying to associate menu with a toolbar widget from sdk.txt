function doit() {
	//create and add the panel now
	var doc = document;
	var myWidget = doc.getElementById('widget:jid1-lwNbwJJiiMXM4A@jetpack-open-traveleye'); //we add the menu to this widget, we can add menu to anything by setting the context attribute of it to the id of the menu we want to give it

	var myMenuJson = 
					['xul:menupopup', {id: 'myMenu1'},
						['xul:menuitem', {label:'menu item1'}],
						['xul:menu', {label:'menu item2 is submenu1'},
							['xul:menupopup', {},
								['xul:menuitem', {label:'submenu1 item1'}],
								['xul:menuitem', {label:'submenu1 item2'}],
								['xul:menuitem', {label:'submenu1 item3'}]
							]
						],
						['xul:menuitem', {label:'menu item3 is before a seperator'}],
						['xul:menuseparator', {}],
						['xul:menuitem', {label:'menu item4 is after a seperator'}]
					];

	var mainPopupSet = doc.getElementById('mainPopupSet');
	mainPopupSet.appendChild(jsonToDOM(myMenuJson, doc, {}));

	myWidget.setAttribute('context', 'myMenu1');
}

/*dom insertion library function from MDN - https://developer.mozilla.org/en-US/docs/XUL_School/DOM_Building_and_HTML_Insertion*/
jsonToDOM.namespaces = {
    html: 'http://www.w3.org/1999/xhtml',
    xul: 'http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul'
};
jsonToDOM.defaultNamespace = jsonToDOM.namespaces.html;
function jsonToDOM(xml, doc, nodes) {
    function namespace(name) {
        var m = /^(?:(.*):)?(.*)$/.exec(name);        
        return [jsonToDOM.namespaces[m[1]], m[2]];
    }

    function tag(name, attr) {
        if (Array.isArray(name)) {
            var frag = doc.createDocumentFragment();
            Array.forEach(arguments, function (arg) {
                if (!Array.isArray(arg[0]))
                    frag.appendChild(tag.apply(null, arg));
                else
                    arg.forEach(function (arg) {
                        frag.appendChild(tag.apply(null, arg));
                    });
            });
            return frag;
        }

        var args = Array.slice(arguments, 2);
        var vals = namespace(name);
        var elem = doc.createElementNS(vals[0] || jsonToDOM.defaultNamespace, vals[1]);

        for (var key in attr) {
            var val = attr[key];
            if (nodes && key == 'key')
                nodes[val] = elem;

            vals = namespace(key);
            if (typeof val == 'function')
                elem.addEventListener(key.replace(/^on/, ''), val, false);
            else
                elem.setAttributeNS(vals[0] || '', vals[1], val);
        }
        args.forEach(function(e) {
			try {
				elem.appendChild(
									Object.prototype.toString.call(e) == '[object Array]'
									?
										tag.apply(null, e)
									:
										e instanceof doc.defaultView.Node
										?
											e
										:
											doc.createTextNode(e)
								);
			} catch (ex) {
				elem.appendChild(doc.createTextNode(ex));
			}
        });
        return elem;
    }
    return tag.apply(null, xml);
}
/*end - dom insertion library function from MDN*/

doit()