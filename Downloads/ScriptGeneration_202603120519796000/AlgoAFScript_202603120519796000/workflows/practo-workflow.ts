
import fs from 'fs';
import path from 'path';
import { spawn,exec,ChildProcess } from 'child_process';
import expect from "expect";
import percySnapshot from '@percy/playwright';
import fetch from 'node-fetch';
import * as XLSX from "xlsx";
import { pdfToText } from 'pdf-ts';
import { YmlReader } from "../common/yml-reader";
import { AppSettingsReader } from "../common/appsettings-reader";
import { WebBrowserUtil } from "../common/web-browser-util";
import { CommonUtil } from "../common/common-util";
import { Logger } from "../common/logger";
import { ApiUtil } from "../common/api-util";
import { assertion } from "../common/assertion";
import { SSHUtil } from "../common/SSHUtil";
import { DbHelper } from "../common/DBHelper";
import { MongoDBUtil } from "../common/mongoDButil";
import { SqlServerUtil } from "../common/sql-server-util";
import { MySqlServerUtil } from "../common/mysql-server-util";
import { DBSettingsReader } from "../common/appsettings-reader";


export class PractoWorkflow {
private objectRepoReader: YmlReader = new YmlReader('./ObjectRepository.yml')
private testDataReader: YmlReader = new YmlReader('./TestData.yml')
private dbSettingsReader = new DBSettingsReader('./DBSettings.xml')
private xmlReader: AppSettingsReader = new AppSettingsReader('./ApplicationSettings.xml')
private webBrowserUtil: WebBrowserUtil = new WebBrowserUtil()
private commonUtil: CommonUtil = new CommonUtil()
private apiUtil : ApiUtil = new ApiUtil()
private dpHelper: DbHelper = new DbHelper()
private sqlUtil: SqlServerUtil = new SqlServerUtil()
private mysqlUtil: MySqlServerUtil = new MySqlServerUtil()
private batProcess: ChildProcess | null = null;

        
async clickedFindDoctorsButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.FindDoctorsButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Find Doctors clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async enteredSearchDoctorsClinicsHospitalsEtcTextbox(var_searchDoctorsClinicsHospitalsEtc1:string):Promise<any>{
   await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      var textToBeEntered = this.commonUtil.getData(var_searchDoctorsClinicsHospitalsEtc1);
   const splitXpath = (this.objectRepoReader.getValue("Practo.SearchdoctorsclinicshospitalsetcTextBoxXPATH"));
   const locator=await this.webBrowserUtil.getElement(splitXpath);
    await locator.fill(textToBeEntered);
  if(this.testDataReader.getYamlTestData(var_searchDoctorsClinicsHospitalsEtc1).startsWith("U2FsdGVk")){
      Logger.info("Entered  text is : "+ this.testDataReader.getYamlTestData(var_searchDoctorsClinicsHospitalsEtc1));
   }
   else{
      Logger.info("Entered text is : "+textToBeEntered);
   }    
    }
async selectedSarjapurRoadButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.SarjapurRoadButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Sarjapur Road clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async verifyTextApolloClinicSarjapurRoadLabel():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      const splitXpath = (this.objectRepoReader.getValue("Practo.ApolloclinicSarjapurRoadLabelXPATH"));
   const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
   const content = await this.webBrowserUtil.getText(elementHandle)
   const isVerified=content.length>0
   if(isVerified){
    Logger.info("Verified text: "+content);
    return true;
   }
   else{
      Logger.info("Verified text: "+content);
    Logger.info("Expected text not found");
    return false;
   }
   
}
 
async clickedForCorporatesLabel():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.ForCorporatesLabelXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("For Corporates clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedHealthWellnessPlansButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.HealthWellnessPlansButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Health Wellness Plans clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedOurServicesButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.OurServicesButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Our Services clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async verifyTextLabTestsAtHomeButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      const splitXpath = (this.objectRepoReader.getValue("Practo.LabTestsatHomeButtonXPATH"));
   const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
   const content = await this.webBrowserUtil.getText(elementHandle)
   const isVerified=content.length>0
   if(isVerified){
    Logger.info("Verified text: "+content);
    return true;
   }
   else{
      Logger.info("Verified text: "+content);
    Logger.info("Expected text not found");
    return false;
   }
   
}
 
