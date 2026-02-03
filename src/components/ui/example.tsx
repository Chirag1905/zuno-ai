"use client";

import { useState } from "react";
import Checkbox from "@/components/ui/Checkbox";
import Radio from "@/components/ui/Radio";
import Switch from "@/components/ui/Switch";
type Role = "admin" | "editor" | "viewer";

export default function Example() {
    const [remember, setRemember] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [role, setRole] = useState<Role>("admin");
    const ACCENT_COLOR = "bg-cyan-500";

    return (
        <div className="space-y-6 rounded-xl bg-white/5 p-6">
            <Radio
                name="role"
                value="admin"
                label="Admin"
                description="Full access"
                checked={role === "admin"}
                onChange={(v) => setRole(v as Role)}
                accentColor={ACCENT_COLOR}
            />

            <Switch
                checked={notifications}
                onChange={setNotifications}
                label="Enable notifications"
                accentColor={ACCENT_COLOR}
                size="lg"
            />

            <Checkbox
                checked={remember}
                onChange={setRemember}
                label="Remember me"
                accentColor={ACCENT_COLOR}
            />
        </div>
    );
}
