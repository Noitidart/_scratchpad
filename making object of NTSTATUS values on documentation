var d = document.querySelectorAll('.FixedWidth-40-60 tr');

var out = [];
var out2 = [];
for (var i=1; i<d.length; i++) {
  var txt = d[i].querySelector('td').innerHTML;
  var m = /<p>(.*?)<br>(.*?)<\/p>/.exec(txt);
  if (!m) {
    alert('error on txt=' + txt);
    break;
  }
  out.push(m[2] + ':' + m[1]);
  out2.push('\'' + eval(m[1] + '>>0') + '\':\'' + m[2] + '\'');
  //alert(parseInt(m[1]))
  //break;
}

prompt('', 'var NTSTATUS_NAME_TO_HEX = {' + out.join(',') + '}'); //stored as NAME: HEX
prompt('', 'var NTSTATUS_DEC_TO_NAME = {' + out2.join(',') + '}');