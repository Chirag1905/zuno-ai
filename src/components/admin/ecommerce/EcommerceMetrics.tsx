"use client";

import Badge from "@/components/ui/Badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIcon,
  Users,
} from "lucide-react";

type Growth = number | null;

type EcommerceMetricsProps = {
  data: {
    customers: {
      total: number;
      growth: Growth;
    };
    subscriptions: {
      total: number;
      growth: Growth;
    };
  };
};


export const EcommerceMetrics = ({ data }: EcommerceMetricsProps) => {
  const renderBadge = (growth: Growth) => {
    if (growth === null) {
      return (
        <Badge color="success">
          New
        </Badge>
      );
    }

    if (growth >= 0) {
      return (
        <Badge color="success">
          <ArrowUpIcon />
          {growth}%
        </Badge>
      );
    }

    return (
      <Badge color="error">
        <ArrowDownIcon />
        {Math.abs(growth)}%
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Customers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <Users className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Customers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.customers.total.toLocaleString()}
            </h4>
          </div>

          {renderBadge(data.customers.growth)}
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/3 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <BoxIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {data.subscriptions.total.toLocaleString()}
            </h4>
          </div>

          {renderBadge(data.subscriptions.growth)}
        </div>
      </div>
    </div>
  );
};