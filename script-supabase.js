/*
 * SCRIPT PÚBLICO DE AUTOELITE (script-supabase.js)
 * VERSIÓN CORREGIDA Y FUNCIONAL
 */

// ----------------------------------------------------------------
// CONFIGURACIÓN DE SUPABASE
// ----------------------------------------------------------------

const SUPABASE_URL = 'https://hnpznjcpyyzxhfkldkcj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhucHpuamNweXl6eGhma2xka2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODcyODMsImV4cCI6MjA3ODY2MzI4M30.7_yHRRIs_dEXduYBEoZurjIXs2grBFjwWmjKVfRbZLI';

// CORRECCIÓN: Usamos un nombre diferente para la instancia del cliente
// para no sobrescribir la variable global 'supabase' del CDN.
let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
    console.error("La librería de Supabase no se ha cargado. Verifica tu conexión a internet.");
}

// Variables globales
let currentLang = localStorage.getItem('lang') || 'es';
let langData = {};
let allVehicles = []; 

// Evento principal de carga
document.addEventListener('DOMContentLoaded', () => {
    initialize();
});

// --- 0. INICIALIZADOR PRINCIPAL ---
async function initialize() {
    try {
        // Carga los datos
        await loadLangData(); 
        await loadVehicles(); 
        
        // Configura los elementos comunes
        setupThemeToggle();
        setupActiveNav();
        setupSearch(); 
        setupModalClosers();
        setupLegalModals();

        // Configura elementos específicos según la página donde estemos
        if (document.getElementById('featured-carousel')) setupCarousel();
        if (document.getElementById('vehicle-list-container')) setupFilters();
        
        if (document.body.classList.contains('page-vehiculo-detalle')) {
            await loadVehicleDetail(); 
            setupDetailModals(); 
        }
        
        if (document.getElementById('alquiler-grid')) displayAlquiler();
        if (document.querySelector('.vender-coche-form')) setupVenderForm();
        if (document.body.classList.contains('page-valoracion')) loadValoracion(); 

        // Configura los modales globales
        setupPurchaseModal();
        setupSupportForms();
        setupLoginTabs(); 

        // Actualiza el estado del login del cliente
        updateClientLoginStatus();

    } catch (error) {
        console.error("Error en la inicialización:", error);
    }
}

// --- LÓGICA GLOBAL DE CIERRE DE MODALES ---
function setupModalClosers() {
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-overlay');
            if (modal) modal.style.display = 'none';
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    document.getElementById('success-modal-close')?.addEventListener('click', () => {
        document.getElementById('success-modal').style.display = 'none';
        if (!window.location.href.includes('valoracion.html')) {
             window.location.href = 'index.html';
        }
    });
}

