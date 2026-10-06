/**
 * Billing details: company, tax number, address and country, in a two-column grid.
 * Uses: Form, FormField, Input, SearchSelect, Grid, FormActions.
 */
import { z } from 'zod';
import { Button, Form, FormActions, FormField, FormSection, Grid, Input, SearchSelect, useToast, useZodForm } from '@/components/kit';

const COUNTRIES = [
  'Australia',
  'Canada',
  'France',
  'Germany',
  'India',
  'Japan',
  'Portugal',
  'Sri Lanka',
  'United Kingdom',
  'United States',
].map((c) => ({ value: c, label: c }));

const schema = z.object({
  company: z.string().trim().min(2, 'Enter the company name'),
  taxId: z.string().max(20, 'Too long for a tax number'),
  line1: z.string().trim().min(3, 'Enter the street address'),
  city: z.string().trim().min(2, 'Enter the city'),
  postcode: z.string().trim().min(3, 'Enter the postcode'),
  country: z.string().min(1, 'Choose a country'),
});

export default function BillingDetails() {
  const toast = useToast();
  const form = useZodForm(schema, { defaultValues: { company: 'Anjana Ltd', taxId: '', line1: '', city: '', postcode: '', country: '' } });
  return (
    <Form form={form} aria-label="Billing details" onSubmit={async () => toast.ok('Billing details saved')}>
      <div className="card blk-form">
        <FormSection headingLevel={2} title="Billing details" description="Printed on every invoice." layout="stacked">
          <Grid columns={{ base: 1, sm: 2 }} gap={4}>
            <FormField name="company" label="Company" required>
              <Input autoComplete="organization" />
            </FormField>
            <FormField name="taxId" label="VAT or tax number">
              <Input />
            </FormField>
            <FormField name="line1" label="Street address" required className="blk-span-2">
              <Input autoComplete="address-line1" />
            </FormField>
            <FormField name="city" label="City" required>
              <Input autoComplete="address-level2" />
            </FormField>
            <FormField name="postcode" label="Postcode" required>
              <Input autoComplete="postal-code" />
            </FormField>
            <FormField
              name="country"
              label="Country"
              required
              render={(f) => (
                <SearchSelect
                  options={COUNTRIES}
                  value={f.value || null}
                  onChange={(v) => f.onChange(v ?? '')}
                  error={f.invalid}
                  placeholder="Choose a country"
                />
              )}
            />
          </Grid>
        </FormSection>
        <FormActions>
          <Button type="submit" variant="primary" loading={form.formState.isSubmitting}>
            Save
          </Button>
        </FormActions>
      </div>
    </Form>
  );
}
