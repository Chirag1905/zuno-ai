"use client";
import React, { useState } from "react";
import { userType } from "@/types/userType";
import ComponentCard from "@/components/admin/common/ComponentCard";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { generatePassword } from "@/lib/passwordGenerator";
import { KeyIcon } from "lucide-react";
import CountrySelect from "@/utils/CountrySelect";
import Switch from "@/components/ui/Switch";

interface userModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: userType) => void;
    initialData?: userType | null;
    errors?: Record<string, string>;
}

const defaultValues: userType = {
    id: "",
    name: "",
    email: "",
    password: "",
    role: "USER",
    country: undefined,
    emailVerified: false,
    mfaEnabled: false,
};

const UserModal: React.FC<userModalProps> = ({
    // isOpen, // ❌ unused
    onClose,
    onSubmit,
    initialData,
    errors
}) => {

    const [formData, setFormData] = useState<userType>(() => {
        if (initialData) {
            return {
                ...defaultValues,
                ...initialData,
                password: "", // ❗ never prefill password
            };
        }
        return defaultValues;
    });
    const [showPassword, setShowPassword] = useState(false);


    /* ---------------- Handlers ---------------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev: userType) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
    };

    return (
        <ComponentCard
            title={initialData ? "Edit User" : "Create User"}
            showFooter
            submitLabel={initialData ? "Update User" : "Create User"}
            onCancel={onClose}
            onSubmit={handleSubmit}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 px-6">
                {/* ---------------- Name ---------------- */}
                <div>
                    <Label>Name</Label>
                    <Input
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        placeholder="Enter name"
                        errorMessage={errors?.name}
                    />
                </div>

                {/* ---------------- Email ---------------- */}
                <div>
                    <Label>Email</Label>
                    <Input
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        errorMessage={errors?.email}
                    />
                </div>

                {/* ---------------- Role ---------------- */}
                <div>
                    <Label>Role</Label>
                    <select
                        className="w-full h-11.25 rounded-xl bg-[rgba(38,31,66,0.6)] text-white px-4 border border-white/15"
                        value={formData.role}
                        onChange={(e) =>
                            setFormData((p: userType) => ({
                                ...p,
                                role: e.target.value as userType["role"],
                            }))
                        }
                    >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                </div>

                {/* ---------------- Country ---------------- */}
                <div>
                    <Label>Country</Label>
                    <CountrySelect
                        value={formData.country || undefined}
                        onChange={(value) =>
                            setFormData((p: userType) => ({ ...p, country: value }))
                        }
                    />
                </div>

                {/* ---------------- Email Verified ---------------- */}
                <div className="flex items-center mt-2">
                    <Switch
                        label="Email Verified"
                        checked={formData.emailVerified ?? false}
                        accentColor="bg-blue-500"
                        onChange={(v) =>
                            setFormData((p: userType) => ({ ...p, emailVerified: v }))
                        }
                    />
                </div>

                {/* ---------------- MFA Enabled ---------------- */}
                <div className="flex items-center mt-2">
                    <Switch
                        label="MFA Enabled"
                        checked={formData.mfaEnabled ?? false}
                        accentColor="bg-blue-500"
                        onChange={(v) =>
                            setFormData((p: userType) => ({ ...p, mfaEnabled: v }))
                        }
                    />
                </div>

                {/* ---------------- Password ---------------- */}
                <div className="sm:col-span-2">
                    <div className="flex items-center mb-1.5">
                        <Label>Password</Label>
                        <Button
                            text="Generate"
                            className="ml-3 py-0 px-2 rounded-full"
                            startIcon={<KeyIcon size={14} />}
                            variant="outline"
                            onClick={() =>
                                setFormData((p: userType) => ({
                                    ...p,
                                    password: generatePassword(),
                                }))
                            }
                        />
                    </div>

                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={
                                initialData
                                    ? "Leave blank to keep existing password"
                                    : "Enter password"
                            }
                            errorMessage={errors?.password}
                        />
                        <Button
                            type="button"
                            icon={showPassword ? "EyeIcon" : "EyeClosedIcon"}
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        />
                    </div>
                </div>
            </div>
        </ComponentCard>
    );
};

export default UserModal;
