import { PageHeader } from '../../components/kit';
import PricingTiers from '../../blocks/marketing/PricingTiers';
import PlanComparison from '../../blocks/marketing/PlanComparison';
import FaqSection from '../../blocks/marketing/FaqSection';

/* Pricing: plans, a full comparison and common questions, all from blocks. */
export default function Pricing() {
  return (
    <div className="content-page">
      <header className="content-hero">
        <PageHeader
          title="Simple pricing for every team"
          description="Start free. Upgrade when you need more people, more history or single sign-on."
        />
      </header>
      <PricingTiers />
      <section aria-labelledby="compare-title" className="content-section">
        <h2 id="compare-title" className="content-h2">
          Compare plans
        </h2>
        <PlanComparison />
      </section>
      <section className="content-section">
        <FaqSection />
      </section>
    </div>
  );
}
