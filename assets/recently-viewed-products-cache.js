if (typeof RecentProductsCache === 'undefined') {
  class RecentProductsCache {
    constructor() {
      this.limit = 10;
      this.currentList = this.getCurrentListFromStorage();
    }

    getCurrentListFromStorage() {
      const raw = localStorage.getItem(`theme:recently-viewed`);
      return JSON.parse(raw) || [];
    }

    addProductsToStorage(container = document) {
      const elements = container.querySelectorAll('[data-recent-product-handle]');
      elements.forEach((el) => {
        const handle = el.dataset.recentProductHandle;
        const data = {
          handle,
          element: el.innerHTML,
        };
        const position = this.currentList.findIndex((item) => item.handle === handle);
        if (position === -1) {
          this.currentList = [data, ...this.currentList].slice(0, this.limit);
        } else {
          this.currentList = [data, ...this.currentList.filter((_, i) => i !== position)];
        }
      });
      localStorage.setItem('theme:recently-viewed', JSON.stringify(this.currentList));
    }
  }

  window.recentProductsCache = new RecentProductsCache();
  window.recentProductsCache.addProductsToStorage();
}
