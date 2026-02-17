function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var row = [
        data.fecha_ingreso,
        data.empresa,
        data.concepto_pago,
        data.moneda,
        data.monto,
        data.nro_operacion,
        data.detalle
    ];
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = e.parameter.action;
    var sheetName = e.parameter.sheet;

    // ACTION: List all sheets
    if (action == 'listSheets') {
        var sheets = ss.getSheets();
        var sheetNames = [];
        for (var i = 0; i < sheets.length; i++) {
            sheetNames.push(sheets[i].getName());
        }

        var response = {
            'sheets': sheetNames,
            'url': ss.getUrl()
        };

        return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    }

    // ACTION: Get Data from specific sheet (or default)
    var sheet;
    if (sheetName) {
        sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
            return ContentService.createTextOutput(JSON.stringify({ 'error': 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON);
        }
    } else {
        sheet = ss.getActiveSheet();
    }

    // Get Data Range
    var rows = sheet.getDataRange().getValues();

    // Get SLI from I4 (Row 3, Col 8 index 0-based)
    // We try/catch in case the sheet is empty or small
    var sli = 0;
    try {
        if (rows.length > 3 && rows[3].length >= 9) {
            sli = rows[3][8];
        } else {
            // Fallback: explicitly get range in case DataRange was small
            sli = sheet.getRange("I4").getValue();
        }
    } catch (err) {
        sli = 0;
    }

    var headers = rows[0];
    var data = [];

    // Start from 1 to skip headers
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        // Stop if row is empty (basic check)
        if (!row[0] && !row[1]) continue;

        var record = {};
        // Standard Packing List Columns A-D (Indices 0-3)
        // Or dynamic headers
        for (var j = 0; j < headers.length; j++) {
            record[headers[j]] = row[j];
        }
        data.push(record);
    }

    var result = {
        'sli': sli,
        'data': data
    };

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
