var sheetName = 'Total Recon'
var scriptProperties = PropertiesService.getScriptProperties()

// Run the function initialsetup to create the sheet for storing and retrieving our data
function initialSetup () {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  
  var totalReconSheet = activeSpreadsheet.getSheetByName(sheetName);  
  // Create the proper sheet if it doesn't already exist. It will be the default active.
  if (totalReconSheet === null) {
    totalReconSheet = activeSpreadsheet.insertSheet(sheetName);    
    
    // Set appropriate column headers
    totalReconSheet.appendRow(['id','timestamp','title','description','lat','lng','status','nickname','submitteddate','responsedate','candidateimageurl','intellink']); 
   // Set column format    
    var latColumn = totalReconSheet.getRange("E2:E");
    var lngColumn = totalReconSheet.getRange("F2:F");
    var submitdateColumn = totalReconSheet.getRange("I2:I");
    var responsedateColumn = totalReconSheet.getRange("J2:J");
    
    // Plain text
    latColumn.setNumberFormat("@");
    lngColumn.setNumberFormat("@");
    submitdateColumn.setNumberFormat("@");
    responsedateColumn.setNumberFormat("@");   
  }    
    
  // Remove other sheets 
  var sheets = activeSpreadsheet.getSheets();  
  var i = 0;
  for (i in sheets) {
    var currentsheetName = sheets[i].getName();      
    if (currentsheetName !== sheetName) {
      activeSpreadsheet.deleteSheet(sheets[i]);
    }    
  }    
        
  scriptProperties.setProperty('key', activeSpreadsheet.getId());
}

function getSheet() {  
  var doc = SpreadsheetApp.openById(scriptProperties.getProperty('key'))
  return doc.getSheetByName(sheetName); 
}

function doPost(e) { 
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {    
    var sheet = getSheet(sheetName)

    var allValues = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var headers = allValues[0];    
    var nextRow = sheet.getLastRow() + 1
    
    var isUpdate = false;    
    var originalId = null;
    var newRow = headers.map(function(header) {
     switch (header) {
       case 'timestamp':
         return new Date();
         break;
       case 'id':
         if (e.parameter[header] !== undefined && e.parameter[header] !== '') {
            isUpdate = true;
            originalId = e.parameter[header];
            return e.parameter[header];
         }
         return uuid();
         break;
       default:
         return e.parameter[header];
         break;         
      }            
    });
    
    if (isUpdate) {
        var obj = allValues.map(function(values) {
          return headers.reduce(function(o, k, i) {
            o[k] = values[i];
            return o;
          }, {});
        });
                  
         // loop through all the data
      var currentRowData = '';
      obj.forEach(function(row, rowIdx){
        // Find id and rownumber of existing item
        if (row.id === originalId){
           nextRow = rowIdx + 1;
           currentRowData = row;
        }
      });
      
      if (currentRowData != '') {         
         newRow[4] = currentRowData.lat;
         newRow[5] = currentRowData.lng;
         newRow[7] = currentRowData.nickname;
      }            
    }
        
    // Auto add intel link
    newRow[11] = 'https://intel.ingress.com/intel/?z=19&ll=' + newRow[4] + ',' + newRow[5];
    // Add or update;
    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);    
                  
    var resultArray = [newRow];
     var resultObject = resultArray.map(function(values) {
          return headers.reduce(function(o, k, i) {
            o[k] = values[i];
            return o;
          }, {});
     });
    
    return ContentService
      .createTextOutput(JSON.stringify(resultObject[0]))
      .setMimeType(ContentService.MimeType.JSON)     
    
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }
  finally {
    lock.releaseLock()
  }
}

function testDoGet() {
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)  
  try {
    var sheet = getSheet();

    var allValues = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var header = allValues[0];     
    var obj = allValues.map(function(values) {
          return header.reduce(function(o, k, i) {
            o[k] = values[i];           
            return o;           
          }, {});
     });
    if (obj.length > 0) {
      obj.shift();
    }

    Logger.log(JSON.stringify(obj));
        
  } catch (e) {
    
  }

  finally {
    lock.releaseLock()
  }
}

function doGet (request) {   
  var lock = LockService.getScriptLock()
  lock.tryLock(10000)  
  try {    
    var sheet = getSheet();

    var allValues = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    if (allValues.length > 1) {
    var header = allValues[0];     
      var obj = allValues.map(function(values) {
        return header.reduce(function(o, k, i) {
          o[k] = values[i];           
          return o;           
        }, {});
      });
      
      // First row contains the headers themself. Remove it from the array.
      if (obj.length > 0) {
        obj.shift();
      }      
      
      return ContentService
      .createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON)    
    }
  }

  catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    lock.releaseLock()
  }
}

function uuid() {
  return Utilities.getUuid();
}
