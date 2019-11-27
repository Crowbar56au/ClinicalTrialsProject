//Server-side actions xPages
function closeApplication(){
	// Close the current application and return back to the portal
	try{
		var url : XSPUrl;
		url = context.getUrl();
		facesContext.getExternalContext().redirect(url.getScheme() + "://" + url.getHost());
	} catch(e) {
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - closeApplication() error: " + e);		
	}
}

function closeDeclaration(source){
	try {
		//not sure if this should return to the portal or the Application
		var sApplicationID = getComponent("cfdApplicationID").getValue();
		var luApplicationView:NotesView = database.getView("$ApplicationHeaders");
		var applicationDoc:NotesDocument = luApplicationView.getDocumentByKey(sApplicationID, true);
		if (applicationDoc != null) {
			var sForm = applicationDoc.getItemValueString("Form");
			var url1 = @LeftBack(context.getUrl(), "/");
			sUNID = applicationDoc.getUniversalID();
			var params = "?documentId=" + sUNID + "&action=editDocument";
			var fullurl = url1 + "/" + sForm + ".xsp"+ params;
			
			applicationDoc.recycle();
			luApplicationView.recycle();
			context.redirectToPage(fullurl);
		} else {
			luApplicationView.recycle();
		}
	} catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - closeDeclaration() error: " + e);
	}
}

function createDBArray(dbpath){
	try{
		var serverName = database.getServer();
		var lookupdb = @Right(dbpath, "!!");
		var dbName = new Array(serverName,lookupdb);
		return dbName;
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - createDBArray() error: " + e);
	}
}

function getApplicationClientID(){
	try{
		var cID = @DbLookup(createDBArray(sessionScope.usermanagedb), "LULM", @Name("[CN]",@UserName()),"ClientID")
		var result = @If(@IsError(cID),"ERROR: Can't find user \"" + @Name("[CN]", @UserName()) + "\" in user management database.", cID);
		sessionScope.clientid = result;
		sessionScope.username = @Name("[CN]", @UserName());
		var accountName = @DbLookup(createDBArray(sessionScope.usermanagedb), "LUUserByUserId", sessionScope.username,"UserName");
		sessionScope.accountname = accountName;
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - getApplicationClientID() error: " + e);
	}
}

function getApplicationStatus(doc) {
	try {
		var scriptElement = "getApplicationStatus";
		return doc.getItemValueString("ApplicationStatus");
	} catch (e) {
		print(database.getTitle() + " - " + @Right(view.getPageName(), "/") + " " + scriptElement + " error: " + e);
	}
}

function getClientInfo(id,type){
	try{
		var scriptElement = "getClientInfo";
		var clientdb:NotesDatabase = null;
		var clientview:NotesView = null;
		var clientdoc:NotesDocument = null;
		var returnValue = "";
		
		//print(scriptElement + " id: " + id + " type; " + type);
		clientdb = getDatabase(sessionScope.clientwdb);
		if (clientdb != null) {
			if(type == "C"){
				clientview = clientdb.getView("LUClientByID");
			} else{
				clientview = clientdb.getView("LULocationByLocationID");
			}
			
			if (clientview != null) {
				clientdoc = clientview.getDocumentByKey(id.toString(), true);
				if (clientdoc != null) {
					if (type == "C") {
						returnValue = clientdoc.getItemValueString("ClientName");
					} else {
						returnValue = clientdoc.getItemValueString("Address_Line1") + " " + clientdoc.getItemValueString("Town") + " " + clientdoc.getItemValueString("State") + " " + clientdoc.getItemValueString("Country_Code") + " " + clientdoc.getItemValueString("Postcode");
					}
					clientdoc.recycle();
				}
				clientview.recycle();
			}
			clientdb.recycle();
		}
		return returnValue;
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " " + scriptElement + " error: " + e);
	}
}

function getComboListValues(db2lookup, vwlookup, col){
	try{
		if(!col){col = 1}
		result = @DbColumn(createDBArray(db2lookup),vwlookup,col);
		var finalResult = @If(@IsError(result), @Text(result), result);
		return finalResult;
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - getComboListValues() error: " + e);
	}
}

function getComboListValuesDCT(db2lookup, vwlookup, key){
	try{
		result = @DbLookup(createDBArray(db2lookup),vwlookup,key, 2);
		var finalResult = @If(@IsError(result), @Text(result), result);
		return finalResult;
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - getComboListValuesDCT() error: " + e);
	}
}

