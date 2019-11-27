package au.gov.tga.ct;

import java.io.Serializable;
import java.util.Map;
import javax.faces.context.FacesContext;
import lotus.domino.Database; 
import lotus.domino.Document; 
import lotus.domino.Item;
import lotus.domino.NotesException;
import lotus.domino.Session;
import lotus.domino.View;

import com.ibm.commons.util.StringUtil;
import com.ibm.xsp.extlib.util.ExtLibUtil;

public class Biological implements Serializable {

	private static final long serialVersionUID = 1L;
	private String ApplicationId;
	private String ApplicationVersion;
	private String ExplicitKey;
	private String Type;
	private String ClinicalTrialType;
	private String RecordUNID;
	private String unid;
	private String documentid;
	private Object WebReaders;
	private Object WebAuthors;
	private String DataSection;
	private String IsActiveVersion;
	private String ProductName;
	private String IsAComboProduct;
	private String Presentation;
	private String DosageForm;
	private String DosageForm_Label;
	private String RouteOfAdmin;
	private String RouteOfAdmin_Label;
	boolean debug = false;
	private Document appdoc = null;
	
	@SuppressWarnings("unchecked")
	public Biological() throws NotesException {
		@SuppressWarnings("unused")
		Session sess = null;
		Database db = ExtLibUtil.getCurrentDatabase();
		setDebug(new GetDebugLevel().getDebug(db));
		
		if (isDebug()) {System.out.println("Biological.java bean invoked");}
		
		sess = ExtLibUtil.getCurrentSession();
		//FacesContext context = FacesContext.getCurrentInstance();
		Map viewScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("viewScope");
		String id = viewScope.get("biologicalUNID").toString();
		setApplicationId(viewScope.get("applicationid").toString());
		if (StringUtil.isNotEmpty(id)) {
			setDocumentid(id);
		}
		
		if(appdoc != null){
			setApplicationVersion(appdoc.getItemValueString("ApplicationVersion"));
		}
		
		if (StringUtil.isNotEmpty(id)) {
			load(id);
		}else{
			if (isDebug()) {System.out.println("A new biological document");}
		}
	}
	
