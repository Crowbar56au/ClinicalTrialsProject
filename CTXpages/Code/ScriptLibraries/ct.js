var gFileRepoDB = "";
var gValidationDB = "";
var gResourcesDB = "";
var gSrcDB_escaped = "";
var gSourceTab="";
var isTGAUser= "";
var isInitializing = false;
var loadingDialog; //global dialog object

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(elt /*, from*/) {
		var len = this.length;
		var from = Number(arguments[1]) || 0;
		from = (from < 0) ? Math.ceil(from) : Math.floor(from);
		if (from < 0) from += len;
		for (; from < len; from++) {
			if (from in this && this[from] === elt) return from;
		}
		return -1;
	};
}

function activateHotKey(e) {
	// Hot key activation. (note: must have previously added keydown listener to
	// 'dojo.addOnLoad' event of xPage
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
				// Alt + 1 (Application menu)
				var hotkeyTarget = document.getElementById(getItemId("", "menubarApplication"));
			} else if (keyCode == 50) {
				// Alt + 2 (Help menu)
				var hotkeyTarget = document.getElementById(getItemId("", "menubarHelp"));
			}
		} else if (evt.ctrlKey) {
			// Ctrl key events
			if (keyCode == 65 || keyCode == 97) {
				// Ctrl + A (Validate action)
				var hotkeyTarget = document.getElementById(getItemId("", "validate"));
			} else if (keyCode == 79 || keyCode == 111) {
				// Ctrl + O (Close action)
				var hotkeyTarget = document.getElementById(getItemId("", "close"));
			} else if (keyCode == 81 || keyCode == 113) {
				// Ctrl + Q (Print action)
				var hotkeyTarget = document.getElementById(getItemId("", "btnActionPrint"));
			} else if (keyCode == 83 || keyCode == 115) {
				// Ctrl + S (Save action)
				var hotkeyTarget = document.getElementById(getItemId("", "save"));
			} else if (keyCode == 85 || keyCode == 117) {
				// Ctrl + U (Submit action)
				var hotkeyTarget = document.getElementById(getItemId("", "btnActionSubmit"));
			} else if (keyCode == 37) {
				// Ctrl + Left Arrow (Previous tab)
				var hotkeyTarget = document.getElementById(getItemId("", "btnTabPrev"));
			} else if (keyCode == 39) {
				// Ctrl + Right Arrow (Next tab)
				var hotkeyTarget = document.getElementById(getItemId("", "btnTabNext"));
			}
		}
		
		if (hotkeyTarget) {
			//dojo.stopEvent(evt); // Disable default browser behaviour
			
			if (e.preventDefault)
				e.preventDefault();
			if (e.stopPropagation)
				e.stopPropagation();
			if (e.stopImmediatePropagation)
				e.stopImmediatePropagation();
			if (e.cancelBubble)
				e.cancelBubble = true;
			if (e.returnValue)
				e.returnValue = false;
			
			if (evt.preventDefault)
				evt.preventDefault();
			if (evt.stopPropagation)
				evt.stopPropagation();
			if (evt.stopImmediatePropagation)
				evt.stopImmediatePropagation();
			if (evt.cancelBubble)
				evt.cancelBubble = true;
			if (evt.returnValue)
				evt.returnValue = false;
			
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
		console.log("ct.js - activateHotKey error: " + e);
	}
}

function addTrialTypeLabel(){
	try {
		var fieldname = "Part1_TrialType";
		var trialtype = getCheckArray(fieldname);
		var label = [];
		if(trialtype){
			for(i=0; i < trialtype.length; i++){
				label.push(dijit.byId(fieldname + trialtype[i]).label);
			}
		}
		storeApplicationData.items.Part1.TrialType_Label = label.toString();
		fieldname = "UpdateDetails_TrialType";
		trialtype = getCheckArray(fieldname);
		label = [];
		if(trialtype){
			for(i=0; i < trialtype.length; i++){
				label.push(dijit.byId(fieldname + trialtype[i]).label);
			}
		}
		storeApplicationData.items.UpdateDetails.TrialType_Label = label.toString();
	} catch(e) {
		console.log("ct.js - addTrialTypeLabel() error: " + e);
	}	
}

function appClose() {
	try {
		setDataStatusText(constant.DataStatus_Closing);
		window.location.href = "/";
	} catch(e) {
		console.log("ct.js - appClose() error: " + e);
	}		
}

function appGuide() {
	try {
		var baseURL = getNSFBase();
		if(storeApplicationData.items.ClinicalTrialType == "CTX"){
			ctxguide = window.open(baseURL + '/applicationguidectx?readform', '', 'scrollbars=1 resizable=1');
		}else{
			ctnguide = window.open(baseURL + '/applicationguidectn?readform', '', 'scrollbars=1 resizable=1');
		}
	} catch(e) {
		console.log("ct.js - appGuide() error: " + e);
	}		
}

function Application_SponsorName_OnChange(thisObj) {
	try {
		if (isInitializing) {
			isInitializing = false;
		} else {
			migratedSponsorDataShowWhen(false);
		}
		if(storeApplicationData.items.isClean && storeApplicationData.items.SponsorAddress.length > 0){
			if(storeApplicationData.items.isClean == '0' || storeApplicationData.items.isClean == '1'){
				var spID = dijit.byId('Application_SponsorName');
				var sa = dijit.byId('Application_SponsorAddress');
				if (storeApplicationData.items.SponsorID){
					if (storeApplicationData.items.SponsorID.length > 0 && storeApplicationData.items.SponsorAddress.length > 0){
						sa.store = new dojo.data.ItemFileReadStore({ failOk:true, url:'xAgentLookupSponsorAddress.xsp?V=P&NAME='+ storeApplicationData.items.SponsorID });
						sa.store.fetch({ onComplete:dijit.byId('Application_SponsorAddress').setValue(storeApplicationData.items.SponsorAddress ) });
					}
				}
			}
		}else if(storeApplicationData.items.isClean && !storeApplicationData.items.SponsorAddress.length > 0){
			if (storeApplicationData.items.SponsorID != thisObj.getValue()) {
				storeApplicationData.items.SponsorAddress_Id = '';
				storeApplicationData.items.SponsorAddress = '';
				storeApplicationData.items.SponsorAddress_Label = '';
			}
			storeApplicationData.items.SponsorID = thisObj.getValue();
			storeApplicationData.items.SponsorName = thisObj.getDisplayedValue();
			var sa = dijit.byId('Application_SponsorAddress');
			sa.reset();
			if (storeApplicationData.items.SponsorID){
				if (storeApplicationData.items.SponsorID.length > 0){
					sa.store = new dojo.data.ItemFileReadStore({ failOk:true, url:'xAgentLookupSponsorAddress.xsp?V=P&NAME='+ storeApplicationData.items.SponsorID });
					sa.store.fetch({ onComplete:dijit.byId('Application_SponsorAddress').setValue(storeApplicationData.items.SponsorAddress ) });
				}
			}
		}
		if(!storeApplicationData.items.isClean){
			migratedSponsorDataShowWhen(false);
		}
		if (storeApplicationData.items.SponsorID != thisObj.getValue()) {
			storeApplicationData.items.SponsorAddress_Id = '';
			storeApplicationData.items.SponsorAddress = '';
			storeApplicationData.items.SponsorAddress_Label = '';
		}
		storeApplicationData.items.SponsorID = thisObj.getValue();
		storeApplicationData.items.SponsorName = thisObj.getDisplayedValue();
		var sa = dijit.byId('Application_SponsorAddress');
		sa.reset();
		if (storeApplicationData.items.SponsorID){
			if (storeApplicationData.items.SponsorID.length > 0){
				sa.store = new dojo.data.ItemFileReadStore({ failOk:true, url:'xAgentLookupSponsorAddress.xsp?V=P&NAME='+ storeApplicationData.items.SponsorID });
				sa.store.fetch({ onComplete:dijit.byId('Application_SponsorAddress').setValue(storeApplicationData.items.SponsorAddress ) });
			}
		}
	} catch(e) {
		console.log("ct.js - Application_SponsorName_OnChange() error: " + e);
	}	
}

function appSave() {
	try {
		if (confirmEmail()) {
			setInvalidPhoneData();
			// Handling PrecedingTrials problem - WP & BL 24FEB2015
			if (isValueChecked('Part1_TrialClassification', '5', 0) && storeApplicationData.items.ApplicationStage == "1") {
				if (dijit.byId("Part1_PrecedingTrials").get('value') == "") {
					storeApplicationData.items.Part1.PrecedingTrials = "";
				}
				if(djstore_PrecedingTrials._arrayOfAllItems.length == 0) {
					storeApplicationData.items.Part1.PrecedingTrials = "None";
				}
			} else if(isValueChecked('UpdateDetails_TrialClassification', '5', 0) && storeApplicationData.items.ApplicationStage == "4") {
				if(storeApplicationData.items.UpdateDetails.PrecedingTrials == "None") {
					storeApplicationData.items.UpdateDetails.PrecedingTrials = "";
				}
				if(djstore_PrecedingTrials._arrayOfAllItems.length == 0) {
					storeApplicationData.items.UpdateDetails.PrecedingTrials = "None";
				} else {
					if (dijit.byId("UpdateDetails_PrecedingTrials").get('value') == "") {
						storeApplicationData.items.UpdateDetails.PrecedingTrials = "";
					}
				}
			}

			//convert dojo date object to date strings for validation INC61864 03FEB2015 BL
			if(storeApplicationData.items.ClinicalTrialType == "CTN"){
				storeApplicationData.items.Part1.StartDate = dijit.byId('Part1_StartDate').valueNode.value;
				storeApplicationData.items.Part1.ExpectedCompletionDate = dijit.byId('Part1_ExpectedCompletionDate').valueNode.value;
			} else {
				storeApplicationData.items.Part1.StartDate = dijit.byId('Part2_StartDate').valueNode.value;
				storeApplicationData.items.Part1.ExpectedCompletionDate = dijit.byId('Part2_FinishDate').valueNode.value;
			}

			storeApplicationData.items.UpdateDetails.TrialStartDate = dijit.byId('UpdateDetails_TrialStartDate').valueNode.value;
			storeApplicationData.items.UpdateDetails.TrialFinishDate = dijit.byId('UpdateDetails_TrialFinishDate').valueNode.value;
			storeApplicationData.items.Completion.TrialCompletionDate = dijit.byId('Completion_TrialCompletionDate').valueNode.value;

			//INC61834 json data modification to validate UpdateDetails information WP 20FEB2015
			fCheckUpdateDetailsTrialClassifications();

			setDataStatusText(constant.DataStatus_Saving);
			storeApplicationData.items.ApplicationStatus = 'Draft';
			dojo.byId('ApplicationStatus').innerHTML = storeApplicationData.items.ApplicationStatus;
			var tmpURL = constant.DBURL + 'JSONMIMEFile?openform&ONSUBMIT=jsonUploadBegin&ONCOMPLETE=jsonUploadComplete&ID=' + storeApplicationData.items.ApplicationId + '&V=' + storeApplicationData.items.ApplicationVersion + '&R=' + Math.random() + '&login';
			var newiframe = createFrame('submit', true, tmpURL, 0, 0, true);
			setTimeout('jsonUploadComplete()',10000);
			return true;
		}
		return false;
	} catch(e) {
		console.log("ct.js - appSave() error: " + e);
	}		
}

function appValidate() {
	//interface validation prior to backend validation
	try {
		var flag = true;
		var tabname;
		var stage;
		var fieldid = [];
		var fieldlabel = [];

		if(!appSave()){
			return;
		}

		if(storeApplicationData.items.ApplicationStage){
			stage = storeApplicationData.items.ApplicationStage;
			switch(stage){
			case "1":
				if (storeApplicationData.items.ClinicalTrialType == "CTN"){
					fieldid = ["Part1_TrialClassification","Part1_TrialType"];
					fieldlabel = ["This Trial","Trial Type"];
				}else{
					fieldid = ["Part1_TrialClassification"];
					fieldlabel = ["This Trial"];
				}
				tabname = "Part1";
				break;
			case "2":
				if (storeApplicationData.items.ClinicalTrialType == "CTX"){
					fieldid = ["Part2_TrialClassification", "Part2_TrialType"];
					fieldlabel = ["This Trial","Trial Type"];
					tabname = "Part2";
				}
				break;
			case "3":
				var ccr = dijit.byId("Completion_CompletionReason");
				var ccd = dijit.byId("Completion_CompletionDetails");
				tabname = "Completion";
				if((ccr.value.indexOf("Termination") > 0) && (ccd.textbox.value == "")) {
					//dialogText('Guidance: ' + tabname,'Please enter the Completion Details<br /><br />', '', '', '','Close');
					//dijit.byId('djborder_Tabs').selectChild('djtabs_' + tabname);
					//document.getElementById("Completion_CompletionDetails").focus();
					//document.getElementById("Completion_CompletionDetails").select();
					//return;
				}
				break;
			case "4": case "5":
				var objOne = '';
				var objTwo = '';
				var countObjOne = '';
				var countObjTwo = '';

				if(storeApplicationData.items.ClinicalTrialType == "CTN"){
					if(storeApplicationData.items.Part1.Sites.items.length > 0 && storeApplicationData.items.UpdateDetails.Sites.items.length > 0){
						objOne = eval(storeApplicationData.items.Part1.Sites.items);
						objTwo = eval(storeApplicationData.items.UpdateDetails.Sites.items);
						countObjOne = countProperties(objOne);
						countObjTwo = countProperties(objTwo);

						if(countObjOne == countObjTwo){
							if(storeApplicationData.items.UpdateDetails.Biologicals.items.length > 0){
								//storeApplicationData.items.ApplicationStage = "5";
							}else if(storeApplicationData.items.UpdateDetails.Devices.items.length > 0){
								//storeApplicationData.items.ApplicationStage = "5";
							}else if(storeApplicationData.items.UpdateDetails.Medicines.items.length > 0){
								//storeApplicationData.items.ApplicationStage = "5";
							}else if(sameObjects(objOne, objTwo)){
								// reset to non payment requirement stage
								//storeApplicationData.items.ApplicationStage = "4";
							}else{
								//storeApplicationData.items.ApplicationStage = "5";
							}
						}else{
							//storeApplicationData.items.ApplicationStage = "5";
						}
					}else if(storeApplicationData.items.Part1.Sites.items.length == 0 && storeApplicationData.items.UpdateDetails.Sites.items.length > 0){
						//storeApplicationData.items.ApplicationStage = "5";
					}else{
						//storeApplicationData.items.ApplicationStage = "4";
					}
				}
				break;
			}

			if(fieldid.length > 0){
				for (var k=0; k < fieldid.length; k++) {
					if(getCheckData(fieldid[k],'checkbox',',') == '') {
						//var tabtitle = dijit.byId('djtabs_' + tabname).title;
						//dialogText('Guidance: ' + tabtitle,'Please select a value for ' + fieldlabel[k] + '<br /><br />', '', '', '','Close');
						//dijit.byId('djborder_Tabs').selectChild('djtabs_' + tabname);
						//flag = false;
						break;
					}else{
						//only perform check on TrialClassification (TC)
						var checkTCs = getCheckArray(fieldid[0]);
						var foundone = false;
						if(checkTCs){
							if(checkTCs.length >0){
								switch(stage){
								case "1":
									for(i=0; i<checkTCs.length; i++){
										if(checkTCs[i] == "0" || checkTCs[i] == "1" || checkTCs[i] == "2"){
											foundone = true;
										}
									}
								}
								if(!foundone && stage == "1"){
									//var tabtitle = dijit.byId('djtabs_' + tabname).title;
									//dialogText('Guidance: ' + tabtitle,'This Trial must check at least one of the following:<br /><br />Is a Biological<br />Involves the use of a Medicine<br />Involves the use of Device<br /><br />', '', '', '','Close');
									//dijit.byId('djborder_Tabs').selectChild('djtabs_' + tabname);
									//flag = false;
								}
							}
						}
					}
				}//end for
			};//end if (fieldid.length > 0)
			if (!flag) return;
		}else{
			console.log("There is no Application Stage data");
			return;
		};//end if (storeApplicationData.items.ApplicationStage)

		if(!checkHasDeclaration(true)) return;

		//if Trial Classification 'Has relevant preceding trials' is checked, then user must actually select one or more relevant preceding trials
		var checkedPrecedingTrials = isValueChecked('Part1_TrialClassification', '5', 0);
		if(checkedPrecedingTrials){
			var flag = false;
			var app_pt = dijit.byId("Part1_PrecedingTrials");
			for(k=0; k < app_pt.options.length; k++){
				if(app_pt.options[k].selected){
					flag = true;
				}
			}
			if(!flag){
				//tabname = app_pt.id.slice(0,thedijit.id.indexOf('_'));
				//var tabtitle = dijit.byId('djtabs_' + tabname).title;
				//dialogText('Guidance: '+tabtitle,'Please select which preceding trials are relevant.<br /><br />', '', '', '','Close');
				//dijit.byId('djborder_Tabs').selectChild('djtabs_' + tabname);
				//return;
			}
		}

		dijit.byId('djborder_Tabs').selectChild('djtabs_Validation')
		var tmpURL = constant.DBURL + 'JSONMIMEFile?openform&ONSUBMIT=jsonUploadBegin&ONCOMPLETE=validationAfterSave&ID=' + storeApplicationData.items.ApplicationId + '&V=' + storeApplicationData.items.ApplicationVersion + '&R=' + Math.random() + '&login';
		var newiframe = createFrame('submit', true, tmpURL, 0, 0, true);
		//dojo.publish("auditLogEvent", ["Request for Validation"] );
	} catch(e) {
		console.log("ct.js - appValidate() error: " + e);
	}	
}

