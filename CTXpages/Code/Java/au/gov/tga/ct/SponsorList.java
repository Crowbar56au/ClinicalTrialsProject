package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.Item;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.io.json.JsonGenerator;
import com.ibm.commons.util.io.json.JsonJavaFactory;
import com.ibm.commons.util.io.json.JsonJavaObject;
import com.ibm.xsp.extlib.util.ExtLibUtil;

/**
 * returns a sponsor list for the logged in user output as json and intended for
 * a dojo filtering select element
 * */

public class SponsorList implements Serializable {
	private static final long serialVersionUID = 1L;
	static boolean _debug = false;

	public static String doGet(HttpServletRequest request,HttpServletResponse response) {
		Database db = ExtLibUtil.getCurrentDatabase();
		set_debug(new GetDebugLevel().getDebug(db));
		
		return doPost(request, response, _debug);
	}

	@SuppressWarnings("unchecked")
	public static String doPost(HttpServletRequest request,HttpServletResponse response, boolean debug) {
		if (is_debug()) {
			System.out.println("sponsor list invoked");
		}
		//System.out.println("sponsor list doPost invoked");
		Session sess = null;
		String strValue = "";
		String cid = "";
		String clientname = "";
		String lookup2 = "";
		Database cwdb = null; // clientweb db
		View luagents = null;
		View luclientbyid = null;
		Document client = null;
		Document agent = null;
		Item itm = null;

		try {
			String type = request.getParameter("type");
			if (type.equalsIgnoreCase("json")) {
				response.setContentType("application/json");
			} else {
				response.setContentType("application/javascript");
				strValue = "var SponsorListStore = ";
			}
			
			response.setHeader("Cache-Control", "no-cache");
			sess = ExtLibUtil.getCurrentSession();
			List<HashMap<String, String>> sponsoritems = new ArrayList<HashMap<String, String>>();
			Map sessionScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("sessionScope");
			String cwdbstr = sessionScope.get("clientwdb").toString();
				
			cid = sessionScope.get("clientid").toString();
				
			String[] dbpath = cwdbstr.split("!!");
			cwdb = sess.getDatabase("", dbpath[1]);
			
			if (cwdb != null) {
				// add a blank entry at the top
				HashMap<String, String> blankentryMap = new HashMap<String, String>();
				blankentryMap.put("id", "");
				blankentryMap.put("name", "");
				sponsoritems.add(blankentryMap);

				// add the client
				luclientbyid = cwdb.getView("LUClientByID");
				if (luclientbyid != null) {
					client = luclientbyid.getDocumentByKey(cid, true);
					if (client != null) {
						clientname = client.getItemValueString("ClientName");
						HashMap<String, String> entryMap = new HashMap<String, String>();
						entryMap.put("id", cid);
						entryMap.put("name", clientname);
						sponsoritems.add(entryMap);
					}
				}
				luagents = cwdb.getView("LUAgents");
				if (luagents != null) {
					agent = luagents.getDocumentByKey(cid, true);
					if (agent != null) {
						itm = agent.getFirstItem("Sponsor_ID");
						if (itm != null) {
							lookup2 = itm.getText();
						}
					}
				}
				List<String> agentids = Arrays.asList(lookup2.split(";"));

				//System.out.println("agents lkup2: " + lookup2);

				for (int i = 0; i < agentids.size(); i++) {
					HashMap<String, String> entryMap = new HashMap<String, String>();
					entryMap.put("id", (String) agentids.get(i));
					ArrayList<String> agentname = au.gov.tga.ct.Utils.Dblookup(cwdb, "LUClientByID", (String) agentids.get(i),"ClientName");
					String tmp = (String) agentname.get(0);
					entryMap.put("name", tmp);
					sponsoritems.add(entryMap);
				}

				JsonJavaObject returnJSON = new JsonJavaObject();
				returnJSON.put("items", sponsoritems);
				returnJSON.put("identifier", "id");
				returnJSON.put("label", "name");
				strValue = strValue + JsonGenerator.toJson(JsonJavaFactory.instanceEx,returnJSON);

			}
		} catch (NotesException e) {
			System.out.println("Notes Exception [SponsorList.java] doPost: " + e);
		} catch (Exception e) {
			System.out.println("Java Exception [SponsorList.java] doPost: " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(cwdb, luagents, luclientbyid, client, agent);
			if (is_debug()) {System.out.println("sponsorList call complete");}
		}
		if (is_debug()) {
			//System.out.println(strValue);
		}
//		System.out.println("sponsorList call complete");
		return strValue;

	}
	
	public static boolean is_debug() {
		return _debug;
	}

	public static void set_debug(boolean _debug) {
		_debug = SponsorList._debug;
	}

}
