/*	VERSION 1.01
	18JAN2012: modified functions gridRemoveSelectedFromObject(gridobject) and gridRemoveSelectedFromObject(gridobject, deleteTreeStruct) to check for 
	need to save grid store - overcomes error when attempting to add a record that has been deleted from the grid
	20SEP2011 Biologcals Development Team
	members of this library:
	function CONSTANTS() - sets up global constants for use in this library and others
	function consoleLog(e) - prints the contents of the parameter e to the console
	function cleanArray(thing, deleteValue) - removes an array element value and re-splices the array
	function pause(millis) - pauses processing for a defined period: millis [milliseconds paramter]
	function getRadioValue(radioname) - retrieves the checked value of the named html object.
	function getRadioID(radioname) - retrieves the id of the checked value in the named html object
	function clearRadio(radioname) - resets the named/passed radio group to no selection
	function showHide(objectId, onOff, findByNumber, shrinkSize) - switches visibility of an html object
	function classOf(o) - where possible returns the class of an object
	function isArray(obj) - determines if an object is an array
	function getCheckData(checkname, datatype, joinstring) - returns checked values as a concatenated string
	function setCheckByValue(checkname, value, onoff) - checks or unchecks HTML checkbox group values by a value
	function setdijitCheckByValue(checkname, value, onoff) - checks or unchecks DIJIT checkbox group values
	function switchCheckData(checkname, onoff) - checks or unchecks HTML checkbox by name
	function switchDijitCheckData(objectName, onoff, findByNumber) - checks or unchecks DIJIT checkbox by name
	function clearDigitRadio(radioname) - switches off a dijit radio button if it's switched on.
	function getCheckArray(checkname, datatype) - returns checked values as an array
	function getFieldPiece(fieldname, del1, del2) - returns part of a field value based on delimiters
	function setCheckedValue(radioName, newValue) - resets a radio group to unchecked then checks a passed value
	function gridAddEntry(gridobject, oneEntry) - adds an item to a grid
	function formatDegrees(value) - returns a values with the degrees symbol (html)
	function formatFraction(value) - returns fraction format
	function gridRemoveSelected(gridname) - parent function to remove a row from a grid
	function gridRemoveSelectedFromObject(gridobject) - child function, removes selected rows from a grid
	function gridReadSelectedString(gridname, readWhat, theSeparator) - returns particular value(s) [column values as a concat string] from a grid
	function dialogURL(title, url) - creates an instance of a dojo dialog box
	function showObj(objThis) - sets an object visible
	function hideObj(objThis) - sets an object invisible
	function showHideObj(objThis, flag) - sets an object either visible or invisible based on a passed boolean [flag]
	function newSequenceNumber() - generates a unique alpha-numeric string based on the date at the time of calling, eg: 6c8bddff-9a5b-47c4-8368-eed1cb05010e
	function gridRemoveSelectedFromObject(gridobject, deleteTreeStruct) - removes selected rows from a grid
	var deleteTree = function (treeData) - removes items from a json tree
	var StoreDeleteAllItems = function (dataStore) - removes all items from a json tree
	function getIframeDocument(iframe) - returns an iFrame document if available
	function createFrame(iframeName, hideIt, frameURL, width, height, usecounter) - returns a new iFrame
	function isValueChecked(checkboxname, findvalue, exact) - returns true if a definite value is checked in checkbox group
	function dialogText(title, message, onAffirmative, onNegative, onAffirmativeButtonLabel, onNegativeButtonLabel, obj) - returns a 2 button confirmation dialog box
*/

