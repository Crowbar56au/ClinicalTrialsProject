function setCommonDatabases(){
	
	try{
		var profDoc:NotesDocument = database.getProfileDocument("System Profile Document","");
		sessionScope.put("title","General Listing Application");
		sessionScope.put("datadictdb", profDoc.getItemValue("DIC_Path")[0]);
		sessionScope.put("helpdb", profDoc.getItemValue("SHL_Db")[0]);
		var helpdb = @ReplaceSubstring(sessionScope.helpdb, "\\","/");
		sessionScope.put("jshelpdb", helpdb);
		sessionScope.put("helpdbserver", profDoc.getItemValue("SHL_Server")[0]);
		sessionScope.put("elfdb", profDoc.getItemValue("DAP_Path")[0]);
		sessionScope.put("elfdbserver", profDoc.getItemValue("DAP_Server")[0]);
		sessionScope.put("clientdb", profDoc.getItemValue("SCL_Path")[0]);
		sessionScope.put("clientserver", profDoc.getItemValue("SCL_Server")[0]);
		sessionScope.put("clientwdb", profDoc.getItemValue("SCW_Path")[0]);
		sessionScope.put("clientwdbserver", profDoc.getItemValue("SCW_Server")[0]);
		sessionScope.put("codetablesdb", profDoc.getItemValue("DCT_Path")[0]);
		sessionScope.put("codetablesserver", profDoc.getItemValue("DCT_Server")[0]);
		sessionScope.put("artgdb", profDoc.getItemValue("AR1_Path")[0]);
		sessionScope.put("artgserver", profDoc.getItemValue("AR1_Server")[0]);
		sessionScope.put("artgwdb1", profDoc.getItemValue("WA1_Path")[0]);
		sessionScope.put("artgwserver", profDoc.getItemValue("WA1_Server")[0]);
		sessionScope.put("feescheduledb", profDoc.getItemValue("PFS_Db")[0]);
		sessionScope.put("feescheduleserver", profDoc.getItemValue("PFS_Server")[0]);
		sessionScope.put("homepagedb", profDoc.getItemValue("SWH_Path")[0]);
		sessionScope.put("homepagedbserver", profDoc.getItemValue("SWH_Server")[0]);
		sessionScope.put("usermanagedb", profDoc.getItemValue("SUM_Path")[0]);
		sessionScope.put("usermanageserver", profDoc.getItemValue("SUM_Server")[0]);
		sessionScope.put("repositorydb", profDoc.getItemValue("MISRepPath")[0]);
		sessionScope.put("repositoryserver", profDoc.getItemValue("MISRepServer")[0]);
		sessionScope.put("dburl", profDoc.getItemValue("DAP_Path")[0]);
		sessionScope.put("resourcedb", profDoc.getItemValue("RES_Path")[0]);
		sessionScope.put("footerhtml",profDoc.getItemValue("WFC_ResourceString")[0]);
		sessionScope.put("sequencer",profDoc.getItemValue("SEQ_PATH")[0]);
		sessionScope.put("publicweb",profDoc.getItemValue("PUBW_Path")[0]);
		sessionScope.put("pdfstoredb", profDoc.getItemValue("PDFStoreDb")[0]);
		var pdfdb = @ReplaceSubstring(sessionScope.pdfstoredb, "\\","/");
		sessionScope.put("jspdfstoredb", pdfdb);
		sessionScope.put("pdfstoreserver", profDoc.getItemValue("PDFStoreServer")[0]);
	}catch(e){
		print(database.getTitle() +  " setCommonDatabases: " + e);
	}
}  //end setCommonDatabases