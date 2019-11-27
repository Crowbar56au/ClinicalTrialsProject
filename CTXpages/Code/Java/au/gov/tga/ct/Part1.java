package au.gov.tga.ct;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.faces.context.FacesContext;

import lotus.domino.Database; //import lotus.domino.DateTime;
import lotus.domino.DateTime;
import lotus.domino.Document;
import lotus.domino.Item;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.StringUtil;
import com.ibm.xsp.extlib.util.ExtLibUtil;

@SuppressWarnings("unused")
public class Part1 implements Serializable {
	private static final long serialVersionUID = 1L;
	private String ContactName;
	private String ContactEmail;
	private String ContactPhone;
	private String ProtocolNumber;
	private Date StartDate;
	private Date ExpectedCompletionDate;
	private String IsPotentialRestrictedGoodUsed;
	private String TrialTherapeuticArea;
	private List<String> TrialClassification = new ArrayList<String>();
	private String TotalPatients;
	private String TitleOfStudy;
	private List<String> TrialType = new ArrayList<String>();
	private String Type;
	private String TrialTypeDescription;
	private String GMO;
	private String Nanoparticles;
	private String GeneTherapyDetails;
	private String PrecedingTrials;
	private String BiologicalProductDescription;
	private String BiologicalNotInPhaseOne;
	private String BiologicalManufacturerDetails;
	private String ApplicationId;
	private String ApplicationStage;
	private String ApplicationVersion;
	private String DataSection;
	private String ExplicitKey;
	private String unid;
	private String IsActiveVersion;
	private String documentid;
	private String RecordUNID;
	
	private Object WebReaders;
	private Object WebAuthors;
	boolean debug = false;

	public Part1() throws NotesException {
		Database db = ExtLibUtil.getCurrentDatabase();		
		setDebug(new GetDebugLevel().getDebug(db));
		
		if (isDebug()) {System.out.println("Part1 invoked");}
		setDocumentid(ExtLibUtil.readParameter(FacesContext.getCurrentInstance(), "partonedocumentId"));
		if (StringUtil.isNotEmpty(getDocumentid())) {
			load();
		}
		if (isDebug()) {System.out.println("Part1 complete");}
	}

	@SuppressWarnings("unchecked")
	public void load() {
		
		Document doc = null;
		
		try {
			doc = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getDocumentid());
			if (isDebug()) {System.out.println("load(): Part1 loading");}
			if (doc != null) {
//				if (isDebug()) {System.out.println("load(): Part1 document good");}
				setApplicationId(doc.getItemValueString("ApplicationId"));
				setApplicationVersion(doc.getItemValueString("ApplicationVersion"));
				setExplicitKey(getApplicationId() + "~" + getApplicationVersion() + "~Part1");
				setDataSection(doc.getItemValueString("DataSection"));
				setContactName(doc.getItemValueString("ContactName"));
				setContactPhone(doc.getItemValueString("ContactPhone"));
				setContactEmail(doc.getItemValueString("ContactEmail"));
				setProtocolNumber(doc.getItemValueString("ProtocolNumber"));
				if(doc.getFirstItem("StartDate").getDateTimeValue() != null){
					setStartDate(doc.getFirstItem("StartDate").getDateTimeValue().toJavaDate());
				}
				if(doc.getFirstItem("ExpectedCompletionDate").getDateTimeValue() != null){
					setExpectedCompletionDate(doc.getFirstItem("ExpectedCompletionDate").getDateTimeValue().toJavaDate());
				}
				setRecordUNID(doc.getItemValueString("RecordUNID"));
				setIsPotentialRestrictedGoodUsed(doc.getItemValueString("IsPotentialRestrictedGoodUsed"));
				setTitleOfStudy(doc.getItemValueString("TitleOfStudy"));
				setTrialType(doc.getItemValue("TrialType"));
				setTrialTypeDescription(doc.getItemValueString("TrialTypeDescription"));
				setTrialClassification(doc.getItemValue("TrialClassification"));
				setTotalPatients(doc.getItemValueString("TotalPatients"));
				setTrialTherapeuticArea(doc.getItemValueString("TrialTherapeuticArea"));
				setGMO(doc.getItemValueString("GMO"));
				setNanoparticles(doc.getItemValueString("Nanoparticles"));
				setGeneTherapyDetails(doc.getItemValueString("GeneTherapDetails"));
			} else {
				if (isDebug()) {System.out.println("load(): Part1 document is null for new document");}
			}
		} catch (NotesException ne) {
			System.out.println("Notes Exception [Part1.java] load(): " + ne);
		} catch (Exception e) {
			System.out.println("Java Exception [Part1.java] load(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(doc);
			if (isDebug()) {System.out.println("load(): Part1 loaded");}
		}
		
	}
	
