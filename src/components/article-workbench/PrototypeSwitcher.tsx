import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect } from 'react'

import { Button } from '@ui/button'

export type PrototypeVariant<Key extends string> = {
  key: Key
  name: string
}

export function PrototypeSwitcher<Key extends string>({
  variants,
  current,
  onChange,
}: {
  variants: Array<PrototypeVariant<Key>>
  current: Key
  onChange: (variant: Key) => void
}) {
  const currentIndex = variants.findIndex((variant) => variant.key === current)

  const cycle = (direction: -1 | 1) => {
    const nextIndex =
      (currentIndex + direction + variants.length) % variants.length
    onChange(variants[nextIndex].key)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (target.matches('input, textarea, select, [contenteditable="true"]'))
        return
      if (event.key === 'ArrowLeft') cycle(-1)
      if (event.key === 'ArrowRight') cycle(1)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="fixed bottom-5 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-1000 bg-gray-1400 p-1.5 text-white shadow-xl">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-white hover:bg-gray-1200 hover:text-white"
        onClick={() => cycle(-1)}
        aria-label="Previous variant"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <span className="min-w-[9rem] px-1 text-center text-xs font-semibold">
        {variants[currentIndex].key} — {variants[currentIndex].name}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full text-white hover:bg-gray-1200 hover:text-white"
        onClick={() => cycle(1)}
        aria-label="Next variant"
      >
        <ArrowRight className="size-4" />
      </Button>
    </div>
  )
}
