"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  icon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  className?: string;
  showSuccess?: boolean;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  error,
  value,
  onChange,
  onBlur,
  required,
  icon,
  multiline = false,
  rows = 4,
  className,
  showSuccess = false,
}: FormFieldProps) {
  const hasError = !!error;
  const hasSuccess = showSuccess && !hasError && value && value.length > 0;

  const inputClasses = cn(
    "transition-all duration-200",
    icon && "pl-10",
    hasError
      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
      : hasSuccess
      ? "border-green-300 focus:border-green-500 focus:ring-green-500"
      : "border-gray-200 focus:border-[#B260E6] focus:ring-[#B260E6]",
    className
  );

  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={name}
        className="text-sm font-medium text-gray-700 flex items-center gap-1"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <InputComponent
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          rows={multiline ? rows : undefined}
          className={cn(
            inputClasses,
            multiline ? "min-h-[100px]" : "h-12",
            icon && !multiline && "pl-10"
          )}
        />
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
        {hasSuccess && !hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p className="text-red-500 text-sm flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

