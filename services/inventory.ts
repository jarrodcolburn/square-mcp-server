import fetch from 'node-fetch';
import { ApiMethodInfo, ApiParameter } from '../api-types.js';
import FormData from 'form-data';
import { baseUrl, apiVersion, getRequestHeaders, handleResponse } from '../config.js';
import * as fs from 'fs';
import * as path from 'path';
import { typeMap } from '../utils/type-map.js';

/**
 * Method information for each API endpoint
 */
export const InventoryMethods: { [key: string]: ApiMethodInfo } = {
  getAdjustment: {
    description: "Inventory RetrieveInventoryAdjustment operation",
    method: "get",
    path: "/v2/inventory/adjustments/{adjustment_id}",
    pathParams: [{"name":"adjustment_id","type":"string","description":"ID of the [InventoryAdjustment](entity:InventoryAdjustment) to retrieve."}],
    queryParams: [],
    requestType: "RetrieveInventoryAdjustmentRequest",
    isMultipart: false,
    originalName: "RetrieveInventoryAdjustment",
    isWrite: false
  } as ApiMethodInfo,

  batchChange: {
    description: "On success: returns the current calculated counts for all objects\nreferenced in the request.\nOn failure: returns a list of related errors.",
    method: "post",
    path: "/v2/inventory/changes/batch-create",
    pathParams: [],
    queryParams: [],
    requestType: "BatchChangeInventoryRequest",
    isMultipart: false,
    originalName: "BatchChangeInventory",
    isWrite: false
  } as ApiMethodInfo,

  batchGetchanges: {
    description: "Results are paginated and sorted in ascending order according their\n`occurred_at` timestamp (oldest first).\n\nBatchRetrieveInventoryChanges is a catch-all query endpoint for queries\nthat cannot be handled by other, simpler endpoints.",
    method: "post",
    path: "/v2/inventory/changes/batch-retrieve",
    pathParams: [],
    queryParams: [],
    requestType: "BatchRetrieveInventoryChangesRequest",
    isMultipart: false,
    originalName: "BatchRetrieveInventoryChanges",
    isWrite: false
  } as ApiMethodInfo,

  batchGetcounts: {
    description: "Results are paginated and sorted in descending order according to their\n`calculated_at` timestamp (newest first).\n\nWhen `updated_after` is specified, only counts that have changed since that\ntime (based on the server timestamp for the most recent change) are\nreturned. This allows clients to perform a \"sync\" operation, for example\nin response to receiving a Webhook notification.",
    method: "post",
    path: "/v2/inventory/counts/batch-retrieve",
    pathParams: [],
    queryParams: [],
    requestType: "BatchRetrieveInventoryCountsRequest",
    isMultipart: false,
    originalName: "BatchRetrieveInventoryCounts",
    isWrite: false
  } as ApiMethodInfo,

  getPhysicalCount: {
    description: "Inventory RetrieveInventoryPhysicalCount operation",
    method: "get",
    path: "/v2/inventory/physical-counts/{physical_count_id}",
    pathParams: [{"name":"physical_count_id","type":"string","description":"ID of the\n[InventoryPhysicalCount](entity:InventoryPhysicalCount) to retrieve."}],
    queryParams: [],
    requestType: "RetrieveInventoryPhysicalCountRequest",
    isMultipart: false,
    originalName: "RetrieveInventoryPhysicalCount",
    isWrite: false
  } as ApiMethodInfo,

  getTransfer: {
    description: "Inventory RetrieveInventoryTransfer operation",
    method: "get",
    path: "/v2/inventory/transfers/{transfer_id}",
    pathParams: [{"name":"transfer_id","type":"string","description":"ID of the [InventoryTransfer](entity:InventoryTransfer) to retrieve."}],
    queryParams: [],
    requestType: "RetrieveInventoryTransferRequest",
    isMultipart: false,
    originalName: "RetrieveInventoryTransfer",
    isWrite: false
  } as ApiMethodInfo,

  getCount: {
    description: "Responses are paginated and unsorted.\nFor more sophisticated queries, use a batch endpoint.",
    method: "get",
    path: "/v2/inventory/{catalog_object_id}",
    pathParams: [{"name":"catalog_object_id","type":"string","description":"ID of the [CatalogObject](entity:CatalogObject) to retrieve."}],
    queryParams: [{"name":"location_ids","type":"string","description":"The [Location](entity:Location) IDs to look up as a comma-separated\nlist. An empty list queries all locations."},{"name":"cursor","type":"string","description":"A pagination cursor returned by a previous call to this endpoint.\nProvide this to retrieve the next set of results for the original query.\n\nSee the [Pagination](https://developer.squareup.com/docs/working-with-apis/pagination) guide for more information."}],
    requestType: "RetrieveInventoryCountRequest",
    isMultipart: false,
    originalName: "RetrieveInventoryCount",
    isWrite: false
  } as ApiMethodInfo,

  createImage: {
    description: "Uploads an image file to be represented by a [CatalogImage](entity:CatalogImage) object that can be linked to an inventory item (CatalogItem, CatalogItemVariation, CatalogCategory, or CatalogModifierList).\n\nUse `object_id` to attach the image to an existing inventory item. Leave `object_id` empty to create an unattached image that can be linked later.\n\nAccepts HTTP multipart/form-data with a JSON part and an image file part in JPEG, PJPEG, PNG, or GIF format. Maximum file size is 15MB.",
    method: "post",
    path: "/v2/catalog/images",
    pathParams: [],
    queryParams: [],
    requestType: "CreateCatalogImageRequest",
    isMultipart: true,
    originalName: "CreateCatalogImage",
    isWrite: true
  } as ApiMethodInfo,

  updateImage: {
    description: "Uploads a new image file to replace the existing one in a [CatalogImage](entity:CatalogImage) object.\n\nThis endpoint accepts HTTP multipart/form-data with a JSON part and an image file part in JPEG, PJPEG, PNG, or GIF format. Maximum file size is 15MB.",
    method: "put",
    path: "/v2/catalog/images/{image_id}",
    pathParams: [{"name":"image_id","type":"string","description":"The ID of the `CatalogImage` object to update the encapsulated image file."}],
    queryParams: [],
    requestType: "UpdateCatalogImageRequest",
    isMultipart: true,
    originalName: "UpdateCatalogImage",
    isWrite: true
  } as ApiMethodInfo
};

