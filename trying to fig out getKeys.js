/**
 * Construct object from nsIProperties.
 * Properties elements will be mapped to this newly created object as
 * regular JS properties.
 * @param properties (nsIProperties) initial properties
 */
function Properties() {
	for (let p of Array.slice(arguments)) {
		this._parse(p);
	}
}
Properties.prototype = Object.freeze({
	_parse: function(properties) {
		function toUpper(str, n) {
			return n.toUpperCase();
		}

		if (!properties) {
			return;
		}
		let keys = properties.getKeys({});
		for (let key of keys) {
			try {
				let prop =  properties.get(key, Ci.nsISupports);
				if (prop instanceof Ci.nsIVariant) {
					prop = prop;
				}
				else if (prop instanceof Ci.nsISupportsPrimitive) {
					switch(prop.type || prop.TYPE_STRING) {
					case prop.TYPE_CSTRING:
						prop = prop.QueryInterface(Ci.nsISupportsCString);
						break;
					case prop.TYPE_STRING:
						prop = prop.QueryInterface(Ci.nsISupportsString);
						break;
					case prop.TYPE_PRBOOL:
						prop = prop.QueryInterface(Ci.nsISupportsPRBool);
						break;
					case prop.TYPE_PRUINT8:
						prop = prop.QueryInterface(Ci.nsISupportsPRUint8);
						break;
					case prop.TYPE_PRUINT16:
						prop = prop.QueryInterface(Ci.nsISupportsPRUint16);
						break;
					case prop.TYPE_PRUINT32:
						prop = prop.QueryInterface(Ci.nsISupportsPRUint32);
						break;
					case prop.TYPE_PRUINT64:
						prop = prop.QueryInterface(Ci.nsISupportsPRUint64);
						break;
					case prop.TYPE_PRINT8:
						prop = prop.QueryInterface(Ci.nsISupportsPRInt8);
						break;
					case prop.TYPE_PRINT16:
						prop = prop.QueryInterface(Ci.nsISupportsPRInt16);
						break;
					case prop.TYPE_PRINT32:
						prop = prop.QueryInterface(Ci.nsISupportsPRInt32);
						break;
					case prop.TYPE_PRINT64:
						prop = prop.QueryInterface(Ci.nsISupportsPRInt64);
						break;
					case prop.TYPE_FLOAT:
						prop = prop.QueryInterface(Ci.nsISupportsFloat);
						break;
					case prop.TYPE_DOUBLE:
						prop = prop.QueryInterface(Ci.nsISupportsDouble);
						break;
					case prop.TYPE_CHAR:
						prop = prop.QueryInterface(Ci.nsISupportsChar);
						break;
					case prop.TYPE_PRTIME:
						prop = prop.QueryInterface(Ci.nsISupportsPRTime);
						break;
					case prop.TYPE_INTERFACE_POINTER:
						prop = prop.QueryInterface(Ci.nsISupportsInterfacePointer);
						break;
					default:
						throw new Exception("Invalid type");
					}
					prop = prop.data;
				}
				key = key.replace(/[.-](.)/g, toUpper);
				this[key] = prop;
			}
			catch (ex) {
				Components.utils.reportError("Failed to convert property: " + ex);
			}
		}
	}
});
var props = Object.freeze(Properties);



let links = desc.get('links', Ci.nsIArray).enumerate();
let p = new Properties(link, desc);