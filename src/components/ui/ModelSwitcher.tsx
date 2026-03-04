interface ModelOption {
  provider: string;
  model: string;
  label: string;
}

interface ModelSwitcherProps {
  value: string;
  options: ModelOption[];
  disabled?: boolean;
  onChange: (option: ModelOption) => void;
}

export function ModelSwitcher({
  value,
  options,
  disabled = false,
  onChange,
}: ModelSwitcherProps) {
  return (
    <label className="flex items-center gap-2 text-xs text-zinc-600">
      <span>Model</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => {
          const selected = options.find(
            (option) => option.model === event.target.value,
          );
          if (selected) {
            onChange(selected);
          }
        }}
        className="max-w-[240px] rounded border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-100"
      >
        {options.map((option) => (
          <option key={option.model} value={option.model}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
