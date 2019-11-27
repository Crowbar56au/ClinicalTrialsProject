package au.gov.tga.ct;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.domino.Base;
import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.DocumentCollection;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.io.json.JsonException;
import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class Biologicals {
	private static final long serialVersionUID = 1L;
	private static boolean debug = false;
	
	public static String doGet(HttpServletRequest request,
			HttpServletResponse response) {
				
		return doPost(request, response);
	}
	
	public static String doPost(HttpServletRequest request, HttpServletResponse response) {
		
		Database db = ExtLibUtil.getCurrentDatabase();
		setDebug(new GetDebugLevel().getDebug(db));
		
		if (isDebug()) {
			System.out.println("Biologicals.java invoked");
		}
		
		String strValue = "";
		@SuppressWarnings("unused")
		Session sess = null;
		Database database = null;
		View view = null;
		DocumentCollection coll = null;
		Document doc = null;
		Document tmpdoc = null;
		Document ebsSystemProfile = null;
		ArrayList<HashMap<String, String>> result = null;
		
		try{
			String varname = request.getParameter("NAME");
			if (varname != null) {
				response.setContentType("application/javascript");
			} else {
				response.setContentType("application/json");
			}
			response.setHeader("Cache-Control", "no-cache");

			String appid = request.getParameter("applicationid");
			String stage = request.getParameter("stage");
			
			database = ExtLibUtil.getCurrentDatabase();
			sess = ExtLibUtil.getCurrentSession();
			JsonJavaObject returnJSON = new JsonJavaObject();
			view = database.getView("xBiologicals");
			
			List<HashMap<String, String>> biologicals = new ArrayList<HashMap<String, String>>();
			if (appid.equalsIgnoreCase("") && stage.equalsIgnoreCase("")) {
				// send back valid json with no items
				returnJSON.put("identifier", "unid");
				returnJSON.put("label", "biological");
				returnJSON.put("items", biologicals);
				strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
				return strValue;
			} else {
				coll = view.getAllDocumentsByKey(appid);
				if (isDebug()) {System.out.println("No. of biological products for " + appid + ": " + coll.getCount());}
				
				doc = coll.getFirstDocument();
				if (doc != null) {
					while (doc != null) {
						HashMap<String, String> entryMap = new HashMap<String, String>();
						entryMap.put("unid", doc.getUniversalID());
						entryMap.put("name", doc.getItemValueString("ProductName"));
						entryMap.put("dosageform", doc.getItemValueString("DosageForm_Label"));
						entryMap.put("presentation", doc.getItemValueString("Presentation"));
						entryMap.put("roa", doc.getItemValueString("RouteOfAdmin_Label"));
						entryMap.put("Form", doc.getItemValueString("Form"));
						entryMap.put("noteid", doc.getNoteID());
						biologicals.add(entryMap);
						
						tmpdoc = coll.getNextDocument(doc);
						doc.recycle();
						doc = tmpdoc;
					}
					if (isDebug()) {System.out.println("Finished looping through biological documents");}
				}
				
				HashSet<HashMap<String, String>> set = new HashSet<HashMap<String, String>>(biologicals);
				result = new ArrayList<HashMap<String, String>>(set);
				// sort the code alphabetically
				Collections.sort(result, new Comparator<Map<String, String>>() {
					public int compare(Map<String, String> o1, Map<String, String> o2) {
						String s1 = o1.get("name").trim();
						String s2 = o2.get("name").trim();
						if (s1 == null)
							return -1;
						return s1.compareTo(s2);
					}
				});
				if (coll.getCount() > 0){
					if (isDebug()) {System.out.println("Finished sorting biologicals by name");}
				}
				
				returnJSON.put("identifier", "unid");
				returnJSON.put("label", "biological");
				returnJSON.put("items", result);
				returnJSON.put("count", result.size());
				
				// Return a JSON string generated from our JsonJavaObject
				if (varname != null) {
					strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
					strValue = "var " + varname + "=" + strValue;
				} else {
					strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
				}
				
			}
			
		} catch (JsonException e) {
			System.out.println("JsonException: " + e);
		} catch (IOException e) {
			System.out.println("IOException: " + e);
		} catch (NotesException e) {
			System.out.println("NotesException: " + e);
		} catch (Exception e) {
			System.out.println("Java exception: " + e);
		} finally {
			incinerate(database, view, coll, doc, tmpdoc, ebsSystemProfile);
			if (isDebug()) {System.out.println("Biologicals.java completed");}
		}
		
		return strValue;
	}

	public static void incinerate(Object... dominoObjects) {
		/**
		 * http://stackoverflow.com/questions/11159444/what-is-the-best-way-to-
		 * recycle-domino-objects-in-java-beans
		 */

		for (Object dominoObject : dominoObjects) {
			if (null != dominoObject) {
				if (dominoObject instanceof Base) {
					try {
						((Base) dominoObject).recycle();
					} catch (NotesException recycleSucks) {
						// optionally log exception
					}
				}
			}
		}
	}

	public static void setDebug(boolean debug) {
		Biologicals.debug = debug;
	}

	public static boolean isDebug() {
		return debug;
	}
}