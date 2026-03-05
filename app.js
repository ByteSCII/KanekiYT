import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Notificaciones
function showToast(m) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast'; t.innerText = m;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Pantalla de Carga
window.onload = () => {
    let bar = document.getElementById('progress-bar');
    let w = 0;
    let inv = setInterval(() => {
        w += 20; bar.style.width = w + '%';
        if(w >= 100) { 
            clearInterval(inv); 
            setTimeout(() => document.getElementById('splash-screen').style.display='none', 200);
        }
    }, 100);
};

// Navegación
document.querySelectorAll('.nav-item[data-target]').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-item, .view-section').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.target}`).classList.add('active');
    };
});

// Cloudinary
const widget = cloudinary.createUploadWidget({ cloudName: 'dgmzhcnms', uploadPreset: 'Inventario' }, (err, res) => {
    if (!err && res.event === "success") {
        document.getElementById('image_url').value = res.info.secure_url;
        document.getElementById('img-preview').src = res.info.secure_url;
        showToast("Imagen subida");
    }
});
document.getElementById('upload_widget').onclick = () => widget.open();

// Guardar
document.getElementById('btnGuardar').onclick = async () => {
    const n = document.getElementById('nombre').value;
    const p = document.getElementById('precio').value;
    const c = document.getElementById('categoria').value;
    const i = document.getElementById('image_url').value;

    if(!n || !p) return showToast("Faltan datos");

    await addDoc(collection(db, "productos"), { nombre: n, precio: parseFloat(p), categoria: c, imgUrl: i });
    showToast("Producto Guardado");
    document.getElementById('nombre').value = ''; document.getElementById('precio').value = '';
};

// Cargar Tabla
onSnapshot(collection(db, "productos"), (snap) => {
    const b = document.getElementById('inventory-body');
    b.innerHTML = '';
    snap.forEach(d => {
        const p = d.data();
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.imgUrl || ''}" class="table-img">${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>$${p.precio}</td>
            <td class="text-right">
                <button class="view-btn" data-id="${d.id}" data-name="${p.nombre}"><i class="ph ph-eye"></i></button>
                <button onclick="eliminar('${d.id}')"><i class="ph ph-trash"></i></button>
            </td>
        `;
        b.appendChild(tr);
    });
    // Evento para el ojito
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.onclick = () => {
            document.getElementById('print-product-name').innerText = btn.dataset.name;
            document.getElementById('barcode-modal').classList.add('active');
            JsBarcode("#modal-barcode-svg", btn.dataset.id, { format: "code128", width: 2, height: 50, displayValue: true });
        }
    });
});

window.eliminar = async (id) => { if(confirm("¿Eliminar?")) await deleteDoc(doc(db, "productos", id)); };

document.querySelector('.close-modal').onclick = () => document.getElementById('barcode-modal').classList.remove('active');
document.getElementById('btnPrint').onclick = () => window.print();

document.getElementById('theme-toggle').onclick = () => {
    const t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
};