function attachment_Context(o){
	try {
		//require basic parameters
		if (!o || !o.src || !o.cmd || !o.context ) return;
		var dap = dijit.byId('dialog_AttachmentPage');
		if (!dap) return;
		var iframe = document.getElementById('jsiframe_attachment');
		if (!iframe) return;
		o.location = '';
		if (o.src.id.indexOf('-') > 0) { o.location = o.src.id.substring(0,o.src.id.indexOf('-')); }
		var fileid = '';
		if (o.src.AttachmentId) { fileid = o.src.AttachmentId.toString(); }
		var filename = '';
		if (o.src.AttachmentFileName) { filename = o.src.AttachmentFileName.toString(); }

		var Shazza = undefined;
		var fieldname = undefined;
		if (o.src.id.substring(0,7) == 'dialog_') {
			Shazza = dijit.byId( o.src.id.substring(0, o.src.id.substring(7).indexOf('_')+7 ) );
			fieldname = o.location.substring(Shazza.length+1);
		}

		if (isArray(o.context)) o.context=o.context[0];
		switch(o.cmd) {
		case 'action':
			if (fileid.length < 1) {
				iframe.src = gFileRepoDB + '/attachfileui?openform&_srcdb=' + gSrcDB_escaped + '&_srcrefid=' + storeApplicationData.items.ApplicationId + '&_version=' + storeApplicationData.items.ApplicationVersion +  '&_sponsorid=' + storeApplicationData.items.SponsorID + '&_context=' + o.context + '&_location=' + o.location +'&rnd=' + Math.random();
				dap.show();
			} else {
				if (confirm("Are you sure you want to remove the file '" + filename + "' ??")) {
					delete o.src.AttachmentId;
					delete o.src.AttachmentFileName;
					dijit.byId(o.src.id).set('label', 'Attach');	// reset the action button to Attach coz the file is removed
					var thedijit = dijit.byId(o.location);
					thedijit.set('value', '');	// remove filename from this location
					delete thedijit.AttachmentId;
					delete thedijit.AttachmentFileName;
					try {
						if (Shazza) {
							Shazza.thisItem[fieldname] = '';
						}
					}catch(e) {console.log(e);}
					var script = document.getElementById('tmpAttachmentScript');
					if (script) { script.outerHTML = ''; }
					var head = document.getElementsByTagName('head')[0];
					var script = document.createElement('script');
					script.type = 'text/javascript';
					script.id = 'tmpAttachmentScript';
					script.src = gFileRepoDB + '/wDeleteDocuments?openagent&ID=' + fileid + '~' + storeApplicationData.items.ApplicationVersion + '&ONCOMPLETE=refreshAttachmentsCT&NAME=responseJSON&R=' + Math.random();
					head.appendChild(script);
				}
			}
			break;
		case 'view':
			if (fileid && filename) {
				var cherylURL = gFileRepoDB + '/FileAttachment/' + fileid + '/$file/' + filename + '?openelement';
				var ctFileAttachmentsWindow = window.open(cherylURL, "ctFileAttachmentsWindow", "status=0,toolbar=0,location=0,menubar=0,directories=0,resizable=1,scrollbars=1");
				ctFileAttachmentsWindow.focus();
			} else {
				alert( 'No file attached for you to view, please attach one first');
			}
			break;
		}
	} catch(e) {
		console.log("ct.js - attachment_Context() error: " + e);
	}	
}

function changeTab(direction, pageName) {
	// Move to the next / previous tab
	try {
		// Constants
		var DIRECTION_NEXT = 1;
		var DIRECTION_PREV = -1;
		var REFRESH_ONLY = 0;
		var ONLOAD_STATE = 99;
		var HIDE_SPAN = false;
		//alert(pageName);
		// Set the id's of the parent container and tabs
		var tabList = new Array();
		if (pageName == null){
			// Tabs common to all pages
			tabList[0] = getItemId("", "djTabApplication");
			tabList[1] = getItemId("", "djTabARTGEntry");
		}
	
		var currentTab = tabContainer.selectedChildWidget.id;

		if (direction == ONLOAD_STATE) {
			// Page is being loaded. Set default state of buttons according to the tab
			// being displayed 
			var lastSelectedTabId = getItemId("", "lastSelectedTab");
			if (lastSelectedTabId != null && lastSelectedTabId != "") {
				var lastTabUsed = dojo.byId(lastSelectedTabId).value;
				if (lastTabUsed != null && lastTabUsed != "")
					currentTab = lastTabUsed;
			}
		}
		
		// Get handle to the objects to be manipulated
		if (HIDE_SPAN) {
			// Show / hide spans containing the buttons
			var spanTabPrev = dojo.byId(getItemId("", "spanBtnTabPrev"));
			var spanDivider = dojo.byId(getItemId("", "spanPrevNextDivider"));
			var spanTabNext = dojo.byId(getItemId("", "spanBtnTabNext"));
		} else {
			// Enable / Disable buttons
			var buttonTabPrev = dijit.byId(getItemId("", "btnTabPrev"));
			var buttonTabNext = dijit.byId(getItemId("", "btnTabNext"));
		}
		
		if (direction == REFRESH_ONLY || direction == ONLOAD_STATE) {
			// Refresh the display of the previous / next buttons
			if (currentTab == tabList[0]) {
				// First tab is shown - only next button should be available
				if (HIDE_SPAN) {
					spanTabPrev.style.display = "none";
					spanDivider.style.display = "none";
					spanTabNext.style.display = "";
				} else {
					buttonTabPrev.set("disabled", true);
					buttonTabNext.set("disabled", false);
				}
			} else if (currentTab == tabList[tabList.length-1]) {
				// Last tab is shown - only previous button should be available
				if (HIDE_SPAN) {
					spanTabPrev.style.display = "";
					spanDivider.style.display = "none";
					spanTabNext.style.display = "none";
				} else {
					buttonTabPrev.set("disabled", false);
					buttonTabNext.set("disabled", true);
				}
			} else {
				// Both previous & next buttons are available
				if (HIDE_SPAN) {
					spanTabPrev.style.display = "";
					spanDivider.style.display = "";
					spanTabNext.style.display = "";
				} else {
					buttonTabPrev.set("disabled", false);
					buttonTabNext.set("disabled", false);
				}
			}
			return true;
		}
		
		if (direction == DIRECTION_PREV) {
			if (currentTab == tabList[0]) {
				// We are already at the first tab
				return false;
			}		
		} else if (direction == DIRECTION_NEXT){
			if (currentTab == tabList[tabList.length-1]) {
				// We are already at the last tab
				return false;
			}		
		} else {
			// Unknown tab direction
			return false;
		}	
		
		for (var i=0; i < tabList.length; i++) {
			if (tabList[i] == currentTab) {
				if (direction == DIRECTION_PREV) {
					tabContainer.selectChild(tabList[i-1]);
					if ((i-1) == 0) {
						// The first tab is being shown. Only the next button is available
						if (HIDE_SPAN) {
							spanTabPrev.style.display = "none";
							spanDivider.style.display = "none";
							spanTabNext.style.display = "";
						} else {
							buttonTabPrev.set("disabled", true);
							buttonTabNext.set("disabled", false);
						}
					} else {
						// Both buttons are available
						if (HIDE_SPAN) {
							spanTabPrev.style.display = "";
							spanDivider.style.display = "";
							spanTabNext.style.display = "";
						} else {
							buttonTabPrev.set("disabled", false);
							buttonTabNext.set("disabled", false);
						}
					}
				} else if (direction == DIRECTION_NEXT) {
					tabContainer.selectChild(tabList[i+1]);
					if ((i+1) == (tabList.length-1)) {
						// The last tab is being shown. Only the previous button is available
						if (HIDE_SPAN) {
							spanTabPrev.style.display = "";
							spanDivider.style.display = "none";
							spanTabNext.style.display = "none";
						} else {
							buttonTabPrev.set("disabled", false);
							buttonTabNext.set("disabled", true);							
						}
					} else {
						// Both buttons are available
						if (HIDE_SPAN) {
							spanTabPrev.style.display = "";
							spanDivider.style.display = "";
							spanTabNext.style.display = "";
						} else {
							buttonTabPrev.set("disabled", false);
							buttonTabNext.set("disabled", false);							
						}
					}
				}					
				return true;
			}
		}
	} catch (e) {
		XSP.error("ct.js - changeTab error: " + e);
	}
}

function checkHasDeclaration(showDialog,stage){
	try {
		var flag = true;

		//INC61834: remove requirement for attachments any where in the application, so leave the function unless they change their mind and just return true BL 30JAN 2015
		return flag;
		// Fixed the bug that stage > 1, but there is no declaration attachment in Part1, because the button is already disabled.
		if (parseInt(storeApplicationData.items.ApplicationStage) > 1) return flag;

		var thedijit = dijit.byId('Part1_SponsorDeclaration');
		var tabprefix = thedijit.id.slice(0,thedijit.id.indexOf('_'));
		tabtitle = dijit.byId('djtabs_' + tabprefix).title;

		if(thedijit.value == '' || thedijit.value == undefined){
			if(showDialog){
				dialogText('Guidance: '+tabtitle,'Please attach a declaration for ' + tabtitle + '<br /><br />', '', '', '','Close');
				dijit.byId('djborder_Tabs').selectChild('djtabs_' + tabprefix);
			}
			flag = false;
		}
		return flag;
	} catch(e) {
		console.log("ct.js - checkHasDeclaration() error: " + e);
	}	
}

function CompletionDisplay(obj){
	try{
		if(obj){
			if (obj.value == "Premature Termination - Safety" || obj.value == 'Premature Termination - Other'){
				showHide('completion_details_row', 1, 1, 0);
			}else{
				showHide('completion_details_row', 0, 1, 0);
			}
		}
	} catch(e) {
		console.log("ct.js - CompletionDisplay() error: " + e);
	}
}

function confirmEmail() {
	try {
		var appstage = storeApplicationData.items.ApplicationStage;
		var email = '';
		var confemail = '';

		switch(appstage){
		case "1" : //Part1 - Trial Details
			email = document.getElementById("Part1_ContactEmail").value;
			confemail = document.getElementById("Part1_ConfirmEmail").value;
			break;
		case "2" : //Part2
			email = document.getElementById("Part2_ContactEmail").value;
			confemail = document.getElementById("Part2_ConfirmEmail").value;
			break;
		case "3" ://Completion
			break;
		case "4" ://Variation
		case "5" ://Migrated Data
			email = document.getElementById("UpdateDetails_ContactEmail").value;
			confemail = document.getElementById("UpdateDetails_ConfirmEmail").value;
			break;
		}

		if(email != confemail) {
			alert('Contact Email & Confirm Email do not match. Please correct and try again.');
			return false;
		}else{
			return true;
		}
	} catch(e) {
		console.log("ct.js - confirmEmail() error: " + e);
		return false;
	}
}

function convertStage(stage){
	try {
		switch (stage){
		case "1": return "Part1"; break;
		case "2": return "Part2"; break;
		case "3": return "Completion"; break;
		case "4","5": return "UpdateDetails"; break;
		}
	} catch(e) {
		console.log("ct.js - convertStage() error: " + e);
	}	
}

function countProperties(obj) {
	try {
		var count = 0;
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				++count;
		}
		return count;
	} catch(e) {
		console.log("ct.js - countProperties() error: " + e);
	}		
}

function ctOnLoad() {
	//	setTimeout("pingServer(300000)",300000);
	//	dojo.subscribe("auditLogEvent", auditController, "stamp");
	//	dojo.subscribe("auditLogInit", auditController, "initialise");
	try {
		// Add hotkeys event listener. 'activateHotKey' function is located in standards.js script library
		if (window.addEventListener) {
			window.addEventListener("keydown", activateHotKey, true);
		} else if (document.attachEvent) { // IE 
			document.attachEvent("onkeydown", activateHotKey);
		} else {
			document.addEventListener("keydown", activateHotKey, true);
		}
	} catch (e) {
		console.log("ct.js - ctOnLoad() error: " + e);
	}
}

function ctOnShow() {
	try {
		dialog_Functions_onShow('dialog_Device');
		var oFilter = dijit.byId('dialog_Device_GMDNS');
		var oButton = dijit.byId('dialog_Device_SearchButton');
		var oResults = dojo.byId('searchResults');
		var oName = dijit.byId('dialog_Device_GMDNName');
		var vContext = getRadioValue('dialog_Device_GMDNContext') || '';

		if (dijit.byId('dialog_Device').editMode) {
			if(dijit.byId('dialog_Device_GMDNName').value != ''){
				if (vContext == 'N'){
					var xagent = 'xAgentGMDNSearch.xsp?searchstr=' + oName.get('value');
				}else{
					var xagent = 'xAgentGMDNSearch.xsp?gmdn=' + oName.get('value');
				}
				oFilter.store=new dojo.data.ItemFileReadStore({
					url: constant.DBURL + xagent,
					query : "*",
					urlPreventCache: true
				});
				oFilter.store.fetch({
					onBegin:function(items, request){
					oButton.set('label', 'Searching');
					oButton.setDisabled(true);
				},onComplete:function(items, request){
					if(items.length == 1){
						oResults.innerHTML = items.length + ' match for "' + oName.get('value') + '"';
					} else {
						oResults.innerHTML = items.length + ' matches for "' + oName.get('value') + '"';
					}
					oButton.set('label', 'New Search');
					oButton.setDisabled(false);
					oFilter._setStyleAttr('display:block');

					oFilter.setValue(dijit.byId('dialog_Device').thisItem.GMDNS[0]);
					oFilter.setDisplayedValue(dijit.byId('dialog_Device').thisItem.GMDNS_Label[0]);
					if(dijit.byId('dialog_Device_GMDNName').getValue() != ''){
						oName.domNode.style.display='none';
					}
					oName.set('isSearching', 1);
				}
				});
				oFilter.focus();
			} else {
				oName.domNode.style.display='';
				oFilter.domNode.style.display='none';
				oName.set('isSearching', 0);
				oName.set('value', '');
				oButton.set('label', 'Search');
				oResults.innerHTML = '';
			}
		} else {
			oName.domNode.style.display='';
			oFilter.domNode.style.display='none';
			oName.set('isSearching', 0);
			oName.set('value', '');
			oButton.set('label', 'Search');
			oResults.innerHTML = '';
		}
	} catch (e) {
		console.log("ct.js - ctOnShow() error: " + e);
	}
}

function dialog_Biological_Close_onClick() {
	try {
		var bioId='', gs;
		if (gSourceTab == 'Part1')  gs = dijit.byId('Part1_BiologicalIngredients');
		else gs = dijit.byId('UpdateDetails_BiologicalIngredients');
		if  (! dijit.byId("dialog_Biological").thisItem) {
			bioId = dijit.byId("dialog_Biological").storeKey.Key.id;
			gs.store.fetch({query:{biologicalId:bioId}, onComplete: function (items) { for(i=0;i < items.length; i++) { var item = items[i]; gs.store.deleteItem(item); } }});
		}
		dijit.byId('dialog_Biological').hide(); 
	} catch(e) {
		console.log("ct.js - dialog_Biological_Close_onClick() error: " + e);
	}
}

function dialog_Biological_onShow() {
	try {
		dialog_Functions_onShow('dialog_Biological');
		var bioId =  getThisId("dialog_Biological");
		if (gSourceTab == 'Part1') {
			dijit.byId('Part1_BiologicalIngredients').setQuery({biologicalId:bioId});
			dojo.style('Part1_BiologicalIngredientsGrid','display','');
			dojo.style('UpdateDetails_BiologicalIngredientsGrid','display','none');
		} else {
			dijit.byId('UpdateDetails_BiologicalIngredients').setQuery({biologicalId:bioId});
			dojo.style('UpdateDetails_BiologicalIngredientsGrid','display','');
			dojo.style('Part1_BiologicalIngredientsGrid','display','none');
		}
		if (dijit.byId("dialog_Biological").disableEditing) 	{
			dijit.byId('dialog_BiologicalIngredients_Add').set('disabled', true);
			dijit.byId('dialog_BiologicalIngredients_Remove').set('disabled', true);
		} else {
			dijit.byId('dialog_BiologicalIngredients_Add').set('disabled', false);
			dijit.byId('dialog_BiologicalIngredients_Remove').set('disabled', false)
		}
		if (dijit.byId('dialog_Biological_ProductNameText') != null) dijit.byId('dialog_Biological_ProductNameText').set('disabled', false);
	} catch(e) {
		console.log("ct.js - dialog_Biological_onShow() error: " + e);
	}
}

function dialog_BiologicalIngredient_Add_onClick() {
	try {
		var bioId =  getThisId("dialog_Biological");
		var d = dijit.byId('dialog_BiologicalIngredient');
		if (gSourceTab == 'Part1') {
			dijit.byId('Part1_BiologicalIngredients').setQuery({biologicalId:bioId});
			d.gridID = 'Part1_BiologicalIngredients';
		} else {
			d.gridID = 'UpdateDetails_BiologicalIngredients';
			dijit.byId('UpdateDetails_BiologicalIngredients').setQuery({biologicalId:bioId});
		}
		dialog_Functions_Add('dialog_BiologicalIngredient');
		appSave();	
	} catch(e) {
		console.log("ct.js - dialog_BiologicalIngredient_Add_onClick() error: " + e);
	}
}

function dialog_BiologicalIngredient_Button_AddCountry_onClick() {
	try {
		var g = dijit.byId('dialog_BiologicalIngredient_CountryList');
		var c = dijit.byId('dialog_BiologicalIngredientLookup_Countries');
		var cValue = c.get('value');
		if(!g.store){
			g.store = new dojo.data.ItemFileWriteStore( {data: {"identifier":"id", "label":"label", "items":[ ]} });
		}
		if(cValue.length > 0){
			if (g.store._getItemByIdentity) {
				var existingItem = g.store._getItemByIdentity(cValue);
				if(!existingItem) {
					g.store.newItem({id:cValue, label:c.get('displayedValue') });
				}
			}
			g.store.save();
			g.render();
		}
		updateJSONfromGrid(g.id,'id','label');	
	} catch(e) {
		console.log("ct.js - dialog_BiologicalIngredient_Button_AddCountry_onClick() error: " + e);
	}
}

function dialog_BiologicalIngredient_Button_RemoveCountry_onClick() {
	try {
		var g = dijit.byId('dialog_BiologicalIngredient_CountryList');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			if(g.store.isDirty()){
				g.store.save();
			}
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.render();
		}
		updateJSONfromGrid(g.id,'id','label');
	} catch(e) {
		console.log("ct.js - dialog_BiologicalIngredient_Button_RemoveCountry_onClick() error: " + e);
	}
}

function dialog_BiologicalIngredients_Add_onClick() {
	try {
		var bioId =  getThisId("dialog_Biological");
		var d = dijit.byId('dialog_BiologicalIngredient');
		d.editMode = false;
		d.thisItem = null;
		if (gSourceTab == 'Part1') {
			d.gridID = 'Part1_BiologicalIngredients';
			d.storeKey = new itemBiologicalIngredient(storeApplicationData.items.Part1.BiologicalIngredients.Key, bioId);
		}else{
			d.gridID = 'UpdateDetails_BiologicalIngredients';
			d.storeKey = new itemBiologicalIngredient(storeApplicationData.items.UpdateDetails.BiologicalIngredients.Key, bioId);
		}
		dijit.byId("dialog_BiologicalIngredient").storeKey = d.storeKey;
		d.show();	
	} catch(e) {
		console.log("ct.js - dialog_BiologicalIngredients_Add_onClick() error: " + e);
	}
}

function dialog_BiologicalIngredients_Remove_onClick() {
	try {
		var g;
		if (gSourceTab == 'Part1') g = dijit.byId('Part1_BiologicalIngredients');
		else  g = dijit.byId('UpdateDetails_BiologicalIngredients');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - dialog_BiologicalIngredients_Remove_onClick() error: " + e);
	}
}

function dialog_Device_Add_onClick() {
	try {
		try{
			if(!dijit.byId('dialog_Device_GMDNS').item){
				dijit.byId('dialog_Device_GMDNS').set('item', dijit.byId('dialog_Device_GMDNS').store._itemsByIdentity[Number(dijit.byId('dialog_Device').thisItem.GMDNS[0])])
			}
		} catch (e) {}
		dialog_Functions_Add('dialog_Device');
		appSave();	
	} catch(e) {
		console.log("ct.js - dialog_Device_Add_onClick() error: " + e);
	}
}

