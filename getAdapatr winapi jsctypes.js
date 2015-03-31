Cu.import('resource://gre/modules/ctypes.jsm');
function getMacAddress(){

    var MAX_ADAPTER_NAME_LENGTH = 256;
    var MAX_ADAPTER_DESCRIPTION_LENGTH = 128;
    var ERROR_BUFFER_OVERFLOW = 111;
    var NO_ERROR = 0;
    var MAX_ADAPTER_ADDRESS_LENGTH = 8;

    var IP_ADDRESS_STRING = ctypes.StructType('IP_ADDRESS_STRING',[
        {'String': ctypes.char.array(4 * 4)}
    ]);

    var IP_MASK_STRING = ctypes.StructType('IP_MASK_STRING',[
        {'String': ctypes.char.array(4 * 4)}
    ]);


    var DWORD = ctypes.unsigned_long;

    var IP_ADDR_STRING = ctypes.StructType('IP_ADDR_STRING');
    IP_ADDR_STRING.define([
        {'Next': IP_ADDR_STRING.ptr},
        {'IpAddress': IP_ADDRESS_STRING},
        {'IpMask': IP_MASK_STRING},
        {'Context': DWORD}
    ]);
    var PIP_ADDR_STRING = IP_ADDR_STRING.ptr;

    var time_t = ctypes.long; // based on this github search https://github.com/search?utf8=%E2%9C%93&q=time_t+ctypes&type=Code&ref=searchresults AND based on this answer here: http://stackoverflow.com/a/471287/1828637

    var IP_ADAPTER_INFO = ctypes.StructType('IP_ADAPTER_INFO');

    IP_ADAPTER_INFO.define([ // have to use .define because one of the fields "Next" is a ptr to itself
        {'Next': IP_ADAPTER_INFO.ptr},
        {'ComboIndex': DWORD},
        {'AdapterName': ctypes.char.array(MAX_ADAPTER_NAME_LENGTH + 4)},
        {'Description': ctypes.char.array(MAX_ADAPTER_DESCRIPTION_LENGTH + 4)},
        {'AddressLength': ctypes.unsigned_int},
        {'Address': ctypes.unsigned_char.array(MAX_ADAPTER_ADDRESS_LENGTH)}, // BYTE is ctypes.unsigned_char
        {'Index': DWORD},
        {'Type': ctypes.unsigned_int},
        {'DhcpEnabled': ctypes.unsigned_int},
        {'CurrentIpAddress': PIP_ADDR_STRING},
        {'IpAddressList': IP_ADDR_STRING},
        {'GatewayList' : IP_ADDR_STRING},
        {'DhcpServer': IP_ADDR_STRING},
        {'HaveWins': ctypes.bool},
        {'PrimaryWinsServer': IP_ADDR_STRING},
        {'SecondaryWinsServer':IP_ADDR_STRING},
        {'LeaseObtained': time_t},
        {'LeaseExpires': time_t}
    ]);

    var lib = ctypes.open(ctypes.libraryName('IPHLPAPI'));

    try{
        if(!lib)
            return null

        console.log("Biblioteca aberta!");

        /*DWORD GetAdaptersInfo(
          _Out_    PIP_ADAPTER_INFO pAdapterInfo,
          _Inout_  PULONG pOutBufLen
        );*/
        var getAdaptersInfo = lib.declare("GetAdaptersInfo", ctypes.winapi_abi,
            DWORD,
            IP_ADAPTER_INFO.array(),
            ctypes.unsigned_long.ptr
        );


        let pbuf = IP_ADAPTER_INFO.array(0)();
        console.info('pbuf.length:', pbuf, pbuf.length, 'IP_ADAPTER_INFO.size:', IP_ADAPTER_INFO.size, 'pbuf size:', pbuf.length * IP_ADAPTER_INFO.size);
        let ret = ctypes.unsigned_long(pbuf.length * IP_ADAPTER_INFO.size);

        let sts = getAdaptersInfo(pbuf, ret.address()); // initial fetch to get size needed
        console.info('sts:', ctypes.UInt64.lo(sts));
        console.info('sts:', sts, sts.toString(), uneval(sts));
        console.info('ret:', ret, ret.toString(), uneval(ret));

        if(sts == ERROR_BUFFER_OVERFLOW){ //o tamanho do buffer enviado não foi o suficiente.
            // ret is defined as unsigned_long which is always a UInt64 in jsctypes `CData { value: UInt64 } `
            var ret_jsInt = parseInt(ret.value.toString());
            console.info('ret_jsInt:', ret_jsInt);
            var neededLength = Math.round(ret_jsInt / IP_ADAPTER_INFO.size);
            pbuf = IP_ADAPTER_INFO.array(neededLength)();
            console.info('pbuf RE-size:', pbuf.length * IP_ADAPTER_INFO.size);

            if (pbuf.length * IP_ADAPTER_INFO.size != ret_jsInt) {
                throw new Error('winapi says the size needed is ' + ret_jsInt + ' and i calculated the length by dividing the ID_ADAPTER_INFO.size which is ' + ID_ADAPTER_INFO.size + ' so the needed length was  ' + neededLength + ' but the size of this list of neededLength DOES NOT match what winapi says it needs, the size of the neededLength resized list is ' + (pbuf.length * IP_ADAPTER_INFO.size));
            }

            //agora mando novamente usando o que a lib me retornou.
            console.error('going for 2nd time');

            sts = getAdaptersInfo(pbuf, ret.address()); // we just pass same ret, as it was updated to the right size // crashing here!!!
            if (sts != NO_ERROR) {
                throw new Error('after 2nd fetch it still failed, now i need to add more error handling here, error was: ' + sts.toString());
            } else {
                console.info('succesfully obtained after 2nd time:', pbuf.toString());
                for (var i=0; i<pbuf.length; i++) {
                    console.log(i, pbuf[i].addressOfField('AdapterName').contents.readString(), pbuf[i].addressOfField('IpAddressList').contents.IpAddress.String.readString(), pbuf[i].addressOfField('Description').contents.readString());
                }
            }
        } else {
            console.error('this should never happen! i passed 0 size into it it should always overflow!! unless there is no adapater info but there has to be!!');
        }
        /*
        if(sts != NO_ERROR){ //aqui ocorreu um erro que não conseguiremos resolver ainda.
            throw Error("Erro buscando configuracoes do adaptador.");
        }
        */

    }catch(ex){
        console.log("Erro na biblioteca", ex, ex.message);
    }finally{
        lib.close();
    }

}

getMacAddress();