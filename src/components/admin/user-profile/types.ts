export interface UserMetaCardProps {
    name: string;
    role: string;
    department: string;
    employeeId: string;
    isActive: boolean;
}

export interface UserInfoCardProps {
    email: string;
    phone: string;
    emergencyContact: string;
    dateOfBirth: string;
    hireDate: string;
    experience: string;
    qualification: string;
    salary: number;
}

export interface UserAddressCardProps {
    address: string;
}