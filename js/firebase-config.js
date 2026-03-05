// Firebase Configuration
// Configuración de Firebase para el proyecto inixpost

const firebaseConfig = {
    apiKey: "AIzaSyAvtqXxwIa8S0sfWXRnMK2iKM3vKboxGiM",
    authDomain: "inixpost.firebaseapp.com",
    projectId: "inixpost",
    storageBucket: "inixpost.firebasestorage.app",
    messagingSenderId: "72264053625",
    appId: "1:72264053625:web:20bf9d3c8440cfe453f5a8"
};

// Cloudinary Configuration
// IMPORTANTE: Configura tu cuenta de Cloudinary para subir imágenes
const cloudinaryConfig = {
    cloudName: "REEMPLAZA_CON_TU_CLOUD_NAME", // Ej: "tu-cloud-name"
    uploadPreset: "REEMPLAZA_CON_TU_UPLOAD_PRESET" // Ej: "tu-upload-preset"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

console.log("Firebase inicializado correctamente con el proyecto inixpost");
console.log("Proyecto ID:", firebaseConfig.projectId);
