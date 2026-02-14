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
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    var headers = rows[0];
    var data = [];

    // Start from 1 to skip headers
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var record = {};
        for (var j = 0; j < headers.length; j++) {
            record[headers[j]] = row[j];
        }
        data.push(record);
    }

    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