function getDatabase(path){
	try{
		var scriptElement = "getDatabase";
		var dbname = createDBArray(path);
		var db:NotesDatabase = session.getDatabase(dbname[0],dbname[1]);
		return db;
	}catch(e){
		print(scriptElement + " error: " +  e);
	}
}

function getDCTCodeValue(system,tablecode, code){
	try{
		var scriptElement = "getDCTCodeValue";
		var description = "";
		var dct:NotesDatabase = null;
		var dctlookup:NotesView = null;
		var dctdoc:NotesDocument = null;

		dct = getDatabase(sessionScope.codetablesdb);
		if(dct != null){
			dctlookup = dct.getView("(DCTLookup)");
			if(dctlookup != null){
				key = system + "~" + tablecode + "~" + code;
				dctdoc = dctlookup.getDocumentByKey(key, true);
				if(dctdoc != null){
					description = dctdoc.getItemValueString("ShortDescription");
					dctdoc.recycle();
				}
				dctlookup.recycle();
			}
			dct.recycle();
		}

		return description;

	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " " + scriptElement + " error: " + e);
	}
}

function getKeys(obj){
	try{
		var scriptElement = "getKeys"
			var name,
			result = [];

		for (name in obj) {
			if (obj.hasOwnProperty(name)) {
				result[result.length] = name;
			}
		}
		return result;
	}catch(e){
		print(database.getTitle() + ": applicationActions " + scriptElement + " error: " + e);
	}
}

function getUserRole(roleToCheck){
	try{
		var scriptElement = "getUserRole";
		var myName:NotesName = session.createName(session.getEffectiveUserName());
		var accountName = myName.getCommon();
		myName.recycle();

		var accountRoles = [];
		var userdb:NotesDatabase = getDatabase(sessionScope.usermanagedb);
		var luview:NotesView = userdb.getView("(LUALLAccountsPassword)");
		var userdoc:NotesDocument = luview.getDocumentByKey(accountName, true);
		if (userdoc != null) {
			accountRoles = userdoc.getItemValue("AccountRole");
			userdoc.recycle();
		}
		
		luview.recycle();
		userdb.recycle();
		
		if(accountRoles.length > 0){
			for(i = 0; i < accountRoles.length; i++){
				if(accountRoles[i].equalsIgnoreCase(roleToCheck)){
					return true;
				}
			}
		}
		return false;

	}catch(e){
		print(database.getTitle() + ": applicationActions " + scriptElement + " error: " + e);
		return false;
	}
}

function intersection(a, b){
	//returns elements common to both arrays - not currently used 04FEB2014 BL
	//but kept as useful for the future
	try{
		var scriptElement = "intersection";
		var result = new Array();

		if(a.length > 0 && b.length > 0){
			for(var i=a.length-1;i>-1;i--){
				for(var j=b.length-1;j>-1;j--){
					if(a[i].equalsIgnoreCase(b[j])){
						result.push(a[i]);
					}
				}
			}
		}
		return result;

	}catch(e){
		print(database.getTitle() + ": applicationActions " + scriptElement + " error: " + e);
	}
}

function objRecycle(obj){
	if(obj != null) {
		obj.recycle();
	} 
}

function openDeclaration(source){
	//Needs to be called after form has been validated and passed.
	try {
		var scriptElement = "openDeclaration";
		var url1 = @LeftBack(context.getUrl(), "/");
		var form = "/declaration.xsp";
		var sApplicationID = source.getItemValueString("ApplicationId");
		var sponsorid = source.getItemValueString("SponsorId");
		var sponsorname = source.getItemValueString("SponsorName");
		var params = "?ApplicationId=" + sApplicationID + "&si=" + sponsorid + "&sn=" + escape(sponsorname);
		var fullurl = url1 + form + params;
		context.redirectToPage(fullurl);
	} catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - openDeclaration() error: " + e);
	}	
}

