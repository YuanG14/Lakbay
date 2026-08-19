import { FormEvent, useMemo, useState } from 'react';
import { CarFront, Check, Fuel, Gauge, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { useVehicles } from '../context/VehicleContext';
import type { FuelType, Vehicle, VehicleInput } from '../types/vehicle';

const emptyForm: VehicleInput = {
  name: '',
  year: new Date().getFullYear(),
  fuelType: 'Gasoline',
  efficiency: 14,
  tankCapacity: 40,
};

export default function Garage() {
  const { vehicles, loading, syncError, clearSyncError, addVehicle, updateVehicle, deleteVehicle, setDefaultVehicle } = useVehicles();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleInput>(emptyForm);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const totalVehicles = vehicles.length;
  const averageEfficiency = useMemo(
    () => totalVehicles ? vehicles.reduce((sum, vehicle) => sum + vehicle.efficiency, 0) / totalVehicles : 0,
    [vehicles, totalVehicles],
  );

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  }

  function openEdit(vehicle: Vehicle) {
    setEditing(vehicle);
    setForm({
      name: vehicle.name,
      year: vehicle.year,
      fuelType: vehicle.fuelType,
      efficiency: vehicle.efficiency,
      tankCapacity: vehicle.tankCapacity,
    });
    setError('');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setError('');
  }

  function saveVehicle(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim()) return setError('Please enter a vehicle name.');
    if (form.year < 1980 || form.year > new Date().getFullYear() + 1) return setError('Please enter a valid vehicle year.');
    if (form.efficiency <= 0) return setError('Fuel efficiency must be greater than zero.');
    if (form.tankCapacity !== undefined && form.tankCapacity <= 0) return setError('Tank capacity must be greater than zero.');

    const cleanForm = { ...form, name: form.name.trim() };
    if (editing) {
      updateVehicle(editing.id, cleanForm);
      setNotice(`${cleanForm.name} was updated.`);
    } else {
      addVehicle(cleanForm);
      setNotice(`${cleanForm.name} was added to your garage.`);
    }
    closeModal();
  }

  function makeDefault(vehicle: Vehicle) {
    setDefaultVehicle(vehicle.id);
    setNotice(`${vehicle.name} is now your default vehicle.`);
  }

  function removeVehicle(vehicle: Vehicle) {
    const confirmed = window.confirm(`Remove ${vehicle.name} from your garage?`);
    if (!confirmed) return;
    deleteVehicle(vehicle.id);
    setNotice(`${vehicle.name} was removed.`);
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="My Garage"
        title="Your vehicles, ready for every trip"
        subtitle="Save fuel-efficiency profiles once, then let Lakbay reuse them automatically in your trip estimates."
        action={<button className="primary-btn" onClick={openAdd}><Plus size={17} /> Add vehicle</button>}
      />

      {syncError && <div className="sync-alert" role="alert"><span>{syncError}</span><button type="button" onClick={clearSyncError}>Dismiss</button></div>}

      {notice && (
        <div className="garage-notice">
          <Check size={16} /> <span>{notice}</span>
          <button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15} /></button>
        </div>
      )}

      <section className="garage-summary-grid">
        <div className="garage-summary-card"><CarFront /><span>Saved vehicles</span><strong>{totalVehicles}</strong></div>
        <div className="garage-summary-card"><Gauge /><span>Average efficiency</span><strong>{averageEfficiency.toFixed(1)} km/L</strong></div>
        <div className="garage-summary-card"><Star /><span>Default vehicle</span><strong>{vehicles.find((v) => v.isDefault)?.name ?? 'None yet'}</strong></div>
      </section>

      {loading ? (
        <section className="vehicle-grid garage-grid" aria-label="Loading vehicles">{[1,2,3].map((item) => <div className="vehicle-card skeleton-card" key={item}><span className="skeleton-line wide"/><span className="skeleton-line"/><span className="skeleton-block"/></div>)}</section>
      ) : vehicles.length ? (
        <section className="vehicle-grid garage-grid">
          {vehicles.map((vehicle) => (
            <article className={`vehicle-card ${vehicle.isDefault ? 'featured' : ''}`} key={vehicle.id}>
              <div className="vehicle-top">
                <div className="vehicle-icon"><CarFront /></div>
                {vehicle.isDefault && <span className="pill"><Star size={11} fill="currentColor" /> Default</span>}
              </div>
              <h2>{vehicle.name}</h2>
              <p>{vehicle.year} • {vehicle.fuelType}</p>
              <div className="vehicle-stats">
                <div><Fuel size={17} /><span>Fuel type</span><strong>{vehicle.fuelType}</strong></div>
                <div><Gauge size={17} /><span>Efficiency</span><strong>{vehicle.efficiency.toFixed(1)} km/L</strong></div>
                <div><span className="stat-symbol">L</span><span>Tank capacity</span><strong>{vehicle.tankCapacity ? `${vehicle.tankCapacity} L` : 'Not set'}</strong></div>
                <div><span className="stat-symbol">Y</span><span>Model year</span><strong>{vehicle.year}</strong></div>
              </div>
              <div className="vehicle-actions">
                <button className="secondary-btn" onClick={() => openEdit(vehicle)}><Pencil size={15} /> Edit</button>
                {!vehicle.isDefault && <button className="ghost-btn" onClick={() => makeDefault(vehicle)}><Star size={15} /> Set default</button>}
                <button className="danger-icon-btn" aria-label={`Delete ${vehicle.name}`} onClick={() => removeVehicle(vehicle)}><Trash2 size={16} /></button>
              </div>
            </article>
          ))}

          <button className="vehicle-card add-card garage-add-card" onClick={openAdd}>
            <div className="add-circle"><Plus /></div>
            <h3>Add another vehicle</h3>
            <p>Save another car to compare and plan future trip costs faster.</p>
          </button>
        </section>
      ) : (
        <section className="panel garage-empty">
          <div className="add-circle"><CarFront /></div>
          <h2>Your garage is empty</h2>
          <p>Add your first vehicle so Lakbay can automatically use its fuel efficiency when planning a trip.</p>
          <button className="primary-btn" onClick={openAdd}><Plus size={17} /> Add your first vehicle</button>
        </section>
      )}

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="vehicle-modal" role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title">
            <div className="modal-header">
              <div>
                <span className="section-kicker">{editing ? 'Edit vehicle' : 'New vehicle'}</span>
                <h2 id="vehicle-modal-title">{editing ? 'Update vehicle profile' : 'Add to My Garage'}</h2>
                <p>Lakbay uses these details when estimating fuel costs.</p>
              </div>
              <button className="icon-btn" aria-label="Close" onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={saveVehicle} className="vehicle-form">
              <label className="full-field"><span>Vehicle name</span><input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Toyota Vios XLE" /></label>
              <div className="vehicle-form-grid">
                <label><span>Model year</span><input type="number" min="1980" max={new Date().getFullYear() + 1} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></label>
                <label><span>Fuel type</span><select value={form.fuelType} onChange={(e) => setForm({ ...form, fuelType: e.target.value as FuelType })}><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label>
                <label><span>Fuel efficiency</span><div className="vehicle-number-field"><input type="number" min="0.1" step="0.1" value={form.efficiency} onChange={(e) => setForm({ ...form, efficiency: Number(e.target.value) })} /><span>km/L</span></div></label>
                <label><span>Tank capacity</span><div className="vehicle-number-field"><input type="number" min="1" step="1" value={form.tankCapacity ?? ''} onChange={(e) => setForm({ ...form, tankCapacity: e.target.value ? Number(e.target.value) : undefined })} /><span>L</span></div></label>
              </div>
              {error && <div className="form-error">{error}</div>}
              <div className="modal-actions"><button type="button" className="ghost-btn" onClick={closeModal}>Cancel</button><button className="primary-btn" type="submit"><Check size={16} /> {editing ? 'Save changes' : 'Add vehicle'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
