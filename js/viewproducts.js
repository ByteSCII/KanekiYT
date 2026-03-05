// Vista de Productos y Generación de Códigos de Barras

let currentProductId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupModal();
});

function loadProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '<p class="loading"><i class="fas fa-spinner fa-spin"></i> Cargando productos...</p>';

    firebase.firestore().collection('products')
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot) => {
            if (snapshot.empty) {
                productsGrid.innerHTML = '<p class="loading" style="color: var(--gray-600);">No hay productos aún. <a href="products.html" style="color: var(--primary-color); text-decoration: none; font-weight: 600;">Crea uno aquí</a></p>';
                return;
            }

            productsGrid.innerHTML = '';
            snapshot.forEach((doc) => {
                const product = doc.data();
                const productCard = createProductCard(doc.id, product);
                productsGrid.appendChild(productCard);
            });
        });
}

function createProductCard(productId, product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const imageUrl = product.imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="%239ca3af"%3ESin imagen%3C/text%3E%3C/svg%3E';

    card.innerHTML = `
        <img src="${imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23f3f4f6%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2210%22 fill=%22%239ca3af%22%3ESin imagen%3C/text%3E%3C/svg%3E'">
        <div class="product-details">
            <h3>${product.name}</h3>
            <p>${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <small style="color: var(--gray-600); display: block; margin-top: 8px;">SKU: <strong>${product.sku}</strong></small>
        </div>
    `;

    card.addEventListener('click', () => {
        currentProductId = productId;
        showProductModal(productId, product);
    });

    return card;
}

function showProductModal(productId, product) {
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    // Generar código de barras usando JSBarcode
    const barcodeId = `barcode-${productId}`;
    
    modalBody.innerHTML = `
        <h2 style="margin-bottom: 20px;">${product.name}</h2>
        <p style="margin-bottom: 12px;"><strong>Descripción:</strong> ${product.description}</p>
        <p style="margin-bottom: 12px;"><strong>Precio:</strong> <span style="color: var(--accent-color); font-weight: 600; font-size: 18px;">$${product.price.toFixed(2)}</span></p>
        <p style="margin-bottom: 12px;"><strong>SKU:</strong> <code style="background: var(--gray-100); padding: 4px 8px; border-radius: 4px; color: var(--dark-color);">${product.sku}</code></p>
        <div class="barcode-display">
            <p><strong>Código de Barras:</strong></p>
            <svg id="${barcodeId}"></svg>
        </div>
        ${product.imageUrl ? `<img src="${product.imageUrl}" style="max-width: 100%; max-height: 250px; margin-top: 20px; border-radius: 8px;">` : ''}
    `;

    modal.classList.add('show');

    // Generar el código de barras con JsBarcode
    try {
        JsBarcode(`#${barcodeId}`, product.sku, {
            format: "CODE128",
            width: 2,
            height: 100,
            displayValue: true
        });
    } catch (error) {
        console.error('Error generando código de barras:', error);
        document.getElementById(barcodeId).innerHTML = '<p style="color: var(--danger-color);">Error al generar código de barras</p>';
    }

    // Configurar botones de acción
    const downloadBtn = document.getElementById('downloadBarcodeBtn');
    const deleteBtn = document.getElementById('deleteProductBtn');

    downloadBtn.onclick = () => downloadBarcode(productId, product.name);
    deleteBtn.onclick = () => deleteProduct(productId);
}

function downloadBarcode(productId, productName) {
    // Usar html2canvas y jsPDF para descargar el código de barras
    // Por ahora, usaremos una solución simple con SVG

    const barcodeId = `barcode-${productId}`;
    const barcodeSvg = document.getElementById(barcodeId);

    if (!barcodeSvg) {
        alert('Error: No se encontró el código de barras');
        return;
    }

    // Convertir SVG a canvas y luego descargar
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const img = new Image();

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `barcode-${productName}-${productId}.png`;
        link.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}

function deleteProduct(productId) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
        firebase.firestore().collection('products').doc(productId).delete()
            .then(() => {
                const modal = document.getElementById('productModal');
                modal.classList.remove('show');
                alert('✓ Producto eliminado correctamente');
                loadProducts();
            })
            .catch((error) => {
                alert('Error al eliminar producto: ' + error.message);
            });
    }
}

function setupModal() {
    const modal = document.getElementById('productModal');
    const closeBtn = document.querySelector('.close');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
}
