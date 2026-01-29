"use client";
import React, { useEffect, useState } from "react";
import { userType } from "@/app/admin/users/_components/userType";
import ComponentCard from "@/components/admin/common/ComponentCard";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import Button from "@/components/admin/ui/button/Button";
import { generatePassword } from "@/components/admin/utils/passwordGenerator";
import { AlignEndVertical, EyeClosedIcon, EyeIcon, KeyIcon } from "lucide-react";
import CountrySelect from "@/components/admin/utils/CountrySelect";
import Switch from "@/components/admin/form/Switch";

interface userModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: userType) => void;
    initialData?: userType | null;
    errors?: Record<string, string>;
}

const defaultValues: userType = {
    name: "",
    email: "",
    password: "",
    role: "USER",
    country: undefined,
    emailVerified: false,
    mfaEnabled: false,
};

const UserModal: React.FC<userModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    errors
}) => {

    const [formData, setFormData] = useState<userType>(defaultValues);
    const [showPassword, setShowPassword] = useState(false);

    /* ---------------- Populate form ---------------- */
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...defaultValues,
                ...initialData,
                password: "", // ❗ never prefill password
            });
        } else {
            setFormData(defaultValues);
        }
    }, [initialData, isOpen]);


    /* ---------------- Handlers ---------------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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
                        value={formData.name}
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
                            setFormData((p) => ({
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
                        value={formData.country}
                        onChange={(value) =>
                            setFormData((p) => ({ ...p, country: value }))
                        }
                    />
                </div>

                {/* ---------------- Email Verified ---------------- */}
                <div className="flex items-center mt-2">
                    <Switch
                        label="Email Verified"
                        checked={formData.emailVerified}
                        onChange={(v) =>
                            setFormData((p) => ({ ...p, emailVerified: v }))
                        }
                    />
                </div>

                {/* ---------------- MFA Enabled ---------------- */}
                <div className="flex items-center mt-2">
                    <Switch
                        label="MFA Enabled"
                        checked={formData.mfaEnabled}
                        onChange={(v) =>
                            setFormData((p) => ({ ...p, mfaEnabled: v }))
                        }
                    />
                </div>

                {/* ---------------- Password ---------------- */}
                <div className="sm:col-span-2">
                    <div className="flex items-center mb-1.5">
                        <Label>Password</Label>
                        <Button
                            className="ml-3 py-0 px-2 rounded-full"
                            startIcon={<KeyIcon size={14} />}
                            variant="outline"
                            onClick={() =>
                                setFormData((p) => ({
                                    ...p,
                                    password: generatePassword(),
                                }))
                            }
                        >
                            Generate
                        </Button>
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
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                        >
                            {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                        </button>
                    </div>
                </div>
            </div>
        </ComponentCard>
    );
};

export default UserModal;