function CONSTANTS() {
	if (/tga.gov.au/gi.test(window.location.host)) {
		this.DEBUGMODE = /debugon/gi.test(window.location.search);
	} else {
		this.DEBUGMODE = true;
	}
	this.HOST = window.location.protocol + "//" + window.location.host;
	this.DBURL = window.location.pathname.substring(0, (window.location.pathname.indexOf('.nsf') + 5));
	this.IE4plus = (document.all) ? true : false;
	this.NS4 = (document.layers) ? true : false;
	var browser = {
		version: {
			text: (navigator.userAgent.toLowerCase().match(/.+(?:rv|it|ra|ie|me)[\/: ]([\d.]+)/)[1] || [])
		},
		chrome: /chrome/.test(navigator.userAgent.toLowerCase()),
		safari: /webkit/.test(navigator.userAgent.toLowerCase()) && !/chrome/.test(navigator.userAgent.toLowerCase()),
		opera: /opera/.test(navigator.userAgent.toLowerCase()),
		msie: /msie/.test(navigator.userAgent.toLowerCase()) && !/opera/.test(navigator.userAgent.toLowerCase()),
		mozilla: /mozilla/.test(navigator.userAgent.toLowerCase()) && !/(compatible|webkit)/.test(navigator.userAgent.toLowerCase())
	}
	this.browser = browser;
	var vstringSplit = browser.version.text.split(".");
	this.browser.version.major = vstringSplit[0];
	this.browser.version.minor = vstringSplit[1];
	this.browser.version.number = parseFloat(vstringSplit[0] + vstringSplit[1]);
	this.browser.version.build = vstringSplit[2];
	this.browser.version.compile = vstringSplit[3];
	this.DataStatus_Initialising = 1;
	this.DataStatus_Loading = 10;
	this.DataStatus_Loaded = 19;
	this.DataStatus_Saving = 20;
	this.DataStatus_Saved = 21;
	this.DataStatus_SavingError = 22;
	this.DataStatus_Validating = 30;
	this.DataStatus_ValidatingFail = 31;
	this.DataStatus_ValidatingSuccess = 32;
	this.DataStatus_Variating = 40;
	this.DataStatus_Updating = 50;
	this.DataStatus_Printing = 60;
	this.DataStatus_PrintPreview = 61;
	this.DataStatus_Closing = 90;
	this.DataStatus_Error = 99;
	this.Cursor_Default = "default";
	this.Cursor_Normal = "default";
	this.Cursor_Arrow = "default";
	this.Cursor_Wait = 'wait';
	this.Cursor_Hand = 'hand';
	this.Cursor_NotAllowed = 'not-allowed';
	this.Cursor_Help = 'help';
	this.Cursor_Crosshair = 'crosshair';
}
var constant = new CONSTANTS();

function consoleLog(e) {
	if (e) {
		if (constant.DEBUGMODE) {
			try {
				if (console) {console.log(e);}
			} catch (e) {}
		}
	}
}
/*
function cleanArray(thing, deleteValue) {
	var thing2 = new Array();
	thing.every(function(x){  IE doesn't like every
		if (x != deleteValue) {
			thing2.push(x);
		};
		return true;
	})
	return thing2;
}
*/
function cleanArray(thing, deleteValue) { for (var i = 0; i < thing.length; i++) { if (thing[i] == deleteValue) { thing.splice(i, 1); i--; } } return thing; };
function pause(millis) {
	var date = new Date();
	var curDate = null;
	do {
		curDate = new Date();
	} while (curDate - date < millis)
}

function getRadioValue(radioname) {
	var thing = document.getElementsByName(radioname);
	for (var i = 0; i < thing.length; i++) if (thing[i].checked) return thing[i].value;
}

function getRadioID(radioname) {
	var thing = document.getElementsByName(radioname);
	for (var i = 0; i < thing.length; i++) if (thing[i].checked) return thing[i].id;
}

function clearRadio(radioname) {
	var thing = document.getElementsByName(radioname);
	for (var i = 0; i < thing.length; i++) thing[i].checked = false;
}

function showHide(objectId, onOff, findByNumber, shrinkSize) {
	if (onOff == 1) {
		visibilityFlag = '';
	} else {
		visibilityFlag = 'none';
	}
	if (findByNumber == 1) {
		for (x = 1; - 1; x++) {
			var testObj = dojo.byId((objectId + x));
			if (testObj) {
				testObj.style.display = visibilityFlag;
			} else {
				break;
			}
		}
	} else {
		var testObj = dojo.byId(objectId);
		if (testObj) {
			testObj.style.display = visibilityFlag;
		}
	}
}

function classOf(o) {
	if (undefined === o) return "undefined";
	if (null === o) return "null";
	return {}.toString.call(o).slice(8, -1);
}

function isArray(obj) {
	if (!obj) return false;
	if (!obj.constructor) return false;
	return Object.prototype.toString.call(obj) == "[object Array]";
}

