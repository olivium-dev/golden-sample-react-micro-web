# Dynamic Additional Parameters Configuration

This document explains how to configure and use dynamic additional parameters for items in the catalog management system.

## Configuration File

The dynamic additional parameters are configured in `additionalParams.json`. This file defines the fields that will be dynamically rendered in the Item CRUD forms.

## Field Types Supported

- **string**: Text input field
- **decimal**: Numeric input for decimal numbers (e.g., prices)
- **integer**: Numeric input for whole numbers
- **boolean**: Checkbox input
- **date**: Date picker input
- **image**: File upload for images

## Configuration Structure

```json
{
  "additionalParams": [
    {
      "key": "fieldName",
      "label": "Display Label",
      "type": "decimal|string|integer|boolean|date|image",
      "required": true|false,
      "validation": {
        "min": 0,
        "max": 999999,
        "maxLength": 50,
        "maxSize": 5242880,
        "allowedTypes": ["image/jpeg", "image/png"],
        "pattern": "^[A-Z]{3}$"
      },
      "placeholder": "Placeholder text",
      "description": "Help text",
      "defaultValue": "default value"
    }
  ]
}
```

## Current Configuration

The system currently includes these fields:

1. **Price** (decimal, required)
   - Validation: 0 to 999,999.99
   - Displayed with currency symbol

2. **Image** (image, optional)
   - Max size: 5MB
   - Allowed types: JPEG, PNG, WebP

3. **Size** (string, optional)
   - Max length: 50 characters
   - For product sizes (S, M, L, XL, etc.)

4. **Currency** (string, optional)
   - Max length: 3 characters
   - Pattern: 3 uppercase letters
   - Default: "USD"

## Adding New Fields

To add a new field:

1. Edit `additionalParams.json`
2. Add a new object to the `additionalParams` array
3. Define the field properties according to the structure above
4. The field will automatically appear in the Item CRUD forms

## Validation Rules

- **min/max**: For numeric fields (decimal, integer)
- **maxLength**: For string fields
- **maxSize**: For file uploads (in bytes)
- **allowedTypes**: For file uploads (MIME types)
- **pattern**: Regular expression for string validation

## Field Display

- Fields are automatically displayed in the Item Dialog form
- Fields appear in the Item List data grid as columns
- Required fields are marked with an asterisk (*)
- Validation errors are shown in real-time

## Examples

### Adding a "Weight" field:
```json
{
  "key": "weight",
  "label": "Weight (kg)",
  "type": "decimal",
  "required": false,
  "validation": {
    "min": 0,
    "max": 1000
  },
  "placeholder": "0.00",
  "description": "Product weight in kilograms"
}
```

### Adding a "Category" dropdown:
```json
{
  "key": "productCategory",
  "label": "Product Category",
  "type": "string",
  "required": true,
  "options": ["Electronics", "Clothing", "Books", "Home"],
  "description": "Select product category"
}
```

## Notes

- Changes to the configuration file require a page refresh to take effect
- Image files are currently stored by filename - implement proper file upload handling as needed
- The system validates all fields before allowing form submission
- Fields marked as required must have values to save the item
