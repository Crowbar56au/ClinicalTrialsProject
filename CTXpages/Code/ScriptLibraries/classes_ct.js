// WP - May 2015 - Just for description to make sure that
// Every child has an EntryKey which is unique and it is similar like id, but never change
// id is always changing depending on version number, so to match data between Part1 and UpdateDetails, we are using an EntryKey field.

var itemApplication = function(uniqueKey) {
	this.Type = 'Application';
	this.Form = this.Type;
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.' + name + '="' + uniqueKey[name] + '";'); } } }

	this.ApplicationId = uniqueKey.ApplicationId;
	this.ApplicationVersion = '1';
	if (uniqueKey) {
		if (uniqueKey.ApplicationVersion.toString() == '') {
			uniqueKey.ApplicationVersion = '1';
		}
		this.ApplicationVersion = uniqueKey.ApplicationVersion.toString();
	}

	this.id = this.ApplicationId + "~" + this.ApplicationVersion.toString();
	this.RecordUNID = this.id;
	this.Key.id = this.id;
	
	if (this.ApplicationId.indexOf("CTX") > 0){
		this.ClinicalTrialType = 'CTX';
	}else{
		this.ClinicalTrialType = 'CTN';
	}
	this.IsActiveVersion = "1";
	this.ApplicantName = '';
	this.ApplicationStage='';
	this.ApplicationStageCode='';
	this.ApplicationStatus='Draft';
	this.ApplicationStatusCode='DRAFT';
	this.AuditLog = new itemAuditLog(this.Key);
	this.ChangeReport = '';
	this.Completion = new itemCompletion(this.Key);
	this.CreatedBy = '';
	this.CreatedOn = '';
	this.ErrorReport = '';
	this.InvoiceDate='';
	this.InvoiceNumber='';
	this.IsExportedToGP='';
	this.IsPaymentReceived='';
	this.IsReceiptImportedFromGP='';
	this.IsSubmitted='';
	this.IsValidated = '0';
	this.IsWorkMgmtEntryCreatedCompletion='';
	this.LastEdited = '';
	this.LastEditor = '';
	this.Part1 = new itemPart1(this.Key);
	this.Part2 = new itemPart2(this.Key);
	this.PaymentReceiptDate='';
	this.PaymentReceiptNumber='';
	this.PaymentExemption='0';
	this.PaymentExemptionNo='';
	this.SponsorAddress = '';
	this.SponsorAddress_Id = '';
	this.SponsorID = '';
	this.SponsorName = '';
	this.SubmissionDate='';
	this.SubmissionId='';
	this.TitleOfStudy='';
	this.UpdateDetails = new itemUpdateDetails(this.Key);
	this.ValidationLog = new itemValidationLog(this.Key);
	this.ValidationStatus = '0';
	this.WorkMgmtEntryCreateDateCompletion='';
	this.WorkMgmtProcessIdCompletion='';
	this.WMID_Review = '';
	this.WMID_Application = '';
	this.IsPushBackTriggered = '0';
	this.IsPushBackSubmittedBack = '0';
	this.PushBackTriggerDates = [ ];
	this.PushBackSubmittedBackDates = [ ];
	this.VariationNonFeeList = [ ];

	return (this);
};
var itemAuditLog = function(uniqueKey) {
	this.label= "AuditMessage";
	this.items = new Array();
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.' + name + ' = this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	this.Key.id = this.id;
	return(this);
};
var itemAuditLogEntry = function(uniqueKey) {
	this.AuditMessage = "";
	this.AuditStamp = "";
	this.AuditUser = "";
	this.IpAddress = "0.0.0.0";
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	return(this);
};
var itemValidationLog = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.label= "Message";
	this.items = new Array();
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.' + name + ' = this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	this.Key.id = this.id;
	return(this);
};
var itemValidationLogEntry = function(uniqueKey) {
	this.Message = "";
	this.tobefinished = "";
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	return(this);
};
var itemAttachments = function(uniqueKey) {
	this.identifier= "AttachmentId";
	this.label= "AttachmentFileName";
	this.items = new Array();
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.' + name + ' = this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	this.Key.id = this.id;
	return(this);
};
var itemAttachment = function(uniqueKey) {
	AttachmentId='';
	AttachmentFileName='';
	AttachmentClassification='';
	AttachmentTitle='';
	AttachmentAuthor='';
	AttachmentDescription='';
	AttachmentContext='';
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.' + name + ' = this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
}
var itemPart1 = function(uniqueKey) {
	this.Type = 'Part1';
	this.Form = this.Type;
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+'=this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	this.RecordUNID = this.id;
	this.DataSection = '1';
	this.Key.id = this.id;
	this.Key.DataSection = this.DataSection;

	this.SponsorAttachment = '';
	this.SponsorAttachment_Label = '';
	this.BiologicalProductDescription='';
	this.BiologicalNotInPhaseOne = '';
	this.BiologicalManufacturerDetails='';
	this.ContactEmail='';
	this.ContactName='';
	this.ContactPhone='';
	this.ExpectedCompletionDate='';
	this.IsPotentialRestrictedGoodUsed='';
	this.DataDetails = '';
	this.ProtocolNumber='';
	this.TotalPatients='';
	this.TitleOfStudy='';
	this.TrialTherapeuticArea='';
	this.StartDate='';
	this.TrialTypeDescription='';
	this.GMO = '';
	this.Nanoparticles = '';
	this.GeneTherapyDetails='';
	this.IsWorkMgmtEntryCreated='';
	this.WorkMgmtEntryCreateDate='';
	this.WorkMgmtProcessId='';
	
	this.TrialClassification=new Array();
	this.PrecedingTrials=new Array();
	this.TrialType=new Array();
	this.TrialType_Label='';
	
	this.AnimalExcipients = new itemAnimalExcipients(this.Key);
	this.Biologicals = new itemBiologicals(this.Key);
	this.Medicines = new itemMedicines(this.Key);
	this.Devices = new itemDevices(this.Key);
	this.Placebos = new itemPlacebos(this.Key);
	this.Sites = new itemSites(this.Key);
	this.TrialConductedInCountries = new itemTrialConductedInCountries(this.Key);
	this.MedicineIngredients = new itemMedicineIngredients(this.Key);
	this.BiologicalIngredients = new itemBiologicalIngredients(this.Key);
};