// --- LÓGICA PARA MODALES LEGALES (CONTENIDO COMPLETO) ---
function setupLegalModals() {
    const legalModal = document.getElementById('legal-modal');
    if (!legalModal) return; 

    const titleEl = document.getElementById('legal-modal-title');
    const contentEl = document.getElementById('legal-modal-content');

    // Contenidos definidos para AutoElite
    const LEGAL_CONTENT = {
        "Aviso Legal": `
            <h3>1. Datos Identificativos</h3>
            <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico, a continuación se reflejan los siguientes datos:</p>
            <p>La empresa titular de dominio web es <strong>AutoElite S.L.</strong> (en adelante AutoElite), con domicilio a estos efectos en Av. Villa Rosa, 1, 29004 Málaga, número de C.I.F.: B-12345678. Correo electrónico de contacto: info@autoelite.com del sitio web.</p>
            
            <h3>2. Usuarios</h3>
            <p>El acceso y/o uso de este portal de AutoElite atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.</p>
            
            <h3>3. Uso del Portal</h3>
            <p>AutoElite proporciona el acceso a multitud de informaciones, servicios, programas o datos (en adelante, "los contenidos") en Internet pertenecientes a AutoElite o a sus licenciantes a los que el USUARIO pueda tener acceso. El USUARIO asume la responsabilidad del uso del portal.</p>
            
            <h3>4. Propiedad Intelectual e Industrial</h3>
            <p>AutoElite por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, etc.). Todos los derechos reservados.</p>
        `,
        "Política de Privacidad": `
            <h3>1. Responsable del Tratamiento</h3>
            <p><strong>Identidad:</strong> AutoElite S.L. - CIF: B-12345678<br>
            <strong>Dirección:</strong> Av. Villa Rosa, 1, 29004 Málaga<br>
            <strong>Email:</strong> info@autoelite.com</p>
            
            <h3>2. Finalidad del tratamiento</h3>
            <p>En AutoElite tratamos la información que nos facilitan las personas interesadas con el fin de gestionar el envío de la información que nos soliciten, facilitar ofertas de vehículos y gestionar los servicios de compra-venta y alquiler.</p>
            
            <h3>3. Legitimación</h3>
            <p>La base legal para el tratamiento de sus datos es la ejecución del contrato de compra-venta o alquiler, o bien el consentimiento del interesado al solicitar información a través de nuestros formularios de contacto.</p>
            
            <h3>4. Destinatarios</h3>
            <p>Los datos no se comunicarán a terceros, salvo obligación legal o cuando sea necesario para la prestación del servicio (ej. gestorías para matriculación, financieras, etc.).</p>
            
            <h3>5. Derechos</h3>
            <p>Cualquier persona tiene derecho a obtener confirmación sobre si en AutoElite estamos tratando datos personales que les conciernan, o no. Las personas interesadas tienen derecho a acceder a sus datos personales, así como a solicitar la rectificación de los datos inexactos.</p>
        `,
        "Política de Cookies": `
            <h3>1. ¿Qué son las cookies?</h3>
            <p>Una cookie es un fichero que se descarga en su ordenador al acceder a determinadas páginas web. Las cookies permiten a una página web, entre otras cosas, almacenar y recuperar información sobre los hábitos de navegación de un usuario o de su equipo.</p>
            
            <h3>2. Tipos de cookies que utiliza esta web</h3>
            <ul>
                <li><strong>Cookies técnicas:</strong> Son aquellas que permiten al usuario la navegación a través de una página web y la utilización de las diferentes opciones o servicios que en ella existan.</li>
                <li><strong>Cookies de análisis:</strong> Son aquellas que bien tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
            </ul>
            
            <h3>3. Desactivación de cookies</h3>
            <p>Puede usted permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador (Chrome, Firefox, Safari, Edge).</p>
        `
    };

    document.querySelectorAll('.legal-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            const title = link.innerText.trim();
            
            if (titleEl) titleEl.innerText = title;
            if (contentEl) {
                // Usamos el contenido del objeto, o un mensaje por defecto si no coincide exacto
                contentEl.innerHTML = LEGAL_CONTENT[title] || `<p>Información legal sobre ${title} en construcción.</p>`;
            }
            legalModal.style.display = 'flex';
        });
    });
}

// --- 1. LÓGICA DE MODO NOCHE ---
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return; 

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}

// --- 2. LÓGICA DE IDIOMAS ---
async function loadLangData() {
    try {
        const response = await fetch('textos.json');
        if (!response.ok) throw new Error('textos.json no encontrado');
        langData = await response.json();
        updateTextContent(currentLang); 
    } catch (error) {
        console.warn('No se pudo cargar textos.json, usando textos por defecto del HTML.');
        langData = {}; 
    }
    
    document.getElementById('lang-es')?.addEventListener('click', () => setLang('es'));
    document.getElementById('lang-en')?.addEventListener('click', () => setLang('en'));
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang); 
    updateTextContent(lang);
}

function updateTextContent(lang) {
    if (!langData || !langData[lang]) return;
    
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        const translation = langData[lang][key];
        if (translation) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                // Evitar borrar iconos dentro de botones
                if (element.closest('#save-button') || element.closest('#share-button')) {
                     if (!element.classList.contains('icon')) {
                        const span = element.tagName === 'SPAN' ? element : element.querySelector('span:not(.icon)');
                        if(span) span.innerText = translation;
                        else element.innerText = translation;
                     }
                } else {
                    element.innerText = translation;
                }
            }
        }
    });
    document.getElementById('lang-es')?.classList.toggle('active', lang === 'es');
    document.getElementById('lang-en')?.classList.toggle('active', lang === 'en');
}

// --- 3. NAVEGACIÓN ACTIVA ---
function setupActiveNav() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (document.body.classList.contains('page-vehiculo-detalle')) { 
        document.querySelector('.main-nav a[href="vehiculos.html"]')?.classList.add('active');
    } else if (currentPage === 'alquiler.html') {
        document.querySelector('.main-nav a[href="servicios.html"]')?.classList.add('active');
    } else if (document.body.classList.contains('page-valoracion')) {
         document.querySelector('.main-nav a[href="vender.html"]')?.classList.add('active');
    } else {
        document.querySelectorAll('.main-nav a').forEach(link => {
            let linkHref = link.getAttribute('href');
            if (linkHref === currentPage || (linkHref === 'index.html' && (currentPage === '' || currentPage === '/'))) {
                link.classList.add('active');
            }
        });
    }
}

