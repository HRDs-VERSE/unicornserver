import { BlobServiceClient } from "@azure/storage-blob";


export const deleteBlobUpload = async (blobUrl: string) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING as string
    );
    const url = new URL(blobUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    const containerName = pathParts[0];
    const blobName = pathParts.slice(1).join('/');
    
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const isDelete = await blockBlobClient.deleteIfExists();
    
    if(!isDelete.succeeded){
      return { success: false, message: `Delete failed: ${blobName}, ${isDelete.errorCode}` };
    }
    return { success: true, message: `Blob ${blobName} deleted successfully` };

  } catch (error: any) {
    console.error("Error deleting image from Azure Blob:", error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};