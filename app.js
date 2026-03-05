import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Simulación de barra de carga
window.onload = () => {
    let bar = document.getElementById('progress-bar');
    let width = 0;
    let interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            document.getElementById('splash-screen').style.display = 'none';
        } else {
            width += 10;
            bar.style.width = width + '%';
        }
    }, 150);
};

// Cloudinary Widget
const myWidget = cloudinary.createUploadWidget({
    cloudName: 'dgmzhcnms', 
    uploadPreset: 'Inventario'
}, (error, result) => {
    if (!error && result && result.event === "success") { 
        document.getElementById('image_url').value = result.info.secure_url;
        document.getElementById('img-preview').src = result.info.secure_url;
    }
});
document.getElementById("upload_widget").addEventListener("click", () => myWidget.open(), false);

// Cambio de Tema
const themeBtn = document.getElementById('theme-toggle');
themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', target);
    themeBtn.innerHTML = target === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
});

// Guardar Producto
document.getElementById('btnGuardar').addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const categoria = document.getElementById('categoria').value;
    const imgUrl = document.getElementById('image_url').value;

    if(!nombre || !precio) return alert("Faltan datos");

    const docRef = await addDoc(collection(db, "productos"), {
        nombre, precio: parseFloat(precio), categoria, imgUrl, timestamp: new Date()
    });

    JsBarcode("#barcode", docRef.id, { format: "code128", width: 2, height: 40 });
    alert("InixPost: Producto Guardado");
});

// Cargar Inventario en Tiempo Real
onSnapshot(collection(db, "productos"), (snapshot) => {
    const tableBody = document.getElementById('inventory-body');
    tableBody.innerHTML = '';
    snapshot.forEach((doc) => {
        const p = doc.data();
        tableBody.innerHTML += `
            <tr>
                <td><img src="${p.imgUrl || 'https://via.placeholder.com/50'}" class="img-table"></td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>$${p.precio}</td>
                <td>
                    <button class="nav-btn" onclick="eliminar('${doc.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
});

// Navegación de Tabs
window.showTab = (tabId) => {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
};
