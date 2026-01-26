"use client";
import React, { useEffect, useState } from "react";
// import { EnvelopeIcon, EyeCloseIcon, EyeIcon, KeyIcon } from "@/icons";
import { userType } from "@/app/admin/users/_components/userType";
import ComponentCard from "@/components/admin/common/ComponentCard";
import Label from "@/components/admin/form/Label";
import Input from "@/components/admin/form/input/InputField";
import Button from "@/components/admin/ui/button/Button";
import { generatePassword } from "@/components/admin/utils/passwordGenerator";
import { AlignEndVertical, EyeClosedIcon, EyeIcon, KeyIcon } from "lucide-react";

const userDefaultValues: userType = {
    id: 0,
    name: "",
    email: "",
    password: "",
    role: "user",
};

interface userModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: userType) => void;
    initialData?: userType | null;
    errors?: Record<string, string>;
}

const UserModal: React.FC<userModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    errors
}) => {
    const [formData, setFormData] = useState<userType>(userDefaultValues);
    const [showPassword, setShowPassword] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData(userDefaultValues);
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <ComponentCard
            className="bg-white dark:border-white/5 dark:bg-white/3"
            title={initialData ? "Edit user" : "Create user"}
            showFooter
            onCancel={onClose}
            onSubmit={() => onSubmit(formData)}
            submitLabel={initialData ? "Update user" : "Create user"}
        >
            <div className="px-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="col-span-1">
                    <Label>Name :</Label>
                    <Input
                        type="text"
                        name="name"
                        placeholder="School Name"
                        value={formData?.name}
                        onChange={handleChange}
                        errorMessage={errors?.name}
                    />
                </div>
                <div className="col-span-1">
                    <Label>Email :</Label>
                    <div className="relative">
                        <Input
                            type="text"
                            name="email"
                            className="pl-15.5"
                            placeholder="info@gmail.com"
                            value={formData?.email}
                            onChange={handleChange}
                            errorMessage={errors?.email}
                        />
                        <span className="absolute left-0 top-3 mt-2.5 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                            <AlignEndVertical />
                        </span>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="flex mb-1.5">
                        <Label>Password :</Label>
                        <Button
                            className="ml-3! py-0! px-2.5! rounded-4xl! bg-gray-500! dark:bg-gray-900!"
                            startIcon={<KeyIcon className="w-4 h-4 fill-white dark:fill-gray-400" />}
                            variant="outline"
                            onClick={() =>
                                setFormData(prev => ({
                                    ...prev,
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
                            placeholder="Enter your password"
                            value={formData?.password}
                            onChange={handleChange}
                            className="flex-1"
                            errorMessage={errors?.password}
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-3 mt-2.5"
                        >
                            {showPassword ? (
                                <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                            ) : (
                                <EyeClosedIcon className="fill-gray-500 dark:fill-gray-400" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </ComponentCard>
    );
};

export default UserModal;
