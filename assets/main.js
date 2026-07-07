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

document.querySelectorAll('[data-quote-form]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const product = data.get('product') || 'Sheet Metal Machinery';
    const lines = [
      `Name: ${data.get('name') || ''}`,
      `Email: ${data.get('email') || ''}`,
      `WhatsApp: ${data.get('whatsapp') || ''}`,
      `Country: ${data.get('country') || ''}`,
      `Product Interest: ${product}`,
      '',
      data.get('message') || ''
    ];
    const subject = encodeURIComponent(`Inquiry for ${product}`);
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = `mailto:liukaihua@wotian-nc.com?subject=${subject}&body=${body}`;
  });
});
