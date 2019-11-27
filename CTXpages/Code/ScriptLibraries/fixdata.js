// Created by WP - 20022015

function fCheckUpdateDetailsTrialClassifications() {
	// Problem: That UpdateDetails can not check for existing Entries of any
	// Trial Classification which does exist in Part1.
	// only for UpdateDetails - ApplicationStage = 4/5
	// Purpose to check whether the UpdateDetails has the same Trial
	// Classification wiht Part1,
	// If yes, then check whether those Trial Classifications has an Entry, if
	// not generate field for each that doesn't have an entry
	var appStage = storeApplicationData.items.ApplicationStage;
	if ((appStage == "4") || (appStage == "5")) {
		var part1TC = storeApplicationData.items.Part1.TrialClassification;
		var udTC = storeApplicationData.items.UpdateDetails.TrialClassification;
		if (udTC && udTC != undefined && udTC != null) {
			var sFieldName = "", x = 0, y = 0;
			storeApplicationData.items.UpdateDetails.changeInUpdateDetailsTC = [];
			if ((udTC.length > 0) && (part1TC.length > 0)) {
				for (x = 0; x < udTC.length; x++) {
					if (part1TC.indexOf(udTC[x]) > 0) {
						sFieldName = "";
						switch (udTC[x]) {
						case "0":
							if (storeApplicationData.items.UpdateDetails.Biologicals.items.length == 0)
								sFieldName = "Biologicals";
							break;
						case "1":
							if (storeApplicationData.items.UpdateDetails.Medicines.items.length == 0)
								sFieldName = "Medicines";
							break;
						case "2":
							if (storeApplicationData.items.UpdateDetails.Devices.items.length == 0)
								sFieldName = "Devices";
							break;
						case "2A":
							if (storeApplicationData.items.UpdateDetails.Devices.items.length == 0)
								sFieldName = "Devices";
							break;
						case "3":
							if (storeApplicationData.items.UpdateDetails.AnimalExcepients.items.length == 0)
								sFieldName = "AnimalExcepients";
							break;
						case "4":
							if (storeApplicationData.items.UpdateDetails.TrialConductedInCountries.items.length == 0)
								sFieldName = "TrialConductedInCountries";
							break;
						case "6":
							if (storeApplicationData.items.UpdateDetails.Placebos.items.length == 0)
								sFieldName = "Placebos";
							break;
						}
						if (sFieldName != "")
							storeApplicationData.items.UpdateDetails.changeInUpdateDetailsTC
									.push(sFieldName);
					}
				}
			}
		}
	}
}

