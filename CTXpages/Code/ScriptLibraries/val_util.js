/*	VERSION 1.2.2
	10FEB2015 Bruce Langner - copied from server file copy of val_util.js with the 
	function bioValidationFocus removed as not applicable to Cilnical Trials
	
	29MAY2013 Jeremy Vandersay - In bioValidationFocus added a case stmt for 'PrincipalManufacturer' (TSK-23477)
	17JUL2012 Bruce Langner
	added the bioValidationFocus function. Taken from the bioapp form.
	07DEC2011 Bruce Langner
	fixed bug where hyperlinking did not occur for the Application tab
	added red border to the mandatory field
	28NOV2011 Bruce Langner
	rebuilt function validationFocus to correctly hyperlink to fields in dialog boxes
	20SEP2011 Biologicals Development Team
	the following functions are in the library:
	validationFocus(e) - when double clicking on a row in the
	validation grid, this function attempts to place the focus onto the field
	subject of the particular validation row.
	djgrid_Validation_Fetch_Complete(items, request) - callback function to render the
	validation grid once the validation data is returned.
	djgrid_Validation_Fetch_Error(e, z) - error functionality when the grid fetch fails
*/

function validationFocus(e) {
	if (this.focus.rowIndex >= 0) {
		var ti = this.getItem(this.focus.rowIndex);
		var tabName = '';
		var stage = storeApplicationData.items.ApplicationStage;
		switch(stage){
			case '1':
			case '2':
				tabName = 'Part' + stage;
				break;
			case '3':
				tabName = 'Completion';
				break;
			case '4':
			case '5':
				tabName = 'UpdateDetails';
				break;
		}
		var recunid = '';
		var fieldPrefix = '';
		var biologicalid = '';
		var medicineid= '';
		var biological_item = null;
		var biologicalingredient_item = null;
		var medicine_item = null;
		var medicineingredient_item = null;
		var device_item = null;
		var animalexcipient_item = null;
		var comparator_item = null;
		var placebo_item = null;
		var site_item = null;
		if (ti.Type) {
			switch (ti.Type[0]){
				case 'Application':
					tabName = "Application";
				case 'Part1':
				case 'Part2':
				case 'Completion':
				case 'UpdateDetails':
				case 'Medicine':
				case 'Device':
				case 'AnimalExcipient':
				case 'Biological':
				case 'BiologicalIngredient':
				case 'MedicineIngredient':
					recunid = ti.ElementRef[0];
					switch (ti.Type[0]) {
						case 'Biological':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.Biologicals.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.Biologicals.items[i].RecordUNID[0]){
										biological_item = storeApplicationData.items.Part1.Biologicals.items[i];
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.Biologicals.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.Biologicals.items[i].RecordUNID[0]){
										biological_item = storeApplicationData.items.UpdateDetails.Biologicals.items[i];
									}
								};							
							}
							break;
						case 'BiologicalIngredient':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.BiologicalIngredients.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.BiologicalIngredients.items[i].RecordUNID[0]){
										biologicalingredient_item = storeApplicationData.items.Part1.BiologicalIngredients.items[i];
										biologicalid = storeApplicationData.items.Part1.BiologicalIngredients.items[i].biologicalId;
										for(i=0; i < storeApplicationData.items.Part1.Biologicals.items.length; i++){
											if(biologicalid == storeApplicationData.items.Part1.Biologicals.items[i].RecordUNID[0]){
												biological_item = storeApplicationData.items.Part1.Biologicals.items[i];
											}
										};
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.BiologicalIngredients.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.BiologicalIngredients.items[i].RecordUNID[0]){
										biologicalingredient_item = storeApplicationData.items.UpdateDetails.BiologicalIngredients.items[i];
										biologicalid = storeApplicationData.items.UpdateDetails.BiologicalIngredients.items[i].biologicalId;
										for(i=0; i < storeApplicationData.items.UpdateDetails.Biologicals.items.length; i++){
											if(biologicalid == storeApplicationData.items.UpdateDetails.Biologicals.items[i].RecordUNID[0]){
												biological_item = storeApplicationData.items.UpdateDetails.Biologicals.items[i];
											}
										};
									}
								};						
							}
							break;
						case 'Medicine':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.Medicines.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.Medicines.items[i].RecordUNID[0]){
										medicine_item = storeApplicationData.items.Part1.Medicines.items[i];
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.Medicines.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.Medicines.items[i].RecordUNID[0]){
										medicine_item = storeApplicationData.items.UpdateDetails.Medicines.items[i];
									}
								};							
							}
							break;
						case 'MedicineIngredient':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.MedicineIngredients.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.MedicineIngredients.items[i].RecordUNID[0]){
										medicineingredient_item = storeApplicationData.items.Part1.MedicineIngredients.items[i];
										medicineid = storeApplicationData.items.Part1.MedicineIngredients.items[i].medicineId;
										for(i=0; i < storeApplicationData.items.Part1.Medicines.items.length; i++){
											if(medicineid == storeApplicationData.items.Part1.Medicines.items[i].RecordUNID[0]){
												medicine_item = storeApplicationData.items.Part1.Medicines.items[i];
											}
										};
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.MedicineIngredients.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.MedicineIngredients.items[i].RecordUNID[0]){
										medicineingredient_item = storeApplicationData.items.UpdateDetails.MedicineIngredients.items[i];
										medicineid = storeApplicationData.items.UpdateDetails.MedicineIngredients.items[i].medicineId;
										for(i=0; i < storeApplicationData.items.UpdateDetails.Medicines.items.length; i++){
											if(medicineid == storeApplicationData.items.UpdateDetails.Medicines.items[i].RecordUNID[0]){
												medicine_item = storeApplicationData.items.UpdateDetails.Medicines.items[i];
											}
										};
									}
								};							
							}
							break;
						case 'Device':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.Devices.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.Devices.items[i].RecordUNID[0]){
										device_item = storeApplicationData.items.Part1.Devices.items[i];
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.Devices.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.Devices.items[i].RecordUNID[0]){
										device_item = storeApplicationData.items.UpdateDetails.Devices.items[i];
									}
								};							
							}
							break;
						case 'AnimalExcipient':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.AnimalExcipients.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.AnimalExcipients.items[i].RecordUNID[0]){
										animalexcipient_item = storeApplicationData.items.Part1.AnimalExcipients.items[i];
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.AnimalExcipients.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.AnimalExcipients.items[i].RecordUNID[0]){
										animalexcipient_item = storeApplicationData.items.UpdateDetails.AnimalExcipients.items[i];
									}
								};							
							}
							break;
					}
					if(biological_item){
						fieldPrefix = 'dialog_Biological_';
						var d = dijit.byId('dialog_Biological');
						d.set('thisItem', biological_item);
						if(stage == "1"){
							d.storeKey = new itemBiological(storeApplicationData.items.Part1.Biologicals.Key);
						}else{
							d.storeKey = new itemBiological(storeApplicationData.items.UpdateDetails.Biologicals.Key);
						}
						d.gridID = tabName + '_Biologicals';
						d.set('editMode', true);
						d.show();
						if(biologicalingredient_item){
							fieldPrefix = 'dialog_BiologicalIngredient_';
							var bioId =  getThisId("dialog_Biological");
							var bd = dijit.byId('dialog_BiologicalIngredient');
							bd.set('thisItem', biologicalingredient_item)
							if(stage == "1"){
								bd.storeKey = new itemBiologicalIngredient(storeApplicationData.items.Part1.BiologicalIngredients.Key, bioId);
							}else{
								bd.storeKey = new itemBiologicalIngredient(storeApplicationData.items.UpdateDetails.BiologicalIngredients.Key, bioId);
							}
							bd.gridID = tabName + '_BiologicalIngredients';
							bd.set('editMode', true);
							bd.show();
						}
					}
					
					if(medicine_item){
						fieldPrefix = 'dialog_Medicine_';
						var d = dijit.byId('dialog_Medicine');
						d.set('thisItem', medicine_item);
						if(stage == "1"){
							d.storeKey = new itemMedicine(storeApplicationData.items.Part1.Medicines.Key);
						}else{
							d.storeKey = new itemMedicine(storeApplicationData.items.UpdateDetails.Medicines.Key);
						}
						d.gridID = tabName + '_Medicines';
						d.set('editMode', true);
						d.show();
						if(medicineingredient_item){
							fieldPrefix = 'dialog_MedicineIngredient_';
							var medId =  getThisId("dialog_Medicine");
							var md = dijit.byId('dialog_MedicineIngredient');
							md.set('thisItem', medicineingredient_item)
							if(stage == "1"){
								md.storeKey = new itemMedicineIngredient(storeApplicationData.items.Part1.MedicineIngredients.Key, medId);
							}else{
								md.storeKey = new itemMedicineIngredient(storeApplicationData.items.UpdateDetails.MedicineIngredients.Key, medId);
							}
							md.gridID = tabName + '_MedicineIngredients';
							md.set('editMode', true);
							md.show();
						}
					}
					if(device_item){
						fieldPrefix = 'dialog_Device_';
						var d = dijit.byId('dialog_Device');
						d.set('thisItem', device_item);
						if(stage == "1"){
							d.storeKey = new itemDevice(storeApplicationData.items.Part1.Devices.Key);
						}else{
							d.storeKey = new itemDevice(storeApplicationData.items.UpdateDetails.Devices.Key);
						}
						d.gridID = tabName + '_Devices';
						d.set('editMode', true);
						d.show();
					}
					if(animalexcipient_item){
						fieldPrefix = 'dialog_AnimalExcipient_';
						var d = dijit.byId('dialog_AnimalExcipient');
						d.set('thisItem', animalexcipient_item);
						if(stage == "1"){
							d.storeKey = new itemAnimalExcipient(storeApplicationData.items.Part1.AnimalExcipients.Key);
						}else{
							d.storeKey = new itemAnimalExcipient(storeApplicationData.items.UpdateDetails.AnimalExcipients.Key);
						}
						d.gridID = tabName + '_AnimalExcipients';
						d.set('editMode', true);
						d.show();
					}
					break;
				case 'Comparator'://not needed by INC61834 however leaving in place just in case - won't be called
				case 'Placebo':
				case 'Site':
					recunid = ti.ElementRef[0];
					switch (ti.Type[0]) {
						case 'Comparator'://not needed by INC61834 however leaving in place just in case - won't be called
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.Comparators.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.Comparators.items[i].RecordUNID[0]){
										comparator_item = storeApplicationData.items.Part1.Comparators.items[i];
									}
								};
							}else if(stage == "2"){
								for(i=0; i < storeApplicationData.items.Part2.Comparators.items.length; i++){
									if(recunid == storeApplicationData.items.Part2.Comparators.items[i].RecordUNID[0]){
										comparator_item = storeApplicationData.items.Part2.Comparators.items[i];
									}
								};
							}
							break;
						case 'Placebo':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.Placebos.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.Placebos.items[i].RecordUNID[0]){
										placebo_item = storeApplicationData.items.Part1.Placebos.items[i];
									}
								};
							}else if(stage == "2"){
								for(i=0; i < storeApplicationData.items.Part2.Placebos.items.length; i++){
									if(recunid == storeApplicationData.items.Part2.Placebos.items[i].RecordUNID[0]){
										placebo_item = storeApplicationData.items.Part2.Placebos.items[i];
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.Placebos.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.Placebos.items[i].RecordUNID[0]){
										placebo_item = storeApplicationData.items.UpdateDetails.Placebos.items[i];
									}
								};
							}
							break;
						case 'Site':
							if(stage == "1"){
								for(i=0; i < storeApplicationData.items.Part1.Sites.items.length; i++){
									if(recunid == storeApplicationData.items.Part1.Sites.items[i].RecordUNID[0]){
										site_item = storeApplicationData.items.Part1.Sites.items[i];
									}
								};
							}else if(stage == "2"){
								for(i=0; i < storeApplicationData.items.Part2.Sites.items.length; i++){
									if(recunid == storeApplicationData.items.Part2.Sites.items[i].RecordUNID[0]){
										site_item = storeApplicationData.items.Part2.Sites.items[i];
									}
								};
							}else{
								for(i=0; i < storeApplicationData.items.UpdateDetails.Sites.items.length; i++){
									if(recunid == storeApplicationData.items.UpdateDetails.Sites.items[i].RecordUNID[0]){
										site_item = storeApplicationData.items.UpdateDetails.Sites.items[i];
									}
								};
							}
							break;
					} //end switch (ti.Type[0])
					if(comparator_item){//not needed by INC61834 however leaving in place just in case - won't be called
						fieldPrefix = 'dialog_Comparator_';
						var d = dijit.byId('dialog_Comparator');
						d.set('thisItem', comparator_item);
						if(stage == "1"){
							d.storeKey = new itemComparator(storeApplicationData.items.Part1.Comparators.Key);
						}else{
							d.storeKey = new itemComparator(storeApplicationData.items.Part2.Comparators.Key);
						}
						d.gridID = tabName + '_Comparators';
						d.set('editMode', true);
						d.show();
					}
					if(placebo_item){
						fieldPrefix = 'dialog_Placebo_';
						var d = dijit.byId('dialog_Placebo');
						d.set('thisItem', placebo_item);
						if(stage == "1"){
							d.storeKey = new itemPlacebo(storeApplicationData.items.Part1.Placebos.Key);
						}else{
							d.storeKey = new itemPlacebo(storeApplicationData.items.Part2.Placebos.Key);
						}
						d.gridID = tabName + '_Placebos';
						d.set('editMode', true);
						d.show();
					}
					if(site_item){
						fieldPrefix = 'dialog_Site_';
						var d = dijit.byId('dialog_Site');
						d.set('thisItem', site_item);
						if(stage == "1"){
							d.storeKey = new itemSite(storeApplicationData.items.Part1.Sites.Key);
						}else if(stage == "2"){
							d.storeKey = new itemSite(storeApplicationData.items.Part2.Sites.Key);
						}else{
							d.storeKey = new itemSite(storeApplicationData.items.UpdateDetails.Sites.Key);
						}
						d.gridID = tabName + '_Sites';
						d.editMode = true;
						d.show();
					}
					break;
				default:
					recunid = ti.ElementRef[0];
					tabname = 'Application';
			}// end switch (ti.Type[0])
			testObj = dijit.byId('djtabs_' + tabName);
			
			if (testObj) {
				if (testObj.declaredClass) {
					switch (testObj.declaredClass.toLowerCase()) {
					case 'dijit.layout.contentpane':
					case 'dijit.layout.bordercontainer':
					case 'dijit.layout.layoutcontainer':
						//is it inside a tabcontainer to which it can be switched to
						try {
							dijit.byId('djborder_Tabs').selectChild(testObj);
						} catch (e) {
							consoleLog(e);
						}
						break;
					case 'dijit.layout.tabcontainer':
						// ? hmmm, this is a parent
						break;
					default:
					}
					if (ti.EntryName){
						if(fieldPrefix != ''){
							var fieldName = fieldPrefix + ti.EntryName[0];
						}else{
							var fieldName = ti.Type[0] + '_' + ti.EntryName[0];
						}
						if(dijit.byId(fieldName)){
							var fieldObj = dijit.byId(fieldName);
							setTimeout(function () { fieldObj.focus() }, 400);
							dojo.style(fieldObj.domNode, "border-color", "#F00");
							setTimeout(function() {dojo.style(fieldObj.domNode, "border-color", "#B5BCC7")}, 3000);// reset to the dojo border colour
						}
					} //end if (ti.EntryName)
				} else {
					dialogText('Cannot Locate Problem', 'Cannot locate the field/tab/dialog that this error relates to.');
				}//end if (testObj.declaredClass)		
			} //end if (testObj)
		}// end if (ti.Type)
	}//end if (this.focus.rowIndex >= 0)
}// end function validationFocus(e)

function djgrid_Validation_Fetch_Complete(items, request) {
	if (djgrid_Validation) {
		djgrid_Validation.render();
	}
}

function djgrid_Validation_Fetch_Error(e, z) {
	setDataStatusText(constant.DataStatus_ValidatingFail);
	if (z != 'undefined') consoleLog(z);
}