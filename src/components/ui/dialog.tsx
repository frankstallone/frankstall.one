import * as React from 'react'
import { XIcon } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

import { cn } from '@lib/utils'
import { Button } from '@ui/button'

const dialogExitDuration = 200

const DialogMotionContext = React.createContext({ closing: false })

function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const [closing, setClosing] = React.useState(false)
  const closeTimer = React.useRef<number | null>(null)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const clearCloseTimer = React.useCallback(() => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  React.useEffect(() => clearCloseTimer, [clearCloseTimer])

  const commitOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen)
      }
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange],
  )

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        clearCloseTimer()
        setClosing(false)
        commitOpenChange(true)
        return
      }

      if (closing) {
        return
      }

      clearCloseTimer()
      setClosing(true)
      closeTimer.current = window.setTimeout(() => {
        commitOpenChange(false)
        setClosing(false)
        closeTimer.current = null
      }, dialogExitDuration)
    },
    [clearCloseTimer, closing, commitOpenChange],
  )

  return (
    <DialogMotionContext.Provider value={{ closing }}>
      <DialogPrimitive.Root
        data-slot="dialog"
        open={isOpen || closing}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </DialogMotionContext.Provider>
  )
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  const { closing } = React.useContext(DialogMotionContext)

  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      data-motion-state={closing ? 'closing' : undefined}
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      {...props}
    />
  )
})

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

function DialogContent({
  className,
  children,
  showCloseButton = true,
  portalContainer,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  portalContainer?: HTMLElement | null
}) {
  const contained = Boolean(portalContainer)
  const { closing } = React.useContext(DialogMotionContext)

  return (
    <DialogPortal data-slot="dialog-portal" container={portalContainer}>
      <DialogOverlay className={contained ? 'absolute' : undefined} />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-motion-state={closing ? 'closing' : undefined}
        className={cn(
          'top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 overflow-y-auto rounded-lg border bg-background p-6 shadow-lg outline-none sm:max-w-lg',
          contained
            ? 'absolute max-h-[calc(100%-2rem)]'
            : 'fixed max-h-[calc(100%-2rem)]',
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-[opacity,scale] duration-[var(--motion-duration-release)] ease-[var(--motion-ease-out)] active:duration-[var(--motion-duration-press)] hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
