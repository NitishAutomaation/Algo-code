import { Given, When, Then } from "@cucumber/cucumber";
import expect from "expect";
import { HomePageWorkflow } from "../workflows/home-page-workflow";
import { assertion } from "../common/assertion";

const homePageWorkflow: HomePageWorkflow = new HomePageWorkflow();

Given("I have access to application", async () => { 
    await homePageWorkflow.accesstopageLoginpagePage();
});