// --- 4. CARGA DE VEHÍCULOS (FUSIÓN INTELIGENTE) ---
async function loadVehicles() {
    let vehiclesFromDB = [];
    
    // 1. Intentamos cargar de Supabase
    if (supabaseClient) {
        try {
            let { data, error } = await supabaseClient
                .from('vehiculos')
                .select('*')
                .order('id', { ascending: true });
            if (!error && data) vehiclesFromDB = data;
        } catch (error) {
            console.error('Error conectando con Supabase:', error);
        }
    }

    // 2. Cargamos SIEMPRE el JSON local para asegurar las fotos
    try {
        const response = await fetch('vehiculos.json');
        const vehiclesFromJSON = await response.json();
        
        if (vehiclesFromDB.length === 0) {
            // Si falla la BD, usamos todo del JSON
            allVehicles = vehiclesFromJSON;
        } else {
            // FUSIÓN: Usamos los datos de la BD (precios, estado...), 
            // pero SOBRESCRIBIMOS la galería con la del JSON para que salgan las 3 fotos.
            allVehicles = vehiclesFromDB.map(dbCar => {
                const jsonCar = vehiclesFromJSON.find(jCar => jCar.id === dbCar.id);
                if (jsonCar && jsonCar.imagenes_galeria) {
                    return { ...dbCar, imagenes_galeria: jsonCar.imagenes_galeria };
                }
                return dbCar;
            });
        }
        console.log("Vehículos cargados y galerías sincronizadas con JSON.");
        
    } catch (e) {
        console.error("Error cargando JSON local:", e);
        allVehicles = vehiclesFromDB; // Fallback a solo BD
    }
}
    
