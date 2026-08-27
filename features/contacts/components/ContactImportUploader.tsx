"use client";

import { ChangeEvent, useState, useRef } from "react";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface ContactImportUploaderProps {
  isUploading: boolean;
  onFileSelected: (file: File) => void;
  error?: string | null;
}

export function ContactImportUploader({
  isUploading,
  onFileSelected,
  error,
}: ContactImportUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const validTypes = [
        "text/csv", 
        "application/vnd.ms-excel", 
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith(".csv") || file.name.endsWith(".xlsx")) {
        onFileSelected(file);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#25342f]">Upload Contacts</h2>
        <p className="text-sm text-[#6f7f75]">
          Upload a CSV or Excel file containing your contacts.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-[#fdeaea] px-4 py-3 text-xs font-medium text-[#9a3d33] border border-[#e6c2bc]">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging 
            ? "border-[#2d644d] bg-[#eef8f0]" 
            : "border-[#ddd2c3] bg-[#fbf7f1] hover:border-[#a0aca4]"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="rounded-xl bg-white p-3 shadow-sm border border-[#e5ddd3] mb-4">
          <FileSpreadsheet className="h-8 w-8 text-[#2d644d]" />
        </div>
        
        <p className="text-base font-semibold text-[#25342f] mb-1">
          Drop file here
        </p>
        <p className="text-xs text-[#7a8b82] mb-6">or</p>
        
        <Button 
          type="button" 
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-white border-[#ddd2c3] text-[#25342f] hover:bg-[#f6f1e9]"
        >
          <Upload className="mr-2 h-4 w-4 text-[#2d644d]" />
          Choose File
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mt-6 text-[11px] text-[#7a8b82] uppercase tracking-wider font-semibold">
          Supported Formats
        </div>
        <p className="text-xs text-[#6f7f75] mt-1">CSV and Excel (.xlsx)</p>
      </div>
    </div>
  );
}
