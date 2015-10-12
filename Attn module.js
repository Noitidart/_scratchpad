var myServices = {
	as: Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService)
};

// requires jsonToDOM function - https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion

var Attn = {
	instance: {}, // object of instances that are alive
	add: function(aId, aDetailsObj) { // reason i have devuser provide aId is because then they can access it in Attn.instance and modify it then call Attn.updateInstance(aId)
		// this is named add, but can also be named init, or push
		// see above aDetailsObj
		// adds the details obj with aId to instance obj and adds to windows etc
		if (aId in Attn.instance) {
			throw new Error('aId already in instance');
		}
		
		Attn.instance[aId] = aDetailsObj;
		
		// desktopNotification
		if (aDetailsObj.desktopNotification) {
			
			var delFromInstance = function() {
				// delete from instances
				delete Attn.instance[aId].desktopNotification;
				
				// check if any other keys in this, if not then delete aId from Attn.instance
				if (Object.keys(Attn.instance[aId]).length == 0) {
					delete Attn.instance[aId];
				}
			};
			
			if (aDetailsObj.desktopNotification.type == 'once') {
				aDetailsObj.desktopNotification.programatic = {}; // note: programatic is things the code adds to handle stuff
				aDetailsObj.desktopNotification.programatic.dismissListener = {
					observe: function(aSubject, aTopic, aData) {
						// aSubject
							// always null
						// aTopic
							// alertfinished - dismissed due to time
							// alertclickcallback - dissmissed due to user click (only happens if set showAlertNotification argument of textClickable to true, otherwise even if user clicks on it, it is dimissed, but alertfinished triggers)
							// alertshow - alert shown
						// aData
							// cookie argument from showAlertNotification
						console.log('desktopNotification dimissListener aTopic:', aTopic, 'aData:', aData);
						
						switch (aTopic) {
							case 'alertfinished':
							
									var deleteFromInstance = true;
									if (aDetailsObj.desktopNotification.callbacks && aDetailsObj.desktopNotification.callbacks.onTimedDismiss) {
										deleteFromInstance = aDetailsObj.desktopNotification.callbacks.onTimedDismiss(aId); // note: make callback return false if you want to handle deleting from Attn.instance yourself
									}
									if (deleteFromInstance) {
										delFromInstance();
									}
							
								break;
							case 'alertclickcallback':
							
									var deleteFromInstance = true;
									if (aDetailsObj.desktopNotification.callbacks && aDetailsObj.desktopNotification.callbacks.onClickDismiss) {
										deleteFromInstance = aDetailsObj.desktopNotification.callbacks.onClickDismiss(aId); // note: make callback return false if you want to handle deleting from Attn.instance yourself
									}
									if (deleteFromInstance) {
										delFromInstance();
									}
							
								break;
							case 'alertshow':
							
									//
							
								break;
							default:
								throw new Error('unrecognized aTopic in dismissListener: "' + aTopic + '", aId: "' + aId + '"');
						}
					}
				};
				var showAlertNotificationArgs = [
					aDetailsObj.desktopNotification.icon,		// imageUrl
					aDetailsObj.desktopNotification.title,		// title
					aDetailsObj.desktopNotification.body,		// text
					false,										// textClickable
					aId,										// cookie
					aDetailsObj.desktopNotification.programatic.dismissListener	// alertListener
					// 'i dont care',							// name
					// 'i dont care',							// dir
					// 'i dont care'							// lang
				];
				
				if (aDetailsObj.desktopNotification.callbacks && aDetailsObj.desktopNotification.callbacks.onClickDismiss) {
					showAlertNotificationArgs[3] = true; // textClickable;
				}
				
				try {
					myServices.as.showAlertNotification.apply(myServices.as.showAlertNotification, showAlertNotificationArgs);
				} catch (ex) {
					// this can fail if notfications are disabled
					delFromInstance();
				}
			} else {
				throw new Error('unsupported type of desktopNotification');
			}
		}
		
		// barNotification
		if (aDetailsObj.barNotification) {
			if (aDetailsObj.barNotification.type == 'browser') {
				
				if (!Attn.instance[aId].programatic) {
					Attn.instance[aId].programatic = {};
				}
				Attn.instance[aId].programatic.barNotification = {
					lastObjOnDomApply: JSON.parse(JSON.stringify(Attn.instance[aId].barNotification)) // note: stored dom elements are wiped, this is only used for comparing when running updateBarDom
				};
				
				// iterate through all open windows and execute updateBarDom with initSingleWindow set to element
				// Attn.updateBarDom(aId, aDOMWindow);
				var DOMWindows = Services.wm.getEnumerator(null);
				while (DOMWindows.hasMoreElements()) {
					var aDOMWindow = DOMWindows.getNext();
					if (aDOMWindow.document.readyState == 'complete') { //on startup `aDOMWindow.document.readyState` is `uninitialized`
						Attn.updateBarDom(aId, aDOMWindow);
					} else {
						aDOMWindow.addEventListener('load', function () {
							aDOMWindow.removeEventListener('load', arguments.callee, false);
							Attn.updateBarDom(aId, aDOMWindow);
						}, false);
					}
				}
				
				// create windowlistener to listen to future opened windows
				aDetailsObj.barNotification.programatic.windowListener = {
					//DO NOT EDIT HERE
					onOpenWindow: function (aXULWindow) {
						// Wait for the window to finish loading
						var aDOMWindow = aXULWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
						aDOMWindow.addEventListener('load', function () {
							aDOMWindow.removeEventListener('load', arguments.callee, false);
							Attn.updateBarDom(aId, aDOMWindow);
						}, false);
					},
					onCloseWindow: function (aXULWindow) {},
					onWindowTitleChange: function (aXULWindow, aNewTitle) {},
				};
				
				Services.wm.addListener(aDetailsObj.barNotification.programatic.windowListener);
			} else {
				throw new Error('aDetailsObj.barNotification not yet supported:' + aDetailsObj.barNotification);
			}
		}
	},
	updateBarDom: function(aId, initSingleWindow) {
		// reads obj to window
		// if initSingleWindow is set to aDOMWindow element, it does the whole process starting at appendNotification, this should only be used by the aDOMWindow loop in `add` and the `onOpenWindow` callback of the window listener added by add
		if (Attn.instance[aId].barNotification.type == 'browser') {
			if (initSingleWindow) {
				// no comparison to remembered obj
			} else {
				// iteratre through all windows, and whatever is different from the remembered obj, to the dom then execute it
			}
		}
	}
};

/* test just desk notif
Attn.add('1', {
	desktopNotification: {
		type: 'once',
		title: 'hi',
		body: 'body'
	}
})
*/