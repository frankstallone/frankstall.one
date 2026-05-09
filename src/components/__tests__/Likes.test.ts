import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/dom'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Likes Component', () => {
  let container: HTMLElement

  // Helper function to create and mount component
  const mountComponent = (
    props = { count: 0, slug: 'test-post' },
    initialResponse: unknown = {
      ok: true,
      json: () => Promise.resolve({ liked: false, count: props.count }),
    },
  ) => {
    // Set up default mock response for initial state check
    mockFetch.mockResolvedValueOnce(initialResponse)

    const template = document.createElement('template')
    template.innerHTML = `
      <post-likes
        id="like-button"
        data-initial="${props.count}"
        data-slug="${props.slug}"
        class="inline-flex align-center justify-center rounded-3xl bg-gray-600 text-step-00 text-gray-100"
      >
        <button
          aria-label="Click to like this post"
          class="bg-transparent border-none flex justify-center align-center px-xs py-2xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"></svg>
          <span class="ml-2xs font-display font-bold">
            <span class="sr-only">This post's current likes:</span>
            <span data-like-count>${props.count}</span>
          </span>
        </button>
      </post-likes>
    `
    container = template.content.firstElementChild as HTMLElement
    document.body.appendChild(container)
    return container
  }

  beforeEach(() => {
    // Reset fetch mock
    mockFetch.mockReset()
    // Clear DOM
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Cleanup
    container?.remove()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const getCountElement = () => {
    const span = screen.getByRole('button').querySelector('[data-like-count]')
    if (!span) {
      throw new Error('Count element not found')
    }
    return span
  }

  const waitForReady = async () => {
    const button = screen.getByRole('button')
    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
    return button
  }

  it('should render with initial count', () => {
    const initialCount = 5
    mountComponent({ count: initialCount, slug: 'test-post' })

    const countElement = getCountElement()
    expect(countElement.textContent).toContain(initialCount.toString())
  })

  it('should fetch initial liked state on mount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: true, count: 7 }),
    })

    mountComponent({ count: 0, slug: 'test-post' })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/like-post/test-post/',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }),
      )
    })

    await waitFor(() => {
      expect(getCountElement()).toHaveTextContent('7')
    })
  })

  it('should update UI optimistically on like click', async () => {
    const initialCount = 5
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: false, count: initialCount }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: true, count: initialCount + 1 }),
    })

    mountComponent({ count: initialCount, slug: 'test-post' })
    const button = await waitForReady()

    // Click the like button
    fireEvent.click(button)

    // Check immediate UI update
    await waitFor(() => {
      const countElement = getCountElement()
      expect(countElement.textContent).toContain((initialCount + 1).toString())
      expect(container.classList.contains('bg-gray-1400')).toBe(true)
    })
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/like-post/test-post/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', liked: true }),
      }),
    )
  })

  it('should send the desired unlike state on click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: true, count: 5 }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: false, count: 4 }),
    })

    mountComponent({ count: 5, slug: 'test-post' })
    const button = await waitForReady()

    fireEvent.click(button)

    await waitFor(() => {
      expect(getCountElement()).toHaveTextContent('4')
      expect(button.getAttribute('aria-label')).toContain('Click to like')
    })
    expect(mockFetch).toHaveBeenLastCalledWith(
      '/api/like-post/test-post/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ slug: 'test-post', liked: false }),
      }),
    )
  })

  it('should revert UI on failed like request', async () => {
    const initialCount = 5
    // Mock initial state fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: false, count: initialCount }),
    })
    // Mock failed like request
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    mountComponent({ count: initialCount, slug: 'test-post' })
    const button = await waitForReady()

    // Click the like button
    fireEvent.click(button)

    // Wait for reversion
    await waitFor(() => {
      const countElement = getCountElement()
      expect(countElement.textContent).toContain(initialCount.toString())
      expect(container.classList.contains('bg-transparent')).toBe(true)
    })
  })

  it('should handle server errors correctly', async () => {
    const initialCount = 5
    // Mock initial state fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: false, count: initialCount }),
    })
    // Mock server error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
    })

    mountComponent({ count: initialCount, slug: 'test-post' })
    const button = await waitForReady()

    // Click the like button
    fireEvent.click(button)

    // Wait for reversion
    await waitFor(() => {
      const countElement = getCountElement()
      expect(countElement.textContent).toContain(initialCount.toString())
      expect(container.classList.contains('bg-transparent')).toBe(true)
    })
  })

  it('should update aria-label based on liked state', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: false, count: 5 }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: true, count: 6 }),
    })

    mountComponent({ count: 5, slug: 'test-post' })
    const button = await waitForReady()

    expect(button.getAttribute('aria-label')).toContain(
      'Click to like this post',
    )

    fireEvent.click(button)

    await waitFor(() => {
      expect(button.getAttribute('aria-label')).toContain('Thank you!')
      expect(button.getAttribute('aria-label')).toContain(
        'Click to unlike this post',
      )
    })
  })

  it('should ignore clicks until the initial liked state loads', async () => {
    let resolveInitialState: (value: unknown) => void
    const initialState = new Promise((resolve) => {
      resolveInitialState = resolve
    })

    mountComponent({ count: 2, slug: 'test-post' }, initialState)
    const button = screen.getByRole('button')

    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(mockFetch).toHaveBeenCalledTimes(1)

    resolveInitialState!({
      ok: true,
      json: () => Promise.resolve({ liked: true, count: 2 }),
    })

    await waitFor(() => {
      expect(button).not.toBeDisabled()
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('should use the server liked state after a click', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: false, count: 2 }),
    })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ liked: false, count: 1 }),
    })

    mountComponent({ count: 2, slug: 'test-post' })
    const button = await waitForReady()

    fireEvent.click(button)

    await waitFor(() => {
      expect(getCountElement()).toHaveTextContent('1')
      expect(button.getAttribute('aria-label')).toContain('Click to like')
      expect(button.getAttribute('aria-label')).not.toContain('Thank you!')
    })
  })

  it('should keep likes disabled when the initial liked state fails', async () => {
    vi.useFakeTimers()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ available: false }),
    })

    mountComponent({ count: 2, slug: 'test-post' })
    const button = screen.getByRole('button')

    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button.getAttribute('aria-label')).toBe(
        'Likes are unavailable right now.',
      )
      expect(button.classList.contains('error')).toBe(true)
    })

    vi.advanceTimersByTime(2000)
    await waitFor(() => {
      expect(button).toBeDisabled()
      expect(button.classList.contains('error')).toBe(false)
    })
    expect(consoleError).toHaveBeenCalled()
  })

  it('should show and clear error state after timeout', async () => {
    vi.useFakeTimers()
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    mountComponent({ count: 0, slug: 'test-post' })
    const button = screen.getByRole('button')

    ;(container as any).showError('boom')
    expect(button.classList.contains('error')).toBe(true)

    vi.advanceTimersByTime(2000)
    await waitFor(() => {
      expect(button.classList.contains('error')).toBe(false)
    })
    expect(consoleError).toHaveBeenCalledWith('boom')
  })
})
