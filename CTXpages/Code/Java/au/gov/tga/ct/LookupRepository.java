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
import lotus.domino.ViewEntryCollection;
import lotus.domino.ViewEntry;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class LookupRepository implements Serializable {
	private static final long serialVersionUID = 1L;

	public static String doGet(HttpServletRequest request,
			HttpServletResponse response) {
		return doPost(request, response);
	}

	@SuppressWarnings("unchecked")
	public static String doPost(HttpServletRequest request, HttpServletResponse response) {
		// System.out.println("LookupRepository doPost instantiated");
		String strValue = "";
		Session sess = null;
		Database db = null;
		Database repo = null;
		View view = null;
		ViewEntryCollection vec = null;
		ViewEntry entry = null;
		ViewEntry tmpentry = null;
		Document doc = null;
		Document tmpdoc = null;
		Document ebsSystemProfile = null;
		ArrayList<HashMap<String, String>> result = null;
		String sysdbpath = "";

		try {
			// Set the response headers
			String varname = request.getParameter("VARNAME");
			if (varname != null) {
				response.setContentType("application/javascript");
			} else {
				response.setContentType("application/json");
			}
			response.setHeader("Cache-Control", "no-cache");

			db = ExtLibUtil.getCurrentDatabase();
			sess = ExtLibUtil.getCurrentSession();
			List<HashMap<String, String>> precedingtrials = new ArrayList<HashMap<String, String>>();

			ebsSystemProfile = db.getProfileDocument("System Profile Document",
					"");
			@SuppressWarnings("unused")
			Map sessionScope = (Map) getXVariableValue("sessionScope");
			sysdbpath = ebsSystemProfile.getItemValueString("CTR_Path");
			String[] dbpath = sysdbpath.split("!!");
			repo = sess.getDatabase("", dbpath[1]);

			if (repo != null) {
				JsonJavaObject returnJSON = new JsonJavaObject();
				view = repo.getView("PrecedingTrialsLUByApplicationId");
				view.refresh();
				vec = view.getAllEntries();
				entry = vec.getFirstEntry();
				// System.out.println(vec.getCount());
				while (entry != null) {
					HashMap<String, String> entryMap = new HashMap<String, String>();
					doc = entry.getDocument();

					entryMap.put("id", doc.getUniversalID());
					entryMap.put("name", doc.getItemValueString("ApplicationID") + " - " + doc.getItemValueString("TitleOfStudy"));
					precedingtrials.add(entryMap);

					tmpentry = vec.getNextEntry();
					entry.recycle();
					doc.recycle();
					entry = tmpentry;
				}

				HashSet<HashMap<String, String>> set = new HashSet<HashMap<String, String>>(precedingtrials);
				result = new ArrayList<HashMap<String, String>>(set);
				// sort the code alphabetically
				Collections.sort(result, new Comparator<Map<String, String>>() {
					public int compare(Map<String, String> o1,Map<String, String> o2) {
						String s1 = o1.get("name").trim();
						String s2 = o2.get("name").trim();
						if (s1 == null)
							return -1;
						return s1.compareTo(s2);
					}
				});

				returnJSON.put("identifier", "id");
				returnJSON.put("label", "name");
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

		} catch (NotesException e) {
			System.out.println("NotesException: " + e);
		} catch (Exception e) {
			System.out.println("Java exception: " + e);
		} finally {
			incinerate(repo, view, vec, doc, tmpdoc);
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