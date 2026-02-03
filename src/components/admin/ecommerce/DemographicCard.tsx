"use client";
import CountryMap from "@/components/admin/ecommerce/CountryMap";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { EllipsisVertical } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type DemographicCardProps = {
  country: string;
  customers: number;
  percentage: number;
};

export default function DemographicCard({ data }: { data: DemographicCardProps[] }) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Customers Demographic
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Number of customer based on country
          </p>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <EllipsisVertical className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              View More
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      <div className="px-4 py-6 my-6 overflow-hidden border border-gary-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div
          id="mapOne"
          className="mapOne map-btn -mx-4 -my-6 h-53 w-63 sm:w-76.75 xsm:w-89.5 sm:-mx-6 md:w-167 lg:w-158.5 xl:w-98.25 2xl:w-138.5"
        >
          <CountryMap
            activeCountries={data.map((item) => item.country)}
          />
        </div>
      </div>

      <div className="space-y-5">
        {data.slice(0, 5).map((item) => (
          <div
            key={item.country}
            className="grid grid-cols-[1fr_80px_40px] items-center gap-4"
          >
            {/* LEFT: Country */}
            <div className="flex items-center gap-3">
              <div className="w-8">
                <Image
                  width={32}
                  height={32}
                  src={`/images/country/${item.country.toLowerCase()}.svg`}
                  alt={item.country}
                  className="w-full rounded-full"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">
                  {item.country}
                </p>
                <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                  {item.customers} Customers
                </span>
              </div>
            </div>

            {/* MIDDLE: Progress bar */}
            <div className="relative h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            {/* RIGHT: Percentage */}
            <p className="text-right font-medium text-gray-800 text-theme-sm dark:text-white/90">
              {item.percentage}%
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
