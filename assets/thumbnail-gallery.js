if (!customElements.get('thumbnail-gallery')) {
  customElements.define(
    'thumbnail-gallery',
    class ThumbnailGallery extends HTMLElement {
      constructor() {
        super();
        this.thumbnails = this.querySelectorAll('[data-thumbnail]');
        this.media = this.querySelectorAll('[data-media-id]');

        this.thumbnails.forEach((thumbnail) => {
          thumbnail.addEventListener('click', this.onClick.bind(this));
        });

        this.prevButton = this.querySelector('[data-gallery-prev]');
        this.nextButton = this.querySelector('[data-gallery-next]');
        this.prevButton?.addEventListener('click', () => this.step(-1));
        this.nextButton?.addEventListener('click', () => this.step(1));
      }

      onClick(event) {
        const id = event.currentTarget.dataset.thumbnail;

        this.activateMedia(id);
      }

      step(direction) {
        const ids = [...this.media].map((el) => el.dataset.mediaId);
        if (ids.length === 0) return;
        const active = [...this.media].find((el) => el.hasAttribute('data-active')) || this.media[0];
        const current = ids.indexOf(active.dataset.mediaId);
        const next = (current + direction + ids.length) % ids.length;
        this.activateMedia(ids[next]);
      }

      activateMedia(id) {
        const hasActive = [...this.media].find((el) => el.dataset.mediaId === id);
        if (!hasActive) return;
        this.media.forEach((el) => {
          if (el.dataset.mediaId === id) {
            el.setAttribute('data-active', true);

            const autoplay = el.querySelector('[data-autoplay="true"]');
            if (autoplay) {
              autoplay.play();
            }
          } else {
            el.removeAttribute('data-active');
            pauseAllMedia(el);
          }
        });
        this.thumbnails.forEach((el) => {
          if (el.dataset.thumbnail === id) {
            el.setAttribute('aria-pressed', true);
            el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } else {
            el.removeAttribute('aria-pressed');
          }
        });
      }
    }
  );
}
