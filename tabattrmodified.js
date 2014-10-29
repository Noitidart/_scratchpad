try {
  gBrowser.tabContainer.removeEventListener("TabAttrModified", tabclosee, false);
} catch(ex) {
  console.warn('try, ex:', ex);
}

function tabclosee(e) {
  console.log('TabClose, e:', e);
  return false;
}

gBrowser.tabContainer.addEventListener("TabAttrModified", tabclosee, false);