function returnItemValues(object, flag){
	try{
		//22JUL2013 Bruce Langner
		//function returns a value from the getItemValue when the item is empty
		//rather then erroring out if use is x.getItemValue("xyz")[0]
		//flag == 0 returns first element or xth element
		//flag == s returns all values as a string
		//flag == null or not used returns all values as an array
		var scriptElement = "returnItemValues";
		if(debug){print(scriptElement + " start")}
		var result = "";

		if(object.isEmpty()){
			return result;
		}else{
			if(typeof flag == "number" && flag >= 0){
				if(debug){print(scriptElement + " 0 ends")}
				return object[flag];
			}else if(flag == "s"){
				var tmpresult = new Array(object);
				result = tmpresult.toString();
				if(debug){print(scriptElement + " 's' ends")}
				return result;
			}else{
				if(debug){print(scriptElement + " 'else' ends")}
				return object;
			}
		}
	}catch(e){
		return object.toString();
	}
}

function setApprovalAreaCode(source) {
	// Calculate the approval area code for the application
	try{
		var scriptElement = "setApprovalAreaCode";
		sessionScope.put("approvalareacode", "OTC");	// default value

		// Lookup Application Type
		var applicationType = source.getItemValueString("ApplicationType") || "";
		if (applicationType.length > 0) {
			var validationDb:NotesDatabase = getDatabase(sessionScope.validationdb);
			if(validationDb != null){
				var lookupView:NotesView = validationDb.getView("LUFeeProfile");
				var feeProfileDoc:NotesDocument = lookupView.getDocumentByKey(applicationType, true);
				if (feeProfileDoc != null) {
					source.replaceItemValue("ApprovalAreaCode", feeProfileDoc.getItemValueString("ApprovalAreaCode"));
					sessionScope.put("approvalareacode", feeProfileDoc.getItemValueString("ApprovalAreaCode"));

					// Cleanup 
					feeProfileDoc.recycle();
					lookupView.recycle();
					validationDb.recycle();
		
					return;
				}
		
				lookupView.recycle();
				validationDb.recycle();
			}
		}

		if (source.hasItem("djCloneSource")) {
			// Lookup ARTG entry
			var artgId = source.getItemValueString("djCloneSource").getValue() || "";
			if (artgId.length > 0) {
				var artgDb:NotesDatabase = getDatabase(sessionScope.artgdb);
				if(artgDb != null){
					var lookupView:NotesView = artgDb.getView("luLicence");
					var artgDoc:NotesDocument = lookupView.getDocumentByKey(artgId, true);
					if (artgDoc != null) {
						if (artgDoc.hasItem("ApprovalAreaCode")) {
							source.replaceItemValue("ApprovalAreaCode", artgDoc.getItemValueString("ApprovalAreaCode"));
							sessionScope.put("approvalareacode", feeProfileDoc.getItemValueString("ApprovalAreaCode"));
							
							// Cleanup 
							artgDoc.recycle();
							lookupView.recycle();
							artgDb.recycle();
		
							return;
						}
		
						artgDoc.recycle();
					}
		
					lookupView.recycle();
					artgDb.recycle();
				}
			}
		}
	}catch(e){
		print(database.getTitle() + ": applicationActions " + scriptElement + " error: " + e);
	}
}

function setBrowserMode() {
	// Force browsers to run in the mode we want it to run in
	try {
		var response:com.ibm.xsp.webapp.XspHttpServletResponse = facesContext.getExternalContext().getResponse();
		if (context.getUserAgent().isIE()) {
			// Set Internet Explorer mode
			var version = context.getUserAgent().getBrowserVersionNumber();
			var xUAHeader = "IE=" + (version == 8 ? version : 8);
			response.setHeader("X-UA-Compatible", xUAHeader);
		}
	
		// Disable cacheing
		response.setHeader("Expires", "-1");
		response.setHeader("Cache-Control", "no-cache");
		//response.disableXspCache(false);
	} catch (e) {
		print(database.getTitle() + " - " + @Right(view.getPageName(), "/") + " - setBrowserMode() error: " + e);
	}	
}

function setupAuthorReaderFields(thisdoc, authorField, readerField){
	try {
		var authitem:NotesItem = thisdoc.getFirstItem(authorField);
		if (authitem != null) {
			// only do below work if the Authors field has not been setup as an "Authors" type field initially
			if (!authitem.isAuthors()) {
				authitem.setAuthors(true);

				var readitem:NotesItem = thisdoc.getFirstItem(readerField);
				readitem.setReaders(true);
				readitem.recycle();
			}
			authitem.recycle();
		}
		
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + " - setupAuthorReaderFields() error: " + e);
	}
}

