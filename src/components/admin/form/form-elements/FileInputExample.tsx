"use client";
import ComponentCard from "@/components/admin/common/ComponentCard";
import FileInput from "@/components/admin/form/input/FileInput";
import Label from "@/components/admin/form/Label";
import React from "react";
// import ComponentCard from "../../common/ComponentCard";
// import FileInput from "../input/FileInput";
// import Label from "../Label";

export default function FileInputExample() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Selected file:", file.name);
    }
  };

  return (
    <ComponentCard title="File Input">
      <div>
        <Label>Upload file</Label>
        <FileInput onChange={handleFileChange} className="custom-class" />
      </div>
    </ComponentCard>
  );
}