function dialog_Device_SearchButton_onClick() {
	try {
		var oName = dijit.byId('dialog_Device_GMDNName');
		var oFilter = dijit.byId('dialog_Device_GMDNS');
		var oButton = dijit.byId('dialog_Device_SearchButton');
		var oResults = dojo.byId('searchResults');
		var vContext = getRadioValue('dialog_Device_GMDNContext') || '';

		if (oName.value.length < 3) { 
			dialogText('Search text','Please enter at least three character to search for'); 
			return 0; 
		}
		if (!oName.get('isSearching')) {
			oName.set('isSearching', 0);
		}
		oResults.innerHTML = '';
		if (oName.get('isSearching') == 1) {
			oButton.set('label', 'Search');
			oName.focus();
			oName.set('isSearching', 0);
			oName.domNode.style.display='';
			oName.set('value','');
			try { if (oFilter.store) oFilter.store.close(); }catch(e){}
			oFilter.store = null;
			oFilter.reset();
			oFilter.domNode.style.display='none';
			oResults.innerHTML = '';
			oFilter.focus();
		} else {
			oButton.set('label', 'Cancel');
			oName.set('isSearching', 1);
			oName.domNode.style.display='none';
			oFilter.domNode.style.display='';
			oFilter.set('placeHolder','Please wait... searching...');
			oFilter.setDisabled(true);

			if (vContext == 'N'){
				var xagent = 'xAgentGMDNSearch.xsp?searchstr=' + oName.get('value');
			}else{
				var xagent = 'xAgentGMDNSearch.xsp?gmdn=' + oName.get('value');
			}
			oFilter.store=new dojo.data.ItemFileReadStore({
				url: constant.DBURL + xagent,
				query : "*",
				urlPreventCache: true
			});

			oFilter.store.fetch({
				onBegin:function(items, request){
				oButton.set('label', 'Searching');
				oButton.setDisabled(true);
			},onComplete:function(items, request){
				if (items.length < 1) {
					dialogText('No Matches', 'No matches found for ' + oName.get('value'));
					setTimeout("dijit.byId('dialog_Device_SearchButton').onClick();", 10);
				}
				if(items.length == 1){
					oResults.innerHTML = items.length + ' match for "' + oName.get('value') + '"';
				} else {
					oResults.innerHTML = items.length + ' matches for "' + oName.get('value') + '"';
				}
				oButton.setDisabled(false);
				oButton.set('label', 'New Search');
				oFilter.setDisabled(false);
				oFilter.set('placeHolder','Search complete, select from the list');
				oFilter.focus();
			}
			});
		}	
	} catch(e) {
		console.log("ct.js - dialog_Device_SearchButton_onClick() error: " + e);
	}
}

function dialog_Medicine_Close_onClick() {
	try {
		var medId =  getThisId("dialog_Medicine");
		var gs;
		if (gSourceTab == 'Part1') gs = dijit.byId('Part1_MedicineIngredients');
		else gs = dijit.byId('UpdateDetails_MedicineIngredients');
		if  (!dijit.byId("dialog_Medicine").thisItem) 			
			gs.store.fetch({query:{medicineId:medId}, onComplete: function (items) { for(i=0;i < items.length; i++) { var item = items[i]; gs.store.deleteItem(item); } }});
		dijit.byId('dialog_Medicine').hide(); 	
	} catch(e) {
		console.log("ct.js - dialog_Medicine_Close_onClick() error: " + e);
	}
}

function dialog_Medicine_onShow() {
	try {
		dialog_Functions_onShow('dialog_Medicine');
		var medId =  getThisId("dialog_Medicine");
		if (gSourceTab == 'Part1') {
			dojo.style('UpdateDetails_MedicineIngredientsGrid','display','none');
			dijit.byId('Part1_MedicineIngredients').setQuery({medicineId:medId});
			dojo.style('Part1_MedicineIngredientsGrid','display','');
		} else {
			dojo.style('Part1_MedicineIngredientsGrid','display','none');
			dijit.byId('UpdateDetails_MedicineIngredients').setQuery({medicineId:medId});
			dojo.style('UpdateDetails_MedicineIngredientsGrid','display','');
		}
		if (dijit.byId("dialog_Medicine").disableEditing) 	{
			dijit.byId('dialog_MedicineIngredients_Add').set('disabled', true);
			dijit.byId('dialog_MedicineIngredients_Remove').set('disabled', true);
		} else {
			dijit.byId('dialog_MedicineIngredients_Add').set('disabled', false);
			dijit.byId('dialog_MedicineIngredients_Remove').set('disabled', false);
		}
		if (dijit.byId('dialog_Medicine_ActiveNameText') != null) dijit.byId('dialog_Medicine_ActiveNameText').set('disabled', false);
		if (dijit.byId('dialog_Medicine_ProductStrengthDataToProcess') != null) dijit.byId('dialog_Medicine_ProductStrengthDataToProcess').set('disabled', false);
	} catch(e) {
		console.log("ct.js - dialog_Medicine_onShow() error: " + e);
	}
}

function dialog_MedicineIngredient_Add_onClick() {
	try {
		var medId =  getThisId("dialog_Medicine");
		var d = dijit.byId('dialog_MedicineIngredient');
		if (gSourceTab == 'Part1') {
			dijit.byId('Part1_MedicineIngredients').setQuery({medicineId:medId});
			d.gridID = 'Part1_MedicineIngredients';
		} else {
			d.gridID = 'UpdateDetails_MedicineIngredients';
			dijit.byId('UpdateDetails_MedicineIngredients').setQuery({medicineId:medId});
		}
		dialog_Functions_Add('dialog_MedicineIngredient');
		appSave();
	} catch(e) {
		console.log("ct.js - dialog_MedicineIngredient_Add_onClick() error: " + e);
	}
}

function dialog_MedicineIngredients_Add_onClick() {
	try {
		var medId =  getThisId("dialog_Medicine");
		var d = dijit.byId('dialog_MedicineIngredient');
		d.editMode = false;
		d.thisItem = null;
		if (gSourceTab == 'Part1') {
			d.gridID = 'Part1_MedicineIngredients';
			d.storeKey = new itemMedicineIngredient(storeApplicationData.items.Part1.MedicineIngredients.Key, medId);
		} else {
			d.gridID = 'UpdateDetails_MedicineIngredients';
			d.storeKey = new itemMedicineIngredient(storeApplicationData.items.UpdateDetails.MedicineIngredients.Key, medId);
		}
		dijit.byId("dialog_MedicineIngredient").storeKey = d.storeKey;
		d.show();	
	} catch(e) {
		console.log("ct.js - dialog_MedicineIngredients_Add_onClick() error: " + e);
	}
}

function dialog_MedicineIngredients_Remove_onClick() {
	try {
		var g;
		if (gSourceTab == 'Part1') g = dijit.byId('Part1_MedicineIngredients');
		else  g = dijit.byId('UpdateDetails_MedicineIngredients');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}
	} catch(e) {
		console.log("ct.js - dialog_MedicineIngredients_Remove_onClick() error: " + e);
	}
}

function disableStartDate(){
	//23MAR2015 BL disable updatedetails TrialStartDate if it is today or earlier
	try {
		var today = new Date();
		var startDate = new Date(storeApplicationData.items.UpdateDetails.TrialStartDate);
		if(startDate <= today){
			disableByIdPrefix('UpdateDetails_TrialStartDate', true);
		}
	} catch(e) {
		console.log("ct.js - disableStartDate() error: " + e);
	}		
}

function drawAttachmentsCT(items,theStore){
	try {
		dojo.query('[class*=__isattachment]').forEach( function(node, index, arr){
			var thedijit = dijit.byNode(node);
			try {
				if (thedijit) {
					thedijit.set('value', itemfile);
					delete thedijit.AttachmentFileName;
					delete thedijit.AttachmentId;
					var thebutton = dijit.byId(thedijit.id + '-action');
					if (thebutton) {
						thebutton.set('label', 'Attach');
						delete thebutton.AttachmentFileName;
						delete thebutton.AttachmentId;
					}
					var thebutton2 = dijit.byId(thedijit.id + '-view');
					if (thebutton2) {
						delete thebutton2.AttachmentFileName;
						delete thebutton2.AttachmentId;
					}
				}
			}catch (e){console.log(e);}
		} );
		if (!items) return;

		for (var z=0; z < items.length; z++) {
			if (items[z].AttachmentFileName && items[z].AttachmentContext && items[z].AttachmentId && items[z].AttachmentLocation) {
				var itemfile = items[z].AttachmentFileName.toString();
				var itemlocation = items[z].AttachmentLocation.toString();
				var itemid = items[z].AttachmentId.toString();
				var itemcontext = items[z].AttachmentContext.toString();
				var Shazza = undefined;
				if (itemlocation.substring(0,7) == 'dialog_') {
					Shazza = dijit.byId( itemlocation.substring(0, itemlocation.substring(7).indexOf('_')+7 ) );
				}
				//console.log(itemfile + ' write to field ' + itemlocation + ' where context is ' + itemcontext );
				var updateByLocation = false;
				if (Shazza){
					var dialogItem = Shazza.thisItem;
					if (dialogItem) {
						if (dialogItem.RecordUNID.toString() == itemcontext) { updateByLocation = true; }
					} else {
						if (Shazza.storeKey) {
							if (Shazza.storeKey.RecordUNID.toString() == itemcontext) { updateByLocation = true; }
						}
					}
				} else { updateByLocation = true }

				if (updateByLocation && itemlocation) {
					try {
						thedijit = dijit.byId(itemlocation);
						if (thedijit) {
							thedijit.set('value', itemfile);
							thedijit.set('AttachmentFileName', itemfile);
							thedijit.set('AttachmentId', itemid);
							var thebutton = dijit.byId(thedijit.id + '-action');
							if (thebutton) {
								thebutton.set('label', 'Remove');
								thebutton.set('AttachmentFileName', itemfile);
								thebutton.set('AttachmentId', itemid);
							}
							var thebutton2 = dijit.byId(thedijit.id + '-view');
							if (thebutton2) {
								thebutton2.set('AttachmentFileName', itemfile);
								thebutton2.set('AttachmentId', itemid);
							}
						}
					}catch (e){console.log(e);}
				}
			}
		}
	} catch(e) {
		console.log("ct.js - drawAttachmentsCT() error: " + e);
	}	
}

function findUpTag(el, tag) {
	try {
		while (el.parentNode) {
			el = el.parentNode;
			if (el == null) {
				return null;
			} else {
				if (el.tagName.toLowerCase() === tag.toLowerCase())
					return el;
			}
		}
		return null;
	} catch(e) {
		console.log("ct.js - findUpTag() error: " + e);
	}	
}

function formatterButtonEdit(rowIndex, item){
	try {
		var w = new dijit.form.Button({
			label:"Open",
			onClick: function() {
			var d = null;
			var g = null;
			var t = null;
			var b = null;
			var gridid = '';
			switch(item.Form[0]) {
			case 'Biological':
				d = dijit.byId('dialog_Biological');
				d.reset();
				if(storeApplicationData.items.ApplicationStage == "1"){
					g = dijit.byId('Part1_Biologicals');
					d.storeKey = new itemBiological(storeApplicationData.items.Part1.Biologicals.Key);
					d.gridID = 'Part1_Biologicals';
				} else if(storeApplicationData.items.ApplicationStage == "4"){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_Biologicals');
						d.storeKey = new itemBiological(storeApplicationData.items.Part1.Biologicals.Key);
						d.gridID = 'Part1_Biologicals';
					} else {
						g = dijit.byId('UpdateDetails_Biologicals');
						d.storeKey = new itemBiological(storeApplicationData.items.UpdateDetails.Biologicals.Key);
						d.gridID = 'UpdateDetails_Biologicals';
					}
				}
				migratedBiologicalDataShowWhen(rowIndex, true);
				break;
			case 'Medicine':
				d = dijit.byId('dialog_Medicine');
				d.reset();
				if(storeApplicationData.items.ApplicationStage == "1"){
					g = dijit.byId('Part1_Medicines');
					d.storeKey = new itemMedicine(storeApplicationData.items.Part1.Medicines.Key);
					d.gridID = 'Part1_Medicines';
				} else if(storeApplicationData.items.ApplicationStage == "4"){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_Medicines');
						d.storeKey = new itemMedicine(storeApplicationData.items.Part1.Medicines.Key);
						d.gridID = 'Part1_Medicines';
					} else {
						g = dijit.byId('UpdateDetails_Medicines');
						d.storeKey = new itemMedicine(storeApplicationData.items.UpdateDetails.Medicines.Key);
						d.gridID = 'UpdateDetails_Medicines';
					}
				}
				migratedMedicineDataShowWhen(null, false);
				break;
			case 'Site':
				d = dijit.byId('siteDetailDialog');
				d.reset();
				if(parseInt(storeApplicationData.items.ApplicationStage) == 1){
					g = dijit.byId('Part1_Sites');
					d.storeKey = new itemSite(storeApplicationData.items.Part1.Sites.Key);
					d.gridID = 'Part1_Sites';
				} else if(parseInt(storeApplicationData.items.ApplicationStage) == 4){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_Sites');
						d.storeKey = new itemSite(storeApplicationData.items.Part1.Sites.Key);
						d.gridID = 'Part1_Sites';
					} else {
						g = dijit.byId('UpdateDetails_Sites');
						d.storeKey = new itemSite(storeApplicationData.items.UpdateDetails.Sites.Key);
						d.gridID = 'UpdateDetails_Sites';
					}
				}
				break;
			case 'AnimalExcipient':
				d = dijit.byId('dialog_AnimalExcipient');
				d.reset();
				if(storeApplicationData.items.ApplicationStage == "1"){
					g = dijit.byId('Part1_AnimalExcipients');
					d.storeKey = new itemAnimalExcipient(storeApplicationData.items.Part1.AnimalExcipients.Key);
					d.gridID = 'Part1_AnimalExcipients';
				}else if(storeApplicationData.items.ApplicationStage == "4"){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_AnimalExcipients');
						d.storeKey = new itemAnimalExcipient(storeApplicationData.items.Part1.AnimalExcipients.Key);
						d.gridID = 'Part1_AnimalExcipients';
					} else {
						g = dijit.byId('UpdateDetails_AnimalExcipients');
						d.storeKey = new itemAnimalExcipient(storeApplicationData.items.UpdateDetails.AnimalExcipients.Key);
						d.gridID = 'UpdateDetails_AnimalExcipients';
					}
				}
				break;
			case 'Device':
				d = dijit.byId('dialog_Device');
				d.reset();
				if(storeApplicationData.items.ApplicationStage == "1"){
					g = dijit.byId('Part1_Devices');
					d.storeKey = new itemDevice(storeApplicationData.items.Part1.Devices.Key);
					d.gridID = 'Part1_Devices';
				}else if(storeApplicationData.items.ApplicationStage == "4"){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_Devices');
						d.storeKey = new itemDevice(storeApplicationData.items.Part1.Devices.Key);
						d.gridID = 'Part1_Devices';
					} else {
						g = dijit.byId('UpdateDetails_Devices');
						d.storeKey = new itemDevice(storeApplicationData.items.UpdateDetails.Devices.Key);
						d.gridID = 'UpdateDetails_Devices';
					}
				}
				break;
			case 'Placebo':
				d = dijit.byId('dialog_Placebo');
				d.reset();
				if(storeApplicationData.items.ApplicationStage == "1"){
					g = dijit.byId('Part1_Placebos');
					d.storeKey = new itemPlacebo(storeApplicationData.items.Part1.Placebos.Key);
					d.gridID = 'Part1_Placebos';
				}else if(storeApplicationData.items.ApplicationStage == "4"){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_Placebos');
						d.storeKey = new itemPlacebo(storeApplicationData.items.Part1.Placebos.Key);
						d.gridID = 'Part1_Placebos';
					} else {
						g = dijit.byId('UpdateDetails_Placebos');
						d.storeKey = new itemPlacebo(storeApplicationData.items.UpdateDetails.Placebos.Key);
						d.gridID = 'UpdateDetails_Placebos';
					}
				}
				break;
			case 'BiologicalIngredient':
				d = dijit.byId('dialog_BiologicalIngredient');
				d.reset();
				var bioId =  getThisId("dialog_Biological");
				if(storeApplicationData.items.ApplicationStage == "1"){
					g = dijit.byId('Part1_BiologicalIngredients');
					d.storeKey = new itemBiologicalIngredient(storeApplicationData.items.Part1.BiologicalIngredients.Key, bioId);
					d.gridID = 'Part1_BiologicalIngredients';
				}else if(storeApplicationData.items.ApplicationStage == "4"){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_BiologicalIngredients');
						d.storeKey = new itemBiologicalIngredient(storeApplicationData.items.Part1.BiologicalIngredients.Key, bioId);
						d.gridID = 'Part1_BiologicalIngredients';
					} else {
						g = dijit.byId('UpdateDetails_BiologicalIngredients');
						d.storeKey = new itemBiologicalIngredient(storeApplicationData.items.UpdateDetails.BiologicalIngredients.Key, bioId);
						d.gridID = 'UpdateDetails_BiologicalIngredients';
					}
				}
				break;
			case 'MedicineIngredient':
				d = dijit.byId('dialog_MedicineIngredient');
				d.reset();
				var medId =  getThisId("dialog_Medicine");
				if(storeApplicationData.items.ApplicationStage == "1"){
					g = dijit.byId('Part1_MedicineIngredients');
					d.storeKey = new itemMedicineIngredient(storeApplicationData.items.Part1.MedicineIngredients.Key, medId);
					d.gridID = 'Part1_MedicineIngredients';
				}else if(storeApplicationData.items.ApplicationStage == "4"){
					//find out where the user clicked and use appropriate grid
					b = item.id[0].split('~');
					if (b[2] == 'Part1'){
						g = dijit.byId('Part1_MedicineIngredients');
						d.storeKey = new itemMedicineIngredient(storeApplicationData.items.Part1.MedicineIngredients.Key, medId);
						d.gridID = 'Part1_MedicineIngredients';
					} else {
						g = dijit.byId('UpdateDetails_MedicineIngredients');
						d.storeKey = new itemMedicineIngredient(storeApplicationData.items.UpdateDetails.MedicineIngredients.Key, medId);
						d.gridID = 'UpdateDetails_MedicineIngredients';
					}
				}
				break;
			}

			if (rowIndex >= 0) {
				if(d && g){
					d.set('thisItem', g.getItem(rowIndex));
					t = item.RecordUNID[0].split('~');
					gSourceTab=t[2];
					if(storeApplicationData.items.ApplicationStage == "4" && gSourceTab == "Part1"){
						d.disableEditing = true;
					} else if(storeApplicationData.items.ApplicationStage == "4" && gSourceTab == "UpdateDetails"){
						d.disableEditing = false
					} else if(storeApplicationData.items.ApplicationStage == "1" && gSourceTab == "Part1"){
						d.disableEditing = false
					} else if(storeApplicationData.items.ApplicationStage == "1" && gSourceTab == "UpdateDetails"){
						d.disableEditing = true;
					} else {
						d.disableEditing = true;
					}
					d.set('editMode', true);
					d.show();
				} else {
					console.log('dialog and grid not set');
				}
			}
		}
		});
		w._destroyOnRemove=true;
		return w;
	} catch(e) {
		console.log("ct.js - formatterButtonEdit() error: " + e);
	}	
}

