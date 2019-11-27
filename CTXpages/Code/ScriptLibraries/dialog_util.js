/*	VERSION 1.01
	19FEB2015 BL
	- modifications to dialog_Functions_Add to prevent client side validation
	15JUL2011 Bruce
	- added case for "dojox.grid.EnhancedGrid" to first switch
	- added test: if(nodebyid.store._arrayOfAllItems[f]){ to second switch
	28JUL2011 Bruce
	- added code to deal with attached declarations for a Site
	22AUG2011 Me
	- I feel like dancin, dancin, dance the night away
	21SEP2011 Biological Development Team Version 2.00
	members in the library:
	function dialog_Functions_onShow(dialogID) - loads data and information into a dialog
	function dialog_Functions_onHide(dialogID) - check attachments list before and after, delete any that are in the after and not in the before
	function dialog_Functions_Add(dialogID) - writes values from the dialog into the json tree, validates the data
*/
function dialog_Functions_onShow(dialogID) {
	var d = dijit.byId(dialogID);
	if (!d) return;

	d.reset();
	/*
	d.AttachmentsBefore = new Array();
	djstore_Attachments.fetch({
	 onComplete:function(x,y,z){
	  dojo.forEach(x, function(bb){
	   d.AttachmentsBefore.push (bb.AttachmentId.toString());
	  })
	 }
	});
	consoleLog(d.AttachmentsBefore);
	*/
	try {refreshAttachmentsCT();}catch (e) {consoleLog('handled error, function not defined, thats ok.');}
	
	var ti = d.thisItem;
	if (!ti) {
		dojo.query('[id*="' + d.id + '_"]').forEach(function (node, index, arr) {
			var nodebyid = dijit.byId(node.id);
			if (nodebyid) {
				switch (nodebyid.declaredClass) {
					case "dojox.grid.EnhancedGrid": //bl 15JUL2011
					//enhanced grids in a new dialog should always start empty
					try{
						if(nodebyid.store){
							var items = nodebyid.store._arrayOfAllItems;
							if(items){
								for (i = 0; i < items.length; i++){
									if(items[i] != null){
										nodebyid.store.deleteItem(items[i]);
									}
								}
								nodebyid.store.save();
								nodebyid.render();
							}
						}
					}catch(e){consoleLog('Error dialog_Functions_onShow: ' + e.message)}
					break;
				}
			}
		});
	}  //end new dialog
	
	//file attachment fields
	dojo.query('[id*="' + d.id + '_"]').forEach(function (node, index, arr) {
		var tn = node.className.split(' ');
		for(h=0; h<tn.length; h++) {
			if (/__attachment_parent/i.test(tn[h])){
				consoleLog('this is the attachment node');
				elementname = node.id.substring(node.id.lastIndexOf('_') + 1);
				var theLabel = (ti==undefined ? '' : ti[elementname + '_Label']);
				for(g in node.children) {	//attachment parents children
					if (parseInt(g) >= 0 ) {
						var tnc = node.children[g].className.split(' ');
						for(fh=0; fh<tnc.length; fh++) {
							switch (tnc[fh]) {
							case '__attachment_name':
								node.children[g].innerHTML = (theLabel=='' ? '-Not Uploaded-' : theLabel);
								break;
							case '__attachment_add':
							case '__button_add':
								//node.children[g].style.display = (theLabel=='' ? '' : 'none');
								dijit.byNode(node.children[g]).domNode.style.display = (theLabel=='' ? '' : 'none');
								break;
							case '__attachment_remove':
							case '__button_remove':
								//node.children[g].style.display = (theLabel=='' ? 'none' : '');
								dijit.byNode(node.children[g]).domNode.style.display = (theLabel=='' ? 'none' : '');
								break;
							}
						}
					}
				}
			}
		}
	});
	if (!ti) return;
	
	dojo.query('[id*="' + d.id + '_"]').forEach(function (node, index, arr) {
		var nodebyid = dijit.byId(node.id);
		if (nodebyid) {
			var elementname = '';
			//disable if dialogs disableEditing is true
			var closebutton = d.id+'_Close';
			if (node.id != closebutton) {
				nodebyid.set('disabled', (dijit.byId(dialogID).disableEditing==true));
			}
			switch (nodebyid.declaredClass) {
			case "dijit.form.RadioButton":
			case "dijit.form.CheckBox":
				elementname = nodebyid.name.substring(nodebyid.id.lastIndexOf('_') + 1);
				break;
			default:
				elementname = nodebyid.id.substring(nodebyid.id.lastIndexOf('_') + 1);
			}
			var thevalue = ti[elementname];
			var thevalue_label = ti[elementname + '_Label'];
			if (thevalue) {
				if (thevalue.length < 2) thevalue = thevalue[0];
				switch (nodebyid.declaredClass) {
				case "dijit.form.RadioButton":
				case "dijit.form.CheckBox":
					if (Number(nodebyid.id.charAt(nodebyid.id.length - 1)) > 0) return; //zero based checkbox IDs 2
					var checkGroup = document.getElementsByName(nodebyid.name);
					if (isArray(ti[elementname])) {
						if (checkGroup) {
							for (i = 0; i < checkGroup.length; i++) {
								try {
									var q1 = dijit.byId(checkGroup[i].id);
									if (q1) {
										if (isArray(thevalue)) {
											for (z = 0; z < thevalue.length; z++) {
												if (thevalue[z].toString() == q1.value.toString()) {
													//q1.setChecked(true);
													q1.set('checked', true);
													break;
												}
											}
										} else {
											if (thevalue.toString() == q1.value.toString()) {
												q1.set('checked', true);
												break;
											}
										}
									}
								} catch (e) {
									consoleLog('checkbox set error: ' + e.message);
								}
							}
						}
					}
					break;
				case "dojox.grid.EnhancedGrid":
					try {
						nodebyid.store = new dojo.data.ItemFileWriteStore({
							data: createJSONfromArray(ti[elementname], thevalue_label)
						});
						nodebyid.sort();
						nodebyid.render();
					} catch (e) {
						consoleLog("error in setstore : " + e + " and setting value to : " + nodebyid.set('value', thevalue[0]));
					}
					break;
				case "dijit.form.ComboBox":
					try {
						if (nodebyid.store) {
							nodebyid.store.fetch();
							nodebyid.set('item', nodebyid.store._getItemByIdentity(thevalue));
						}
					} catch (e) {
						consoleLog('error dialog_Function_Show case ComboBox: ' + e.message)
					}
					break;
				case "dijit.form.DateTextBox":
					nodebyid.set('value', dojo.date.stamp.fromISOString(thevalue));
					break;
				case "dijit.form.Select":
					try {
						//set the store and the previously selected value into the node
						nodebyid.setStore(stateStore, ti[elementname]);
					} catch (e) {
						"error dialog_Functions_Show case Select: " + e.message
					}
					break;
				case "dijit.form.ValidationTextBox":
				case "dijit.form.TextBox":
				default:
					nodebyid.set('value', thevalue);
				}
			}
		} else {//not a dijit
			//don't care now
		}
	});
		
}
function dialog_Functions_onHide(dialogID) {
	var d = dijit.byId(dialogID);
	if (!d) return;

	//check attachments list before and after, delete any that are in the after and not in the before
	if (d.get('ControlledSaveAndExit')) {
	  delete d.ControlledSaveAndExit;
	  return;
	}
	/*
	var AttachmentsBefore = d.AttachmentsBefore.sort();
	djstore_Attachments.fetch({
	 onComplete:function(x,y,z){
	  dojo.forEach(x, function(aftr){
	   var afterid = aftr.AttachmentId.toString();
	   var wasThereBefore = false;
	   for(var i=0; i<AttachmentsBefore.length; i++) {
		if (AttachmentsBefore[i] == afterid){
		 wasThereBefore = true;
		 break;
		}
	   }
	   if (wasThereBefore == false) {
		consoleLog('removing ' + afterid + ' automatically due to close without save');
		var script = document.getElementById('tmpAttachmentScript');
		if (script) { script.outerHTML = ''; }
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.id = 'tmpAttachmentScript';
		script.src = gFileRepoDB + '/wDeleteDocuments?openagent&ID=' + afterid + '~' + storeApplicationData.items.ApplicationVersion + '&ONCOMPLETE=refreshAttachmentsCT&NAME=responseJSON&R=' + Math.random();
		head.appendChild(script);
	   }
	  })
	 }
	});
	*/
}

