const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('#mobileNav');
if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
}

const params = new URLSearchParams(window.location.search);
const productParam = params.get('product');
if (productParam) {
  document.querySelectorAll('select[name="product"]').forEach((select) => {
    const option = document.createElement('option');
    option.textContent = productParam;
    option.selected = true;
    select.prepend(option);
  });
}

const counterItems = document.querySelectorAll('[data-counter]');
const formatCounterValue = (value) => new Intl.NumberFormat('en-US').format(value);
const runCounter = (element) => {
  const target = Number(element.dataset.count || '0');
  const suffix = element.dataset.suffix || '';
  const duration = 900;
  const startTime = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.innerHTML = `${formatCounterValue(Math.round(target * eased))}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

if (counterItems.length) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  counterItems.forEach((item) => counterObserver.observe(item));
}

document.querySelectorAll('[data-quote-form]').forEach((form) => {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = String(data.get('email') || '').trim();
    const whatsapp = String(data.get('whatsapp') || '').trim();
    const contactFields = form.querySelectorAll('[data-contact-field]');
    if (contactFields.length && !email && !whatsapp) {
      contactFields.forEach((field) => field.setAttribute('aria-invalid', 'true'));
      contactFields[0].focus();
      return;
    }
    window.dataLayer = window.dataLayer || [];
    const isPressBrake = form.dataset.product === 'press-brake' || data.get('product') === 'press-brake';
    window.dataLayer.push({
      event: isPressBrake ? 'form_submit_press_brake' : 'lead_form_submit',
      form_type: form.dataset.trackForm || 'rfq'
    });
    try {
      await fetch('/api/press-brake-inquiry', {
        method: 'POST',
        body: data,
        keepalive: false
      });
    } catch (error) {
      console.warn('Inquiry endpoint unavailable; continuing to thank-you page.');
    }
    const params = new URLSearchParams();
    params.set('product', isPressBrake ? 'press-brake' : String(data.get('product') || 'sheet-metal-machinery'));
    if (data.get('machine_type')) params.set('machine_type', String(data.get('machine_type')));
    window.location.href = `/thank-you?${params.toString()}`;
  });
});

document.querySelectorAll('[data-track]').forEach((element) => {
  element.addEventListener('click', () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: element.dataset.track || 'cta_click',
      cta_name: element.dataset.track,
      cta_text: element.textContent.trim()
    });
  });
});

if (window.location.pathname.includes('thank-you')) {
  const thankYouParams = new URLSearchParams(window.location.search);
  if (thankYouParams.get('product') === 'press-brake') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'thank_you_press_brake',
      product: 'press-brake',
      machine_type: thankYouParams.get('machine_type') || ''
    });
  }
}