function removeSubDocuments(source){
 	try {
		//print ("remove sub document");
	 	var docIDArray;
	 	
		if(@Length(getComponent("unidstoreEOS").getValue()) > 0){
			docIDArray = @Explode(getComponent("unidstoreEOS").getValue());
 		}
		
		if(@Length(docIDArray) > 0){
			var thisunid = source.getDocument().getUniversalID();
			var doc:NotesDocument = database.getDocumentByUNID(thisunid);
			if (doc == null)
				return;
		
			doc.replaceItemValue("thisunid", thisunid);
			doc.replaceItemValue("xPages", 1);
			
			for(i=0; i < docIDArray.length;i++){
				var deleteDoc:NotesDocument = database.getDocumentByUNID(@Trim(docIDArray[i]));
				if (deleteDoc) {
					doc.replaceItemValue("deleteunid", deleteDoc.getUniversalID());
					var agent:NotesAgent = database.getAgent("(DeleteDocument)");
					agent.runWithDocumentContext(doc); 
					agent.recycle();
					deleteDoc.recycle();
				}else{
					print("can't find a document for: " + docIDArray[i]);
				}
			}
				
			doc.removeItem("thisunid");
			doc.removeItem("deleteunid");
			doc.removeItem("xPages");
			doc.recycle();
			
			// Look up Application UNID using the ApplicationID number;
			var appID = source.getItemValueString("ApplicationID");
			if (appID != "") {
				var appUNID = @DbLookup(@DbName(), "$ApplicationHeaders", appID, 2);
				if (appUNID != "") {
					if (database != null && database.isOpen()) {
						var appDoc:NotesDocument = database.getDocumentByUNID(appUNID);
						if (appDoc != null) {
							// Sets the Audit Tracking fields in the Application Document
							appDoc.replaceItemValue("ApplicationStatus", "Draft");
							appDoc.replaceItemValue("ValidationStatus", "Failed"); //INC44423 12JUL2013 BL
							appDoc.replaceItemValue("ValidationXML", "<message><success>Reset</success></message>");
							appDoc.replaceItemValue("SubmissionCost", 0);
							appDoc.replaceItemValue("LastEdited", session.createDateTime(@Text(@Now())));
							appDoc.replaceItemValue("LastEditor", session.getEffectiveUserName());
							appDoc.save(true, true);
							appDoc.recycle();
						}
					}
				}
			}
		}
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- removeSubDocuments() error: " + e);
	} 
}

function removeL1SubDocuments(source){
	try {		  
	 	var docIDArray;
		if(@Length(getComponent("unidstoreL1EOS").getValue()) > 0){
			docIDArray = @Explode(getComponent("unidstoreL1EOS").getValue()); 
 		}
		
		if(@Length(docIDArray) > 0){
			var thisunid = source.getDocument().getUniversalID();
			var doc:NotesDocument = database.getDocumentByUNID(thisunid);
			if (doc == null){
				
				return;
			}
			doc.replaceItemValue("thisunid", thisunid);
			doc.replaceItemValue("xPages", 1);
			
			for(i=0; i < docIDArray.length;i++){ 
				var deleteDoc:NotesDocument = database.getDocumentByUNID(@Trim(docIDArray[i]));
				if (deleteDoc) {  
					doc.replaceItemValue("deleteunid", deleteDoc.getUniversalID());
					var agent:NotesAgent = database.getAgent("(DeleteDocument)");
					agent.runWithDocumentContext(doc); 
					agent.recycle();
					deleteDoc.recycle();
				}else{
					print("can't find a document for: " + docIDArray[i]);
				}
			}
				
			doc.removeItem("thisunid");
			doc.removeItem("deleteunid");
			doc.removeItem("xPages");
			doc.recycle();
			
			// Look up Application UNID using the ApplicationID number;
			var appID = source.getItemValueString("ApplicationID");
			if (appID != "") {
				var appUNID = @DbLookup(@DbName(), "$ApplicationHeaders", appID, 2);
				if (appUNID != "") {
					if (database != null && database.isOpen()) {
						var appDoc:NotesDocument = database.getDocumentByUNID(appUNID);
						if (appDoc != null) {
							// Sets the Audit Tracking fields in the Application Document
							appDoc.replaceItemValue("ApplicationStatus", "Draft");
							appDoc.replaceItemValue("ValidationStatus", "Failed"); //INC44423 12JUL2013 BL
							appDoc.replaceItemValue("ValidationXML", "<message><success>Reset</success></message>");
							appDoc.replaceItemValue("SubmissionCost", 0);
							appDoc.replaceItemValue("LastEdited", session.createDateTime(@Text(@Now())));
							appDoc.replaceItemValue("LastEditor", session.getEffectiveUserName());
							appDoc.save(true, true);
							appDoc.recycle();
						}
					}
				}
			}
		}
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- removeL1SubDocuments() error: " + e);
	} 
}

