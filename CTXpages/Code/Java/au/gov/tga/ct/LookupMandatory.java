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

public class LookupMandatory implements Serializable {
	private static final long serialVersionUID = 1L;

	public static String doGet(HttpServletRequest request, HttpServletResponse response) {
		return doPost(request, response);
	}

	public static String doPost(HttpServletRequest request, HttpServletResponse response) {
		// System.out.println("LookupMandatory doPost instantiated");
		String strValue = "";
		Session sess = null;
		Database database = null;
		Database dd = null;
		View view = null;
		DocumentCollection coll = null;
		Document doc = null;
		Document tmpdoc = null;
		Document ebsSystemProfile = null;
		ArrayList<HashMap<String, Object>> result = null;
		String sysdbpath = "";

		try {
			// Set the response headers
			String varname = request.getParameter("NAME");
			
			if (varname != null) {
				response.setContentType("application/javascript");
			} else {
				response.setContentType("application/json");
			}
			response.setHeader("Cache-Control", "no-cache");
			String s = request.getParameter("S"); // the system mask
			String apptype = request.getParameter("AT"); // the application type
			// - CTN or CTX
			database = ExtLibUtil.getCurrentDatabase();
			sess = ExtLibUtil.getCurrentSession();
			JsonJavaObject returnJSON = new JsonJavaObject();

			List<HashMap<String, Object>> mandatory = new ArrayList<HashMap<String, Object>>();
			ebsSystemProfile = database.getProfileDocument("System Profile Document", "");

			if (s.equalsIgnoreCase("") || apptype.equalsIgnoreCase("")) {
				// send back valid json with no items
				returnJSON.put("identifier", "id");
				returnJSON.put("label", "name");
				returnJSON.put("items", mandatory);

				// Return a JSON string generated from our JsonJavaObject
				if (varname != null) {
					strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
					strValue = "var " + varname + "=" + strValue;
				} else {
					strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
				}

				return strValue;

			} else {
				sysdbpath = ebsSystemProfile
						.getItemValueString("DataDictionaryPath");
				String[] dbpath = sysdbpath.split("!!");
				dd = sess.getDatabase("", dbpath[1]);

				if (dd != null) {
					view = dd.getView("vwLuMandatory");
					if (view != null) {
						view.refresh();
						String key = s.toUpperCase() + "~" + apptype.toUpperCase();
						coll = view.getAllDocumentsByKey(key, true);
						doc = coll.getFirstDocument();
						while (doc != null) {
							HashMap<String, Object> entryMap = new HashMap<String, Object>();
							if (!doc.getItemValueString("WebId").equalsIgnoreCase("")) {
								entryMap.put("id", doc.getItemValueString("WebId"));
							} else {
								entryMap.put("id", doc.getItemValueString("FormName") + "_" + doc.getItemValueString("Name"));
							}
							entryMap.put("name", doc.getItemValueString("ShowMandatory").toUpperCase());
							mandatory.add(entryMap);

							tmpdoc = coll.getNextDocument();
							doc.recycle();
							doc = tmpdoc;
						}// end while
						HashSet<HashMap<String, Object>> set = new HashSet<HashMap<String, Object>>(mandatory);
						result = new ArrayList<HashMap<String, Object>>(set);
						// sort the sponsorlist alphabetically
						Collections.sort(result,
								new Comparator<HashMap<String, Object>>() {
									public int compare(HashMap<String, Object> o1, HashMap<String, Object> o2) {
										String s1 = o1.get("id").toString().trim();
										String s2 = o2.get("id").toString().trim();
										if (s1 == null)
											return -1;
										return s1.compareTo(s2);
									}
								});
						returnJSON.put("identifier", "id");
						returnJSON.put("label", "name");
						returnJSON.put("items", result);
						returnJSON.put("count", result.size());

						// Return a JSON string generated from our
						// JsonJavaObject
						if (varname != null) {
							strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
							strValue = "var " + varname + "=" + strValue;
						} else {
							strValue = JsonGenerator.toJson(JsonJavaFactory.instanceEx, returnJSON);
						}

					}// end view!=null
				}// end dd!=null
			}// end else

		} catch (NotesException e) {
			System.out.println("NotesException: " + e);
		} catch (Exception e) {
			System.out.println("Java exception: " + e);
		} finally {
			incinerate(dd, view, coll, doc, tmpdoc, ebsSystemProfile);
		}
		return strValue;
	}

	public static Object getXVariableValue(String varName) {
		// Note: only sessionScope works for this bean as it is attached an
		// xPage independent of the application/notification
		FacesContext context = FacesContext.getCurrentInstance();
		return context.getApplication().getVariableResolver().resolveVariable(context, varName);
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
}
