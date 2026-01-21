"use client";

import * as LucideIcons from "lucide-react";
import { memo, forwardRef } from "react";

export type IconName = keyof typeof LucideIcons;

// ==================== ICON COMPONENT ====================
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

    return <LucideIcon width={size} height={size} className={className} {...props} />;
});

Icon.displayName = "Icon";

// ==================== SINGLE ICON BUTTON COMPONENT ====================
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: IconName;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | number;
    variant?: "default" | "ghost" | "outline" | "minimal" | "optional";
    iconClassName?: string;
    withText?: boolean;
    text?: string;
    textPosition?: "left" | "right";
    textClassName?: string;
    compact?: boolean;
    rounded?: "full" | "xl" | "lg" | "md" | "sm" | "none";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
    function IconButton(
        {
            icon,
            size = "md",
            variant = "default",
            iconClassName = "",
            withText = false,
            text = "",
            textPosition = "right",
            textClassName = "",
            compact = false,
            rounded = "full",
            className = "",
            ...props
        },
        ref
    ) {
        // Size mapping
        const getSize = () => {
            if (typeof size === "number") {
                return {
                    button: compact ? "p-1" : "p-2",
                    iconSize: size,
                    textSize: "text-base"
                };
            }

            const sizeMap = {
                xs: { button: compact ? "p-0.5" : "p-1", iconSize: 12, textSize: "text-xs" },
                sm: { button: compact ? "p-1" : "p-1.5", iconSize: 14, textSize: "text-sm" },
                md: { button: compact ? "p-1.5" : "p-2", iconSize: 16, textSize: "text-base" },
                lg: { button: compact ? "p-2" : "p-2.5", iconSize: 18, textSize: "text-lg" },
                xl: { button: compact ? "p-2.5" : "p-3", iconSize: 20, textSize: "text-xl" },
            };

            return sizeMap[size];
        };

        // Variant styles
        const getVariantStyle = () => {
            const baseStyles = "transition-colors";

            const variantMap = {
                default: "bg-gray-800/60 hover:bg-gray-700 text-gray-200",
                ghost: "hover:bg-gray-800/40 text-gray-300",
                outline: "border border-gray-700 hover:bg-gray-800/40 text-gray-300",
                minimal: "outline-none hover:bg-gray-700 text-gray-200",
                optional: "outline-none text-gray-200",
            };

            return `${baseStyles} ${variantMap[variant]}`;
        };

        // Rounded styles
        const getRoundedStyle = () => {
            const roundedMap = {
                none: "rounded-none",
                sm: "rounded-sm",
                md: "rounded-md",
                lg: "rounded-lg",
                xl: "rounded-xl",
                full: "rounded-full",
            };
            return roundedMap[rounded];
        };

        const sizeConfig = getSize();
        const variantStyle = getVariantStyle();
        const roundedStyle = getRoundedStyle();

        const iconElement = icon ? (
            <Icon name={icon} size={sizeConfig.iconSize} className={iconClassName} />
        ) : null;

        // Render button with text
        if (withText || text) {
            return (
                <button
                    ref={ref}
                    className={`flex items-center gap-2 ${sizeConfig.button} ${variantStyle} ${roundedStyle} ${className}`}
                    {...props}
                >
                    {textPosition === "left" && text && (
                        <span className={`${sizeConfig.textSize} ${textClassName}`}>{text}</span>
                    )}

                    {textPosition === "left" && iconElement}

                    {textPosition === "right" && iconElement}

                    {text && textPosition === "right" && (
                        <span className={`${sizeConfig.textSize} ${textClassName}`}>{text}</span>
                    )}
                </button>
            );
        }

        // Render icon-only button
        return (
            <button
                ref={ref}
                className={`${sizeConfig.button} ${variantStyle} ${roundedStyle} ${className}`}
                {...props}
            >
                {iconElement ?? props.children}
            </button>
        );
    }
);

IconButton.displayName = "IconButton";

// ==================== EXPORT ALL ====================
export default Icon;