function getCheckData(checkname, datatype, joinstring) {
	var thing = document.getElementsByName(checkname);
	var x = '';
	for (var i = 0; i < thing.length; i++) {
		if (thing[i].checked) {
			x += (x.length > 0 ? joinstring : '')
			switch (datatype) {
			case 1:
				x += thing[i].innerHTML;
				break;
			case 2:
				x += thing[i].label;
				break;
			case 3:
				x += thing[i].title;
				break;
			default:
				x += thing[i].value;
			}
		}
	}
	return x;
}

function setCheckByValue(checkname, value, onoff) {
	var thing = document.getElementsByName(checkname);
	var switch_onoff = (onoff == true);
	for (var i = 0; i < thing.length; i++) {
		if (isArray(value)) {
			for (var x = 0; x < thing.length; x++) {
				if (thing[i].value == value[x]) {
					thing[i].checked = switch_onoff;
					break;
				}
			}
		} else {
			if (thing[i].value == value) {
				thing[i].checked = switch_onoff;
				break;
			}
		}
	}
}

function setdijitCheckByValue(checkname, value, onoff) {
	var thing = document.getElementsByName(checkname);
	var switch_onoff = (onoff == true);
	for (var i = 0; i < thing.length; i++) {
		var testObj = dijit.byId((checkname + (i + 1)));
		if (isArray(value)) {
			for (var x = 0; x < thing.length; x++) {
				if (testObj.value == value[x]) {
					testObj.set('checked', switch_onoff);
					break;
				}
			}
		} else {
			if (testObj.value == value) {
				testObj.set('checked', switch_onoff);
				break;
			}
		}
	}
}

function switchCheckData(checkname, onoff) {
	var thing = document.getElementsByName(checkname);
	var switch_onoff = onoff == true;
	for (var i = 0; i < thing.length; i++) {
		thing[i].checked = onoff;
	}
}

function switchDijitCheckData(objectName, onoff, findByNumber) {
	var switch_onoff = onoff == true;
	var thing = document.getElementsByName(objectName);
	var x = 1;
	if (findByNumber == 1) {
		for (var i = 0; i < thing.length; i++) {
			var testObj = dijit.byId((objectName + x));
			if (testObj) testObj.set('checked', switch_onoff);
			else break;
			x = x + 1;
		}
	} else {
		var testObj = dijit.byId(objectName);
		if (testObj) testObj.set('checked', switch_onoff);
	}
}

function clearDigitRadio(radioname) {
	var thing = document.getElementsByName(radioname);
	var x = 1;
	for (var i = 0; i < thing.length; i++) {
		var dojothing = radioname + x;
		var testObj = dijit.byId(dojothing);
		if (testObj.checked) testObj.set('checked', false);
		x = x + 1;
	}
}

function getCheckArray(checkname, datatype) {
	var thing = document.getElementsByName(checkname);
	var x = new Array();
	for (var i = 0; i < thing.length; i++) {
		if (thing[i].checked) {
			switch (datatype) {
			case 1:
				x.push(thing[i].innerHTML);
				break;
			case 2:
				x.push(thing[i].label);
				break;
			case 3:
				x.push(thing[i].title);
				break;
			default:
				x.push(thing[i].value);
			}
		}
	}
	return x;
}

function getFieldPiece(fieldname, del1, del2) {
	var tmpfield = document.getElementById(fieldname);
	if (!tmpfield) {
		tmpfield = eval(fieldname);
	}
	var tmptext = tmpfield.get("value").split(del1);
	if (tmptext[1]) {
		tmptext = tmptext[1].split(del2);
		if (tmptext[0]) {
			tmptext = tmptext[0].replace(/^\s+|\s+$/g, "");
		}
	}
	if (tmptext[0]) {
		return tmptext[0];
	}
	return tmptext;
}

function setCheckedValue(radioName, newValue) {
	if (!radioName) return;
	var radioObj = document.getElementsByName(radioName);
	if (!radioObj) return;
	var radioLength = radioObj.length;
	if (radioLength == undefined) {
		radioObj.checked = (radioObj.value == newValue.toString());
		return;
	}
	for (var i = 0; i < radioLength; i++) {
		radioObj[i].checked = false;
		if (radioObj[i].value == newValue.toString()) {
			radioObj[i].checked = true;
		}
	}
}

function gridAddEntry(gridobject, oneEntry) {
	gridobject.newItem(oneEntry);
	gridobject.render();
}

