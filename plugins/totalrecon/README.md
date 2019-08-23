## If you want to have a map of your submitted portals and potential portals on multiple devices and share it with other players. This script makes that possible.

<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/markersonthemap.png"></img></kbd><br/>
## Tap/click on the Intel map to add and edit locations<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/mapwitheditdialogue.png"></img></kbd><br/>
## The portals are stored in a Google Sheet for easy (bulk) management<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/filledsheet.png"></img></kbd><br/>

## It's easy to use, but it requires a bit of configuration if you want to create your own google sheet. However, when you've completed the setup, it is a matter of installing the userscript and you are good to go.

## A. If you want to make use of an existing sheet. Install the <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/totalrecon.user.js">userscript</a>, load IITC and enter the scripturl.<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/enterscripturl.png"></img></kbd><br/>
## You can test it out with this script url
Test script url: https://script.google.com/macros/s/AKfycbzIvhFdBzYCppUSQ7SkHY1StT3JsL-43i3p9qOaRzEUVaiEiahR/exec 
You can reset the script url by installing <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/totalrecon.clearscripturl.user.js">this userscript</a>. Don't forget to uninstall it afterwards.

## List of functions is at the end of this page

## B. If you want to create your own sheet, you should follow these instructions:

#### 1. Go to: https://docs.google.com/spreadsheets/u/0/
#### 2. Start a new, blank, spreadsheet<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/startnewspreadsheet.png"></img></kbd><br/>

#### 3. Go to ‘Tools’ -> ‘Script editor’<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/toolsmenu.png"></img></kbd><br/>

#### 4. Remove content in Code.gs and paste the content from this <a href="Code.gs">Code.gs</a> file and click the Save Button<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/setsheetscriptcontent.png"></img></kbd><br/>

#### 5. Select the ‘initialSetup’ function<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/set initialsetup.png"></img></kbd><br/>

#### 6. Click the ‘play’ button to run<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/run initialsetup.png"></img></kbd><br/>

#### 7. A dialogue pops up, choose ‘review permissions’<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/authorizationrequired.png"></img></kbd><br/>

#### 8. Choose the appropriate google account<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/choosegoogleaccount.png"></img></kbd><br/>

#### 9. Choose advanced<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/chooseadvanced.png"></img></kbd><br/>

#### 10. Go to ‘Untitled project’<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/gotountitled.png"></img></kbd><br/>

#### 11. Choose your Google+ account and ‘Allow’<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/choose allow.png"></img></kbd><br/>

#### 12. The initialsetup will be run and the sheet will be prepared with the proper columns and column settings<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/sheetcolumnsfilled.png"></img></kbd><br/>

#### 13. Go back to script and choose ‘Publish’->’Deploy as WebApp’<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/publishwebapp.png"></img></kbd><br/>

#### 14. Set ‘Who has access to the app” to Anyone even anonymous.<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/deploywebapp.png"></img></kbd><br/>

#### 15. And choose ‘Deploy’<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/webapppublished.png"></img></kbd><br/>

#### 16. Copy the ‘Current web app URL’. You will be needing it later on.<br/>

#### 17. Install the <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/totalrecon.user.js">userscript</a>. On first launch you will be prompted to enter this URL.<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/enterscripturl.png"></img></kbd><br/>

You will need to share this URL with all people and/or devices who will share the same set of data.

## List of functions
Enable the ‘Highlighter’ and when you click on the map it will display the input fields for storing your data. Set another highlighter and the popup will no longer be shown when clicking randomly on the map. However if you click on an existing marker, you can edit it and submit the changes.<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/highlights.png"></img></kbd><br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/clickonmap.png"></img></kbd><br/>

You will see that all input and changes will be stored in your google sheet. You can share the sheet with whomever you like, or keep it to yourself. Removing markers is a matter of removing a row from the sheet.<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/filledsheet.png"></img>/</kbd><br/>

You can toggle several layers on and off in the layer menu.<br/>
<kbd><img src="https://github.com/Wintervorst/iitc/raw/master/plugins/totalrecon/assets/layerselection.png"></img></kbd><br/>

To refresh the markerset you can either refresh your browser or select the highlighter ‘Total Recon – Refresh data’. This might be especially useful on mobile IITC.

