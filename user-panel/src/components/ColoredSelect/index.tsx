import { Select } from "antd";
import type { SelectOption } from "../../constants/taskOptions";

type ColoredSelectProps = {
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
};

// Seçenekleri renkli metin olarak gösteren ortak Select bileşeni
// (talep oluşturma sayfası ve modalı tarafından paylaşılır)
export function ColoredSelect({
  options,
  placeholder = "Seçiniz",
  value,
  onChange,
}: ColoredSelectProps) {
  const findOption = (selectedValue: string) =>
    options.find((option) => option.value === selectedValue);

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      options={options.map(({ value: optionValue, label, color }) => ({
        value: optionValue,
        label,
        color,
      }))}
      optionRender={({ data }) => (
        <span style={{ color: data.color as string }}>{data.label as string}</span>
      )}
      labelRender={({ value: selectedValue }) => {
        const option = findOption(selectedValue as string);
        return option ? (
          <span style={{ color: option.color }}>{option.label}</span>
        ) : (
          selectedValue
        );
      }}
    />
  );
}

export default ColoredSelect;
