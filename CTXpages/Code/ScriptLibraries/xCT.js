function xSetFocus(itemID) {
	// xPages implementation of SetFocus() function
	try {
		if (typeof(itemID) == "undefined" || itemID == null || itemID == "")
			return;		// invalid id passed
		
		var itemObj = dojo.byId(itemID);
		if (typeof(itemObj) == "undefined" || itemObj == null)
			return;		// object wasn't found
		
		// Set focus to the specified object.
		try {
			itemObj.focus();
		} catch (e) {
			consoleLog("CTDraft - xSetFocus error setting focus: " + e);
		}
	} catch (e) {
		XSP.error("CTDraft - xSetFocus error: " + e);
	}
}

function partialRefreshMulti(refreshIDList, offset) {
	try {
		if (offset >= refreshIDList.length) {
			hideWaitDialog();
			return;		// maximum number of elements has been iterated
		}
		
		var refreshObject = null;
		var id = refreshIDList[offset];
		if (id != "") {
			refreshObject = dojo.byId(id);
		}
		offset++;		
		
		if (refreshObject) {
			// Make sure refresh is not blocked
			XSP.allowSubmit();
			
			if (offset == refreshIDList.length) {
				// Last element in the list has been reached
				XSP.partialRefreshGet(id, "");
			} else {
				XSP.partialRefreshGet(id, {
					onComplete: function() {
						partialRefreshMulti(refreshIDList, offset)
					}
				});
			}
		} else {
			// Object not found. Skip to next element in the list 
			partialRefreshMulti(refreshIDList, offset);
		}
	} catch(e) {
		XSP.error("xCT - partialRefreshMulti error: " + e);
	}
}

function partialRefreshSingle(refreshID) {
	// Perform a partial refresh of a single object
	try {
		if (refreshID == null || refreshID == "")
			return;
		
		var refreshIDList = new Array();
		refreshIDList[0] = refreshID;
		partialRefreshMulti(refreshIDList, 0);
	} catch(e) {
		XSP.error("xCT - partialRefreshSingle error: " + e);
	}
}

function bioIngredientAddCountry() {
	try {
		var g = dijit.byId(getItemId('','gridCountries'));
		var c = dijit.byId(getItemId('','biologicalingredientCountriesLU'));
		var cValue = c.get('value');
		if(!g.store){
			g.store = new dojo.data.ItemFileWriteStore( {data: {"identifier":"id", "label":"label", "items":[ ]} });
		}
		
//		if(g.store.data == null){
//			g.store = new dojo.data.ItemFileWriteStore( {data: {"identifier":"id", "label":"label", "items":[ ]} });
//		}
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
		//updateJSONfromGrid(g.id,'id','label');	
	} catch(e) {
		console.log("xCt.js - bioIngredientAddCountry() error: " + e);
	}
}

function removeCountry(){
	try {
		var g = dijit.byId(getItemId('','gridCountries'));
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
		//updateJSONfromGrid(g.id,'id','label');
	} catch(e) {
		console.log("xCt.js - removeCountry() error: " + e);
	}
}