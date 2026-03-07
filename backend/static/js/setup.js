function copyCode() {
    var copyText = document.getElementById("scriptCode");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("Código copiado al portapapeles");
}
