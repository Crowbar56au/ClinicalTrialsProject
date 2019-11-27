package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.DocumentCollection;
import lotus.domino.Item;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class Validation implements Serializable {
    private static final long serialVersionUID = 1L;

    public static String doGet(HttpServletRequest request, HttpServletResponse response) {
	return validateData(request, response);
    }

    @SuppressWarnings("unchecked")
    public static String validateData(HttpServletRequest request, HttpServletResponse response) {
	String strValue = "";
	String fieldname = "";
	Session sess = null;
	Database datadictionary = null;
	Database currdb = null;
	View vw = null;
	DocumentCollection dc = null;
	Document doc = null;
	Document app = null;
	Item itm = null;
	boolean valid = false;
	int errcount = 0;
	
	try {
	    // Set the response headers
	    String applicationid = request.getParameter("applicationid");
	    if (applicationid.equalsIgnoreCase("")) {
		return strValue;
	    }
	    String runval = request.getParameter("runval");
	    
	    sess = ExtLibUtil.getCurrentSession();
	    List<HashMap<String, String>> valresults = new ArrayList<HashMap<String, String>>();
	    Map sessionScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("sessionScope");
	    
	    String scdb = sessionScope.get("datadictdb").toString();
	    String[] dbpath = scdb.split("!!");
	    
	    datadictionary = sess.getDatabase("", dbpath[1]);
	    currdb = com.ibm.xsp.extlib.util.ExtLibUtil.getCurrentDatabase();
	    
	    app = currdb.getView("AppsByApplicationId").getDocumentByKey(applicationid, true);
	    
	    if (app != null) {
		if(app.isNewNote()) {
		    //new document do not run any further
		    return strValue;
		}
		
		if (!runval.equalsIgnoreCase("y")) {
		    //have not intentionally invoked validation just get any previously saved json and go no further
		    strValue = app.getItemValueString("ValidationJSON");
		    return strValue;
		}
		
		if (datadictionary != null) {
		    vw = datadictionary.getView("vwLUByFormName");
		    if (vw != null) {
			dc = vw.getAllDocumentsByKey("N~Application");
			if (dc.getCount() > 0) {
			    doc = dc.getFirstDocument();
			    while (doc != null) {
				if (doc.getItemValueString("Mandatory").equalsIgnoreCase("y")) {
				    HashMap<String, String> entryMap = new HashMap<String, String>();
				    fieldname = doc.getItemValueString("Name");
				    itm = app.getFirstItem(fieldname);
				    if (itm.getText().equalsIgnoreCase("")) {
					entryMap.put("error","Please enter a value for " + doc.getItemValueString("label"));
					entryMap.put("tab", doc.getItemValueString("listTagFieldName"));
					entryMap.put("field", doc.getItemValueString("WebId"));
					errcount++;
					valresults.add(entryMap);
				    }else {//check for a valid email address and phone number
					if(fieldname.indexOf("mail") > 0) {
					    if(!au.gov.tga.ct.Utils.isEmailValid(itm.getText())) {
						entryMap.put("error", "Please enter a valid " + doc.getItemValueString("label"));
						entryMap.put("tab", doc.getItemValueString("listTagFieldName"));
						entryMap.put("field", doc.getItemValueString("WebId"));
						errcount++;
						valresults.add(entryMap);
					    }
					}
					if(fieldname.indexOf("Phone") > 0) {
					    if(!au.gov.tga.ct.Utils.isPhoneNumberValid(itm.getText())) {
						entryMap.put("error", "Please enter a valid " + doc.getItemValueString("label"));
						entryMap.put("tab", doc.getItemValueString("listTagFieldName"));
						entryMap.put("field", doc.getItemValueString("WebId"));
						errcount++;
						valresults.add(entryMap);
					    }
					}
				    }
				}
				Document tmpdoc = dc.getNextDocument(doc);
				doc.recycle();
				doc = tmpdoc;
			    }
			} else {
			    // what to do when there are no data dictionary documents
			    HashMap<String, String> entryMap = new HashMap<String, String>();
			    entryMap.put("error","The application cannot be validated as primary configuration documents are missing from the data dictionary. Please contact an eBS Administrator");
			    entryMap.put("tab", "Application");
			    entryMap.put("field", "applicantName");//anything that can't be targetted
			    valresults.add(entryMap);
			    errcount++;
			}
			if (errcount == 0) {
			    valid = true;
			    app.replaceItemValue("ApplicationStatus", "Passed Validation");
			    app.replaceItemValue("ValidationStatus", "Pass");
			}else {
			    app.replaceItemValue("ValidationStatus", "");
			    app.replaceItemValue("ApplicationStatus", "Draft");
			}
			
			JsonJavaObject returnJSON = new JsonJavaObject();
			returnJSON.put("items", valresults);
			returnJSON.put("success", valid);
			returnJSON.put("count", errcount);
			strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
			app.replaceItemValue("ValidationJSON", strValue);
			
			app.save();
		    }
		}
	    }
	} catch (NotesException e) {
	    System.out.println("Validation.java NotesException error: " + e);
	} catch (Exception e) {
	    System.out.println("Validation.java Exception error: " + e);
	} finally {
	    au.gov.tga.ct.Utils.incinerate(app, doc, dc, vw, datadictionary);
	}
	
	return strValue;
    }
}