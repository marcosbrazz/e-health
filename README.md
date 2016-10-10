# E-HEALTH

## What is it ?

It is a responsive (web and mobile) application developed to help the post surgical of patients submitted to bariatric surgery 


## Motivation


### The Problem

The obesity grows fast around the world, according to ABESO - Associação Brasileira
para o Estudo da Obesidade e Síndrome Metabólica (Brazilian Association for the Obesity Study and Metabolic Syndrome), more 
than a half of brazilian population are overweight (52.5%) and 17.9% are obese. 
The obesity is a risk factor for chronicle diseases as hypertension, diabetes, heart diseases and cancer.  

One intervention that could help people who is suffering with obesity is the 
Uma das intervenções que pode ajudar as pessoas que estão sofrendo com a obesidade é a bariatric surgery.
After the surgery procedure, the post surgery treatment must be rigorous, so the patient can reach 
the weight reduction successfully and to minimize the risks that can compromise the surgery results, the patient's health and
death risk.
This control need to be so rigorous, so the patient must, mandatorily, take note of every daily meals,  
medicines and it's intercorrences, that is, adverse reactions it could have along the day.
All of these have to be controlled by it's doctor and showed in periodical appointments.

### The Solution

The E-Health application was developed to help this communication between the patient and the doctor, 
collaborating with the accomplishment of the post surgery obligations and narrowing the relationship
between the doctor and it's patients.

The E-Health stores all the intercurrences notes reported by the patient, keeping it as a diary,
so the doctor can access it any time, everywhere.

This application was built in a responsive fashion, so it's interface is rendered friendly on web browsers and mobile devices.

Not every symptoms the patient can judges as a health risk. There might be situations where the patient fall in risk of post surgical complications and it even doesn't know. 
The Watson technology contribute with this application analyzing the content reported by the patient, and notifying immediately the doctor if
the intercurrence symptom is severe. So the doctor can act in conjunction with the patient in a early phase of a health complication.

The E-Health system was based upon a term paper produced in the graduation course of I.T. Management of Instituto Mauá de Tecnologia, entitled "T.I. Aplicada a Saúde", published in 2012.

This paper specify an application for web and mobile platform to keep post surgery information of patient and medical access of these infos.


## Installation