function formatterCountry(rowIndex, item){
	try {
		var len = 0;
		var fieldname = '';
		var retVal = '';
		if(item){
			if(item.CountryList_Label){
				len = item.CountryList_Label.length;
				for(x=0; x < len; x++){
					if(x === 0){
						retVal +=  item.CountryList_Label[x];
					}else{
						retVal +=  ', ' + item.CountryList_Label[x];
					}
				}
			}
		}

		return retVal;
	} catch(e) {
		console.log("ct.js - formatterCountry() error: " + e);
	}	
}

function formatterIntendedUse(rowIndex, item){
	try {
		var len = 0;
		var fieldname = '';
		var retVal = '';
		if(item){
			if(item.IntendedUse){
				len = item.IntendedUse.length;
				for(x=0; x < len; x++){
					fieldname = 'dialog_' + item.Form  + '_IntendedUse' + item.IntendedUse[x];
					if(x === 0){
						retVal +=  dijit.byId(fieldname).attr('label');
					}else{
						retVal +=  ', ' + dijit.byId(fieldname).attr('label');
					}
				}
			}
		}
		return retVal;
	} catch(e) {
		console.log("ct.js - formatterIntendedUse() error: " + e);
	}	
}

function getDeviceOnly(part1Classifications){
	try {
		if(part1Classifications){
			if(part1Classifications.length == 1 && part1Classifications[0] == "2"){ 
				return true;
			}
			if(part1Classifications.length == 2){
				if(part1Classifications[0] == "2" && part1Classifications[1] =="7"){
					return true;
				}
			}
		}
		return false;
	} catch(e) {
		console.log("ct.js - getDeviceOnly() error: " + e);
	}		
}

function getJSONFromServer(waitForIt, timeoutMS, preventCaching, callbackFunction, theURL, resultDataType){
	try {
		var returnVal = {data:{}, error:true, errorcode:0, message:'Unhandled Exception'};
		this.errorcode=5;

		//not thoroughly tested yet
		if (theURL == undefined || theURL.length<2) {
			returnVal.message = "No URL supplied";
			returnVal.errorcode = -2;
			return returnVal;
		}
		gJFS_results = dojo.xhrGet({ handleAs:(resultDataType=="javascript"?"javascript":"json"), sync:(waitForIt==true), preventCache:(preventCaching==true), url:theURL, 
			load: function(response, ioArgs) {
			if (response.length < 1) {
				returnVal.message = "Loading the specified JSON '" + escape(theURL) + "' for this Application from the server failed, please contact TGA Technical Support regarding this issue.";
			}
			returnVal.data=response;
			returnVal.ioArgs=ioArgs;
			if (callbackFunction != undefined && callbackFunction != null && callbackFunction.lenth > 0){
				eval( (callbackFunction+'(returnVal)') );
			}
			return returnVal;
		},
		error: function(response, ioArgs) {
			returnVal.message = 'HTTP status code: ' + ioArgs.xhr.status + '. URL: ' + ((theURL != undefined && theURL != null) ? escape(theURL) : '');
			return returnVal;
		},
		handle: function(error, ioargs) {
			returnVal.errorcode=ioargs.xhr.status;
			switch (ioargs.xhr.status) {
			case 200:
				returnVal.message = "Good request.";
				returnVal.error=false;
				break;
			case 404:
				returnVal.message = "The requested page was not found";
				break;
			case 500:
				returnVal.message = "The server reported an error.";
				break;
			case 407:
				returnVal.message = "You need to authenticate with a proxy.";
				break;
			default:
				message = "Unknown error.";
			}
			try { console.error('xhrGet error ', ioargs.xhr.status, message); }catch(e){}
			return returnVal;
		}
		});
		if (gJFS_results) { if (gJFS_results.results) {
			if (gJFS_results.results[0]) { return gJFS_results.results[0];
			}else{ return gJFS_results.results; }
		} else { return gJFS_results; } }
	} catch(e) {
		console.log("ct.js - getJSONFromServer() error: " + e);
	}	
}

function getNSFBase() {
	try {
		var base = location.href.toLowerCase();
		return base.substring(0, base.indexOf(".nsf") + 4);
	} catch(e) {
		console.log("ct.js - getNSFBase() error: " + e);
	}		
}

function getThisId(dlgName) {
	try {
		var retId='';
		var djtObj = dijit.byId(dlgName);
		if (!djtObj) return '';
		if (djtObj.thisItem) {
			if (typeof(djtObj.thisItem.id)=="object") retId = djtObj.thisItem.RecordUNID[0];
			else retId = djtObj.thisItem.id;
		} else retId = djtObj.storeKey.Key.id;
		return retId;
	} catch(e) {
		console.log("ct.js - getThisId() error: " + e);
	}		
}

