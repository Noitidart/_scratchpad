var el_action_bar = gBrowser.contentDocument.getElementById('watch8-secondary-actions');
if (!el_action_bar) { throw new Error('no action bar found') }

var el_btn_contents = el_action_bar.getElementsByClassName('yt-uix-button-content');
if (!el_btn_contents) { throw new Error('no buttons found') }

for (var i=0; i<el_btn_contents.length; i++) {
  if (el_btn_contents[i].textContent == 'Share ') {
    var el_share_btn_contents = el_btn_contents[i];
    break;
  }
}
if (!el_share_btn_contents) { throw new Error('no share button contents found') }

var el_share_span = el_share_btn_contents;
for (var i=0; i<5; i++) {
  el_share_span = el_share_span.parentNode;
  if (el_share_span.tagName == 'BUTTON') {
    el_share_span = el_share_span.parentNode;
    break;
  }
}
if (el_share_span.tagName != 'SPAN') { throw new Error('no share button found') }

alert('FOUND:' + el_share_span.innerHTML);

var el_lor_span = el_share_span.cloneNode(true);
var el_lor_icon = el_lor_span.querySelector('[class*="button-icon"]');
var el_lor_content = el_lor_span.querySelector('[class*="button-content"]');
el_lor_span.childNodes[0].setAttribute('data-tooltip-text', 'Repeat at ListenOnRepeat.com');
el_lor_icon.style.backgroundImage = 'url("file:///C:/Users/Vayeate/Documents/GitHub/Listen-on-Repeat-Youtube-Video-Repeater/icon.png") !important;';
el_lor_content.textContent = 'Repeat at ListenOnRepeat.com'
el_action_bar.insertBefore(el_lor_span, el_share_span.nextSibling);

/*
<button data-tooltip-text="Share" class="yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon action-panel-trigger   yt-uix-tooltip" type="button" onclick=";return false;" title="Share" data-trigger-for="action-panel-share" data-button-toggle="true"><span class="yt-uix-button-icon-wrapper"><span class="yt-uix-button-icon yt-uix-button-icon-action-panel-share yt-sprite"></span></span><span class="yt-uix-button-content">Share </span></button>
*/