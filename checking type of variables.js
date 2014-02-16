function Animal() {}
var f = document.createElement('div');
Services.wm.getMostRecentWindow(null).alert(uneval(cTypeof(null)));
//Services.wm.getMostRecentWindow(null).alert(Object.prototype.toString.call(undefined)); //works for null and undefined
//Services.wm.getMostRecentWindow(null).alert(Function.prototype.toString.call((undefined).constructor));

function cTypeof(o, returnMethod) {
	//returnMethod is array of methods you want returned
	if (!returnMethod || (returnMethod.length !== undefined && returnMethod.length == 0)) {
		returnMethod = ['obj', 'objS', 'func', 'funcS', 'nodeS'];
	}
	var method = {};
	var methodRetVals = {};
	method.obj = function () {
		if (!('obj' in methodRetVals)) {
			try {
				methodRetVals.obj = Object.prototype.toString.call(o);
			} catch (ex) {
				methodRetVals.obj = ex;
			}
		}
		return methodRetVals.obj;
	}
	method.func = function () {
		if (!('func' in methodRetVals)) {
			try {
				methodRetVals.func = Function.prototype.toString.call((o).constructor);
			} catch (ex) {
				methodRetVals.func = ex;
			}
		}
		return methodRetVals.func;
	}
	method.objS = function () { //obj string
		if (!('obj' in methodRetVals)) {
			method.obj();
		}
		try {
			methodRetVals.objS = methodRetVals.obj.substring(8, methodRetVals.obj.length - 1);
		} catch (ex) {
			methodRetVals.objS = ex;
		}
		return methodRetVals.objS;
	}
	method.funcS = function () { //obj string
		if (!('func' in methodRetVals)) {
			method.func();
		}
		try {
			methodRetVals.funcS = methodRetVals.func.substring(9, methodRetVals.func.indexOf('()'));
		} catch (ex) {
			methodRetVals.funcS = ex;
		}
		return methodRetVals.funcS;
	}/*
	method.node = function () { //obj string
        var nodeType = o.nodeType;
        if (nodeType !== undefined && nodeType !== null) {
            methodRetVals.node = nodeType;
        } else {
            methodRetVals.node = 0;
        }
		return nodeType;
	}
	method.nodeS = function () { //obj string
        var nodeName = o.nodeName;
        if (nodeName !== undefined && nodeName !== null) {
            methodRetVals.nodeS = nodeName;
        } else {
            methodRetVals.nodeS = 0;
        }
		return nodeName;
	}
    */
	method.nodeS = function () { //obj string
        try {
            var nodeType = o.nodeType;
            if (nodeType !== undefined && nodeType !== null) {
                methodRetVals.nodeS = 'Node';
            } else {
                methodRetVals.nodeS = 0;
            }
        } catch (ex) {
            methodRetVals.nodeS = ex;
        }
		return nodeType;
	}
    var retVal = {};
    //var retStr = [];
    [].forEach.call(returnMethod, function(m) {
        if (m in method) {
          retVal[m] = method[m](); //so must return values in funcs above 
        } else {
            retVal[m] = 'METHOD_UNDEFINED';
        }
        //retStr.push(retVal[m]);
    });
    //alert(retStr.join('\n*'));
	return retVal;
}
//very indepth: http://tobyho.com/2011/01/28/checking-types-in-javascript/