function removeL2SubDocuments(source){
	try {		  
	 	var docIDArray;
	 	print("removeL2SubDocuments invoked");
	 	print("unidstoreL2EOS: " + getComponent("unidstoreL2EOS").getValue());
		if(@Length(getComponent("unidstoreL2EOS").getValue()) > 0){
			docIDArray = @Explode(getComponent("unidstoreL2EOS").getValue());
			print("STEP 1");
		} 
		
		if(@Length(docIDArray) > 0){
			print("STEP 2");
			var thisunid = source.getDocument().getUniversalID();
			var doc:NotesDocument = database.getDocumentByUNID(thisunid);
			if (doc == null)
				return;
		
			doc.replaceItemValue("thisunid", thisunid);
			doc.replaceItemValue("xPages", 1);
			
			for(i=0; i < docIDArray.length;i++){ 
				var deleteDoc:NotesDocument = database.getDocumentByUNID(@Trim(docIDArray[i])); 
				if (deleteDoc) {
					doc.replaceItemValue("deleteunid", deleteDoc.getUniversalID());
					var agent:NotesAgent = database.getAgent("(DeleteDocument)");
					agent.runWithDocumentContext(doc); 
					agent.recycle();
					deleteDoc.recycle();
				}else{
					print("can't find a document for: " + docIDArray[i]);
				}
			}
				
			doc.removeItem("thisunid");
			doc.removeItem("deleteunid");
			doc.removeItem("xPages");
			doc.recycle();
			
			// Look up Application UNID using the ApplicationID number;
			var appID = source.getItemValueString("ApplicationID");
			if (appID != "") {
				var appUNID = @DbLookup(@DbName(), "$ApplicationHeaders", appID, 2);
				if (appUNID != "") {
					if (database != null && database.isOpen()) {
						var appDoc:NotesDocument = database.getDocumentByUNID(appUNID);
						if (appDoc != null) {
							// Sets the Audit Tracking fields in the Application Document
							appDoc.replaceItemValue("ApplicationStatus", "Draft");
							appDoc.replaceItemValue("ValidationStatus", "Failed"); //INC44423 12JUL2013 BL
							appDoc.replaceItemValue("ValidationXML", "<message><success>Reset</success></message>");
							appDoc.replaceItemValue("SubmissionCost", 0);
							appDoc.replaceItemValue("LastEdited", session.createDateTime(@Text(@Now())));
							appDoc.replaceItemValue("LastEditor", session.getEffectiveUserName());
							appDoc.save(true, true);
							appDoc.recycle();
						}
					}
				}
			}
		}else{
			print("BUT nothing was deleted");
		}
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- removeL2SubDocuments() error: " + e);
	} 
}

