import { itemApi } from '../services/api';
import { LinkItemsRequest, LinkItemsResponse, UnlinkItemRequest, UnlinkItemResponse } from '../types/item';

/**
 * Utility functions for linking and unlinking items
 */

/**
 * Links two items together, creating a parent-child relationship
 * @param firstItemId - UUID of the first item
 * @param secondItemId - UUID of the second item
 * @returns Promise<LinkItemsResponse> - Response containing parent info and success status
 */
export const linkTwoItems = async (
  firstItemId: string, 
  secondItemId: string
): Promise<LinkItemsResponse> => {
  try {
    const request: LinkItemsRequest = {
      firstItemId,
      secondItemId
    };

    const response = await itemApi.linkItems(request);
    
    if (response.success) {
      console.log(`Successfully linked items ${firstItemId} and ${secondItemId}`);
      console.log(`Parent ID: ${response.parentId}, Parent Created: ${response.parentCreated}`);
    } else {
      console.warn('Link operation completed but success flag is false');
    }

    return response;
  } catch (error) {
    console.error('Failed to link items:', error);
    throw error;
  }
};

/**
 * Unlinks an item from its parent
 * @param itemId - UUID of the item to unlink
 * @returns Promise<UnlinkItemResponse> - Response containing success status
 */
export const unlinkItemFromParent = async (itemId: string): Promise<UnlinkItemResponse> => {
  try {
    const request: UnlinkItemRequest = {
      itemId
    };

    const response = await itemApi.unlinkItem(request);
    
    if (response.success) {
      console.log(`Successfully unlinked item ${itemId}`);
    } else {
      console.warn('Unlink operation completed but success flag is false');
    }

    return response;
  } catch (error) {
    console.error('Failed to unlink item:', error);
    throw error;
  }
};

/**
 * Links multiple items in a chain (first -> second -> third -> ...)
 * @param itemIds - Array of item UUIDs to link in sequence
 * @returns Promise<LinkItemsResponse[]> - Array of responses for each link operation
 */
export const linkItemsInChain = async (itemIds: string[]): Promise<LinkItemsResponse[]> => {
  if (itemIds.length < 2) {
    throw new Error('At least 2 items are required to create a chain');
  }

  const responses: LinkItemsResponse[] = [];
  
  for (let i = 0; i < itemIds.length - 1; i++) {
    const response = await linkTwoItems(itemIds[i], itemIds[i + 1]);
    responses.push(response);
  }

  return responses;
};

/**
 * Unlinks multiple items from their parents
 * @param itemIds - Array of item UUIDs to unlink
 * @returns Promise<UnlinkItemResponse[]> - Array of responses for each unlink operation
 */
export const unlinkMultipleItems = async (itemIds: string[]): Promise<UnlinkItemResponse[]> => {
  const responses: UnlinkItemResponse[] = [];
  
  for (const itemId of itemIds) {
    const response = await unlinkItemFromParent(itemId);
    responses.push(response);
  }

  return responses;
};

/**
 * Validates if a string is a valid UUID format
 * @param uuid - String to validate
 * @returns boolean - True if valid UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates link request parameters
 * @param firstItemId - First item UUID
 * @param secondItemId - Second item UUID
 * @throws Error if validation fails
 */
export const validateLinkRequest = (firstItemId: string, secondItemId: string): void => {
  if (!firstItemId || !secondItemId) {
    throw new Error('Both firstItemId and secondItemId are required');
  }

  if (firstItemId === secondItemId) {
    throw new Error('Cannot link an item to itself');
  }

  if (!isValidUUID(firstItemId)) {
    throw new Error('firstItemId must be a valid UUID');
  }

  if (!isValidUUID(secondItemId)) {
    throw new Error('secondItemId must be a valid UUID');
  }
};

/**
 * Validates unlink request parameters
 * @param itemId - Item UUID to unlink
 * @throws Error if validation fails
 */
export const validateUnlinkRequest = (itemId: string): void => {
  if (!itemId) {
    throw new Error('itemId is required');
  }

  if (!isValidUUID(itemId)) {
    throw new Error('itemId must be a valid UUID');
  }
};