var itemTrialConductedInCountries = function(uniqueKey){
	this.identifier= "id";
	this.id='';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey.id+"~TrialConductedInCountries";
	this.Key.id = this.id;
	this.items = new Array();
	return(this);
}

var itemTrialConductedInCountry = function(uniqueKey){
	this.identifier= "RecordUNID";
	this.label= "TrialConductedInCountry_Label";
	this.Type = 'TrialConductedInCountry';
	this.Form = this.Type;
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	this.TrialConductedInCountry = '';
	this.TrialConductedInCountry_Label = '';
}

var itemAnimalExcipients = function(uniqueKey) {
	this.identifier= "id";
	this.id='';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey.id+"~AnimalExcipients";
	this.Key.id = this.id;
	this.items = new Array();
	return(this);
};
var itemAnimalExcipient = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.label= "ProductName";
	this.Type = 'AnimalExcipient';
	this.Form = this.Type;
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	
	this.AnimalOrigin='';
	this.AnimalOrigin_Label='';
	this.AnimalPart='';
	this.AnimalPart_Label='';
	this.AnimalPreparation='';
	this.AnimalPreparation_Label='';
	this.Country='';
	this.Country_Label='';
	this.ProductName='';
};
var itemBiologicals = function(uniqueKey) {
	this.identifier= "id";
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey['id'];
	this.id = this.id+"~Biologicals";
	this.Key.id = this.id;
	this.items = new Array();
	this.LastEntryKey='0';
	return(this);
};

var itemBiological = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.label= "ProductName";
	this.Type = 'Biological';
	this.Form = this.Type;
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	this.Key.id = this.id;
	
	this.Presentation='';
	this.IsAComboProduct='';
	this.DosageForm_Label='';
	this.DosageForm='';
	this.LabelName='';
	this.ProductName='';
	this.RouteOfAdmin='';
	this.RouteOfAdmin_Label='';
};

