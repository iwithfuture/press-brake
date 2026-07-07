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

const animateCounter = (element) => {
  const target = Number(element.dataset.target || 0);
  const suffix = element.dataset.suffix || '';
  const duration = 1000;
  const start = performance.now();
  const format = (value) => element.dataset.format === 'plain'
    ? String(Math.round(value))
    : Math.round(value).toLocaleString('en-US');
  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${format(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const counterStrip = document.querySelector('[data-counter-strip]');
if (counterStrip) {
  const counters = counterStrip.querySelectorAll('[data-counter]');
  const startCounters = () => {
    counters.forEach((counter) => {
      if (counter.dataset.counted) return;
      counter.dataset.counted = 'true';
      animateCounter(counter);
    });
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        startCounters();
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(counterStrip);
  } else {
    startCounters();
  }
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
