package au.gov.tga.ct;

import java.io.Serializable;
import java.util.Date;
import java.util.Map;
//import javax.faces.context.FacesContext;
import lotus.domino.Database; 
import lotus.domino.View;
import lotus.domino.DateTime;
import lotus.domino.Document; 
import lotus.domino.Item;
import lotus.domino.NotesException;
import lotus.domino.Session;
import com.ibm.commons.util.StringUtil;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class Site implements Serializable {

	private static final long serialVersionUID = 1L;
	private String ApplicationId;
	private String ApplicationVersion;
	private String ExplicitKey;
	private Date ExpectedSiteStartDate;
	private String Type;
	private String ClinicalTrialType;
	private String RecordUNID;
	private String unid;
	private String documentid;
	private Object WebReaders;
	private Object WebAuthors;
	private String DataSection;
	private String IsActiveVersion;
	private String PrincipalInvestigatorName;
	private String PrincipalInvestigatorContactPhone;
	private String PrincipalInvestigatorContactEmail;
	private String HRECName;
	private String HRECCode;
	private String HRECContactOfficer;
	private String HRECPosition;
	private String HRECContactPhone;
	private String HRECContactEmail;
	private String ApprovingAuthorityContactEmail;
	private String ApprovingAuthorityContactPhone;
	private String ApprovingAuthorityName;
	private String ApprovingAuthorityOfficer;
	private String ApprovingAuthorityPosition;
	private String TrialSite;
	private String TrialSiteAddress;
	private String TrialSiteState;
	private String TrialSiteState_Label;
	private boolean debug = false;
	private boolean validApp = false;
	private Document appdoc = null;
	
	@SuppressWarnings("unchecked")
	public Site() throws NotesException {
		@SuppressWarnings("unused")
		Session sess = null;
		Database db = ExtLibUtil.getCurrentDatabase();
		setDebug(new GetDebugLevel().getDebug(db));
		if (isDebug()) {
			System.out.println("Site.java bean loading");
		}
		sess = ExtLibUtil.getCurrentSession();
		//FacesContext context = FacesContext.getCurrentInstance();
		Map viewScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("viewScope");
		String id = viewScope.get("siteUNID").toString();
		setApplicationId(viewScope.get("applicationid").toString());
		
		if (StringUtil.isNotEmpty(id)) {
			setDocumentid(id);
		}
		
		if(appdoc != null){
			setApplicationVersion(appdoc.getItemValueString("ApplicationVersion"));
		}
		
		if (StringUtil.isNotEmpty(id)) {
			load(id);
		}
	}
	
	public void load(final String unid) {
		setUnid(unid);
		Document doc = null;
		try {
			if (StringUtil.isNotEmpty(getUnid())) {
				doc = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getUnid());
				setApplicationId(doc.getItemValueString("ApplicationId"));
				setApplicationVersion(doc.getItemValueString("ApplicationVersion"));
				setExplicitKey(doc.getItemValueString("ExplicitKey"));
				setIsActiveVersion(doc.getItemValueString("IsActiveVersion"));
				setRecordUNID(doc.getItemValueString("RecordUNID"));
				setDataSection(doc.getItemValueString("DataSection"));
				setType(doc.getItemValueString("Type"));
				setClinicalTrialType(doc.getItemValueString("ClinicalTrialType"));
				setTrialSite(doc.getItemValueString("TrialSite"));
				setTrialSiteAddress(doc.getItemValueString("TrialSiteAddress"));
				setTrialSiteState(doc.getItemValueString("TrialSiteState"));
				setTrialSiteState_Label(doc.getItemValueString("TrialSiteState_Label"));
				if(doc.getFirstItem("ExpectedSiteStartDate").getDateTimeValue() != null){
					setExpectedSiteStartDate(doc.getFirstItem("ExpectedSiteStartDate").getDateTimeValue().toJavaDate());
				}
				setPrincipalInvestigatorName(doc.getItemValueString("PrincipalInvestigatorName"));
				setPrincipalInvestigatorContactPhone(doc.getItemValueString("PrincipalInvestigatorContactPhone"));
				setPrincipalInvestigatorContactEmail(doc.getItemValueString("PrincipalInvestigatorContactEmail"));
				setHRECName(doc.getItemValueString("HRECName"));
				setHRECCode(doc.getItemValueString("HRECCode"));
				setHRECContactOfficer(doc.getItemValueString("HRECContactOfficer"));
				setHRECPosition(doc.getItemValueString("HRECPosition"));
				setHRECContactPhone(doc.getItemValueString("HRECContactPhone"));
				setHRECContactEmail(doc.getItemValueString("HRECContactEmail"));
				setApprovingAuthorityName(doc.getItemValueString("ApprovingAuthorityName"));
				setApprovingAuthorityOfficer(doc.getItemValueString("ApprovingAuthorityOfficer"));
				setApprovingAuthorityPosition(doc.getItemValueString("ApprovingAuthorityPosition"));
				setApprovingAuthorityContactPhone(doc.getItemValueString("ApprovingAuthorityContactPhone"));
				setApprovingAuthorityContactEmail(doc.getItemValueString("ApprovingAuthorityContactEmail"));
			}else{//its a new document
				reset();
			}
			if (isDebug()) {System.out.println("Site " + getTrialSite()+ ", " + getTrialSiteAddress() + " loaded");}
			
		} catch (NotesException ne) {
			System.out.println("Notes Exception [Site.java] load(): " + ne);
		} catch (Exception e) {
			System.out.println("Java Exception [Site.java] load(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(doc);
		}
	}
	
	public boolean saveData() {
		boolean result = false;
		Item webread = null;
		Item webauth = null;
		Document doc = null;
		Document s = null;
		String ID = "";
		
		Session sess = null;
		if (isDebug()) {System.out.println("Save Site invoked");}
		
		try {
			sess = ExtLibUtil.getCurrentSession();
			ID = (String)sess.evaluate("@Unique").elementAt(0);
			if (getDocumentid() != null) {
				s = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getDocumentid());
			}
			
			if (s != null) {
				setIsActiveVersion(s.getItemValueString("IsActiveVersion"));
				setDataSection(s.getItemValueString("DataSection"));
				if (isDebug()) {System.out.println("Save Site: Application doc is NOT null");}
			} else {
				if (isDebug()) {System.out.println("Save Site: new document");}
			}
			
			if (StringUtil.isEmpty(getUnid())) {
				if(appdoc != null){
					if(appdoc.getItemValueString("DataSection").equalsIgnoreCase("1")){
						setExplicitKey(getApplicationId() + "~" + getApplicationVersion() + "~Part1~Site~" + ID);
					} else if(appdoc.getItemValueString("DataSection").equalsIgnoreCase("3")) {
						setExplicitKey(getApplicationId() + "~" + getApplicationVersion() + "~UpdateDetails~Site" + ID);
					} else {
						
					}
				}
			}else{
				doc = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getUnid());
			}
			if (isDebug()) {System.out.println("Save Site explicitKey: " + getExplicitKey());}
			
			if (doc == null) {
				doc = ExtLibUtil.getCurrentDatabase().createDocument();
				setUnid(doc.getUniversalID());
				doc.replaceItemValue("Form", "Site");
				doc.replaceItemValue("Type", "Site");
				doc.replaceItemValue("ApplicationID", getApplicationId());
				doc.replaceItemValue("ApplicationVersion", getApplicationVersion());
				doc.replaceItemValue("ExplicitKey", getExplicitKey());
				doc.replaceItemValue("RecordUNID", getExplicitKey());
				doc.replaceItemValue("ClinicalTrialType", "CTN");
				doc.replaceItemValue("IsActiveVersion", getIsActiveVersion());
				doc.replaceItemValue("DataSection", getDataSection());
			}
			
			doc.replaceItemValue("TrialSite", getTrialSite());
			doc.replaceItemValue("TrialSiteAddress", getTrialSiteAddress());
			doc.replaceItemValue("TrialSiteState", getTrialSiteState());
			doc.replaceItemValue("TrialSiteState_Label", getTrialSiteState_Label());
			
			try{
    	    	DateTime tmpExpectedSiteStartDate = (DateTime) sess.createDateTime(ExpectedSiteStartDate);
    	    	doc.replaceItemValue("ExpectedSiteStartDate", tmpExpectedSiteStartDate);
    	    } catch (NotesException e){
    	    	doc.replaceItemValue("ExpectedSiteStartDate", "");
    	    }
			
    	    doc.replaceItemValue("PrincipalInvestigatorName", getPrincipalInvestigatorName());
    	    doc.replaceItemValue("PrincipalInvestigatorContactPhone", getPrincipalInvestigatorContactPhone());
    	    doc.replaceItemValue("PrincipalInvestigatorContactEmail", getPrincipalInvestigatorContactEmail());
    	    doc.replaceItemValue("HRECName", getHRECName());
    	    doc.replaceItemValue("HRECCode", getHRECCode());
    	    doc.replaceItemValue("HRECContactOfficer", getHRECContactOfficer());
    	    doc.replaceItemValue("HRECPosition", getHRECPosition());
    	    doc.replaceItemValue("HRECContactPhone", getHRECContactPhone());
    	    doc.replaceItemValue("HRECContactEmail", getHRECContactEmail());
    	    doc.replaceItemValue("ApprovingAuthorityName", getApprovingAuthorityName());
    	    doc.replaceItemValue("ApprovingAuthorityOfficer", getApprovingAuthorityOfficer());
    	    doc.replaceItemValue("ApprovingAuthorityPosition", getApprovingAuthorityPosition());
    	    doc.replaceItemValue("ApprovingAuthorityContactPhone", getApprovingAuthorityContactPhone());
    	    doc.replaceItemValue("ApprovingAuthorityContactEmail", getApprovingAuthorityContactEmail());
    	    
			doc.replaceItemValue("WebReaders", getWebReaders());
			webread = doc.getFirstItem("WebReaders");
			if (!webread.isReaders()) {
				webread.setReaders(true);
			}
			doc.replaceItemValue("WebAuthors", getWebAuthors());
			webauth = doc.getFirstItem("WebAuthors");
			if (!webauth.isAuthors()) {
				webauth.setAuthors(true);
			}
			doc.computeWithForm(true, false);
			
			result = doc.save();
			if(result){
				if (isDebug()) {System.out.println("Save Site complete");}
			}
			
		}catch (NotesException ne) {
			System.out.println("Notes Exception [Site.java] saveData(): " + ne);
		} catch (Exception e) {
			System.out.println("Java Exception [Site.java] saveData(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(s,doc);
		}
		
		return result;
	}
	
	public void reset(){
		try{
			setApplicationId(getApplicationId());
			setApplicationVersion(getApplicationVersion());
			setIsActiveVersion(getIsActiveVersion());
			setDataSection(getDataSection());
			setType(getType());
			setClinicalTrialType("CTN");
			setRecordUNID("");
			setExplicitKey("");
			setTrialSite("");
			setTrialSiteAddress("");
			setTrialSiteState("");
			setTrialSiteState_Label("");
			setExpectedSiteStartDate(null);
			setPrincipalInvestigatorName("");
			setPrincipalInvestigatorContactPhone("");
			setPrincipalInvestigatorContactEmail("");
			setHRECName("");
			setHRECCode("");
			setHRECContactOfficer("");
			setHRECPosition("");
			setHRECContactPhone("");
			setHRECContactEmail("");
			setApprovingAuthorityName("");
			setApprovingAuthorityOfficer("");
			setApprovingAuthorityPosition("");
			setApprovingAuthorityContactPhone("");
			setApprovingAuthorityContactEmail("");
			
		} catch (Exception e) {
			System.out.println("Java Exception [Site.java] reset(): " + e);
		} finally {
			
		}
	}
	
	@SuppressWarnings("unchecked")
	public boolean isNewNote(){
		boolean flag = false;
		
		try{
			Map viewScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("viewScope");
			String tmp = viewScope.get("siteUNID").toString();
			
			if (StringUtil.isEmpty(tmp)) {
				flag = true;
			} else {
				flag = false;
			}
		
		}catch(Exception e){
			System.out.println("Java Exception [Site.java] isNewNote(): " + e);
		}finally{
			
		}
		
		return flag;
	
	}
	
	public String getApplicationVersion() {
		return ApplicationVersion;
	}

	public void setApplicationVersion(String applicationVersion) {
		ApplicationVersion = applicationVersion;
	}

	public String getExplicitKey() {
		return ExplicitKey;
	}

	public void setExplicitKey(String explicitKey) {
		ExplicitKey = explicitKey;
	}

	public Date getExpectedSiteStartDate() {
		return ExpectedSiteStartDate;
	}

	public void setExpectedSiteStartDate(Date expectedSiteStartDate) {
		ExpectedSiteStartDate = expectedSiteStartDate;
	}

	public String getType() {
		return Type;
	}

	public void setType(String type) {
		Type = type;
	}

	public Object getWebReaders() {
		return WebReaders;
	}

	public void setWebReaders(Object webReaders) {
		WebReaders = webReaders;
	}

	public Object getWebAuthors() {
		return WebAuthors;
	}

	public void setWebAuthors(Object webAuthors) {
		WebAuthors = webAuthors;
	}

	public String getDataSection() {
		return DataSection;
	}

	public void setDataSection(String dataSection) {
		DataSection = dataSection;
	}

	public String getIsActiveVersion() {
		return IsActiveVersion;
	}

	public void setIsActiveVersion(String isActiveVersion) {
		IsActiveVersion = isActiveVersion;
	}

	public String getApprovingAuthorityContactEmail() {
		return ApprovingAuthorityContactEmail;
	}

	public void setApprovingAuthorityContactEmail(
			String approvingAuthorityContactEmail) {
		ApprovingAuthorityContactEmail = approvingAuthorityContactEmail;
	}

	public String getApprovingAuthorityContactPhone() {
		return ApprovingAuthorityContactPhone;
	}

	public void setApprovingAuthorityContactPhone(
			String approvingAuthorityContactPhone) {
		ApprovingAuthorityContactPhone = approvingAuthorityContactPhone;
	}

	public String getApprovingAuthorityName() {
		return ApprovingAuthorityName;
	}

	public void setApprovingAuthorityName(String approvingAuthorityName) {
		ApprovingAuthorityName = approvingAuthorityName;
	}

	public String getApprovingAuthorityOfficer() {
		return ApprovingAuthorityOfficer;
	}

	public void setApprovingAuthorityOfficer(String approvingAuthorityOfficer) {
		ApprovingAuthorityOfficer = approvingAuthorityOfficer;
	}

	public String getApprovingAuthorityPosition() {
		return ApprovingAuthorityPosition;
	}

	public void setApprovingAuthorityPosition(String approvingAuthorityPosition) {
		ApprovingAuthorityPosition = approvingAuthorityPosition;
	}	
	
	public boolean isDebug() {
		return debug;
	}
	
	public void setDebug(boolean _debug) {
		this.debug = _debug;
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
	
	public void setApplicationId(String applicationId) {
		ApplicationId = applicationId;
	}
	
	
	public boolean isValidApp() {
		return validApp;
	}
	
	public void setValidApp(boolean app) {
		validApp = app;
	}

	public void setDocumentid(String documentid) {
		this.documentid = documentid;
	}
	
	public String getDocumentid() {
		return documentid;
	}
	
	public void setRecordUNID(String recordUNID) {
		RecordUNID = recordUNID;
	}

	public String getRecordUNID() {
		return RecordUNID;
	}

	public void setClinicalTrialType(String clinicalTrialType) {
		ClinicalTrialType = clinicalTrialType;
	}

	public String getClinicalTrialType() {
		return ClinicalTrialType;
	}

	public void setTrialSite(String trialSite) {
		TrialSite = trialSite;
	}

	public String getTrialSite() {
		return TrialSite;
	}

	public void setTrialSiteAddress(String trialSiteAddress) {
		TrialSiteAddress = trialSiteAddress;
	}

	public String getTrialSiteAddress() {
		return TrialSiteAddress;
	}

	public void setTrialSiteState(String trialSiteState) {
		TrialSiteState = trialSiteState;
	}

	public String getTrialSiteState() {
		return TrialSiteState;
	}

	public void setTrialSiteState_Label(String trialSiteState_Label) {
		TrialSiteState_Label = trialSiteState_Label;
	}

	public String getTrialSiteState_Label() {
		return TrialSiteState_Label;
	}

	public void setPrincipalInvestigatorName(String principalInvestigatorName) {
		PrincipalInvestigatorName = principalInvestigatorName;
	}

	public String getPrincipalInvestigatorName() {
		return PrincipalInvestigatorName;
	}

	public void setPrincipalInvestigatorContactPhone(
			String principalInvestigatorContactPhone) {
		PrincipalInvestigatorContactPhone = principalInvestigatorContactPhone;
	}

	public String getPrincipalInvestigatorContactPhone() {
		return PrincipalInvestigatorContactPhone;
	}

	public void setPrincipalInvestigatorContactEmail(
			String principalInvestigatorContactEmail) {
		PrincipalInvestigatorContactEmail = principalInvestigatorContactEmail;
	}

	public String getPrincipalInvestigatorContactEmail() {
		return PrincipalInvestigatorContactEmail;
	}

	public void setHRECName(String hRECName) {
		HRECName = hRECName;
	}

	public String getHRECName() {
		return HRECName;
	}

	public void setHRECCode(String hRECCode) {
		HRECCode = hRECCode;
	}

	public String getHRECCode() {
		return HRECCode;
	}

	public void setHRECContactOfficer(String hRECContactOfficer) {
		HRECContactOfficer = hRECContactOfficer;
	}

	public String getHRECContactOfficer() {
		return HRECContactOfficer;
	}

	public void setHRECPosition(String hRECPosition) {
		HRECPosition = hRECPosition;
	}

	public String getHRECPosition() {
		return HRECPosition;
	}

	public void setHRECContactPhone(String hRECContactPhone) {
		HRECContactPhone = hRECContactPhone;
	}

	public String getHRECContactPhone() {
		return HRECContactPhone;
	}

	public void setHRECContactEmail(String hRECContactEmail) {
		HRECContactEmail = hRECContactEmail;
	}

	public String getHRECContactEmail() {
		return HRECContactEmail;
	}

	public void setAppdoc(Document appdoc) throws NotesException {
		Database db = ExtLibUtil.getCurrentDatabase();
		View appsview = db.getView("xApplications");
		appdoc = appsview.getDocumentByKey(getApplicationId(), true);
		this.appdoc = appdoc;
	}

	public Document getAppdoc() {
		return appdoc;
	}
	
}
