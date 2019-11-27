package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList; //import java.text.ParseException;
//import java.text.SimpleDateFormat;
//import java.util.Calendar;
//import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.faces.context.FacesContext;

import lotus.domino.Agent;
import lotus.domino.Database; //import lotus.domino.DateTime;
import lotus.domino.Document; //import lotus.domino.DocumentCollection;
import lotus.domino.Item;
import lotus.domino.Name;
import lotus.domino.NotesException;
import lotus.domino.Session; //import lotus.domino.View;

import com.ibm.commons.util.StringUtil;
import com.ibm.xsp.extlib.util.ExtLibUtil;

@SuppressWarnings("unused")
public class Application implements Serializable {
	private static final long serialVersionUID = 1L;
	private String ApplicantName;
	private String SponsorName;
	private String SponsorID;
	private String SponsorAddress;
	private String SponsorAddress_Label;
	private String ContactId;
	private String ClinicalTrialType;
	private String ApplicationId;
	private String ExplicitKey;
	private String ClientReference;
	private String ApplicationStage;
	private String ApplicationStatus;
	private String ApplicationVersion;
	private String ValidationStatus;
	private String ValidationJSON;
	private String ClientId;
	private String ClientName;
	private String unid;
	private Object WebReaders;
	private Object WebAuthors;
	private String LastSelectedTab;
	private String SubmissionId;
	private Double ApplicationFees;
	private String DataSection;
	private String TitleOfStudy;
	private String ProtocolNumber;
	private String IsActiveVersion;
	
	boolean _debug = false;
	boolean _validApp = false;

	public Application(){
		Database db = ExtLibUtil.getCurrentDatabase();
		set_debug(new GetDebugLevel().getDebug(db));
		if (is_debug()) {try {
			System.out.println(db.getTitle() + " (" + db.getFilePath() + ") STARTED");
		} catch (NotesException e) {
			e.printStackTrace();
		}}
		if (is_debug()) {System.out.println("Application invoked");}
		
		String documentId = ExtLibUtil.readParameter(FacesContext.getCurrentInstance(), "appdocumentId");
		if (StringUtil.isNotEmpty(documentId)) {
			load(documentId);
		}
		if (is_debug()) {System.out.println("Application complete");}
	}

	

	public void load(final String unid) {
		setUnid(unid);
		Document doc = null;

		try {
			if (StringUtil.isNotEmpty(getUnid())) {
				if (is_debug()) {System.out.println("load(): Application loading");}
				doc = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getUnid());
				setApplicantName(doc.getItemValueString("ApplicantName"));
				setSponsorName(doc.getItemValueString("SponsorName"));
				setSponsorAddress(doc.getItemValueString("SponsorAddress"));
				setSponsorAddress_Label(doc.getItemValueString("SponsorAddress_Label"));
				setContactId(doc.getItemValueString("ContactId"));
				setClinicalTrialType(doc.getItemValueString("ClinicalTrialType"));
				setApplicationId(doc.getItemValueString("ApplicationId"));
				setApplicationStatus(doc.getItemValueString("ApplicationStatus"));
				setApplicationStage(doc.getItemValueString("ApplicationStage"));
				setApplicationVersion(doc.getItemValueString("ApplicationVersion"));
				setDataSection(doc.getItemValueString("DataSection"));
				setValidationStatus(doc.getItemValueString("ValidationStatus"));
				setValidationJSON(doc.getItemValueString("ValidationJSON"));
				setClientReference(doc.getItemValueString("ClientReference"));
				setExplicitKey(doc.getItemValueString("ApplicationId"));
				setClientId(doc.getItemValueString("ClientId"));
				setClientName(doc.getItemValueString("ClientName"));
				setWebReaders(doc.getItemValue("WebReaders"));
				setWebAuthors(doc.getItemValue("WebAuthors"));
				setSponsorID(doc.getItemValueString("SponsorID"));
				setApplicationId(doc.getItemValueString("ApplicationId"));
				setLastSelectedTab(doc.getItemValueString("LastSelectedTab"));
				if (getApplicationStatus().equalsIgnoreCase("draft")) {
					set_validApp(false);
				} else {
					set_validApp(true);
				}
			}
		} catch (NotesException ne) {
			System.out.println("Notes Exception [Application.java] load(): " + ne);
		} catch (Exception e) {
			System.out.println("Java Exception [Application.java] load(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(doc);
			if (is_debug()) {System.out.println("load(): Application loaded");}
		}
		
	}

	public void loadSubmission() {
		Document doc = null;
		try {
			if (is_debug()) {
				System.out.println("loadSubmission invoked");
			}
			doc = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getUnid());
			if (StringUtil.isEmpty(getSubmissionId())) {
				Session _sessionAsSigner = null;
				FacesContext context = FacesContext.getCurrentInstance();
				_sessionAsSigner = (Session) context.getApplication().getVariableResolver().resolveVariable(context,"sessionAsSigner");
				Agent agt = _sessionAsSigner.getCurrentDatabase().getAgent("(SetSubmissionID)");
				if (agt != null) {
					agt.runWithDocumentContext(doc);
					au.gov.tga.ct.Utils.incinerate(agt);
				}
			}
			doc.replaceItemValue("SubmissionCost", 0);
			doc.replaceItemValue("ApplicationStatus", "Submitted");
			setApplicationStatus("Submitted");
			doc.save();
		} catch (NotesException e) {
			System.out.println("Notes Exception [Application.java] loadSubmission(): " + e);
		} catch (Exception e) {
			System.out.println("Java Exception [Application.java] loadSubmission(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(doc);
		}
	}

