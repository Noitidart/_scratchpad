// <form.t1-form.tweet-form dynamic-photos photo-square-4>
var formTweet = gBrowser.contentDocument.getElementById('global-tweet-dialog-dialog').querySelector('form'); //<form.t1-form.tweet-form has-preview has-thumbnail dynamic-photos photo-square-4>
console.info('gBrowser.contentWindow.wrappedJSObject:', gBrowser.contentWindow.wrappedJSObject);
var dolla = gBrowser.contentWindow.wrappedJSObject.$;
console.info('dolla:', dolla);
console.info('dolla(formTweet):', dolla(formTweet))
/*
dolla(formTweet).trigger('uiGotImageData', {
name: a,
contents: b,
info: c
})
*/