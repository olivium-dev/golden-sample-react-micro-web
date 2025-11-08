export interface AdditionalParamValidation {
  min?: number;
  max?: number;
  maxLength?: number;
  maxSize?: number; // for file uploads in bytes
  allowedTypes?: string[]; // for file uploads
  pattern?: string; // regex pattern
}

export interface AdditionalParamConfig {
  key: string;
  label: string;
  type: 'string' | 'decimal' | 'integer' | 'boolean' | 'image' | 'date';
  required: boolean;
  validation?: AdditionalParamValidation;
  placeholder?: string;
  description?: string;
  defaultValue?: string | number | boolean;
  options?: string[]; // for select/dropdown fields
}

export interface AdditionalParamsConfig {
  additionalParams: AdditionalParamConfig[];
}

export interface DynamicAdditionalParam {
  key: string;
  value: string | number | boolean | File | null;
  type: string;
  isValid: boolean;
  error?: string;
}
