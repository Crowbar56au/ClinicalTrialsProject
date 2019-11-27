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
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class LookupSponsorData  implements Serializable {
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
	ArrayList<HashMap<String, Object>> result = null;
	String sysdbpath = "";
	String userid = "";
	String clienttype = "";
	boolean isagent = false;
	@SuppressWarnings("unused")
	boolean issponsor = false;
	
	try {
	    
	 // Set the response headers
	    String varname = request.getParameter("NAME");
	    if(varname != null) {
		response.setContentType("application/javascript");
	    } else {
		response.setContentType("application/json");
	    }
	    response.setHeader("Cache-Control", "no-cache");
	    
	    String c = request.getParameter("c");
	    String user = request.getParameter("user");
	    
	    database = ExtLibUtil.getCurrentDatabase();
	    sess = ExtLibUtil.getCurrentSession();
	    JsonJavaObject returnJSON = new JsonJavaObject();
	    List<HashMap<String, Object>> sponsordata = new ArrayList<HashMap<String, Object>>();
	    List<HashMap<String, Object>> sponsorlist = new ArrayList<HashMap<String, Object>>();
	    JsonJavaObject sponsorList = new JsonJavaObject();
	    ebsSystemProfile = database.getProfileDocument("System Profile Document", "");
	    
	    if(c != null && c.equalsIgnoreCase("")) {
		//send back valid json with no items
		returnJSON.put("identifier", "id");
		returnJSON.put("label", "name");
		returnJSON.put("items", sponsordata);
		
		// Return a JSON string generated from our JsonJavaObject
		if(varname != null) {
		    strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
		    strValue = "var " + varname + "=" + strValue;
		} else {
		    strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
		}
		
		return strValue;
	    } else {
		sysdbpath = ebsSystemProfile.getItemValueString("ClientWebPath");
		String[] dbpath = sysdbpath.split("!!");
		cwb = sess.getDatabase("", dbpath[1]);
		if (cwb != null) {
		    view = cwb.getView("LUClientType");
		    if(view != null) {
			userid = user.substring(user.indexOf("_")+1);
			tmpdoc = view.getDocumentByKey(userid, true);
			if(tmpdoc != null) {
			    clienttype = tmpdoc.getItemValueString("ClientType");
			    if (clienttype.toLowerCase().contains("agent")) {
				isagent = true;
			    } else if (clienttype.toLowerCase().contains("sponsor")) {
				issponsor = true;
			    }
			    
			    view = cwb.getView("LUSponsorListByAgentID");
			    HashMap<String, Object> entryMap = new HashMap<String, Object>();
			    entryMap.put("id", userid);
			    entryMap.put("name",tmpdoc.getItemValueString("ClientName"));
			    if (view != null) {
				coll = view.getAllDocumentsByKey(userid);
				
				sponsorList.put("identifier", "id");
				sponsorList.put("label", "name");
				
				HashMap<String, Object> mainsponsor = new HashMap<String, Object>();
				mainsponsor.put("id", userid);
				mainsponsor.put("name", tmpdoc.getItemValueString("ClientName"));
				sponsorlist.add(mainsponsor);
				doc = coll.getFirstDocument();
				while (doc != null) {
				    HashMap<String, Object> sponsor = new HashMap<String, Object>();
				    sponsor.put("id", doc.getItemValueString("ClientID"));
				    sponsor.put("name", doc.getItemValueString("ClientName"));
				    sponsorlist.add(sponsor);
				    
				    tmpdoc = coll.getNextDocument();
				    doc.recycle();
				    doc = tmpdoc;
				}
			    
				HashSet<HashMap<String, Object>> set = new HashSet<HashMap<String, Object>>(sponsorlist);
				result = new ArrayList<HashMap<String, Object>>(set);
				//sort the code alphabetically
				Collections.sort(result, new Comparator<HashMap<String, Object>>() {
				    public int compare(HashMap<String, Object> o1, HashMap<String, Object> o2) {
					String s1 = o1.get("name").toString().trim();
					String s2 = o2.get("name").toString().trim();
					if (s1 == null) return -1;
					return s1.compareTo(s2);
				    }
				});
				sponsorList.put("items", result);
				entryMap.put("SponsorList",sponsorList);
				entryMap.put("isagent", isagent);
				entryMap.put("count", coll.getCount());
				sponsordata.add(entryMap);
			    }
			}
		    }
		    
		    returnJSON.put("identifier", "id");
		    returnJSON.put("label", "name");
		    returnJSON.put("items", sponsordata);
		
		    // Return a JSON string generated from our JsonJavaObject
		    if(varname != null) {
			strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
			strValue = "var " + varname + "=" + strValue;
		    } else {
			strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
		    }
		}
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
