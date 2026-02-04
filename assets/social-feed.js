class SocialFeed {
  constructor(root) {
    this.root = root;
    this.items = Array.from(root.querySelectorAll('[data-social-feed-item]'));
    this.emptyState = root.querySelector('[data-social-feed-empty]');
    this.carousel = root.querySelector('[data-social-feed-carousel]');
    this.provider = root.dataset.provider || 'instagram';
    this.feedUrl = root.dataset.feedUrl || '';
    this.limit = parseInt(root.dataset.limit || this.items.length, 10);
    this.showCaptions = root.dataset.showCaptions === 'true';
    this.openNewTab = root.dataset.openNewTab === 'true';
  }

  async init() {
    if (!this.items.length) return;
    const endpoint = this.resolveEndpoint();
    if (!endpoint) {
      this.setEmptyState(true);
      return;
    }

    try {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('limit', this.limit);

      const response = await fetch(url.toString(), { credentials: 'same-origin' });
      if (!response.ok) {
        throw new Error(`Feed request failed (${response.status})`);
      }

      const payload = await response.json();
      const items = Array.isArray(payload.items) ? payload.items : [];
      this.render(items);
      this.setEmptyState(items.length === 0);
    } catch (error) {
      this.root.classList.add('social-feed--error');
      this.setEmptyState(true);
      console.error('[social-feed] failed to load', error);
    }
  }

  resolveEndpoint() {
    if (this.feedUrl && this.feedUrl.trim().length > 0) return this.feedUrl.trim();
    return `https://social-feed.staygolden.co.nz/app_proxy/${this.provider}`;
  }

  setEmptyState(isEmpty) {
    if (this.emptyState) {
      if (isEmpty) {
        this.emptyState.removeAttribute('hidden');
      } else {
        this.emptyState.setAttribute('hidden', '');
      }
    }

    if (this.carousel) {
      if (isEmpty) {
        this.carousel.setAttribute('hidden', '');
      } else {
        this.carousel.removeAttribute('hidden');
      }
    }
  }

  render(items) {
    this.items.forEach((item, index) => {
      const data = items[index];
      if (!data) {
        item.setAttribute('hidden', '');
        return;
      }

      item.removeAttribute('hidden');

      const link = item.querySelector('[data-social-feed-link]');
      const image = item.querySelector('[data-social-feed-image]');
      const caption = item.querySelector('[data-social-feed-caption]');

      if (link) {
        link.href = data.permalink || '#';
        if (this.openNewTab) {
          link.target = '_blank';
          link.rel = 'noopener';
        } else {
          link.removeAttribute('target');
          link.removeAttribute('rel');
        }
      }

      if (image) {
        image.src = data.media_url || data.thumbnail_url || '';
        image.alt = data.caption ? data.caption.slice(0, 160) : 'Social post';
        image.addEventListener(
          'load',
          () => {
            item.classList.add('social-feed__item--loaded');
          },
          { once: true }
        );
      }

      if (caption) {
        caption.textContent = this.showCaptions ? data.caption || '' : '';
      }
    });
  }
}

const initSocialFeeds = () => {
  document.querySelectorAll('[data-social-feed]').forEach((element) => {
    const feed = new SocialFeed(element);
    feed.init();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSocialFeeds);
} else {
  initSocialFeeds();
}

document.addEventListener('shopify:section:load', initSocialFeeds);
document.addEventListener('shopify:section:reorder', initSocialFeeds);