function getURLParameter(name) {
	return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function hasMedBio(part1Classifications){
	try {
		var a = part1Classifications.indexOf("0");
		var b = part1Classifications.indexOf("1");
		if(a != -1 || b != -1){
			return true;
		}else{
			return false;
		}
	} catch(e) {
		console.log("ct.js - hasMedBio() error: " + e);
	}
}

function initializeCTApplicationData(theStatus, isNew, clientName, clientID, commonUserName) {
	try {
		
		isPrintPreview = /&PP=1/.test(window.location.search);
		if (isPrintPreview) { setTimeout('printPreview()', 500); return; }
		
		isInitializing = true;

		setDataStatusText(constant.DataStatus_Loading);
		if(!storeApplicationData.items.isClean){
			storeApplicationData.items.ClientName = clientName;
			storeApplicationData.items.ClientId = clientID;
		}

		if (isNew) {
			storeApplicationData.items.ApplicationStatus = 'Draft';
			storeApplicationData.items.LabelName = '';
			storeApplicationData.items.SponsorName = clientName;
			storeApplicationData.items.SponsorID = clientID;

			var tmpURL = constant.DBURL + 'JSONMIMEFile?openform&ONSUBMIT=jsonUploadBegin&ONCOMPLETE=postNewRedirect&ID=' + storeApplicationData.items.ApplicationId + '&V=' + storeApplicationData.items.ApplicationVersion + '&R=' + Math.random();
			var newiframe = createFrame('submit', true, tmpURL, 0, 0, true);
			return;
		}
		if (theStatus != -1) {
			alert("An error was encountered whilst loading this Application, please contact the TGA Helpdesk regarding this issue");
			window.location.href = "/";
		}

		if (storeApplicationData.items.SponsorID == undefined || storeApplicationData.items.SponsorID == '') {
			storeApplicationData.items.SponsorName = clientName;
			storeApplicationData.items.SponsorID = clientID;
		}

		djstore_Countries = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=COUNTRY'});
		djstore_Countries.fetch();
		djstore_RouteOfAdministration = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=ROA'});
		djstore_RouteOfAdministration.fetch();
		djstore_TotalPatients = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=TOTALPATIENTS'});
		djstore_TotalPatients.fetch();
		djstore_Theraarea = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=THERAAREA'});
		djstore_Theraarea.fetch();
		djstore_Unitsprop = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=UNITSPROP'});
		djstore_Unitsprop.fetch();
		djstore_Dosage = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=DOSAGE'});
		djstore_Dosage.fetch();
		djstore_States = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=STATES'});
		djstore_States.fetch();
		djstore_Aorigin = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=W&T=AORIGIN'});
		djstore_Aorigin.fetch();
		djstore_Aparts = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=W&T=APARTS'});
		djstore_Aparts.fetch();
		djstore_Aprep = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=W&T=APREP'});
		djstore_Aprep.fetch();
		djstore_CompDet = new dojo.data.ItemFileReadStore({url:'xAgentLookupCT.xsp?S=N&T=COMPDET'});
		djstore_CompDet.fetch();

		djstore_PrecedingTrials = new dojo.data.ItemFileReadStore({ url:'xAgentLookupRepository.xsp?&R=' +Math.random()});
		djstore_PrecedingTrials.fetch();
		djstore_Mandatory = new dojo.data.ItemFileReadStore({ url:'xAgentLookupMandatory.xsp?S=N&AT=' +  storeApplicationData.items.ClinicalTrialType + '&R=' +Math.random()});
		djstore_Mandatory.fetch({onComplete:loadMandatory()});

		var counter = 0;
		var interval = setInterval(function() {
			c = djstore_PrecedingTrials._arrayOfAllItems.length + djstore_Mandatory._arrayOfAllItems.length;
			counter++;
			if(c > 0){
				clearInterval(interval);
				loadPrecedingTrials();
				loadMandatory();
			}
			if(counter > 3){
				loadPrecedingTrials();
				loadMandatory();
				clearInterval(interval);
			}
		}, 1000);

		ctt = storeApplicationData.items.ClinicalTrialType;
		if (ctt != 'CTX' && ctt != 'CTN') ctt = 'CTX';
		storeApplicationData.items.ClinicalTrialType = ctt;
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData(start) error: " + e);
		alert('There has been as error loading the data for this application:\n\n' + e + '\n\nPlease contact TGA Help Desk');
		window.location.href = "/";
	}

	dojo.parser.parse();

	try {
		dojo.byId('ApplicationStatus').innerHTML = storeApplicationData.items.ApplicationStatus;
		dijit.byId('djborder_Tabs').resize();
		dijit.byId('djborder_Main').resize();
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData(ApplicationStatus) error: " + e);
	}

	try {
		loadCodeTables();
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData(loadCodeTables) error: " + e);
	}

	try {
		loadDataFromStore();
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData(loadDataFromStore) error: " + e);
	}

	try {
		Part1Display();
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData(Part1Display) error: " + e);
	}

	try {
		CompletionDisplay();
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData(CompletionDisplay) error: " + e);
	}

	//06APR2016 moved to the head of the function to improve performance
	//isPrintPreview = /&PP=1/.test(window.location.search);
	//if (isPrintPreview) { setTimeout('printPreview()', 500); return; }

	try {
		if (typeof storeApplicationData.items.ValidationLog != 'object') {
			storeApplicationData.items.ValidationLog = new itemValidationLog(storeApplicationData.items.Key);
		}
		var xx1 = new dojo.data.ItemFileWriteStore({data:storeApplicationData.items.ValidationLog });
		if (xx1) {
			storeApplicationData.items.ValidationLog = x;
			var xx2 = dijit.byId('djgrid_Validation');
			if (xx2) xx2.store = xx1;
			xx2.render();
		}
	} catch (e) {
		console.log("ct.js - initializeCTApplicationData() Problem loading Validation Log from existing JSON: " + e);
	}

	try {
		// Full Sponsor List for TGA Role User, reload the SponsorList
		if (isTGAUser == "1") {
			var cid = commonUserName;
			if (instr(cid, "_")) {
				cid = strRight(cid, "_");
			}
			
			var results1 = null;

			if(typeof(Storage)!== "undefined") {
				var cachedValue = sessionStorage.getItem("allSponsorData");
				if (cachedValue != null && cachedValue != "") {
					// Sponsor data was found in cache
					results1 = JSON.parse(cachedValue);
				}
			}

			if (results1 == null) {
				try {
					results1 = dojo.xhrGet( {
						url:'xAgentLookupAllSponsorData.xsp?&c=' + cid + '&user=' + commonUserName,
						handleAs: "json",
						sync: true,
						//preventCache: true,
						load: function(response, ioArgs) {
						if (response.length < 1) {
							response = { identifier:"NoId", label:"NoName", items: [ { name:"Error in loading",  id:"00000" } ] };
						} else {
							// Cache the data for faster retrieval later
							sessionStorage.setItem("allSponsorData", JSON.stringify(response));
						}
						return response;
					},
					error: function(response, ioArgs) {
						console.error("HTTP status code: ", ioArgs.xhr.status);
						return response;
					}
					});
				}catch(e) {
					console.log("ct.js - initializeCTApplicationData() storeSponsorList cannot be obtained: " + e.message);
				}
			}

			if (results1.items) 
				storeSponsorList = results1.items[0].SponsorList;
			else
				storeSponsorList = results1.results[0].items[0].SponsorList;
			if ( storeSponsorList.items[0]) {
				djstore_SponsorList = new dojo.data.ItemFileWriteStore({data: storeSponsorList });
				var q1 = dijit.byId('Application_SponsorName');
				q1.store = djstore_SponsorList;
				if (storeApplicationData.items.SponsorID) {
					q1.set('value', storeApplicationData.items.SponsorID );
				}
			}
		} else {
			if (storeSponsorList.items[0].SponsorList) {
				djstore_SponsorList = new dojo.data.ItemFileWriteStore({data: storeSponsorList.items[0].SponsorList });
				djstore_SponsorList._arrayOfAllItems = storeSponsorList.items[0].SponsorList;
				var q1 = dijit.byId('Application_SponsorName');
				q1.store = djstore_SponsorList;
				q1.set('value', storeApplicationData.items.SponsorID );
			} else {
				storeSponsorList.items[0].SponsorList.items[0] = {name:'no sponsors to load!',id:'0'};
			}
		}
	} catch (e) {
		console.log("ct.js - initializeCTApplicationData() Problem loading Sponsor List: " + e);
	}

	loadStoreData( 'Part1_TrialConductedInCountries', storeApplicationData.items.Part1.TrialConductedInCountries, false);
	loadStoreData( 'Part1_Biologicals', storeApplicationData.items.Part1.Biologicals, false);
	loadStoreData( 'Part1_Medicines', storeApplicationData.items.Part1.Medicines, false);
	loadStoreData( 'Part1_AnimalExcipients', storeApplicationData.items.Part1.AnimalExcipients, false);
	loadStoreData( 'Part1_Devices', storeApplicationData.items.Part1.Devices, false);
	loadStoreData( 'UpdateDetails_Biologicals', storeApplicationData.items.UpdateDetails.Biologicals, false);
	loadStoreData( 'UpdateDetails_Medicines', storeApplicationData.items.UpdateDetails.Medicines, false);
	loadStoreData( 'UpdateDetails_Devices', storeApplicationData.items.UpdateDetails.Devices, false);
	loadStoreData( 'UpdateDetails_Sites', storeApplicationData.items.UpdateDetails.Sites, false);
	loadStoreData( 'UpdateDetails_AnimalExcipients', storeApplicationData.items.UpdateDetails.AnimalExcipients, false);
	loadStoreData( 'UpdateDetails_TrialConductedInCountries', storeApplicationData.items.UpdateDetails.TrialConductedInCountries, false);

	// Fixes for existing data did not contain the data store for MedicineIngredients and BiologicalIngredients
	eval('storeApplicationData.items.Part1.MedicineIngredients');
	if ((storeApplicationData.items.Part1.MedicineIngredients == undefined) || (storeApplicationData.items.Part1.MedicineIngredients == null)) {
		storeApplicationData.items.Part1.MedicineIngredients = new itemMedicineIngredients( storeApplicationData.items.Part1.Key);
	}
	loadStoreData( 'Part1_MedicineIngredients', storeApplicationData.items.Part1.MedicineIngredients, false);

	eval('storeApplicationData.items.Part1.BiologicalIngredients');

	if ((storeApplicationData.items.Part1.BiologicalIngredients == undefined) || (storeApplicationData.items.Part1.BiologicalIngredients == null)) {
		storeApplicationData.items.Part1.BiologicalIngredients = new itemBiologicalIngredients( storeApplicationData.items.Part1.Key);
	}
	loadStoreData( 'Part1_BiologicalIngredients', storeApplicationData.items.Part1.BiologicalIngredients, false);

	eval('storeApplicationData.items.UpdateDetails.MedicineIngredients');
	if ((storeApplicationData.items.UpdateDetails.MedicineIngredients == undefined) || (storeApplicationData.items.UpdateDetails.MedicineIngredients == null)) {
		storeApplicationData.items.UpdateDetails.MedicineIngredients = new itemMedicineIngredients( storeApplicationData.items.UpdateDetails.Key);
	}
	loadStoreData( 'UpdateDetails_MedicineIngredients', storeApplicationData.items.UpdateDetails.MedicineIngredients, false);

	eval('storeApplicationData.items.UpdateDetails.BiologicalIngredients');
	if ((storeApplicationData.items.UpdateDetails.BiologicalIngredients == undefined) || (storeApplicationData.items.UpdateDetails.BiologicalIngredients == null)) {
		storeApplicationData.items.UpdateDetails.BiologicalIngredients = new itemBiologicalIngredients( storeApplicationData.items.UpdateDetails.Key);
	}
	loadStoreData( 'UpdateDetails_BiologicalIngredients', storeApplicationData.items.UpdateDetails.BiologicalIngredients, false);

	if (storeApplicationData.items) {
		var ctt = storeApplicationData.items.ClinicalTrialType;
		if (ctt) {
			if (ctt == 'CTX') {
				Part2Display();
				UpdateDetailsDisplay();
				loadStoreData( 'Part2_Sites', storeApplicationData.items.Part2.Sites, false);
				loadStoreData( 'Part2_Placebos', storeApplicationData.items.Part2.Placebos, false);
			} else { //CTN
				UpdateDetailsDisplay();
				loadStoreData( 'Part1_Sites', storeApplicationData.items.Part1.Sites, false);
				loadStoreData( 'Part1_Placebos', storeApplicationData.items.Part1.Placebos, false);
			}
		}
	}

	if((storeApplicationData.items.ApplicationStage == "4" || storeApplicationData.items.ApplicationStage == "5") && storeApplicationData.items.ClinicalTrialType == "CTN"){
		loadStoreData( 'UpdateDetails_Sites', storeApplicationData.items.UpdateDetails.Sites, false);
		loadStoreData( 'UpdateDetails_Placebos', storeApplicationData.items.UpdateDetails.Placebos, false);
		setDataSectionForUpdateDetails();
	}

	try {
		dojo.connect(dijit.byId('djgrid_Validation'), 'onClick', validationFocus );
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData() couldn't connect djgrid_Validation.onClick() to validationFocus() function: " + e);
	}

	setTimeout(function(){
		var loader = dojo.byId("uiSplashScreen1");
		dojo.fadeOut({ node: loader, duration: 500, onEnd: function(){ loader.style.display = "none"; }}).play();
		var loader2 = dojo.byId("uiSplashScreen2");
		dojo.fadeOut({ node: loader2, duration: 500, onEnd: function(){ loader2.style.display = "none"; }}).play();
	}, 500);

	setDataStatusText(constant.DataStatus_Loaded);

	try {
		if (!storeApplicationData.items.ApplicationStage) { storeApplicationData.items.ApplicationStage = '1'; }
		switch(storeApplicationData.items.ApplicationStage) {
		case '1':
			disableByIdPrefix('Part2_', true);
			disableByIdPrefix('UpdateDetails_', true);
			disableByIdPrefix('Completion_', true);
			break;
		case '2':
			disableByIdPrefix('Part1_', true);
			disableByIdPrefix('UpdateDetails_', true);
			disableByIdPrefix('Completion_', true);
			disableByIdPrefix('dialog_BiologicalLookup_Countries', true);
			break;
		case '3': //completion
			disableByIdPrefix('Part1_', true);
			disableByIdPrefix('Part2_', true);
			disableByIdPrefix('UpdateDetails_', true);
			disableByIdPrefix('dialog_BiologicalLookup_Countries', true);
			break;
		case '4': case '5': //variation change to trial details
			disableByIdPrefix('Part1_', true);
			disableByIdPrefix('Part2_', true);
			disableByIdPrefix('Completion_', true);
			disableByIdPrefix('Application_', true);
			disableByIdPrefix('Application_Button_',false);
			disableByIdPrefix('Application_SponsorAddress',false);
			//disableStartDate();
			break;
		default:
			disableByIdPrefix('Part1_', true);
			disableByIdPrefix('Part2_', true);
			disableByIdPrefix('Completion_', true);
			disableByIdPrefix('UpdateDetails_', true);
			disableByIdPrefix('Application_', true);
			disableByIdPrefix('Application_Button_Close',false);
			disableByIdPrefix('Application_Button_PrintPreview',false);
		}

		if (storeApplicationData.items.isClean) {
			if (storeApplicationData.items.isClean == "1") {
				migratedSponsorDataShowWhen(false);
			} else {
				migratedSponsorDataShowWhen(true);
			}
		}
	} catch(e) {
		console.log("ct.js - initializeCTApplicationData(end) error: " + e);
	}

	fixVersionIdInNodes();
	fixVariationIngredientIds();
}

function instr(cString, subString) {
	try {
		if (cString.indexOf(subString) > -1) {
			return true;
		} else {
			return false;
		}
	} catch(e) {
		console.log("ct.js - instr() error: " + e);
	}
}

function jsonUploadBegin(iframeName) {
	try {
		var newiframe = document.getElementById(iframeName);
		var iframeDoc = getIframeDocument(newiframe);
		var fieldJSON = iframeDoc.getElementById('JSONDataDump');
		if (fieldJSON) {
			dojo.byId('uiSplashScreen1_label').innerHTML = 'Please wait, processing request...';
			var loader = dojo.byId("uiSplashScreen1");
			loader.style.display = '';
			dojo.fadeIn({ node: loader, duration:200 }).play();
			var loader2 = dojo.byId("uiSplashScreen2");
			loader2.style.display = '';
			dojo.fadeIn({ node: loader2, duration:200 }).play();

			//dojo.publish("auditLogEvent", ["Application Saved"] );
			fieldJSON.value = JSON2.stringify(storeApplicationData);
			//create an array of 'supporting fields' and copy the data
			var fieldSupportFields = iframeDoc.getElementById('SupportingFieldDataSet');
			var objTmp = { dbpath:"", identifierlookupview:"LookupByApplicationID", identifier:"lookupkey", items: {form:'ct', type:'Application'} };
			objTmp.items.lookupkey = storeApplicationData.items.ApplicationId + "~" + storeApplicationData.items.ApplicationVersion;
			objTmp.items.ClientName = storeApplicationData.items.ClientName;
			objTmp.items.ApplicantName = storeApplicationData.items.ClientName;
			objTmp.items.ClientId = storeApplicationData.items.ClientId;
			objTmp.items.ApplicantId = storeApplicationData.items.ClientId;
			objTmp.items.ClinicalTrialType = storeApplicationData.items.ClinicalTrialType;
			objTmp.items.ApplicationStatus = storeApplicationData.items.ApplicationStatus;
			objTmp.items.ValidationStatus = storeApplicationData.items.ValidationStatus;
			objTmp.items.ApplicationFees = storeApplicationData.items.ApplicationFees;
			objTmp.items.ApplicationStage = storeApplicationData.items.ApplicationStage;
			objTmp.items.ApplicationId = storeApplicationData.items.ApplicationId;
			objTmp.items.ApplicationVersion = storeApplicationData.items.ApplicationVersion;
			objTmp.items.SponsorName = storeApplicationData.items.SponsorName;
			objTmp.items.SponsorId = storeApplicationData.items.SponsorID;
			objTmp.items.SponsorAddress = storeApplicationData.items.SponsorAddress;
			objTmp.items.SponsorAddress_Label = storeApplicationData.items.SponsorAddress_Label;
			objTmp.items.ClientReference = storeApplicationData.items.ClientReference;
			objTmp.items.ValidationStatus = (storeApplicationData.items.ValidationStatus == 1) ? '1' : '0';
			try {
				if (storeApplicationData.items.Part1.TitleOfStudy) {
					//TSK72076 18FEB2016 use the latest change
					if (storeApplicationData.items.UpdateDetails.TitleOfStudy != "") {
						objTmp.items.TitleOfStudy = storeApplicationData.items.UpdateDetails.TitleOfStudy;
					} else {
						objTmp.items.TitleOfStudy = storeApplicationData.items.Part1.TitleOfStudy;
					}
				} else {
					objTmp.items.TitleOfStudy = storeApplicationData.items.Part2.TitleOfStudy;
				}
			}catch(e){console.log(e.message);}
			
			try { //TSK69533 BL 01FEB2016
				var stage = storeApplicationData.items.ApplicationStage;
				switch (stage){
					case '1': 
						objTmp.items.ProtocolNumber = storeApplicationData.items.Part1.ProtocolNumber;
						break;
					case '2': 
						objTmp.items.ProtocolNumber = storeApplicationData.items.Part2.ProtocolNumber;
						break;
					case '3':
						if(storeApplicationData.items.UpdateDetails.ProtocolNumber != ''){
							objTmp.items.ProtocolNumber = storeApplicationData.items.UpdateDetails.ProtocolNumber;
						}else{
							objTmp.items.ProtocolNumber = storeApplicationData.items.Part1.ProtocolNumber;
						}
						break;
					case '4':
					case '5':
						objTmp.items.ProtocolNumber = storeApplicationData.items.UpdateDetails.ProtocolNumber;
				}
			}catch(e){console.log(e.message)} //END TSK69533

			try{
				var tmpLabelNames = [];
				if (storeApplicationData.items.Part1.Biologicals){
					var objPart1BiologicalProducts = storeApplicationData.items.Part1.Biologicals.items;
					if(objPart1BiologicalProducts.length == 0){
						tmpLabelNames[0] = '';
					}else{
						for (x=0; x < objPart1BiologicalProducts.length; x++) {
							tmpLabelNames[x] = objPart1BiologicalProducts[x].LabelName[0];
						}
					}
				}
				objTmp.items.LabelName = tmpLabelNames;
			}catch(e){console.log('Error in function jsonUploadBegin: ' + e)}

			fieldSupportFields.value = JSON2.stringify(objTmp);
			iframeDoc.forms[0].submit();
		} else {
			setDataStatusText(constant.DataStatus_SavingError);
			dialogText("Problem Saving the Application", "Cannot save changes to the server at this time, please try again shortly... Please contact TGA Helpdesk if the problem persists.");
		}
	} catch(e) {
		console.log("ct.js - jsonUploadBegin() error: " + e);
	}	
}

function loadMandatory(){
	var nodename = "";
	try{
		var flag = false;
		var el = null;
		var a = null;

		for (var i = 0; i < djstore_Mandatory._arrayOfAllItems.length; i++) {
			nodename = djstore_Mandatory._arrayOfAllItems[i].id.toString();
			try{
				el = document.getElementById(nodename);
				if (el == null) {
					flag = false;
				} else {
					a = findUpTag(el,"TR");
					if (a == null) {
						flag = false;
					} else {
						flag = a.hasChildNodes();
					}
				}
			} catch(e){console.log(nodename + " : " + e);}
//			if the table row for the element has child nodes
			if(flag){
				try{
					var children = a.childNodes;
					for (var k = 0; k < children.length; k++) {
						if(children[k].className == "n1"){
							if(djstore_Mandatory._arrayOfAllItems[i].name.toString() === "Y"){
								children[k].setAttribute("class",  "m1");
							}else if(djstore_Mandatory._arrayOfAllItems[i].name.toString() === "C"){
								children[k].setAttribute("class",  "c1");
							}
						}
					}
				}catch(e){console.log(nodename + " : " + e);}
			}
			flag = false;
		}
	} catch(e) {
		console.log("ct.js - loadMandatory(" + nodename + ") error: " + e);
	}
}

function loadPrecedingTrials(){
	try {
		if (djstore_PrecedingTrials._arrayOfAllItems.length < 1){
			showHide('part1_trials_row', 0, 1,1);
			dojo.byId("no_pt").innerHTML = "No Preceding Trials are available";
			showHide('part1_no_trials_row',  isValueChecked('Part1_TrialClassification', '5', 0), 1,1);

			showHide('updatedetails_trials_row', 0, 1,1);
			dojo.byId("ud_no_pt").innerHTML = "No Preceding Trials are available";
			showHide('updatedetails_no_trials_row',  isValueChecked('Part1_TrialClassification', '5', 0), 1,1);

		}else{
			showHide('part1_no_trials_row', 0, 1,1);
			var showPrecedingTrials = isValueChecked('Part1_TrialClassification', '5', 0);
			showHide('part1_trials_row', showPrecedingTrials, 1,1);
			var pt = dijit.byId('Part1_PrecedingTrials');
			if(!showPrecedingTrials){
				pt.reset();
			}

			showHide('updatedetails_no_trials_row', 0, 1,1);
			var showPrecedingTrials = isValueChecked('Part1_TrialClassification', '5', 0);
			showHide('updatedetails_trials_row', showPrecedingTrials, 1,1);
			var pt = dijit.byId('UpdateDetails_PrecedingTrials');
			if(!showPrecedingTrials){
				pt.reset();
			}
		}
	} catch(e) {
		console.log("ct.js - loadPrecedingTrials() error: " + e);
	}	
}

function makeCountryLabel(item) {
	try {
		var retVal = '';
		if (item != null) { 
			dojo.forEach(item.CountryList_Label, function(JoinText){ 
				retVal  += JoinText + ', ' ; 
			}); 
		}
		return(retVal);
	} catch(e) {
		console.log("ct.js - makeCountryLabel() error: " + e);
	}
}

function mandatoryStyling(thisObj){
	try {
		var self = thisObj;  //function sets mandatory fields for the Comparator dialog based on values chosen in the Part 1 Trial Classification field
		setStandardManadatory();
		self.part1Classifications = getCheckArray("Part1_TrialClassification");
		self.isDeviceOnly = getDeviceOnly(thisObj.part1Classifications);
		self.isFullMandatory = hasMedBio(thisObj.part1Classifications)
		var count;

		if(part1Classifications){
			if (isFullMandatory){
				//INC61834 Comparator data and functionality removed BL 30 JAN 2015
				//setStandardManadatory();
			}else{
				//INC61834 Comparator data and functionality removed BL 30 JAN 2015
				//setMinimumMandatory();
			}
		}
	} catch(e) {
		console.log("ct.js - mandatoryStyling() error: " + e);
	}
}

function migratedBiologicalDataShowWhen(rowIdx, flag){
	try {
		// Fixed the error caused by undefined/null row1
		var djRow = dojo.byId('biological_details_row1');
		if (djRow == null) return;
		if(!flag){
			djRow.style.display = 'none';
			return;
		}
		var fldProductNameText = storeApplicationData.items.Part1.Biologicals.items[rowIdx].ProductNameText;
		if ((fldProductNameText != null) & (fldProductNameText != undefined)) {
			if (fldProductNameText != ''){
				djRow.style.display = '';
			}
		}else{
			djRow.style.display = 'none';
		}
		return;
	} catch(e) {
		console.log("ct.js - migratedBiologicalDataShowWhen() error: " + e);
	}	
}

function migratedMedicineDataShowWhen(rowIdx, flag){
	try {
		// Fixed the error caused by undefined/null row1
		var djRow1 = dojo.byId('medicine_details_row1');
		var djRow2 = dojo.byId('medicine_details_row2');
		if (djRow1 == null) return 0;
		if (djRow2 == null) return 0;
		if(!flag) {
			djRow1.style.display = 'none';
			djRow2.style.display = 'none';
			return;
		}	
		djRow1.style.display = 'none';
		djRow2.style.display = 'none';

		var fldActiveNameText = storeApplicationData.items.Part1.Medicines.items[rowIdx].ActiveNameText ;
		var fldProductStrength = storeApplicationData.items.Part1.Medicines.items[rowIdx].ProductStrengthDataToProcess ;
		if ((fldActiveNameText  != null) & (fldActiveNameText != undefined)) 
			if (fldActiveNameText  != '') djRow1.style.display = '';
			else djRow1.style.display = 'none';

		if ((fldProductStrength != null) & (fldProductStrength != undefined)) 
			if (fldProductStrength != '')  djRow2.style.display = '';
			else djRow2.style.display = 'none';
		return;
	} catch(e) {
		console.log("ct.js - migratedMedicineDataShowWhen() error: " + e);
	}	
}

function migratedSponsorDataShowWhen(flag){
	try {
		// Fixed for null problem
		if (dojo.byId('sponsor_details_row0') == null)  return;
		if(!flag){
			dojo.byId('sponsor_details_row0').style.display = 'none';		
			dojo.byId('sponsor_details_row1').style.display = 'none';
			dojo.byId('sponsor_details_row2').style.display = 'none';
			dojo.byId('sponsor_details_row3').style.display = 'none';
		}else{
			dojo.byId('sponsor_details_row0').style.display = '';
			dojo.byId('sponsor_details_row1').style.display = '';
			dojo.byId('sponsor_details_row2').style.display = '';
			dojo.byId('sponsor_details_row3').style.display = '';
		}
	} catch(e) {
		console.log("ct.js - migratedSponsorDataShowWhen() error: " + e);
	}	
}

function Part1Display(){
	try{
		dojo.byId('heading_biodevmed_row1').style.display = 'none'; //hide
		var tmpPart1TrialClass = getCheckArray("Part1_TrialClassification");
		var foundValidClass = false;
		if (tmpPart1TrialClass){
			if(tmpPart1TrialClass.length > 0) {
				for(i=0;i<tmpPart1TrialClass.length;i++){
					if(tmpPart1TrialClass[i] == "0" || tmpPart1TrialClass[i] == "1" || tmpPart1TrialClass[i] == "2" || tmpPart1TrialClass[i] == "2A"){
						foundValidClass=true;
					}
				}
				if(foundValidClass){
					dojo.byId('heading_biodevmed_row1').style.display = ''; //show
				}else{
					dojo.byId('heading_biodevmed_row1').style.display = 'none'; //hide
				}
			}
		}

		showHide('part1_sites_row', storeApplicationData.items.ClinicalTrialType == 'CTN', 1, 1);
		dijit.byId('Part1_Sites').render();

		var showBiologicals = isValueChecked('Part1_TrialClassification', '0', 0);
		showHide('part1_biologicals_row', showBiologicals, 1,1);
		if (!showBiologicals){
			removeGridData(dijit.byId('Part1_BiologicalIngredients'), storeApplicationData.items.Part1.BiologicalIngredients);
			removeGridData(dijit.byId('Part1_Biologicals'), storeApplicationData.items.Part1.Biologicals);
			dijit.byId('Part1_BiologicalProductDescription').setValue('');
		};
		dijit.byId('Part1_Biologicals').render();

		var showMedicines = isValueChecked('Part1_TrialClassification', '1', 0)
		showHide('part1_medicine_row', showMedicines, 1, 1);
		if (!showMedicines){
			removeGridData(dijit.byId('Part1_MedicineIngredients'), storeApplicationData.items.Part1.MedicineIngredients);
			removeGridData(dijit.byId('Part1_Medicines'), storeApplicationData.items.Part1.Medicines);
		};
		dijit.byId('Part1_Medicines').render();

		var showThptcDevices = isValueChecked('Part1_TrialClassification', '2', 0);
		var showMedDevices = isValueChecked('Part1_TrialClassification', '2A', 0);
		var showDevices = false;
		if(showThptcDevices || showMedDevices){
			showDevices = true;
		}
		showHide('part1_devices_row', showDevices, 1,1);
		if (!showDevices){ 
			removeGridData(dijit.byId('Part1_Devices'),  storeApplicationData.items.Part1.Devices ); 
		};
		dijit.byId('Part1_Devices').render();

		var showAnimalExcipients = isValueChecked('Part1_TrialClassification', '3', 0);
		showHide('part1_excipients_row', showAnimalExcipients, 1,1);
		if (!showAnimalExcipients){
			removeGridData(dijit.byId('Part1_AnimalExcipients'), storeApplicationData.items.Part1.AnimalExcipients);
		};
		dijit.byId('Part1_AnimalExcipients').render();

		var showTrialConductedInCountries = isValueChecked('Part1_TrialClassification', '4', 0);
		showHide('part1_countries_row', showTrialConductedInCountries, 1,1);
		if (!showTrialConductedInCountries){
			removeGridData(dijit.byId('Part1_TrialConductedInCountries'), storeApplicationData.items.Part1.TrialConductedInCountries);
		};
		dijit.byId('Part1_TrialConductedInCountries').render();

		djstore_PrecedingTrials.fetch({onComplete:loadPrecedingTrials()});

		var showGMO = isValueChecked('Part1_TrialClassification', '8', 0);
		showHide('part1_gmo_row', showGMO, 1,1);
		if(!showGMO){dijit.byId('Part1_GMO').setValue('');};

		var showNanoparticles = isValueChecked('Part1_TrialClassification', '9', 0);
		showHide('part1_nanoparticles_row', showNanoparticles, 1,1);
		if(!showNanoparticles){dijit.byId('Part1_Nanoparticles').setValue('');};

		var showGeneTherapy = isValueChecked('Part1_TrialClassification', '11', 0);
		showHide('part1_genetherapy_row', showGeneTherapy, 1,1);
		if(!showGeneTherapy){dijit.byId('Part1_GeneTherapyDetails').setValue('');};

		var ctt = storeApplicationData.items.ClinicalTrialType;
		if (ctt && ctt == 'CTN') {
			var showPlacebos = isValueChecked('Part1_TrialClassification', '6', 0);
			showHide('part1_placebo_row', showPlacebos, 1,1);
			if (!showPlacebos){
				removeGridData(dijit.byId('Part1_Placebos'), storeApplicationData.items.Part1.Placebos);
			};
			dijit.byId('Part1_Placebos').render();
		}
	} catch(e) {
		console.log("ct.js - Part1Display() error: " + e);
	}
}

function Part1_AnimalExcipients_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_AnimalExcipient');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemAnimalExcipient(storeApplicationData.items.Part1.AnimalExcipients.Key);
			d.gridID = 'Part1_AnimalExcipients';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.set('editMode', true);
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - Part1_AnimalExcipients_onDblClick() error: " + e);
	}	
}

function Part1_BiologicalIngredients_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_BiologicalIngredient');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			var bioId =  getThisId("dialog_Biological");
			d.storeKey = new itemBiologicalIngredient(storeApplicationData.items.Part1.BiologicalIngredients.Key, bioId);
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.gridID = 'Part1_BiologicalIngredients';
			d.set('editMode', true);
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - Part1_BiologicalIngredients_onDblClick() error: " + e);
	}
}

function Part1_Biologicals_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Biological');
		d.reset();
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemBiological(storeApplicationData.items.Part1.Biologicals.Key);
			d.gridID = 'Part1_Biologicals';
			gSourceTab = 'Part1';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.set('editMode', true);
			migratedBiologicalDataShowWhen(thisObj.focus.rowIndex, true);
			d.show();
		}
	} catch(e) {
		console.log("ct.js - Part1_Biologicals_onDblClick() error: " + e);
	}	
}

