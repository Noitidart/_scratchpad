initSHA1(this); //onload must run this once

var HTTPMethod = 'POST';
var requestURL = 'https://api.twitter.com/oauth/request_token';
var APIKey = 'AjONvgAdbD8YWCtRn5U9yA'; //also known as oauth_consumer_key //from your app page on twitter dev site
var ConsumerSecret = 'jrcJKxvJ92NeeV48RL1lotN9PigbxCCbqUkKj237yio'; //from your app page on twitter dev site
var OAuthTokenSecret = '';

var param = {
    oauth_callback: rawurlencode('http://www.floppers.comyr'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: 0, //running setTimestampNonceSignature() will update this
    oauth_version: '1.0',
    oauth_consumer_key: APIKey, //api key u get from ur app page on twiitter
    oauth_signature: 0, //running setTimestampNonceSignature() will update this //to make the function i followed steps here to create my gen function: https://dev.twitter.com/docs/auth/creating-signature
    oauth_nonce: 0 //running setTimestampNonceSignature() will update this
}
//then first run this func
setTimestampNonceSignature();
//then can run post
var labelHTTP = 'twit api requesting token';

HTTP(HTTPMethod, requestURL, {
    body: '',
    returnHeaders: true,
    headers: {
        Authorization: 'OAuth ' + OAuthHeaderFromParam(param)
    },
    onSuccess: function(status, responseXML, responseText, headers, statusText) {

            Cu.reportError('SUCCESS: ' + labelHTTP + '\n\nstatusText:' + statusText + '\nresponseText:' + responseText + '\nheaders:' + uneval(headers));

        },
        onFailure: function(status, responseXML, responseText, headers, statusText) {

            Cu.reportError('FAIL: ' + labelHTTP + '\n\nstatusText:' + statusText + '\nresponseText:' + responseText + '\nheaders:' + uneval(headers));
            //var response = JSON.parse(responseText);
        }
});


function OAuthHeaderFromParam(param) {
    //param is an object of key value pairs of post data
    //this returns a string of it
    ////key1="val1", key2="val2", key3="val3"....
    var header = [];
    for (var p in param) {
        header.push(p + '="' + param[p] + '"');
    }
    return header.join(', ');
}

function setTimestampNonceSignature() {
    param.oauth_timestamp = Math.floor(new Date().getTime()/1000);
    param.oauth_nonce = _nonce();

    //start gen signature
    //param.oauth_signature = ''; //no need for thsi line as we overwrite sig val
    var combine = [];
    var keys = [];
    for (var p in param) {
        if (p == 'oauth_signature') {
            continue;
        }
        keys.push(p);
    }
    keys.sort(); //sorts it lexographically

    //NOTE: important: values in param must not be urlencoded
    for (var i=0; i<keys.length; i++) {
        combine.push(rawurlencode(keys[i]) + '=' + rawurlencode(param[keys[i]]));
    }

    var ParameterString = combine.join('&');
    //Cu.reportError('ParameterString = ' + ParameterString);

    var combine =  [HTTPMethod.toUpperCase(), rawurlencode(requestURL), rawurlencode(ParameterString)];
    var SignatureBaseString = combine.join('&');

    //Cu.reportError('SignatureBaseString = ' + SignatureBaseString);

    var SigningKey = rawurlencode(ConsumerSecret) + '&';
    if (OAuthTokenSecret && OAuthTokenSecret.length > 0) {
        SigningKey += rawurlencode(OAuthTokenSecret);
    }

    //Cu.reportError('SigningKey = ' + SigningKey);

    //signature done
    param.oauth_signature = calcHMAC(SignatureBaseString, SigningKey);

    //Cu.reportError('param.oauth_signature = ' + param.oauth_signature);
    param.oauth_signature = rawurlencode(param.oauth_signature);
}




/*************************************************************/
/////LIBRARY FUNCTIONS BELOW NOT IMPORTANT FOR STACKOVERFLOW HELP
/*************************************************************/
















//https://gist.github.com/Noitidart/9087938
    function _nonce(length) {
        if (typeof length === "undefined") {
            length = 8;
        }
        if (length < 1) {
            console.warn("Invalid nonce length.");
        }
        var nonce = "";
        for (var i = 0; i < length; i++) {
            var character = Math.floor(Math.random() * 61);
            nonce += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz".substring(character, character + 1);
        }
        return nonce;
    };

//from: https://github.com/kvz/phpjs/blob/master/functions/url/rawurlencode.js
//also found at: http://phpjs.org/functions/rawurlencode/
function rawurlencode(str) {
  //       discuss at: http://phpjs.org/functions/rawurlencode/
  //      original by: Brett Zamir (http://brett-zamir.me)
  //         input by: travc
  //         input by: Brett Zamir (http://brett-zamir.me)
  //         input by: Michael Grier
  //         input by: Ratheous
  //      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: Joris
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //             note: This reflects PHP 5.3/6.0+ behavior
  //             note: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
  //             note: pages served as UTF-8
  //        example 1: rawurlencode('Kevin van Zonneveld!');
  //        returns 1: 'Kevin%20van%20Zonneveld%21'
  //        example 2: rawurlencode('http://kevin.vanzonneveld.net/');
  //        returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
  //        example 3: rawurlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
  //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'

  str = (str + '')
    .toString();

  // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
  // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .
  replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

//HTTPWRapper from https://gist.github.com/Noitidart/9088113
/** 
 * The following keys can be sent:
 * onSuccess (required)  a function called when the response is 2xx
 * onFailure             a function called when the response is not 2xx
 * username              The username for basic auth
 * password              The password for basic auth
 * overrideMimeType      The mime type to use for non-XML response mime types
 * timeout               A timeout value in milliseconds for the response
 * onTimeout             A function to call if the request times out.
 * body                  A string containing the entity body of the request
 * contentType           The content type of the entity body of the request
 * headers               A hash of optional headers
 * returnHeaders         Set to true if want headers returned in the "headers" var of the onSuccess etc
 */
function HTTP(method,url,options)
{
   var requester = new XMLHttpRequest();

   var timeout = null;
   if (!options.synchronizedRequest) {

      requester.onreadystatechange = function() {
         switch (requester.readyState) {
            case 0:
               if (options.onUnsent) {
                  options.onUnsent(requester);
               }
            break;
            case 1:
               if (options.onOpened) {
                  options.onOpened(requester);
               }
            break;
            case 2:
               if (options.onHeaders) {
                  options.onHeaders(requester);
               }
            break;
            case 3:
               if (options.onLoading) {
                  options.onLoading(requester);
               }
            break;
            case 4:
               if (timeout) {
                  clearTimeout(timeout);
               }
               if (requester.status==0 || (requester.status>=200 && requester.status<300)) {
                  options.onSuccess(
                     requester.status,
                     requester.responseXML,
                     requester.responseText,
                     options.returnHeaders ? _HTTP_parseHeaders(requester.getAllResponseHeaders()) : null,
                     requester.statusText
                  );
               } else {
                  if (options.onFailure) {
                     options.onFailure(
                        requester.status,
                        requester.responseXML,
                        requester.responseText,
                        options.returnHeaders ? _HTTP_parseHeaders(requester.getAllResponseHeaders()) : null,
                        requester.statusText
                     );
                  }
               }
            break;
         }
      }
   }

   if (options.overrideMimeType) {
      requester.overrideMimeType(options.overrideMimeType);
   }   
   if (options.username) {
      requester.open(method,url,!options.synchronizedRequest,options.username,options.password);
   } else {
      requester.open(method,url,!options.synchronizedRequest);
   }

   if (options.timeout && !options.synchronizedRequest) {
      timeout = setTimeout(
          function() {
             var callback = options.onTimeout ? options.onTimeout : options.onFailure;
             callback(0,"Operation timeout.");
          },
          options.timeout
      );
   }
   if (options.headers) {
      for (var name in options.headers) {
         requester.setRequestHeader(name,options.headers[name]);
      }
   }
   if (options.sendAsBinary) {
        Cu.reportError('sending as binary');
       requester.sendAsBinary(options.body);
   } else if (options.body) {
      requester.setRequestHeader("Content-Type",options.contentType);
      requester.send(options.body);
   } else {
      requester.send(null);
   }
   if (options.synchronizedRequest) {
      if (requester.status==0 || (requester.status>=200 && requester.status<300)) {
         options.onSuccess(
            requester.status,
            requester.responseXML,
            requester.responseText,
            options.returnHeaders ? _HTTP_parseHeaders(requester.getAllResponseHeaders()) : null,
            requester.statusText
         );
      } else {
         if (options.onFailure) {
            options.onFailure(
               requester.status,
               requester.responseXML,
               requester.responseText,
               options.returnHeaders ? _HTTP_parseHeaders(requester.getAllResponseHeaders()) : null,
               requester.statusText
            );
         }
      }
      return {
         abort: function() {
         }
      };
   } else {
      return {
         abort: function() {
            clearTimeout(timeout);
            requester.abort();
         }
      };
   }
}

var _HTTP_HEADER_NAME = new RegExp("^([a-zA-Z0-9_-]+):");
function _HTTP_parseHeaders(headerText)
{
   var headers = {};
   if (headerText) {
      var eol = headerText.indexOf("\n");
      while (eol>=0) {
         var line = headerText.substring(0,eol);
         headerText = headerText.substring(eol+1);
         while (headerText.length>0 && !headerText.match(_HTTP_HEADER_NAME)) {
            eol = headerText.indexOf("\n");
            var nextLine = eol<0 ? headerText : headerText.substring(0,eol);
            line = line+' '+nextLine;
            headerText = eol<0 ? "" : headerText.substring(eol+1);
         }
         // Parse the name value pair
         var colon = line.indexOf(':');
         var name = line.substring(0,colon);
         var value = line.substring(colon+1);
         headers[name] = value;
         eol = headerText.indexOf("\n");
      }
      if (headerText.length>0) {
         var colon = headerText.indexOf(':');
         var name = headerText.substring(0,colon);
         var value = headerText.substring(colon+1);
         headers[name] = value;
      }
   }
   return headers;
}




function calcHMAC(input, inputKey) { //MUST place this function below the block of yucky code above
    //currently set up to take inputText and inputKey as text and give output as SHA-1 in base64
    //var inputText = 'stuff you want to convert'; //must be text, if you use Base64 or HEX then change hmacInputType on line 34
    //var inputKey = 'key to use in conversion'; //must be text, if you use Base64 or HEX then change hmacKeyInputType on line 35
    try {
        var hmacInputType = 'TEXT'; //other values: B64, HEX
        var hmacKeyInputType = 'TEXT'; //other values: B64, HEX
        var hmacVariant = 'SHA-1'; //other values NOT SUPPORTED because js for it was stripped out of the src code for optimization: SHA-224, SHA-256, SHA-384, SHA-512
        var hmacOutputType = 'B64';
        var hmacObj = new jsSHA(input, hmacInputType);

        return hmacObj.getHMAC(
            inputKey,
            hmacKeyInputType,
            hmacVariant,
            hmacOutputType
        );
    } catch(e) {
        return e
    }
}

/*
 A JavaScript implementation of the SHA-1 ONLY hash, as
 defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
 as defined in FIPS PUB 198a

 Copyright Brian Turek 2008-2013
 Distributed under the BSD License
 See http://caligatio.github.com/jsSHA/ for more information

 Several functions taken from Paul Johnston
*/
function initSHA1(A){function q(a,d,b){var f=0,e=[0],c="",g=null,c=b||"UTF8";if("UTF8"!==c&&"UTF16"!==c)throw"encoding must be UTF8 or UTF16";if("HEX"===d){if(0!==a.length%2)throw"srcString of HEX type must be in byte increments";g=t(a);f=g.binLen;e=g.value}else if("ASCII"===d||"TEXT"===d)g=v(a,c),f=g.binLen,e=g.value;else if("B64"===d)g=w(a),f=g.binLen,e=g.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";this.getHash=function(a,b,c,d){var g=null,h=e.slice(),k=f,m;3===arguments.length?"number"!==
typeof c&&(d=c,c=1):2===arguments.length&&(c=1);if(c!==parseInt(c,10)||1>c)throw"numRounds must a integer >= 1";switch(b){case "HEX":g=x;break;case "B64":g=y;break;default:throw"format must be HEX or B64";}if("SHA-1"===a)for(m=0;m<c;m++)h=s(h,k),k=160;else throw"Chosen SHA variant is not supported";return g(h,z(d))};this.getHMAC=function(a,b,d,g,q){var h,k,m,l,r=[],u=[];h=null;switch(g){case "HEX":g=x;break;case "B64":g=y;break;default:throw"outputFormat must be HEX or B64";}if("SHA-1"===d)k=64,l=
160;else throw"Chosen SHA variant is not supported";if("HEX"===b)h=t(a),m=h.binLen,h=h.value;else if("ASCII"===b||"TEXT"===b)h=v(a,c),m=h.binLen,h=h.value;else if("B64"===b)h=w(a),m=h.binLen,h=h.value;else throw"inputFormat must be HEX, TEXT, ASCII, or B64";a=8*k;b=k/4-1;if(k<m/8){if("SHA-1"===d)h=s(h,m);else throw"Unexpected error in HMAC implementation";h[b]&=4294967040}else k>m/8&&(h[b]&=4294967040);for(k=0;k<=b;k+=1)r[k]=h[k]^909522486,u[k]=h[k]^1549556828;if("SHA-1"===d)d=s(u.concat(s(r.concat(e),
a+f)),a+l);else throw"Unexpected error in HMAC implementation";return g(d,z(q))}}function v(a,d){var b=[],f,e=[],c=0,g;if("UTF8"===d)for(g=0;g<a.length;g+=1)for(f=a.charCodeAt(g),e=[],2048<f?(e[0]=224|(f&61440)>>>12,e[1]=128|(f&4032)>>>6,e[2]=128|f&63):128<f?(e[0]=192|(f&1984)>>>6,e[1]=128|f&63):e[0]=f,f=0;f<e.length;f+=1)b[c>>>2]|=e[f]<<24-c%4*8,c+=1;else if("UTF16"===d)for(g=0;g<a.length;g+=1)b[c>>>2]|=a.charCodeAt(g)<<16-c%4*8,c+=2;return{value:b,binLen:8*c}}function t(a){var d=[],b=a.length,f,
e;if(0!==b%2)throw"String of HEX type must be in byte increments";for(f=0;f<b;f+=2){e=parseInt(a.substr(f,2),16);if(isNaN(e))throw"String of HEX type contains invalid characters";d[f>>>3]|=e<<24-f%8*4}return{value:d,binLen:4*b}}function w(a){var d=[],b=0,f,e,c,g,p;if(-1===a.search(/^[a-zA-Z0-9=+\/]+$/))throw"Invalid character in base-64 string";f=a.indexOf("=");a=a.replace(/\=/g,"");if(-1!==f&&f<a.length)throw"Invalid '=' found in base-64 string";for(e=0;e<a.length;e+=4){p=a.substr(e,4);for(c=g=0;c<
p.length;c+=1)f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(p[c]),g|=f<<18-6*c;for(c=0;c<p.length-1;c+=1)d[b>>2]|=(g>>>16-8*c&255)<<24-b%4*8,b+=1}return{value:d,binLen:8*b}}function x(a,d){var b="",f=4*a.length,e,c;for(e=0;e<f;e+=1)c=a[e>>>2]>>>8*(3-e%4),b+="0123456789abcdef".charAt(c>>>4&15)+"0123456789abcdef".charAt(c&15);return d.outputUpper?b.toUpperCase():b}function y(a,d){var b="",f=4*a.length,e,c,g;for(e=0;e<f;e+=3)for(g=(a[e>>>2]>>>8*(3-e%4)&255)<<16|(a[e+1>>>
2]>>>8*(3-(e+1)%4)&255)<<8|a[e+2>>>2]>>>8*(3-(e+2)%4)&255,c=0;4>c;c+=1)b=8*e+6*c<=32*a.length?b+"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(g>>>6*(3-c)&63):b+d.b64Pad;return b}function z(a){var d={outputUpper:!1,b64Pad:"="};try{a.hasOwnProperty("outputUpper")&&(d.outputUpper=a.outputUpper),a.hasOwnProperty("b64Pad")&&(d.b64Pad=a.b64Pad)}catch(b){}if("boolean"!==typeof d.outputUpper)throw"Invalid outputUpper formatting option";if("string"!==typeof d.b64Pad)throw"Invalid b64Pad formatting option";
return d}function B(a,d){return a<<d|a>>>32-d}function C(a,d,b){return a^d^b}function D(a,d,b){return a&d^~a&b}function E(a,d,b){return a&d^a&b^d&b}function F(a,d){var b=(a&65535)+(d&65535);return((a>>>16)+(d>>>16)+(b>>>16)&65535)<<16|b&65535}function G(a,d,b,f,e){var c=(a&65535)+(d&65535)+(b&65535)+(f&65535)+(e&65535);return((a>>>16)+(d>>>16)+(b>>>16)+(f>>>16)+(e>>>16)+(c>>>16)&65535)<<16|c&65535}function s(a,d){var b=[],f,e,c,g,p,q,s=D,t=C,v=E,h=B,k=F,m,l,r=G,u,n=[1732584193,4023233417,2562383102,
271733878,3285377520];a[d>>>5]|=128<<24-d%32;a[(d+65>>>9<<4)+15]=d;u=a.length;for(m=0;m<u;m+=16){f=n[0];e=n[1];c=n[2];g=n[3];p=n[4];for(l=0;80>l;l+=1)b[l]=16>l?a[l+m]:h(b[l-3]^b[l-8]^b[l-14]^b[l-16],1),q=20>l?r(h(f,5),s(e,c,g),p,1518500249,b[l]):40>l?r(h(f,5),t(e,c,g),p,1859775393,b[l]):60>l?r(h(f,5),v(e,c,g),p,2400959708,b[l]):r(h(f,5),t(e,c,g),p,3395469782,b[l]),p=g,g=c,c=h(e,30),e=f,f=q;n[0]=k(f,n[0]);n[1]=k(e,n[1]);n[2]=k(c,n[2]);n[3]=k(g,n[3]);n[4]=k(p,n[4])}return n}"function"===typeof define&&
typeof define.amd?define(function(){return q}):"undefined"!==typeof exports?"undefined"!==typeof module&&module.exports?module.exports=exports=q:exports=q:A.jsSHA=q};