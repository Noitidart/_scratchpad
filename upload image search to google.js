function encodeFormData(data, charset) {
  let encoder = Cc["@mozilla.org/intl/saveascharset;1"].
                createInstance(Ci.nsISaveAsCharset);
  encoder.Init(charset || "utf-8",
               Ci.nsISaveAsCharset.attr_EntityAfterCharsetConv + 
               Ci.nsISaveAsCharset.attr_FallbackDecimalNCR,
               0);
  let encode = function(val, header) {
    val = encoder.Convert(val);
    if (header) {
      val = val.replace(/\r\n/g, " ").replace(/"/g, "\\\"");
    }
    return val;
  }

  let boundary = "----boundary--" + Date.now();
  let mpis = Cc['@mozilla.org/io/multiplex-input-stream;1'].
             createInstance(Ci.nsIMultiplexInputStream);
  let item = "";
  for (let k of Object.keys(data)) {
    item += "--" + boundary + "\r\n";
    let v = data[k];
    if (v instanceof Ci.nsIFile) {
      let fstream = Cc["@mozilla.org/network/file-input-stream;1"].
                    createInstance(Ci.nsIFileInputStream); 
      fstream.init(v, -1, -1, Ci.nsIFileInputStream.DEFER_OPEN);
      item += "Content-Disposition: form-data; name=\"" + encode(k, true) + "\";" +
              " filename=\"" + encode(file.leafName, true) + "\"\r\n";
      let ctype = "application/octet-stream";
      try {
        let mime = Cc["@mozilla.org/mime;1"].getService(Ci.nsIMIMEService);
        ctype = mime.getTypeFromFile(v) || ctype;
      }
      catch (ex) {
        console.warn("failed to get type", ex);
      }
      item += "Content-Type: " + ctype + "\r\n\r\n";
      let ss = Cc["@mozilla.org/io/string-input-stream;1"].
               createInstance(Ci.nsIStringInputStream);
      ss.data = item;
      mpis.appendStream(ss);
      mpis.appendStream(fstream);
      item = "";
    }
    else {
      item += "Content-Disposition: form-data; name=\"" + encode(k, true) + "\"\r\n\r\n";
      item += encode(v);
    }
    item += "\r\n";
  }
  item += "--" + boundary + "--\r\n";
  let ss = Cc["@mozilla.org/io/string-input-stream;1"].
           createInstance(Ci.nsIStringInputStream);
  ss.data = item;
  mpis.appendStream(ss);
  let postStream = Cc["@mozilla.org/network/mime-input-stream;1"].
                   createInstance(Ci.nsIMIMEInputStream);
  postStream.addHeader("Content-Type",
                       "multipart/form-data; boundary=" + boundary);
  postStream.setData(mpis);
  postStream.addContentLength = true;
  return postStream;
}

let file = new FileUtils.File('C:\\Users\\Vayeate\\Pictures\\Ht3RXyK.png');

let postData = encodeFormData({
  "image_url": file.leafName,
  "encoded_image": file
}, "iso8859-1");

gBrowser.loadOneTab("https://images.google.com/searchbyimage/upload", {
  inBackground: false,
  postData: postData
});