function removeL3SubDocuments(source){
	try {		  
		var docIDArray;
		
		if(@Length(getComponent("unidstoreL3EOS").getValue()) > 0){
			docIDArray = @Explode(getComponent("unidstoreL3EOS").getValue()); 
		} 
		
		if(@Length(docIDArray) > 0){
			var thisunid = source.getDocument().getUniversalID();
			var doc:NotesDocument = database.getDocumentByUNID(thisunid);
			if (doc == null)
				return;
			
			doc.replaceItemValue("thisunid", thisunid);
			doc.replaceItemValue("xPages", 1);
			
			for(i=0; i < docIDArray.length;i++){ 
				var deleteDoc:NotesDocument = database.getDocumentByUNID(@Trim(docIDArray[i])); 
				 if (deleteDoc) {  
					doc.replaceItemValue("deleteunid", deleteDoc.getUniversalID());
					var agent:NotesAgent = database.getAgent("(DeleteDocument)");
					agent.runWithDocumentContext(doc); 
					agent.recycle();
					deleteDoc.recycle();
				}else{
					print("can't find a document for: " + docIDArray[i]);
				}
			}
					
			doc.removeItem("thisunid");
			doc.removeItem("deleteunid");
			doc.removeItem("xPages");
			doc.recycle();
				
			// Look up Application UNID using the ApplicationID number;
			var appID = source.getItemValueString("ApplicationID");
			if (appID != "") {
				var appUNID = @DbLookup(@DbName(), "$ApplicationHeaders", appID, 2);
				if (appUNID != "") {
					if (database != null && database.isOpen()) {
						var appDoc:NotesDocument = database.getDocumentByUNID(appUNID);
						if (appDoc != null) {
							// Sets the Audit Tracking fields in the Application Document
							appDoc.replaceItemValue("ApplicationStatus", "Draft");
							appDoc.replaceItemValue("ValidationStatus", "Failed"); //INC44423 12JUL2013 BL
							appDoc.replaceItemValue("ValidationXML", "<message><success>Reset</success></message>");
							appDoc.replaceItemValue("SubmissionCost", 0);
							appDoc.replaceItemValue("LastEdited", session.createDateTime(@Text(@Now())));
							appDoc.replaceItemValue("LastEditor", session.getEffectiveUserName());
							appDoc.save(true, true);
							appDoc.recycle();
						}
					}
				}
			}
		}
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- removeL3SubDocuments() error: " + e);
	} 
}

function addSiteDetail() {
	try {
		viewScope.siteUNID = "";
		getComponent("siteDetailDialog").show();
	} catch(e) {
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- addSiteDetail() error: " + e);		
	}
}

function addBiologicalDetail() {
	try {
		viewScope.biologicalUNID = "";
		getComponent("biologicalDetailDialog").show();
	} catch(e) {
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- addBiologicalDetail() error: " + e);		
	}
}


function addBiologicalIngredientDetail() {
	try {
		viewScope.biologicalIngredientUNID = "";
		getComponent("biologicalIngredientDetailDialog").show();
	} catch(e) {
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- addBiologicalIngredientDetail() error: " + e);		
	}
}

function removeSubDocuments(source){
 	try {
		//print ("remove sub document");
	 	var docIDArray;
	 	
		if(@Length(getComponent("unidstoreEOS").getValue()) > 0){
			docIDArray = @Explode(getComponent("unidstoreEOS").getValue()); 
 		}
		
		if(@Length(docIDArray) > 0){
			var thisunid = source.getDocument().getUniversalID();
			var doc:NotesDocument = database.getDocumentByUNID(thisunid);
			if (doc == null)
				return;
		
			doc.replaceItemValue("thisunid", thisunid);
			doc.replaceItemValue("xPages", 1);
			
			for(i=0; i < docIDArray.length;i++){
				var deleteDoc:NotesDocument = database.getDocumentByUNID(@Trim(docIDArray[i]));
				 if (deleteDoc) {
					doc.replaceItemValue("deleteunid", deleteDoc.getUniversalID());
					var agent:NotesAgent = database.getAgent("(DeleteDocument)");
					agent.runWithDocumentContext(doc);
					agent.recycle();
					deleteDoc.recycle();
				}else{
					print("can't find a document for: " + docIDArray[i]);
				}
			}
				
			doc.removeItem("thisunid");
			doc.removeItem("deleteunid");
			doc.removeItem("xPages");
			doc.recycle();
			
			// Look up Application UNID using the ApplicationID number;
			var appID = source.getItemValueString("ApplicationID");
			if (appID != "") {
				var appUNID = @DbLookup(@DbName(), "$ApplicationHeaders", appID, 2);
				if (appUNID != "") {
					if (database != null && database.isOpen()) {
						var appDoc:NotesDocument = database.getDocumentByUNID(appUNID);
						if (appDoc != null) {
							// Sets the Audit Tracking fields in the Application Document
							appDoc.replaceItemValue("ApplicationStatus", "Draft");
							appDoc.replaceItemValue("ValidationStatus", "Failed"); //INC44423 12JUL2013 BL
							appDoc.replaceItemValue("ValidationXML", "<message><success>Reset</success></message>");
							appDoc.replaceItemValue("SubmissionCost", 0);
							appDoc.replaceItemValue("LastEdited", session.createDateTime(@Text(@Now())));
							appDoc.replaceItemValue("LastEditor", session.getEffectiveUserName());
							appDoc.save(true, true);
							appDoc.recycle();
						}
					}
				}
			}
		}
	}catch(e){
		print(database.getTitle() + ": " + @Right(view.getPageName(), "/") + "- removeSubDocuments() error: " + e);
	} 
}

