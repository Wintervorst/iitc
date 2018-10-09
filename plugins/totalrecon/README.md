If you would like to share your potential and submitted portals over multiple devices and with multiple users. This script is it.


<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/markersonthemap.png"></img><br/>
Tap/click on the Intel map to add and edit locations
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/mapwitheditdialogue"></img><br/>
Overview of locations in a google sheet
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/filledsheet.png"></img><br/>

You can try it out with this script url
Test script url: https://script.google.com/macros/s/AKfycbzIvhFdBzYCppUSQ7SkHY1StT3JsL-43i3p9qOaRzEUVaiEiahR/exec 

It's easy to use, but it requires a bit of configuration if you want to create your own google sheet. However, when you've completed the setup, it is a matter of installing the userscript and you are good to go.

If you want to make use of an existing sheet. Install the userscript, load IITC and enter the scripturl.
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/enterscripturl.png"></img><br/>


If you want to create your own sheet, you should follow these instructions:

Go to: https://docs.google.com/spreadsheets/u/0/
Start a new, blank, spreadsheet
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/startnewspreedsheet.png"></img><br/>

Go to ‘Tools’ -> ‘Script editor’
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/toolsmenu.png"></img><br/>

Remove content in Code.gs and paste the content from this <a href="Code.gs">Code.gs</a> file
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/setsheetscriptcontent.png"></img><br/>

Select the ‘initialSetup’ function
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/set initialsetup.png"></img><br/>

Click the ‘play’ button to run
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/run initialsetup.png"></img><br/>

A dialogue pops up, choose ‘review permissions’
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/authorizationrequired.png"></img><br/>

Choose the appropriate google account
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/choosegoogleaccount.png"></img><br/>

Choose advanced
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/chooseadvanced.png"></img><br/>

Go to ‘Untitled project’
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/gotountitled.png"></img><br/>

Choose your Google+ account and ‘Allow’
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/choose allow.png"></img><br/>

The initialsetup will be run and the sheet will be prepared with the proper columns and column settings
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/sheetcolumnsfilled.png"></img><br/>

Go back to script and choose ‘Publish’->’Deploy as WebApp’
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/publishwebapp.png"></img><br/>

Set ‘Who has access to the app” to Anyone even anonymous.
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/deploywebapp.png"></img><br/>

And choose ‘Deploy’
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/webapppublished.png"></img><br/>

Copy the ‘Current web app URL’. You will be needing it later on.

Install the <a href="totalrecon.userscript.js">userscript</a>. On first launch you will be prompted to enter this URL.
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/enterscripturl.png"></img><br/>

You will need to share this URL with all people and/or devices who will share the same set of data.

Enable the ‘Highlighter’ and when you click on the map it will display the input fields for storing your data. Set another highlighter and the popup will no longer be shown when clicking randomly on the map. However if you click on an existing marker, you can edit it and submit the changes.
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/highlights.png"></img><br/>
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/clickonmap.png"></img><br/>

You will see that all input and changes will be stored in your google sheet. You can share the sheet with whomever you like, or keep it to yourself. Removing markers is a matter of removing a row from the sheet.
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/filledsheet.png"></img><br/>

You can toggle several layers on and off in the layer menu.
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/layerselection.png"></img><br/>

To refresh the markerset you can either refresh your browser or select the highlighter ‘Total Recon – Refresh data’. This might be especially useful on mobile IITC.