var itemBiologicalIngredients = function(uniqueKey) {
	this.identifier= "id";
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey.id +"~BiologicalIngredients";
	this.Key.id = this.id;
	this.items = new Array();
	this.LastEntryKey='0';
	return(this);
};

var itemBiologicalIngredient = function(uniqueKey, medId) {
	this.identifier= "RecordUNID";
	this.label= "Name";
	this.Type='BiologicalIngredient';
	this.Form = this.Type;
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	
	this.IsAComboProduct='';
	this.CountryList=new Array();
	this.CountryList_Label=new Array();
	this.biologicalId=medId;
	this.Name='';
	this.Quantity='';
	this.Unit='';
};

var itemMedicines = function(uniqueKey) {
	this.identifier= "id";
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey.id+"~Medicines";
	this.Key.id = this.id;
	this.items = new Array();
	this.LastEntryKey='0';
	return(this);
};

var itemMedicine = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.label= "ActiveName";
	this.Type='Medicine';
	this.Form = this.Type;
	this.Key = {};
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	this.Key.id = this.id;
	
	this.IsAComboProduct='';
	this.DosageForm='';
	this.DosageForm_Label='';
	this.TradeCodeName='';
	this.RouteOfAdmin='';
	this.RouteOfAdmin_Label='';
	this.Presentation='';
	this.Indication='';
	this.DosageFrequency='';
	this.IntendedUse='';
	this.IntendedUse_Label='';
	this.MedicineNotInPhaseOne = '';
	this.MedicineManufacturerDetails='';
};

var itemMedicineIngredients = function(uniqueKey) {
	this.identifier= "id";
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey.id +"~MedicineIngredients";
	this.Key.id = this.id;
	this.items = new Array();
	this.LastEntryKey='0';
	return(this);
};

