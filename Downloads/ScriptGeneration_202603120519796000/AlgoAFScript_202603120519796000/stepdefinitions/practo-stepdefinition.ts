import { Given, When, Then } from "@cucumber/cucumber";
import expect from "expect";
import { PractoWorkflow } from "../workflows/practo-workflow";
import { assertion } from "../common/assertion";

const practoWorkflow: PractoWorkflow = new PractoWorkflow();

When("I clicked Find Doctors in practo", async () => { 
    await practoWorkflow.clickedFindDoctorsButton();
});
When("I entered Search doctors clinics hospitals etc in practo as {string}", async (var_searchDoctorsClinicsHospitalsEtc1:string) => { 
    await practoWorkflow.enteredSearchDoctorsClinicsHospitalsEtcTextbox(var_searchDoctorsClinicsHospitalsEtc1);
});
When("I selected Sarjapur Road in practo", async () => { 
    await practoWorkflow.selectedSarjapurRoadButton();
});
Then("verify text Apollo clinic Sarjapur Road in practo", async () => { 
    await assertion.isTrue(await practoWorkflow.verifyTextApolloClinicSarjapurRoadLabel(), "Then verify text Apollo clinic Sarjapur Road in practo");
});
When("I clicked For Corporates in practo", async () => { 
    await practoWorkflow.clickedForCorporatesLabel();
});
When("I selected Health Wellness Plans in practo", async () => { 
    await practoWorkflow.selectedHealthWellnessPlansButton();
});
When("I selected Our Services in practo", async () => { 
    await practoWorkflow.selectedOurServicesButton();
});
Then("verify text Lab Tests at Home in practo", async () => { 
    await assertion.isTrue(await practoWorkflow.verifyTextLabTestsAtHomeButton(), "Then verify text Lab Tests at Home in practo");
});
When("I entered Search location in practo as {string}", async (var_searchLocation1:string) => { 
    await practoWorkflow.enteredSearchLocationTextbox(var_searchLocation1);
});
When("I selected Dentist in practo", async () => { 
    await practoWorkflow.selectedDentistButton();
});
When("I selected Gender in practo", async () => { 
    await practoWorkflow.selectedGenderButton();
});
When("I selected Gender_alias1 in practo", async () => { 
    await practoWorkflow.selectedGenderAlias1Button();
});
When("I selected Patient Stories in practo", async () => { 
    await practoWorkflow.selectedPatientStoriesButton();
});
When("I selected 20 Patient Stories in practo as {string}", async (var_20PatientStories2:string) => { 
    await practoWorkflow.selected20PatientStoriesDropdownlist(var_20PatientStories2);
});
When("I selected Experience in practo", async () => { 
    await practoWorkflow.selectedExperienceButton();
});
When("I selected Years of experience in practo as {string}", async (var_yearsOfExperience3:string) => { 
    await practoWorkflow.selectedYearsOfExperienceDropdownlist(var_yearsOfExperience3);
});
When("I selected Dr Jnanesha HC in practo", async () => { 
    await practoWorkflow.selectedDrJnaneshaHcButton();
});
When("I selected 513 in practo", async () => { 
    await practoWorkflow.selected513Button();
});
When("I selected Consult QA in practo", async () => { 
    await practoWorkflow.selectedConsultQaButton();
});
When("I selected Healthfeed in practo", async () => { 
    await practoWorkflow.selectedHealthfeedButton();
});
When("I clicked Search location in practo as {string}", async (var_searchLocation2:string) => { 
    await practoWorkflow.clickedSearchLocationTextbox(var_searchLocation2);
});
When("I clicked Dentist in practo", async () => { 
    await practoWorkflow.clickedDentistButton();
});
When("I selected Jp Nagar in practo", async () => { 
    await practoWorkflow.selectedJpNagarButton();
});
Then("{string} is displayed with {string}", async (var_page:string,content:string) => { 
    await assertion.isTrue(await practoWorkflow.displayedDefaultPagePage(var_page), "Then '<page>' is displayed with '<content>'");
    await assertion.isTrue(await practoWorkflow.displayedMessageLabel(content),"'<page>' is displayed with '<content>'");
});