	public void load(final String unid) {
		setUnid(unid);
		Document doc = null;
		try{
			if (isDebug()) {System.out.println("Biological loading");}
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
				setProductName(doc.getItemValueString("ProductName"));
				setIsAComboProduct(doc.getItemValueString("IsAComboProduct"));
				setPresentation(doc.getItemValueString("Presentation"));
				setDosageForm(doc.getItemValueString("DosageForm"));
				setDosageForm_Label(doc.getItemValueString("DosageForm_Label"));
				setRouteOfAdmin(doc.getItemValueString("RouteOfAdmin"));
				setRouteOfAdmin_Label(doc.getItemValueString("RouteOfAdmin_Label"));
			}else{//its a new document
				reset();
			}
			if (isDebug()) {System.out.println("Biological " + getProductName()+ " loaded");}
			
		} catch (NotesException ne) {
			System.out.println("Notes Exception [Biological.java] load(): " + ne);
		} catch (Exception e) {
			System.out.println("Java Exception [Biological.java] load(): " + e);
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
		if (isDebug()) {System.out.println("Save Biological invoked");}
		
		try{
			sess = ExtLibUtil.getCurrentSession();
			ID = (String)sess.evaluate("@Unique").elementAt(0);
			if (getDocumentid() != null) {
				s = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getDocumentid());
			}
			if (s != null) {
				setIsActiveVersion(s.getItemValueString("IsActiveVersion"));
				setDataSection(s.getItemValueString("DataSection"));
				if (isDebug()) {System.out.println("Save Biological: Application doc is NOT null");}
			} else {
				if (isDebug()) {System.out.println("Save Biological: new document");}
			}
			if (StringUtil.isEmpty(getUnid())) {
				if(appdoc == null){
					String documentId = ExtLibUtil.readParameter(FacesContext.getCurrentInstance(), "appdocumentId");
					appdoc = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(documentId);
					setApplicationVersion(appdoc.getItemValueString("ApplicationVersion"));
				}
				if(appdoc.getItemValueString("DataSection").equalsIgnoreCase("1")){
					setExplicitKey(getApplicationId() + "~" + getApplicationVersion() + "~Part1~Biological~" + ID);
				} else if(appdoc.getItemValueString("DataSection").equalsIgnoreCase("3")) {
					setExplicitKey(getApplicationId() + "~" + getApplicationVersion() + "~UpdateDetails~Biological" + ID);
				} else {
					
				}
			}else{
				doc = ExtLibUtil.getCurrentDatabase().getDocumentByUNID(getUnid());
			}
			if (isDebug()) {System.out.println("Save Biological explicitKey: " + getExplicitKey());}
			
			if (doc == null) {
				doc = ExtLibUtil.getCurrentDatabase().createDocument();
				setUnid(doc.getUniversalID());
				doc.replaceItemValue("Form", "Biological");
				doc.replaceItemValue("Type", "Biological");
				doc.replaceItemValue("ApplicationID", getApplicationId());
				doc.replaceItemValue("ApplicationVersion", getApplicationVersion());
				doc.replaceItemValue("ExplicitKey", getExplicitKey());
				doc.replaceItemValue("RecordUNID", getExplicitKey());
				doc.replaceItemValue("ClinicalTrialType", "CTN");
				doc.replaceItemValue("IsActiveVersion", getIsActiveVersion());
				doc.replaceItemValue("DataSection", getDataSection());
			}
			doc.replaceItemValue("ProductName", getProductName());
			doc.replaceItemValue("IsAComboProduct", getIsAComboProduct());
			doc.replaceItemValue("Presentation", getPresentation());
			doc.replaceItemValue("DosageForm", getDosageForm());
			doc.replaceItemValue("DosageForm_Label", getDosageForm_Label());
			doc.replaceItemValue("RouteOfAdmin", getRouteOfAdmin());
			doc.replaceItemValue("RouteOfAdmin_Label", getRouteOfAdmin_Label());
			
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
				if (isDebug()) {System.out.println("Save Biological complete");}
			}
		}catch (NotesException ne) {
			System.out.println("Notes Exception [Biological.java] saveData(): " + ne);
		} catch (Exception e) {
			System.out.println("Java Exception [Biological.java] saveData(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(s,doc);
		}
		
		return result;
		
	}
	
	public void reset(){
		//set the bean as new
		try{
			setApplicationId(getApplicationId());
			setApplicationVersion(getApplicationVersion());
			setIsActiveVersion(getIsActiveVersion());
			setType(getType());
			setClinicalTrialType("CTN");
			setRecordUNID("");
			setExplicitKey("");
			setProductName("");
			setIsAComboProduct("");
			setPresentation("");
			setDosageForm("");
			setDosageForm_Label("");
			setRouteOfAdmin("");
			setRouteOfAdmin_Label("");
		} catch (Exception e) {
			System.out.println("Java Exception [Biological.java] reset(): " + e);
		} finally {
			
		}
	}
	
	@SuppressWarnings("unchecked")
	public boolean isNewNote(){
		boolean flag = false;
		
		try{
			Map viewScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("viewScope");
			String tmp = viewScope.get("biologicalUNID").toString();
			
			if (StringUtil.isEmpty(tmp)) {
				flag = true;
			} else {
				flag = false;
			}
		
		}catch(Exception e){
			System.out.println("Java Exception [Biological.java] isNewNote(): " + e);
		}finally{
			
		}
		
		return flag;
	
	}
	
	public boolean isDebug() {
		return debug;
	}
	
	public void setDebug(boolean _debug) {
		this.debug = _debug;
	}
	
	public String getApplicationId() {
		return ApplicationId;
	}
	public void setApplicationId(String applicationId) {
		ApplicationId = applicationId;
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
	public String getType() {
		return Type;
	}
	public void setType(String type) {
		Type = type;
	}
	public String getClinicalTrialType() {
		return ClinicalTrialType;
	}
	public void setClinicalTrialType(String clinicalTrialType) {
		ClinicalTrialType = clinicalTrialType;
	}
	public String getRecordUNID() {
		return RecordUNID;
	}
	public void setRecordUNID(String recordUNID) {
		RecordUNID = recordUNID;
	}
	public String getUnid() {
		return unid;
	}
	public void setUnid(String unid) {
		this.unid = unid;
	}
	public String getDocumentid() {
		return documentid;
	}
	public void setDocumentid(String documentid) {
		this.documentid = documentid;
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
	public String getProductName() {
		return ProductName;
	}
	public void setProductName(String productName) {
		ProductName = productName;
	}
	public String getIsAComboProduct() {
		return IsAComboProduct;
	}
	public void setIsAComboProduct(String isAComboProduct) {
		IsAComboProduct = isAComboProduct;
	}
	public String getPresentation() {
		return Presentation;
	}
	public void setPresentation(String presentation) {
		Presentation = presentation;
	}
	public String getDosageForm() {
		return DosageForm;
	}
	public void setDosageForm(String dosageForm) {
		DosageForm = dosageForm;
	}
	public String getDosageForm_Label() {
		return DosageForm_Label;
	}
	public void setDosageForm_Label(String dosageForm_Label) {
		DosageForm_Label = dosageForm_Label;
	}
	public String getRouteOfAdmin() {
		return RouteOfAdmin;
	}
	public void setRouteOfAdmin(String routeOfAdmin) {
		RouteOfAdmin = routeOfAdmin;
	}
	public String getRouteOfAdmin_Label() {
		return RouteOfAdmin_Label;
	}
	public void setRouteOfAdmin_Label(String routeOfAdmin_Label) {
		RouteOfAdmin_Label = routeOfAdmin_Label;
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
