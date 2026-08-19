import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MapPin } from 'lucide-react';
import { GeocodeResult, routingConfigured, searchPlaces } from '../lib/freeMaps';

type Props = {
  label: string;
  value: string;
  placeholder: string;
  icon?: React.ReactNode;
  onChange: (value: string) => void;
  onPlaceSelected: (selection: GeocodeResult | null) => void;
};

export default function FreePlaceInput({ label, value, placeholder, icon, onChange, onPlaceSelected }: Props) {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const requestIdRef = useRef(0);
  const wrapRef = useRef<HTMLLabelElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!routingConfigured || value.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setServiceError('');
      try {
        const results = await searchPlaces(value, controller.signal);
        if (requestId !== requestIdRef.current) return;
        setSuggestions(results);
        setOpen(results.length > 0);
      } catch (error) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setSuggestions([]);
        setServiceError(error instanceof Error ? error.message : 'Place suggestions are unavailable.');
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [value]);

  function chooseSuggestion(suggestion: GeocodeResult) {
    onChange(suggestion.label);
    onPlaceSelected(suggestion);
    setSuggestions([]);
    setOpen(false);
    setServiceError('');
  }

  return (
    <label className="google-place-field free-place-field" ref={wrapRef}>
      <span>{label}</span>
      <div className="input-shell google-place-shell">
        {icon ?? <MapPin size={18}/>} 
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            onPlaceSelected(null);
            setOpen(true);
          }}
          onFocus={() => suggestions.length && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
        />
        {loading && <LoaderCircle className="spin google-place-loader" size={16}/>} 
      </div>
      {open && suggestions.length > 0 && (
        <div className="google-place-results" role="listbox">
          {suggestions.map((suggestion, index) => (
            <button type="button" key={`${suggestion.coords.join('-')}-${index}`} onClick={() => chooseSuggestion(suggestion)} role="option">
              <span className="google-result-icon"><MapPin size={15}/></span>
              <span><strong>{suggestion.label.split(',')[0]}</strong><small>{suggestion.label.split(',').slice(1).join(',').trim()}</small></span>
            </button>
          ))}
          <div className="google-place-attribution">Search powered by OpenStreetMap data via GraphHopper</div>
        </div>
      )}
      {serviceError && <small className="google-place-error">{serviceError}</small>}
    </label>
  );
}