function setSearchStoreValue(radioStr, storeStr, inputStr, otherStr) {
	var radioObjGet = getRadioValue(radioStr);
	if (radioObjGet) {
		var radioObjGetDependant = getRadioValue(otherStr);
		if (radioObjGetDependant) {
			var inputObjGet = eval(inputStr);
			if (inputObjGet) {
				inputObjGet.reset();
				if (radioObjGet == '') {
					var newStoreName = '';
					inputObjGet.readOnly = true;
				} else {
					if (radioObjGetDependant == '') {
						var newStoreName = storeStr + radioObjGet;
						inputObjGet.readOnly = true;
					} else {
						var newStoreName = storeStr + radioObjGetDependant + radioObjGet;
						inputObjGet.store = eval(newStoreName);
						inputObjGet.readOnly = false;
					}
				}
			}
		}
	}
}

function formatDegrees(value) {
	return value + '&deg;';
}

function formatFraction(value) {
	var parts = String(value).split('.');
	if (parts.length < 2) return String(value);
	var whole = parseInt(parts[0]);
	var decimal = parseInt(parts[1], 10);
	var power = Math.pow(10, parts[1].length);
	var gcd = getGCD(decimal, power);
	return ((whole == 0) ? "" : whole + " ") + decimal / gcd + "/" + power / gcd + "&quot;";
}

function getGCD(num, den) {
	var a = num,
		b = den;
	for (var c = a % b; c != 0; a = b, b = c, c = a % b);
	return b;
}

function gridRemoveSelected(gridname) {
	var gridobject = dijit.byId(gridname);
	if (gridobject) {
		gridRemoveSelectedFromObject(gridobject);
		gridobject.render();
		return;
	}
}

function gridReadSelectedString(gridname, readWhat, theSeparator) {
	var gridobject = dijit.byId(gridname);
	var x = '';
	if (gridobject) {
		var selectioncount = gridobject.selection.getSelectedCount();
		if (selectioncount > 0) {
			var theselections = gridobject.selection.getSelected();
			for (i = 0; i <= (selectioncount - 1); i++) {
				if (i > 0) x += theSeparator;
				x += eval('theselections[i].' + readWhat + '[0]');
			}
		}
	}
	gridobject.render();
	return x;
}

function gridRemoveSelectedFromObject(gridobject) {
	var selectioncount = gridobject.selection.getSelectedCount();
	if (selectioncount < 1) {
		dialogText('Nothing Selected', 'Please select one or more rows/items from the list, then select the Remove command');
		return;
	}
	var theselections = gridobject.selection.getSelected();
	for (i = 0; i <= (selectioncount - 1); i++) gridobject.store.deleteItem(theselections[i]);
	if(gridobject.store.isDirty()){
		gridobject.store.save();
	}
	gridobject.rowSelectCell.toggleAllSelection(false);
	gridobject.update();
}

function dialogURL(title, url) {
	dialogBox = new dijit.Dialog;
	dialogBox.titleNode.innerHTML = title;
	dialogBox.setHref(url);
	dialogBox.show();
}

function showObj(objThis) {
	if (objThis != null && objThis.style != null) {
		objThis.style.display = "";
	}
}

function hideObj(objThis) {
	if (objThis != null && objThis.style != null) {
		objThis.style.display = "none";
	}
}

function showHideObj(objThis, flag) {
	if (objThis != null && objThis.style != null) {
		objThis.style.display = flag ? "" : "none";
	}
}

function newSequenceNumber() {
	var nowinMS = (new Date()).valueOf();
	return (nowinMS);
}

