var a = ctypes.jschar.array()('hi');
var b = ctypes.cast(a, ctypes.voidptr_t)
var c = ctypes.cast(b.address(), ctypes.jschar.array(3).ptr)
c.contents.readString()



a.toString()
"ctypes.char16_t.array(3)(["h", "i", "\x00"])"
b.toString()
"ctypes.voidptr_t(ctypes.UInt64("0x690068"))"
c.toString()
"ctypes.char16_t.array(3).ptr(ctypes.UInt64("0xce64ad8"))"