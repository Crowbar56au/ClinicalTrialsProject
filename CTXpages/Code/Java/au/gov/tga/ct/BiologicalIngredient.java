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

@SuppressWarnings("unused")
public class BiologicalIngredient  implements Serializable {

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
	private String Name;
	private int Quantity;
	private String Unit;
	private Object CountryList;
	private String ParentExplicitKey;
	boolean debug = false;
	private Document appdoc = null;
	
	@SuppressWarnings("unchecked")
	public BiologicalIngredient() throws NotesException {
		Session sess = null;
		Database db = ExtLibUtil.getCurrentDatabase();
		setDebug(new GetDebugLevel().getDebug(db));
		
		if (isDebug()) {System.out.println("BiologicalIngredient.java bean invoked");}
		
		sess = ExtLibUtil.getCurrentSession();
		//FacesContext context = FacesContext.getCurrentInstance();
		Map viewScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("viewScope");
		String id = viewScope.get("biologicalIngredientUNID").toString();
		setApplicationId(viewScope.get("applicationid").toString());
		if (StringUtil.isNotEmpty(id)) {
			setDocumentid(id);
			setUnid(id);
		}
		
		if(appdoc != null){
			setApplicationVersion(appdoc.getItemValueString("ApplicationVersion"));
		}
		
		if (StringUtil.isNotEmpty(id)) {
			load(id);
		}else{
			if (isDebug()) {System.out.println("A new biological ingredient document");}
		}
	}
	
	public void load(final String unid) {
		setUnid(unid);
		Document doc = null;
		try{
			if (isDebug()) {System.out.println("Biological ingredient loading");}
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
				setName(doc.getItemValueString("Name"));
				setQuantity(doc.getItemValueInteger("Quantity"));
				setParentExplicitKey(doc.getItemValueString("ParentExplicitKey"));
			}else{//its a new document
				reset();
			}
			if (isDebug()) {System.out.println("Biological ingredient " + getName()+ " loaded");}
		} catch (NotesException ne) {
			System.out.println("Notes Exception [BiologicalIngredient.java] load(): " + ne);
		} catch (Exception e) {
			System.out.println("Java Exception [BiologicalIngredient.java] load(): " + e);
		} finally {
			au.gov.tga.ct.Utils.incinerate(doc);
		}
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
			setName("");
			setQuantity(0);
			setUnit("");
			setCountryList(null);
			setParentExplicitKey("");
		} catch (Exception e) {
			System.out.println("Java Exception [BiologicalIngredient.java] reset(): " + e);
		} finally {
			
		}
	}
	
	@SuppressWarnings("unchecked")
	public boolean isNewNote(){
		boolean flag = false;
		
		try{
			Map viewScope = (Map) au.gov.tga.ct.Utils.getXVariableValue("viewScope");
			String tmp = viewScope.get("biologicalIngredientUNID").toString();
			
			if (StringUtil.isEmpty(tmp)) {
				flag = true;
			} else {
				flag = false;
			}
		
		}catch(Exception e){
			System.out.println("Java Exception [BiologicalIngredient.java] isNewNote(): " + e);
		}finally{
			
		}
		
		return flag;
	
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
	
	public String getName() {
		return Name;
	}
	public void setName(String name) {
		Name = name;
	}
	
	public boolean isDebug() {
		return debug;
	}
	
	public void setDebug(boolean _debug) {
		this.debug = _debug;
	}



	public void setQuantity(int quantity) {
		Quantity = quantity;
	}



	public int getQuantity() {
		return Quantity;
	}



	public void setUnit(String unit) {
		Unit = unit;
	}



	public String getUnit() {
		return Unit;
	}

	public void setCountryList(Object countryList) {
		CountryList = countryList;
	}

	public Object getCountryList() {
		return CountryList;
	}

	public void setParentExplicitKey(String parentExplicitKey) {
		ParentExplicitKey = parentExplicitKey;
	}

	public String getParentExplicitKey() {
		return ParentExplicitKey;
	}
	
}