This application uses services hosted on [IBM® Bluemix®](https://console.ng.bluemix.net/). You will need a Bluemix account to instantiate the services dependencies.
The next, we have two environment configuration profiles. The first is intended to run the application on Bluemix cloud. The second is intended to run on local machine or on a bare server.
IMPORTANT: Independent on the profile choice, keep in mind that it will need access to the Bluemix cloud in order consume the Watson and database services.

### Running Application on IBM® Bluemix®

#### Create the runtime.

Access [Bluemix](https://console.ng.bluemix.net/).
Go to Catalog and at the Runtimes section, select the SDK for Node.js and create a new runtime. During the creation, it will ask for a application name. You can give any name.
For the new created runtime, go to the Catalog and add the services: Natural Language Classifier and Cloudant NoSQL DB and bind them to your new runtime.

#### Deploy the application.

Download the [source code](https://hub.jazz.net/git/marcosbrazz/e-health) from git. 
Open a line command shell and change to the directory where your code is located.

Connect to the Bluemix

```bashp
bluemix api https://api.ng.bluemix.net
```

Log in to Bluemix.
```bashp
bluemix login -u <username> -o <username> -s <space>
```

Deploy the app to Bluemix.
```bashp
cf push "<name given to the app on the runtime creation at the previous section>"
```
After the deployment conclusion, it is possible to open the application at this URL: <app-name>.mybluemix.net

#### Train the Natural Language Classifier service

Before the app is ready to use, it is necessary to train the Natural Language Classifier service. 
This service will predict if the symptom sent by the patient is serious or not.
This source code contains a file with predefined training data for this purpose. It's located at the root project files (IntercurrenceTraining.csv). If you want to enrich the service training,
feel free to do it. But, you MUST use this file to do it. NEVER rename the training data file or replace it for another or change its directory!
For instructions to prepare training data, see [Preparing training data](http://www.ibm.com/watson/developercloud/doc/nl-classifier/data_format.shtml)
If you decide to add more data to the training data file, you will need to re-deploy the application before continue in this section.  

Now, open the apllication in the URL: <app-name>.mybluemix.net

Go to the Training Watson menu and push the TRAIN SYMPTOMS button.

After completion, it will show a Classifier ID.  Take not of this ID. It will be used in the next section.

#### Create the environment variables

Access the [IBM® Bluemix®](https://console.ng.bluemix.net/).

At the Dashboard view, open the application and go to the Environment Variables on the left menu.

Select the USER-DEFINED variables view and add the following variables:

* CLASSIFIER_ID
	Set the value of the classifier id obtained at the previous section.
	
* LOG_LEVEL
	For the possible values for log levels see [log levels](https://github.com/winstonjs/winston/blob/master/README.md#logging-levels) 


#### Ready to use.

Now the application E-Health is ready to use. Follow the instructions on section "Using" to know how to use the application.

### Running Application Locally (or on a bare server)

#### Setup Node JS 

First you need to setup a Node JS environment.

Download the following modules dependencies: express, ejs, cloudant, body-parser, method-override, errorhandler, watson-developer-cloud and winston.

#### Download de source code

Download the [source code](https://hub.jazz.net/git/marcosbrazz/e-health) from git. 

#### Create Bluemix services instances

Access [Bluemix](https://console.ng.bluemix.net/).

Go to the Catalog and add the services: Natural Language Classifier and Cloudant NoSQL DB and let then unbound.

Pick up the credentials for each service and put it in the source code: 
* Open the source code modules/database.js and replace the existing fixed credentials in the function useFixedCredentials() with the Cloudant NoSQL DB credentials;
* Open the source code modules/watson.js and replace the existing fixed credentials in the function useFixedCredentials() with the Natural Language Classifier credentials. Here, the classifier ID will be obtained upcoming steps. There you will be asked to replace this attribute. 

#### Deploy the application on Node server

Now, deploy the application on Node server.

#### Train the Natural Language Classifier service

Do the instructions of this section described in the Bluemix environment profile. Then, go to the step below: "Set fixed classifier ID".  

#### Set fixed classifier ID and log level

Now, replace the classifier ID attribute in the source code:
Open the source code modules/watson.js and replace the existing fixed classifier_id attribute in the function useFixedCredentials() with the value obtained in the step above.
The log level can be changed in the file modules/logmodule.js. For the log level detais, see: [log levels](https://github.com/winstonjs/winston/blob/master/README.md#logging-levels) 

Re-deploy the application in the Node JS server.

#### Ready to use.

Now the application E-Health is ready to use. Follow the instructions on section "Using" to know how to use the application.

## Using
	
Once, all the installation steps are done, the application is ready to use.
Open de URL <app-name>.mybluemix.net.
In a first glace, it will show the patient view and the app menu at the left border of the page.
The menu itens is explained in the sub sections below. 

### The Patient View

The objective of this view is for the patient to register it's intercurrences post surgical while it's happening or in a short time after it's occurence, and then this registers compose the post surgical diary.
So, in order to make it, the patient write a short phrase telling what happened or how he/she is feeling (i.e. "I had diarrhea" ou "I am with stomachache" ou "I defecated with blood"). Using Watson Natural Language Classifier, the phrase is analyzed and classified as a severe symptom or non-severe symptom. If the classification points to a severe symptom, the patient's doctor is notified in it's cell phone by receiving a message. So the doctor can reach the patient to mitigate or to avoid a health risk for the patient***.
All the incurrences registered by the patient are stored in a database, so the doctor can read then whenever he need.


*** The intention of this feature is to send push notifications to a smartphone using the Push Notification service from Bluemix. Unfortunately, I had not enough time to build this. So the application only displays a pop up message informing the doctor will be notified.

### The Doctor View

This view allow the doctor to follow the patient's intercurrence diary. It displays a list of the intercurrences of his patient. The reports considered as severe symptoms are showed in red highlight**.

** This view could be enhanced separating the patients in distinct panels and the severe reports could be showed first, for example. But, again, I had not enough time for this version.

### The Training Watson View

This view is the first view to be used when deploying the application for the first time. It's use is referred in the section "Train the Natural Language Classifier service".
 


