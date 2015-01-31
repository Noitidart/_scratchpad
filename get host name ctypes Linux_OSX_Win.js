Cu.import("resource://gre/modules/ctypes.jsm");

function getHostName() {
    function loadLibrary() {
        const candidates = ["libc.so.6", ctypes.libraryName('c'), ctypes.libraryName('ws2_32')];
        for (var cand of candidates) {
            try {
                return ctypes.open(cand);
            }
            catch (ex) {}
        }
    }
    const library = loadLibrary();
    if (!library) {
        return null;
    }
    try {
        const gethostname = library.declare(
            "gethostname",
            ctypes.default_abi,
            ctypes.int, // return value
            ctypes.char.ptr, // [out] name,
            ctypes.int // [in] namelen
            );
        let addrbuf = (ctypes.char.array(1024))();
        if (gethostname(addrbuf, 1024)) {
            throw Error("ctypes call failed");
        }
        let rv = addrbuf.readString();
        console.log("got hostname", rv);
        return rv;
    }
    catch (ex) {
        console.error("Failed to get host name", ex);
        return null;
    }
    finally {
        library.close();
    }
}

console.log(getHostName());