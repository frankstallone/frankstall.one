/**
 * PROTOTYPE — Three compact article illustration directions for
 * "Craft is time on stone", switchable with ?variant=A|B|C.
 */
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@lib/utils'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import { Label } from '@ui/label'
import { Switch } from '@ui/switch'
import {
  CraftWorkflowIllustration,
  ResolvedWorkflowFragment,
  RoughWorkflowFragment,
  WorkflowFrame,
} from './CraftWorkflowIllustration'

type VariantKey = 'A' | 'B' | 'C'

const variants: Array<{ key: VariantKey; name: string }> = [
  { key: 'A', name: 'One moment' },
  { key: 'B', name: 'The handoff' },
  { key: 'C', name: 'The edge cases' },
]

function ComparisonVariant() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <div className="mb-2">
          <Badge
            variant="outline"
            className="border-gold-400 bg-gold-100 text-gold-900"
          >
            Rough-out
          </Badge>
          <p className="mt-1 text-step-000 text-muted-foreground">
            Everything fits. Nothing has room.
          </p>
        </div>
        <WorkflowFrame>
          <RoughWorkflowFragment compact />
        </WorkflowFrame>
      </div>
      <div>
        <div className="mb-2">
          <Badge
            variant="outline"
            className="border-mint-400 bg-mint-100 text-mint-900"
          >
            Resolved
          </Badge>
          <p className="mt-1 text-step-000 text-muted-foreground">
            One decision gets the surface.
          </p>
        </div>
        <WorkflowFrame>
          <ResolvedWorkflowFragment />
        </WorkflowFrame>
      </div>
    </div>
  )
}

function StressVariant() {
  const [narrow, setNarrow] = useState(false)
  const [longLabel, setLongLabel] = useState(false)
  const [failure, setFailure] = useState(false)

  const controls = [
    {
      id: 'stress-narrow',
      label: 'Narrow',
      checked: narrow,
      change: setNarrow,
    },
    {
      id: 'stress-label',
      label: 'Long label',
      checked: longLabel,
      change: setLongLabel,
    },
    {
      id: 'stress-failure',
      label: 'Failure',
      checked: failure,
      change: setFailure,
    },
  ]

  return (
    <div className="mx-auto max-w-[42rem]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge variant="secondary">Stress it</Badge>
          <h2 className="mt-2 font-display text-step-1 font-bold">
            Does the piece hold?
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-3">
          {controls.map((control) => (
            <div key={control.id} className="flex items-center gap-2">
              <Label htmlFor={control.id}>{control.label}</Label>
              <Switch
                id={control.id}
                checked={control.checked}
                onCheckedChange={control.change}
              />
            </div>
          ))}
        </div>
      </div>
      <WorkflowFrame
        className={cn(
          'mx-auto transition-[max-width] duration-200',
          narrow ? 'max-w-[23rem]' : 'max-w-[38rem]',
        )}
      >
        <ResolvedWorkflowFragment
          narrow={narrow}
          longLabel={longLabel}
          failure={failure}
        />
      </WorkflowFrame>
    </div>
  )
}

function PrototypeSwitcher({
  current,
  onChange,
}: {
  current: VariantKey
  onChange: (variant: VariantKey) => void
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
      <span className="min-w-[8.5rem] px-1 text-center text-xs font-semibold">
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

export default function CraftWorkflowPrototype({
  showSwitcher = true,
}: {
  showSwitcher?: boolean
}) {
  const [variant, setVariant] = useState<VariantKey>('A')

  useEffect(() => {
    const queryVariant = new URLSearchParams(window.location.search).get(
      'variant',
    )
    if (variants.some((option) => option.key === queryVariant)) {
      setVariant(queryVariant as VariantKey)
    }
  }, [])

  const changeVariant = (nextVariant: VariantKey) => {
    setVariant(nextVariant)
    const url = new URL(window.location.href)
    url.searchParams.set('variant', nextVariant)
    window.history.replaceState({}, '', url)
  }

  return (
    <section
      className="min-h-screen bg-background px-4 py-8 text-foreground md:px-6"
      aria-label="Craft workflow prototype"
    >
      <div className="mx-auto mb-6 max-w-[52rem]">
        <p className="text-step-000 font-bold uppercase tracking-wide text-indigo-700">
          Part 2 prototype
        </p>
        <h1 className="font-display text-step-2 font-bold">
          Less interface. More of the idea.
        </h1>
        <p className="mt-2 max-w-[58ch] text-step-0 text-muted-foreground">
          One moment in a security workflow: creation competing with the
          investigation, then given room of its own.
        </p>
      </div>

      <div className="mx-auto max-w-[64rem]">
        {variant === 'A' && <ComparisonVariant />}
        {variant === 'B' && <CraftWorkflowIllustration />}
        {variant === 'C' && <StressVariant />}
      </div>

      {showSwitcher && (
        <PrototypeSwitcher current={variant} onChange={changeVariant} />
      )}
    </section>
  )
}
