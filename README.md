# Extensions for <a href="https://iitc.me/">IITC</a> - Ingress Intel map

# * See installation requirements below

I have created several user scripts to help players be more effective in submitting new candidates for portals, pokéstops or pokégyms.

## TLDR; If you want to have this (image below) for Pokémon Go:</br>
<img src="https://github.com/Wintervorst/iitc/raw/master/assets/pogopackdefault.png"/><br/>
- ### 1. Install Tampermonkey or Greasemonkey
- ### 2. Install these userscripts:
-- <a href="https://static.iitc.me/build/release/total-conversion-build.user.js">IITC<a> - Faster and prettier intel<br/>
-- <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/submitrange.user.js">Submitrange</a> - Draws 20m radius of existing portals - Submit candidates outside this radius<br/>
-- <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/s2celldrawer/s2celldrawer.user.js">S2 Celldrawer</a> - Allows drawing of the S2 cells<br/>
-- <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/occupied17cells/occupied17cells.user.js">Full Pokémon cells</a> - Highlights (purple) level 17 S2 cells which will not spawn an additional stop or gym.<br/>
-- <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/gympossible/gympossible.user.js">Gympossible</a> - Highlights (teal) level 14 S2 cells which are 1 stop short of triggering a new Gym<br/>
- ### 3. Create an Ingress Account and Sign In at: https://ingress.com/intel
- ### 4. Enjoy

# For both Ingress & Pokémon players
## <a href="https://github.com/Wintervorst/iitc/tree/master/plugins/submitrange">Submitrange</a>
Displays a 20 meter radius for existing portals, to prevent you from getting 'too close' e-mails. Search and find candidates in the non-highlighted area and you should be good. (excluding OPR location corrections or other candidates coming live before your submit) <br/>
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/assets/20meterradius.png"/><br/>
<a href="https://github.com/Wintervorst/iitc/raw/master/plugins/submitrange/submitrange.user.js">download</a>

# For Ingress players
## <a href="https://github.com/Wintervorst/iitc/tree/master/plugins/occupied19cells">Full Ingress cells</a>
Aside from the 20 meter radius, the maximum limit of portals in a L19 cell is 1. This plugin highlights L19 cells which already contain a portal. As with the submitrange plugin. Search and find candidates outside of the highlighted area and you have a better chance of it ever becoming a portal. 
(requires <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/s2celldrawer/s2celldrawer.user.js">S2 Celldrawer</a>)<br/>
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/occupied19cells/assets/occupiedcell.png"/><br/>
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/occupied19cells/assets/occupiedcellwithsubmitrange.png"/><br/>
<a href="https://github.com/Wintervorst/iitc/raw/master/plugins/occupied19cells/occupied19cells.user.js">download</a>

# For Pokémon players
## <a href="https://github.com/Wintervorst/iitc/tree/master/plugins/occupied17cells">Full Pokémon cells</a>
Aside from the 20 meter radius, the maximum limit of stops/gyms in a L17 cell is 1. This plugin highlights L17 cells which already contain at least 1 portal (portals are converted to stops and gyms with a max of 1 per L17 cell). As with the submitrange plugin. Search and find candidates outside of the highlighted area and you have a better chance of it ever becoming a stop or gym in Pokémon.
(requires <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/s2celldrawer/s2celldrawer.user.js">S2 Celldrawer</a>)<br/>
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/occupied17cells/assets/occupiedcell1.png"/><br/>
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/occupied17cells/assets/occupiedcellwithsubmitrange1.png"/><br/>
<a href="https://github.com/Wintervorst/iitc/raw/master/plugins/occupied17cells/occupied17cells.user.js">download</a>

## <a href="https://github.com/Wintervorst/iitc/tree/master/plugins/gympossible">Gympossible cells</a>
Highlights level 14 cells which are 1 stop short of having an additional gym. By smartly submitting new candidates you can focus on these cells to improve the rate of gyms in your area. 
(requires <a href="https://github.com/Wintervorst/iitc/raw/master/plugins/s2celldrawer/s2celldrawer.user.js">S2 Celldrawer</a>)<br/>
<img src="https://github.com/Wintervorst/iitc/raw/master/plugins/gympossible/assets/gymthreshold1.png"/>
<br/>
<a href="https://github.com/Wintervorst/iitc/raw/master/plugins/gympossible/gympossible.user.js">download</a>

# Installation requirements
## (1) An active Ingress Account
Download and install <a href="https://www.ingress.com/">Ingress</a> and create an account

## (2) Pick Chrome, Firefox or use the <a href="https://iitc.me/mobile/">IITC mobile App</a> 
### (a) Chrome - Install <a href="https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo">Tampermonkey</a>
### (b) FireFox - Install <a href="https://addons.mozilla.org/nl/firefox/addon/greasemonkey/">GreaseMonkey</a>

## (3) Download <a href="https://iitc.me/desktop/">IITC</a> with your chosen browser

## (4) Download your required user plugins from github
Full cells & gympossible require <a href="https://github.com/Wintervorst/iitc/tree/master/plugins/s2celldrawer">S2 Celldrawer</a> to work.

## (5) Browse to <a href="https://ingress.com/intel">https://ingress.com/intel</a>, login with your Ingress account and enable your userplugins





