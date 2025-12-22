"use client";

import { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Select, { StylesConfig, components } from "react-select";
import { useChainsStore } from "@/lib/stores/chains-store";
import { chainsApi } from "@/lib/api/chains";
import { cn } from "@/lib/utils";
import type { Chain } from "@/types/chains";

// Component to render the Canopy icon SVG with dynamic color
const CanopyIcon = ({
  color,
  size = 16,
  className,
  style
}: {
  color: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 441.8 441.79"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <g fill={color}>
        <path d="M101.33 40.32l-31.11 281.14c-1.28 11.53-6.44 22.28-14.64 30.49l-6.9 6.9C-21.26 271.82-15.83 144.26 64.9 63.53c9.85-9.82 20.4-18.54 31.46-26.14 2.25-1.54 5.27.22 4.97 2.93z" />
        <path d="M120.86 371.57l280.67-31.14c2.71-.3 4.47 2.72 2.93 4.97-7.6 11.09-16.33 21.64-26.19 31.5-80.65 80.65-208.02 86.12-295.01 16.44l7.13-7.13c8.2-8.2 18.95-13.36 30.47-14.64z" />
        <path d="M162.48 245.05l-45.66 45.66L147.66 13.25c.14-1.23.97-2.28 2.14-2.68C165.16 5.31 181 1.78 196.99.02c2.01-.22 3.7 1.51 3.48 3.51l-23.35 211.03c-1.28 11.53-6.44 22.28-14.64 30.49z" />
        <path d="M269.41 138.16l-45.66 45.66L243.84 2.97c.19-1.74 1.77-3.01 3.51-2.81 15.24 1.76 30.31 5.1 44.97 10.02 1.42.48 2.31 1.9 2.15 3.39l-10.41 94.11c-1.28 11.53-6.44 22.28-14.64 30.48z" />
        <path d="M406.49 106.54l-63.91 7.08c-8.3.92-15.32-6.1-14.39-14.4l7.11-63.9c.26-2.32 2.87-3.61 4.83-2.35 13.53 8.59 26.33 18.76 38.14 30.57 11.81 11.81 22.01 24.64 30.58 38.18 1.25 1.97-.04 4.57-2.36 4.83z" />
        <path d="M438.83 197.96l-180.24 20.01 45.59-45.59c8.2-8.2 18.95-13.36 30.48-14.64l93.58-10.37c1.49-.17 2.91.73 3.39 2.15 4.92 14.66 8.26 29.7 10.02 44.94.2 1.74-1.07 3.31-2.81 3.51z" />
        <path d="M441.78 244.81c-1.76 15.99-5.29 31.83-10.55 47.18-.4 1.17-1.45 2-2.68 2.14l-276.85 30.73 45.59-45.56c8.2-8.19 18.94-13.35 30.46-14.63l210.52-23.35c2.01-.22 3.73 1.47 3.51 3.48z" />
      </g>
    </svg>
  );
};

interface ChainOption {
  value: string;
  label: string;
  chain_id: number;
  brand_color?: string;
}

interface ChainSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ChainSelect({ value, onValueChange, className }: ChainSelectProps) {
  const storeChains = useChainsStore((state) => state.chains);
  const fetchChains = useChainsStore((state) => state.fetchChains);

  // Fetch chains from API if store is empty
  const { data: apiChainsResponse } = useQuery({
    queryKey: ["chains", "for-select"],
    queryFn: async () => {
      const response = await chainsApi.getChains({
        status: "graduated",
        limit: 100,
      });
      return Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
    },
    enabled: storeChains.length === 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use API chains if store is empty, otherwise use store chains
  const chains = useMemo(() => {
    if (storeChains.length > 0) {
      return storeChains;
    }
    return (apiChainsResponse || []) as Chain[];
  }, [storeChains, apiChainsResponse]);

  // Load chains into store if we got them from API
  useEffect(() => {
    if (apiChainsResponse && storeChains.length === 0) {
      fetchChains({ status: "graduated", limit: 100 });
    }
  }, [apiChainsResponse, storeChains.length, fetchChains]);

  // Prepare chain options - add "All Chains" as default option
  const chainOptions = useMemo<ChainOption[]>(() => {
    const options: ChainOption[] = [
      { value: "0", label: "All Chains", chain_id: 0, brand_color: "#00a63d" }, // Default green for "All Chains"
      ...chains.map((chain) => {
        // Convert chain.id to number if it's a string
        const chainId = typeof chain.id === "string" ? parseInt(chain.id, 10) || 0 : Number(chain.id);
        return {
          value: chain.id.toString(),
          label: chain.chain_name,
          chain_id: chainId,
          brand_color: chain.brand_color || "#00a63d", // Default to green if no brand_color
        };
      }),
    ];

    return options;
  }, [chains]);

  const selectedOption = useMemo(() => {
    // Normalize both values to strings for comparison
    const normalizedValue = String(value);
    const found = chainOptions.find((option) => String(option.value) === normalizedValue);

    if (!found && chainOptions.length > 0) {
      return chainOptions[0];
    }

    return found || chainOptions[0];
  }, [chainOptions, value]);

  const selectedBrandColor = selectedOption?.brand_color || "#00a63d";

  // Ensure we use the exact same object reference from chainOptions for react-select
  // react-select compares by reference, not by value
  const exactSelectedOption = useMemo(() => {
    if (!selectedOption || chainOptions.length === 0) return null;
    // Find the exact object from chainOptions to ensure reference equality
    return chainOptions.find((opt) => opt.value === selectedOption.value) || selectedOption;
  }, [chainOptions, selectedOption]);

  // Helper function to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number): string => {
    // Handle 3-digit hex colors
    if (hex.length === 4) {
      const r = parseInt(hex[1] + hex[1], 16);
      const g = parseInt(hex[2] + hex[2], 16);
      const b = parseInt(hex[3] + hex[3], 16);
      return `rgba(${r},${g},${b},${alpha})`;
    }
    // Handle 6-digit hex colors
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Custom styles for react-select to match the design
  const customStyles: StylesConfig<ChainOption, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "38px",
      height: "38px",
      backgroundColor: "transparent",
      borderColor: selectedBrandColor,
      borderRadius: "12px",
      boxShadow: state.isFocused
        ? `0 0 18px ${hexToRgba(selectedBrandColor, 0.55)}`
        : `0 0 14px ${hexToRgba(selectedBrandColor, 0.4)}`,
      "&:hover": {
        borderColor: selectedBrandColor,
        boxShadow: `0 0 18px ${hexToRgba(selectedBrandColor, 0.55)}`,
        backgroundColor: "rgba(0,0,0,0.8)",
      },
      cursor: "pointer",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "32px",
      padding: "0 8px",
      gap: "8px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
      padding: "0px",
      color: selectedBrandColor,
      fontSize: "14px",

    }),
    indicatorSeparator: () => ({
      display: "none",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "32px",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: selectedBrandColor,
      padding: "0 8px",
      "&:hover": {
        color: selectedBrandColor,
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#1a1a1a",
      border: "1px solid #2a2a2a",
      borderRadius: "6px",
      marginTop: "4px",
      zIndex: 9999,
      minWidth: "200px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "4px",
      maxHeight: "300px",
    }),
    option: (provided, state) => {
      const optionBrandColor = state.data?.brand_color || "#00a63d";
      return {
        ...provided,
        backgroundColor: state.isSelected
          ? hexToRgba(optionBrandColor, 0.2)
          : state.isFocused
            ? "rgba(255,255,255,0.1)"
            : "transparent",
        color: "#ffffff",
        cursor: "pointer",
        padding: "8px 12px",
        "&:active": {
          backgroundColor: hexToRgba(optionBrandColor, 0.3),
        },
      };
    },
    singleValue: (provided) => ({
      ...provided,
      color: selectedBrandColor,
      fontSize: "14px",
      fontWeight: 500,
      margin: "0px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: selectedBrandColor,
      fontSize: "14px",
    }),
  };

  // Custom components
  const CustomControl = ({ children, ...props }: any) => {
    return (
      <components.Control {...props}>
        <div className="flex items-center gap-2 w-full">
          {/* Leaf Icon with brand color */}
          <div className="shrink-0 w-4 h-4 flex items-center justify-center ml-2">
            <CanopyIcon
              color={selectedBrandColor}
              size={16}
              style={{
                filter: `drop-shadow(0 0 4px ${hexToRgba(selectedBrandColor, 0.8)})`,
              }}
            />
          </div>
          {children}
        </div>
      </components.Control>
    );
  };

  // Custom IndicatorsContainer to add separator before dropdown indicator
  const CustomIndicatorsContainer = ({ children, ...props }: any) => {
    return (
      <div className="flex items-center">
        {/* Vertical Separator with brand color - before the dropdown indicator */}
        <div
          className="h-4 w-px shrink-0"
          style={{ backgroundColor: selectedBrandColor }}
        />
        <components.IndicatorsContainer {...props}>
          {children}
        </components.IndicatorsContainer>
      </div>
    );
  };

  const CustomOption = ({ children, data, ...props }: any) => {
    const brandColor = data?.brand_color || "#00a63d";

    return (
      <components.Option {...props} data={data}>
        <div className="flex items-center gap-2">
          <CanopyIcon
            color={brandColor}
            size={16}
            style={{
              filter: `drop-shadow(0 0 4px ${hexToRgba(brandColor, 0.8)})`,
            }}
          />
          <span>{children}</span>
        </div>
      </components.Option>
    );
  };

  // Don't render if no options available
  if (chainOptions.length === 0) {
    return (
      <div className={cn("h-8 px-3 py-2 bg-black border border-[#00a63d] rounded-md text-[#00a63d] flex items-center gap-2", className)}>
        <div className="shrink-0 w-4 h-4 flex items-center justify-center">
          <CanopyIcon
            color="#00a63d"
            size={16}
            style={{ filter: "drop-shadow(0 0 4px rgba(0,166,61,0.8))" }}
          />
        </div>
        <span className="text-sm font-medium">Loading chains...</span>
      </div>
    );
  }

  return (
    <div className={cn("w-full min-w-[200px]", className)}>
      <Select<ChainOption, false>
        value={exactSelectedOption}
        onChange={(option) => {
          if (option) {
            onValueChange(option.value);
          }
        }}
        options={chainOptions}
        styles={customStyles}
        components={{
          Control: CustomControl,
          Option: CustomOption,
          IndicatorsContainer: CustomIndicatorsContainer,
        }}
        isSearchable
        isClearable={false}
        placeholder="All Chains"
        filterOption={(option, searchText) => {
          if (!searchText) return true;
          const label = option.label.toLowerCase();
          const search = searchText.toLowerCase();
          return label.includes(search);
        }}
        classNamePrefix="chain-select"
        menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
        menuPosition="fixed"
        noOptionsMessage={({ inputValue }) =>
          inputValue ? `No chains found matching "${inputValue}"` : "No chains available"
        }
      />
    </div>
  );
}
