import { FormEvent, useEffect, useState } from 'react';
import { Check, Save } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import BlankableNumberInput from '../components/ui/BlankableNumberInput';
import { useVehicles } from '../context/VehicleContext';
import { readPreferences, SETTINGS_KEY, type LakbayPreferences } from '../lib/preferences';

export default function Settings() {
  const { vehicles, defaultVehicle, setDefaultVehicle } = useVehicles();
  const [fuelPrice, setFuelPrice] = useState(() => readPreferences().fuelPrice);
  const [vehicleId, setVehicleId] = useState(() => readPreferences().defaultVehicleId);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (vehicles.length && (!vehicleId || !vehicles.some((vehicle) => vehicle.id === vehicleId)) && defaultVehicle) setVehicleId(defaultVehicle.id);
  }, [vehicleId, defaultVehicle, vehicles]);

  function save(event: FormEvent) {
    event.preventDefault();
    const preferences: LakbayPreferences = { fuelPrice: Math.max(0.01, Number(fuelPrice) || 78), defaultVehicleId: vehicleId, distanceUnit: 'km' };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(preferences));
    if (vehicleId && vehicles.some((vehicle) => vehicle.id === vehicleId)) setDefaultVehicle(vehicleId);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return <div className="page-stack"><PageHeader eyebrow="Settings" title="Personalize Lakbay" subtitle="Set practical defaults that make every new trip plan faster."/><form className="panel settings-panel" onSubmit={save}><div className="setting-row"><div><strong>Currency</strong><span>Lakbay is currently optimized for Philippine road-trip budgeting.</span></div><select className="plain-select" disabled aria-label="Currency"><option>PHP — Philippine Peso (₱)</option></select></div><div className="setting-row"><div><strong>Default fuel price</strong><span>Used when you open a fresh Plan Trip screen. You can still override it per trip.</span></div><div className="currency-input"><span>₱</span><BlankableNumberInput aria-label="Default fuel price" min="0.01" step="0.01" value={fuelPrice} onValueChange={setFuelPrice}/></div></div><div className="setting-row"><div><strong>Default vehicle</strong><span>Also updates the default vehicle saved in My Garage.</span></div><select className="plain-select" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={!vehicles.length}><option value="">{vehicles.length ? 'Choose a vehicle' : 'Add a vehicle first'}</option>{vehicles.map((vehicle) => <option value={vehicle.id} key={vehicle.id}>{vehicle.name} • {vehicle.efficiency} km/L</option>)}</select></div><div className="setting-row"><div><strong>Distance unit</strong><span>Lakbay uses metric units for Philippine routes and fuel economy.</span></div><select className="plain-select" disabled aria-label="Distance unit"><option>Kilometers (km)</option></select></div><div className="settings-actions"><button className="primary-btn" type="submit"><Save size={16}/> Save preferences</button>{saved && <span className="settings-saved" role="status"><Check size={15}/> Preferences saved</span>}</div></form></div>;
}