function saveApp(source, source2, postRedirectAction){
	// Notification Application
	try {
		var scriptElement = "saveApp";
		
		@SetField("ApplicationStatus","Draft");
		@SetField("ValidationStatus","Failed");
		@SetField("ApplicationFees",0);
		@SetField("LastEdited", @Now());
		@SetField("LastEditor", sessionScope.username);

		var spid = getComponent("SponsorID").getValue();
		var clid = getComponent("cfdClientID").getValue();
		if(spid == ""){
			source.replaceItemValue("ClientType","Sponsor");
		}else if(clid == spid){
			source.replaceItemValue("ClientType","Sponsor");
		}else{
			source.replaceItemValue("ClientType","Agent");
		}
		
		var doc:NotesDocument = source.getDocument(true);
		var doc2:NotesDocument = source2.getDocument(true)
		var authorField = "webAuthors";
		var readerField = "webReaders";
		setupAuthorReaderFields(doc, authorField, readerField);
		setupAuthorReaderFields(doc2, authorField, readerField);
		if(!doc.isNewNote()) {
			if (!doc.hasItem("RecordUNID")){
				doc.replaceItemValue("RecordUNID", doc.getUniversalID());
			}
			if (!doc2.hasItem("RecordUNID")){
				doc2.replaceItemValue("RecordUNID", doc2.getUniversalID());
			}
			doc.save(true, true);
			doc2.save(true,true)
			doc.recycle();
			doc2.recycle();
			return true;
		}
		
		var action = context.getUrlParameter("action");
		
		if (action == "") {
			return false
		};
		
		if (action == "newDocument") {
			var agent:NotesAgent = database.getAgent("updateapplicationidxpages");
			agent.runWithDocumentContext(doc);
			agent.recycle();
			doc.replaceItemValue("ExplicitKey", doc.getItemValueString("ApplicationId") + "~" + doc.getItemValueString("ApplicationVersion"))
			doc.replaceItemValue("ApplicationStatus", "Draft");
			doc.replaceItemValue("ValidationStatus", "");
			doc.replaceItemValue("RecordUNID", doc.getUniversalID());
			doc.save(true, true);
			
			var doc2:NotesDocument = source2.getDocument(true)
			doc2.replaceItemValue("ApplicationId", doc.getItemValueString("ApplicationId"));
			doc2.replaceItemValue("ApplicationVersion", doc.getItemValueString("ApplicationVersion"));
			doc2.replaceItemValue("ExplicitKey", doc.getItemValueString("ApplicationId") + "~" + doc.getItemValueString("ApplicationVersion") + "~Part1");
			doc2.replaceItemValue("RecordUNID", doc2.getUniversalID());
			doc2.replaceItemValue("ClinicalTrialType", doc.getItemValueString("ClinicalTrialType"));
			doc2.replaceItemValue("Type", "Part1");
			doc2.replaceItemValue("WebAuthors", doc.getItemValue("WebAuthors"));
			doc2.replaceItemValue("WebReaders", doc.getItemValue("WebReaders"));
			setupAuthorReaderFields(doc2, authorField, readerField);
			
			doc2.save(true, true)
			
			var url1 = @Left(context.getUrl(), "?");
			sUNID = doc.getUniversalID();
			pUNID = doc2.getUniversalID();
			var params = "?appdocumentId=" + sUNID + "&partonedocumentId=" + pUNID + "&action=editDocument";
			var fullurl = url1 + params;

			if (postRedirectAction != null) {
				// Function to call after redirect has completed
				sessionScope.put("postRedirectAction", postRedirectAction);
			}
			
			doc.recycle();
			doc2.recycle();
			context.redirectToPage(fullurl);
		}
		
		return true;
	} catch(e) {
		print(database.getTitle() + ": " + scriptElement + " - " + @Right(view.getPageName(), "/") + " error: " + e);
		return false;
	} finally {
		
	}
}

