import { InputHTMLAttributes, useEffect, useRef, useState } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> & {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
  onEmpty?: () => void;
};

function toDraft(value: number | null | undefined) {
  return value === null || value === undefined ? '' : String(value);
}

/**
 * A controlled numeric input that still allows the user to temporarily clear
 * the field while replacing its value. Parent state remains numeric.
 */
export default function BlankableNumberInput({ value, onValueChange, onEmpty, onBlur, ...props }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(() => toDraft(value));

  useEffect(() => {
    // Do not overwrite what the user is currently typing. External updates
    // (route lookup, vehicle selection, reused trip, etc.) sync once unfocused.
    if (document.activeElement !== inputRef.current) setDraft(toDraft(value));
  }, [value]);

  return (
    <input
      {...props}
      ref={inputRef}
      type="number"
      value={draft}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);
        if (raw === '') {
          onEmpty?.();
          return;
        }
        const next = Number(raw);
        if (Number.isFinite(next)) onValueChange(next);
      }}
      onBlur={(event) => {
        // Let the field stay blank while the user is replacing its value, but
        // normalize an intentionally cleared field to 0 when editing ends.
        if (draft.trim() === '') {
          onValueChange(0);
          setDraft('0');
        } else {
          const normalized = Number(draft);
          if (Number.isFinite(normalized)) {
            onValueChange(normalized);
            setDraft(String(normalized));
          } else {
            setDraft(toDraft(value));
          }
        }
        onBlur?.(event);
      }}
    />
  );
}