/**
 * Handlers for each API endpoint
 */
export const InventoryHandlers = {
  batchChange: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.batchChange;
    
    // Simple endpoint with no path or query parameters
    const url = methodInfo.path;

    // Make regular JSON request
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: getRequestHeaders(accessToken),
      ...(Object.keys(args).length > 0 && ['post', 'put', 'patch'].includes(methodInfo.method.toLowerCase()) && { body: JSON.stringify(args) })
    });
    return await handleResponse(response)
  },

  batchGetchanges: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.batchGetchanges;
    
    // Simple endpoint with no path or query parameters
    const url = methodInfo.path;

    // Make regular JSON request
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: getRequestHeaders(accessToken),
      ...(Object.keys(args).length > 0 && ['post', 'put', 'patch'].includes(methodInfo.method.toLowerCase()) && { body: JSON.stringify(args) })
    });
    return await handleResponse(response)
  },

  batchGetcounts: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.batchGetcounts;
    
    // Simple endpoint with no path or query parameters
    const url = methodInfo.path;

    // Make regular JSON request
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: getRequestHeaders(accessToken),
      ...(Object.keys(args).length > 0 && ['post', 'put', 'patch'].includes(methodInfo.method.toLowerCase()) && { body: JSON.stringify(args) })
    });
    return await handleResponse(response)
  },

  getAdjustment: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.getAdjustment;
    
    // Extract path parameters
    const pathParams: Record<string, string> = {};
    methodInfo.pathParams.forEach(param => {
      const value = args[param.name];
      if (value !== undefined) {
        pathParams[param.name] = String(value);
        delete args[param.name];
      } else if (param.required) {
        throw new Error(`Missing required path parameter: ${param.name}`);
      }
    });

    // Build URL with path parameters
    let url = methodInfo.path;
    
    // Replace path parameters
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Make regular JSON request
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: getRequestHeaders(accessToken),
      ...(Object.keys(args).length > 0 && ['post', 'put', 'patch'].includes(methodInfo.method.toLowerCase()) && { body: JSON.stringify(args) })
    });
    return await handleResponse(response)
  },

  getPhysicalCount: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.getPhysicalCount;
    
    // Extract path parameters
    const pathParams: Record<string, string> = {};
    methodInfo.pathParams.forEach(param => {
      const value = args[param.name];
      if (value !== undefined) {
        pathParams[param.name] = String(value);
        delete args[param.name];
      } else if (param.required) {
        throw new Error(`Missing required path parameter: ${param.name}`);
      }
    });

    // Build URL with path parameters
    let url = methodInfo.path;
    
    // Replace path parameters
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Make regular JSON request
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: getRequestHeaders(accessToken),
      ...(Object.keys(args).length > 0 && ['post', 'put', 'patch'].includes(methodInfo.method.toLowerCase()) && { body: JSON.stringify(args) })
    });
    return await handleResponse(response)
  },

  getTransfer: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.getTransfer;
    
    // Extract path parameters
    const pathParams: Record<string, string> = {};
    methodInfo.pathParams.forEach(param => {
      const value = args[param.name];
      if (value !== undefined) {
        pathParams[param.name] = String(value);
        delete args[param.name];
      } else if (param.required) {
        throw new Error(`Missing required path parameter: ${param.name}`);
      }
    });

    // Build URL with path parameters
    let url = methodInfo.path;
    
    // Replace path parameters
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Make regular JSON request
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: getRequestHeaders(accessToken),
      ...(Object.keys(args).length > 0 && ['post', 'put', 'patch'].includes(methodInfo.method.toLowerCase()) && { body: JSON.stringify(args) })
    });
    return await handleResponse(response)
  },

  getCount: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.getCount;

    // Extract path parameters
    const pathParams: Record<string, string> = {};
    methodInfo.pathParams.forEach(param => {
      const value = args[param.name];
      if (value !== undefined) {
        pathParams[param.name] = String(value);
        delete args[param.name];
      } else if (param.required) {
        throw new Error(`Missing required path parameter: ${param.name}`);
      }
    });

    // Extract query parameters
    const queryParams: Record<string, string> = {};
    methodInfo.queryParams.forEach(param => {
      const value = args[param.name];
      if (value !== undefined) {
        queryParams[param.name] = String(value);
        delete args[param.name];
      }
    });

    // Build URL with path and query parameters
    let url = methodInfo.path;

    // Replace path parameters
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Add query parameters
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    if (queryString) {
      url = `${url}?${queryString}`;
    }

    // Make regular JSON request
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: getRequestHeaders(accessToken),
      ...(Object.keys(args).length > 0 && ['post', 'put', 'patch'].includes(methodInfo.method.toLowerCase()) && { body: JSON.stringify(args) })
    });
    return await handleResponse(response)
  },

  createImage: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.createImage;
    const url = methodInfo.path;

    // Handle multipart form data request
    const formData = new FormData();

    // Get file fields from type map
    const typeInfo = typeMap[methodInfo.requestType];
    const mainType = typeInfo.find((t: { name: string; properties: Array<{ name: string; isFile?: boolean }> }) => t.name === methodInfo.requestType);
    const fileFields = mainType?.properties.filter((p: { isFile?: boolean }) => p.isFile).map((p: { name: string }) => p.name) || [];

    // Add the JSON part, excluding file fields but preserving 'image' metadata
    const jsonData = { ...args };
    const imageField = jsonData.image;
    fileFields.forEach(field => delete jsonData[field]);
    if (imageField !== undefined) {
      jsonData.image = imageField;
    }
    formData.append('request', JSON.stringify(jsonData), {
      contentType: 'application/json'
    });

    // Handle file fields
    for (const field of fileFields) {
      const filePath = args[field];
      if (filePath) {
        if (typeof filePath !== 'string') {
          throw new Error(`Expected file path string for field '${field}', got ${typeof filePath}`);
        }
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found at path: ${filePath}`);
        }
        const fileName = path.basename(filePath);
        const fileExt = path.extname(filePath).toLowerCase();
        const fileStream = fs.createReadStream(filePath);
        let contentType = 'application/octet-stream';
        if (['.jpg', '.jpeg'].includes(fileExt)) {
          contentType = 'image/jpeg';
        } else if (fileExt === '.png') {
          contentType = 'image/png';
        } else if (fileExt === '.gif') {
          contentType = 'image/gif';
        }
        formData.append('image_file', fileStream, {
          filename: fileName,
          contentType
        });
      }
    }

    const boundary = formData.getBoundary();
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: {
        ...getRequestHeaders(accessToken),
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formData
    });
    return await handleResponse(response)
  },

  updateImage: async (accessToken: string, args: Record<string, unknown>) => {
    const methodInfo = InventoryMethods.updateImage;

    // Extract path parameters
    const pathParams: Record<string, string> = {};
    methodInfo.pathParams.forEach(param => {
      const value = args[param.name];
      if (value !== undefined) {
        pathParams[param.name] = String(value);
        delete args[param.name];
      } else if (param.required) {
        throw new Error(`Missing required path parameter: ${param.name}`);
      }
    });

    // Build URL with path parameters
    let url = methodInfo.path;
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    });

    // Handle multipart form data request
    const formData = new FormData();

    // Get file fields from type map
    const typeInfo = typeMap[methodInfo.requestType];
    const mainType = typeInfo.find((t: { name: string; properties: Array<{ name: string; isFile?: boolean }> }) => t.name === methodInfo.requestType);
    const fileFields = mainType?.properties.filter((p: { isFile?: boolean }) => p.isFile).map((p: { name: string }) => p.name) || [];

    // Add the JSON part, excluding file fields but preserving 'image' metadata
    const jsonData = { ...args };
    const imageField = jsonData.image;
    fileFields.forEach(field => delete jsonData[field]);
    if (imageField !== undefined) {
      jsonData.image = imageField;
    }
    formData.append('request', JSON.stringify(jsonData), {
      contentType: 'application/json'
    });

    // Handle file fields
    for (const field of fileFields) {
      const filePath = args[field];
      if (filePath) {
        if (typeof filePath !== 'string') {
          throw new Error(`Expected file path string for field '${field}', got ${typeof filePath}`);
        }
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found at path: ${filePath}`);
        }
        const fileName = path.basename(filePath);
        const fileExt = path.extname(filePath).toLowerCase();
        const fileStream = fs.createReadStream(filePath);
        let contentType = 'application/octet-stream';
        if (['.jpg', '.jpeg'].includes(fileExt)) {
          contentType = 'image/jpeg';
        } else if (fileExt === '.png') {
          contentType = 'image/png';
        } else if (fileExt === '.gif') {
          contentType = 'image/gif';
        }
        formData.append('image_file', fileStream, {
          filename: fileName,
          contentType
        });
      }
    }

    const boundary = formData.getBoundary();
    const response = await fetch(`${baseUrl}${url}`, {
      method: methodInfo.method.toUpperCase(),
      headers: {
        ...getRequestHeaders(accessToken),
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formData
    });
    return await handleResponse(response)
  }
};