function Part1_Button_AddAnimalExcipient_onClick() {
	try {
		var d = dijit.byId('dialog_AnimalExcipient');
		d.gridID = 'Part1_AnimalExcipients';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemAnimalExcipient(storeApplicationData.items.Part1.AnimalExcipients.Key);
		d.show();
	} catch(e) {
		console.log("ct.js - Part1_Button_AddAnimalExcipient_onClick() error: " + e);
	}	
}

function Part1_Button_AddPlacebo_onClick() {
	try {
		var d = dijit.byId('dialog_Placebo');
		d.gridID = 'Part1_Placebos';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemPlacebo(storeApplicationData.items.Part1.Placebos.Key);
		d.show();
	} catch(e) {
		console.log("ct.js - Part1_Button_AddPlacebo_onClick() error: " + e);
	}
}

function Part1_Button_AddBiological_onClick() {
	try {
		var d = dijit.byId('dialog_Biological');
		d.reset();
		d.gridID = 'Part1_Biologicals';
		gSourceTab = 'Part1';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemBiological(storeApplicationData.items.Part1.Biologicals.Key);
		migratedBiologicalDataShowWhen(null, false);
		d.show();	
	} catch(e) {
		console.log("ct.js - Part1_Button_AddBiological_onClick() error: " + e);
	}	
}

function Part1_Button_AddDevices_onClick() {
	try {
		var d = dijit.byId('dialog_Device');
		d.gridID = 'Part1_Devices';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemDevice(storeApplicationData.items.Part1.Devices.Key);
		d.show();
	} catch(e) {
		console.log("ct.js - Part1_Button_AddDevices_onClick() error: " + e);
	}	
}

function Part1_Button_AddMedicine_onClick() {
	try {
		var d = dijit.byId('dialog_Medicine');
		d.gridID = 'Part1_Medicines';
		gSourceTab = 'Part1';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemMedicine(storeApplicationData.items.Part1.Medicines.Key);
		migratedMedicineDataShowWhen(null, false);
		d.show();
	} catch(e) {
		console.log("ct.js - Part1_Button_AddMedicine_onClick() error: " + e);
	}	
}

function Part1_Button_AddSite_onClick() {
	try {
		var d = dijit.byId('dialog_Site');
		d.gridID = 'Part1_Sites';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemSite(storeApplicationData.items.Part1.Sites.Key);
		d.show();
	} catch(e) {
		console.log("ct.js - Part1_Button_AddSite_onClick() error: " + e);
	}	
}

function Part1_Button_RemoveAnimalExcipient_onClick() {
	try {
		var g = dijit.byId('Part1_AnimalExcipients');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - Part1_Button_RemoveAnimalExcipient_onClick() error: " + e);
	}	
}

function Part1_Button_RemoveBiological_onClick() {
	try {
		var g = dijit.byId('Part1_Biologicals');
		var gs = dijit.byId('Part1_BiologicalIngredients');
		var bioId='';
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { 
				if (selectedItem !== null) { 
					bioId = selectedItem.id[0];
					g.store.deleteItem(selectedItem); 
					// remove children in BiologicalIngredients
					gs.store.fetch({query:{biologicalId:bioId}, onComplete: function (items) { for(i=0;i < items.length; i++) { var item = items[i]; gs.store.deleteItem(item); } }});
				} 
			});
			gs.store.save();
			gs.setStore(gs.store);
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}
	} catch(e) {
		console.log("ct.js - Part1_Button_RemoveBiological_onClick() error: " + e);
	}	
}

function Part1_Button_RemoveCountry_onClick() {
	try {
		var g = dijit.byId('Part1_TrialConductedInCountries');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } } );
			if(g.store.isDirty()){
				g.store.save();
			}
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - Part1_Button_RemoveCountry_onClick() error: " + e);
	}	
}

function Part1_Button_RemoveDevices_onClick() {
	try {
		var g = dijit.byId('Part1_Devices');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - Part1_Button_RemoveDevices_onClick() error: " + e);
	}	
}

function Part1_Button_RemoveMedicine_onClick() {
	try {
		var g = dijit.byId('Part1_Medicines');
		var gs = dijit.byId('Part1_MedicineIngredients');
		var medId='';
		var gIngr = dijit.byId('Part1_MedicineIngredients');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, 
					function(selectedItem) { 
				if (selectedItem !== null) {
					medId = selectedItem.id[0];
					g.store.deleteItem(selectedItem); 
					// remove children in MedicineIngredients
					gs.store.fetch({query:{medicineId:medId}, onComplete: function (items) { for(i=0;i < items.length; i++) { var item = items[i]; gs.store.deleteItem(item); } }});
				} 
			});
			gs.store.save();
			gs.setStore(gs.store);
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}
	} catch(e) {
		console.log("ct.js - Part1_Button_RemoveMedicine_onClick() error: " + e);
	}	
}

function Part1_Button_RemovePlacebo_onClick() {
	try {
		var g = dijit.byId('Part1_Placebos');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { 
				if (selectedItem !== null) { 
					g.store.deleteItem(selectedItem); 
				} 
			});
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}
	} catch(e) {
		console.log("ct.js - Part1_Button_RemovePlacebo_onClick() error: " + e);
	}
}

function Part1_Button_RemoveSite_onClick() {
	try {
		var g = dijit.byId('Part1_Sites');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}
	} catch(e) {
		console.log("ct.js - Part1_Button_RemoveSite_onClick() error: " + e);
	}	
}

function Part1_Devices_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Device');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemDevice(storeApplicationData.items.Part1.Devices.Key);
			d.gridID = 'Part1_Devices';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.set('editMode', true);
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - Part1_Devices_onDblClick() error: " + e);
	}	
}

function Part1_MedicineIngredients_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_MedicineIngredient');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			var medId =  getThisId("dialog_Medicine");
			d.storeKey = new itemMedicineIngredient(storeApplicationData.items.Part1.MedicineIngredients.Key, medId);
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.gridID = 'Part1_MedicineIngredients';
			d.set('editMode', true);
			d.show();
		} 	
	} catch(e) {
		console.log("ct.js - Part1_MedicineIngredients_onDblClick() error: " + e);
	}
}

function Part1_Medicines_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Medicine');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemMedicine(storeApplicationData.items.Part1.Medicines.Key);
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.gridID = 'Part1_Medicines';
			gSourceTab = 'Part1';
			d.set('editMode', true);
			migratedMedicineDataShowWhen(thisObj.focus.rowIndex, true);
			d.show();
		}
	} catch(e) {
		console.log("ct.js - Part1_Medicines_onDblClick() error: " + e);
	}	
}

function Part1_Placebos_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Placebo');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemPlacebo(storeApplicationData.items.Part1.Placebos.Key);
			d.gridID = 'Part1_Placebos';
			d.set('editMode', true);
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.show();
		}
	} catch(e) {
		console.log("ct.js - Part1_Placebos_onDblClick() error: " + e);
	}
}

function Part1_Sites_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Site');
		if (thisObj.focus.rowIndex >= 0) {
			d.thisItem = thisObj.getItem(thisObj.focus.rowIndex);
			d.storeKey = new itemSite(storeApplicationData.items.Part1.Sites.Key);
			d.gridID = 'Part1_Sites';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) > 1;
			d.editMode = true;
			d.show();
		}
	} catch(e) {
		console.log("ct.js - Part1_Sites_onDblClick() error: " + e);
	}	
}

function Part2Display() {
	try {
		var showPlacebosP2 = isValueChecked('Part2_TrialClassification', '1', 0);
		showHide('part2_placebo_row', showPlacebosP2, 1,1);
		if (!showPlacebosP2){removeGridData(dijit.byId('Part2_Placebos'));};
		dijit.byId('Part2_Placebos').render();

		dijit.byId('Part2_Sites').render();
	} catch(e) {
		console.log("ct.js - Part2Display() error: " + e);
	}
}

function Part2_Button_AddComparator_onClick() {
	try {
		try { 
			mandatoryStyling(); 
		} catch(e){
			console.log("ct.js - Part2_Button_AddComparator_onClick(mandatoryStyling) error: " + e);
		}
		var d = dijit.byId('dialog_Comparator');
		d.gridID = 'Part2_Comparators';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemComparator(storeApplicationData.items.Part2.Comparators.Key);
		d.show();		
	} catch(e) {
		console.log("ct.js - Part2_Button_AddComparator_onClick() error: " + e);
	}
}

function Part2_Button_AddPlacebo_onClick() {
	try {
		var d = dijit.byId('dialog_Placebo');
		d.gridID = 'Part2_Placebos';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemPlacebo(storeApplicationData.items.Part2.Placebos.Key);
		d.show();
	} catch(e) {
		console.log("ct.js - Part2_Button_AddPlacebo_onClick() error: " + e);
	}
}

function Part2_Button_AddSite_onClick() {
	try {
		var d = dijit.byId('dialog_Site');
		d.gridID = 'Part2_Sites';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemSite(storeApplicationData.items.Part2.Sites.Key);
		d.show();
	} catch(e) {
		console.log("ct.js - Part2_Button_AddSite_onClick() error: " + e);
	}
}

function Part2_Button_RemoveComparator_onClick() {
	try {
		var g = dijit.byId('Part2_Comparators');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { 
				if (selectedItem !== null) { 
					g.store.deleteItem(selectedItem); 
				} 
			});
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}
	} catch(e) {
		console.log("ct.js - Part2_Button_RemoveComparator_onClick() error: " + e);
	}
}

function Part2_Button_RemovePlacebo_onClick() {
	try {
		var g = dijit.byId('Part2_Placebos');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) {
				if (selectedItem !== null) { 
					g.store.deleteItem(selectedItem); 
				} 
			});
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}
	} catch(e) {
		console.log("ct.js - Part2_Button_RemovePlacebo_onClick() error: " + e);
	}
}

function Part2_Button_RemoveSite_onClick() {
	try {
		var g = dijit.byId('Part2_Sites');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { 
				if (selectedItem !== null) { 
					g.store.deleteItem(selectedItem); 
				} 
			});
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}		
	} catch(e) {
		console.log("ct.js - Part2_Button_RemoveSite_onClick() error: " + e);
	}
}

function Part2_Comparators_onDblClick(thisObj) {
	try {
		try { 
			mandatoryStyling(); 
		} catch(e){
			console.log("ct.js - Part2_Comparators_onDblClick(mandatoryStyling) error: " + e);
		}
		var d = dijit.byId('dialog_Comparator');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemComparator(storeApplicationData.items.Part2.Comparators.Key);
			d.gridID = 'Part2_Comparators';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) != 2;
			d.set('editMode', true);
			d.show();
		}
	} catch(e) {
		console.log("ct.js - Part2_Comparators_onDblClick() error: " + e);
	}
}

function Part2_Placebos_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Placebo');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemPlacebo(storeApplicationData.items.Part2.Placebos.Key);
			d.gridID = 'Part2_Placebos';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) != 2;
			d.set('editMode', true);
			d.show();
		}
	} catch(e) {
		console.log("ct.js - Part2_Placebos_onDblClick() error: " + e);
	}
}

function Part2_Sites_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Site');
		if (thisObj.focus.rowIndex >= 0) {
			d.thisItem = thisObj.getItem(thisObj.focus.rowIndex);
			d.storeKey = new itemSite(storeApplicationData.items.Part2.Sites.Key);
			d.gridID = 'Part2_Sites';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) != 2;
			d.editMode = true;
			d.show();
		}		
	} catch(e) {
		console.log("ct.js - Part2_Sites_onDblClick() error: " + e);
	}
}

function postNewRedirect(status, reason, querystring) {
	try {
		window.location.href = constant.DBURL + 'ct?readform&ID=' + storeApplicationData.items.ApplicationId + '&V=' + storeApplicationData.items.ApplicationVersion + '&R=' + Math.random();
	} catch(e) {
		console.log("ct.js - postNewRedirect() error: " + e);
	}	
}

function printPreview(obj) {
	try {
		//TSK72422 print preview fixes BL 06APR2016
		isPortalPrintPreview = /&PP=1/.test(window.location.search);
		if (isPortalPrintPreview) {
			fixVersionIdInNodes();
			fixVariationIngredientIds();
		}
		
		appSave();
		setDataStatusText(constant.DataStatus_PrintPreview);
		var xslurl = constant.HOST + '/domjs/dojo-1.5.0/ebs/resources/ct_preview.xsl?R='+Math.random();
		var output = '';
		if (constant.browser.chrome) {
			var xslt1 = loadXMLDoc(xslurl );
			if (typeof(xslt1) != "object"){
				xslt = (new DOMParser()).parseFromString(xslt1, "text/xml");
			}else{
				xslt=xslt1;
			}
		} else {
			xslt.load(xslurl);
		}
		
		var appstatus = getQueryVariable('status');
		var subdate = getQueryVariable('subdate');
		var paydate = getQueryVariable('paydate');

		xmlText = '<xml><items><ApplicationId>Error Loading Data</ApplicationId></items></xml>';
		
		try {
			results1 = dojo.xhrGet( {
				url: 'LookupData?OpenAgent&S='+storeApplicationData.items.ApplicationVersion + '&V='+storeApplicationData.items.ApplicationId + '&login&F=FILES&R='+Math.random(), 
				handleAs: "json",
				sync: true,
				preventCache: true,
				load: function(response, ioArgs) {
				if (response.length < 1) {
					response = { count:"0", identifier:"AttachmentId", label:"AttachmentFileName", items: [ { AttachmentId:"-1",  AttachmentFileName:"Loading the list of File Attachments for this Application from the server failed, please contact TGA Technical Support regarding this issue." } ] };
				}
				return response;
			},
			error: function(response, ioArgs) {
				console.error("HTTP status code: ", ioArgs.xhr.status);
				response = { count:"0", identifier:"AttachmentId", label:"AttachmentFileName", items: [ { AttachmentId:"-1",  AttachmentFileName:"" } ] };
				response.items.AttachmentFileName = 'HTTP status code: ' + ioArgs.xhr.status;
				return response;
			}
			});
			//TSK72422 03FEB2016 Bruce L
			var result2 = dojo.xhrGet({
				url: 'api/data/collections/name/DataApiJSONApplicationById?keys=' + storeApplicationData.items.RecordUNID,
				handleAs: 'json',
				sync: true,
				preventCache: true,
				load: function(response, ioArgs){
					if(response.length < 1){
						
					}
					return response;
				}
			});
			//END TSK72422 03FEB2016 Bruce L
			
			storeApplicationData.items.Attachments = results1.results[0];
			var pp_sad = storeApplicationData;
			
			if(result2.results[0][0]){//TSK72422 03FEB2016 Bruce L
				pp_sad.items.ApplicationStatus = result2.results[0][0].ApplicationStatus;
			}
			if(appstatus != undefined){
				pp_sad.items.ApplicationStatus = appstatus;
			}
			//TSK72422 Bruce L
			//the function json2xml treats fields that end in 'date' differently but doesn't do it well
			//so have named the json field xxxxDt, and the function json2xml just treats it like a string
			if(subdate != undefined){
				pp_sad.items.SubmissionDt = subdate;
			}
			
			if(paydate != undefined){
				pp_sad.items.PaymentReceiptDt = paydate;
			}
			
			try{
				//TSK72422 print preview fixes BL 05APR2016
				pp_sad.items.SponsorAddress_Label = xmlEscape(pp_sad.items.SponsorAddress_Label);
			} catch(e) {'escape sponsor address label error: ' + console.log(e)}
			
			//INC68425 escape xml special characters for the print preview - but only in the GMDNS_Label
			if(storeApplicationData.items.Part1.Devices.items){
				if(storeApplicationData.items.Part1.Devices.items.length > 0){
					var d_items = pp_sad.items.Part1.Devices.items;
					for(k=0; k < d_items.length; k++){
						try{ //do the best we can but if there is a problem move on BL 05APR2016 //TSK72422 print preview fixes
							pp_sad.items.Part1.Devices.items[k].GMDNS_Label[0] = xmlEscape(pp_sad.items.Part1.Devices.items[k].GMDNS_Label[0]);
						} catch(e) {'escape GMDNS label error: ' + console.log(e)}

					}
				}
			}
			
			var xml1 = json2xml(pp_sad, false, '_');
			xmlText = '<xml>' + xml1 + '</xml>';
			
		}catch(e) {
			console.log('ct.js - printPreview() storeApplicationData cannot be converted to XML: ' + e.message);
		}

		xml = (new DOMParser()).parseFromString(xmlText, "text/xml");
		try {
			if (window.ActiveXObject) {
				output = xml.transformNode(xslt);
			} else if (document.implementation && document.implementation.createDocument) {
				var processor = new XSLTProcessor();
				processor.importStylesheet(xslt);
				if (constant.browser.chrome) {
					var XmlDom = processor.transformToFragment(xml,document);
				}else{
					var XmlDom = processor.transformToDocument(xml);
				}
				var serializer = new XMLSerializer();
				var output = serializer.serializeToString(XmlDom);
			}
			if (output == '') { output = 'Cannot transform XML via XSLT to XML'; }

			setDataStatusText(constant.DataStatus_Loaded);
			if(!obj){
				window.location = "/";
			}
			
			ppwin = window.open('', '_blank', 'directories=0,fullscreen=0,location=0,menubar=0,resizable=1,scrollbars=1,status=1,titlebar=1,toolbar=0', true);
			ppwin.document.open();
			ppwin.document.write(output);
			ppwin.document.close();    //>BW02
			ppwin.focus();
		}catch(e) {
			console.log('ct.js - printPreview() problem: ' + e.message); setDataStatusText(constant.DataStatus_Loaded);
		}
	} catch(e) {
		console.log("ct.js - printPreview() error: " + e);
	}
}

