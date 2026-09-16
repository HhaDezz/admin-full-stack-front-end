import { Card } from '../../components/kit';
import { ThemeActions, ThemeSettingsPanel } from '../../components/ThemeSettings';

/** The same controls as the customizer drawer, laid out on the page. */
export default function AppearanceTab() {
  return (
    <Card
      headingLevel={2}
      padding="lg"
      title="Appearance"
      description="Changes apply instantly and are saved in this browser."
      footer={<ThemeActions />}
    >
      <div className="appearance">
        <ThemeSettingsPanel headingLevel={3} />
      </div>
    </Card>
  );
}
