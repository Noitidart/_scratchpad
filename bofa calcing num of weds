var td = document.querySelector('tr td.date-action');
var tr = td.parentNode;
var insertAfter = tr.previousSibling;
var st = new Date('January 29, 2014')
var lastDate = new Date('May 21, 2014');
var i=0;
while (st < lastDate) {
  var trClone = tr.cloneNode(true);
  var dateSpan = trClone.querySelector('.date-action span:last-of-type');
  //alert(dateSpan)
  var month = '0' + (st.getMonth() + 1);
  var date = st.getDate();
  if (date < 10) { date = '0' + date; }
  dateSpan.innerHTML =  month + '/' + date + '/' + st.getFullYear();
  var desc = trClone.querySelector('.transTitleForEditDesc');
  
  var tdate = new Date(st.getTime() - 86400000 - 86400000);
  var tmonth = tdate.getMonth() + 1;
  var tdatee = tdate.getDate();
  if (tdatee < 10) { tdatee = '0' + tdatee; }
  desc.innerHTML = 'CHECKCARD 0' + tmonth + tdatee +' SJSU PARKING SERVICES SAN ';
  tr.parentNode.insertBefore(trClone, insertAfter.nextSibling);
  i++;
  st.setTime(st.getTime() + (86400000 * 7));
}
i--;
alert('# of wed = ' + i)