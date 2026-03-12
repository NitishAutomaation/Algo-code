import { Given, When, Then } from "@cucumber/cucumber";
import expect from "expect";
import { FindDocWorkflow } from "../workflows/find-doc-workflow";
import { assertion } from "../common/assertion";

const findDocWorkflow: FindDocWorkflow = new FindDocWorkflow();

When("I clicked Find Doctors in find doc", async () => { 
    await findDocWorkflow.clickedFindDoctorsLabel();
});
When("I clicked Search location in find doc as {string}", async (var_searchLocation1:string) => { 
    await findDocWorkflow.clickedSearchLocationTextbox(var_searchLocation1);
});
When("I clicked Dentist in find doc", async () => { 
    await findDocWorkflow.clickedDentistLabel();
});
