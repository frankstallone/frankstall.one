import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BellRing, Gem, WandSparkles, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@lib/utils'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import { Tabs, TabsList, TabsTrigger } from '@ui/tabs'

function InterfaceRow({
  label,
  count,
  action,
  resolved,
  icon: Icon,
  iconClassName,
  reducedMotion,
}: {
  label: string
  count: number
  action: string
  resolved: boolean
  icon: LucideIcon
  iconClassName: string
  reducedMotion: boolean
}) {
  const transition = { duration: reducedMotion ? 0 : 0.18 }

  return (
    <motion.div
      layout={!reducedMotion}
      className="flex flex-col items-stretch gap-3 rounded-lg border border-gray-700 bg-background px-3 py-2.5 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex min-w-0 items-center gap-2">
        <AnimatePresence initial={false}>
          {!resolved && (
            <motion.span
              initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, width: 28 }}
              exit={{ opacity: 0, scale: 0.8, width: 0 }}
              transition={transition}
              className={cn(
                'flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md',
                iconClassName,
              )}
            >
              <Icon className="size-3.5 shrink-0" />
            </motion.span>
          )}
        </AnimatePresence>
        <div className="min-w-0">
          <p className="text-sm font-semibold">
            {label}
            <AnimatePresence initial={false}>
              {!resolved && (
                <motion.span
                  initial={reducedMotion ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={transition}
                  className="ml-1 text-muted-foreground"
                >
                  {' '}
                  ({count})
                </motion.span>
              )}
            </AnimatePresence>
          </p>
          <p className="text-xs text-muted-foreground">
            Canonical list pattern
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="shrink-0 self-end bg-transparent md:self-auto"
      >
        {action}
        <AnimatePresence initial={false}>
          {!resolved && (
            <motion.span
              initial={reducedMotion ? false : { opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={transition}
              className="overflow-hidden"
            >
              &nbsp;({count})
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}

export function LeverageTasteIllustration() {
  const [resolved, setResolved] = useState(false)
  const reducedMotion = useReducedMotion() ?? false

  return (
    <div className="mx-auto max-w-[46rem] font-base text-foreground">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-step-0 font-bold">
            One judgment. Three surfaces.
          </p>
          <p className="text-sm text-muted-foreground">
            Move familiar feedback closer to the decision.
          </p>
        </div>
        <Tabs
          value={resolved ? 'encoded' : 'manual'}
          onValueChange={(value) => setResolved(value === 'encoded')}
        >
          <TabsList aria-label="Judgment state">
            <TabsTrigger value="manual">Repeated</TabsTrigger>
            <TabsTrigger value="encoded">Encoded</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid overflow-hidden rounded-xl border border-border bg-muted shadow-lg md:grid-cols-[0.8fr_1.2fr]">
        <div className="flex items-center border-b border-border bg-background p-5 md:border-r md:border-b-0">
          <div>
            <Badge variant={resolved ? 'default' : 'secondary'}>
              {resolved ? 'Design system rule' : 'Review comment'}
            </Badge>
            <p className="mt-3 text-sm font-semibold">
              Keep one useful count. Remove icons that don’t clarify the
              workflow.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {resolved
                ? 'The reasoning is available while the interface is built.'
                : 'The same correction waits for a human—again.'}
            </p>
          </div>
        </div>
        <div className="grid gap-2 p-4 sm:p-5">
          <InterfaceRow
            label="Investigations"
            count={12}
            action="View"
            resolved={resolved}
            icon={BellRing}
            iconClassName="bg-gold-vivid-300 text-gold-vivid-900"
            reducedMotion={reducedMotion}
          />
          <InterfaceRow
            label="Signals"
            count={4}
            action="Review"
            resolved={resolved}
            icon={Gem}
            iconClassName="bg-indigo-vivid-300 text-indigo-vivid-900"
            reducedMotion={reducedMotion}
          />
          <InterfaceRow
            label="Policies"
            count={7}
            action="Manage"
            resolved={resolved}
            icon={WandSparkles}
            iconClassName="bg-mint-vivid-300 text-mint-vivid-900"
            reducedMotion={reducedMotion}
          />
        </div>
      </div>
    </div>
  )
}