	public boolean isNewNote() {
		boolean flag = false;
		if (StringUtil.isEmpty(getDocumentid())) {
			flag = true;
		} else {
			flag = false;
		}
		return flag;
	}
	
	public void kickOff(){
		//only function is to instantiate the bean
		if (isDebug()) {System.out.println("kickOff(): instantiate the Part1 bean");}
	}
	
	@SuppressWarnings("unchecked")
	public static Vector<Object> translateToVector( Object object ){
		if( object instanceof String ){
			Vector<Object> list = new Vector<Object>();
			list.add( object );
			return list;
		}
		 
		if( object instanceof List ){
			return (Vector<Object>)object;
		}
		
		return null;
	}
	
	public boolean isDebug() {
		return debug;
	}

	public void setDebug(boolean _debug) {
		this.debug = _debug;
	}

	public void setContactName(String contactName) {
		ContactName = contactName;
	}

	public String getContactName() {
		return ContactName;
	}

	public void setContactEmail(String contactEmail) {
		ContactEmail = contactEmail;
	}

	public String getContactEmail() {
		return ContactEmail;
	}

	public String getContactPhone() {
		return ContactPhone;
	}

	public void setContactPhone(String contactPhone) {
		ContactPhone = contactPhone;
	}

	public String getProtocolNumber() {
		System.out.println("Part1 getProtocolNumber: " + ProtocolNumber);
		return ProtocolNumber;
	}

	public void setProtocolNumber(String protocolNumber) {
		ProtocolNumber = protocolNumber;
	}

	/**
	 * @param startDate
	 *            the startDate to set
	 */
	public void setStartDate(Date startDate) {
		StartDate = startDate;
	}

