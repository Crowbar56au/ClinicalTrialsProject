package au.gov.tga.ct;

import lotus.domino.Database;
import lotus.domino.Document;
import lotus.domino.DocumentCollection;
import lotus.domino.NotesException;

/**
 * This class gets the debug level to use
 * */
public class GetDebugLevel {
	
	/**
	 * This method gets the debug level from the current database
	 * @param db The current database
	 * @return Return whether the debug is on or off
	 * */
	public boolean getDebug(Database db) {
		boolean debugOn = false;
		Document ebsConfigDoc = null;
		DocumentCollection dc = null;
		String debugLevel = null;
		
		try {
			dc = db.getProfileDocCollection("frmEBSProfile");
			ebsConfigDoc = dc.getFirstDocument();
			debugLevel = ebsConfigDoc.getItemValueString("Debug");
			
			if(debugLevel.equalsIgnoreCase("on")) {
				debugOn = true;
			}
		} catch (NotesException e) {
			System.out.println("Could not get the debug level");
			e.printStackTrace();
			return debugOn;
		}
//		System.out.println("GetDebugLevel(): " + debugOn);
		return debugOn;
	}
}