import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  Autocomplete,
  Typography,
  Grid,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { GetItemForCmsResponse, ItemDetailsRequest, ItemResponse } from '../types/item';
import { categoryApi, tagApi } from '../services/api';
import { CategoryCmsResponse } from '../types/category';
import { DynamicAdditionalParam } from '../types/additionalParams';
import { AdditionalParamsService } from '../services/additionalParamsService';
import DynamicAdditionalParamField from './DynamicAdditionalParamField';

interface ItemDialogProps {
  open: boolean;
  item: GetItemForCmsResponse | null;
  onClose: () => void;
  onSave: (itemData: {
    parent: null;
    tags: string[] | null;
    type: string | null;
    details: ItemDetailsRequest[] | null;
    additionalParams: { [key: string]: string | null } | null;
    categories: string[] | null;
  }) => void;
}

const ItemDialog: React.FC<ItemDialogProps> = ({ open, item, onClose, onSave }) => {
  // Helper function to get language display info
  const getLanguageInfo = (lang: string) => {
    switch (lang) {
      case 'ar': return { name: 'Arabic', color: '#2e7d32' };
      case 'fr': return { name: 'French', color: '#1976d2' };
      case 'en': 
      default: return { name: 'English', color: '#ed6c02' };
    }
  };
  const [details, setDetails] = useState<ItemDetailsRequest[]>([
    { name: '', description: '', language: 'en', additionalParams: null }
  ]);
  const [type, setType] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dynamicAdditionalParams, setDynamicAdditionalParams] = useState<DynamicAdditionalParam[]>([]);
  
  // Available options
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<CategoryCmsResponse[]>([]);

  useEffect(() => {
    if (open) {
      loadAvailableOptions();
      if (item) {
        // Editing existing item
        // Use item.details if available, otherwise fallback to top-level name/description
        setDetails(item.details && item.details.length > 0 
          ? item.details 
          : [{
              name: item.name || '',
              description: item.description || '',
              language: 'en',
              additionalParams: null
            }]
        );
        setType(item.type || '');
        setTags(item.tags || []);
        setCategories(item.categories || []);
        
        // Initialize dynamic additional params with existing values
        const initializedParams = AdditionalParamsService.initializeParams(item.additionalParams || undefined);
        setDynamicAdditionalParams(initializedParams);
      } else {
        // Creating new item - reset form
        setDetails([{ name: '', description: '', language: 'en', additionalParams: null }]);
        setType('');
        setTags([]);
        setCategories([]);
        
        // Initialize dynamic additional params with default values
        const initializedParams = AdditionalParamsService.initializeParams();
        setDynamicAdditionalParams(initializedParams);
      }
    }
  }, [open, item]);

  const loadAvailableOptions = async () => {
    try {
      // Load available tags
      const tagResponse = await tagApi.getAllTagNames();
      setAvailableTags(tagResponse.tags || []);

      // Load available categories (first 100)
      const categoryResponse = await categoryApi.getCategories(100, 1);
      setAvailableCategories(categoryResponse.categories || []);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const handleDetailChange = (index: number, field: keyof ItemDetailsRequest, value: string) => {
    const newDetails = [...details];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setDetails(newDetails);
  };

  const addDetail = () => {
    // Find a language that hasn't been used yet
    const usedLanguages = details.map(d => d.language);
    const availableLanguages = ['en', 'ar', 'fr'];
    const nextLanguage = availableLanguages.find(lang => !usedLanguages.includes(lang)) || 'en';
    
    setDetails([...details, { name: '', description: '', language: nextLanguage, additionalParams: null }]);
  };

  const removeDetail = (index: number) => {
    if (details.length > 1) {
      setDetails(details.filter((_, i) => i !== index));
    }
  };

  const handleDynamicParamChange = (key: string, value: any) => {
    const updatedParams = dynamicAdditionalParams.map(param => {
      if (param.key === key) {
        const config = AdditionalParamsService.getParamConfig(key);
        if (config) {
          let updatedParam = { ...param, value };
          // If an image param set to empty file, interpret as remove image (set '')
          if (config.type === 'image' && !value) updatedParam = { ...updatedParam, value: '' };
          const validation = AdditionalParamsService.validateParam(updatedParam, config);
          return {
            ...updatedParam,
            isValid: validation.isValid,
            error: validation.error
          };
        }
      }
      return param;
    });
    setDynamicAdditionalParams(updatedParams);
  };

  const handleSave = () => {
    // Validate all dynamic params before saving
    if (!AdditionalParamsService.areAllValid(dynamicAdditionalParams)) {
      return; // Don't save if validation fails
    }

    // Convert dynamic additional params to API format
    const additionalParamsObj = AdditionalParamsService.convertToApiFormat(dynamicAdditionalParams);

    console.log('ItemDialog handleSave - current tags state:', tags);
    const itemData = {
      parent: null,
      tags: tags.length > 0 ? tags : null,
      type: type.trim() || null,
      details: details.filter(d => d.name?.trim()),
      additionalParams: Object.keys(additionalParamsObj).length > 0 ? additionalParamsObj : null,
      categories: categories.length > 0 ? categories : null,
    };
    console.log('ItemDialog handleSave - final itemData:', itemData);

    onSave(itemData);
  };

  const isFormValid = () => {
    return details.some(d => d.name?.trim()) && 
           AdditionalParamsService.areAllValid(dynamicAdditionalParams);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {item ? 'Edit Item' : 'Create New Item'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Type */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Enter item type"
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12} sm={6}>
              <Autocomplete
                multiple
                freeSolo
                options={availableTags}
                value={tags}
                onChange={(_, newValue) => {
                  // Handle both string values and new user-entered values
                  // Ensure all values are strings and filter out any null/undefined values
                  console.log('Tags onChange - raw newValue:', newValue);
                  const processedTags = newValue
                    .filter(value => value != null && value !== '')
                    .map(value => typeof value === 'string' ? value : String(value));
                  console.log('Tags onChange - processed tags:', processedTags);
                  setTags(processedTags);
                }}
                filterOptions={(options, params) => {
                  const filtered = options.filter(option =>
                    option.toLowerCase().includes(params.inputValue.toLowerCase())
                  );
                  
                  // Add the current input as an option if it's not already in the list
                  const { inputValue } = params;
                  const isExisting = options.some(option => 
                    option.toLowerCase() === inputValue.toLowerCase()
                  );
                  
                  if (inputValue !== '' && !isExisting) {
                    filtered.push(inputValue);
                  }
                  
                  return filtered;
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Add tags"
                  />
                )}
              />
            </Grid>

            {/* Categories */}
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={availableCategories}
                getOptionLabel={(option) => option.name || option.guid}
                value={availableCategories.filter(cat => categories.includes(cat.guid))}
                onChange={(_, newValue) => setCategories(newValue.map(cat => cat.guid))}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name || option.guid} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categories"
                    placeholder="Select categories"
                  />
                )}
              />
            </Grid>

            {/* Details Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Item Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add multilingual names and descriptions for this item
              </Typography>
              {details.map((detail, index) => (
                <Box key={index} sx={{ 
                  mb: 2, 
                  p: 2, 
                  border: '1px solid #e0e0e0', 
                  borderRadius: 2,
                  backgroundColor: '#fafafa',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#d0d0d0'
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ 
                      fontWeight: 600,
                      color: getLanguageInfo(detail.language || 'en').color
                    }}>
                      Detail #{index + 1} - {getLanguageInfo(detail.language || 'en').name}
                    </Typography>
                    {details.length > 1 && (
                      <IconButton size="small" onClick={() => removeDetail(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={detail.name || ''}
                        onChange={(e) => handleDetailChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={detail.language || 'en'}
                          label="Language"
                          onChange={(e) => handleDetailChange(index, 'language', e.target.value)}
                        >
                          <MenuItem value="en">English (en)</MenuItem>
                          <MenuItem value="ar">Arabic (ar)</MenuItem>
                          <MenuItem value="fr">French (fr)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Description"
                        value={detail.description || ''}
                        onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addDetail}
                variant="outlined"
                size="medium"
                sx={{
                  mt: 1,
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: '#e3f2fd'
                  }
                }}
              >
                Add Another Language Detail
              </Button>
            </Grid>

            {/* Dynamic Additional Parameters */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Product Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure product-specific details and attributes
              </Typography>
              
              <Grid container spacing={2}>
                {dynamicAdditionalParams.map((param) => {
                  const config = AdditionalParamsService.getParamConfig(param.key);
                  if (!config) return null;
                  
                  return (
                    <Grid item xs={12} sm={6} key={param.key}>
                      <DynamicAdditionalParamField
                        param={param}
                        config={config}
                        onChange={handleDynamicParamChange}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!isFormValid()}
          sx={{
            backgroundColor: '#61dafb',
            color: '#000',
            '&:hover': { backgroundColor: '#4fb3d4' },
          }}
        >
          {item ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemDialog;