// Fixing every item in Medicines, Biologicals, Placebos etc
// TSK 61861 - Fix current bugs - WP
function fixThisNode(jsNode, jsName, parentKey, hasItem, appStage) {
	var nodeId, idUNID = '', tmpPos;
	var ingId, oldKey, newKey, posKey;
	// jsNode.ApplicationId = parentKey.ApplicationId;  // WP-14042015
	if ((jsNode != null) && (jsNode != undefined)) {
		oldKey = jsNode.ApplicationId + "~" + jsNode.ApplicationVersion;
		jsNode.ApplicationVersion = parentKey.ApplicationVersion;
		jsNode.ApplicationStage = appStage;
		jsNode.ApplicationId = parentKey.ApplicationId;
		newKey = jsNode.ApplicationId + "~" + jsNode.ApplicationVersion;
		jsNode.id = parentKey.id + "~" + jsName;
		if ((jsNode.Key != null) && (jsNode.Key != undefined)) {
			jsNode.Key.ApplicationVersion = jsNode.ApplicationVersion;
			if ((parentKey.DataSection != undefined)
					&& (parentKey.DataSection != null))
				jsNode.Key.DataSection = parentKey.DataSection;
			jsNode.Key.ApplicationId = jsNode.ApplicationId;
			jsNode.Key.id = jsNode.id;
		}

		if (hasItem) { // Fixing every item in Medicines, Biologicals, Placebos
						// items only etc
			if (jsNode.items.length > 0) {
				for (x = 0; x < jsNode.items.length; x++) {
					if ((jsNode.items[x]) != undefined) {

						jsNode.items[x].ApplicationVersion = jsNode.ApplicationVersion;
						jsNode.items[x].ApplicationId = jsNode.ApplicationId;
						
						if (jsName == "MedicineIngredients") {
							ingId = jsNode.items[x].medicineId[0];
							posKey = jsNode.id.indexOf("UpdateDetails");
							if (posKey != -1) {
								posKey = ingId.indexOf("Part1");
								if (posKey != -1)
									ingId = newKey + "~UpdateDetails"
											+ ingId.substring(posKey + 5);
							} else {
								posKey = ingId.indexOf("Part1");
								if (posKey != -1)
									ingId = newKey + "~Part1"
											+ ingId.substring(posKey + 5);
							}
							jsNode.items[x].medicineId[0] = ingId;
						}
						if (jsName == "BiologicalIngredients") {
							ingId = jsNode.items[x].biologicalId[0];
							posKey = jsNode.id.indexOf("UpdateDetails");
							if (posKey != -1) {
								posKey = ingId.indexOf("Part1");
								if (posKey != -1)
									ingId = newKey + "~UpdateDetails"
											+ ingId.substring(posKey + 5);
							} else {
								posKey = ingId.indexOf("Part1");
								if (posKey != -1)
									ingId = newKey + "~Part1"
											+ ingId.substring(posKey + 5);
							}
							jsNode.items[x].biologicalId[0] = ingId;
						}

						nodeId = jsNode.items[x].id[0];
						// jsNode.items[x].ApplicationStage = appStage;
						if ((parentKey.DataSection != undefined)
								&& (parentKey.DataSection != null))
							jsNode.items[x].DataSection = parentKey.DataSection;

						if ((nodeId != null) && (nodeId != undefined)) {
							tmpPos = nodeId.indexOf(jsName);
							if (tmpPos > 0) {
								idUNID = nodeId.substring(tmpPos
										+ jsName.length + 1);
							}
							jsNode.items[x].id[0] = jsNode.id + "~" + idUNID;
							jsNode.items[x].RecordUNID[0] = jsNode.id + "~"
									+ idUNID;
						}
					}
				}
			}
		}
	}
}

// This function will fix all RecordUNID, ApplicationVersion and Id both in the
// Key or the root of every node
// This happens when user create a New Version by editing, vary or next staging
// the existing application from CT Repository.
// We can't use lotusscript in those agents, bit harder than javascript.
// This will guarantee that every node in the storeApplicationData.items will
// have the same version and key ids
// Otherwise for any version more than 1, will have the section and children old
// application version, id and RecordUNID.
// This will caused an error when saving.
// RecordUNID will be used many for Views in Part1, Part2 and UpdateDetails for
// indent spaces