function getItemId(parentId, itemName) {
	try {
		// Lookup and return the xPages ID for the specified item name
		if (itemName == null || itemName == "")
			return "";
		
		var storageAvailable = true;
		
		if(typeof(Storage)!== "undefined") {
			var cachedValue = sessionStorage.getItem(itemName);
			if (cachedValue != null && cachedValue != "") {
				// ID was found in cache. Make sure the id is a child of the parent element
				if (parentId != null && parentId != "") {
					if (cachedValue.indexOf(parentId) !== -1) {
						// Make sure the id is valid
						var dojoItem = dojo.byId(cachedValue);
						if (dojoItem != null && typeof(dojoItem) != "undefined") {
							//XSP.alert("ID found in cache: \r\n" + itemName + ": " + cachedValue);
							return cachedValue;
						}
					}
				}
			}		
		} else {
			storageAvailable = false;
		}
		
		var returnValue = "";
		var elems;
	
		var parentObject = null;
		if (parentId != null && parentId != "")
			var parentObject = dojo.byId(parentId);	
	
		if (itemName.substr(0,3).toLowerCase() == "div") {
			if (parentObject == null || typeof(parentObject) == "undefined")	
				elems = document.getElementsByTagName("div");
			else {
				elems = parentObject.getElementsByTagName("div");
				if (elems.length == 0)
					elems = document.getElementsByTagName("div");
			}
		} else {
			if (parentObject == null || typeof(parentObject) == "undefined")
				elems = document.getElementsByTagName("*");
			else {
				elems = parentObject.getElementsByTagName("*");
				if (elems.length == 0)
					elems = document.getElementsByTagName("*");
			}
		}
		
		for (var i=0, m=elems.length; i<m; i++) {
			// Ignore widgets and tab container tablist elements
			if ((elems[i].id.indexOf("widget_view") == -1) && (elems[i].id.indexOf("contentTabContainer_tablist") == -1)) {
			    if (elems[i].id && elems[i].id.indexOf(itemName, elems[i].id.length - itemName.length) !== -1) {
			    	//XSP.alert("Found: " + elems[i].id + "\r\n\r\n" + "ParentID: " + parentId);
			    	if (parentId != null && parentId != "") {
			    		// Make sure element is child of parent element
			    		if (elems[i].id.indexOf(parentId) !== -1) {
			    			returnValue = elems[i].id;
					        break;
			    		}
			    	} else {
			    		// Parent id wasn't passed. Return first matching element
		    			returnValue = elems[i].id;
				        break;		    		
			    	}
			    }
			}
		}
		
		if (storageAvailable) {
			// Cache the id for faster retrieval later
			sessionStorage.setItem(itemName, returnValue);
		} else {
			//XSP.alert("ID not found for " + itemName);
		}
		
		return returnValue;
	} catch(e) {
		XSP.error("xDialogCommon - getItemId error: " + e);
	}		
}

function getItemValueById(itemID) {
	try {
		// Get the value of the specified item
		if (itemID == null || itemID == "")
			return "";

		var dojoObject = dojo.byId(itemID);
		if (dojoObject == null || typeof (dojoObject) == "undefined")
			return "";

		var tagName = dojoObject.tagName.toLowerCase();

		if (tagName == "span")
			return dojoObject.innerHTML;
		else if (tagName == "fieldset") {
			var returnValue = "";
			var docItem = document.getElementsByName(itemID);
			if (docItem == null || typeof (docItem) == "undefined") {
				docItem = document.getElementById(itemID);
				if (docItem == null || typeof (docItem) == "undefined")
					return "";
			}

			if (typeof (docItem.length) == 'undefined') {
				if (docItem.checked)
					return docItem.value;
				else
					return "";
			}
			for ( var p = 0; p < docItem.length; p++) {
				if (docItem[p].checked) {
					if (returnValue != "")
						returnValue += ";";
					returnValue += docItem[p].value;
				}
			}
			return returnValue;
		} else {
			return dojoObject.value;
		}
	} catch (e) {
		XSP.error("xDialogCommon - getItemValueById error: " + e);
	}
}

function getItemValueByName(itemName) {
	try {
		// Get the value of the specified item
		if (itemName == null || itemName == "")
			return "";

		var docObject = document.getElementsByName(itemName);
		if (docObject == null || typeof (docObject) == "undefined") {
			docObject = document.getElementById(itemName);
			if (docObject == null || typeof (docObject) == "undefined")
				return;
		}

		var tagName = "";
		if (docObject.tagName)
			tagName = docObject.tagName.toLowerCase();

		if (tagName == "") {
			// Tagname wasn't found. Check if object is an array by checking the
			// length
			if (docObject.length)
				tagName = "fieldset";
		}

		if (tagName == "span")
			return docObject.innerHTML;
		else if (tagName == "fieldset") {
			var returnValue = "";
			if (typeof (docObject.length) == 'undefined') {
				if (docObject.checked)
					return docObject.value;
				else
					return "";
			}
			for ( var p = 0; p < docObject.length; p++) {
				if (docObject[p].checked) {
					if (returnValue != "")
						returnValue += ";";
					returnValue += docObject[p].value;
				}
			}
			return returnValue;
		} else
			return docObject.value;
	} catch (e) {
		XSP.error("xDialogCommon - getItemValueByName error: " + e);
	}
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            console.log(pair[1]);
        	return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}

function refreshAttachmentsCT(o) {
	try {
		dijit.byId('dialog_AttachmentPage').hide();
		djstore_Attachments = new dojo.data.ItemFileWriteStore({url:'LookupData?OpenAgent&F=FILES&v=' + storeApplicationData.items.ApplicationId + '&s=' + storeApplicationData.items.ApplicationVersion + '&R='+Math.random() });
		djstore_Attachments.fetch({onComplete:function(x,y,z){drawAttachmentsCT(x,y,z); } });
		var Barry = dijit.byId('Attachments_Grid');
		if (Barry) { Barry.store = djstore_Attachments; Barry.render(); }
	} catch(e) {
		console.log("ct.js - refreshAttachmentsCT() error: " + e);
	}	
}

function removeGridData(grd, jsonRef){
	try{
		if(grd.store == null){return};
		if(grd.store._arrayOfTopLevelItems){
			var items = jsonRef.items;
			var hasItems = false;
			if (items.length) {
				hasItems = true;
				jsonRef.items = [];
			}
			if (hasItems) {
				grd.store = new dojo.data.ItemFileWriteStore({ data: jsonRef, hierarchical: false }); 
				grd.sort();
				grd.store.save();
				grd.render();
			}
		}
	} catch(e) {
		console.log("ct.js - removeGridData() error: " + e);
	}

	/******* HIDE THIS OLD CODE******************************
		try{
		if(grd.store == null){return};
		if(grd.store._arrayOfTopLevelItems){
		grd.indirectSelector.toggleAllSelection(true);
		var items = grd.selection.getSelected();
		if (items.length) {
		dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { grd.store.deleteItem(selectedItem); } });
		grd.sort();
		grd.indirectSelector.toggleAllSelection(false);
		grd.store.save();
		grd.render();
		}
		}
		}catch(e){
		console.log('Error in function removeGridData: ' + e);
		}
	 ***********************************************/
}

function right(cString, n) {
	try {
		var cTmp = "";
		strLength = cString.length;
		for (var i=0; i < n; i++) {
			cTmp = cString.charAt((strLength-1)-i) + cTmp;
		}
		return cTmp;
	} catch(e) {
		console.log("ct.js - right() error: " + e);
	}
}

function sameObjects(objA,objB) {
	try {
		if (typeof objA != "object" || typeof objB != "object") { // one or both are not an object
			return false;
		}

		//collect all properties of both objects in props
		var props = {};
		var arrFeeList = [ ];
		arrFeeList = storeApplicationData.items.VariationNonFeeList;
		for (prop in objA) {
			var index = arrFeeList.indexOf(prop);
			var the_char = prop.charAt(0);
			if (!dojo.isFunction(objA[prop])){ // ignore functions
				if(index == -1){ // ignore non-fee list attributes
					if(!(the_char == "_")){ // ignore system arrays
						props[prop] = 1;
					}
				}
			}
		}
		for (prop in objB) {
			var index = arrFeeList.indexOf(prop);
			var the_char = prop.charAt(0);
			if (!dojo.isFunction(objB[prop])){ // ignore functions
				if(index == -1){ // ignore non-fee list attributes
					if(!(the_char == "_")){ // ignore system arrays
						props[prop] = 1;
					}
				}
			}
		}
		//now loop through all collected properties of props
		for (prop in props) {
			if (objA[prop] == undefined || objB[prop] == undefined) { 
				//property not existing in a or b
				return false;
			} else if (typeof objA[prop] == "object" && typeof objB[prop] == "object") { //property is an object itself
				if (!sameObjects(objA[prop],objB[prop])) { //dig one level deeper
					return false;
				}
			}    else if (objA[prop] !== objB[prop]) { //different (atom) values
				return false;
			}
		}
		return true;
	} catch(e) {
		console.log("ct.js - sameObjects() error: " + e);
		return false;
	}	
}

function setDataSectionForUpdateDetails() {
	try {
		//	Modify DataSection for Sites, Devices, Biologicals, Medicines etc.	
		if (storeApplicationData.items.UpdateDetails.Sites.items.length > 0){
			for (i = 0; i < storeApplicationData.items.UpdateDetails.Sites.items.length; i++) {
				storeApplicationData.items.UpdateDetails.Sites.items[i].DataSection[0] = "3";
			}
		}
		if(storeApplicationData.items.UpdateDetails.Biologicals.items.length > 0){
			for (i = 0; i < storeApplicationData.items.UpdateDetails.Biologicals.items.length; i++) {
				storeApplicationData.items.UpdateDetails.Biologicals.items[i].DataSection[0] = "3";
			}
		}
		if(storeApplicationData.items.UpdateDetails.Devices.items.length > 0){
			for (i = 0; i < storeApplicationData.items.UpdateDetails.Devices.items.length; i++) {
				storeApplicationData.items.UpdateDetails.Devices.items[i].DataSection[0] = "3";
			}
		}
		if(storeApplicationData.items.UpdateDetails.Medicines.items.length > 0){
			for (i = 0; i < storeApplicationData.items.UpdateDetails.Medicines.items.length; i++) {
				storeApplicationData.items.UpdateDetails.Medicines.items[i].DataSection[0] = "3";
			}
		}
	} catch(e) {
		console.log("ct.js - setDataSectionForUpdateDetails() error: " + e);
	}
}

function setInvalidPhoneData(){
	try{
		var stage = storeApplicationData.items.ApplicationStage;
		var node = null;
		switch(stage){
		case "1":
			node = dijit.byId("Part1_ContactPhone");
			if(!node.isValid()){
				storeApplicationData.items.Part1.ContactPhoneValid = "0";
			}else{
				storeApplicationData.items.Part1.ContactPhoneValid = "1";
			}
		case "3":
			node = dijit.byId("Completion_ContactPhone");
			if(!node.isValid()){
				storeApplicationData.items.Completion.ContactPhoneValid = "0";
			}else{
				storeApplicationData.items.Completion.ContactPhoneValid = "1";
			}
		case "4":
		case "5":
			node = dijit.byId("UpdateDetails_ContactPhone");
			if(!node.isValid()){
				storeApplicationData.items.UpdateDetails.ContactPhoneValid = "0";
			}else{
				storeApplicationData.items.UpdateDetails.ContactPhoneValid = "1";
			}
		}
	} catch(e) {
		console.log("ct.js - setInvalidPhoneData() error: " + e);
	}
}

function setMinimumMandatory(){
	try{
		/*
	dijit.byId('dialog_Comparator_ActiveName').required = false;
	dojo.byId('dlgrow_Comparator_ActiveName').setAttribute("class", "c1");
	dijit.byId('dialog_Comparator_TradeCodeName').required = true;
	dojo.byId('dlgrow_Comparator_TradeName').setAttribute("class", "m1");
	dijit.byId('dialog_Comparator_DosageForm').required = false;
	dojo.byId('dlgrow_Comparator_DosageForm').setAttribute("class", "c1");
	dijit.byId('dialog_Comparator_ProductStrength').required = false;
	dijit.byId('dialog_Comparator_ProductStrengthUnit').required = false;
	dojo.byId('dlgrow_Comparator_ProductStrength').setAttribute("class", "c1");
	dijit.byId('dialog_Comparator_RouteOfAdmin').required = false;
	dojo.byId('dlgrow_Comparator_RouteOfAdmin').setAttribute("class", "c1");
	dijit.byId('dialog_Comparator_DoseFrequency').required = false;
	dojo.byId('dlgrow_Comparator_DoseFrequency').setAttribute("class", "c1");
	dijit.byId('dialog_Comparator_Presentation').required = false;
	dojo.byId('dlgrow_Comparator_Presentation').setAttribute("class", "c1");
	dijit.byId('dialog_Comparator_DoseFrequency').required = false;
	dojo.byId('dlgrow_Comparator_DoseFrequency').setAttribute("class", "c1");
		 */
	} catch(e) {
		console.log("ct.js - setMinimumMandatory() error: " + e);
	}
}

function setStandardManadatory(){
	try{
		/*
	dijit.byId('dialog_Comparator_ActiveName').required = true;
	dojo.byId('dlgrow_Comparator_ActiveName').setAttribute("class", "m1");
	dijit.byId('dialog_Comparator_TradeCodeName').required = true;
	dojo.byId('dlgrow_Comparator_TradeName').setAttribute("class", "m1");
	dijit.byId('dialog_Comparator_DosageForm').required = true;
	dojo.byId('dlgrow_Comparator_DosageForm').setAttribute("class", "m1");
	dijit.byId('dialog_Comparator_ProductStrength').required = true;
	dijit.byId('dialog_Comparator_ProductStrengthUnit').required =true;
	dojo.byId('dlgrow_Comparator_ProductStrength').setAttribute("class", "m1");
	dijit.byId('dialog_Comparator_RouteOfAdmin').required = true;
	dojo.byId('dlgrow_Comparator_RouteOfAdmin').setAttribute("class", "m1");
	dijit.byId('dialog_Comparator_DoseFrequency').required = true;
	dojo.byId('dlgrow_Comparator_DoseFrequency').setAttribute("class", "m1");
	dijit.byId('dialog_Comparator_Presentation').required = true;
	dojo.byId('dlgrow_Comparator_Presentation').setAttribute("class", "m1");
		 */
	} catch(e) {
		console.log("ct.js - setStandardManadatory() error: " + e);
	}
}

function SponsorAddress_onChange(obj) {
	try {
		var tmpDJ = dijit.byId(obj.id);
		try{
			if (tmpDJ.getValue() != "") {
				migratedSponsorDataShowWhen(false);
			}
			storeApplicationData.items.SponsorAddress =  tmpDJ.getValue();
			storeApplicationData.items.SponsorAddress_Id =  tmpDJ.getDisplayedValue();
			storeApplicationData.items.SponsorAddress_Label =  tmpDJ.getDisplayedValue();
		} catch (e) {
			storeApplicationData.items.SponsorAddress =  "";
			storeApplicationData.items.SponsorAddress_Id =  "";
			storeApplicationData.items.SponsorAddress_Label =  "";
			console.log('SponsorAddress_onChange error: ' + e);
		}
	} catch(e) {
		console.log("ct.js - SponsorAddress_onChange() error: " + e);
	}	
}

function strRight(cString, subString) {
	try {
		cCharPos = cString.indexOf(subString);
		cLen = cString.length;
		if (cCharPos == -1) {
			return "";
		} else {
			return right(cString, cLen-cCharPos-(subString.length));
		}
	} catch(e) {
		console.log("ct.js - strRight() error: " + e);
	}
}

function testCallback(returnVal){
	try {
		console.log('testCallback:');
		if (returnVal.error){
			console.log("Error:" + returnVal.errorcode + ". " + returnVal.message + " [" + returnVal.ioArgs.url + "]");
			return;
		}
		console.log(returnVal.data);
	} catch(e) {
		console.log("ct.js - testCallback() error: " + e);
	}	
}

function TrialCountriesAdd(tabname) {
	try {
		var g = dijit.byId(tabname + '_TrialConductedInCountries');//g is the grid
		if(tabname == 'Part1'){
			var jsonLocation = storeApplicationData.items.Part1.TrialConductedInCountries;
		}else{
			var jsonLocation = storeApplicationData.items.UpdateDetails.TrialConductedInCountries;
		}

		var theID = dijit.byId(tabname + '_TrialConductedinCountryList').getValue();
		var theLabel = dijit.byId(tabname + '_TrialConductedinCountryList').getDisplayedValue();
		if(theID != ''){
			try{
				var getOut = false;
				dojo.forEach(jsonLocation.items, function(node, index, arr){
					if (node.TrialConductedInCountry[0] == theID) {
						getOut = true;
						return;
					}
				});
				if (getOut) return;
				theItem = new itemTrialConductedInCountry(jsonLocation.Key);
				theItem.TrialConductedInCountry=theID;
				theItem.TrialConductedInCountry_Label= theLabel;
				g.store.newItem(theItem);
				g.render();
				dijit.byId(tabname + '_TrialConductedinCountryList').setValue('');
			}catch(e){
				console.log("ct.js - TrialCountriesAdd() Error building country list: " + e.message);
			}
		}
	} catch(e) {
		console.log("ct.js - TrialCountriesAdd() error: " + e);
	}	
}

function UpdateDetails_AnimalExcipients_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_AnimalExcipient');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemAnimalExcipient(storeApplicationData.items.UpdateDetails.AnimalExcipients.Key);
			d.gridID = 'UpdateDetails_AnimalExcipients';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.set('editMode', true);
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_AnimalExcipients_onDblClick() error: " + e);
	}
}

function UpdateDetails_BiologicalIngredients_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_BiologicalIngredient');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			var bioId =  getThisId("dialog_Biological");
			d.storeKey = new itemBiologicalIngredient(storeApplicationData.items.UpdateDetails.BiologicalIngredients.Key, bioId);
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.gridID = 'UpdateDetails_BiologicalIngredients';
			d.set('editMode', true);
			d.show();
		} 	
	} catch(e) {
		console.log("ct.js - UpdateDetails_BiologicalIngredients_onDblClick() error: " + e);
	}
}

function UpdateDetails_Biologicals_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Biological');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemBiological(storeApplicationData.items.UpdateDetails.Biologicals.Key);
			d.gridID = 'UpdateDetails_Biologicals';
			gSourceTab='updatedetails';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.set('editMode', true);
			migratedBiologicalDataShowWhen(null, false);
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Biologicals_onDblClick() error: " + e);
	}
}

function UpdateDetails_Button_AddAnimalExcipient_onClick() {
	try {
		var d = dijit.byId('dialog_AnimalExcipient');
		d.gridID = 'UpdateDetails_AnimalExcipients';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemAnimalExcipient(storeApplicationData.items.UpdateDetails.AnimalExcipients.Key);
		d.show();	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_AddAnimalExcipient_onClick() error: " + e);
	}
}

function UpdateDetails_Button_AddBiological_onClick() {
	try {
		var d = dijit.byId('dialog_Biological');
		d.gridID = 'UpdateDetails_Biologicals';
		gSourceTab='updatedetails';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemBiological(storeApplicationData.items.UpdateDetails.Biologicals.Key);
		migratedBiologicalDataShowWhen(null, false);
		d.show();	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_AddBiological_onClick() error: " + e);
	}
}

function UpdateDetails_Button_AddDevices_onClick() {
	try {
		var d = dijit.byId('dialog_Device');
		d.gridID = 'UpdateDetails_Devices';
		gSourceTab='updatedetails';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemDevice(storeApplicationData.items.UpdateDetails.Devices.Key);
		d.show();	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_AddDevices_onClick() error: " + e);
	}
}

function UpdateDetails_Button_AddMedicine_onClick() {
	try {
		var d = dijit.byId('dialog_Medicine');
		d.gridID = 'UpdateDetails_Medicines';
		gSourceTab='updatedetails';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemMedicine(storeApplicationData.items.UpdateDetails.Medicines.Key);
		migratedMedicineDataShowWhen(null, false);
		d.show();
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_AddMedicine_onClick() error: " + e);
	}
}

function UpdateDetails_Button_AddPlacebo_onClick() {
	try {
		var d = dijit.byId('dialog_Placebo');
		d.gridID = 'UpdateDetails_Placebos';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemPlacebo(storeApplicationData.items.UpdateDetails.Placebos.Key);
		d.show();		
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_AddPlacebo_onClick() error: " + e);
	}
}

