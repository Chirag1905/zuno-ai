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
        height: 40,
        minHeight: 40,
        borderRadius: 12,

        /* Same background as Input */
        backgroundColor: "rgba(255,255,255,0.05)",

        /* Same border logic */
        border: `1px solid ${state.isFocused
            ? "rgb(99 102 241)" // brand-500 (CHANGE if your brand differs)
            : "rgb(64 64 64)"   // neutral-700
            }`,

        /* 🔥 EXACT Tailwind focus:ring-1 ring-brand-500/20 */
        boxShadow: state.isFocused
            ? "0 0 0 1px rgba(99,102,241,0.2)"
            : "none",

        cursor: "text",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",

        "&:hover": {
            borderColor: state.isFocused
                ? "rgb(99 102 241)"
                : "rgb(82 82 82)",
        },
    }),

    valueContainer: (base) => ({
        ...base,
        padding: "0 16px",
    }),

    placeholder: (base) => ({
        ...base,
        color: "#a3a3a3",
        fontSize: 14,
    }),

    singleValue: (base) => ({
        ...base,
        color: "#ffffff",
        fontSize: 14,
    }),

    input: (base) => ({
        ...base,
        color: "#ffffff",
        fontSize: 14,
    }),

    dropdownIndicator: (base) => ({
        ...base,
        padding: 8,
        color: "#a3a3a3",
        "&:hover": { color: "#ffffff" },
    }),

    clearIndicator: (base) => ({
        ...base,
        padding: 8,
        color: "#a3a3a3",
        "&:hover": { color: "#ffffff" },
    }),

    indicatorSeparator: () => ({
        display: "none",
    }),

    menu: (base) => ({
        ...base,
        marginTop: 8,

        backgroundColor: "rgba(30, 27, 75, 0.95)",
        borderRadius: 16,

        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
            "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",

        backdropFilter: "blur(16px)",
        overflow: "hidden",
    }),

    menuList: (base) => ({
        ...base,
        padding: 6,
        maxHeight: 220,

        scrollbarWidth: "thin",
        scrollbarColor: "rgba(255,255,255,0.25) transparent",
    }),

    option: (base, state) => ({
        ...base,
        borderRadius: 12,
        padding: "10px 14px",
        fontSize: 14,
        color: "#fff",

        backgroundColor: state.isSelected
            ? "rgba(99,102,241,0.25)"
            : state.isFocused
                ? "rgba(255,255,255,0.10)"
                : "transparent",

        cursor: "pointer",
        transition: "all 0.15s ease",
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