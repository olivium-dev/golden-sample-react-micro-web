import React, { useRef, useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  FormLabel,
  Button,
  Box,
  Typography,
  Chip,
  FormHelperText,
  InputAdornment,
  LinearProgress,
  Alert,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon, Image as ImageIcon } from '@mui/icons-material';
import { AdditionalParamConfig, DynamicAdditionalParam } from '../types/additionalParams';
import { cdnApi } from '../services/api';
import { ImageUploadProgress, MediaType } from '../types/cdn';

interface DynamicAdditionalParamFieldProps {
  param: DynamicAdditionalParam;
  config: AdditionalParamConfig;
  onChange: (key: string, value: any) => void;
}

const DynamicAdditionalParamField: React.FC<DynamicAdditionalParamFieldProps> = ({
  param,
  config,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [availableMediaTypes, setAvailableMediaTypes] = useState<MediaType[]>([]);

  // Load available media types on component mount
  useEffect(() => {
    const loadMediaTypes = async () => {
      try {
        const mediaTypes = await cdnApi.getMediaTypes();
        setAvailableMediaTypes(mediaTypes);
      } catch (error) {
        console.warn('Failed to load media types:', error);
        // Set a default media type if API call fails
        setAvailableMediaTypes([{ name: 'default', resolution: null, aspectRatio: null, extensions: null, maxFileSize: null, videoLength: null, 'img-lqip': null }]);
      }
    };

    if (config.type === 'image') {
      loadMediaTypes();
    }
  }, [config.type]);

  const handleChange = (value: any) => {
    onChange(param.key, value);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(null);

      try {
        // Upload the file to CDN with appropriate media type
        // Try to find a suitable media type based on file type, or use first available, or default
        let mediaTypeName = 'default';
        
        if (availableMediaTypes.length > 0) {
          // Try to find a media type that supports this file extension
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          const suitableMediaType = availableMediaTypes.find(mt => 
            mt.extensions && fileExtension && mt.extensions.includes(`.${fileExtension}`)
          );
          
          if (suitableMediaType && suitableMediaType.name) {
            mediaTypeName = suitableMediaType.name;
          } else if (availableMediaTypes[0].name) {
            mediaTypeName = availableMediaTypes[0].name;
          }
        }
        
        const result = await cdnApi.uploadImage(
          file,
          mediaTypeName,
          (progress: ImageUploadProgress) => {
            setUploadProgress(progress);
          }
        );

        if (result.success && result.fileName) {
          // Store the CDN filename instead of the File object
          handleChange(result.fileName);
          setUploadProgress(null);
        } else {
          setUploadError(result.error || 'Upload failed');
        }
      } catch (error: any) {
        setUploadError(error.message || 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleFileRemove = async () => {
    // If there's an existing CDN filename, try to delete it
    if (param.value && typeof param.value === 'string') {
      try {
        await cdnApi.deleteImage(param.value);
      } catch (error) {
        console.warn('Failed to delete image from CDN:', error);
      }
    }
    
    handleChange(null);
    setUploadError(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderField = () => {
    switch (config.type) {
      case 'decimal':
        return (
          <TextField
            fullWidth
            label={config.label}
            type="number"
            value={param.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={config.placeholder}
            required={config.required}
            error={!param.isValid}
            helperText={param.error || config.description}
            inputProps={{
              step: 0.01,
              min: config.validation?.min,
              max: config.validation?.max,
            }}
            InputProps={{
              startAdornment: param.key === 'price' ? (
                <InputAdornment position="start">$</InputAdornment>
              ) : undefined,
            }}
          />
        );

      case 'integer':
        return (
          <TextField
            fullWidth
            label={config.label}
            type="number"
            value={param.value || ''}
            onChange={(e) => handleChange(parseInt(e.target.value) || null)}
            placeholder={config.placeholder}
            required={config.required}
            error={!param.isValid}
            helperText={param.error || config.description}
            inputProps={{
              step: 1,
              min: config.validation?.min,
              max: config.validation?.max,
            }}
          />
        );

      case 'string':
        return (
          <TextField
            fullWidth
            label={config.label}
            value={param.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={config.placeholder}
            required={config.required}
            error={!param.isValid}
            helperText={param.error || config.description}
            inputProps={{
              maxLength: config.validation?.maxLength,
            }}
          />
        );

      case 'date':
        return (
          <TextField
            fullWidth
            label={config.label}
            type="date"
            value={param.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            required={config.required}
            error={!param.isValid}
            helperText={param.error || config.description}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      case 'image':
        return (
          <FormControl fullWidth error={!param.isValid}>
            <FormLabel component="legend" required={config.required}>
              {config.label}
            </FormLabel>
            <Box sx={{ mt: 1 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id={`file-input-${param.key}`}
                disabled={isUploading}
              />
              <label htmlFor={`file-input-${param.key}`}>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={isUploading}
                  sx={{ mr: 1 }}
                >
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              </label>
              
              {/* Upload Progress */}
              {uploadProgress && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress.percentage} 
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {uploadProgress.percentage}% ({(uploadProgress.loaded / 1024).toFixed(1)} KB / {(uploadProgress.total / 1024).toFixed(1)} KB)
                  </Typography>
                </Box>
              )}
              
              {/* Upload Error */}
              {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadError}
                </Alert>
              )}
              
              {/* Uploaded Image Display */}
              {param.value && typeof param.value === 'string' && !isUploading && (
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      icon={<ImageIcon />}
                      label={param.value}
                      onDelete={handleFileRemove}
                      deleteIcon={<DeleteIcon />}
                      variant="outlined"
                      color="success"
                    />
                    <Typography variant="caption" color="text.secondary">
                      Uploaded to CDN
                    </Typography>
                  </Box>
                  
                  {/* Image Preview */}
                  <Box
                    component="img"
                    src={cdnApi.getImageUrl(param.value as string, 'thumbnail')}
                    alt="Uploaded image preview"
                    sx={{
                      maxWidth: 200,
                      maxHeight: 150,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid #e0e0e0',
                    }}
                    onError={(e) => {
                      // Fallback if thumbnail doesn't exist
                      (e.target as HTMLImageElement).src = cdnApi.getImageUrl(param.value as string);
                    }}
                  />
                </Box>
              )}
            </Box>
            {(param.error || config.description) && (
              <FormHelperText>
                {param.error || config.description}
              </FormHelperText>
            )}
          </FormControl>
        );

      default:
        return (
          <TextField
            fullWidth
            label={config.label}
            value={param.value || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={config.placeholder}
            required={config.required}
            error={!param.isValid}
            helperText={param.error || config.description}
          />
        );
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {renderField()}
    </Box>
  );
};

export default DynamicAdditionalParamField;
