'use client';
import { useEffect, useState } from 'react';
import { Button } from '@nourish/ui';
import { Bell } from 'lucide-react';
import { useNourishData } from '@/providers/data-provider';
import { useI18n } from '@/providers/i18n-provider';

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const SLOTS = [
  ['Breakfast', '09:30'],
  ['Lunch', '13:30'],
  ['Dinner', '20:00'],
  ['day', '21:30'],
] as const;
type Slot = (typeof SLOTS)[number][0];
type Reminders = { enabled?: boolean } & Partial<Record<Slot, string | null>>;
type Blocker = 'server' | 'install' | 'unsupported' | 'denied' | null;

function keyBytes(base64: string) {
  const raw = atob(
    (base64 + '='.repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'),
  );
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
function blocker(hasServer: boolean): Blocker {
  if (!hasServer || !VAPID_KEY) return 'server';
  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window)
  ) {
    // iPhone only offers push to apps opened from the Home Screen.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone;
    return standalone ? 'unsupported' : 'install';
  }
  return Notification.permission === 'denied' ? 'denied' : null;
}

/**
 * Meal reminders delivered by Web Push, so they arrive with the app closed. Times live in the
 * profile (synced); this device's push channel is stored separately and removed when turned off.
 */
export function ReminderSettings() {
  const { profile, setProfile, savePushDevice, removePushDevice } = useNourishData();
  const { t, tMeal, locale } = useI18n();
  const reminders = ((profile as { reminders?: Reminders }).reminders ?? {}) as Reminders;
  const [deviceOn, setDeviceOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [block, setBlock] = useState<Blocker>(null);

  useEffect(() => {
    setBlock(blocker(!!savePushDevice));
    navigator.serviceWorker?.ready
      .then((registration) => registration.pushManager?.getSubscription())
      .then((subscription) => setDeviceOn(!!subscription))
      .catch(() => {});
  }, [savePushDevice]);

  function setReminders(patch: Reminders) {
    setProfile((previous) => ({
      ...previous,
      reminders: { ...((previous as { reminders?: Reminders }).reminders ?? {}), ...patch },
    }));
  }

  async function turnOn() {
    setBusy(true);
    setError('');
    try {
      if ((await Notification.requestPermission()) !== 'granted') {
        setBlock('denied');
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyBytes(VAPID_KEY),
        }));
      const json = subscription.toJSON();
      await savePushDevice!({
        endpoint: subscription.endpoint,
        p256dh: json.keys?.p256dh ?? '',
        auth: json.keys?.auth ?? '',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        locale,
      });
      setReminders({ enabled: true });
      setDeviceOn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('reminders.failed'));
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setError('');
    try {
      const subscription = await (
        await navigator.serviceWorker.ready
      ).pushManager.getSubscription();
      if (subscription) {
        await removePushDevice?.(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setReminders({ enabled: false });
      setDeviceOn(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('reminders.failed'));
    } finally {
      setBusy(false);
    }
  }

  const on = deviceOn && !!reminders.enabled;
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <Bell size={18} aria-hidden="true" className="shrink-0 text-[var(--accent-text)]" />
        <span className="grid min-w-0 flex-1 gap-0.5">
          <b className="text-sm font-semibold">{t('reminders.title')}</b>
          <small className="text-xs text-[var(--neutral-85858b)]">{t('reminders.hint')}</small>
        </span>
        <Button
          type="button"
          variant="unstyled"
          role="switch"
          aria-checked={on}
          aria-label={t('reminders.title')}
          disabled={busy || !!block}
          onClick={on ? turnOff : turnOn}
          className="relative h-7 w-12 shrink-0 rounded-full transition-colors motion-reduce:transition-none disabled:opacity-50"
          style={{ background: on ? 'var(--accent)' : 'var(--progress-track)' }}
        >
          <span
            className={`absolute top-0.5 size-6 rounded-full shadow-sm transition-[inset-inline-start] motion-reduce:transition-none ${on ? 'start-[22px]' : 'start-0.5'}`}
            style={{ background: 'var(--surface)' }}
          />
        </Button>
      </div>
      {block && (
        <p className="m-0 text-xs text-[var(--neutral-85858b)]">{t(`reminders.block.${block}`)}</p>
      )}
      {error && (
        <p className="m-0 text-xs text-[var(--accent-text)]" role="alert">
          {error}
        </p>
      )}
      {on && (
        <div className="grid grid-cols-2 gap-2">
          {SLOTS.map(([slot, fallback]) => {
            const value = slot in reminders ? reminders[slot] : fallback;
            return (
              <label key={slot} className="grid gap-1 text-xs text-[var(--neutral-85858b)]">
                {slot === 'day' ? t('reminders.endOfDay') : tMeal(slot)}
                <input
                  type="time"
                  value={value ?? ''}
                  onChange={(e) => setReminders({ [slot]: e.target.value || null })}
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
