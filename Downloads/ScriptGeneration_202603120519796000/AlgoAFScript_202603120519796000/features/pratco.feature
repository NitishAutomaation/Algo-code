Feature: pratco1
#Regression Type
#Correct Values = true
#Incorrect Values = false
#Illegal Values = false
#Invalid Values = false
#Boundary Values = false
#Edge Cases Values = false

@find_hospital
@test001
@Id69aa7346e292da555057fb33
Scenario Outline: hospital
Given I have access to application
When I clicked Find Doctors in practo
And I entered Search doctors clinics hospitals etc in practo as '<Search doctors clinics hospitals etc1>'
And I selected Sarjapur Road in practo
Then verify text Apollo clinic Sarjapur Road in practo
And '<page>' is displayed with '<content>'

Examples:
|SlNo.|Search doctors clinics hospitals etc1|page|content|
|1|Searchdoctorsclinicshospitalsetc|NA|NA|

#Total No. of Test Cases : 1

@health_and_wellness
@test002
@Id69aa99069f41492a07b23341
Scenario Outline: health and wellness plans
Given I have access to application
When I clicked For Corporates in practo
And I selected Health Wellness Plans in practo
And I selected Our Services in practo
Then verify text Lab Tests at Home in practo
And '<page>' is displayed with '<content>'

Examples:
|SlNo.|page|content|
|1|Practo|NA|

#Total No. of Test Cases : 2

@find_doc
@test003
@Id69aaa63558098bd047b0e39d
Scenario Outline: find doctor
Given I have access to application
When I entered Search location in practo as '<Search location1>'
And I selected Dentist in practo
And I selected Gender in practo
And I selected Gender_alias1 in practo
And I selected Patient Stories in practo
And I selected 20 Patient Stories in practo as '<20 Patient Stories2>'
And I selected Experience in practo
And I selected Years of experience in practo as '<Years of experience3>'
And I selected Dr Jnanesha HC in practo
And I selected 513 in practo
And I selected Consult QA in practo
And I selected Healthfeed in practo
Then '<page>' is displayed with '<content>'

Examples:
|SlNo.|Search location1|20 Patient Stories2|Years of experience3|page|content|
|1|Searchlocation|20PatientStories|Yearsofexperience|Practo|NA|

#Total No. of Test Cases : 3

@doc
@test004
@Id69aaab9b58098bd047b0e7d9
Scenario Outline: doctor
Given I have access to application
When I clicked Find Doctors in find doc
And I clicked Search location in find doc as '<Search location1>'
And I clicked Dentist in find doc
Then '<page>' is displayed with '<content>'

Examples:
|SlNo.|Search location1|page|content|
|1|Searchlocation_1|find doc|NA|

#Total No. of Test Cases : 4

@Search_and_view_doctor_details
@test005
@Id69aeb9537b721adf0d833ab5
Scenario Outline: Verify finding a doctor by specialty and location
Given I have access to application
When I clicked Find Doctors in practo
And I entered Search doctors clinics hospitals etc in practo as '<Search doctors clinics hospitals etc1>'
And I clicked Search location in practo as '<Search location2>'
And I clicked Dentist in practo
And I selected Jp Nagar in practo
Then verify text Apollo clinic Sarjapur Road in practo
And '<page>' is displayed with '<content>'

Examples:
|SlNo.|Search doctors clinics hospitals etc1|Search location2|page|content|
|1|Searchdoctorsclinicshospitalsetc|Searchlocation_1|Practo|NA|

#Total No. of Test Cases : 5

