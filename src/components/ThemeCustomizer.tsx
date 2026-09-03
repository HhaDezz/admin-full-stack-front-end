import { Drawer } from './kit';
import { ThemeActions, ThemeSettingsPanel } from './ThemeSettings';

/** Live theme settings, opened from the top bar. Every change applies at once and is remembered in this browser. */
export default function ThemeCustomizer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Customize theme"
      subtitle="Changes apply instantly and are saved in this browser."
      size="sm"
      footer={<ThemeActions />}
    >
      <ThemeSettingsPanel />
    </Drawer>
  );
}
