function GetPropertyError(message) {
    this.name = 'GetPropertyError';
    this.message = message || '';
    this.stack = new Error().stack; //this gives the line of the throw
}
GetPropertyError.prototype = Error.prototype;
try {
    var rez_GP = 'asf()';
    throw new GetPropertyError('Data requested but GetProperty failed, rez_GP: "' + rez_GP + '"');
} catch (ex if ex instanceof GetPropertyError) {
    //throw ex; //.message;
    console.log('CONTINUE:', ex);
}

function NotImplementedError(message) {
    this.name = "NotImplementedError";
    this.message = (message || "");
}
NotImplementedError.prototype = Error.prototype;

try {
    var e = new NotImplementedError("NotImplementedError message");
    throw e;
} catch (ex1) {
    console.log('stack:', ex1.stack);
    console.log("ex1 instanceof AssertionFailedError = " + (ex1 instanceof NotImplementedError));
    console.log("ex1 instanceof Error = " + (ex1 instanceof Error));
    console.log("ex1.name = " + ex1.name);
    console.log("ex1.message = " + ex1.message);
}



function NotImplementedError2(message) {
    this.message = (message || "");
}
NotImplementedError2.prototype = new Error();

try {
    var e = new NotImplementedError2("NotImplementedError2 message");
    throw e;
} catch (ex1) {
    console.log('stack:', ex1.stack);
    console.log("ex1 instanceof AssertionFailedError = " + (ex1 instanceof NotImplementedError2));
    console.log("ex1 instanceof Error = " + (ex1 instanceof Error));
    console.log("ex1.name = " + ex1.name);
    console.log("ex1.message = " + ex1.message);
}
/*
Exception: [object Object]
*/