function gridRemoveSelectedFromObject(gridobject, deleteTreeStruct) {
	var selectioncount = gridobject.selection.getSelectedCount();
	if (selectioncount < 1) {
		dialogText('Nothing Selected', 'Please select one or more rows/items from the list, then select the Remove command');
	} else {
		dojo.forEach(gridobject.selection.getSelected(), function (selectedItem) {
			if (deleteTreeStruct != null) {
				var itemToDelete = selectedItem;
				var sourceStore = deleteTreeStruct.sourceStore;
				var childFileStoreArrays = deleteTreeStruct.childFileStoreArrays;
				if (sourceStore != null && itemToDelete != null) {
					var RecordUNID = sourceStore.getIdentity(itemToDelete);
					dojo.forEach(childFileStoreArrays, function (childFileStoreArray) {
						if (typeof childFileStoreArray[RecordUNID] != "undefined") delete childFileStoreArray[RecordUNID];
					});
				}
			}
			gridobject.store.deleteItem(selectedItem);
		});
		if(gridobject.store.isDirty()){
			gridobject.store.save();
		}
		gridobject.rowSelectCell.toggleAllSelection(false);
		gridobject.update();
	}
}
var deleteTree = function (treeData) {
		var itemToDelete = treeData.itemToDelete;
		var sourceStore = treeData.sourceStore;
		var childFileStoreArrays = treeData.childFileStoreArrays;
		if (sourceStore != null && itemToDelete != null) {
			var RecordUNID = sourceStore.getIdentity(itemToDelete);
			sourceStore.deleteItem(itemToDelete);
			dojo.forEach(childFileStoreArrays, function (childFileStoreArray) {
				if (typeof childFileStoreArray[RecordUNID] != "undefined") delete childFileStoreArray[RecordUNID];
			});
		}
	};
var StoreDeleteAllItems = function (dataStore) {
		itemsToBeDeletedList = null;
		dataStore.fetch({
			onComplete: function (items, request) {
				itemsToBeDeletedList = items;
			}
		});
		if (itemsToBeDeletedList != null) {
			dojo.forEach(itemsToBeDeletedList, function (itemToBeDeleted) {
				dataStore.deleteItem(itemToBeDeleted);
			});
		}
	};

function getIframeDocument(iframe) {
	if (iframe) {
		var iframeDoc;
		if (iframe.contentDocument) {
			iframeDoc = iframe.contentDocument;
		} else if (iframe.contentWindow) {
			iframeDoc = iframe.contentWindow.document;
		} else if (window.frames[iframe.name]) {
			iframeDoc = window.frames[iframe.name].document;
		}
		if (iframeDoc) {
			return iframeDoc;
		}
	}
	return null;
}

function createFrame(iframeName, hideIt, frameURL, width, height, usecounter) {
	var iframe;
	var nodeRmv;
	if (iframeName) {
		if (usecounter) {
			iframeName = iframeName + '' + Math.floor(Math.random()*10);
		}
		nodeRmv = document.getElementById(iframeName);
		if (nodeRmv) nodeRmv.parentNode.removeChild(nodeRmv);
		nodeRmv = null;
		/*
		while ((el = document.getElementsByTagName(iframeName)).length) {
			el[0].parentNode.removeChild(el[0]);
		}*/
		if (document.createElement && (iframe = document.createElement('iframe'))) {
			iframe.name = iframe.id = (iframeName);
			if (hideIt) {
				iframe.width = 0;
				iframe.height = 0;
			} else {
				if (width) {
					if (width < 0) width = 0;
					iframe.width = width;
				}
				if (height) {
					if (height < 0) height = 0;
					iframe.height = height;
				}
			}
			if (frameURL) {
				iframe.src = frameURL;
			} else {
				iframe.src = 'about:blank';
			}
			document.body.appendChild(iframe);
			
			//var xx1=0;
			/*
			var newiframe = document.getElementById(iframeName);
			while (newiframe == null) {
				xx1++;
				if (xx1 > 2000) break;
				//just loop, this isnt getting us anywhere
				//newiframe = document.getElementById(iframeName);
			}*/
		}
	}
	return iframe;
}
function waitForIt(iframeName, timercount){
	consoleLog('waiting...' + timercount);
	if (iframeName){
		if (iframe.body) return;
	}
	timercount += 50;
	setTimeout('waitForIt(iframe, timercount)', 50);
}

function isValueChecked(checkboxname, findvalue, exact) {
	var checkboxgroup = document.getElementsByName(checkboxname);
	if (checkboxgroup) {
		for (x = 0; x < checkboxgroup.length; x++) {
			if (checkboxgroup[x].checked) {
				if (exact) {
					if (checkboxgroup[x].value === findvalue) return true;
				} else {
					if (checkboxgroup[x].value == findvalue) return true;
				}
			}
		}
	}
	return false;
}
//this is a 2 button generic confirmation dialog containing 2 callback functions