function fixVersionIdInNodes() {

	fCheckUpdateDetailsTrialClassifications();

	var tmpKey, tmpRootId;
	var appVer = storeApplicationData.items.ApplicationVersion;
	var appStage = storeApplicationData.items.ApplicationStage;
	var oldAppId = storeApplicationData.items.Key.ApplicationId;
	var appID = storeApplicationData.items.ApplicationId;
	var isClean = false;
	if (storeApplicationData.items.isClean) 
		isClean = true;
	var res;
	if (appVer != storeApplicationData.items.Key.ApplicationVersion) {
		storeApplicationData.items.Key.ApplicationVersion = appVer;
		storeApplicationData.items.Key.id = storeApplicationData.items.RecordUNID;
	}
	storeApplicationData.items.Key.ApplicationId = appID; 
	if (storeApplicationData.items.Key.id.indexOf(oldAppId) != -1) 
		storeApplicationData.items.Key.id = storeApplicationData.items.Key.id.replace(oldAppId, appID);
	tmpRootId = storeApplicationData.items.Key.id;

	// ***** Fix Part1 Section *******
	if (isClean) storeApplicationData.items.Part1.isClean = storeApplicationData.items.isClean;
	storeApplicationData.items.Part1.ApplicationId = appID;
	storeApplicationData.items.Part1.ApplicationVersion = appVer;
	storeApplicationData.items.Part1.ApplicationStage = appStage;
	storeApplicationData.items.Part1.id = tmpRootId + "~Part1";
	storeApplicationData.items.Part1.RecordUNID = storeApplicationData.items.Part1.id;
	tmpKey = storeApplicationData.items.Part1.Key;
	tmpKey.ApplicationVersion = appVer;
	tmpKey.ApplicationId = appID;
	tmpKey.id = storeApplicationData.items.Part1.id;
	if (tmpKey.id.indexOf(oldAppId) != -1) res = tmpKey.id.replace(oldAppId, appID);

	fixThisNode(storeApplicationData.items.Part1.AnimalExcipients,
			"AnimalExcipients", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.Part1.Biologicals, "Biologicals",
			tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.Part1.Medicines, "Medicines",
			tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.Part1.Devices, "Devices", tmpKey,
			true, appStage);
	fixThisNode(storeApplicationData.items.Part1.Placebos, "Placebos", tmpKey,
			true, appStage);
	// fixThisNode(storeApplicationData.items.Part1.Comparators, "Comparators",
	// tmpKey, true);
	fixThisNode(storeApplicationData.items.Part1.Sites, "Sites", tmpKey, true,
			appStage);
	fixThisNode(storeApplicationData.items.Part1.TrialConductedInCountries,
			"TrialConductedInCountries", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.Part1.MedicineIngredients,
			"MedicineIngredients", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.Part1.BiologicalIngredients,
			"BiologicalIngredients", tmpKey, true, appStage);

	// ***** Fix Part2 Section *****
	if (isClean) storeApplicationData.items.Part2.isClean = storeApplicationData.items.isClean;
	storeApplicationData.items.Part2.ApplicationId = appID;
	storeApplicationData.items.Part2.ApplicationVersion = appVer;
	storeApplicationData.items.Part2.ApplicationId = appID;
	storeApplicationData.items.Part2.id = tmpRootId + "~Part2";
	storeApplicationData.items.Part2.RecordUNID = storeApplicationData.items.Part2.id;
	tmpKey = storeApplicationData.items.Part2.Key;
	tmpKey.ApplicationVersion = appVer;
	tmpKey.ApplicationId = appID;
	tmpKey.id = storeApplicationData.items.Part2.id;
	if (tmpKey.id.indexOf(oldAppId) != -1) res = tmpKey.id.replace(oldAppId, appID);

	fixThisNode(storeApplicationData.items.Part2.Placebos, "Placebos", tmpKey,
			true, appStage);
	// fixThisNode(storeApplicationData.items.Part2.Comparators, "Comparators",
	// tmpKey, true);
	fixThisNode(storeApplicationData.items.Part2.Sites, "Sites", tmpKey, true,
			appStage);

	// ***** Fix UpdateDetails *****
	if (isClean) storeApplicationData.items.UpdateDetails.isClean = storeApplicationData.items.isClean;
	storeApplicationData.items.UpdateDetails.ApplicationId = appID;
	storeApplicationData.items.UpdateDetails.ApplicationVersion = appVer;
	storeApplicationData.items.UpdateDetails.ApplicationStage = appStage;
	storeApplicationData.items.UpdateDetails.id = tmpRootId + "~UpdateDetails";
	storeApplicationData.items.UpdateDetails.RecordUNID = storeApplicationData.items.UpdateDetails.id;
	tmpKey = storeApplicationData.items.UpdateDetails.Key;
	tmpKey.ApplicationVersion = appVer;
	tmpKey.ApplicationId = appID;
	tmpKey.id = storeApplicationData.items.UpdateDetails.id;
	if (tmpKey.id.indexOf(oldAppId) != -1) res = tmpKey.id.replace(oldAppId, appID);

	fixThisNode(storeApplicationData.items.UpdateDetails.AnimalExcipients,
			"AnimalExcipients", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.Biologicals,
			"Biologicals", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.Medicines,
			"Medicines", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.Devices, "Devices",
			tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.Placebos, "Placebos",
			tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.Sites, "Sites",
			tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.MedicineIngredients,
			"MedicineIngredients", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.BiologicalIngredients,
			"BiologicalIngredients", tmpKey, true, appStage);
	fixThisNode(storeApplicationData.items.UpdateDetails.TrialConductedInCountries,
			"TrialConductedInCountries", tmpKey, true, appStage);

	// ***** Fix AuditLog, Completion, ValidationLog *****
	fixThisNode(storeApplicationData.items.AuditLog, "AuditLog",
			storeApplicationData.items.Key, false, appStage);
	fixThisNode(storeApplicationData.items.Completion, "Completion",
			storeApplicationData.items.Key, false, appStage);
	fixThisNode(storeApplicationData.items.ValidationLog, "ValidationLog",
			storeApplicationData.items.Key, false, appStage);

	return;
}

