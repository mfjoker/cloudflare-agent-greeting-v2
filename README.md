# ttec.digital.agentgreeting.v2

This project is an application for Genesys Cloud. The functionality is to allow an agent or admin to record an agent greeting for both inbound and outbound voice conversations.

To configure the application for a Genesys Org, Open the src/utils/genesys/clientConfig.ts file:
environment: the region that the org resides

clientId: the Implicit Grant OAuth client - see below on setup instructions

redirectUri: should not need to be changed

agentGreetingAdminRole: a role needs to be created in the org ie:AgentGreetingAdmin. This role
needs no permissions assigned. It will need to be assigned to the people who will be administrating the app.

agentGreetingGroupId: a group will need to be created and all agents and admins who will be using
the app will need to be added. The guid for the group needs to be entered here. Note: the group id can also be used when setting up the client app.

defaultLanguage: the default language for the prompts (this is normally 'en-us')
languages: an array of all languages that you want to display to be able to record.

---

Implicit Grant
Create an OAuth client with a grant type of Token Implicit Grant (Browser).
Enter the Authorized redirect URI - this is the URI where the application is running on the web server. The Scope needs the following entries: architect, authorization, groups, presence, users.
Once this created enter the client id in the clientConfig file.

---

Client App install
Under Integration install a new client app and name it Agent Greeting Recording. Under the Configuration tab properties:
Application URL: the URL where you installed the react web app
Application Type: standalone
Application Category: leave blank
Iframe Sandbox Options: allow-scripts,allow-same-origin,allow-forms,allow-modals
Iframe Feature/Permissions Policy: microphone
Group Filtering: {name of the agent greeting group you created}
Save.

---

Additional Setup Information
