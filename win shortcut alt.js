Cu.importGlobalProperties(['Blob']);

function dumpToFile(dFile,blob) {
   var arrayBuffer;
   var fileReader = Cc["@mozilla.org/files/filereader;1"].createInstance(Ci.nsIDOMFileReader);
   //var fileReader = new FileReader();
   fileReader.onload = function(evt) {
      // THIS onload FUNCTION IS NEVER EXECUTED!
      arrayBuffer = evt.target.result;
	  
      var outputStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
      outputStream.init(dFile, 0x02 | 0x08 | 0x20, 0644, null);

      var bos = Cc["@mozilla.org/binaryoutputstream;1"].createInstance(Ci.nsIBinaryOutputStream);
      bos.setOutputStream(outputStream);
      bos.writeByteArray(arrayBuffer, arrayBuffer.length);
      outputStream.close();
   };
   fileReader.readAsArrayBuffer(blob);
}

// The following function creates the blob and works just fine
function create_lnk_blob(lnk_target) {
    function hex_to_arr(s) {
        var result = Array(s.length / 2);
        for (var i = 0; i < result.length; ++i) {
            result[i] = +('0x' + s.substr(2*i, 2));
        }
        return result;
    }

    function str_to_arr(s) {
        var result = Array(s.length);
        for (var i = 0; i < s.length; ++i) {
            var c = s.charCodeAt(i);
            if (c >= 128) {
                throw Error("Only ASCII paths are suppored :-(");
            }
            result[i] = c;
        }
        return result;
    }

    function convert_CLSID_to_DATA(s) {
        var idx = [[6,2], [4,2], [2,2], [0,2],
                   [11,2], [9,2], [16,2], [14,2],
                   [19,4], [24,12]];
        s = idx.map(function (ii) {
            return s.substr(ii[0], ii[1]);
        });
        return hex_to_arr(s.join(''));
    }

    function gen_IDLIST(s) {
        var item_size = (0x10000 + s.length + 2).toString(16).substr(1);
        return hex_to_arr(item_size.replace(/(..)(..)/, '$2$1')).concat(s);
    }

    var HeaderSize = [0x4c, 0x00,0x00,0x00],
        LinkCLSID = convert_CLSID_to_DATA("00021401-0000-0000-c000-000000000046"),
        LinkFlags = [0x01,0x01,0x00,0x00], // HasLinkTargetIDList ForceNoLinkInfo

        FileAttributes_Directory = [0x10,0x00,0x00,0x00],
        FileAttributes_File = [0x20,0x00,0x00,0x00],

        CreationTime = [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
        AccessTime = [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
        WriteTime = [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],

        FileSize = [0x00,0x00,0x00,0x00],
        IconIndex = [0x00,0x00,0x00,0x00],
        ShowCommand = [0x01,0x00,0x00,0x00], //SW_SHOWNORMAL
        Hotkey = [0x00,0x00], // No Hotkey
        Reserved = [0x00,0x00],
        Reserved2 = [0x00,0x00,0x00,0x00],
        Reserved3 = [0x00,0x00,0x00,0x00],
        TerminalID = [0x00,0x00],

        CLSID_Computer = convert_CLSID_to_DATA("20d04fe0-3aea-1069-a2d8-08002b30309d"),
        CLSID_Network = convert_CLSID_to_DATA("208d2c60-3aea-1069-a2d7-08002b30309d"),

        PREFIX_LOCAL_ROOT = [0x2f],
        PREFIX_FOLDER = [0x31,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
        PREFIX_FILE = [0x32,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
        PREFIX_NETWORK_ROOT = [0xc3,0x01,0x81],
        PREFIX_NETWORK_PRINTER = [0xc3,0x02,0xc1],

        END_OF_STRING = [0x00];

    if (/.*\\+$/.test(lnk_target)) {
        lnk_target = lnk_target.replace(/\\+$/g, '');
        var target_is_folder = true;
    }

    var prefix_root, item_data, target_root, target_leaf;
    if (lnk_target.substr(0, 2) === '\\\\') {
        prefix_root = PREFIX_NETWORK_ROOT;
        item_data = [0x1f, 0x58].concat(CLSID_Network);
        target_root = lnk_target.subtr(lnk_target.lastIndexOf('\\'));
        if (/\\\\.*\\.*/.test(lnk_target)) {
            target_leaf = lnk_target.substr(lnk_target.lastIndexOf('\\') + 1);
        }
        if (target_root === '\\') {
            target_root = lnk_target;
        }
    } else {
        prefix_root = PREFIX_LOCAL_ROOT;
        item_data = [0x1f, 0x50].concat(CLSID_Computer);
        target_root = lnk_target.replace(/\\.*$/, '\\');
        if (/.*\\.*/.test(lnk_target)) {
            target_leaf = lnk_target.replace(/^.*?\\/, '');
        }
    }

    var prefix_of_target, file_attributes;
    if (!target_is_folder) {
        prefix_of_target = PREFIX_FILE;
        file_attributes = FileAttributes_File;
    } else {
        prefix_of_target = PREFIX_FOLDER;
        file_attributes = FileAttributes_Directory;
    }

    target_root = str_to_arr(target_root);
    for (var i = 1; i <= 21; ++i) {
        target_root.push(0);
    }

    var id_list_items = gen_IDLIST(item_data);
    id_list_items = id_list_items.concat(
            gen_IDLIST(prefix_root.concat(target_root, END_OF_STRING)));
    if (target_leaf) {
        target_leaf = str_to_arr(target_leaf);
        id_list_items = id_list_items.concat(
                gen_IDLIST(prefix_of_target.concat(target_leaf, END_OF_STRING)));
    }
    var id_list = gen_IDLIST(id_list_items);

    var data = [].concat(HeaderSize,
                         LinkCLSID,
                         LinkFlags,
                         file_attributes,
                         CreationTime,
                         AccessTime,
                         WriteTime,
                         FileSize,
                         IconIndex,
                         ShowCommand,
                         Hotkey,
                         Reserved,
                         Reserved2,
                         Reserved3,
                         id_list,
                         TerminalID);
    return new Blob([new Uint8Array(data)], { type: 'application/x-ms-shortcut' });
}

// Here's where the action takes place
var blob = create_lnk_blob(OS.Path.join(OS.Constants.Path.desktopDir, 'new try.txt'));
var dFile = Services.dirsvc.get('Desk', Ci.nsIFile);
dFile.append('Fx.lnk');
//let desktop = "C:\Users\CBaker\Desktop";
//let desktop = "C:\\tmp";
//dFile.initWithPath(desktop);
//dFile.append("Fx.lnk");
dumpToFile(dFile,blob)