try {
  gBrowser.tabContainer.removeEventListener("TabClose", tabclosee, false);
} catch(ex) {
  console.warn('try, ex:', ex);
}

function tabclosee(e) {
  e.multipleActionsPrevented = true;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  e.returnValue = false;
  console.log('TabClose, e:', e);
  return false;
}

gBrowser.tabContainer.addEventListener("TabClose", tabclosee, false);