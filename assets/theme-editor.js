document.addEventListener('shopify:section:load', function (event) {
  if (event.target.classList.contains('dialog-section')) {
    const modalName = event.target.querySelector('[data-name]').dataset.name;
    const customEvent = new CustomEvent(`dialog:trigger:${modalName}`);
    document.dispatchEvent(customEvent);
  }
});

document.addEventListener('shopify:section:select', function (event) {
  if (event.target.classList.contains('dialog-section')) {
    const modalName = event.target.querySelector('[data-name]').dataset.name;
    const customEvent = new CustomEvent(`dialog:trigger:${modalName}`);
    document.dispatchEvent(customEvent);
  }
});

document.addEventListener('shopify:section:deselect', function (event) {
  if (event.target.classList.contains('dialog-section')) {
    const dialog = event.target.querySelector('custom-dialog, menu-drawer, quick-add-modal, error-modal');
    dialog.closeDialog();
  }
});

document.addEventListener('shopify:block:deselect', function (event) {
  if (event.target.dataset.submenu === 'megamenu') {
    document.querySelector('header-menu').closeSubmenu(event.target);
  }

  if (event.target.classList.contains('stacked-images-with-text__image-wrapper')) {
    document.scrollTo({ top: 0, behavior: 'auto' });
    event.target.scrollIntoView();
  }
});

document.addEventListener('shopify:block:select', function (event) {
  const details = event.target.closest('collapsible-content details');
  if (details) {
    details.setAttribute('open', true);
  }
  if (event.target.dataset.submenu === 'megamenu') {
    document.querySelector('header-menu').openSubmenu(event.target);
  }
  if (event.target.classList.contains('slideshow__slide')) {
    const parentSlideshowComponent = event.target.closest('slideshow-component');
    if (parentSlideshowComponent.pause) {
      parentSlideshowComponent.pause();
    }
    parentSlideshowComponent.jumpToSlide(event.target);
  }
  if (event.target.classList.contains('slider-component__item')) {
    const parentSlideshowComponent = event.target.closest('video-reels') || event.target.closest('slider-component');
    parentSlideshowComponent.jumpToSlide(event.target);
  }
  if (event.target.dataset.submenu === 'megamenu') {
    document.querySelector('header-menu').openSubmenu(event.target);
  }
});

document.addEventListener('shopify:block:deselect', function (event) {
  if (event.target.dataset.submenu === 'megamenu') {
    document.querySelector('header-menu').closeSubmenu(event.target);
  }
});

document.addEventListener('shopify:section:load', (event) => {
  initScrollAnimationTrigger(event.target, true);
  initVideoAutoplayTrigger();
});

document.addEventListener('shopify:section:reorder', () => {
  initScrollAnimationTrigger(document, true);
  initVideoAutoplayTrigger();
});

function shareShopInfo() {
  if (localStorage.getItem(`theme:primavera-hook`) === 'true') return;

  const shop = {
    name: window.shopInfo.name,
    email: window.shopInfo.email,
    domain: window.shopInfo.domain,
    city: window.shopInfo.city,
    country: window.shopInfo.country,
    id: window.shopInfo.id,
    products: window.shopInfo.products,
    version: Shopify.theme.schema_version,
    time: new Date().toLocaleString('en-UK', { timeZone: 'UTC' }),
    locale: window.shopInfo.locale,
    theme_name: window.Shopify.theme.name,
  };

  fetch('https://hook.eu2.make.com/ik9w713od0a0i08nswflq4h4anww815m', {
    method: 'POST',
    body: JSON.stringify(shop),
  })
    .then(function (res) {
      console.log(res);
    })
    .catch(function (res) {
      console.log(res);
    });

  localStorage.setItem(`theme:primavera-hook`, 'true');
}

window.addEventListener('load', shareShopInfo);