var itemMedicineIngredient = function(uniqueKey, medId) {
	this.identifier= "RecordUNID";
	this.label= "Name";
	this.Type='MedicineIngredient';
	this.Form = this.Type;
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	
	this.medicineId=medId;
	this.Name='';
	this.Quantity='';
	this.Unit='';
};
var itemPlacebos = function(uniqueKey) {
	this.identifier= "id";
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey.id+"~Placebos";
	this.Key.id = this.id;
	this.items = new Array();
	this.LastEntryKey='0';
	return(this);
};
var itemPlacebo = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.label= "ProductName";
	this.Type='Placebo';
	this.Form = this.Type;
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	
	this.ProductName='';
	this.RouteOfAdmin='';
	this.RouteOfAdmin_Label='';
	this.PlaceboDescription='';
};
var itemDevices = function(uniqueKey) {
	this.identifier= "id";
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+ '="' + uniqueKey[name] + '";'); } } }
	this.id = uniqueKey.id+"~Devices";
	this.Key.id = this.id;
	this.items = new Array();
	this.LastEntryKey='0';
	return(this);
};
var itemDevice = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.label= "ProductName";
	this.Type='Device';
	this.Form = this.Type;
	this.id='';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	
	this.ProductName='';
	this.Manufacturer='';
	this.Manufacturer_Label='';
	this.Description='';
	this.IsAKit='';
	this.IntendedUse='';
	this.IntendedUseOtherDescription='';
	this.GMDNS='';
	this.GMDNS_Label='';
};
var itemPart2 = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.Type = 'Part2';
	this.Form = this.Type;
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+'=this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	this.RecordUNID = this.id;
	this.DataSection = '2';
	this.Key.id = this.id;
	this.Key.DataSection = this.DataSection;
	
	this.EntryKey='';
	this.ContactName='';
	this.ContactPhone='';
	this.ContactEmail='';
	this.StartDate='';
	this.FinishDate='';
	this.NotificationType='';
	this.NotificationType_Label='';
	this.TrialType=new Array();
	this.TrialTypeDescription='';
	this.TitleOfStudy='';
	this.TrialClassification=new Array();
	this.ProtocolNumber='';
	this.GMO = '';
	this.Nanoparticles = '';
	this.Placebos = new itemPlacebos(this.Key);
	this.Sites = new itemSites(this.Key);
};
var itemSites = function(uniqueKey) {
	this.identifier= "id";
	this.label= "TrialSite";
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+'=this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id+"~Sites";
		
	this.Key.id = this.id;
	this.items = new Array();
	this.LastEntryKey='0';
	return(this);
};
var itemSite = function(uniqueKey) {
	this.identifier= "id";
	this.label= "TrialSite";
	this.Type='Site';
	this.Form = this.Type;
	this.id = '';
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.EntryKey = newSequenceNumber().toString();
	this.id = this.id +"~" + this.EntryKey;
	this.RecordUNID = this.id;
	
	this.ExpectedSiteStartDate='';
	this.ApprovingAuthorityName='';
	this.ApprovingAuthorityOfficer='';
	this.ApprovingAuthorityPosition='';
	this.ApprovingAuthorityContactPhone='';
	this.ApprovingAuthorityContactEmail='';
	this.HRECCode='';
	this.HRECName='';
	this.HRECContactOfficer='';
	this.HRECPosition='';
	this.HRECContactPhone='';
	this.HRECContactEmail='';
	this.PrincipalInvestigatorName='';
	this.PrincipalInvestigatorContactPhone='';
	this.PrincipalInvestigatorContactEmail='';
	this.TrialSiteAddress='';
	this.TrialSiteState='';
	this.TrialSite='';
	this.copyHasBeenEdited = false;
};
var itemUpdateDetails = function(uniqueKey) {
	this.identifier= "RecordUNID";
	this.Type = 'UpdateDetails';
	this.Form = this.Type;
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+'=this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	this.RecordUNID = this.id;
	this.DataSection = '3';
	this.Key.id = this.id;
	this.Key.DataSection = this.DataSection;

	this.ChangeApprovalStatus='';
	this.ChangeDateTime='';
	this.ChangeId='';
	this.ChangeInitiatedBy='';
	this.Comments='';
	this.ContactEmail='';
	this.ContactName='';
	this.ContactPhone='';
	this.TrialStartDate='';
	this.TrialFinishDate='';
	this.BiologicalProductDescription='';
	this.BiologicalNotInPhaseOne = '';
	this.BiologicalManufacturerDetails='';
	this.GeneTherapyDetails='';
	this.Nanoparticles='';
	this.GMO='';
	this.IsPotentialRestrictedGoodUsed='';
	this.ProtocolNumber='';
	this.TotalPatients='';
	this.TrialTherapeuticArea='';
	this.TitleOfStudy='';
	this.IsDistinctGood='';
	
	this.TrialClassification=new Array();
	this.PrecedingTrials=new Array();
	this.TrialType=new Array();
	this.TrialType_Label='';
	
	this.Sites = new itemSites(this.Key);
	this.AnimalExcipients = new itemAnimalExcipients(this.Key);
	this.Biologicals = new itemBiologicals(this.Key);
	this.Medicines = new itemMedicines(this.Key);
	this.Devices = new itemDevices(this.Key);
	this.MedicineIngredients = new itemMedicineIngredients(this.Key);
	this.BiologicalIngredients = new itemBiologicalIngredients(this.Key);
	this.TrialConductedInCountries = new itemTrialConductedInCountries(this.Key);
};
var itemCompletion = function(uniqueKey) {
	this.Type = 'Completion';
	this.Form = this.Type;
	this.id = '';
	this.Key = {};
	var name; if (uniqueKey) {for (name in uniqueKey) { if (typeof uniqueKey[name] !== 'function') { eval('this.Key.'+name+'=this.' + name + '="' + uniqueKey[name] + '";'); } } }
	this.id = this.id + "~" + this.Type;
	this.RecordUNID = this.id;
	this.DataSection = '4';
	
	this.CompletionDetails='';
	this.CompletionReason='';
	this.ContactEmail='';
	this.ContactName='';
	this.ContactPhone='';
	this.ContactPosition='';
	this.TrialCompletionDate='';
}