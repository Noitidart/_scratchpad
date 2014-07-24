var Livemailer = {
    init: function() {
        if(gBrowser) gBrowser.addEventListener("DOMContentLoaded", this.onPageLoad, false);
    },
    onPageLoad: function(aEvent) {
      var doc = aEvent.originalTarget;
      
      var xpath = "//a[starts-with(@href,'mailto:')]";        
      var res = doc.evaluate(xpath, doc, null,
                                    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
        
        var linkIndex, mailtoLink;
        for (linkIndex = 0; linkIndex < res.snapshotLength; linkIndex++) { 
            mailtoLink = res.snapshotItem(linkIndex);
                        
            var m = mailtoLink.href,
            html = mailtoLink.innerHTML;
            var matches = m.match(/^mailto:([^\?]+)(\?([^?]*))?/);
            var emailTo, params, emailCC, emailSubject, emailBody;
            
            emailTo = matches[1];
            
            params = matches[3];
            if (params) {
                var splitQS = params.split('&');
                var paramIndex, param;
            
                for (paramIndex = 0; paramIndex < splitQS.length; paramIndex++) {
                    param = splitQS[paramIndex];
                    nameValue = param.match(/([^=]+)=(.*)/);
                    if (nameValue && nameValue.length == 3) {                   
                        switch(nameValue[1]) {
                            case "to":
                                //emailTo = emailTo.replace('@','%40');
                                emailTo = emailTo + "%2C%20" + nameValue[2];
                                break;
                            case "cc":
                                emailCC = nameValue[2];
                                break;
                            case "subject":
                                emailSubject = nameValue[2];
                                break;
                            case "body":
                                emailBody = nameValue[2];
                                break;
                        }
                    }
                }
            }
                    
            mailtoLink.href = "https://mail.live.com/default.aspx?rru=compose" + 
                (emailTo ? ("&to=" + emailTo) : "") + 
                (emailCC ? ("&cc=" + emailCC) : "") +
                (emailSubject ? ("&subject=" + emailSubject) : "") +
                (emailBody ? ("&body=" + emailBody) : "");
            mailtoLink.innerHTML = html;
        }
     }
}

window.addEventListener("load", function load(event){
    window.removeEventListener("load", load, false);
    Livemailer.init(); 
},false);