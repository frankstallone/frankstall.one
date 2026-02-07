import '@testing-library/jest-dom'

// Add custom element to the registry since we're testing a web component
customElements.define(
  'post-likes',
  class extends HTMLElement {
    liked: boolean
    count: number
    countSpan: HTMLSpanElement | null
    likeButton: HTMLButtonElement | null

    constructor() {
      super()
      // Initialize properties that we access in the tests
      this.liked = false
      this.count = Number(this.dataset.initial || 0)
      this.countSpan = null
      this.likeButton = null
    }

    connectedCallback() {
      this.countSpan = this.querySelector('span')
      this.likeButton = this.querySelector('button')
      this.updateLikedState()
      this.addLikeButtonEventListener()
    }

    addLikeButtonEventListener() {
      this.likeButton?.addEventListener('click', async (e) => {
        e.preventDefault()
        const initialCount = this.count
        const wasLiked = this.liked

        // Optimistic update
        this.liked = !this.liked
        if (this.liked) {
          this.count++
        } else {
          this.count--
        }
        this.updateUI()

        try {
          const response = await fetch(`/api/like-post/${this.dataset.slug}/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ slug: this.dataset.slug }),
          })

          if (!response.ok) {
            throw new Error('Server error')
          }
        } catch (error) {
          // Revert on error
          this.count = initialCount
          this.liked = wasLiked
          this.updateUI()
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

    async updateLikedState() {
      try {
        const response = await fetch(`/api/like-post/${this.dataset.slug}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const { liked } = await response.json()
          this.liked = liked
          this.updateUI()
        }
      } catch (error) {
        console.error(error)
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
