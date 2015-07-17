var myel = document.getAnonymousElementByAttribute(Profilist.PStack.lastChild, 'class', 'profilist-input')
if (Profilist.PStack.lastChild.classList.contains('profilist-edit')) {
  //close it
  Profilist.PStack.lastChild.classList.remove('profilist-edit'); myel.style.clip = 'rect(-1px, -1px, ' + (myel.offsetHeight+1) + 'px, -1px)';
} else {
  // open it
  Profilist.PStack.lastChild.classList.add('profilist-edit'); myel.style.clip = 'rect(-1px, ' + (myel.offsetWidth+1) + 'px, 25px, -1px)';
}