function savePartOne(source){
	// Part1 document save
	try {
		var scriptElement = "savePartOne";

		@SetField("LastEdited", @Now());
		@SetField("LastEditor", sessionScope.username);
		
		var doc:NotesDocument = source.getDocument(true);
		var authorField = "webAuthors";
		var readerField = "webReaders";
		setupAuthorReaderFields(doc, authorField, readerField);
		doc.replaceItemValue("RecordUNID", doc.getUniversalID());
		doc.replaceItemValue("ExplicitKey", doc.getItemValueString("ApplicationId") + "~" + doc.getItemValueString("ApplicationVersion") + "~Part1");
		doc.save(true, true);
		doc.recycle();
		
		return true;
	} catch(e) {
		print(database.getTitle() + ": " + scriptElement + " - " + @Right(view.getPageName(), "/") + " error: " + e);
		return false;
	} finally {
		
	}
}

function saveBiological(source){
	try{
		var scriptElement = "saveBiological";

		@SetField("LastEdited", @Now());
		@SetField("LastEditor", sessionScope.username);
		
		var doc:NotesDocument = source.getDocument(true);
		var authorField = "webAuthors";
		var readerField = "webReaders";
		setupAuthorReaderFields(doc, authorField, readerField);
		doc.replaceItemValue("ApplicationId", viewScope.applicationid);
		doc.replaceItemValue("ApplicationVersion", viewScope.applicationversion);
		doc.replaceItemValue("RecordUNID", doc.getUniversalID());
		doc.replaceItemValue("ExplicitKey", doc.getItemValueString("ApplicationId") + "~" + doc.getItemValueString("ApplicationVersion") + "~Part1~Biological~" + doc.getUniversalID());
		doc.save(true, true);
		doc.recycle();
		
		return true;
	}catch(e){
		print(database.getTitle() + ": " + scriptElement + " - " + @Right(view.getPageName(), "/") + " error: " + e);
		return false;
	}finally{
		
	}
}

function saveBiologicalIngredient(source){
	try{
		//source is the biologicalingredient data source, and
		var scriptElement = "saveBiologicalIngredient";

		@SetField("LastEdited", @Now());
		@SetField("LastEditor", sessionScope.username);
		
		var doc:NotesDocument = source.getDocument(true);
		var authorField = "webAuthors";
		var readerField = "webReaders";
		setupAuthorReaderFields(doc, authorField, readerField);
		doc.replaceItemValue("ApplicationId", viewScope.applicationid);
		doc.replaceItemValue("ApplicationVersion", viewScope.applicationversion);
		doc.replaceItemValue("RecordUNID", doc.getUniversalID());
		doc.replaceItemValue("ExplicitKey", viewScope.applicationid + "~" + viewScope.applicationversion + "~Part1~Biological~" + viewScope.biologicalUNID + "~BiologicalIngredient~" + doc.getUniversalID());
		doc.replaceItemValue("ParentExplicitKey", viewScope.parentexplicitkey);
		doc.save(true, true);
		doc.recycle();
		
		return true;
	}catch(e){
		print(database.getTitle() + ": " + scriptElement + " - " + @Right(view.getPageName(), "/") + " error: " + e);
		return false;
	}finally{
		
	}
}

function saveSite(source){
	try{
		var scriptElement = "saveSite";

		@SetField("LastEdited", @Now());
		@SetField("LastEditor", sessionScope.username);
		
		var doc:NotesDocument = source.getDocument(true);
		var authorField = "webAuthors";
		var readerField = "webReaders";
		setupAuthorReaderFields(doc, authorField, readerField);
		doc.replaceItemValue("ApplicationId", viewScope.applicationid);
		doc.replaceItemValue("ApplicationVersion", viewScope.applicationversion);
		doc.replaceItemValue("RecordUNID", doc.getUniversalID());
		doc.replaceItemValue("ExplicitKey", doc.getItemValueString("ApplicationId") + "~" + doc.getItemValueString("ApplicationVersion") + "~Part1~Site~" + doc.getUniversalID());
		doc.save(true, true);
		doc.recycle();
		
		return true;
	}catch(e){
		print(database.getTitle() + ": " + scriptElement + " - " + @Right(view.getPageName(), "/") + " error: " + e);
		return false;
	}finally{
		
	}
}