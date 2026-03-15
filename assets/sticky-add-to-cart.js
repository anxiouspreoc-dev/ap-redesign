if (!customElements.get('sticky-add-to-cart')) {
  class StickyAddToCart extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.sectionId = this.dataset.sectionId;
      this.section = document.getElementById(`shopify-section-${this.sectionId}`);
      this.productForm = this.section.querySelector(`product-form[data-section-id="${this.sectionId}"]`);
      this.variantPicker = this.section.querySelector(`variant-picker[data-section="${this.sectionId}"]`);
      let lastY = 0;

      this.observer = new IntersectionObserver(([entry]) => {
        const currentY = entry.boundingClientRect.y;
        const scrollingDown = currentY < lastY;
        lastY = currentY;

        if (!entry.isIntersecting && scrollingDown) {
          this.classList.add('sticky-atc--active');
        } else {
          this.classList.remove('sticky-atc--active');
        }
      });

      this.observer.observe(this.productForm);
    }
  }

  customElements.define('sticky-add-to-cart', StickyAddToCart);
}
