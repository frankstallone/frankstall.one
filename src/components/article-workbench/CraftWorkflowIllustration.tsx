import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Save,
  Sparkles,
} from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'

import { cn } from '@lib/utils'
import { Alert, AlertDescription, AlertTitle } from '@ui/alert'
import { Badge } from '@ui/badge'
import { Button } from '@ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@ui/dialog'
import { Input } from '@ui/input'
import { Label } from '@ui/label'
import { Separator } from '@ui/separator'
import { Tabs, TabsList, TabsTrigger } from '@ui/tabs'

export type WorkflowState = 'rough' | 'resolved'

const easeOut = [0.22, 1, 0.36, 1] as const

export function WorkflowFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-muted shadow-lg',
        className,
      )}
    >
      <div className="flex h-9 items-center gap-2 border-b border-border bg-background px-3">
        <div className="flex gap-1" aria-hidden="true">
          <span className="size-2 rounded-full bg-gray-700" />
          <span className="size-2 rounded-full bg-gray-600" />
          <span className="size-2 rounded-full bg-gray-500" />
        </div>
      </div>
      {children}
    </div>
  )
}

function ProductMark() {
  return <div className="text-sm font-semibold">Northstar</div>
}

export function RoughWorkflowFragment({
  compact = false,
}: {
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [lostDraft, setLostDraft] = useState(false)
  const dialogBoundaryRef = useRef<HTMLDivElement>(null)

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen && name) {
      setLostDraft(true)
      setName('')
    }
    setOpen(nextOpen)
  }

  return (
    <div
      ref={dialogBoundaryRef}
      className="relative isolate flex h-full items-center justify-center overflow-hidden bg-muted p-3 sm:p-4"
    >
      <Card className="w-full max-w-[30rem] gap-4 border-gray-800 py-4">
        <CardHeader className="gap-3 px-4 [.border-b]:pb-4">
          <div className="flex items-center justify-between gap-3">
            <ProductMark />
            <Badge variant="destructive">Critical</Badge>
          </div>
          <div>
            <CardTitle className="font-display text-step-0 font-bold">
              Impossible travel
            </CardTitle>
            <CardDescription>
              Identity risk signal · 4 minutes ago
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 px-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-md bg-indigo-100 p-3 text-indigo-1000">
              <strong className="block text-step-0">6</strong>
              Signals
            </div>
            <div className="rounded-md bg-gold-100 p-3 text-gold-1000">
              <strong className="block text-step-0">3</strong>
              Manual steps
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm">
              <Sparkles
                className="size-3.5 text-indigo-700"
                aria-hidden="true"
              />
              Enrich
            </Button>
            <Button variant="outline" size="sm">
              Assign
            </Button>
            <Dialog open={open} onOpenChange={changeOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Create workflow</Button>
              </DialogTrigger>
              <DialogContent portalContainer={dialogBoundaryRef.current}>
                <DialogHeader>
                  <DialogTitle>Build investigation workflow ✨</DialogTitle>
                  <DialogDescription>
                    Configure the workflow without leaving the alert.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                  <Input
                    aria-label="Workflow name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Workflow name"
                  />
                  <Input
                    aria-label="Detection source"
                    placeholder="Detection source"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input aria-label="Severity" placeholder="Severity" />
                    <Input aria-label="Assignee" placeholder="Assignee" />
                  </div>
                  {!compact && (
                    <>
                      <Input
                        aria-label="Evidence sources"
                        placeholder="Evidence sources"
                      />
                      <Input
                        aria-label="Notification channel"
                        placeholder="Notification channel"
                      />
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changeOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm">Create &amp; run</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-xs text-muted-foreground">
            Creation, investigation, and manual actions all share this surface.
          </p>

          <AnimatePresence>
            {lostDraft && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertTriangle aria-hidden="true" />
                  <AlertTitle>Draft lost</AlertTitle>
                  <AlertDescription>
                    The dialog closed. Your draft went with it.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

export function ResolvedWorkflowFragment({
  narrow = false,
  longLabel = false,
  failure = false,
}: {
  narrow?: boolean
  longLabel?: boolean
  failure?: boolean
}) {
  const [name, setName] = useState('Investigate suspicious identity activity')
  const [saved, setSaved] = useState(true)
  const reducedMotion = useReducedMotion()

  return (
    <div className="flex h-full items-center justify-center bg-muted p-3 sm:p-4">
      <Card
        className={cn(
          'w-full gap-4 border-gray-800 py-4 transition-[max-width] duration-200',
          narrow ? 'max-w-[20rem]' : 'max-w-[32rem]',
        )}
      >
        <CardHeader className="gap-3 px-4 [.border-b]:pb-4">
          <div className="grid gap-0.5">
            <ProductMark />
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                Investigations{' '}
                <ChevronRight className="size-3" aria-hidden="true" /> New
              </div>
              <Badge variant="secondary">Step 1 of 3</Badge>
            </div>
          </div>
          <div>
            <CardTitle className="font-display text-step-0 font-bold">
              Create an investigation
            </CardTitle>
            <CardDescription>
              Start with the decision this workflow should help make.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 px-4">
          {failure && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: easeOut }}
            >
              <Alert variant="destructive">
                <AlertTriangle aria-hidden="true" />
                <AlertTitle>Evidence is unavailable</AlertTitle>
                <AlertDescription>Your draft is still saved.</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="resolved-workflow-name">
              {longLabel
                ? 'Name this workflow so an on-call analyst can understand it without opening it'
                : 'Workflow name'}
            </Label>
            <Input
              id="resolved-workflow-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setSaved(false)
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="resolved-source">Detection source</Label>
            <Input id="resolved-source" defaultValue="Identity risk signal" />
          </div>

          <Alert className="border-mint-400 bg-mint-100 text-mint-900">
            <Sparkles aria-hidden="true" />
            <AlertDescription className="text-mint-900">
              Evidence enrichment and assignment happen automatically.
            </AlertDescription>
          </Alert>
        </CardContent>

        <Separator />

        <CardFooter className="flex-wrap justify-between gap-3 px-4">
          <span
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
            aria-live="polite"
          >
            {saved ? (
              <Check className="size-3.5 text-mint-700" />
            ) : (
              <Save className="size-3.5" />
            )}
            {saved ? 'Draft saved' : 'Unsaved changes'}
          </span>
          <Button size="sm" disabled={failure} onClick={() => setSaved(true)}>
            Continue <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export function CraftWorkflowIllustration() {
  const [state, setState] = useState<WorkflowState>('rough')
  const reducedMotion = useReducedMotion()

  return (
    <div className="mx-auto max-w-[38rem] font-base text-foreground">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <p className="font-display text-step-0 font-bold">
          Same job. Better shape.
        </p>
        <Tabs
          value={state}
          onValueChange={(value) => setState(value as WorkflowState)}
          aria-label="Workflow state"
        >
          <TabsList>
            <TabsTrigger value="rough">Rough</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <WorkflowFrame>
        <div className="grid w-full grid-cols-1">
          <motion.div
            className={cn(
              'col-start-1 row-start-1 min-w-0',
              state !== 'rough' && 'invisible pointer-events-none',
            )}
            aria-hidden={state !== 'rough'}
            initial={false}
            animate={{
              opacity: state === 'rough' ? 1 : 0,
              x: reducedMotion || state === 'rough' ? 0 : -8,
            }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: easeOut }}
          >
            <RoughWorkflowFragment />
          </motion.div>
          <motion.div
            className={cn(
              'col-start-1 row-start-1 min-w-0',
              state !== 'resolved' && 'invisible pointer-events-none',
            )}
            aria-hidden={state !== 'resolved'}
            initial={false}
            animate={{
              opacity: state === 'resolved' ? 1 : 0,
              x: reducedMotion || state === 'resolved' ? 0 : 8,
            }}
            transition={{ duration: reducedMotion ? 0 : 0.22, ease: easeOut }}
          >
            <ResolvedWorkflowFragment />
          </motion.div>
        </div>
      </WorkflowFrame>

      <p
        className="mt-3 text-center text-step-000 text-muted-foreground"
        aria-live="polite"
      >
        {state === 'rough'
          ? 'A functional alert card carrying creation and manual work.'
          : 'A focused route with labels, saved state, and automatic work.'}
      </p>
    </div>
  )
}
