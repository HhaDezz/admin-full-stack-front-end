import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { duration, easing, useShouldReduceMotion } from '../../lib/motion';
import { Button } from './Button';
import { Steps } from './Steps';

/* ── Wizard: a long form split into steps, each validated before moving on ── */

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  /** Form fields checked before leaving this step (inside a <Form>). */
  fields?: string[];
  content: ReactNode;
}

export interface WizardProps {
  steps: WizardStep[];
  /** Label of the last button. It submits the surrounding <Form>. */
  finishLabel?: string;
  /** Called on the last step instead of submitting a form (when not inside a <Form>). */
  onFinish?: () => void | Promise<void>;
  /** Controlled step index. */
  step?: number;
  onStepChange?: (i: number) => void;
  busy?: boolean;
}

export function Wizard({ steps, finishLabel = 'Finish', onFinish, step, onStepChange, busy }: WizardProps) {
  const form = useFormContext();
  const [own, setOwn] = useState(0);
  const [dir, setDir] = useState(1);
  const [checking, setChecking] = useState(false);
  const current = step ?? own;
  // Set when the user moves between steps; the new step's heading takes focus once it mounts.
  const focusNext = useRef(false);
  const reduce = useShouldReduceMotion();
  const s = steps[current];
  const last = current === steps.length - 1;

  const go = (i: number) => {
    focusNext.current = true;
    setDir(i > current ? 1 : -1);
    if (step === undefined) setOwn(i);
    onStepChange?.(i);
  };

  const next = async () => {
    if (form && s.fields?.length) {
      setChecking(true);
      const ok = await form.trigger(s.fields as never, { shouldFocus: true });
      setChecking(false);
      if (!ok) return;
    }
    go(current + 1);
  };

  const offset = reduce ? 0 : 24;
  return (
    <div className="wizard">
      <Steps
        items={steps.map((x) => ({ title: x.title, description: x.description }))}
        current={current}
        onStepClick={(i) => i < current && go(i)}
      />
      <div
        className="wizard-body"
        onKeyDown={(e) => {
          // Enter in a field moves to the next step instead of submitting the whole form early.
          const t = e.target as HTMLElement;
          if (e.key !== 'Enter' || last || e.nativeEvent.isComposing || t.tagName !== 'INPUT') return;
          const type = (t as HTMLInputElement).type;
          if (['checkbox', 'radio', 'button', 'submit', 'file'].includes(type) || e.defaultPrevented) return;
          e.preventDefault();
          void next();
        }}
      >
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <m.section
            key={s.id}
            custom={dir}
            aria-labelledby={`wiz-${s.id}`}
            initial={{ opacity: 0, x: dir * offset }}
            animate={{ opacity: 1, x: 0, transition: { duration: duration.base, ease: easing.enter } }}
            exit={{ opacity: 0, x: -dir * offset, transition: { duration: duration.fast, ease: easing.exit } }}
          >
            <h3
              id={`wiz-${s.id}`}
              ref={(el) => {
                // Focus the new step's heading so screen readers announce it.
                if (el && focusNext.current) {
                  focusNext.current = false;
                  el.focus();
                }
              }}
              tabIndex={-1}
              className="wizard-title"
            >
              <span className="wizard-count">
                Step {current + 1} of {steps.length}
              </span>
              {s.title}
            </h3>
            {s.description && <p className="wizard-desc">{s.description}</p>}
            <div className="wizard-content">{s.content}</div>
          </m.section>
        </AnimatePresence>
      </div>
      <div className="wizard-foot">
        <Button
          variant="ghost"
          iconStart={<ArrowLeft size={16} className="flip-rtl" />}
          onClick={() => go(current - 1)}
          disabled={current === 0 || busy}
        >
          Back
        </Button>
        <span style={{ flex: 1 }} />
        {last ? (
          <Button
            variant="primary"
            type={form && !onFinish ? 'submit' : 'button'}
            iconStart={<Check size={16} />}
            loading={busy}
            onClick={onFinish ? () => void onFinish() : undefined}
          >
            {finishLabel}
          </Button>
        ) : (
          <Button variant="primary" iconEnd={<ArrowRight size={16} className="flip-rtl" />} loading={checking} onClick={() => void next()}>
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
