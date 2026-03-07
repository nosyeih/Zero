let qrObject = null;

function generateQR() {
    const text = document.getElementById('qr-text').value;
    const container = document.getElementById('qr-result');
    const wrapper = document.getElementById('qr-container');

    if (!text) {
        alert('Por favor ingresa un texto o URL');
        return;
    }

    container.innerHTML = '';
    wrapper.classList.remove('hidden');

    qrObject = new QRCode(container, {
        text: text,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

function downloadQR(type) {
    const img = document.querySelector('#qr-result img');
    if (!img) return;

    if (type === 'png') {
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = img.src;
        link.click();
    } else if (type === 'pdf') {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text("Código QR Generado", 10, 10);
        doc.addImage(img.src, 'PNG', 10, 20, 50, 50);
        doc.save("qrcode.pdf");
    }
}
