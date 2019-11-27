package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.faces.context.FacesContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.domino.Base;
import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.Item;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;
import lotus.domino.ViewEntryCollection;
import lotus.domino.ViewEntry;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class EligibleApplications implements Serializable {
    private static final long serialVersionUID = 1L;
    
    public static String doGet(HttpServletRequest request, HttpServletResponse response) {
	return doPost(request, response);
    }
    
    public static String doPost(HttpServletRequest request, HttpServletResponse response) {
	String strValue = "";
	Session sess = null;
	Database db = null;
	Database cwb = null;
	View view = null;
	ViewEntryCollection vec = null;
	ViewEntry entry = null;
	ViewEntry tmpentry = null;
	Document doc = null;
	Document tmpdoc = null;
	Document ebsSystemProfile = null;
	Item fees = null;
	String sysdbpath = "";
	String userid = "";
	Integer count = 0;
	
	try {
	    
	    String varname = request.getParameter("VARNAME");
	    if(varname != null) {
		response.setContentType("application/javascript");
	    } else {
		response.setContentType("application/json");
	    }
	    String user = request.getParameter("user");
	    String version = request.getParameter("v");
	    
	    response.setHeader("Cache-Control", "no-cache");
	    
	    db = ExtLibUtil.getCurrentDatabase();
	    sess = ExtLibUtil.getCurrentSession();
	    List<HashMap<String, String>> eligibleapplications = new ArrayList<HashMap<String, String>>();
	    ebsSystemProfile = db.getProfileDocument("System Profile Document", "");
	    
	    sysdbpath = ebsSystemProfile.getItemValueString("ClientWebPath");
	    String[] dbpath = sysdbpath.split("!!");
	    cwb = sess.getDatabase("", dbpath[1]);
	    
	    JsonJavaObject returnJSON = new JsonJavaObject();
	    userid = user.substring(user.indexOf("_")+1);
	    returnJSON.put("clientid", userid);
	    if(cwb != null){
		view = cwb.getView("LUClientType");
		if(view != null ) {
		    tmpdoc = view.getDocumentByKey(userid, true);
		    if(tmpdoc != null) {
			returnJSON.put("clientname", tmpdoc.getItemValueString("ClientName"));
		    }
		}
	    }
	    
	    view = db.getView("LookupByValidatedApplicationID");
	    if(view != null) {
		
		view.refresh();
		vec = view.getAllEntries();
		
		entry = vec.getFirstEntry();
		while (entry != null) {
		    HashMap<String, String> entryMap = new HashMap<String, String>();
		    doc = entry.getDocument();
		    
		    entryMap.put("id", doc.getItemValueString("ApplicationID"));
		    entryMap.put("name", doc.getItemValueString("ApplicationID"));
		    entryMap.put("label", doc.getItemValueString("ApplicationID"));
		    entryMap.put("ApplicationType", doc.getItemValueString("ApplicationID").substring(0, doc.getItemValueString("ApplicationID").indexOf("-")+1));
		    entryMap.put("ClinicalTrialType", doc.getItemValueString("ClinicalTrialType"));
		    entryMap.put("TitleOfStudy", doc.getItemValueString("TitleOfStudy"));
		    entryMap.put("ApplicationVersion", doc.getItemValueString("ApplicationVersion"));
		    entryMap.put("SponsorName", doc.getItemValueString("SponsorName"));
		    entryMap.put("SponsorAddress", doc.getItemValueString("SponsorAddress"));
		    entryMap.put("SponsorAddress_Label", doc.getItemValueString("SponsorAddress_Label"));
		    entryMap.put("SponsorId", doc.getItemValueString("SponsorId"));
		    entryMap.put("LabelName", doc.getItemValueString("LabelName"));
		    fees = doc.getFirstItem("ApplicationFees");
		    entryMap.put("ApplicationFees", fees.getText());
		    eligibleapplications.add(entryMap);
		    
		    tmpentry = vec.getNextEntry();
		    entry.recycle();
		    doc.recycle();
		    entry = tmpentry;
		    count++;
		}
		
		returnJSON.put("identifier", "id");
		returnJSON.put("label", "name");
		returnJSON.put("V", version);
		returnJSON.put("count", count.toString());
		returnJSON.put("items", eligibleapplications);
	    }
	    
	    // Return a JSON string generated from our JsonJavaObject
	    if(varname != null) {
		strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
		strValue = "var " + varname + "=" + strValue;
	    } else {
		strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
	    }
	    
	} catch (NotesException e) {
	    System.out.println("NotesException: " + e);
	} catch (Exception e ) {
	    System.out.println("Java exception: " + e);
	} finally {
	    incinerate(cwb,view,vec,doc,tmpdoc,tmpentry,entry);
	}
	
	return strValue;
    }
    
    public static Object getXVariableValue(String varName) {
	//Note: only sessionScope works for this bean as it is attached an 
	//xPage independent of the application/notification
	FacesContext context = FacesContext.getCurrentInstance();
	return context.getApplication().getVariableResolver().resolveVariable(context, varName);
    }
    
    public static void incinerate(Object... dominoObjects) {
	/**
	 * http://stackoverflow.com/questions/11159444/what-is-the-best-way-to-recycle-domino-objects-in-java-beans
	 */
	
	for (Object dominoObject : dominoObjects) {
	    if (null != dominoObject) {
		if (dominoObject instanceof Base) {
		    try {
			((Base)dominoObject).recycle();
		    } catch (NotesException recycleSucks) {
			// optionally log exception
		    }
		}
	    }
	}
    }
}