async enteredSearchLocationTextbox(var_searchLocation1:string):Promise<any>{
   await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      var textToBeEntered = this.commonUtil.getData(var_searchLocation1);
   const splitXpath = (this.objectRepoReader.getValue("Practo.SearchlocationTextBoxXPATH"));
   const locator=await this.webBrowserUtil.getElement(splitXpath);
    await locator.fill(textToBeEntered);
  if(this.testDataReader.getYamlTestData(var_searchLocation1).startsWith("U2FsdGVk")){
      Logger.info("Entered  text is : "+ this.testDataReader.getYamlTestData(var_searchLocation1));
   }
   else{
      Logger.info("Entered text is : "+textToBeEntered);
   }    
    }
async selectedDentistButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.DentistButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Dentist clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedGenderButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.GenderButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Gender clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedGenderAlias1Button():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.Gender_alias1ButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Gender_alias1 clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedPatientStoriesButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.PatientStoriesButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Patient Stories clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selected20PatientStoriesDropdownlist(var_20PatientStories2:string):Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      var_20PatientStories2 = this.commonUtil.getData(var_20PatientStories2);
  const splitXpath = (this.objectRepoReader.getValue("Practo.20PatientStoriesDropDownListXPATH"));
  const elementHandle = await this.webBrowserUtil.getElement(splitXpath)
  await elementHandle.selectOption(var_20PatientStories2);
  
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
  }
 
async selectedExperienceButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.ExperienceButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Experience clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedYearsOfExperienceDropdownlist(var_yearsOfExperience3:string):Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      var_yearsOfExperience3 = this.commonUtil.getData(var_yearsOfExperience3);
  const splitXpath = (this.objectRepoReader.getValue("Practo.YearsofexperienceDropDownListXPATH"));
  const elementHandle = await this.webBrowserUtil.getElement(splitXpath)
  await elementHandle.selectOption(var_yearsOfExperience3);
  
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
  }
 
async selectedDrJnaneshaHcButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.DrJnaneshaHCButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Dr Jnanesha HC clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selected513Button():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.513ButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("513 clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedConsultQaButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.ConsultQAButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Consult QA clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedHealthfeedButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.HealthfeedButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Healthfeed clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async clickedSearchLocationTextbox(var_searchLocation2:string):Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.SearchlocationTextBoxXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Search location clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async clickedDentistButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.DentistButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Dentist clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async selectedJpNagarButton():Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      try{
      const splitXpath = (this.objectRepoReader.getValue("Practo.JpNagarButtonXPATH"));
      const elementHandle = await this.webBrowserUtil.getElement(splitXpath);
      await elementHandle.click();
        Logger.info("Jp Nagar clicked successfully");
  }catch (error) {
      console.error("Error clicking the product link: ", error.message || error);
      throw error;
  }
}
          
async displayedDefaultPagePage(var_page:string):Promise<any>{
  const pagename = globalThis.page;
	let pageTitle = '';
  var_page = this.commonUtil.getData(var_page);
	if(var_page.trim().toUpperCase() === 'NA' || var_page.includes('Page1')){
    pageTitle = String(var_page);
  }else{
    pageTitle = String(await pagename.title());
  }
  return pageTitle.includes(var_page);
}
          
async displayedMessageLabel(var_content:string):Promise<any>{
  await this.webBrowserUtil.setCurrentBrowser(0);
      await this.webBrowserUtil.attachPage("Practo");
      const pageFrame = this.webBrowserUtil.getPage(this.objectRepoReader.getValue("Practo.messageLabeltext"), 0);
      var_content = this.commonUtil.getData(var_content);
      if(var_content.trim().toUpperCase() === 'NA'){
        return true;
      }
	const xpathValue = "//*[contains(text(),'" + var_content + "')]";
  const eleList = await pageFrame.$$(xpathValue);
  let isVisible = false;
  for (const element of eleList) {
    if (await element.isVisible()) {
      isVisible = true;
        Logger.info("var_content visible");
      break;
  } 
  }
    Logger.info("var_content not visible");
  return isVisible;
}
 
    }
module.exports = {PractoWorkflow};
    