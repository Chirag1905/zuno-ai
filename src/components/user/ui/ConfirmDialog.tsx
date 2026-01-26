"use client";

import { IconButton } from "@/components/user/ui/Icon";
import { motion, AnimatePresence } from "framer-motion";

type ConfirmDialogProps = {
    open: boolean;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
    open,
    title = "Delete chat?",
    description = "This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                    />

                    {/* DIALOG */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <div
                            className="w-full max-w-md rounded-3xl border border-white/10 
                            bg-linear-to-b from-gray-900/95 to-gray-950/95 
                            backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.8)]
                            p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* TITLE */}
                            <h3 className="text-lg font-semibold text-white">
                                {title}
                            </h3>

                            {/* DESCRIPTION */}
                            <p className="mt-2 text-sm text-gray-400">
                                {description}
                            </p>

                            {/* ACTIONS */}
                            <div className="mt-6 flex justify-end gap-3">
                                <IconButton
                                    icon="XCircle"
                                    size="md"
                                    rounded="xl"
                                    variant="minimal"
                                    text={cancelText}
                                    onClick={onCancel}
                                />
                                <IconButton
                                    icon={loading ? "LoaderPinwheel" : "CircleCheck"}
                                    size="md"
                                    rounded="xl"
                                    variant="optional"
                                    disabled={loading}
                                    onClick={onConfirm}
                                    iconClassName={loading ? "animate-spin" : ""}
                                    className={`bg-red-600/20 text-red-400 hover:bg-red-600/30 flex items-center gap-2
                                    ${loading ? "cursor-not-allowed opacity-80" : ""}
                                    `}
                                    text={!loading ? confirmText : `${confirmText}ing...`}
                                />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
