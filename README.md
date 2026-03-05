# Sistema Profesional de Gestión de Códigos de Barras

Un sistema web moderno y profesional para la gestión de productos y generación de códigos de barras. Los usuarios pueden registrar productos, generar códigos de barras automáticamente y escanear los códigos para obtener la información de los productos.

## 🚀 Características Principales

- ✓ **Gestión de Productos**: Crear, visualizar y eliminar productos fácilmente
- ✓ **Generación Automática de Códigos**: Código de barras CODE128 basados en SKU
- ✓ **Escaneo de Códigos**: Busca productos escaneando el código de barras
- ✓ **Almacenamiento de Imágenes**: Integración con Cloudinary
- ✓ **Descarga de Códigos**: Descarga códigos de barras como imágenes PNG
- ✓ **Interfaz Profesional**: Diseño moderno, responsivo y fácil de usar
- ✓ **Base de Datos Firestore**: Almacenamiento confiable en la nube

## 📋 Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Cuenta en [Firebase](https://firebase.google.com/)
- Cuenta en [Cloudinary](https://cloudinary.com/) (opcional, para subir imágenes)

## 🔧 Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
git clone <url-del-repositorio>
cd proyect1
```

### 2. Configurar Firebase ✅ **YA CONFIGURADO**

Firebase ya está configurado con el proyecto **inixpost**. Los datos están en `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAvtqXxwIa8S0sfWXRnMK2iKM3vKboxGiM",
    authDomain: "inixpost.firebaseapp.com",
    projectId: "inixpost",
    storageBucket: "inixpost.firebasestorage.app",
    messagingSenderId: "72264053625",
    appId: "1:72264053625:web:20bf9d3c8440cfe453f5a8"
};
```

**Asegúrate de que en Firebase Console:**
- **Firestore Database** esté activado (modo prueba o producción)
- Las reglas de Firestore permitan lecturas/escrituras para tu aplicación

### 3. Configurar Cloudinary (Opcional)

1. Ve a [Cloudinary Dashboard](https://cloudinary.com/console)
2. Copia tu **Cloud Name**
3. Ve a **Settings > Upload** y crea un **Upload Preset** (sin firmar)
4. Abre `js/firebase-config.js` y reemplaza:

```javascript
const cloudinaryConfig = {
    cloudName: "tu-cloud-name",
    uploadPreset: "tu-upload-preset"
};
```

### 4. Crear la colección en Firestore

En Firestore, crea la siguiente colección:

#### Colección: `products`
```
Campos:
- userId (string)
- name (string)
- description (string)
- price (number)
- sku (string)
- barcode (string)
- imageUrl (string, nullable)
- createdAt (timestamp)
- updatedAt (timestamp)
```

### 5. Abrir la aplicación

Simplemente abre `index.html` en tu navegador.

**Para probar Firebase:** Abre `test-firebase.html` para verificar que la conexión esté funcionando correctamente.

## 📁 Estructura del Proyecto

```
proyect1/
├── index.html              # Página de inicio
├── css/
│   └── styles.css         # Estilos globales y responsivos
├── js/
│   ├── firebase-config.js # Configuración de Firebase y Cloudinary
│   ├── products.js        # Gestión de productos
│   ├── viewproducts.js    # Visualización y gestión de códigos
│   ├── scanner.js         # Funcionalidad de escaneo
│   └── main.js            # Funciones generales
├── pages/
│   ├── dashboard.html     # Dashboard principal
│   ├── products.html      # Agregar productos
│   ├── viewproducts.html  # Ver productos
│   └── scanner.html       # Escanear códigos
└── README.md              # Este archivo
```

## 🎯 Cómo Usar

### 1. Agregar un Producto
- Accede a la página principal (`index.html`)
- Haz clic en "Comenzar Ahora"
- Ve a "Agregar Producto"
- Completa el formulario:
  - **Nombre**: Nombre del producto
  - **Descripción**: Detalles del producto
  - **Precio**: Precio en dólares
  - **SKU**: Código único (este se usará para el código de barras)
  - **Imagen**: Foto del producto (opcional)
- Haz clic en "Agregar Producto"

### 2. Ver Productos y Códigos de Barras
- Ve a "Ver Productos"
- Haz clic en cualquier producto
- Verás la información completa y el código de barras
- Haz clic en "Descargar Código" para guardar el código como imagen PNG

### 3. Escanear Códigos
- Ve a "Escanear Código"
- Usa un escáner de códigos o ingresa manualmente el SKU
- El sistema mostrará la información del producto
- Presiona Enter para buscar

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Firebase (Firestore Database)
- **Almacenamiento de Imágenes**: Cloudinary
- **Generación de Códigos de Barras**: [JsBarcode](https://github.com/lindell/JsBarcode)
- **Iconos**: [Font Awesome](https://fontawesome.com/)

## 🎨 Características del Diseño

- Paleta de colores profesional (azul y gris)
- Interfaz responsiva para móviles, tablets y escritorio
- Animaciones suaves y transiciones
- Tipografía moderna y legible
- Componentes visuales bien diferenciados
- Mensajes de error y éxito claros

## 📝 Notas Importantes

1. **Sin Autenticación**: El sistema funciona sin login/registro. Los datos se almacenan con un ID único generado automáticamente
2. **Códigos de Barras**: Se generan automáticamente basándose en el SKU del producto
3. **Imágenes**: Se almacenan en Cloudinary, no localmente
4. **Datos Públicos**: Todos pueden ver todos los productos (sin restricción por usuario en versión actual)
5. **Conexión a Internet**: La aplicación requiere conexión para funcionar

## 🚨 Solución de Problemas

### "Error de CORS en Cloudinary"
- Verifica que tu Upload Preset esté activo y sin firma
- Comprueba que el Cloud Name sea correcto

### "Código de barras no se genera"
- Asegúrate de que JsBarcode esté cargado correctamente
- Verifica que el SKU sea válido (alfanumérico)

### "No se guardan los productos"
- Verifica que Firebase esté configurado correctamente
- Comprueba que la colección `products` exista en Firestore
- Abre la consola dev (F12) para ver errores específicos

## 📊 Estructura de Datos

### Documento de Producto
```json
{
  "userId": "demo-user-abc123",
  "name": "Laptop Dell XPS",
  "description": "Portátil de última generación",
  "price": 999.99,
  "sku": "SKU123456",
  "barcode": "SKU123456",
  "imageUrl": "https://...",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 🎓 Aprende Más

Este proyecto es ideal para aprender:
- Integración con Firebase Firestore
- Subida de archivos con APIs externas (Cloudinary)
- Generación de códigos de barras
- Manipulación del DOM con JavaScript vanilla
- Diseño responsive con CSS Grid y Flexbox
- Manejo de formularios y validación

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Siéntete libre de usar, modificar y distribuir.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Siéntete libre de fork el proyecto y enviar pull requests.

## 📧 Soporte

Para reportar bugs, solicitar features o hacer preguntas, crea un issue en el repositorio.

---

**¡Disfruta usando el Sistema de Códigos de Barras! 🚀**