function dialogText(title, message, onAffirmative, onNegative, onAffirmativeButtonLabel, onNegativeButtonLabel, obj) {
	if (!obj) {
		obj = dijit.byId("id_dialog");
	}
	var button1 = dijit.byId(obj.id + '_button_1');
	var button2 = dijit.byId(obj.id + '_button_2');
	if (onAffirmativeButtonLabel) {
		if (onAffirmativeButtonLabel == "") {
			if (button1) {
				button1.domNode.style.display = 'none';
			};
		} else {
			button1.domNode.style.display = '';
			button1.attr("label", onAffirmativeButtonLabel);
		}
	} else {
		button1.domNode.style.display = 'none';
	}
	if (onNegativeButtonLabel) {
		if (onNegativeButtonLabel == "") {
			if (button2) {
				button2.domNode.style.display = 'none';
			};
		} else {
			button2.domNode.style.display = '';
			button2.attr("label", onNegativeButtonLabel);
		}
	} else {
		button2.domNode.style.display = 'none';
	}
	if (onAffirmativeButtonLabel == null && onNegativeButtonLabel == null) {
		button1.domNode.style.display = 'none';
		button2.domNode.style.display = '';
		button2.attr("label", 'Close');
		dojo.connect(button2, "onClick", obj.hide());
	}
	obj.attr("title", title);
	dojo.byId(obj.id + '_text').innerHTML = message;
	obj.execute = dojo.hitch(obj, function () {
		if (dojo.isObject(arguments)) {
			onAffirmative();
		} else {
			onNegative();
		}
	});
	obj.show();
}

function activateHotKey(e) {
	// Hot key activation. (note: must have previously added keydown listener to
	// 'dojo.addOnLoad' event of the page
	//24FEB2015 BL INC61834
	//imported code from OTC Drafts and modified to use CT button actions
	//most key evts available but not all of them are used here
	try {
		if (window.event) {
			var keyCode = window.event.keyCode; // IE
			var evt = window.event;
		} else {
			var keyCode = e.which;
			var evt = e;
		}
		
		var hotkeyTarget = null;
		
		if (evt.altKey) {
			// Alt key events
			if (keyCode == 49) {
				// Alt + 1 
				//var hotkeyTarget = 
			} else if (keyCode == 50) {
				// Alt + 2 
				//var hotkeyTarget = 
			} else if (keyCode == 76 || keyCode == 108) {
				// Alt + D
				//var hotkeyTarget = 
			}
		} else if (evt.ctrlKey) {
			// Ctrl key events
			if (keyCode == 65 || keyCode == 97) {
				// Ctrl + A (Validate action)
				var hotkeyTarget = document.getElementById("Application_Button_Validate");
			} else if (keyCode == 79 || keyCode == 111) {
				// Ctrl + O (Close action)
				var hotkeyTarget = document.getElementById("Application_Button_Close");
			} else if (keyCode == 80 || keyCode == 112) {
				// Ctrl + P (Print action)
				var hotkeyTarget = document.getElementById("Application_Button_PrintPreview");
			} else if (keyCode == 83 || keyCode == 115) {
				// Ctrl + S (Save action)
				var hotkeyTarget = document.getElementById("Application_Button_Save");
			} else if (keyCode == 85 || keyCode == 117) {
				// Ctrl + U (Please Read btn)
				var hotkeyTarget = document.getElementById("Application_Button_Guide");
			} else if (keyCode == 37) {
				// Ctrl + Left Arrow
				//var hotkeyTarget = 
			} else if (keyCode == 39) {
				// Ctrl + Right Arrow
				//var hotkeyTarget = 
			}
		}
		
		if (hotkeyTarget) {
			dojo.stopEvent(evt); // Disable default browser behaviour
			
			// Fire the click event on the target hotkey object
			setTimeout(function () {
			    if(document.createEvent ) {
			    	var evObj = document.createEvent('MouseEvents');
			    	evObj.initEvent( 'click', true, false );
			    	hotkeyTarget.dispatchEvent(evObj);
			    } else if(document.createEventObject) {
			    	var evObj = document.createEventObject();
			    	hotkeyTarget.fireEvent( 'onclick', evObj);
			    }
			}, 0);

			return false;				
		}
	} catch(e) {
		consoleLog("OTCDraft - activateHotKey error: " + e);
	}
}