// Funcionalidad de Escaneo de Códigos de Barras

document.addEventListener('DOMContentLoaded', () => {
    setupScanner();
});

function setupScanner() {
    const barcodeInput = document.getElementById('barcodeInput');
    
    if (barcodeInput) {
        barcodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                scanBarcode(barcodeInput.value);
                barcodeInput.value = '';
                barcodeInput.focus();
            }
        });
    }
}

function scanBarcode(barcode) {
    const errorDiv = document.getElementById('error-message');
    const productInfo = document.getElementById('productInfo');
    const detailsDiv = document.getElementById('scannedProductDetails');

    // Limpiar mensajes previos
    errorDiv.classList.remove('show');
    productInfo.classList.add('hidden');
    detailsDiv.innerHTML = '';

    if (!barcode.trim()) {
        showError(errorDiv, 'Por favor ingresa o escanea un código de barras');
        return;
    }

    // Buscar el producto por SKU (que es lo que usamos como código de barras)
    firebase.firestore().collection('products')
        .where('sku', '==', barcode)
        .limit(1)
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                showError(errorDiv, '❌ Producto no encontrado. Verifica el código e intenta de nuevo.');
                return;
            }

            const product = snapshot.docs[0].data();
            displayScannedProduct(product, detailsDiv, productInfo);
        })
        .catch((error) => {
            showError(errorDiv, 'Error al buscar producto: ' + error.message);
        });
}

function displayScannedProduct(product, detailsDiv, productInfo) {
    const imageHtml = product.imageUrl 
        ? `<img src="${product.imageUrl}" style="max-width: 200px; max-height: 200px; margin: 15px auto; border-radius: 8px; display: block;">`
        : '';

    detailsDiv.innerHTML = `
        <div style="text-align: center;">
            ${imageHtml}
            <h4 style="margin: 20px 0 10px 0; color: var(--dark-color); font-size: 20px;">${product.name}</h4>
            <p style="color: var(--gray-600); margin-bottom: 15px;">${product.description}</p>
            <p style="margin: 10px 0;"><span style="color: var(--accent-color); font-size: 28px; font-weight: 700;">$${product.price.toFixed(2)}</span></p>
            <p style="color: var(--gray-600); margin: 15px 0;"><strong>SKU:</strong> <code style="background: var(--gray-100); padding: 4px 8px; border-radius: 4px;">${product.sku}</code></p>
            <div style="background: #d1fae5; color: #065f46; padding: 12px; border-radius: 8px; margin-top: 10px;">
                <i class="fas fa-check-circle"></i> Producto disponible
            </div>
        </div>
    `;

    productInfo.classList.remove('hidden');
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}
