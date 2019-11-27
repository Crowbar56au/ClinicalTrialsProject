package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;

import javax.faces.context.FacesContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.domino.Base;
import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.DocumentCollection;
import lotus.domino.Item;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;
import lotus.domino.ViewEntry;
import lotus.domino.ViewEntryCollection;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class LookupSponsorAddress  implements Serializable {
    private static final long serialVersionUID = 1L;
    
    public static String doGet(HttpServletRequest request, HttpServletResponse response) {
	return doPost(request, response);
    }
    
    public static String doPost(HttpServletRequest request, HttpServletResponse response) {
	String strValue = "";
	Session sess = null;
	Database database = null;
	Database cwb = null;
	View view = null;
	DocumentCollection coll = null;
	Document doc = null;
	Document tmpdoc = null;
	Document ebsSystemProfile = null;
	ViewEntryCollection vec = null;
	ViewEntry entry = null;
	ViewEntry tmpentry = null;
	Item itm = null;
	ArrayList<HashMap<String, Object>> result = null;
	String sysdbpath = "";
	String v = ""; //a view flag
	String key = ""; //id of the client/sponsor
	@SuppressWarnings("unused")
	boolean issponsor = false;
	
	try {
	    // Set the response headers
//	    String varname = request.getParameter("NAME");
//	    if(varname != null) {
//		response.setContentType("application/javascript");
//	    } else {
		response.setContentType("application/json");
//	    }
	    response.setHeader("Cache-Control", "no-cache");
	    v = request.getParameter("V");
	    key = request.getParameter("NAME");
	    
	    database = ExtLibUtil.getCurrentDatabase();
	    sess = ExtLibUtil.getCurrentSession();
	    JsonJavaObject returnJSON = new JsonJavaObject();
	    List<HashMap<String, Object>> sponsoraddress = new ArrayList<HashMap<String, Object>>();
	    ebsSystemProfile = database.getProfileDocument("System Profile Document", "");
	    sysdbpath = ebsSystemProfile.getItemValueString("ClientWebPath");
	    String[] dbpath = sysdbpath.split("!!");
	    cwb = sess.getDatabase("", dbpath[1]);
	    if (cwb != null) {
		if(v.equalsIgnoreCase("p")) {
		    view = cwb.getView("LULocationPostalB$");
		} else {
		    view = cwb.getView("LULocationPostalRA");
		}
		if (view != null) {
		    view.refresh();
		    vec = view.getAllEntriesByKey(key,true);
		    String addressconcat = "";
		    entry = vec.getFirstEntry();
		    while (entry != null) {
			doc = entry.getDocument();
			
			HashMap<String, Object> address = new HashMap<String, Object>();
			itm = doc.getFirstItem("LocationID");
			address.put("id", itm.getText());
			addressconcat = doc.getItemValueString("Address_Line1") + " " + doc.getItemValueString("Address_Line2") + " " + doc.getItemValueString("Town") + " " + doc.getItemValueString("State") + " " + doc.getItemValueString("PostCode");
			address.put("name", addressconcat);
			sponsoraddress.add(address);
			
			tmpentry = vec.getNextEntry();
			entry.recycle();
			doc.recycle();
			entry = tmpentry;
		    }
		    HashSet<HashMap<String, Object>> set = new HashSet<HashMap<String, Object>>(sponsoraddress);
		    result = new ArrayList<HashMap<String, Object>>(set);
		    //sort the sponsorlist alphabetically
		    Collections.sort(result, new Comparator<HashMap<String, Object>>() {
			public int compare(HashMap<String, Object> o1, HashMap<String, Object> o2) {
			    String s1 = o1.get("name").toString().trim();
			    String s2 = o2.get("name").toString().trim();
			    if (s1 == null) return -1;
			    return s1.compareTo(s2);
			}
		    });
		}
		returnJSON.put("identifier", "id");
		returnJSON.put("label", "name");
		returnJSON.put("items", sponsoraddress);
		returnJSON.put("count", vec.getCount());
		
		// Return a JSON string generated from our JsonJavaObject
//		if(varname != null) {
//		    strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
//		    strValue = "var " + varname + "=" + strValue;
//		} else {
		    strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
//		}
	    }
	} catch (NotesException e) {
	    System.out.println("NotesException: " + e);
	} catch (Exception e ) {
	    System.out.println("Java exception: " + e);
	} finally {
	    incinerate(cwb,view,coll,doc,tmpdoc);
	}
	
	
	return strValue;
    }
	
    public static Object getXVariableValue(String varName) {
	//Note: only sessionScope works for this bean as it is attached an 
	//xPage independent of the application/notification
	FacesContext context = FacesContext.getCurrentInstance();
	return context.getApplication().getVariableResolver().resolveVariable(
		context, varName);
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
