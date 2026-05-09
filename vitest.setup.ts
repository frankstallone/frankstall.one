import '@testing-library/jest-dom'

// Add custom element to the registry since we're testing a web component
customElements.define(
  'post-likes',
  class extends HTMLElement {
    liked: boolean
    count: number
    countSpan: HTMLSpanElement | null
    likeButton: HTMLButtonElement | null
    isUpdating: boolean

    constructor() {
      super()
      // Initialize properties that we access in the tests
      this.liked = false
      this.count = Number(this.dataset.initial || 0)
      this.countSpan = null
      this.likeButton = null
      this.isUpdating = true
    }

    connectedCallback() {
      this.countSpan =
        this.querySelector('[data-like-count]') ?? this.querySelector('span')
      this.likeButton = this.querySelector('button')
      this.addLikeButtonEventListener()
      void this.hydrateLikedState()
    }

    addLikeButtonEventListener() {
      this.likeButton?.addEventListener('click', async (e) => {
        e.preventDefault()
        if (this.isUpdating) {
          return
        }

        const initialCount = this.count
        const wasLiked = this.liked
        const desiredLiked = !this.liked
        this.isUpdating = true
        if (this.likeButton) {
          this.likeButton.disabled = true
        }

        // Optimistic update
        this.liked = desiredLiked
        if (this.liked) {
          this.count++
        } else {
          this.count = Math.max(0, this.count - 1)
        }
        this.updateUI()

        try {
          const response = await fetch(`/api/like-post/${this.dataset.slug}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              slug: this.dataset.slug,
              liked: desiredLiked,
            }),
          })

          if (!response.ok) {
            throw new Error('Server error')
          }

          this.applyServerState(await response.json())
          this.updateUI()
        } catch (error) {
          // Revert on error
          this.count = initialCount
          this.liked = wasLiked
          this.updateUI()
        } finally {
          this.isUpdating = false
          if (this.likeButton) {
            this.likeButton.disabled = false
          }
        }
      })
    }

    // Methods that we call in the tests
    updateUI() {
      if (this.liked) {
        this.classList.add('bg-gray-1400')
        this.classList.remove('bg-gray-600', 'bg-transparent')
        if (this.likeButton) {
          this.likeButton.setAttribute(
            'aria-label',
            `Thank you! Click to unlike this post. This post has been liked ${this.count} times.`,
          )
        }
      } else {
        this.classList.remove('bg-gray-1400')
        this.classList.add('bg-transparent')
        if (this.likeButton) {
          this.likeButton.setAttribute(
            'aria-label',
            `Click to like this post. This post has been liked ${this.count} times.`,
          )
        }
      }
      if (this.countSpan) {
        this.countSpan.textContent = this.count.toString()
      }
    }

    async hydrateLikedState() {
      this.isUpdating = true
      if (this.likeButton) {
        this.likeButton.disabled = true
      }
      try {
        await this.updateLikedState()
        this.isUpdating = false
        if (this.likeButton) {
          this.likeButton.disabled = false
        }
      } catch (error) {
        console.error(error)
        this.showError('Failed to load like status')
        this.setUnavailableState()
      }
    }

    async updateLikedState() {
      const response = await fetch(`/api/like-post/${this.dataset.slug}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch like state')
      }

      this.applyServerState(await response.json())
      this.updateUI()
    }

    applyServerState({ liked, count }: { liked?: unknown; count?: unknown }) {
      if (typeof liked === 'boolean') {
        this.liked = liked
      }
      if (typeof count === 'number') {
        this.count = count
      }
    }

    setUnavailableState() {
      this.isUpdating = true
      if (this.likeButton) {
        this.likeButton.disabled = true
        this.likeButton.setAttribute(
          'aria-label',
          'Likes are unavailable right now.',
        )
      }
    }

    showError(message: string) {
      console.error(message)
      if (this.likeButton) {
        this.likeButton.classList.add('error')
        setTimeout(() => {
          this.likeButton?.classList.remove('error')
        }, 2000)
      }
    }
  },
)
