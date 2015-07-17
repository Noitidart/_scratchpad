var rooms = [
  'extdev',
  //'fx-team',
  'linux',
  'windev',
  'macdev',
  //'media',
  'introduction',
  //'ux',
  'jsctypes',
  'nightly',
  //'amo',
  'mobile'
];

//var doc = gBrowser.contentDocument;
//var me = Services.ww.activeWindow;
//me.prompt('', doc.body.innerHTML)

var inputs = document.querySelectorAll('input[spellcheck]')
for (var i=0; i<rooms.length; i++) {
  var str = '/join #' + rooms[i];
  inputs[1].value = str;
  
  //send enter key
  var event = document.createEvent('KeyboardEvent');
  event.initKeyEvent('keypress',       // typeArg,                                                           
                     true,             // canBubbleArg,                                                        
                     true,             // cancelableArg,                                                       
                     null,             // viewArg,  Specifies UIEvent.view. This value may be null.     
                     false,            // ctrlKeyArg,                                                               
                     false,            // altKeyArg,                                                        
                     false,            // shiftKeyArg,                                                      
                     false,            // metaKeyArg,                                                       
                     13,               // keyCodeArg,                                                      
                     0);              // charCodeArg);
  inputs[1].dispatchEvent(event);
}