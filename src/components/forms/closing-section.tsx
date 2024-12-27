"use client";

import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download } from "lucide-react";

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function ClosingSection() {
  const [formData, setFormData] = useAtom(formDataAtom);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      closing: {
        ...prev.closing,
        [field]: value,
      },
    }));
  };

  return (
    <div id="closingSection" className="max-w-4xl mx-auto bg-white p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center text-sm">
          <div>YearCompass</div>
          <div>2024 « | » 2025</div>
        </div>

        {/* Title */}
        <h1 className={`${crimsonPro.className} text-5xl text-center border-b pb-4`}>
          Closing
        </h1>

        {/* Signature and Date */}
        <div className="flex gap-6 items-end">
          <div className="flex-1 space-y-2">
            <h2 className={`${crimsonPro.className} text-2xl`}>Your Signature</h2>
            <Input
              value={formData.closing.signature}
              onChange={(e) => handleChange("signature", e.target.value)}
              className="max-w-[300px]"
            />
          </div>
          <div className="space-y-2">
            <h2 className={`${crimsonPro.className} text-2xl`}>Date</h2>
            <Input
              type="date"
              value={formData.closing.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-[200px]"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </Button>
        </div>
      </div>
    </div>
  );
} 