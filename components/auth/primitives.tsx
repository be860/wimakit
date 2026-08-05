import { cn } from '@/lib/utils'
import { passwordStrength } from '@/lib/auth/mock-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/* ------------------------------ auth card --------------------------------- */

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-none">
      <CardHeader className="flex-col gap-1 border-b border-border px-5 py-4">
        <CardTitle className="font-display text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="px-5 py-5">{children}</CardContent>
      {footer && (
        <div className="border-t border-border bg-secondary/40 px-5 py-3.5 text-sm">
          {footer}
        </div>
      )}
    </Card>
  )
}

/* -------------------------- password strength ----------------------------- */

export function PasswordStrength({ password }: { password: string }) {
  const { score, label } = passwordStrength(password)
  const tones = [
    'bg-border',
    'bg-destructive',
    'bg-gold',
    'bg-gold',
    'bg-farmer',
  ]

  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full',
              password && score >= i ? tones[score] : 'bg-border',
            )}
          />
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground">
        {password ? `Password strength: ${label}` : 'Use 8+ characters with a number'}
      </p>
    </div>
  )
}

/* ------------------------ registration tracker ---------------------------- */

const REGISTRATION_STEPS = [
  { label: 'Registration submitted', detail: 'We received your details and documents.' },
  { label: 'Pending verification', detail: 'Your documents are queued for checking.' },
  { label: 'SuperAdmin review', detail: 'WiMakit staff verify your identity and farm.' },
  { label: 'Approved', detail: 'Your farm profile becomes active.' },
  { label: 'Temporary password sent', detail: 'A one-time password is emailed to you.' },
  { label: 'Set your own password', detail: 'You must change it at first sign in.' },
]

export function RegistrationTracker({ current = 1 }: { current?: number }) {
  return (
    <ol className="flex flex-col">
      {REGISTRATION_STEPS.map((step, i) => {
        const state = i + 1 < current ? 'done' : i + 1 === current ? 'active' : 'todo'
        return (
          <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
            {i < REGISTRATION_STEPS.length - 1 && (
              <span
                aria-hidden
                className="absolute top-5 bottom-0 left-[11px] w-px bg-border"
              />
            )}
            <span
              aria-hidden
              className={cn(
                'tabular relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                state === 'active'
                  ? 'border-farmer bg-farmer text-background'
                  : state === 'done'
                    ? 'border-farmer/40 bg-farmer/10 text-farmer'
                    : 'border-border bg-card text-muted-foreground',
              )}
            >
              {i + 1}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span
                className={cn(
                  'text-sm',
                  state === 'active' ? 'font-medium text-foreground' : 'text-foreground',
                )}
              >
                {step.label}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {step.detail}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