function fixVariationIngredientIds(){ //TSK72076 BL 23DEC2015
	//fix to correct the medicineid and biologicalid data of the medicineingredients and biologicalingredients
	//json data when a ct variation is performed beyond version 1
	var id = '';
	var id_end = '';
	var medid = '';
	var medid_end = '';
	var bioid = '';
	var bioid_end = '';
	var n;
	//only for version 2 or higher variations because its not a problem for version 1
	if(parseInt(storeApplicationData.items.ApplicationVersion) >= 2){
		//fix Part1 MedicineIngredients
		for(i=0; i < storeApplicationData.items.Part1.Medicines.items.length; i++){
			id = storeApplicationData.items.Part1.Medicines.items[i].id[0];
			id_end = id.substring(id.lastIndexOf('~')+1);
			for(k=0; k < storeApplicationData.items.Part1.MedicineIngredients.items.length; k++){
				medid = storeApplicationData.items.Part1.MedicineIngredients.items[k].medicineId[0];
				medid_end = medid.substring(medid.lastIndexOf('~')+1);
				n = medid_end.localeCompare(id_end);
				if(n == 0){
					storeApplicationData.items.Part1.MedicineIngredients.items[k].medicineId[0] = storeApplicationData.items.Part1.Medicines.items[i].id[0];
				}
			}
		}
		
		//fix Part1 BiologicalIngredients
		for(i=0; i < storeApplicationData.items.Part1.Biologicals.items.length; i++){
			id = storeApplicationData.items.Part1.Biologicals.items[i].id[0];
			id_end = id.substring(id.lastIndexOf('~')+1);
			for(k=0; k < storeApplicationData.items.Part1.BiologicalIngredients.items.length; k++){
				bioid = storeApplicationData.items.Part1.BiologicalIngredients.items[k].biologicalId[0];
				bioid_end = bioid.substring(bioid.lastIndexOf('~')+1);
				n = bioid_end.localeCompare(id_end);
				if(n == 0){
					storeApplicationData.items.Part1.BiologicalIngredients.items[k].biologicalId[0] = storeApplicationData.items.Part1.Biologicals.items[i].id[0];
				}
			}
		}
		
		//fix UpdateDetails MedicineIngredients
		for(i=0; i < storeApplicationData.items.UpdateDetails.Medicines.items.length; i++){
			id = storeApplicationData.items.UpdateDetails.Medicines.items[i].id[0];
			id_end = id.substring(id.lastIndexOf('~')+1);
			for(k=0; k < storeApplicationData.items.UpdateDetails.MedicineIngredients.items.length; k++){
				medid = storeApplicationData.items.UpdateDetails.MedicineIngredients.items[k].medicineId[0];
				medid_end = medid.substring(medid.lastIndexOf('~')+1);
				n = medid_end.localeCompare(id_end);
				if(n == 0){
					storeApplicationData.items.UpdateDetails.MedicineIngredients.items[k].medicineId[0] = storeApplicationData.items.UpdateDetails.Medicines.items[i].id[0];
				}
			}
		}
		
		//fix UpdateDetails BiologicalIngredients
		for(i=0; i < storeApplicationData.items.UpdateDetails.Biologicals.items.length; i++){
			id = storeApplicationData.items.UpdateDetails.Biologicals.items[i].id[0];
			id_end = id.substring(id.lastIndexOf('~')+1);
			for(k=0; k < storeApplicationData.items.UpdateDetails.BiologicalIngredients.items.length; k++){
				bioid = storeApplicationData.items.UpdateDetails.BiologicalIngredients.items[k].biologicalId[0];
				bioid_end = bioid.substring(bioid.lastIndexOf('~')+1);
				n = bioid_end.localeCompare(id_end);
				if(n == 0){
					storeApplicationData.items.UpdateDetails.BiologicalIngredients.items[k].biologicalId[0] = storeApplicationData.items.UpdateDetails.Biologicals.items[i].id[0];
				}
			}
		}
	}
	
	return;
}