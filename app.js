import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURACIÓN FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCTVlsqRqwZpfBq0bnvtaDaMGDyz73S-dI",
    authDomain: "inventariojean-703cd.firebaseapp.com",
    projectId: "inventariojean-703cd",
    storageBucket: "inventariojean-703cd.firebasestorage.app",
    messagingSenderId: "123255181772",
    appId: "1:123255181772:web:b87c00aea15a8fd5018d69"
};

// Inicialización segura
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 1. PANTALLA DE CARGA (SPLASH) ---
window.addEventListener('load', () => {
    const bar = document.getElementById('progress-bar');
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            const splash = document.getElementById('splash-screen');
            splash.style.opacity = '0';
            setTimeout(() => splash.style.display = 'none', 500);
        } else {
            width += Math.floor(Math.random() * 20) + 5;
            if (width > 100) width = 100;
            bar.style.width = width + '%';
        }
    }, 100);
});

// --- 2. SISTEMA DE NOTIFICACIONES (TOASTS) ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="ph-fill ph-check-circle"></i>' : '<i class="ph-fill ph-warning-circle"></i>';
    
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// --- 3. NAVEGACIÓN ENTRE PESTAÑAS (TABS) ---
document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        // Actualizar botones
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Actualizar vistas
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById(`tab-${target}`).classList.add('active');
    });
});

// --- 4. SELECTOR DE CATEGORÍAS (CHIPS) ---
document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.chip-btn').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        const val = chip.getAttribute('data-val');
        document.getElementById('categoria').value = val;
        document.getElementById('prev-cat').innerText = val;
    });
});

// --- 5. CLOUDINARY WIDGET ---
const uploadWidget = cloudinary.createUploadWidget({
    cloudName: 'dgmzhcnms', 
    uploadPreset: 'Inventario',
    theme: 'minimal'
}, (error, result) => {
    if (!error && result && result.event === "success") { 
        const url = result.info.secure_url;
        document.getElementById('image_url').value = url;
        document.getElementById('img-preview').src = url;
        
        const zone = document.getElementById('upload_widget');
        zone.style.borderColor = 'var(--success)';
        zone.innerHTML = `<i class="ph-fill ph-check-circle" style="color:var(--success)"></i><p>Imagen lista</p>`;
        showToast("Imagen subida correctamente");
    }
});
document.getElementById("upload_widget").addEventListener("click", () => uploadWidget.open());

// --- 6. VISTA PREVIA EN VIVO ---
document.getElementById('nombre').addEventListener('input', e => {
    document.getElementById('prev-name').innerText = e.target.value || "Nombre del Producto";
});
document.getElementById('precio').addEventListener('input', e => {
    document.getElementById('prev-price').innerText = e.target.value ? `$${e.target.value}` : "$0.00";
});

// --- 7. GUARDAR PRODUCTO ---
document.getElementById('btnGuardar').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const categoria = document.getElementById('categoria').value;
    const imgUrl = document.getElementById('image_url').value;

    if (!nombre || !precio) {
        showToast("Completa los campos obligatorios", "error");
        return;
    }

    const btn = document.getElementById('btnGuardar');
    btn.disabled = true;
    btn.innerHTML = `<i class="ph ph-circle-notch" style="animation: spin 1s linear infinite"></i> Guardando...`;

    try {
        const docRef = await addDoc(collection(db, "productos"), {
            nombre,
            precio: parseFloat(precio),
            categoria,
            imgUrl: imgUrl || 'https://placehold.co/400x300/e2e8f0/64748b?text=InixPost',
            createdAt: new Date()
        });

        // Generar código de barras en la vista previa
        JsBarcode("#barcode", docRef.id, { format: "code128", width: 2, height: 40, displayValue: true });

        showToast("Producto guardado en InixPost");
        
        // Limpiar
        document.getElementById('nombre').value = '';
        document.getElementById('precio').value = '';
        document.getElementById('image_url').value = '';
        document.getElementById('upload_widget').innerHTML = `<i class="ph ph-upload-simple"></i><p>Subir imagen</p>`;
        document.getElementById('upload_widget').style.borderColor = 'var(--border-color)';

    } catch (e) {
        showToast("Error al guardar en la nube", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="ph ph-floppy-disk"></i> Guardar Producto`;
    }
});

// --- 8. INVENTARIO EN TIEMPO REAL ---
onSnapshot(collection(db, "productos"), (snapshot) => {
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = '';
    
    snapshot.forEach((doc) => {
        const p = doc.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="product-cell">
                    <img src="${p.imgUrl}" class="table-img">
                    <strong>${p.nombre}</strong>
                </div>
            </td>
            <td><span class="category-chip">${p.categoria}</span></td>
            <td class="price-cell">$${p.precio.toFixed(2)}</td>
            <td class="text-right">
                <button class="btn-action view-btn" data-id="${doc.id}" data-name="${p.nombre}">
                    <i class="ph-bold ph-eye"></i>
                </button>
                <button class="btn-action delete-btn" data-id="${doc.id}">
                    <i class="ph-bold ph-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Asignar eventos a los nuevos botones
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => verBarcode(btn.dataset.id, btn.dataset.name);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = () => eliminarProducto(btn.dataset.id);
    });
});

// --- 9. MODAL Y ELIMINACIÓN ---
const modal = document.getElementById('barcode-modal');
const closeModal = document.querySelector('.close-modal');

closeModal.onclick = () => modal.classList.remove('active');
window.onclick = (e) => { if(e.target == modal) modal.classList.remove('active'); }

window.verBarcode = (id, nombre) => {
    document.getElementById('modal-product-name').innerText = nombre;
    modal.classList.add('active');
    JsBarcode("#modal-barcode-svg", id, { format: "code128", width: 2.5, height: 80, displayValue: true });
};

window.eliminarProducto = async (id) => {
    if (confirm("¿Eliminar este producto permanentemente?")) {
        try {
            await deleteDoc(doc(db, "productos", id));
            showToast("Producto eliminado");
        } catch (e) {
            showToast("No se pudo eliminar", "error");
        }
    }
};

// --- 10. MODO OSCURO ---
document.getElementById('theme-toggle').addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    document.getElementById('theme-toggle').innerHTML = next === 'dark' ? 
        '<i class="ph ph-sun"></i> Modo Claro' : '<i class="ph ph-moon"></i> Modo Oscuro';
});
