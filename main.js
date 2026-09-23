
(() => {
  'use strict';

  const state = {
    mainSlide: 0,
    mainTimer: null,
    products: {
      tortas: 0,
      panes: 0
    }
  };

  function getMainSlides() {
    return Array.from(document.querySelectorAll('.carousel-container .slide'));
  }

  function updateMainCarousel() {
    const slides = getMainSlides();
    if (!slides.length) return;

    state.mainSlide = (state.mainSlide + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      slide.classList.toggle('active', index === state.mainSlide);
      slide.setAttribute('aria-hidden', index === state.mainSlide ? 'false' : 'true');
    });

    const dots = document.querySelectorAll('.carousel-container .dots-container .dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === state.mainSlide);
      dot.setAttribute('aria-current', index === state.mainSlide ? 'true' : 'false');
    });
  }

  function changeSlide(direction) {
    const slides = getMainSlides();
    if (!slides.length) return;

    state.mainSlide += Number(direction) || 0;
    updateMainCarousel();
    restartMainAutoPlay();
  }

  function goToSlide(index) {
    const slides = getMainSlides();
    if (!slides.length) return;

    state.mainSlide = Number(index) || 0;
    updateMainCarousel();
    restartMainAutoPlay();
  }

  function startMainAutoPlay() {
    const slides = getMainSlides();
    if (slides.length < 2) return;

    clearInterval(state.mainTimer);
    state.mainTimer = setInterval(() => {
      state.mainSlide += 1;
      updateMainCarousel();
    }, 5000);
  }

  function restartMainAutoPlay() {
    startMainAutoPlay();
  }

  function setupMainCarousel() {
    const container = document.querySelector('.carousel-container');
    const slides = getMainSlides();
    if (!container || !slides.length) return;

    updateMainCarousel();
    startMainAutoPlay();

    container.addEventListener('mouseenter', () => clearInterval(state.mainTimer));
    container.addEventListener('mouseleave', startMainAutoPlay);

    container.addEventListener('touchstart', () => clearInterval(state.mainTimer), { passive: true });
    container.addEventListener('touchend', startMainAutoPlay, { passive: true });
  }

  function getProductElements(type) {
    const config = {
      tortas: { track: '#trackTortas', dots: '#dotsTortas' },
      panes: { track: '#trackPanes', dots: '#dotsPanes' }
    }[type];

    if (!config) return null;

    const track = document.querySelector(config.track);
    const dotsContainer = document.querySelector(config.dots);
    const groups = track ? Array.from(track.querySelectorAll('.slide-group')) : [];

    return { track, dotsContainer, groups };
  }

  function updateProductCarousel(type) {
    const elements = getProductElements(type);
    if (!elements || !elements.track || !elements.groups.length) return;

    const { track, dotsContainer, groups } = elements;
    const total = groups.length;
    state.products[type] = (state.products[type] + total) % total;

    track.style.transform = `translateX(-${state.products[type] * 100}%)`;

    if (dotsContainer) {
      Array.from(dotsContainer.querySelectorAll('.dot')).forEach((dot, index) => {
        dot.classList.toggle('active', index === state.products[type]);
        dot.setAttribute('aria-current', index === state.products[type] ? 'true' : 'false');
      });
    }
  }

  function moveProductSlide(type, direction) {
    const elements = getProductElements(type);
    if (!elements || !elements.groups.length) return;

    state.products[type] += Number(direction) || 0;
    updateProductCarousel(type);
  }

  function goToProductSlide(type, index) {
    const elements = getProductElements(type);
    if (!elements || !elements.groups.length) return;

    state.products[type] = Number(index) || 0;
    updateProductCarousel(type);
  }

  function setupProductCarousels() {
    ['tortas', 'panes'].forEach(type => {
      const elements = getProductElements(type);
      if (!elements || !elements.groups.length) return;

      updateProductCarousel(type);

      const viewport = elements.track.closest('.viewport');
      if (!viewport) return;

      let startX = 0;
      let endX = 0;

      viewport.addEventListener('touchstart', event => {
        startX = event.changedTouches[0].screenX;
      }, { passive: true });

      viewport.addEventListener('touchend', event => {
        endX = event.changedTouches[0].screenX;
        const difference = startX - endX;

        if (Math.abs(difference) > 50) {
          moveProductSlide(type, difference > 0 ? 1 : -1);
        }
      }, { passive: true });
    });
  }

  function setupKeyboardNavigation() {
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') changeSlide(-1);
      if (event.key === 'ArrowRight') changeSlide(1);
    });
  }

  function setupActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (!href) return;

      const targetPage = href.split('/').pop() || 'index.html';
      item.classList.toggle('active', targetPage === currentPage);
    });
  }

  function setupContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', event => {
      event.preventDefault();

      const nombre = document.querySelector('#nombre');
      const email = document.querySelector('#email');
      const whatsapp = document.querySelector('#whatsapp');
      const asunto = document.querySelector('#asunto');

      if (!nombre || !email) return;

      if (nombre.value.trim().length < 2) {
        alert('Por favor, escribe un nombre válido.');
        nombre.focus();
        return;
      }

      if (!email.checkValidity()) {
        alert('Por favor, escribe un correo electrónico válido.');
        email.focus();
        return;
      }

      if (whatsapp && whatsapp.value.trim() && !/^[+\d\s()-]{7,20}$/.test(whatsapp.value.trim())) {
        alert('Por favor, verifica el número de WhatsApp.');
        whatsapp.focus();
        return;
      }

      if (asunto && asunto.value.trim().length > 0 && asunto.value.trim().length < 3) {
        alert('El asunto debe tener al menos 3 caracteres.');
        asunto.focus();
        return;
      }

      // Muestra la ventana emergente conectada con el CSS
      showSuccessModal();
      
      form.reset();
    });
  }

  function showSuccessModal() {
    const existingModal = document.getElementById('successModal');
    if (existingModal) existingModal.remove();

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'successModal';
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    modalContent.innerHTML = `
      <h2>¡Mensaje enviado!</h2>
      <p>Gracias por escribirnos. Te responderemos muy pronto.</p>
      <button id="modalAcceptBtn" class="modal-btn">Aceptar</button>
    `;

    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    document.getElementById('modalAcceptBtn').addEventListener('click', () => {
      modalOverlay.remove();
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.remove();
      }
    });
  }


  window.changeSlide = changeSlide;
  window.goToSlide = goToSlide;
  window.moveProductSlide = moveProductSlide;
  window.goToProductSlide = goToProductSlide;

  document.addEventListener('DOMContentLoaded', () => {
    setupActiveNavigation();
    setupMainCarousel();
    setupProductCarousels();
    setupKeyboardNavigation();
    setupContactForm();
    setupPlaceholderLinks();
  });
})();


   document.addEventListener("DOMContentLoaded", function () {

    const searchBox = document.getElementById("searchBox");
    const searchToggle = document.getElementById("searchToggle");
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("siteSearch");
    const searchClose = document.getElementById("searchClose");


 
    if (!searchBox || !searchToggle || !searchForm || !searchInput) {
        return;
    }


    const productosBusqueda = [

        {
            id: "red-velvet",
            nombres: [
                "red velvet",
                "torta red velvet"
            ]
        },

        {
            id: "zanahoria",
            nombres: [
                "zanahoria",
                "torta de zanahoria"
            ]
        },

        {
            id: "selva-negra",
            nombres: [
                "selva negra",
                "torta selva negra"
            ]
        },

        {
            id: "chocolate",
            nombres: [
                "chocolate",
                "torta de chocolate",
                "torta chocolate"
            ]
        },

        {
            id: "tres-leches",
            nombres: [
                "tres leches",
                "torta tres leches"
            ]
        },

        {
            id: "guanabana",
            nombres: [
                "guanabana",
                "guanábana",
                "torta guanabana",
                "torta guanábana"
            ]
        },

        {
            id: "pan-frances",
            nombres: [
                "pan frances",
                "pan francés",
                "pan frances tradicional"
            ]
        },

        {
            id: "siete-granos",
            nombres: [
                "siete granos",
                "pan siete granos",
                "integral"
            ]
        },

        {
            id: "queso-miel",
            nombres: [
                "queso miel",
                "pan de queso",
                "pan queso",
                "queso y miel"
            ]
        },

        {
            id: "pandebono",
            nombres: [
                "pandebono",
                "pandebón"
            ]
        },

        {
            id: "roscon",
            nombres: [
                "roscon",
                "roscón",
                "roscon de guayaba",
                "guayaba y arequipe"
            ]
        },

        {
            id: "oregano-albahaca",
            nombres: [
                "oregano",
                "orégano",
                "albahaca",
                "pan oregano",
                "pan orégano",
                "oregano albahaca",
                "orégano albahaca"
            ]
        }

    ];



    searchToggle.addEventListener("click", function () {

        searchBox.classList.add("search-open");

        setTimeout(function () {
            searchInput.focus();
        }, 150);

    });



    if (searchClose) {

        searchClose.addEventListener("click", function () {

            searchInput.value = "";

            searchBox.classList.remove("search-open");

        });

    }



    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            searchInput.value = "";

            searchBox.classList.remove("search-open");

        }

    });



    document.addEventListener("click", function (event) {

        if (!searchBox.contains(event.target)) {

            searchBox.classList.remove("search-open");

        }

    });



    searchForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const query = normalizarTexto(searchInput.value);


        if (query === "") {
            return;
        }



        const productoEncontrado = productosBusqueda.find(function (producto) {

            return producto.nombres.some(function (nombre) {

                return normalizarTexto(nombre).includes(query) ||
                       query.includes(normalizarTexto(nombre));

            });

        });



        if (productoEncontrado) {

            window.location.href =
                "producto.html?id=" +
                encodeURIComponent(productoEncontrado.id);

            return;

        }



        alert(
            "No encontramos ese producto. " +
            "Intenta buscar por ejemplo: Red Velvet, Pandebono, " +
            "Chocolate o Pan Francés."
        );

    });



    function normalizarTexto(texto) {

        return texto
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    }

});