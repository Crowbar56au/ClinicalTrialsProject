package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList; //import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.domino.Database;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;
import lotus.domino.ViewEntry;
import lotus.domino.ViewEntryCollection;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

/**
 * returns aa address list for the selected sponsor output is json and intended
 * for a dojo filtering select element
 * */

public class RegulatoryAddress implements Serializable {
	private static final long serialVersionUID = 1L;
	static boolean _debug = false;
	
	public static String doGet(HttpServletRequest request,HttpServletResponse response) {
		Database db = ExtLibUtil.getCurrentDatabase();
//		boolean _debug = new GetDebugLevel().getDebug(db);
		set_debug(new GetDebugLevel().getDebug(db));
		return doPost(request, response, _debug);
	}

	@SuppressWarnings("unchecked")
	public static String doPost(HttpServletRequest request,HttpServletResponse response, boolean debug) {
		
		if (is_debug()) {
			System.out.println("regulatory address list invoked");
		}
		Session sess = null;
		String strValue = "";
		String locid = "";
		String addressdata = "";
		Database cwdb = null; // clientweb db
		View lulocationpostal = null;
		ViewEntry entry = null;
		ViewEntry tmpentry = null;
		ViewEntryCollection vc = null;
		try {
			String type = request.getParameter("type");

			if (type.equalsIgnoreCase("json")) {
				response.setContentType("application/json");
			} else {
				response.setContentType("application/javascript");
				strValue = "var RegulatoryAddressStore = ";
			}

			response.setHeader("Cache-Control", "no-cache");
			String sponsorid = request.getParameter("sponsorid");
			// System.out.println(sponsorid);

			sess = ExtLibUtil.getCurrentSession();
			List<HashMap<String, String>> regaddressitems = new ArrayList<HashMap<String, String>>();
			Map sessionScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("sessionScope");
			String cwdbstr = sessionScope.get("clientwdb").toString();
			String[] dbpath = cwdbstr.split("!!");
			cwdb = sess.getDatabase("", dbpath[1]);
			if (cwdb != null) {
				// add a blank entry at the top
				HashMap<String, String> blankentryMap = new HashMap<String, String>();
				blankentryMap.put("id", "");
				blankentryMap.put("name", "");
				regaddressitems.add(blankentryMap);

				// add the postal address
				lulocationpostal = cwdb.getView("LULocationPostalB$");
				lulocationpostal.setAutoUpdate(false);

				if (lulocationpostal != null) {
					vc = lulocationpostal.getAllEntriesByKey(sponsorid, true);
					entry = vc.getFirstEntry();
					while (entry != null) {
						Vector v = entry.getColumnValues();
						for (int i = 0; i < v.size(); i++) {
							if (v.elementAt(i) != null) {
								addressdata = (String) v.elementAt(2);
								locid = (String) v.elementAt(4);
							}
						}
						HashMap<String, String> entryMap = new HashMap<String, String>();
						entryMap.put("id", locid);
						entryMap.put("name", addressdata);
						regaddressitems.add(entryMap);

						tmpentry = vc.getNextEntry();
						entry.recycle();
						entry = tmpentry;
					}
				}

				JsonJavaObject returnJSON = new JsonJavaObject();
				returnJSON.put("items", regaddressitems);
				returnJSON.put("identifier", "id");
				returnJSON.put("label", "name");
				strValue = strValue + JsonGenerator.toJson(JsonJavaFactory.instanceEx,returnJSON);

				if (_debug) {
//					System.out.println(strValue);
				}
			}
		} catch (NotesException e) {
			System.out.println("Notes Exception [RegulatoryAddress.java] doPost: " + e);
		} catch (Exception e) {
			System.out.println("Java Exception [RegulatoryAddress.java] doPost: " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(cwdb, lulocationpostal, entry, vc,tmpentry);
			if (_debug) {System.out.println("RegulatoryAddress call complete");}
		}
		
		return strValue;
	}
	
	public static boolean is_debug() {
		return _debug;
	}

	public static void set_debug(boolean _debug) {
		_debug = RegulatoryAddress._debug;
	}
}
