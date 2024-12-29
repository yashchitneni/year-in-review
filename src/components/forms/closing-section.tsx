"use client";

import { useAtom } from "jotai";
import { formDataAtom } from "@/lib/store";
import { Crimson_Pro } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Mail } from "lucide-react";
import SignatureCanvas from 'react-signature-canvas';
import { useRef, useEffect } from 'react';
import AIAnalysis from "@/components/analysis/ai-analysis";

const crimsonPro = Crimson_Pro({ subsets: ["latin"] });

export default function ClosingSection() {
  const [formData, setFormData] = useAtom(formDataAtom);
  const signatureRef = useRef<SignatureCanvas>(null);

  // Initialize sharing object if it doesn't exist
  useEffect(() => {
    if (!formData.closing.sharing) {
      setFormData(prev => ({
        ...prev,
        closing: {
          ...prev.closing,
          sharing: {
            hashtag: '',
            website: ''
          }
        }
      }));
    }
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      closing: {
        ...prev.closing,
        [field]: value,
      },
    }));
  };

  const handleSharingChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      closing: {
        ...prev.closing,
        sharing: {
          ...(prev.closing.sharing || { hashtag: '', website: '' }),
          [field]: value,
        },
      },
    }));
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      handleChange("signature", signatureData);
    }
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      handleChange("signature", "");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8">
      <div className="space-y-8">
        <h1 className={`${crimsonPro.className} text-5xl text-center border-b pb-4`}>
          Closing & Analysis
        </h1>

        {/* AI Analysis Section */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>AI-Powered Analysis</h2>
          <p className="text-lg">
            Get AI-generated insights from your responses. Choose an analysis framework below:
          </p>
          <AIAnalysis />
        </section>

        {/* Signature Section */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Your Signature</h2>
          <div className="border rounded-lg p-4">
            <SignatureCanvas
              ref={signatureRef}
              canvasProps={{
                className: "signature-canvas w-full h-40 border rounded",
              }}
              onEnd={handleSignatureEnd}
            />
            <Button
              variant="outline"
              className="mt-2"
              onClick={clearSignature}
            >
              Clear Signature
            </Button>
          </div>
        </section>

        {/* Date Section */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Date</h2>
          <Input
            type="date"
            value={formData.closing.date}
            onChange={(e) => handleChange("date", e.target.value)}
          />
        </section>

        {/* Export Options */}
        <section className="space-y-4">
          <h2 className={`${crimsonPro.className} text-3xl`}>Export Your YearCompass</h2>
          <div className="flex gap-4">
            <Button className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button className="flex-1">
              <Mail className="mr-2 h-4 w-4" />
              Email to Myself
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
} 