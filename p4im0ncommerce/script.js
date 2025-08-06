/* ==========================================================
   script.js - Lógica principal del laboratorio P4IM0Ncommerce
   ========================================================== */

// Array con la información de los productos
const products = [
    { id: 1, title: "Producto 1", price: "$10.00", image: "https://yavuzceliker.github.io/sample-images/image-11.jpg" },
    { id: 2, title: "Producto 2", price: "$12.00", image: "https://yavuzceliker.github.io/sample-images/image-12.jpg" },
    { id: 3, title: "Producto 3", price: "$15.00", image: "https://yavuzceliker.github.io/sample-images/image-13.jpg" },
    { id: 4, title: "Producto 4", price: "$18.00", image: "https://yavuzceliker.github.io/sample-images/image-14.jpg" },
    { id: 5, title: "Producto 5", price: "$20.00", image: "https://yavuzceliker.github.io/sample-images/image-15.jpg" },
    { id: 6, title: "Producto 6", price: "$25.00", image: "https://yavuzceliker.github.io/sample-images/image-16.jpg" },
    { id: 7, title: "Producto 7", price: "$30.00", image: "https://yavuzceliker.github.io/sample-images/image-17.jpg" },
    { id: 8, title: "Producto 8", price: "$35.00", image: "https://yavuzceliker.github.io/sample-images/image-18.jpg" }
];

let currentProduct = null; // Producto actualmente seleccionado

/* ========== LÓGICA PARA MOSTRAR EL DETALLE DEL PRODUCTO Y SUS COMENTARIOS ========== */
document.querySelectorAll('.details-btn').forEach(btn => {
    btn.addEventListener('click', e => {
        const card = e.target.closest('.product-card');
        const id = parseInt(card.dataset.id);
        const product = products.find(p => p.id === id);
        currentProduct = product;

        // Rellenamos los datos del detalle
        document.getElementById('detail-image').src = product.image;
        document.getElementById('detail-title').textContent = product.title;
        document.getElementById('detail-price').textContent = product.price;

        // Mostramos la sección de detalles
        document.getElementById('product-detail').classList.remove('hidden');

        // Renderizamos comentarios guardados (vulnerables)
        renderComments(product.id);

        // Hacemos scroll hasta el detalle
        window.scrollTo({
            top: document.getElementById('product-detail').offsetTop - 50,
            behavior: 'smooth'
        });
    });
});

/* ========== FORMULARIO DE COMENTARIOS (VULNERABLE A XSS ALMACENADO) ========== */
const form = document.getElementById('comment-form');
form.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentProduct) return; // seguridad mínima

    // Obtenemos valores del formulario
    const comment = document.getElementById('comment_text').value;
    const name = document.getElementById('user_name').value;
    const email = document.getElementById('user_email').value;
    const site = document.getElementById('user_site').value;

    // Recuperamos comentarios previos y añadimos el nuevo
    const comments = JSON.parse(localStorage.getItem(`comments_${currentProduct.id}`)) || [];
    comments.push({ name, email, site, text: comment });

    // Guardamos en localStorage (simulación de persistencia)
    localStorage.setItem(`comments_${currentProduct.id}`, JSON.stringify(comments));

    // Renderizamos nuevamente (VULNERABLE)
    renderComments(currentProduct.id);

    // Limpiamos formulario
    form.reset();
});

/**
 * renderComments(id)
 * Renderiza los comentarios almacenados del producto especificado.
 * Aquí está el foco de la vulnerabilidad: se inserta el texto del usuario
 * como HTML sin sanitización, permitiendo ejecutar scripts almacenados.
 */
function renderComments(id) {
    const container = document.getElementById('comments-container');
    container.innerHTML = '';
    const comments = JSON.parse(localStorage.getItem(`comments_${id}`)) || [];
    comments.forEach(c => {
        const div = document.createElement('div');
        // ⚠️ VULNERABILIDAD: insertamos directamente el HTML del usuario
        div.innerHTML = `<p><strong>${c.name}</strong>: ${c.text}</p>`; // <--- VULNERABLE
        container.appendChild(div);
    });
}

/* ========== MODO OSCURO ========== */
const darkToggle = document.getElementById('darkModeToggle');
darkToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    darkToggle.textContent = document.body.classList.contains('dark') ? 'Modo claro' : 'Modo oscuro';
});

/* ========== DETECCIÓN DE LAB RESUELTO (ALERTA) ========== */
const originalAlert = window.alert;
let labSolved = false;

/**
 * Sobrescribimos window.alert para detectar cuando el exploit se ejecuta.
 * Mantenemos el comportamiento original, pero añadimos la lógica de gamificación.
 */
window.alert = function (msg) {
    originalAlert(msg); // Muestra la alerta real
    if (!labSolved) {
        labSolved = true;
        showCongrats(); // Mostramos el banner de felicitaciones
    }
};

/**
 * Muestra el banner de felicitaciones y configura los enlaces para compartir.
 */
function showCongrats() {
    const banner = document.getElementById('congrats-banner');
    banner.classList.remove('hidden');

    const shareText = "¡He resuelto el laboratorio de XSS Almacenado en la plataforma de P4IM0N Hacking ACADEMY! 🚀 #HackingEtico #Ciberseguridad #P4IM0Nacademy #CTF";
    const encoded = encodeURIComponent(shareText);

    // Configuramos enlaces para compartir
    document.getElementById('share-linkedin').href =
        `https://www.linkedin.com/shareArticle?mini=true&url=https://p4im0nacademy.example/&title=${encoded}`;
    document.getElementById('share-facebook').href =
        `https://www.facebook.com/sharer/sharer.php?u=https://p4im0nacademy.example/&quote=${encoded}`;
    document.getElementById('share-reddit').href =
        `https://www.reddit.com/submit?url=https://p4im0nacademy.example/&title=${encoded}`;

    // Botón para copiar texto
    document.getElementById('copy-text').addEventListener('click', () => {
        navigator.clipboard.writeText(shareText);
    });

    // Botón para cerrar el banner
    banner.querySelector('.close-banner').addEventListener('click', () => {
        banner.classList.add('hidden');
    });
}
