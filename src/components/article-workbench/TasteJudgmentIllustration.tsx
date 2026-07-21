import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Check, ChevronRight } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@ui/badge'
import { Bubble, BubbleContent, BubbleGroup } from '@ui/bubble'
import { Button } from '@ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@ui/card'
import { Tabs, TabsList, TabsTrigger } from '@ui/tabs'

const easeOut = [0.22, 1, 0.36, 1] as const

function QueueFragment() {
  return (
    <Card className="gap-4 border-gray-800 py-4">
      <CardHeader className="gap-1 px-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="font-display text-step-0 font-bold">
            Investigation queue
          </CardTitle>
          <Badge variant="secondary">12 open</Badge>
        </div>
        <CardDescription>Prioritized identity risk signals</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 px-4">
        <div className="rounded-lg border border-gray-700 bg-indigo-100 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Impossible travel</p>
              <p className="text-xs text-muted-foreground">
                Frank Stallone · 4 minutes ago
              </p>
            </div>
            <Badge variant="destructive">Critical</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-700 p-3">
          <div>
            <p className="text-sm font-semibold">Unfamiliar sign-in</p>
            <p className="text-xs text-muted-foreground">
              Ada Lovelace · 9 min
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground" />
        </div>
        <Button size="sm" className="ml-auto">
          Open investigation
        </Button>
      </CardContent>
    </Card>
  )
}

export function TasteJudgmentIllustration() {
  const [mode, setMode] = useState<'preference' | 'judgment'>('preference')
  const reducedMotion = useReducedMotion()

  return (
    <div className="mx-auto max-w-[48rem] font-base text-foreground">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <p className="font-display text-step-0 font-bold">
          Two very different critiques.
        </p>
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as 'preference' | 'judgment')}
        >
          <TabsList aria-label="Critique type">
            <TabsTrigger value="preference">Preference</TabsTrigger>
            <TabsTrigger value="judgment">Judgment</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid overflow-hidden rounded-xl border border-border bg-muted shadow-lg md:grid-cols-[1.05fr_0.95fr]">
        <div className="flex items-center p-4 sm:p-6">
          <QueueFragment />
        </div>
        <div className="flex min-h-[18rem] items-center border-t border-border bg-background p-5 md:border-t-0 md:border-l">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: reducedMotion ? 0 : 0.2, ease: easeOut }}
              className="w-full"
            >
              {mode === 'preference' ? (
                <BubbleGroup>
                  <Bubble variant="muted">
                    <BubbleContent>I like this card layout.</BubbleContent>
                  </Bubble>
                  <Bubble variant="outline" align="end">
                    <BubbleContent>
                      True, maybe. But there is nowhere for the conversation to
                      go.
                    </BubbleContent>
                  </Bubble>
                </BubbleGroup>
              ) : (
                <div>
                  <p className="mb-3 text-sm font-semibold">
                    This works because…
                  </p>
                  <ul className="m-0 grid list-none gap-3 pl-0 text-sm">
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint-700" />
                      The hierarchy follows the analyst’s decision path.
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint-700" />
                      Critical context is scannable before secondary detail.
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-mint-700" />
                      The action appears where the analyst is ready to act.
                    </li>
                  </ul>
                  <p className="mt-4 text-sm font-semibold">
                    Now the team has something it can examine.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
