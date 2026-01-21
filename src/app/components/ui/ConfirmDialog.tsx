"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IconButton } from "@/app/components/ui/Icon";

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
                                    text={cancelText}
                                    variant="ghost"
                                    onClick={onCancel}
                                />

                                {/* <IconButton
                                    text={loading ? "Deleting..." : confirmText}
                                    variant="optional"
                                    className="bg-red-600/20 text-red-400 hover:bg-red-600/30"
                                    disabled={loading}
                                    onClick={onConfirm}
                                /> */}
                                <IconButton
                                    variant="optional"
                                    disabled={loading}
                                    onClick={onConfirm}
                                    className={`bg-red-600/20 text-red-400 hover:bg-red-600/30 flex items-center gap-2
                                                ${loading ? "cursor-not-allowed opacity-80" : ""}
                                    `}
                                    text={!loading ? confirmText : ""}
                                >
                                    {loading && (
                                        <>
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                                            <span className="text-base">Deleting...</span>
                                        </>
                                    )}
                                </IconButton>

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