function dialog_Functions_Add(dialogID) {
	var d = dijit.byId(dialogID);
	if (!d) {
		consoleLog('cannot get dijit with the id: ' + dialogID);
		return;
	}
	var newItem = d.storeKey;
	if (d.thisItem) {
		// Fixing entryKey problem - Wisnu P
		var entryKey='';
		if ((d.thisItem.EntryKey != undefined) && (d.thisItem.EntryKey != null)) entryKey = d.thisItem.EntryKey;
		if (entryKey != '') newItem.EntryKey = entryKey;
		
		var xx1=d.storeKey.RecordUNID;
		if (d.thisItem.RecordUNID[0]) {
			xx1 = d.thisItem.RecordUNID[0];
		}else{
			xx1=d.thisItem.RecordUNID;
		}
		newItem.RecordUNID = xx1;
		newItem.id = xx1;
	}
	if (!newItem) {
		consoleLog('cannot access the required property "storeKey" of this Dialog');
		return;
	}
	var msgs = new Array();
	dojo.query('[id*="' + d.id + '_"]').forEach(function (node, index, arr) {
		var nodebyid = dijit.byId(node.id);
		var isValidNode = false;
		var doNOTValidate = true; //INC61834 BL 27JAN2015 prevent client side validation
		if (nodebyid) {
			var elementname = nodebyid.id.substring(nodebyid.id.lastIndexOf('_') + 1);
			isValidNode = true; //INC61834 BL 11MAR2015 leave as true so that original data is kept
			if (nodebyid.isValid) {
				//isValidNode = nodebyid.isValid();
			}
			if (isValidNode) {
				if (nodebyid.required) {
					//if (nodebyid.get('value').length < 1) isValidNode = false;
				} else {
					if(nodebyid.declaredClass != "dijit.form.Textarea"){
						doNOTValidate = true;
					}
				}
			}
			if (isValidNode) {
				if (nodebyid.minSize) {
					//if (nodebyid.get('value').length < 1) isValidNode = false;
				}
			}
			if (isValidNode) {
				switch (nodebyid.declaredClass) {
				case "dijit.form.Select":
					newItem[elementname] = nodebyid.value;
					newItem[elementname + '_Label'] = nodebyid.store._itemsByIdentity[nodebyid.value].name[0];
					break;
				case "dijit.form.FilteringSelect":
				case "dijit.form.ComboBox":
					
					if (nodebyid.item) {
						newItem[elementname] = nodebyid.item.id ? nodebyid.item.id[0] : nodebyid.item.abbreviation[0];
						newItem[elementname + '_Label'] = nodebyid.item.name[0];
					} else {
						nodebyid.set('value', '');
						isValidNode = false;
					}
					break;
				case 'dojox.grid.EnhancedGrid':
					if (nodebyid.store) {
						newItem[elementname + '_Label'] = ''; //INC61834 BL 23FEB2015 - validation check required
						if (nodebyid.store._arrayOfAllItems) {
							if (nodebyid.rowCount > 0) {
								newItem[elementname] = new Array();
								newItem[elementname + '_Label'] = new Array();
								for (f = 0; f < nodebyid.store._arrayOfAllItems.length; f++) {
									if(nodebyid.store._arrayOfAllItems[f]){  //bl 15JUL2011
										newItem[elementname].push(nodebyid.store._arrayOfAllItems[f].id[0]);
										if (nodebyid.store._arrayOfAllItems[f].label) {
											newItem[elementname + '_Label'].push(nodebyid.store._arrayOfAllItems[f].label[0]);
										} else {
											newItem[elementname + '_Label'].push(nodebyid.store._arrayOfAllItems[f].name[0]);
										}
									}
								}
							}else{
								isValidNode = false;
								doNOTValidate = false;
							}
						}
					} else {
						isValidNode = false;
						doNOTValidate = false;
					}
					break;
				case "dijit.form.RadioButton":
				case "dijit.form.CheckBox":
					if (Number(elementname.charAt(elementname.length)) > 0) return; //zero based checkbox IDs
					elementname = nodebyid.name.substring(nodebyid.id.lastIndexOf('_') + 1);
					newItem[elementname] = new Array();
					newItem[elementname + '_Label'] = '';
					
					var hasChecked = false;
					var checkGroup = document.getElementsByName(nodebyid.name);
					if (checkGroup) {
						for (i = 0; i < checkGroup.length; i++) {
							try {
								var thisdijit = dijit.byId(checkGroup[i].id);
								if (thisdijit) {
									if (thisdijit.checked) {
										var tmpX = thisdijit.get("value");
										newItem[elementname].push(tmpX);
										newItem[elementname + '_Label'] = thisdijit.label;
										hasChecked = true;
										if(thisdijit.declaredClass == "dijit.form.RadioButton"){
											break;
										}
									}
								}
							} catch (e) {
								consoleLog('checkbox error: ' + e.message);
							}
						}
					}
					if (!hasChecked) {
						isValidNode = false;
						doNOTValidate = false;
					}
					//consoleLog(hasChecked + " " + doNOTValidate);
					break;
				case "dijit.form.DateTextBox":
					if(nodebyid.valueNode.value !=''){
						newItem[elementname] = nodebyid.valueNode.value;
					}else{
						isValidNode = false;
						doNOTValidate = false;
					}
					break;
				// INC 64660 - Numeric Value "0" always replaced by ""
				case "dijit.form.NumberTextBox":
					var tmpValue = nodebyid.get('value');
					if (tmpValue != '' || tmpValue != undefined || tmpValue != 'undefined'){
						newItem[elementname] = nodebyid.get('value');
					}
					break;					
				case "dijit.form.TextBox":
				case "dijit.form.ValidationTextBox":
				case "dijit.form.Textarea":
					var tmpValue = nodebyid.get('value');
					if(tmpValue){
						if (tmpValue != '' || tmpValue != undefined || tmpValue != 'undefined'){
							newItem[elementname] = nodebyid.get('value');
						}
					}
				default:
				}
			}
			msgtext = '';
			var hasLocationAlready = false
			if (nodebyid.title) {
				if(msgs){
					if(msgs.length > 0){
						for(i=0; i<msgs.length; i++){
							//on a Site dialog the Principal Investigator State is a checkbox group
							//need only put one msgtext in, not one for each state
							if(msgs[i].indexOf('Investigator State') > 0){
								hasLocationAlready = true;
							}
						}
						if(!hasLocationAlready){
								msgtext = nodebyid.title;
						}
					}else{
						if(!hasLocationAlready){
								msgtext = nodebyid.title;
						}
					}
				}else{//the first msgtext to be pushed into the msgs array
					msgtext = nodebyid.title;
				}
			}
			//if (nodebyid.errorMessage) msgtext = (nodebyid.errorMessage.length > 0) ? nodebyid.errorMessage : '';
			if (nodebyid.noDataMessage) msgtext = nodebyid.noDataMessage;
			if (msgtext.length < 1 || msgtext == undefined) if (nodebyid.placeHolder) msgtext = (nodebyid.placeHolder.length < 1) ? (elementname + ' is required') : nodebyid.placeHolder;
			if (!isValidNode && !doNOTValidate && msgtext !="") msgs.push(msgtext);
		} else { //not a dojo dijit
			//don't care now
		}
	});
	
	if (msgs.length > 0) {
		//INC61834 BL 18FEB2015 prevent client side validation
		//msgs = cleanArray(msgs, undefined);
		//dialogText('Missing Information', 'The following information is missing:<br/>' + msgs.join('<br/>'), '', '', '', 'Close');
		//return;
	}
	var g = dijit.byId(d.get('gridID'));
	if (g) {
		if (d.editMode) {
			g.store.deleteItem(d.thisItem);
			g.store.save(); //added in attempt to fix insertion fail error when adding newItem below
		}
		g.store.newItem(newItem);
		g.store.save();
		g.render();
	} else {
		alert('cannot access the required "gridID" property of this Dialog');
		consoleLog('cannot access the required "gridID" property of this Dialog');
		return;
	}
	//d.thisItem = null; // hide by Wisnu - why we need to setup to null, set to last item added
	d.thisItem = newItem;
	consoleLog('add and hide 1');
	d.set('ControlledSaveAndExit', true);
	d.hide(true);
}