import { AdditionalParamsConfig, AdditionalParamConfig, DynamicAdditionalParam } from '../types/additionalParams';
import additionalParamsConfig from '../config/additionalParams.json';

export class AdditionalParamsService {
  private static config: AdditionalParamsConfig = additionalParamsConfig as AdditionalParamsConfig;

  static getConfig(): AdditionalParamConfig[] {
    return this.config.additionalParams;
  }

  static getParamConfig(key: string): AdditionalParamConfig | undefined {
    return this.config.additionalParams.find(param => param.key === key);
  }

  static validateParam(param: DynamicAdditionalParam, config: AdditionalParamConfig): { isValid: boolean; error?: string } {
    const { value, key } = param;
    const { required, validation, type } = config;

    // Check if required field is empty
    if (required && (value === null || value === undefined || value === '')) {
      return { isValid: false, error: `${config.label} is required` };
    }

    // If not required and empty, it's valid
    if (!required && (value === null || value === undefined || value === '')) {
      return { isValid: true };
    }

    // Type-specific validation
    switch (type) {
      case 'decimal':
        return this.validateDecimal(value, validation);
      case 'integer':
        return this.validateInteger(value, validation);
      case 'string':
        return this.validateString(value, validation);
      case 'image':
        return this.validateImage(value, validation);
      case 'date':
        return this.validateDate(value);
      case 'boolean':
        return { isValid: true }; // Boolean is always valid
      default:
        return { isValid: true };
    }
  }

  private static validateDecimal(value: any, validation?: any): { isValid: boolean; error?: string } {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Must be a valid decimal number' };
    }

    if (validation?.min !== undefined && numValue < validation.min) {
      return { isValid: false, error: `Must be at least ${validation.min}` };
    }

    if (validation?.max !== undefined && numValue > validation.max) {
      return { isValid: false, error: `Must be at most ${validation.max}` };
    }

    return { isValid: true };
  }

  private static validateInteger(value: any, validation?: any): { isValid: boolean; error?: string } {
    const numValue = parseInt(value);
    
    if (isNaN(numValue) || !Number.isInteger(numValue)) {
      return { isValid: false, error: 'Must be a valid integer' };
    }

    if (validation?.min !== undefined && numValue < validation.min) {
      return { isValid: false, error: `Must be at least ${validation.min}` };
    }

    if (validation?.max !== undefined && numValue > validation.max) {
      return { isValid: false, error: `Must be at most ${validation.max}` };
    }

    return { isValid: true };
  }

  private static validateString(value: any, validation?: any): { isValid: boolean; error?: string } {
    const strValue = String(value);

    if (validation?.maxLength && strValue.length > validation.maxLength) {
      return { isValid: false, error: `Must be at most ${validation.maxLength} characters` };
    }

    if (validation?.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(strValue)) {
        return { isValid: false, error: 'Invalid format' };
      }
    }

    return { isValid: true };
  }

  private static validateImage(value: any, validation?: any): { isValid: boolean; error?: string } {
    // Accept File (for upload), string (for CDN filename)
    if ((value && typeof value === 'string' && value.trim() !== '') || value instanceof File) {
      // Only validate File if that's what was given (should be rare now with CDN upload)
      if (value instanceof File) {
        const file = value as File;
        if (validation?.maxSize && file.size > validation.maxSize) {
          const maxSizeMB = (validation.maxSize / (1024 * 1024)).toFixed(1);
          return { isValid: false, error: `File size must be less than ${maxSizeMB}MB` };
        }
        if (validation?.allowedTypes && !validation.allowedTypes.includes(file.type)) {
          return { isValid: false, error: `File type must be one of: ${validation.allowedTypes.join(', ')}` };
        }
      }
      // For CDN filenames (strings), we assume they're valid since they passed CDN validation
      return { isValid: true };
    }
    return { isValid: false, error: 'Must be a valid image file' };
  }

  private static validateDate(value: any): { isValid: boolean; error?: string } {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Must be a valid date' };
    }

    return { isValid: true };
  }

  static initializeParams(existingParams?: { [key: string]: string | null }): DynamicAdditionalParam[] {
    return this.config.additionalParams.map(config => {
      const existingValue = existingParams?.[config.key];
      let value: any = existingValue || config.defaultValue || null;

      // Convert value based on type
      if (value !== null && value !== undefined && value !== '') {
        switch (config.type) {
          case 'decimal':
            value = parseFloat(value) || null;
            break;
          case 'integer':
            value = parseInt(value) || null;
            break;
          case 'boolean':
            value = Boolean(value);
            break;
          case 'string':
          case 'date':
          default:
            value = String(value);
            break;
        }
      }

      const param: DynamicAdditionalParam = {
        key: config.key,
        value,
        type: config.type,
        isValid: true
      };

      // Validate initial value
      const validation = this.validateParam(param, config);
      param.isValid = validation.isValid;
      param.error = validation.error;

      return param;
    });
  }

  static convertToApiFormat(params: DynamicAdditionalParam[]): { [key: string]: string | null } {
    const result: { [key: string]: string | null } = {};
    
    params.forEach(param => {
      if (param.value !== null && param.value !== undefined && param.value !== '') {
        if (param.type === 'image') {
          if (param.value instanceof File) {
            // This shouldn't happen anymore since we upload to CDN immediately
            // But keeping as fallback
            result[param.key] = (param.value as File).name;
          } else if (typeof param.value === 'string') {
            // CDN filename - store as is
            result[param.key] = param.value;
          } else {
            result[param.key] = String(param.value);
          }
        } else {
          result[param.key] = String(param.value);
        }
      } else {
        result[param.key] = null;
      }
    });

    return result;
  }

  static areAllValid(params: DynamicAdditionalParam[]): boolean {
    return params.every(param => param.isValid);
  }

  static getRequiredParams(): AdditionalParamConfig[] {
    return this.config.additionalParams.filter(param => param.required);
  }
}
