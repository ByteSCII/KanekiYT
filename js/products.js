// Lógica de Gestión de Productos

document.addEventListener('DOMContentLoaded', () => {
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleAddProduct);
    }

    // Generar SKU automáticamente al cargar la página
    generateUniqueSKU();

    // Event listener para el botón de regenerar SKU
    const generateSKUButton = document.getElementById('generateSKU');
    if (generateSKUButton) {
        generateSKUButton.addEventListener('click', generateUniqueSKU);
    }
});

// Función para generar un SKU único
async function generateUniqueSKU() {
    const skuInput = document.getElementById('productSKU');
    const generateButton = document.getElementById('generateSKU');

    if (generateButton) {
        generateButton.disabled = true;
        generateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
    }

    let sku;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
        // Generar SKU con formato: PROD + timestamp + 3 dígitos aleatorios
        const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        sku = `PROD${timestamp}${random}`;

        // Verificar si el SKU ya existe
        isUnique = await checkSKUUniqueness(sku);
        attempts++;
    }

    if (skuInput) {
        skuInput.value = sku;
    }

    if (generateButton) {
        generateButton.disabled = false;
        generateButton.innerHTML = '<i class="fas fa-refresh"></i> Regenerar SKU';
    }

    return sku;
}

// Función para verificar si un SKU ya existe en la base de datos
async function checkSKUUniqueness(sku) {
    try {
        const querySnapshot = await firebase.firestore()
            .collection('products')
            .where('sku', '==', sku)
            .limit(1)
            .get();

        return querySnapshot.empty; // Retorna true si no hay documentos con ese SKU
    } catch (error) {
        console.error('Error verificando unicidad del SKU:', error);
        return false; // En caso de error, asumimos que no es único para evitar conflictos
    }
}

function handleAddProduct(e) {
    e.preventDefault();

    const productName = document.getElementById('productName').value;
    const productDescription = document.getElementById('productDescription').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const productSKU = document.getElementById('productSKU').value;
    const productImage = document.getElementById('productImage').files[0];
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');

    // Limpiar mensajes previos
    errorDiv.classList.remove('show');
    successDiv.classList.remove('show');

    // Validar campos (SKU ya no se valida ya que se genera automáticamente)
    if (!productName || !productDescription || !productPrice) {
        showError(errorDiv, 'Por favor completa todos los campos requeridos');
        return;
    }

    if (isNaN(productPrice) || productPrice <= 0) {
        showError(errorDiv, 'Por favor ingresa un precio válido');
        return;
    }

    // Usar un ID fijo para modo demo (sin autenticación)
    const userId = 'demo-user-' + Math.random().toString(36).substring(7);

    // Si hay una imagen, cargarla a Cloudinary
    if (productImage) {
        uploadToCloudinary(productImage, (imageUrl) => {
            saveProductToFirebase(userId, productName, productDescription, productPrice, productSKU, imageUrl, errorDiv, successDiv);
        }, (error) => {
            showError(errorDiv, 'Error al subir imagen: ' + error);
        });
    } else {
        saveProductToFirebase(userId, productName, productDescription, productPrice, productSKU, null, errorDiv, successDiv);
    }
}

function uploadToCloudinary(file, onSuccess, onError) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            onSuccess(data.secure_url);
        } else {
            onError('Error en la respuesta de Cloudinary');
        }
    })
    .catch(error => {
        onError(error.message);
    });
}

function saveProductToFirebase(userId, name, description, price, sku, imageUrl, errorDiv, successDiv) {
    // Generar código de barras usando el SKU
    const barcodeData = sku;

    const productData = {
        userId: userId,
        name: name,
        description: description,
        price: price,
        sku: sku,
        barcode: barcodeData,
        imageUrl: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    firebase.firestore().collection('products').add(productData)
        .then((docRef) => {
            showSuccess(successDiv, '✓ Producto agregado correctamente');

            // Limpiar formulario (excepto SKU que se regenerará)
            document.getElementById('productForm').reset();

            // Generar un nuevo SKU para el próximo producto
            setTimeout(() => {
                generateUniqueSKU();
            }, 100);

            setTimeout(() => {
                window.location.href = 'viewproducts.html';
            }, 1500);
        })
        .catch((error) => {
            showError(errorDiv, 'Error al guardar producto: ' + error.message);
        });
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
}

function showSuccess(element, message) {
    element.textContent = message;
    element.classList.add('show');
}