	@SuppressWarnings("unchecked")
	public String getApplicationClientId() {
		Session sess = null;
		Database userm = null;
		Name user = null;
		try {
			sess = ExtLibUtil.getCurrentSession();
			FacesContext context = FacesContext.getCurrentInstance();
			Map sessionScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("sessionScope");
			String tmp = sessionScope.get("usermanagedb").toString();
			String[] dbpath = tmp.split("!!");
			userm = sess.getDatabase("", dbpath[1]);

			ArrayList<?> cid = au.gov.tga.ct.Utils.Dblookup(userm, "LULM", sess.getEffectiveUserName(), "ClientID");
			String clientid = (String) cid.get(0);
			setClientId(clientid);
			
			context.getExternalContext().getSessionMap().put("clientid",clientid);
			context.getExternalContext().getSessionMap().put("username",sess.getEffectiveUserName());

			ArrayList<?> accountname = au.gov.tga.ct.Utils.Dblookup(userm,"LUUserByUserId", sess.getEffectiveUserName(), "UserName");
			context.getExternalContext().getSessionMap().put("accountname",(String) accountname.get(0));

		} catch (NotesException e) {
			System.out.println("Notes Exception [Application.java] getApplicationClientId(): " + e);
		} catch (Exception e) {
			System.out.println("Java Exception [Application.java] getApplicationClientId(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(userm, user);
		}

		return "";

	}

	@SuppressWarnings("unchecked")
	public String getClientTypes() {
		Session sess = null;
		Database clientw = null;
		String cid = getClientId();
		if (is_debug()) {System.out.println("getClientTypes invoked");}
		try {
			sess = ExtLibUtil.getCurrentSession();
			//FacesContext context = FacesContext.getCurrentInstance();
			Map sessionScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("sessionScope");
			String tmp = sessionScope.get("clientwdb").toString();
			String[] dbpath = tmp.split("!!");
			clientw = sess.getDatabase("", dbpath[1]);
			if(cid != null){
				ArrayList<?> agentresult = au.gov.tga.ct.Utils.Dblookup(clientw,"LUClientType", cid, "ClientType");
				if (is_debug()) {System.out.println("Client type: " + agentresult.get(0));}
			}
		} catch (NotesException e) {
			System.out.println("Notes Exception [Application.java] getClientTypes(): " + e);
		} catch (Exception e) {
			System.out.println("Java Exception [Application.java] getClientTypes(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(clientw);
			if (is_debug()) {System.out.println("getClientTypes complete");}
		}
		return "";
	}

	public boolean isNewNote() {
		boolean flag = false;
		if (StringUtil.isEmpty(getUnid())) {
			flag = true;
		} else {
			flag = false;
		}
		return flag;
	}

	public String getApplicantName() {
		return ApplicantName;
	}

	public void setApplicantName(String applicantName) {
		ApplicantName = applicantName;
	}

	public String getSponsorName() {
		return SponsorName;
	}

	public void setSponsorName(String sponsorName) {
		SponsorName = sponsorName;
	}

	public String getSponsorID() {
		return SponsorID;
	}

	public void setSponsorID(String sponsorID) {
		SponsorID = sponsorID;
	}

	public String getSponsorAddress() {
		return SponsorAddress;
	}

	public void setSponsorAddress(String sponsorAddress) {
		SponsorAddress = sponsorAddress;
	}

	/**
	 * @param sponsorAddress_Label
	 *            the sponsorAddress_Label to set
	 */
	public void setSponsorAddress_Label(String sponsorAddress_Label) {
		SponsorAddress_Label = sponsorAddress_Label;
	}

	/**
	 * @return the sponsorAddress_Label
	 */
	public String getSponsorAddress_Label() {
		return SponsorAddress_Label;
	}

	/**
	 * @param contactId
	 *            the contactId to set
	 */
	public void setContactId(String contactId) {
		ContactId = contactId;
	}

	/**
	 * @return the contactId
	 */
	public String getContactId() {
		return ContactId;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setClinicalTrialType(String type) {
		ClinicalTrialType = type;
	}

	/**
	 * @return the type
	 */
	public String getClinicalTrialType() {
		return ClinicalTrialType;
	}

	public String getUnid() {
		return unid;
	}

	public void setUnid(String unid) {
		this.unid = unid;
	}

	public String getApplicationId() {
		return ApplicationId;
	}

	public String getExplicitKey() {
		return ExplicitKey;
	}

	public void setExplicitKey(String explicitKey) {
		ExplicitKey = explicitKey;
	}

	public String getClientId() {
		return ClientId;
	}

	public void setClientId(String clientId) {
		ClientId = clientId;
	}

	public void setApplicationId(String applicationId) {
		ApplicationId = applicationId;
	}

	public String getClientReference() {
		return ClientReference;
	}

	public void setClientReference(String clientReference) {
		ClientReference = clientReference;
	}

	/**
	 * @param applicationStage
	 *            the applicationStage to set
	 */
	public void setApplicationStage(String applicationStage) {
		ApplicationStage = applicationStage;
	}

	/**
	 * @return the applicationStage
	 */
	public String getApplicationStage() {
		return ApplicationStage;
	}

	public String getApplicationStatus() {
		return ApplicationStatus;
	}

	public void setApplicationStatus(String applicationStatus) {
		ApplicationStatus = applicationStatus;
	}

	/**
	 * @param applicationVersion
	 *            the applicationVersion to set
	 */
	public void setApplicationVersion(String applicationVersion) {
		ApplicationVersion = applicationVersion;
	}

	/**
	 * @return the applicationVersion
	 */
	public String getApplicationVersion() {
		return ApplicationVersion;
	}

	/**
	 * @param validationStatus
	 *            the validationStatus to set
	 */
	public void setValidationStatus(String validationStatus) {
		ValidationStatus = validationStatus;
	}

	/**
	 * @return the validationStatus
	 */
	public String getValidationStatus() {
		return ValidationStatus;
	}

	/**
	 * @param validationJSON
	 *            the validationJSON to set
	 */
	public void setValidationJSON(String validationJSON) {
		ValidationJSON = validationJSON;
	}

	/**
	 * @return the validationJSON
	 */
	public String getValidationJSON() {
		return ValidationJSON;
	}

	/**
	 * @param lastSelectedTab
	 *            the lastSelectedTab to set
	 */
	public void setLastSelectedTab(String lastSelectedTab) {
		LastSelectedTab = lastSelectedTab;
	}

	/**
	 * @return the lastSelectedTab
	 */
	public String getLastSelectedTab() {
		return LastSelectedTab;
	}

	public Object getWebReaders() {
		return WebReaders;
	}

	@SuppressWarnings("unchecked")
	public void setWebReaders(Object webReaders) {
		if (webReaders == null) {
			webReaders = null;
		}

		if (webReaders instanceof String) {
			Vector readerList = new Vector();
			readerList.add((String) webReaders);
			webReaders = readerList;
		}

		if (webReaders instanceof List) {
			webReaders = (Vector) webReaders;
		}

		WebReaders = webReaders;
	}

	public Object getWebAuthors() {
		return WebAuthors;
	}

	@SuppressWarnings("unchecked")
	public void setWebAuthors(Object webAuthors) {

		if (webAuthors == null) {
			webAuthors = null;
		}

		if (webAuthors instanceof String) {
			Vector readerList = new Vector();
			readerList.add((String) webAuthors);
			webAuthors = readerList;
		}

		if (webAuthors instanceof List) {
			webAuthors = (Vector) webAuthors;
		}
		WebAuthors = webAuthors;
	}

	public boolean is_debug() {
		return _debug;
	}

	public void set_debug(boolean _debug) {
		this._debug = _debug;
	}

	public boolean is_validApp() {
		return _validApp;
	}

	public void set_validApp(boolean app) {
		_validApp = app;
	}

	public String getSubmissionId() {
		return SubmissionId;
	}

	public void setSubmissionId(String submissionId) {
		SubmissionId = submissionId;
	}

	/**
	 * @param applicationFees
	 *            the applicationFees to set
	 */
	public void setApplicationFees(Double applicationFees) {
		ApplicationFees = applicationFees;
	}

	/**
	 * @return the applicationFees
	 */
	public Double getApplicationFees() {
		return ApplicationFees;
	}

	/**
	 * @param dataSection
	 *            the dataSection to set
	 */
	public void setDataSection(String dataSection) {
		DataSection = dataSection;
	}

	/**
	 * @return the dataSection
	 */
	public String getDataSection() {
		return DataSection;
	}

	/**
	 * @param titleOfStudy
	 *            the titleOfStudy to set
	 */
	public void setTitleOfStudy(String titleOfStudy) {
		TitleOfStudy = titleOfStudy;
	}

	/**
	 * @return the titleOfStudy
	 */
	public String getTitleOfStudy() {
		return TitleOfStudy;
	}

	/**
	 * @param protocolNumber
	 *            the protocolNumber to set
	 */
	public void setProtocolNumber(String protocolNumber) {
		ProtocolNumber = protocolNumber;
	}

	/**
	 * @return the protocolNumber
	 */
	public String getProtocolNumber() {
		return ProtocolNumber;
	}

	/**
	 * @param isActiveVersion
	 *            the isActiveVersion to set
	 */
	public void setIsActiveVersion(String isActiveVersion) {
		this.IsActiveVersion = isActiveVersion;
	}

	/**
	 * @return the isActiveVersion
	 */
	public String getIsActiveVersion() {
		return IsActiveVersion;
	}

	public void setClientName(String clientName) {
		ClientName = clientName;
	}

	public String getClientName() {
		return ClientName;
	}
}