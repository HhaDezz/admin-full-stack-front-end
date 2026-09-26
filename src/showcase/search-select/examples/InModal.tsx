import { useState } from 'react';
import { SearchSelect } from '../../../components/search-select';
import { Modal } from '../../../components/ui';
import { countries } from './data';

// The menu renders in a portal, so it is never clipped by the modal and flips above when needed.
export default function InModal() {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        Open a modal
      </button>
      {open && (
        <Modal
          title="Shipping address"
          subtitle="The dropdown works inside dialogs."
          onClose={() => setOpen(false)}
          footer={
            <button className="btn btn-primary" onClick={() => setOpen(false)}>
              Done
            </button>
          }
        >
          <div className="field">
            <span className="label" id="ship-country">
              Country
            </span>
            <SearchSelect aria-labelledby="ship-country" options={countries} value={country} onChange={setCountry} fullWidth clearable />
          </div>
        </Modal>
      )}
    </>
  );
}
