"use client";

import Select, { GroupBase, StylesConfig } from "react-select";

import { components, DropdownIndicatorProps } from "react-select";
import { ChevronDown } from "lucide-react";

const DropdownIndicator = (props: DropdownIndicatorProps<CountryOption, false, GroupBase<CountryOption>>) => {
    const { menuIsOpen } = props.selectProps;

    return (
        <components.DropdownIndicator {...props}>
            <ChevronDown
                size={18}
                style={{
                    transition: "transform 0.25s ease",
                    transform: menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
                    color: "rgba(255,255,255,0.6)",
                }}
            />
        </components.DropdownIndicator>
    );
};

type CountryOption = {
    value: string;
    label: string;
};

type CountrySelectProps = {
    value?: string;
    onChange?: (value?: string) => void;
    disabled?: boolean;
};

const countryOptions: CountryOption[] = [
    { value: "India", label: "India" },
    { value: "US", label: "United States" },
    { value: "UK", label: "United Kingdom" },
    { value: "Canada", label: "Canada" },
    { value: "Australia", label: "Australia" },
    { value: "Germany", label: "Germany" },
    { value: "France", label: "France" },
    { value: "Singapore", label: "Singapore" }
];

/* ===============================
   STYLES (GLASS INPUT MATCH)
================================ */

const customStyles: StylesConfig<CountryOption, false> = {
    control: (base, state) => ({
        ...base,
        height: 45,
        minHeight: 45,
        background: state.isFocused
            ? "rgba(38, 31, 66, 0.85)"
            : "rgba(38, 31, 66, 0.6)",
        borderRadius: 14,
        border: `1px solid ${state.isFocused
            ? "rgba(255,255,255,0.55)"
            : "rgba(255,255,255,0.15)"
            }`,
        boxShadow: "none",
        cursor: "text",
        transition: "all 0.25s ease",
        "&:hover": {
            borderColor: "rgba(255,255,255,0.35)",
            background: "rgba(38, 31, 66, 0.75)",
        },
    }),

    dropdownIndicator: (base) => ({
        ...base,
        padding: 4,
    }),

    valueContainer: (base) => ({
        ...base,
        padding: "0 12px",
    }),

    placeholder: (base) => ({
        ...base,
        color: "rgba(255,255,255,0.45)",
        fontSize: 16,
    }),

    singleValue: (base) => ({
        ...base,
        color: "#ffffff",
        fontSize: 16,
    }),

    input: (base) => ({
        ...base,
        color: "#ffffff",
        fontSize: 16,
    }),

    indicatorsContainer: (base) => ({
        ...base,
        paddingRight: 12,
    }),

    clearIndicator: (base) => ({
        ...base,
        padding: 4,
        color: "rgba(255,255,255,0.6)",
    }),

    menu: (base) => ({
        ...base,
        marginTop: 8,
        background: "rgba(38, 31, 66, 0.95)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
        overflow: "hidden",
        backdropFilter: "blur(12px)",
    }),

    menuList: (base) => ({
        ...base,
        padding: 8,
    }),

    option: (base, state) => ({
        ...base,
        borderRadius: 16,
        padding: "12px 16px",
        fontSize: 15,
        color: "#fff",
        backgroundColor: state.isSelected
            ? "rgba(255,255,255,0.14)"
            : state.isFocused
                ? "rgba(255,255,255,0.08)"
                : "transparent",
        cursor: "pointer",
    }),
};

/* ===============================
   COMPONENT
================================ */

export default function CountrySelect({
    value,
    onChange,
    disabled,
}: CountrySelectProps) {
    const selectedOption = countryOptions.find(
        (opt) => opt.value === value
    );

    return (
        <Select
            instanceId="country-select"
            options={countryOptions}
            value={selectedOption || null}
            onChange={(opt) => onChange?.(opt?.value)}
            placeholder="Select country"
            isClearable
            isSearchable
            isDisabled={disabled}
            styles={customStyles}
            components={{
                DropdownIndicator,
                IndicatorSeparator: () => null,
            }}
        />
    );
}