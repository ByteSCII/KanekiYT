import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

const btnGuardar = document.getElementById('btnGuardar');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');

btnGuardar.addEventListener('click', async () => {
    const nombre = document.getElementById('nombre').value;
    const precio = document.getElementById('precio').value;
    const categoria = document.getElementById('categoria').value;

    if(!nombre || !precio) return alert("Completa los campos, Jean.");

    // Estado de carga
    btnText.style.display = 'none';
    loader.style.display = 'inline-block';
    btnGuardar.disabled = true;

    try {
        const docRef = await addDoc(collection(db, "productos"), {
            nombre,
            precio: parseFloat(precio),
            categoria,
            timestamp: new Date()
        });

        // Actualizar UI
        document.getElementById('label-name').innerText = nombre;
        document.getElementById('label-cat').innerText = categoria;
        document.getElementById('label-price').innerText = `$${precio}`;

        JsBarcode("#barcode", docRef.id, {
            format: "code128",
            width: 2.5,
            height: 50,
            displayValue: true,
            font: "Plus Jakarta Sans"
        });

        // Limpiar campos
        document.getElementById('nombre').value = "";
        document.getElementById('precio').value = "";

    } catch (e) {
        console.error(e);
        alert("Error de conexión con Firebase");
    } finally {
        btnText.style.display = 'inline-block';
        loader.style.display = 'none';
        btnGuardar.disabled = false;
    }
});