// --- LÓGICA DE BÚSQUEDA ---
function setupSearch() {
    document.querySelectorAll('.search-bar').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            const searchTerm = input ? input.value : '';
            if (searchTerm.trim() !== '') {
                window.location.href = `vehiculos.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });
    });
}

// --- 5. MOSTRAR VEHÍCULOS ---

// 5a. Carrusel (Inicio)
function setupCarousel() {
    const container = document.getElementById('featured-carousel');
    if (!container) return;
    
    const vehiculosDestacados = allVehicles.filter(v => v.destacado && v.tipo === 'venta');
    
    if (vehiculosDestacados.length === 0) {
        container.innerHTML = '<p style="text-align:center; width:100%; padding: 2rem;">Cargando destacados...</p>';
        return;
    }

    container.innerHTML = '';
    vehiculosDestacados.forEach(v => {
        container.innerHTML += createVehicleCardHTML(v, 'carousel');
    });
    updateTextContent(currentLang);
}

// 5b. Página de Alquiler
function displayAlquiler() {
    const container = document.getElementById('alquiler-grid');
    if (!container) return;
    
    const vehiculosAlquiler = allVehicles.filter(v => v.tipo === 'alquiler');
    container.innerHTML = '';
    
    if (vehiculosAlquiler.length === 0) {
        container.innerHTML = '<p>No hay vehículos de alquiler disponibles en este momento.</p>';
        return;
    }

    vehiculosAlquiler.forEach(v => {
        container.innerHTML += createVehicleCardHTML(v, 'grid');
    });
    updateTextContent(currentLang);
}

// 5c. Filtros (Página de Vehículos)
function setupFilters() {
    const filterForm = document.getElementById('filter-form');
    if (!filterForm) return;

    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search')?.toLowerCase() || '';
    
    const searchInput = document.querySelector('.search-bar input');
    if(searchInput && searchTerm) searchInput.value = searchTerm;

    // Elementos del DOM
    const elMarca = document.getElementById('filter-marca');
    const elColor = document.getElementById('filter-color');
    const elPrecio = document.getElementById('filter-precio');
    const elKm = document.getElementById('filter-km');
    const elPotencia = document.getElementById('filter-potencia');
    const elAno = document.getElementById('filter-ano');

    const applyFilters = () => {
        if (!elMarca || !elPrecio) return; // Seguridad

        const filters = {
            marca: elMarca.value,
            color: elColor.value,
            precio: parseInt(elPrecio.value) || 1000000,
            km: parseInt(elKm.value) || 500000,
            potencia: parseInt(elPotencia.value) || 2000, 
            ano: parseInt(elAno.value) || 1900
        };
        
        const vehiculosVenta = allVehicles.filter(v => v.tipo === 'venta');
        
        const filteredVehicles = vehiculosVenta.filter(v => {
            const vNombre = v.nombre ? v.nombre.toLowerCase() : '';
            const vMarca = v.marca ? v.marca.toLowerCase() : '';
            
            const matchesSearch = searchTerm === '' || 
                                  vNombre.includes(searchTerm) ||
                                  vMarca.includes(searchTerm);
            
            const matchesFilters = (filters.marca === 'todas' || v.marca === filters.marca) &&
                                   (filters.color === 'todos' || v.color === filters.color) &&
                                   (v.precio <= filters.precio) &&
                                   (v.kilometraje <= filters.km) &&
                                   (v.potencia_cv <= filters.potencia) && 
                                   (v.ano >= filters.ano);

            return matchesSearch && matchesFilters;
        });
        
        displayVehicleList(filteredVehicles);
    };
    
    filterForm.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', applyFilters);
    });

    // Actualizar etiquetas de rangos
    elPrecio?.addEventListener('input', e => document.getElementById('precio-output').innerText = `€${parseInt(e.target.value).toLocaleString('es-ES')}`);
    elKm?.addEventListener('input', e => document.getElementById('km-output').innerText = `${parseInt(e.target.value).toLocaleString('es-ES')} km`);
    elPotencia?.addEventListener('input', e => document.getElementById('potencia-output').innerText = `${parseInt(e.target.value).toLocaleString('es-ES')} CV`);

    applyFilters();
}

// 5d. Dibuja la lista de vehículos (vehiculos.html)
function displayVehicleList(vehicles) {
    const container = document.getElementById('vehicle-list-container');
    if (!container) return;
    container.innerHTML = '';
    
    if (vehicles.length === 0) {
        container.innerHTML = `<p data-key="filter_no_results">No se encontraron vehículos con esos criterios.</p>`;
        updateTextContent(currentLang);
        return;
    }
    
    vehicles.forEach(v => {
        const specs = v.datos_tecnicos || {}; 
        const subtitle = specs.linea_equipos || `${v.marca} ${v.ano}`;
        
        // Renderizamos las miniaturas (ahora vendrán las 3 del JSON)
        let thumbnailsHTML = '';
        const gallery = (v.imagenes_galeria || []).slice(0, 3); // Aseguramos máx 3
        
        // Rellenamos siempre 3 huecos si existen en el array
        gallery.forEach((imgSrc, index) => {
             thumbnailsHTML += `<img src="${imgSrc}" alt="Foto ${index+1}">`;
        });

        container.innerHTML += `
            <div class="vehicle-list-item">
                <div class="list-item-image-gallery">
                    <div class="list-item-image">
                        <img src="${v.imagenUrl || 'assets/coche-default.png'}" alt="${v.nombre}">
                    </div>
                    <div class="list-item-thumbnails">
                        ${thumbnailsHTML}
                    </div>
                </div>
                <div class="list-item-content">
                    <h3>${v.nombre}</h3>
                    <p class="list-item-subtitle">${subtitle}</p>
                    <div class="list-item-specs">
                        <span>${(v.kilometraje || 0).toLocaleString('es-ES')} km</span>
                        <span>${specs.caja_de_cambios || 'Automático'}</span>
                        <span>${v.potencia_cv || ''} CV</span>
                        <span>${specs.combustible || 'Gasolina'}</span>
                    </div>
                    <div class="list-item-price">€${(v.precio || 0).toLocaleString('es-ES')}</div>
                    <a href="vehiculo-detalle.html?id=${v.id}" class="btn btn-primario" data-key="vehiculos_btn_ver_detalles">Ver Detalles</a>
                </div>
            </div>
        `;
    });
    updateTextContent(currentLang);
}
    
// 5e. Página de Detalle
async function loadVehicleDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = parseInt(urlParams.get('id'));
    
    if (!vehicleId) {
        document.getElementById('vehicle-title-placeholder').innerText = "ID de vehículo no especificado";
        return;
    }

    if (allVehicles.length === 0) {
        await loadVehicles(); 
    }

    const vehicle = allVehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        document.getElementById('vehicle-title-placeholder').innerText = "Vehículo no encontrado";
        return;
    }

    // Rellenar datos básicos
    document.title = `${vehicle.nombre} - AutoElite`;
    document.getElementById('vehicle-title-placeholder').innerText = vehicle.nombre;
    const specs = vehicle.datos_tecnicos || {};
    document.getElementById('vehicle-subtitle-placeholder').innerText = specs.linea_equipos || `${vehicle.marca} ${vehicle.ano}`;

    const priceSuffix = vehicle.tipo === 'alquiler' ? '<span data-key="alquiler_por_dia">/día</span>' : '';
    document.getElementById('vehicle-price-placeholder').innerHTML = `€${vehicle.precio.toLocaleString('es-ES')} ${priceSuffix}`;

    // Badges y Financiación
    const priceBadge = document.getElementById('vehicle-price-badge');
    const monthlyPaymentEl = document.getElementById('vehicle-monthly-payment');
    const financingBox = document.querySelector('.financing-calculator');

    if (vehicle.tipo === 'venta') {
        if (vehicle.calificacion_precio && langData[currentLang]) {
            priceBadge.className = 'price-badge ' + vehicle.calificacion_precio;
            const calif_key = 'calif_' + vehicle.calificacion_precio;
            document.getElementById('vehicle-price-badge-text').setAttribute('data-key', calif_key);
            priceBadge.style.display = 'inline-flex';
        }

        if (vehicle.pago_mensual > 0) {
            monthlyPaymentEl.innerHTML = `<span data-key="finan_desde">desde</span> <strong>€${vehicle.pago_mensual.toLocaleString('es-ES')} / mes</strong>`;
            monthlyPaymentEl.style.display = 'block';
            document.getElementById('financing-monthly-price').innerText = `€${vehicle.pago_mensual.toLocaleString('es-ES')}`;
            if(financingBox) financingBox.style.display = 'block';
        } else {
            monthlyPaymentEl.style.display = 'none';
            if(financingBox) financingBox.style.display = 'none';
        }
        
        const finanPrecio = document.getElementById('finan-precio-total');
        if(finanPrecio) finanPrecio.innerText = `€${vehicle.precio.toLocaleString('es-ES')}`;

    } else {
        // Alquiler
        if(priceBadge) priceBadge.style.display = 'none';
        if(monthlyPaymentEl) monthlyPaymentEl.style.display = 'none';
        if(financingBox) financingBox.style.display = 'none';
        
        const contactButton = document.querySelector('.price-box .btn-primario');
        if(contactButton) {
            contactButton.setAttribute('data-key', 'servicios_btn_reservar');
            contactButton.innerText = 'Reservar Ahora';
            contactButton.classList.add('btn-buy');
            contactButton.setAttribute('data-id', vehicle.id); 
        }
    }
    
    // Galería
    const mainImage = document.getElementById('gallery-main-placeholder');
    const thumbnailsContainer = document.getElementById('gallery-thumbnails-container');
    
    const galleryImages = [vehicle.imagenUrl, ...(vehicle.imagenes_galeria || [])];
    const uniqueGalleryImages = [...new Set(galleryImages.filter(Boolean))]; 
    
    let currentImageIndex = 0;

    function updateGallery(index) {
        currentImageIndex = index;
        mainImage.src = uniqueGalleryImages[currentImageIndex];
        if(thumbnailsContainer) {
            thumbnailsContainer.querySelectorAll('img').forEach((img, i) => {
                img.classList.toggle('active', i === currentImageIndex);
            });
        }
    }

    if(thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
        uniqueGalleryImages.forEach((imgUrl, index) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.onclick = () => updateGallery(index);
            if (index === 0) thumb.classList.add('active');
            thumbnailsContainer.appendChild(thumb);
        });
    }

    document.getElementById('prev-image')?.addEventListener('click', () => updateGallery((currentImageIndex - 1 + uniqueGalleryImages.length) % uniqueGalleryImages.length));
    document.getElementById('next-image')?.addEventListener('click', () => updateGallery((currentImageIndex + 1) % uniqueGalleryImages.length));
    
    if (uniqueGalleryImages.length > 0) updateGallery(0);
    else mainImage.src = 'assets/coche-default.png';

    // Zoom
    const zoomModal = document.getElementById('zoom-modal');
    document.getElementById('zoom-image')?.addEventListener('click', () => {
        document.getElementById('zoom-modal-image').src = uniqueGalleryImages[currentImageIndex];
        zoomModal.style.display = 'flex';
    });
    document.getElementById('zoom-modal-close')?.addEventListener('click', () => zoomModal.style.display = 'none');

    // Datos Técnicos
    const specsContainer = document.getElementById('specs-grid-container');
    if (specsContainer) {
        specsContainer.innerHTML = '';
        const specMap = {
            "categoria": "Categoría", "kilometraje": "Kilometraje", "potencia": "Potencia", 
            "combustible": "Combustible", "caja_de_cambios": "Caja de cambios", 
            "primera_inscripcion": "Primera inscripción", "desplazamiento": "Desplazamiento",
            "linea_equipos": "Línea de equipos", "origen": "Origen"
        };
        for (const key in specMap) {
            if (specs && specs[key]) {
                specsContainer.innerHTML += `
                    <div class="spec-item">
                        <span data-key="spec_${key}">${specMap[key]}</span>
                        <span>${specs[key]}</span>
                    </div>
                `;
            }
        }
    }

    // Vendedor
    const sellerContainer = document.getElementById('vehicle-seller-box');
    if (sellerContainer) { 
        sellerContainer.innerHTML = `
            <h4>AutoElite</h4>
            <div class="seller-rating">
                <span class="stars">★★★★★</span>
                <span>(215 <span data-key="vendedor_opiniones">opiniones</span>)</span>
            </div>
            <p>Av. Villa Rosa, 1, 29004 Málaga</p>
        `;
    }
    
    updateTextContent(currentLang);
}
    
// 5f. Modales de Detalle
function setupDetailModals() {
    const priceInfoModal = document.getElementById('price-info-modal');
    const financingModal = document.getElementById('financing-modal');

    document.getElementById('open-price-info')?.addEventListener('click', () => {
        if (priceInfoModal) priceInfoModal.style.display = 'flex';
    });
    
    document.getElementById('open-financing-modal')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (financingModal) financingModal.style.display = 'flex';
    });

    // Favoritos (Guardar)
    const saveButton = document.getElementById('save-button');
    saveButton?.addEventListener('click', async () => {
        if (!supabaseClient) {
             alert("Funcionalidad no disponible sin conexión a base de datos.");
             return;
        }
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) {
            alert("Inicia sesión para guardar.");
            window.location.href = 'login.html';
            return;
        }

        const vehicleId = parseInt(new URLSearchParams(window.location.search).get('id'));
        if (!vehicleId) return;
        
        const isSaved = saveButton.classList.contains('saved');
        // Simulación visual del cambio
        saveButton.classList.toggle('saved');
        const icon = saveButton.querySelector('.icon');
        icon.innerText = isSaved ? '☆' : '★';
        
        // Aquí iría la lógica real de inserción/borrado en BD
    });

    // Compartir
    const shareButton = document.getElementById('share-button');
    shareButton?.addEventListener('click', () => {
        navigator.clipboard.writeText(window.location.href).then(() => {
            alert('¡Enlace copiado!');
        });
    });

    // Calculadora Financiación
    document.getElementById('finan-modal-calculate')?.addEventListener('click', () => {
        const precioText = document.getElementById('finan-precio-total').innerText;
        const precioTotal = parseFloat(precioText.replace(/[^0-9,.-]+/g,"").replace('.','').replace(',','.')) || 0;
        const entrada = parseFloat(document.getElementById('finan-entrada').value) || 0;
        const pagoMes = parseFloat(document.getElementById('finan-mensual').value);
        const resultadoDiv = document.getElementById('finan-resultado');

        if (!pagoMes || pagoMes <= 0) {
            resultadoDiv.innerHTML = `<p>Introduce un pago mensual válido.</p>`;
            return;
        }

        const totalAFinanciar = precioTotal - entrada;
        if (totalAFinanciar <= 0) {
            resultadoDiv.innerHTML = `<p>No necesitas financiación.</p>`;
            return;
        }
        
        const interesAnual = 0.05; 
        const interesMensual = interesAnual / 12;
        
        if (pagoMes <= totalAFinanciar * interesMensual) {
             resultadoDiv.innerHTML = `<p>El pago mensual es muy bajo para cubrir intereses.</p>`;
             return;
        }

        const numMeses = -Math.log(1 - (totalAFinanciar * interesMensual) / pagoMes) / Math.log(1 + interesMensual);
        const totalMeses = Math.ceil(numMeses);
        const numAnios = Math.floor(totalMeses / 12);
        const mesesRestantes = totalMeses % 12;

        resultadoDiv.innerHTML = `
            <p data-key="finan_modal_resultado">Tiempo estimado:</p>
            <h4>${numAnios} años y ${mesesRestantes} meses</h4>
        `;
    });
}

// --- 6. MODAL DE COMPRA ---
function setupPurchaseModal() {
    const purchaseModal = document.getElementById('purchase-modal');
    const successModal = document.getElementById('success-modal');
    
    let currentVehicleId = null;
    
    document.body.addEventListener('click', function(e) {
        const target = e.target.closest('.btn-buy') || (e.target.classList.contains('btn-buy') ? e.target : null);
        if (target) {
            e.preventDefault(); 
            const vehicleId = target.getAttribute('data-id');
            const vehicleName = target.getAttribute('data-name') || 'Vehículo';
            
            currentVehicleId = vehicleId;
            
            const modalNameEl = document.getElementById('modal-vehicle-name');
            if (modalNameEl) modalNameEl.innerText = vehicleName;
            if (purchaseModal) purchaseModal.style.display = 'flex';
        }
    });

    document.getElementById('purchase-modal-confirm')?.addEventListener('click', async () => {
        // Intentar guardar lead si hay conexión
        if (supabaseClient) {
             const { data: { user } } = await supabaseClient.auth.getUser();
             await supabaseClient.from('leads_venta').insert({
                 vehiculo_id: currentVehicleId,
                 cliente_id: user ? user.id : null,
                 estado: 'nuevo'
             });
        }

        if(purchaseModal) purchaseModal.style.display = 'none';
        if(successModal) successModal.style.display = 'flex';
    });
}


// --- 7. SOPORTE ---
function setupSupportForms() {
    const contactForm = document.getElementById('contact-form');
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (supabaseClient) {
            const formData = new FormData(contactForm);
            await supabaseClient.from('mensajes_soporte').insert({
                nombre: formData.get('nombre'),
                email: formData.get('email'),
                telefono: formData.get('telefono'),
                mensaje: formData.get('necesidad')
            });
        }
        
        contactForm.reset();
        const successModal = document.getElementById('success-modal');
        if (successModal) successModal.style.display = 'flex';
    });

    // Chat Simulado
    const chatForm = document.getElementById('chat-form');
    chatForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const chatInput = document.getElementById('chat-input-text');
        const chatBox = document.querySelector('.chat-box');
        const userMessage = chatInput.value;
        if (!userMessage.trim()) return;

        chatBox.innerHTML += `<div class="chat-message user">${userMessage}</div>`;
        chatInput.value = '';
        chatBox.scrollTop = chatBox.scrollHeight;

        setTimeout(() => {
            let botResponse = 'Gracias por tu pregunta. Un agente se conectará pronto.';
            if (userMessage.toLowerCase().includes('horario')) {
                botResponse = 'Nuestro horario es de L-V de 9:00 a 20:00.';
            }
            chatBox.innerHTML += `<div class="chat-message bot">${botResponse}</div>`;
            chatBox.scrollTop = chatBox.scrollHeight;
        }, 1000);
    });
}

// --- 8. LOGIN CLIENTES ---
function setupLoginTabs() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            tabLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(tabId)?.classList.add('active');
        });
    });

    // Login
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!supabaseClient) { alert("Sin conexión a servidor."); return; }
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) alert(`Error: ${error.message}`);
        else window.location.href = 'index.html';
    });

    // Registro
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!supabaseClient) { alert("Sin conexión a servidor."); return; }

        const nombre = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const { data, error } = await supabaseClient.auth.signUp({
            email, password, options: { data: { nombre_completo: nombre } }
        });

        if (error) alert(`Error: ${error.message}`);
        else {
            if(data.user) {
                 await supabaseClient.from('clientes').insert({ id: data.user.id, nombre_completo: nombre, email });
            }
            alert('Registro completado. Inicia sesión.');
            document.querySelector('.tab-link[data-tab="login-form-box"]').click();
        }
    });
}

// --- 9. ESTADO LOGIN ---
async function updateClientLoginStatus() {
    if (!supabaseClient) return;
    
    const { data: { user } } = await supabaseClient.auth.getUser();
    const loginLink = document.querySelector('a.login-link');
    if (!loginLink) return;
    
    if (user) {
        loginLink.innerText = "Mi Cuenta";
        loginLink.href = "#"; 
        
        // Botón Logout
        if (!document.getElementById('logout-button-client')) {
            const logoutButton = document.createElement('a');
            logoutButton.id = 'logout-button-client';
            logoutButton.innerText = "(Salir)";
            logoutButton.href = "#";
            logoutButton.style = "cursor:pointer; margin-left:10px; font-size:0.8rem;";
            logoutButton.onclick = async (e) => {
                e.preventDefault();
                await supabaseClient.auth.signOut();
                window.location.reload();
            };
            loginLink.parentNode.insertBefore(logoutButton, loginLink.nextSibling);
        }
    } else {
        loginLink.innerText = "Acceso Clientes";
        loginLink.href = "login.html";
    }
}

// --- 10. FORMULARIO VENDER ---
function setupVenderForm() {
    const venderForm = document.querySelector('.vender-coche-form');
    venderForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Recopilar datos
        const marca = document.getElementById('vender-marca').value;
        const modelo = document.getElementById('vender-modelo').value;
        const km = document.getElementById('vender-kilometraje').value;
        const estado = document.getElementById('vender-estado').value;
        
        let valoracionId = 0;

        if (supabaseClient) {
            const { data: { user } } = await supabaseClient.auth.getUser();
            // Guardar en BD
            const { data } = await supabaseClient.from('solicitudes_valoracion').insert({
                marca, modelo, kilometraje: km, estado, cliente_id: user ? user.id : null
            }).select('id').single();
            if(data) valoracionId = data.id;
        } else {
            valoracionId = Date.now(); // ID temporal simulado
            // Guardar datos en localStorage para simular persistencia en la siguiente página
            localStorage.setItem('temp_valoracion_' + valoracionId, JSON.stringify({
                marca, modelo, kilometraje: km, estado
            }));
        }
        
        window.location.href = `valoracion.html?id=${valoracionId}`;
    });
}

// --- 11. CARGAR VALORACIÓN ---
async function loadValoracion() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    let data = null;

    // Intentar cargar de BD
    if (supabaseClient && id && !id.startsWith('17')) { // Si parece un ID real
         const { data: dbData } = await supabaseClient.from('solicitudes_valoracion').select('*').eq('id', id).single();
         data = dbData;
    }
    
    // Si no hay datos de BD, intentar localStorage (Simulación)
    if (!data && id) {
        const localData = localStorage.getItem('temp_valoracion_' + id);
        if (localData) data = JSON.parse(localData);
    }

    if (!data) {
        document.getElementById('valoracion-precio').innerText = "Error al cargar datos";
        return;
    }

    // Algoritmo simple
    let precio = 30000;
    if (data.marca === 'Porsche') precio += 20000;
    if (data.marca === 'BMW') precio += 10000;
    if (data.estado === 'excelente') precio *= 1.2;
    if (parseInt(data.kilometraje) > 100000) precio *= 0.8;

    document.getElementById('valoracion-precio').innerText = `€${Math.floor(precio).toLocaleString('es-ES')}`;
    document.getElementById('valoracion-resumen').innerHTML = `
        <li><span>Marca</span> <span>${data.marca}</span></li>
        <li><span>Modelo</span> <span>${data.modelo}</span></li>
        <li><span>Estado</span> <span>${data.estado}</span></li>
    `;
}

// --- AUX: CREAR HTML CARD ---
function createVehicleCardHTML(v, type) {
    let btnHTML = '';
    let priceSuffix = '';

    if (type === 'grid' && v.tipo === 'alquiler') {
        priceSuffix = '/día';
        btnHTML = `<a href="#" class="btn btn-primario full-width btn-buy" data-id="${v.id}" data-name="${v.nombre}">Reservar</a>`;
    } else {
        btnHTML = `<a href="vehiculo-detalle.html?id=${v.id}" class="btn btn-primario full-width">Ver Detalles</a>`;
    }

    return `
        <div class="vehicle-card">
            <div class="card-image-large">
                <img src="${v.imagenUrl || 'assets/coche-default.png'}" alt="${v.nombre}">
            </div>
            <div class="card-content">
                <h3>${v.nombre}</h3>
                <div class="card-data">
                    <span>${v.ano}</span>
                    <span>${(v.kilometraje || 0).toLocaleString('es-ES')} km</span>
                    <span>${v.color}</span>
                </div>
                <div class="price">€${(v.precio || 0).toLocaleString('es-ES')} ${priceSuffix}</div>
            </div>
            <div class="card-footer">
                ${btnHTML}
            </div>
        </div>
    `;
}