	/**
	 * @return the startDate
	 */
	public Date getStartDate() {
		try{
			if(StartDate == null){
				//StartDate = new Date();
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return StartDate;
	}

	public Date getExpectedCompletionDate() {
		
		try{
			if(ExpectedCompletionDate == null){
//				ExpectedCompletionDate = new Date();
			}
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return ExpectedCompletionDate;
	}

	public void setExpectedCompletionDate(Date expectedCompletionDate) {
		ExpectedCompletionDate = expectedCompletionDate;
	}

	public String getIsPotentialRestrictedGoodUsed() {
		return IsPotentialRestrictedGoodUsed;
	}

	public void setIsPotentialRestrictedGoodUsed(String isPotentialRestrictedGoodUsed) {
		IsPotentialRestrictedGoodUsed = isPotentialRestrictedGoodUsed;
	}

	public String getTrialTherapeuticArea() {
		return TrialTherapeuticArea;
	}

	public void setTrialTherapeuticArea(String trialTherapeuticArea) {
		TrialTherapeuticArea = trialTherapeuticArea;
	}

	public List<String> getTrialClassification() {
		return TrialClassification;
	}

	public void setTrialClassification(List<String> trialClassification) {
		TrialClassification = trialClassification;
	}

	public String getTotalPatients() {
		return TotalPatients;
	}

	public void setTotalPatients(String totalPatients) {
		TotalPatients = totalPatients;
	}

	public String getTitleOfStudy() {
		return TitleOfStudy;
	}

	public void setTitleOfStudy(String titleOfStudy) {
		TitleOfStudy = titleOfStudy;
	}
	
	public List<String> getTrialType() {
	    return TrialType;
	}
	
	public void setTrialType(List<String> trialType) {
		TrialType = trialType;
	}
	
	public String getTrialTypeDescription() {
		return TrialTypeDescription;
	}

	public void setTrialTypeDescription(String trialTypeDescription) {
		TrialTypeDescription = trialTypeDescription;
	}

	/**
	 * @param type
	 *            the type to set
	 */
	public void setType(String type) {
		Type = type;
	}

	/**
	 * @return the type
	 */
	public String getType() {
		return Type;
	}

	public String getGMO() {
		return GMO;
	}

	public void setGMO(String gmo) {
		GMO = gmo;
	}

	public String getNanoparticles() {
		return Nanoparticles;
	}

	public void setNanoparticles(String nanoParticles) {
		Nanoparticles = nanoParticles;
	}

	public String getGeneTherapyDetails() {
		return GeneTherapyDetails;
	}

	public void setGeneTherapyDetails(String geneTherapyDetails) {
		GeneTherapyDetails = geneTherapyDetails;
	}

	public String getPrecedingTrials() {
		return PrecedingTrials;
	}

	public void setPrecedingTrials(String precedingTrials) {
		PrecedingTrials = precedingTrials;
	}

	public String getBiologicalProductDescription() {
		return BiologicalProductDescription;
	}

	public void setBiologicalProductDescription(
			String biologicalProductDescription) {
		BiologicalProductDescription = biologicalProductDescription;
	}

	public String getBiologicalNotInPhaseOne() {
		return BiologicalNotInPhaseOne;
	}

	public void setBiologicalNotInPhaseOne(String biologicalNotInPhaseOne) {
		BiologicalNotInPhaseOne = biologicalNotInPhaseOne;
	}

	public String getBiologicalManufacturerDetails() {
		return BiologicalManufacturerDetails;
	}

	public void setBiologicalManufacturerDetails(
			String biologicalManufacturerDetails) {
		BiologicalManufacturerDetails = biologicalManufacturerDetails;
	}

	/**
	 * @param unid
	 *            the unid to set
	 */
	public void setUnid(String unid) {
		this.unid = unid;
	}

	/**
	 * @return the unid
	 */
	public String getUnid() {
		return unid;
	}

	/**
	 * @param applicationId
	 *            the applicationId to set
	 */
	public void setApplicationId(String applicationId) {
		ApplicationId = applicationId;
	}

	/**
	 * @return the applicationId
	 */
	public String getApplicationId() {
		return ApplicationId;
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
	 * @param explicitKey
	 *            the explicitKey to set
	 */
	public void setExplicitKey(String explicitKey) {
		ExplicitKey = explicitKey;
	}

	/**
	 * @return the explicitKey
	 */
	public String getExplicitKey() {
		return ExplicitKey;
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
			Vector<String> readerList = new Vector<String>();
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
			Vector<String> readerList = new Vector<String>();
			readerList.add((String) webAuthors);
			webAuthors = readerList;
		}

		if (webAuthors instanceof List) {
			webAuthors = (Vector) webAuthors;
		}
		WebAuthors = webAuthors;
	}

	/**
	 * @param documentid
	 *            the documentid to set
	 */
	public void setDocumentid(String documentid) {
		this.documentid = documentid;
	}

	/**
	 * @return the documentid
	 */
	public String getDocumentid() {
		return documentid;
	}

	/**
	 * @param isActiveVersion
	 *            the isActiveVersion to set
	 */
	public void setIsActiveVersion(String isActiveVersion) {
		IsActiveVersion = isActiveVersion;
	}

	/**
	 * @return the isActiveVersion
	 */
	public String getIsActiveVersion() {
		return IsActiveVersion;
	}

	public void setRecordUNID(String recordUNID) {
		RecordUNID = recordUNID;
	}

	public String getRecordUNID() {
		return RecordUNID;
	}
}
