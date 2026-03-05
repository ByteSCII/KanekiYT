import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Tus credenciales de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCTVlsqRqwZpfBq0bnvtaDaMGDyz73S-dI",
    authDomain: "inventariojean-703cd.firebaseapp.com",
    projectId: "inventariojean-703cd",
    storageBucket: "inventariojean-703cd.firebasestorage.app",
    messagingSenderId: "123255181772",
    appId: "1:123255181772:web:b87c00aea15a8fd5018d69"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 1. Pantalla de Carga (Splash Screen) Mejorada ---
window.onload = () => {
    let bar = document.getElementById('progress-bar');
    let width = 0;
    let interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.getElementById('splash-screen').style.opacity = '0';
                setTimeout(() => document.getElementById('splash-screen').style.display = 'none', 500);
            }, 300);
        } else {
            width += Math.floor(Math.random() * 15) + 5; // Carga aleatoria para que parezca real
            if(width > 100) width = 100;
            bar.style.width = width + '%';
        }
    }, 150);
};

// --- 2. Cloudinary Configuración ---
const uploadWidget = cloudinary.createUploadWidget({
    cloudName: 'dgmzhcnms', 
    uploadPreset: 'Inventario',
    sources: ['local', 'camera', 'url'], // Permite usar la cámara directo
    multiple: false
}, (error, result) => {
    if (!error && result && result.event === "success") { 
        const urlSegura = result.info.secure_url;
        document.getElementById('image_url').value = urlSegura;
        document.getElementById('img-preview').src = urlSegura;
        
        // Cambiar estilo de la zona de subida para indicar éxito
        const zone = document.getElementById('upload_widget');
        zone.innerHTML = `<i class="ph-fill ph-check-circle" style="color: #10b981;"></i><p>Imagen cargada</p>`;
        zone.style.borderColor = '#10b981';
    }
});
document.getElementById("upload_widget").addEventListener("click", () => uploadWidget.open(), false);

// --- 3. Actualizar Vista Previa en Tiempo Real ---
document.getElementById('nombre').addEventListener('input', (e) => {
    document.getElementById('prev-name').innerText = e.target.value || 'Nombre del Producto';
});
document.getElementById('precio').addEventListener('input', (e) => {
    document.getElementById('prev-price').innerText = e.target.value ? `$${e.target.value}` : '$0.00';
});
document.getElementById('categoria').addEventListener('change', (e) => {
    document.getElementById('prev-cat').innerText = e.target.value;
});

// --- 4. Guardar en Firebase ---
document.getElementById('btnGuardar').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const categoria = document.getElementById('categoria').value;
    const imgUrl = document.getElementById('image_url').value;

    if(!nombre || !precio) {
        alert("El nombre y el precio son obligatorios.");
        return;
    }

    const btn = document.getElementById('btnGuardar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = `<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Guardando...`;
    btn.disabled = true;

    try {
        const docRef = await addDoc(collection(db, "productos"), {
            nombre,
            precio: parseFloat(precio),
            categoria,
            imgUrl: imgUrl || 'https://placehold.co/400x300/e2e8f0/64748b?text=Sin+Imagen', // Imagen por defecto
            timestamp: new Date()
        });

        // Generar Código de Barras
        JsBarcode("#barcode", docRef.id, { 
            format: "code128", 
            width: 2, 
            height: 40,
            displayValue: true,
            fontOptions: "bold"
        });

        // Limpiar formulario
        document.getElementById('nombre').value = '';
        document.getElementById('precio').value = '';
        document.getElementById('image_url').value = '';
        document.getElementById('upload_widget').innerHTML = `<i class="ph ph-upload-simple"></i><p>Haz clic para subir imagen</p><span class="upload-hint">Soporta JPG, PNG</span>`;
        document.getElementById('upload_widget').style.borderColor = 'var(--border-color)';
        
    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Ocurrió un error al guardar el producto.");
    } finally {
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
});

// --- 5. Cargar Inventario (Tabla) ---
onSnapshot(collection(db, "productos"), (snapshot) => {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';
    
    snapshot.forEach((doc) => {
        const p = doc.data();
        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="product-cell">
                        <img src="${p.imgUrl}" class="table-img" alt="Prod">
                        <strong>${p.nombre}</strong>
                    </div>
                </td>
                <td><span class="category-chip">${p.categoria}</span></td>
                <td class="price-cell">$${p.precio.toFixed(2)}</td>
                <td class="text-right">
                    <button class="btn-action" onclick="eliminarProducto('${doc.id}')" title="Eliminar">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
});

// Función global para eliminar
window.eliminarProducto = async (id) => {
    if(confirm('¿Estás seguro de eliminar este producto del sistema?')) {
        await deleteDoc(doc(db, "productos", id));
    }
};

// --- 6. Navegación y Tema ---
window.switchTab = (tabId) => {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    event.currentTarget.classList.add('active');
};

const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.innerHTML = next === 'dark' ? '<i class="ph ph-sun"></i> Modo Claro' : '<i class="ph ph-moon"></i> Modo Oscuro';
});
