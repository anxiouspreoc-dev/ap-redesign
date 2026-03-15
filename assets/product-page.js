if (!customElements.get('product-page')) {
  customElements.define(
    'product-page',
    class ProductInfo extends HTMLElement {
      abortController = undefined;

      constructor() {
        super();
        this.infoContainer = this.querySelector('.product-info__container');

        this.stickyAddToCart = this.querySelector('sticky-add-to-cart');
        this.variantDataSelectors = [
          '[data-price]',
          '[data-sku]',
          '[data-inventory]',
          'pickup-availability',
          'sticky-add-to-cart',
        ];

        if (this.classList.contains('pdp--media-scroll')) {
          window.addEventListener('resize', window.utils.throttle(this.checkViewportSize.bind(this), 50));
          this.resizeObserver = new ResizeObserver(this.checkViewportSize.bind(this));
          this.resizeObserver.observe(this.infoContainer);
        }

        setTimeout(() => this.checkViewportSize(), 0);
      }

      connectedCallback() {
        document.addEventListener('option-value:change', this.handleOptionValueChange.bind(this));
        document.addEventListener('cart:update', this.updateQuantityLabel.bind(this));
        window.recentProductsCache?.addProductsToStorage(this);
      }

      disconnectedCallback() {
        document.removeEventListener('option-value:change', this.handleOptionValueChange.bind(this));
      }

      handleOptionValueChange({ detail: { target, selectedOptionValues, focusId, activeEl } }) {
        if (!this.contains(target)) return;

        this.resetProductFormState();

        const productUrl = this.dataset.url;
        const requestUrl = this.buildRequestUrlWithParams(productUrl, selectedOptionValues);
        this.abortController?.abort();
        this.abortController = new AbortController();

        fetch(requestUrl, { signal: this.abortController.signal })
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            return this.handleUpdateProductInfo(html, productUrl, selectedOptionValues);
          })
          .then(() => {
            const override = document.getElementById(`combobox-${focusId}`);
            if (override) {
              override.focus();
            } else {
              document.querySelector(`#${focusId}`).focus();
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }

      resetProductFormState() {
        const productForm = this.productForm;
        productForm?.toggleSubmitButton(true);
      }

      setAvailable() {
        for (const el of this.variantDataSelectors) {
          const elements = this.querySelectorAll(el);
          elements.forEach((el) => el.classList.remove('hidden'));
        }
      }

      setUnavailable() {
        for (const el of this.variantDataSelectors) {
          const elements = this.querySelectorAll(el);
          elements.forEach((el) => el.classList.add('hidden'));
        }
      }

      handleUpdateProductInfo(html, productUrl, selectedOptionValues) {
        const variant = this.getSelectedVariant(html);

        this.setAvailable();

        // Update selects
        const oldNode = this.querySelector('variant-picker');
        const newNode = html.querySelector('variant-picker');
        if (newNode) HTMLUpdateUtility.viewTransition(oldNode, newNode);

        // Update url
        this.updateURL(productUrl, variant);

        // Update pickup availability
        this.pickupAvailability?.forEach((el) => el.update(variant));

        // Update hidden input
        const productFormId = this.dataset.productFormId;
        if (variant) {
          this.querySelectorAll(`#${productFormId}, #${productFormId}-installments`).forEach((productForm) => {
            const input = productForm.querySelector('input[name="id"]');
            input.value = variant.id ?? '';
            input.dispatchEvent(new Event('change', { bubbles: true }));
          });
        }

        const quantityEl = this.querySelector(`[name="quantity"][form="${this.dataset.productFormId}"]`);
        if (quantityEl) this.quantity = parseInt(quantityEl.value);

        // Update other UI elements
        this.updateElement(html, '[data-price]');
        this.updateElement(html, '[data-quantity]');
        this.updateElement(html, '[data-sku]');
        this.updateElement(html, '[data-inventory]');
        this.updateElement(html, '[data-share]');
        this.updateElement(html, '[data-sticky-atc]');
        this.updateQuantityValue();

        if (!variant) {
          this.productForm?.toggleSubmitButton(true, window.variantStrings.unavailable);
          this.setUnavailable();
          selectedOptionValues.forEach((value) => {
            const el = this.querySelector(`[data-option-value-id="${value}"]`);
            el.checked = true;
          });
          this.return;
        } else {
          this.productForm?.toggleSubmitButton(
            html.querySelector('[type="submit"]')?.hasAttribute('aria-disabled') ?? true,
            window.variantStrings.soldOut
          );
        }

        const event = new CustomEvent('variant:change', {
          detail: {
            sectionId: this.sectionId,
            html,
            variant,
          },
        });
        document.dispatchEvent(event);
      }

      getSelectedVariant(html) {
        const selectedVariant = html.querySelector('variant-picker [data-selected-variant]')?.innerHTML;
        return !!selectedVariant ? JSON.parse(selectedVariant) : null;
      }

      buildRequestUrlWithParams(productUrl, selectedOptionValues) {
        const params = [];
        params.push(`section_id=${this.dataset.section}`);
        if (selectedOptionValues.length) params.push(`option_values=${selectedOptionValues.join(',')}`);
        return `${productUrl}?${params.join('&')}`;
      }

      updateElement(html, selector) {
        const source = html.querySelector(selector);
        const destination = this.querySelectorAll(selector);
        if (source && destination) destination.forEach((dest) => (dest.innerHTML = source.innerHTML));
      }

      updateQuantityLabel() {
        const currentVariantId = this.productForm?.variantIdInput?.value;
        if (!currentVariantId) return;

        fetch(`${this.dataset.url}?variant=${currentVariantId}&section_id=${this.dataset.section}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = new DOMParser().parseFromString(responseText, 'text/html');
            this.updateElement(html, '[data-quantity-label]');
          })
          .catch((e) => console.error(e));
      }

      updateQuantityValue() {
        const quantityElements = this.querySelectorAll(`[name="quantity"][form="${this.dataset.productFormId}"]`);
        quantityElements.forEach((el) => {
          if (el.min && this.quantity < parseInt(el.min)) return;
          if (el.max && this.quantity > parseInt(el.max)) return;
          if (el.step && this.quantity % parseInt(el.step) !== 0) return;
          el.value = this.quantity;
        });
      }

      updateURL(productUrl, variant) {
        if (!variant) return;
        if (this.hasAttribute('data-update-url') === true) {
          window.history.replaceState({}, '', `${productUrl}${variant.id ? `?variant=${variant.id}` : ''}`);
        }

        this.querySelector('share-button')?.updateURL(
          `${window.shopUrl}${productUrl}${variant.id ? `?variant=${variant.id}` : ''}`
        );
      }

      checkViewportSize() {
        if (!this.infoContainer) return;
        const height = this.infoContainer.clientHeight;
        const style = getComputedStyle(this);
        const transparentHeight = parseFloat(style.getPropertyValue('--transparent-header-height').replace('px', ''));
        const minHeight = height + transparentHeight * 2;

        this.classList.toggle('pdp--shorter-than-viewport', window.innerHeight > minHeight);
      }

      get productForm() {
        return this.querySelector(`product-form`);
      }

      get sectionId() {
        return this.dataset.section;
      }

      get pickupAvailability() {
        return this.querySelectorAll(`pickup-availability`);
      }
    }
  );
}
