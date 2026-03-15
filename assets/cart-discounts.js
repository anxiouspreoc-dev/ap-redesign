if (!customElements.get('cart-discounts')) {
  class CartDiscounts extends HTMLElement {
    constructor() {
      super();
      this.cart = this.closest('cart-items') || document.querySelector('cart-items');
      this.applyButton = this.querySelector('[data-apply-discount]');
      this.discountInput = this.querySelector('input[name="cart-discount"]');
      this.existingDiscounts = this.dataset.existingDiscounts ? this.dataset.existingDiscounts.split(',') : [];
      this.removeDiscounts = this.querySelectorAll('[data-remove-discount]');

      this.applyButton.addEventListener('click', this.applyDiscount.bind(this));
      this.removeDiscounts.forEach((remove) => remove.addEventListener('click', this.removeDiscount.bind(this)));
    }

    applyDiscount = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (this.applyButton.hasAttribute('aria-disabled')) return;
      this.applyButton.classList.add('loading');
      this.applyButton.setAttribute('aria-disabled', true);
      const value = this.discountInput?.value;
      const discounts = [...this.existingDiscounts, value].join(',');
      this.fetchCartUpdate(discounts, value);
    };

    removeDiscount = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.target.getAttribute('aria-disabled') === 'true') return;

      event.target.setAttribute('aria-disabled', true);

      const code = event.target.dataset.removeDiscount;
      const discounts = this.existingDiscounts.filter((value) => value !== code).join(',');

      this.fetchCartUpdate(discounts);
    };

    fetchCartUpdate = async (discounts, code = null) => {
      const config = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: `application/json` },
        body: JSON.stringify({
          discount: discounts,
        }),
      };

      fetch(`${routes.cart_update_url}`, config)
        .then((response) => {
          return response.json();
        })
        .then((parsedState) => {
          const invalidDiscount = parsedState.discount_codes.find((discount) => {
            return discount.code === code && discount.applicable === false;
          });

          if (invalidDiscount) {
            return this.onError(window.cartStrings.discountError);
          }

          this.cart.refreshCart().then(() => {
            // At the time of implementation, Shopify doesn't have an API way to check if an error is a shipping error, we need to check the returned liquid to see if it is rendering, if it's not, it's presumed to be a shipping error.
            if (code) {
              const newDiscounts = this.cart
                .querySelector('[data-existing-discounts]')
                ?.dataset.existingDiscounts?.split(',')
                .map((discount) => discount.toLowerCase());

              if (newDiscounts && !newDiscounts.includes(code?.toLowerCase())) {
                return this.onError(window.cartStrings.discountShippingError);
              }
            }

            this.applyButton.classList.remove('loading');
            this.applyButton.setAttribute('data-applied', true);
            window.utils.announce(window.cartStrings.discountSuccess);
            this.applyButton.classList.add('button--success');
            this.cart.querySelector('.cart-discount__collapsible')?.setAttribute('open', true);
            const total = this.cart.querySelector('[data-cart-total]');
            total?.focus();
            const event = new CustomEvent('discount:update', {
              detail: {
                resource: parsedState,
                id: this.id,
              },
            });
            return document.dispatchEvent(event);
          });
        })
        .catch(() => {
          this.onError(window.cartStrings.error);
        });
    };

    onError(message) {
      if (this.dataset.context === 'cart') this.discountInput.value = '';
      const event = new CustomEvent('cart:error', {
        detail: {
          source: 'cart',
          message: message,
        },
      });
      this.applyButton.classList.remove('loading');
      this.applyButton.removeAttribute('aria-disabled', true);
      return document.dispatchEvent(event);
    }
  }

  customElements.define('cart-discounts', CartDiscounts);
}