function UpdateDetails_Button_AddSite_onClick() {
	try {
		var d = dijit.byId('dialog_Site');
		d.gridID = 'UpdateDetails_Sites';
		d.editMode = false;
		d.thisItem = null;
		d.storeKey = new itemSite(storeApplicationData.items.UpdateDetails.Sites.Key);
		d.show();
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_AddSite_onClick() error: " + e);
	}	
}

function UpdateDetails_Button_RemoveAnimalExcipient_onClick() {
	try {
		var g = dijit.byId('UpdateDetails_AnimalExcipients');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_RemoveAnimalExcipient_onClick() error: " + e);
	}
}

function UpdateDetails_Button_RemoveBiological_onClick() {
	try {
		var g = dijit.byId('UpdateDetails_Biologicals');
		var gs = dijit.byId('UpdateDetails_BiologicalIngredients');
		var bioId='';
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { 
				if (selectedItem !== null) { 
					bioId = selectedItem.id[0];
					g.store.deleteItem(selectedItem);
					// remove children in BiologicalIngredients
					gs.store.fetch({query:{biologicalId:bioId}, onComplete: function (items) { for(i=0;i < items.length; i++) { var item = items[i]; gs.store.deleteItem(item); } }});
				} 
			});
			gs.store.save();
			gs.setStore(gs.store);
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_RemoveBiological_onClick() error: " + e);
	}
}

function UpdateDetails_Button_RemoveCountry_onClick() {
	try {
		var g = dijit.byId('UpdateDetails_TrialConductedInCountries');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } } );
			if(g.store.isDirty()){
				g.store.save();
			}
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_RemoveCountry_onClick() error: " + e);
	}
}

function UpdateDetails_Button_RemoveDevices_onClick() {
	try {
		var g = dijit.byId('UpdateDetails_Devices');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.render();
		}
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_RemoveDevices_onClick() error: " + e);
	}
}

function UpdateDetails_Button_RemoveMedicine_onClick() {
	try {
		var medId='';
		var g = dijit.byId('UpdateDetails_Medicines');
		var gs = dijit.byId('UpdateDetails_MedicineIngredients');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { 
				if (selectedItem !== null) { 
					medId = selectedItem.id[0];
					g.store.deleteItem(selectedItem);
					// remove children in MedicineIngredients
					gs.store.fetch({query:{medicineId:medId}, onComplete: function (items) { for(i=0;i < items.length; i++) { var item = items[i]; gs.store.deleteItem(item); } }});
				} 
			});
			gs.store.save();
			gs.setStore(gs.store);
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_RemoveMedicine_onClick() error: " + e);
	}
}

function UpdateDetails_Button_RemovePlacebo_onClick() {
	try {
		var g = dijit.byId('UpdateDetails_Placebos');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { 
				if (selectedItem !== null) { 
					g.store.deleteItem(selectedItem); 
				} 
			});
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}		
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_RemovePlacebo_onClick() error: " + e);
	}
}

function UpdateDetails_Button_RemoveSite_onClick() {
	try {
		var g = dijit.byId('UpdateDetails_Sites');
		var items = g.selection.getSelected();
		if (items.length) {
			dojo.forEach(items, function(selectedItem) { if (selectedItem !== null) { g.store.deleteItem(selectedItem); } });
			g.sort();
			g.indirectSelector.toggleAllSelection(false);
			g.store.save();
			g.render();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Button_RemoveSite_onClick() error: " + e);
	}	
}

function UpdateDetails_Devices_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Device');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemDevice(storeApplicationData.items.UpdateDetails.Devices.Key);
			d.gridID = 'UpdateDetails_Devices';
			gSourceTab='updatedetails';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.set('editMode', true);
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Devices_onDblClick() error: " + e);
	}
}

function UpdateDetails_MedicineIngredients_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_MedicineIngredient');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			var medId =  getThisId("dialog_Medicine");
			d.storeKey = new itemMedicineIngredient(storeApplicationData.items.UpdateDetails.MedicineIngredients.Key, medId);
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.gridID = 'UpdateDetails_MedicineIngredients';
			d.set('editMode', true);
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_MedicineIngredients_onDblClick() error: " + e);
	}
}

function UpdateDetails_Medicines_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Medicine');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemMedicine(storeApplicationData.items.UpdateDetails.Medicines.Key);
			d.gridID = 'UpdateDetails_Medicines';
			gSourceTab='updatedetails';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.set('editMode', true);
			migratedMedicineDataShowWhen(null, false);
			d.show();
		}
	} catch(e) {
		console.log("ct.js - UpdateDetails_Medicines_onDblClick() error: " + e);
	}
}

function UpdateDetails_Placebos_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Placebo');
		if (thisObj.focus.rowIndex >= 0) {
			d.set('thisItem', thisObj.getItem(thisObj.focus.rowIndex));
			d.storeKey = new itemPlacebo(storeApplicationData.items.UpdateDetails.Placebos.Key);
			d.gridID = 'UpdateDetails_Placebos';
			d.set('editMode', true);
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.show();
		}
	} catch(e) {
		console.log("ct.js - UpdateDetails_Placebos_onDblClick() error: " + e);
	}
}

function UpdateDetails_Sites_onDblClick(thisObj) {
	try {
		var d = dijit.byId('dialog_Site');
		if (thisObj.focus.rowIndex >= 0) {
			d.thisItem = thisObj.getItem(thisObj.focus.rowIndex);
			d.storeKey = new itemSite(storeApplicationData.items.UpdateDetails.Sites.Key);
			d.gridID = 'UpdateDetails_Sites';
			d.disableEditing = parseInt(storeApplicationData.items.ApplicationStage) < 4;
			d.editMode = true;
			d.show();
		}	
	} catch(e) {
		console.log("ct.js - UpdateDetails_Sites_onDblClick() error: " + e);
	}	
}

function UpdateDetailsDisplay(){
	try{
		dojo.byId('heading_biodevmed_row1UD').style.display = 'none'; //hide
		var tmpUDTrialClass = getCheckArray("UpdateDetails_TrialClassification");
		var foundValidClass = false;
		if (tmpUDTrialClass){
			if(tmpUDTrialClass.length > 0) {
				for(i=0;i<tmpUDTrialClass.length;i++){
					if(tmpUDTrialClass[i] == "0" || tmpUDTrialClass[i] == "1" || tmpUDTrialClass[i] == "2" || tmpUDTrialClass[i] == "2A"){
						foundValidClass=true;
					}
				}
				if(foundValidClass){
					dojo.byId('heading_biodevmed_row1UD').style.display = ''; //show
				}else{
					dojo.byId('heading_biodevmed_row1UD').style.display = 'none'; //hide
				}
			}
		}

		if (getCheckData('UpdateDetails_TrialClassification', 0, ';').length > 0) { showHide('updatedetails_header',1,1,1); }
		showHide('updatedetails_part1_sites_row',1,1,1);

		if(storeApplicationData.items.ApplicationStage == "4" || storeApplicationData.items.ApplicationStage == "5"){
			//make Part 1 read only
			showHide('part1_trials_row', 0, 1,1);
			dojo.byId("no_pt").innerHTML = storeApplicationData.items.Part1.PrecedingTrials.toString();
			showHide('part1_no_trials_row',  1, 1,1);
			//make UpdateDetails editable if should be shown
			var showPrecedingTrials = isValueChecked('UpdateDetails_TrialClassification', '5', 0);
			if(showPrecedingTrials){
				showHide('updatedetails_trials_row', 1, 1,1);
				dojo.byId("ud_no_pt").innerHTML = storeApplicationData.items.UpdateDetails.PrecedingTrials.toString();
				showHide('updatedetails_no_trials_row',  0, 1,1);
			} else {
				if(djstore_PrecedingTrials._arrayOfAllItems.length == 0){
					showHide('updatedetails_no_trials_row',  0, 1,1);
				}else{
					showHide('updatedetails_trials_row', 0, 1,1);
					dijit.byId('UpdateDetails_PrecedingTrials').reset();
				}
			}
		}else{
			if(djstore_PrecedingTrials._arrayOfAllItems.length == 0){
				showHide('updatedetails_no_trials_row',  0, 1,1);
			}else{
				showHide('updatedetails_trials_row', 0, 1,1);
				dijit.byId('UpdateDetails_PrecedingTrials').reset();
			}
		}

		var showBiologicals = isValueChecked('UpdateDetails_TrialClassification', '0', 0);
		showHide('updatedetails_biologicals_row', showBiologicals, 1,1);
		if (!showBiologicals){
			// removeGridData(dijit.byId('UpdateDetails_Biologicals'));
			removeGridData(dijit.byId('UpdateDetails_BiologicalIngredients'), storeApplicationData.items.UpdateDetails.BiologicalIngredients);
			removeGridData(dijit.byId('UpdateDetails_Biologicals'), storeApplicationData.items.UpdateDetails.Biologicals);
			dijit.byId('UpdateDetails_BiologicalProductDescription').setValue('');
		};
		dijit.byId('UpdateDetails_Biologicals').render();

		var showAnimalExcipients = isValueChecked('UpdateDetails_TrialClassification', '3', 0);
		showHide('updatedetails_excipients_row', showAnimalExcipients, 1,1);
		if (!showAnimalExcipients){
			// removeGridData(dijit.byId('UpdateDetails_AnimalExcipients'));
			removeGridData(dijit.byId('UpdateDetails_AnimalExcipients'),  storeApplicationData.items.UpdateDetails.AnimalExcipients);
		};
		dijit.byId('UpdateDetails_AnimalExcipients').render();

		var showThptcDevices = isValueChecked('UpdateDetails_TrialClassification', '2', 0);
		var showMedDevices = isValueChecked('UpdateDetails_TrialClassification', '2A', 0);
		var showDevices = false;
		if(showThptcDevices || showMedDevices){
			showDevices = true;
		}
		showHide('updatedetails_devices_row', showDevices, 1,1);
		if (!showDevices){
			// removeGridData(dijit.byId('UpdateDetails_Devices'));
			removeGridData(dijit.byId('UpdateDetails_Devices'),  storeApplicationData.items.UpdateDetails.Devices);
		};
		dijit.byId('UpdateDetails_Devices').render();

		var showMedicines = isValueChecked('UpdateDetails_TrialClassification', '1', 0)
		showHide('updatedetails_medicine_row', showMedicines, 1, 1);
		if (!showMedicines){
			// removeGridData(dijit.byId('UpdateDetails_Medicines'));
			removeGridData(dijit.byId('UpdateDetails_MedicineIngredients'), storeApplicationData.items.UpdateDetails.MedicineIngredients);
			removeGridData(dijit.byId('UpdateDetails_Medicines'), storeApplicationData.items.UpdateDetails.Medicines);
		};
		dijit.byId('UpdateDetails_Medicines').render();

		var showTrialConductedInCountries = isValueChecked('UpdateDetails_TrialClassification', '4', 0);
		showHide('updatedetails_countries_row', showTrialConductedInCountries, 1,1);
		if (!showTrialConductedInCountries){
			// removeGridData(dijit.byId('UpdateDetails_TrialConductedInCountries'));
			removeGridData(dijit.byId('UpdateDetails_TrialConductedInCountries'),  storeApplicationData.items.UpdateDetails.TrialConductedInCountries);
		};
		dijit.byId('UpdateDetails_TrialConductedInCountries').render();

		var ctt = storeApplicationData.items.ClinicalTrialType;
		if (ctt && ctt == 'CTN') {
			var showPlacebos = isValueChecked('UpdateDetails_TrialClassification', '6', 0);
			showHide('updatedetails_placebo_row', showPlacebos, 1,1);
			if (!showPlacebos){
				// removeGridData(dijit.byId('UpdateDetails_Placebos'));
				removeGridData(dijit.byId('UpdateDetails_Placebos'), storeApplicationData.items.UpdateDetails.Placebos);
			};
			dijit.byId('UpdateDetails_Placebos').render();
		}

		var showGMO = isValueChecked('UpdateDetails_TrialClassification', '8', 0);
		showHide('updatedetails_gmo_row', showGMO, 1,1);

		var showNanoparticles = isValueChecked('UpdateDetails_TrialClassification', '9', 0);
		showHide('updatedetails_nanoparticles_row', showNanoparticles, 1,1);

		var showGeneTherapy = isValueChecked('UpdateDetails_TrialClassification', '11', 0);
		showHide('updatedetails_genetherapy_row', showGeneTherapy, 1,1);
	} catch(e) {
		console.log("ct.js - UpdateDetailsDisplay() error: " + e);
	}
}

function validationAfterSave(status, reason, querystring) {
	try {
		setDataStatusText(constant.DataStatus_Validating);
		var script = document.getElementById('tmpValidationScript');
		if (script) { script.outerHTML = ''; }
		var head= document.getElementsByTagName('head')[0];
		var script= document.createElement('script');
		script.type= 'text/javascript';
		script.id = 'tmpValidationScript';
		script.src=gValidationDB + '/agtValidateCT?openagent&ID=' + storeApplicationData.items.ApplicationId + '&V=' + storeApplicationData.items.ApplicationVersion + '&ONCOMPLETE=validationProcessor&NAME=storeApplicationData.items.ValidationLog&R=' + Math.random() + '&login';
		head.appendChild(script);
	} catch(e) {
		console.log("ct.js - validationAfterSave() error: " + e);
	}	
}

function validationProcessor(fieldname) {
	try {
		validationSuccess = false;
		if (fieldname == '') fieldname = 'validationResults';
		if (!dijit.byId('djgrid_Validation')) return;

		try {
			var localData = eval(fieldname);
			if (localData !== 'undefined') {
				var validationOnly = localData;

				if (validationOnly !== 'undefined') {
					validationSuccess = (validationOnly.success == true)
					var feesValidation = 0;
					if (validationOnly.applicationfees !== 'undefined'){ feesValidation = parseFloat(validationOnly.applicationfees); }
					storeApplicationData.items.ApplicationFees = feesValidation;
					dijit.byId('Application_ApplicationFees').set('value', feesValidation);
					if (storeApplicationData.items.isClean){dijit.byId('Application_ApplicationFees').set('value', 'AU$0'); } // sets migrated data application fee to $0
					if (validationOnly.inventorycode) { 
						storeApplicationData.items.InventoryCode = validationOnly.inventorycode; 
						if (validationOnly.FeesDescription) storeApplicationData.items.FeesDescription = validationOnly.FeesDescription;
					}
					ValidationStore =  new dojo.data.ItemFileReadStore({ urlPreventCache:true, doClientPaging:true, clearOnClose:true, data: validationOnly });
					dijit.byId('djgrid_Validation').store = ValidationStore;
					dijit.byId('djgrid_Validation').store.fetch( { onComplete:djgrid_Validation_Fetch_Complete, onError:djgrid_Validation_Fetch_Error });
					dijit.byId('djgrid_Validation').render();
				} else{
					dialogText( 'Validation Results Incorrect', 'The validation results returned from the server cannot be understood. Please contact TGA Helpdesk regarding this problem');
				}
			} else {
				dialogText( 'Validation Results Missing Content', 'The validation results did not contain any data, there may be an issue with the system at present. Please contact the TGA Helpdesk regarding this problem.');
			}
		}catch(e){ dialogText( 'Valdiation Results Inaccessible', 'The validation results could not be obtained from the TGA web server. Please contact the TGA Helpdesk regarding this problem. ' + e)};

		storeApplicationData.items.ValidationStatus = validationSuccess ? 1 : 0;
		setDataStatusText(validationSuccess ? constant.DataStatus_ValidatingSuccess : constant.DataStatus_ValidatingFail);
		storeApplicationData.items.ApplicationStatus = validationSuccess ? 'Validated' : 'Draft';
		dojo.byId('ApplicationStatus').innerHTML = storeApplicationData.items.ApplicationStatus;

		if (validationSuccess) {
			setDataStatusText(constant.DataStatus_Saving);
			var tmpURL = constant.DBURL + 'JSONMIMEFile?openform&ONSUBMIT=jsonUploadBegin&ONCOMPLETE=jsonUploadComplete&ID=' + storeApplicationData.items.ApplicationId + '&V=' + storeApplicationData.items.ApplicationVersion + '&R=' + Math.random() + '&login';
			var newiframe = createFrame('submit', true, tmpURL, 0, 0, true);
		}
		jsonUploadComplete();
	} catch(e) {
		console.log("ct.js - validationProcessor() error: " + e);
	}	
}

function xmlEscape(s) {
	try {
		return s.replace(
				/[&<>'"]/g, // All characters we want to escape
				function (c){
					return "&" // prefix
					+ { // lookup map
						"&": "amp",
						"<": "lt",
						">": "gt",
						"'": "apos",
						'"': "quot"
					}[c]
					  + ";" // suffix
				})
	} catch(e) {
		console.log("ct.js - xmlEscape() error: " + e);
	}			
}

function hideWaitDialog() {
	// Global hideWaitDialog call. Used in most locations and is automatically
	// called when partialRefreshMulti, post-validation and other general
	// processes complete.	
	try {
		if (loadingDialog != null && typeof(loadingDialog) != "undefined") {
			loadingDialog.hide();
			loadingDialog = null;
		}
	} catch(e) {
		XSP.error("ct.js - hideWaitDialog error: " + e);
	}		
}

function showWaitDialog(dialogText, title) {
	// Global showWaitDialog - this function should normally be used. Processes such as
	// multiPartalRefresh or post-validation automatically called hideWaitDialog() which
	// will close this dialog for you.  Use the 'showWaitDialogSingle()' function if you
	// want a dialog that is not automatically closed by those processes. 
	try {
		if(dialogText == undefined){
			dialogText = 'Please wait ...';
		}
		if(title == undefined){
			title = 'Wait';
		}
		var txtContent = "<div style='text-align:center'><img src='" + getNSFBase() + "/loading.gif?OpenImageResource' alt='' />&nbsp;&nbsp;" + dialogText + "</div>";
		loadingDialog = new dijit.Dialog( {
			title : title,
			content : txtContent
		});
		dojo.body().appendChild(loadingDialog.domNode);
		loadingDialog.titleBar.style.display = 'none';
		loadingDialog.startup();
		loadingDialog.show();
	} catch(e) {
		XSP.error("ct.js - showWaitDialog error: " + e);
	}
}

function setToDraft(){
	try{
		var appstatus = dojo.byId(getItemId("", "cfdApplicationStatus")).innerHTML;
		if(appstatus == "Passed Validation"){
			dojo.byId(getItemId("", "cfdApplicationStatus")).innerHTML = "Draft";
			dojo.byId(getItemId("", "applicationStatus")).value = "Draft";
			dojo.byId(getItemId("", "validationStatus")).value = "";
			var btnSubmit = dijit.byId(getItemId("", "btnActionSubmit"));
			var menuSubmit = dijit.byId(getItemId("","menuItemSubmit"));
			if (btnSubmit)
				btnSubmit.set('disabled', true);
			if (menuSubmit)
				menuSubmit.set('disabled', true);
			var btnSave = dojo.byId(getItemId("", "btnActionSave"));
			btnSave.click();
		}
	}catch(e){
		console.log('ct.js script library - fn setToDraft error: ' + e);		
	}
}
