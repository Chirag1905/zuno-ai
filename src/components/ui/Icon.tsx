"use client";

import * as LucideIcons from "lucide-react";
import React, { memo } from "react";

export type IconName = keyof typeof LucideIcons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    size?: number;
}

export const Icon = memo(function Icon({
    name,
    size = 20,
    className = "",
    ...props
}: IconProps) {
    const LucideIcon = LucideIcons[name] as React.ComponentType<
        React.SVGProps<SVGSVGElement>
    >;

    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    return (
        <LucideIcon
            width={size}
            height={size}
            className={className}
            {...props}
        />
    );
});

Icon.displayName = "Icon";

export default Icon;
