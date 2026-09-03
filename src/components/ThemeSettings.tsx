import { Check, Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { useMotionPreference } from '../lib/motion';
import { exportCss, FONTS, PRESETS, useTheme, type FontPair, type SidebarStyle, type ThemeMode } from '../lib/theme';
import { Button, CopyButton, Field, Slider, Switch, ToggleGroup } from './kit';

/** Every theme control: preset, brand colour, mode, direction, density, radius, font, sidebar, width, motion. */
/** headingLevel: 4 inside the customizer drawer (its title is an h3), 3 inside a settings card. */
export function ThemeSettingsPanel({ headingLevel = 4 }: { headingLevel?: 3 | 4 } = {}) {
  const H = `h${headingLevel}` as 'h4';
  const { settings: s, update, theme } = useTheme();
  const { pref, setPref } = useMotionPreference();
  return (
    <div className="tc">
      <section className="tc-sec" aria-labelledby="tc-preset">
        <H id="tc-preset">Preset</H>
        <div className="tc-presets" role="radiogroup" aria-labelledby="tc-preset">
          {PRESETS.map((p) => {
            const pal = theme === 'dark' ? p.dark : p.light;
            const on = s.preset === p.id && !s.brand;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={on}
                className={`tc-preset ${on ? 'is-on' : ''}`}
                onClick={() => update({ preset: p.id, brand: null })}
              >
                <span className="tc-swatch" style={{ background: `linear-gradient(135deg, ${pal.brand} 0 50%, ${pal.accent} 50% 100%)` }}>
                  {on && <Check size={14} />}
                </span>
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="tc-sec">
        <Field label="Brand colour" hint="Pick your own; the dark theme gets a lighter shade automatically.">
          <div className="tc-color">
            <input
              type="color"
              value={s.brand ?? (PRESETS.find((p) => p.id === s.preset) ?? PRESETS[0]).light.brand}
              onChange={(e) => update({ brand: e.target.value })}
              aria-label="Brand colour"
            />
            <code>{s.brand ?? 'From preset'}</code>
            {s.brand && (
              <Button size="sm" variant="ghost" onClick={() => update({ brand: null })}>
                Use preset
              </Button>
            )}
          </div>
        </Field>
      </section>

      <section className="tc-sec">
        <H>Mode</H>
        <ToggleGroup<ThemeMode>
          aria-label="Colour mode"
          fullWidth
          value={s.mode}
          onChange={(mode) => update({ mode })}
          items={[
            { value: 'light', label: 'Light', icon: <Sun size={15} /> },
            { value: 'dark', label: 'Dark', icon: <Moon size={15} /> },
            { value: 'system', label: 'System', icon: <Monitor size={15} /> },
          ]}
        />
      </section>

      <section className="tc-sec">
        <H>Direction</H>
        <ToggleGroup
          aria-label="Text direction"
          fullWidth
          value={s.dir}
          onChange={(dir) => update({ dir })}
          items={[
            { value: 'ltr', label: 'Left to right' },
            { value: 'rtl', label: 'Right to left' },
          ]}
        />
      </section>

      <section className="tc-sec">
        <H>Density</H>
        <ToggleGroup
          aria-label="Density"
          fullWidth
          value={s.density}
          onChange={(density) => update({ density })}
          items={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </section>

      <section className="tc-sec">
        <H id="tc-radius">Corner radius</H>
        <Slider
          aria-label="Corner radius"
          min={0}
          max={1.6}
          step={0.1}
          value={s.radius}
          onChange={(radius) => update({ radius })}
          formatValue={(v) => `${Math.round(v * 100)}%`}
          marks={[
            { value: 0, label: 'Square' },
            { value: 1, label: 'Default' },
            { value: 1.6, label: 'Round' },
          ]}
        />
      </section>

      <section className="tc-sec">
        <H>Font</H>
        <ToggleGroup<FontPair>
          aria-label="Font pair"
          fullWidth
          value={s.font}
          onChange={(font) => update({ font })}
          items={(Object.keys(FONTS) as FontPair[]).map((f) => ({
            value: f,
            label: <span style={{ fontFamily: FONTS[f].display }}>{FONTS[f].name}</span>,
          }))}
        />
      </section>

      <section className="tc-sec">
        <H>Sidebar</H>
        <ToggleGroup<SidebarStyle>
          aria-label="Sidebar style"
          fullWidth
          value={s.sidebar}
          onChange={(sidebar) => update({ sidebar })}
          items={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'glass', label: 'Glass' },
          ]}
        />
      </section>

      <section className="tc-sec">
        <H>Content width</H>
        <ToggleGroup
          aria-label="Content width"
          fullWidth
          value={s.width}
          onChange={(width) => update({ width })}
          items={[
            { value: 'fluid', label: 'Fluid' },
            { value: 'boxed', label: 'Boxed' },
          ]}
        />
      </section>

      <section className="tc-sec">
        <Switch
          labelFirst
          label="Reduce motion"
          description="Turns animations into simple fades, whatever the system setting."
          checked={pref === 'reduce'}
          onChange={(on) => setPref(on ? 'reduce' : 'system')}
        />
      </section>
    </div>
  );
}

/** Reset and Copy CSS. */
export function ThemeActions() {
  const { settings: s, reset } = useTheme();
  const { setPref } = useMotionPreference();
  return (
    <>
      <Button
        variant="ghost"
        iconStart={<RotateCcw size={15} />}
        onClick={() => {
          reset();
          setPref('system');
        }}
      >
        Reset
      </Button>
      <span style={{ flex: 1 }} />
      <CopyButton value={exportCss(s)} label="Copy theme CSS" copiedLabel="CSS copied" variant="primary" size="md">
        Copy CSS
      </CopyButton>
    </>
  );
}
