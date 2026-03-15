if (!customElements.get('recently-viewed')) {
  customElements.define(
    'recently-viewed',
    class RecentlyViewed extends HTMLElement {
      constructor() {
        super();
        this.sectionId = this.dataset.sectionId;
        this.currentHandle = this.dataset.currentHandle;
        this.limit = parseInt(this.dataset.limit);
        this.slider = this.querySelector('slider-component');

        const data = localStorage.getItem(`theme:recently-viewed`);
        this.list = JSON.parse(data) || [];
        this.container = this.querySelector('.slider-component__grid');
      }

      connectedCallback() {
        this.initializeRecommendations(this.dataset.productId);
      }

      initializeRecommendations() {
        const filteredList = this.list.filter((item) => item.handle !== this.currentHandle);
        if (Shopify.designMode !== true && filteredList.length === 0) return;
        if (Shopify.designMode === true && filteredList.length !== 0) this.container.innerHTML = '';
        filteredList.forEach((item, index) => {
          if (this.container.children.length >= this.limit) return;
          const wrapper = document.createElement('li');
          wrapper.setAttribute('id', `Slide-${this.sectionId}-${index}`);
          wrapper.classList.add('slider-component__item');
          wrapper.innerHTML = item.element;
          this.container.appendChild(wrapper);
        });
        this.style.setProperty('--count', this.container.children.length);
        this.removeAttribute('hidden');
        this.slider?.mount();
      }
    }
  );
}
