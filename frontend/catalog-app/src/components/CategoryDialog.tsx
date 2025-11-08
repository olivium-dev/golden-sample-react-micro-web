import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  IconButton,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormLabel,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  CloudUpload as CloudUploadIcon,
  Image as ImageIcon 
} from '@mui/icons-material';
import { CategoryDetailsRequest, GetCategoryForCmsResponse, CategoryCmsResponse } from '../types/category';
import { cdnApi, categoryApi } from '../services/api';
import { ImageUploadProgress, MediaType } from '../types/cdn';
import { v4 as uuidv4 } from 'uuid';

interface CategoryWithDetails extends CategoryCmsResponse {
  details?: CategoryDetailsRequest[];
}

interface CategoryDialogProps {
  open: boolean;
  category: CategoryWithDetails | null; // Can be null for new category or contain basic info for editing
  onClose: () => void;
  onSave: (details: CategoryDetailsRequest[], mediaGuid?: string | null) => void;
}

const AVAILABLE_LANGUAGES = ['en', 'ar', 'fr'];

const CategoryDialog: React.FC<CategoryDialogProps> = ({
  open,
  category,
  onClose,
  onSave,
}) => {
  const [details, setDetails] = useState<CategoryDetailsRequest[]>([
    { name: '', language: 'en' }
  ]);
  const [mediaGuid, setMediaGuid] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [availableMediaTypes, setAvailableMediaTypes] = useState<MediaType[]>([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load available media types on component mount
  useEffect(() => {
    const loadMediaTypes = async () => {
      try {
        const mediaTypes = await cdnApi.getMediaTypes();
        setAvailableMediaTypes(mediaTypes);
      } catch (error) {
        console.warn('Failed to load media types:', error);
        setAvailableMediaTypes([{ name: 'default', resolution: null, aspectRatio: null, extensions: null, maxFileSize: null, videoLength: null, 'img-lqip': null }]);
      }
    };

    if (open) {
      loadMediaTypes();
    }
  }, [open]);

  // Load category data when dialog opens for editing
  useEffect(() => {
    const loadCategoryData = async () => {
      if (open && category && category.guid) {
        // Editing existing category - fetch full data from CMS API
        setIsLoadingCategory(true);
        setLoadError(null);
        
        try {
          console.log('CategoryDialog: Loading category data from CMS API for guid:', category.guid);
          const categoryData = await categoryApi.getCategoryForCms(category.guid);
          console.log('CategoryDialog: Received category data:', categoryData);
          console.log('CategoryDialog: MediaGuid from API:', categoryData.mediaGuid);
          
          // Set the form data with the fetched details
          if (categoryData.details && categoryData.details.length > 0) {
            setDetails([...categoryData.details]);
          } else {
            // Fallback to creating details from basic name if no details array
            setDetails([{ name: categoryData.name || '', language: 'en' }]);
          }
          
          // Set mediaGuid from the CMS API response
          const newMediaGuid = categoryData.mediaGuid || null;
          console.log('CategoryDialog: Setting mediaGuid to:', newMediaGuid);
          setMediaGuid(newMediaGuid);
          
        } catch (error: any) {
          console.error('CategoryDialog: Error loading category data:', error);
          setLoadError(error.message || 'Failed to load category data');
          
          // Fallback to using the basic category data passed as prop
          if (category.details && category.details.length > 0) {
            setDetails([...category.details]);
          } else {
            setDetails([{ name: category.name || '', language: 'en' }]);
          }
          setMediaGuid(category.mediaGuid || null);
        } finally {
          setIsLoadingCategory(false);
        }
      } else if (open && !category) {
        // Creating new category
        console.log('CategoryDialog: Creating new category');
        setDetails([{ name: '', language: 'en' }]);
        setMediaGuid(null);
        setLoadError(null);
      }
      
      // Reset upload states
      setUploadProgress(null);
      setUploadError(null);
      setIsUploading(false);
    };

    loadCategoryData();
  }, [category, open]);

  const handleDetailChange = (index: number, field: keyof CategoryDetailsRequest, value: string | null) => {
    const updatedDetails = [...details];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setDetails(updatedDetails);
  };

  const addLanguageDetail = () => {
    // Find languages not yet used
    const usedLanguages = details.map(d => d.language).filter(Boolean) as string[];
    const availableLanguages = AVAILABLE_LANGUAGES.filter(lang => !usedLanguages.includes(lang));
    
    if (availableLanguages.length > 0) {
      setDetails([...details, { name: '', language: availableLanguages[0] }]);
    }
  };

  const removeLanguageDetail = (index: number) => {
    if (details.length > 1) {
      const updatedDetails = details.filter((_, i) => i !== index);
      setDetails(updatedDetails);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(null);

      try {
        // Upload the file to CDN with appropriate media type
        const mediaTypeName = availableMediaTypes.length > 0 
          ? availableMediaTypes[0].name || 'default'
          : 'default';
        
        const result = await cdnApi.uploadImage(
          file,
          mediaTypeName,
          (progress: ImageUploadProgress) => {
            setUploadProgress(progress);
          }
        );

        if (result.success && result.fileName) {
          // Store the CDN filename as mediaGuid
          setMediaGuid(result.fileName);
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

  const handleImageRemove = async () => {
    // If there's an existing CDN filename, try to delete it
    if (mediaGuid) {
      try {
        await cdnApi.deleteImage(mediaGuid);
      } catch (error) {
        console.warn('Failed to delete image from CDN:', error);
      }
    }
    
    setMediaGuid(null);
    setUploadError(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    onSave(details, mediaGuid);
  };

  const isFormValid = () => {
    return details.every(detail => 
      detail.name && detail.name.trim() !== '' && 
      detail.language && detail.language.trim() !== ''
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {category ? 'Edit Category' : 'Create New Category'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Loading State */}
          {isLoadingCategory && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" sx={{ ml: 2 }}>
                Loading category data...
              </Typography>
            </Box>
          )}
          
          {/* Error State */}
          {loadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError}
            </Alert>
          )}
          
          {/* Main Content - only show when not loading */}
          {!isLoadingCategory && (
            <>
          {/* Image Upload Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Category Image
            </Typography>
            <FormControl fullWidth>
              <FormLabel component="legend">
                Upload Category Image
              </FormLabel>
              <Box sx={{ mt: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="category-image-input"
                  disabled={isUploading}
                />
                <label htmlFor="category-image-input">
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
                {mediaGuid && !isUploading && (
                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Chip
                        icon={<ImageIcon />}
                        label={mediaGuid}
                        onDelete={handleImageRemove}
                        deleteIcon={<DeleteIcon />}
                        variant="outlined"
                        color="success"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {category ? 'Existing Image' : 'Uploaded to CDN'}
                      </Typography>
                    </Box>
                    
                    {/* Image Preview */}
                    <Box
                      component="img"
                      src={cdnApi.getImageUrl(mediaGuid, 'thumbnail')}
                      alt="Category image preview"
                      sx={{
                        maxWidth: 200,
                        maxHeight: 150,
                        objectFit: 'cover',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                        }
                      }}
                      onError={(e) => {
                        console.warn('Failed to load thumbnail, trying full image:', mediaGuid);
                        // Fallback if thumbnail doesn't exist
                        (e.target as HTMLImageElement).src = cdnApi.getImageUrl(mediaGuid);
                      }}
                      onClick={() => {
                        // Open full size image in new tab
                        window.open(cdnApi.getImageUrl(mediaGuid), '_blank');
                      }}
                    />
                    
                    {/* Image Info */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Click image to view full size
                    </Typography>
                  </Box>
                )}
              </Box>
            </FormControl>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Language Details Section */}
          <Typography variant="h6" gutterBottom>
            Category Names (Multiple Languages)
          </Typography>
          {details.map((detail, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">
                  Language Details {index + 1}
                </Typography>
                {details.length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeLanguageDetail(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={detail.language || ''}
                    label="Language"
                    onChange={(e) => handleDetailChange(index, 'language', e.target.value)}
                  >
                    {AVAILABLE_LANGUAGES.map(lang => {
                      const languageNames = {
                        'en': 'English',
                        'ar': 'العربية (Arabic)',
                        'fr': 'Français (French)'
                      };
                      return (
                        <MenuItem 
                          key={lang} 
                          value={lang}
                          disabled={details.some((d, i) => i !== index && d.language === lang)}
                        >
                          {languageNames[lang as keyof typeof languageNames] || lang.toUpperCase()}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                
                <TextField
                  fullWidth
                  label="Category Name"
                  value={detail.name || ''}
                  onChange={(e) => handleDetailChange(index, 'name', e.target.value)}
                  required
                />
              </Box>
            </Box>
          ))}
          
          <Button
            startIcon={<AddIcon />}
            onClick={addLanguageDetail}
            disabled={details.length >= AVAILABLE_LANGUAGES.length}
            sx={{ mt: 1 }}
          >
            Add Language
          </Button>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isFormValid() || isLoadingCategory}
          sx={{
            backgroundColor: '#61dafb',
            color: '#000',
            '&:hover': { backgroundColor: '#4fb3d4' },
          }}
        >
          {category ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
