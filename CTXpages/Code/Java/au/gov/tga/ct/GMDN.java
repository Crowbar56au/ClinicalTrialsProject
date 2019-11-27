package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Collections;

import javax.faces.context.FacesContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.domino.Base;
import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;
import lotus.domino.DocumentCollection;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class GMDN implements Serializable {
	private static final long serialVersionUID = 1L;
	private static String _prefix = "N~GMDNS~";

	public static String doGet(HttpServletRequest request, HttpServletResponse response) {
		return doPost(request, response);
	}

	@SuppressWarnings("unchecked")
	public static String doPost(HttpServletRequest request, HttpServletResponse response) {
		//System.out.println("GMDN.java doPost");
		String strValue = "";
		Session sess = null;
		Database database = null;
		Database dct = null;
		View view = null;
		DocumentCollection coll = null;
		Document doc = null;
		Document tmpdoc = null;
		Document ebsSystemProfile = null;
		ArrayList<HashMap<String, String>> result = null;
		String sysdbpath = "";

		try {
			// Set the response headers
			response.setContentType("application/json");
			response.setHeader("Cache-Control", "no-cache");
			String searchstr = request.getParameter("searchstr");
			String gmdn = request.getParameter("gmdn");

			database = ExtLibUtil.getCurrentDatabase();
			sess = ExtLibUtil.getCurrentSession();
			List<HashMap<String, String>> gmdnitems = new ArrayList<HashMap<String, String>>();

			ebsSystemProfile = database.getProfileDocument("System Profile Document", "");
			
			boolean useAltCode = false;
			
			if (ebsSystemProfile.hasItem("GMDN_ALT_LOOKUP_ResourceString")) {
				if (ebsSystemProfile.getItemValueString("GMDN_ALT_LOOKUP_ResourceString").equalsIgnoreCase("Y")) {
					// Implementation of GMDN alternate codes has been enabled
					useAltCode = true;
				}
			}
			
			//got to have a search string to get gmdns
			if(searchstr != null && searchstr.equalsIgnoreCase("")) {
				//send back valid json with no items
				JsonJavaObject returnJSON = new JsonJavaObject();
				returnJSON.put("identifier", "abbreviation");
				returnJSON.put("label", "name");
				returnJSON.put("items", gmdnitems);
				// Return a JSON string generated from our JsonJavaObject
				strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
				return strValue;
			} else {
				@SuppressWarnings("unused")
				Map sessionScope = (Map) getXVariableValue("sessionScope");
				sysdbpath = ebsSystemProfile.getItemValueString("DCT_Path");
				String[] dbpath = sysdbpath.split("!!");
				dct = sess.getDatabase("", dbpath[1]);
				if (dct != null) {
					JsonJavaObject returnJSON = new JsonJavaObject();
					if (gmdn != null && !gmdn.equalsIgnoreCase("")) {
						if (useAltCode) {
							view = dct.getView("DCTLookupAlt");
						} else {
							view = dct.getView("DCTLookup");
						}
						doc = view.getDocumentByKey(_prefix + gmdn, false);
						if (doc != null) {
							HashMap<String, String> entryMap = new HashMap<String, String>();
							entryMap.put("id", doc.getItemValueString("Code"));
							entryMap.put("name", doc.getItemValueString("ShortDescription") + " (" + gmdn + ")");
							gmdnitems.add(entryMap);
						}
					} else {
						if (searchstr != null && !searchstr.equalsIgnoreCase("")) {
							if(searchstr.length() >= 3) {
								view = dct.getView("DCTUniqueDesc");
								String key = "GMDNS~" + searchstr.toUpperCase();
								coll = view.getAllDocumentsByKey(key, false);
								doc = coll.getFirstDocument();
								while (doc != null) {
									String system = doc.getItemValue("SystemMask").toString();
									String status = doc.getItemValueString("Status");
									//only use status "A" documents belonging to clinical trials system
									if(system.indexOf("N") > 0 && status.equalsIgnoreCase("A")) {
										HashMap<String, String> entryMap = new HashMap<String, String>();
										entryMap.put("id", doc.getItemValueString("Code"));
										
										// Get the code to include with the description
										String thisGMDNCode = doc.getItemValueString("Code");
										if (useAltCode) {
											if (doc.hasItem("AlternateCode")) {
												if (doc.getItemValueString("AlternateCode").length() > 0) {
													thisGMDNCode = doc.getItemValueString("AlternateCode");
												}
											}
										}
										entryMap.put("name", doc.getItemValueString("ShortDescription") + " (" + thisGMDNCode + ")");
										gmdnitems.add(entryMap);
									}
									tmpdoc = coll.getNextDocument(doc);
									doc.recycle();
									doc = tmpdoc;
								}
							}
						}
					}

					HashSet<HashMap<String, String>> set = new HashSet<HashMap<String, String>>(gmdnitems);
					result = new ArrayList<HashMap<String, String>>(set);
					//sort the artgitems by artg name
					Collections.sort(result, new Comparator<Map<String, String>>() {
						public int compare(Map<String, String> o1, Map<String, String> o2) {
							//need to convert artgnumber from string to long for sorting the collection
							String s1 = o1.get("name").trim();
							String s2 = o2.get("name").trim();
							if (s1 == null) return -1;
							return s1.compareTo(s2);
						}
					});

					returnJSON.put("identifier", "id");
					returnJSON.put("label", "name");
					returnJSON.put("items", result);
					returnJSON.put("count", result.size());

					// Return a JSON string generated from our JsonJavaObject
					strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
				}
			}

		} catch (NotesException e) {
			System.out.println("NotesException: " + e);
		} catch (Exception e ) {
			System.out.println("Java exception: " + e);
		} finally {
			incinerate(dct,view,coll,doc,tmpdoc);
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