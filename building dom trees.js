jsonToDOM.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
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
            if (nodes && key == "key")
                nodes[val] = elem;

            vals = namespace(key);
            if (typeof val == "function")
                elem.addEventListener(key.replace(/^on/, ""), val, false);
            else
                elem.setAttributeNS(vals[0] || "", vals[1], val);
        }
        args.forEach(function(e) {
            elem.appendChild(typeof e == "object" ? tag.apply(null, e) :
                             e instanceof Node    ? e : doc.createTextNode(e));
        });
        return elem;
    }
    return tag.apply(null, xml);
}


var nodes = {};
document.documentElement.appendChild(
    jsonToDOM(
                ["li", {},
                    ["form",{
                                'accept-charset': "UTF-8",
                                method: "post",
                                'data-method': "post",
                                action: "/enjalot/3375156/fork"
                            },
                            ["button",  {
                                            class: 'minibutton fork-button',
                                            type: 'submit'
                                        },
                                        ['span',{
                                                    class: 'octicon octicon-git-branch'
                                                }
                                        ],
                                        'Fork'
                            ]
                    ]
                ], document, nodes));