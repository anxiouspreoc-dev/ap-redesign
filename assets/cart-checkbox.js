if (!window.customElements.get('cart-checkbox')) {
  class CartCheckbox extends HTMLElement {
    constructor() {
      super();
      this.checkbox = this.querySelector('[type="checkbox"]');
      this.form = this.checkbox.form;
      this.checkout = this.form.elements.namedItem('checkout');
      this.checkbox.addEventListener('change', this.onChange.bind(this));
    }

    onChange(event) {
      if (this.checkbox.checked === true) {
        this.checkout.removeAttribute('aria-disabled');
      } else {
        this.checkout.setAttribute('aria-disabled', true);
      }
    }
  }

  window.customElements.define('cart-checkbox', CartCheckbox);
}
