if (!customElements.get('video-reels')) {
  customElements.define(
    'video-reels',
    class VideoReels extends SliderComponent {
      constructor() {
        super();
        this.autoplay = this.dataset.reelAutoplay === 'true';
        this.scrollTimeout = null;
        this.totalPages = this.sliderItems.length;
        this.videos = this.querySelectorAll('deferred-media');
        this.muteButtons = this.querySelectorAll('mute-button');
        this.slider.addEventListener('scroll', this.onScroll.bind(this));
        this.addEventListener('video:play', this.onVideoPlay.bind(this));
        this.addEventListener('video:ended', this.onVideoEnded.bind(this));
        this.sliderItems[0].setAttribute('data-current-page', true);

        this.observer = new IntersectionObserver(
          (elements, observer) => {
            elements.forEach((element) => {
              if (element.isIntersecting) {
                this.videos.forEach((video) => video.loadContent(false, false));
                const unmutedVideo = [...this.sliderItems].find((el) => el.querySelector('[data-muted="false"]'));
                if (this.autoplay && !unmutedVideo) this.playSlideMedia(this.sliderItems[this.currentPage - 1]);
              } else {
                this.sliderItems.forEach((item) => this.pauseSlideMedia(item));
              }
            });
          },
          {
            threshold: [0, 1],
          }
        );
        this.observer.observe(this);
        if (window.utils.isInViewport(this) && this.autoplay) {
          this.playSlideMedia(this.sliderItems[this.currentPage - 1]);
        }

        this.muteButtons.forEach((muteButton) => {
          muteButton.addEventListener('click', (event) => {
            const component = muteButton.closest('deferred-media');
            const currentVideo = component.querySelector('video');
            setTimeout(() => {
              const isMuted = currentVideo.muted;
              this.videos.forEach((media) => {
                if (media === component) return;
                const video = media.querySelector('video');
                video.muted = isMuted;
              });
            }, 0);
          });
        });
      }

      update() {
        this.hideOrDestroy();
        this.setSlideVisibility();
        this.updateProgressBar();
        this.updateCounter();
        this.updateArrowState();
      }

      updateCounter() {
        if (this.currentPage !== 0)
          this.currentPageElement.textContent = Math.min(this.currentPage, this.totalPages) || 1;
        this.totalPages = this.sliderItems.length;
        this.pageTotalElement.setAttribute('data-total', this.totalPages);
        this.pageTotalElement.textContent = this.totalPages;
      }

      calculateFromDirection(direction, jump = true) {
        const currentSlide = this.sliderItems[this.currentPage - 1];
        this.pauseSlideMedia(currentSlide);
        super.calculateFromDirection(direction, jump);
        this.update();
        const futureSlide = this.sliderItems[this.currentPage - 1];
        this.playSlideMedia(futureSlide);
      }

      onVideoEnded() {
        const video = event.detail.media;
        const sliderItem = video.closest('.slider-component__item');
        if (
          sliderItem.nextElementSibling &&
          sliderItem.nextElementSibling.classList.contains('slider-component__item')
        ) {
          const nextSliderItem = sliderItem.nextElementSibling;
          this.jumpToSlide(nextSliderItem);
          this.playSlideMedia(nextSliderItem);
          if (!Shopify.designMode) nextSliderItem.querySelector('play-pause-button button')?.focus({preventScroll: true});
        }
      }

      onScroll() {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
          this.sliderItems.forEach((item, index) => {
            if (item.getAttribute('aria-hidden') === 'true') {
              this.pauseSlideMedia(item);
            }
          });

          if (!this.programmaticScroll) {
            this.firstVisible = this.querySelector('.slider-component__item[aria-hidden="false"]');
            if (this.firstVisible) this.playSlideMedia(this.firstVisible);
            this.updateArrowState();
          }
          this.programmaticScroll = false;
        }, 50);
      }

      playSlideMedia(slide) {
        const media = slide?.querySelector('deferred-media');
        if (!media.media) media?.loadContent(false);
        media?.play();
      }

      pauseSlideMedia(slide) {
        const media = slide.querySelector('deferred-media');
        media.pause();
      }

      onVideoPlay(event) {
        this.dataset.playing = true;
        const currentSlide = event.detail.media.closest('.slider-component__item');
        this.sliderItems.forEach((slide) => {
          if (slide !== currentSlide) this.pauseSlideMedia(slide);
        });

        this.currentPage = [...this.sliderItems].findIndex((el) => el === currentSlide) + 1;
        this.sliderItems.forEach((item) => item.removeAttribute('data-current-page'));
        currentSlide.setAttribute('data-current-page', true);
        this.updateCounter();
        this.updateArrowState();
      }

      jumpToSlide(slide) {
        this.programmaticScroll = true;
        if (!slide) return;

        const sliderRect = this.slider.getBoundingClientRect();
        const elementRect = slide.getBoundingClientRect();
        let left = (elementRect.left - sliderRect.left) + this.slider.scrollLeft + elementRect.width / 2 - sliderRect.width / 2;
        this.slider.scroll({ left, behavior: 'smooth'});
      }
    }
  );
}
