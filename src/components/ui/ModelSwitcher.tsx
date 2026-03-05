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
    <label className="flex items-center gap-2 text-[11px] text-[#eaf1ff]">
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
        className="aim-input max-w-[230px] bg-white px-2 py-0.5 text-[11px] text-black focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-2px] focus-visible:outline-[#1b4ba4] disabled:cursor-not-allowed disabled:opacity-70"
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
