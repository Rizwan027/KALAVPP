import path from 'path';
import ApiError from '../utils/ApiError';
import prisma from '../config/database';
import { deleteFile, getFileUrl } from '../config/upload';

export class UploadService {
  /**
   * Upload product images
   */
  static async uploadProductImages(
    productId: string,
    userId: string,
    files: Express.Multer.File[]
  ) {
    // Verify product exists and belongs to user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        vendor: {
          userId,
        },
      },
    });

    if (!product) {
      // Clean up uploaded files
      files.forEach((file) => deleteFile(file.path));
      throw ApiError.notFound('Product not found or you do not have permission');
    }

    // Get current max display order
    const maxOrder = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const startOrder = (maxOrder?.displayOrder || 0) + 1;

    // Create image records
    const images = await Promise.all(
      files.map((file, index) =>
        prisma.productImage.create({
          data: {
            productId,
            url: getFileUrl(file.filename),
            imageUrl: getFileUrl(file.filename),
            displayOrder: startOrder + index,
          },
        })
      )
    );

    return images;
  }

  /**
   * Delete product image
   */
  static async deleteProductImage(imageId: string, userId: string) {
    // Get image with product info
    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      include: {
        product: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!image) {
      throw ApiError.notFound('Image not found');
    }

    // Check permission
    if (image.product.vendor.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this image');
    }

    // Delete file from disk
    const filename = image.imageUrl ? path.basename(image.imageUrl) : '';
    if (filename) {
      deleteFile(`uploads/${filename}`);
    }

    // Delete database record
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
  }

  /**
   * Upload service images
   */
  static async uploadServiceImages(
    serviceId: string,
    userId: string,
    files: Express.Multer.File[]
  ) {
    // Verify service exists and belongs to user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        vendor: {
          userId,
        },
      },
    });

    if (!service) {
      // Clean up uploaded files
      files.forEach((file) => deleteFile(file.path));
      throw ApiError.notFound('Service not found or you do not have permission');
    }

    // Get current max display order
    const maxOrder = await prisma.serviceImage.findFirst({
      where: { serviceId },
      orderBy: { displayOrder: 'desc' },
      select: { displayOrder: true },
    });

    const startOrder = (maxOrder?.displayOrder || 0) + 1;

    // Create image records
    const images = await Promise.all(
      files.map((file, index) =>
        prisma.serviceImage.create({
          data: {
            serviceId,
            url: getFileUrl(file.filename),
            imageUrl: getFileUrl(file.filename),
            displayOrder: startOrder + index,
          },
        })
      )
    );

    return images;
  }

  /**
   * Delete service image
   */
  static async deleteServiceImage(imageId: string, userId: string) {
    // Get image with service info
    const image = await prisma.serviceImage.findUnique({
      where: { id: imageId },
      include: {
        service: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!image) {
      throw ApiError.notFound('Image not found');
    }

    // Check permission
    if (image.service.vendor.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this image');
    }

    // Delete file from disk
    const filename = image.imageUrl ? path.basename(image.imageUrl) : '';
    if (filename) {
      deleteFile(`uploads/${filename}`);
    }

    // Delete database record
    await prisma.serviceImage.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
  }

  /**
   * Upload digital asset for product
   */
  static async uploadDigitalAsset(
    productId: string,
    userId: string,
    file: Express.Multer.File
  ) {
    // Verify product exists, belongs to user, and is DIGITAL type
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        vendor: {
          userId,
        },
        type: 'DIGITAL',
      },
    });

    if (!product) {
      // Clean up uploaded file
      deleteFile(file.path);
      throw ApiError.notFound(
        'Digital product not found or you do not have permission'
      );
    }

    // Check if digital asset already exists
    const existingAsset = await prisma.digitalAsset.findFirst({
      where: { productId },
    });

    if (existingAsset) {
      // Delete old file
      const oldFilename = path.basename(existingAsset.fileUrl);
      deleteFile(`uploads/${oldFilename}`);

      // Update existing asset
      const updatedAsset = await prisma.digitalAsset.update({
        where: { id: existingAsset.id },
        data: {
          fileName: file.originalname,
          fileUrl: getFileUrl(file.filename),
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });

      return updatedAsset;
    }

    // Create new digital asset
    const asset = await prisma.digitalAsset.create({
      data: {
        productId,
        fileName: file.originalname,
        fileUrl: getFileUrl(file.filename),
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });

    return asset;
  }

  /**
   * Delete digital asset
   */
  static async deleteDigitalAsset(assetId: string, userId: string) {
    // Get asset with product info
    const asset = await prisma.digitalAsset.findUnique({
      where: { id: assetId },
      include: {
        product: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (!asset) {
      throw ApiError.notFound('Digital asset not found');
    }

    // Check permission
    if (asset.product.vendor.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to delete this asset');
    }

    // Delete file from disk
    const filename = path.basename(asset.fileUrl);
    deleteFile(`uploads/${filename}`);

    // Delete database record
    await prisma.digitalAsset.delete({
      where: { id: assetId },
    });

    return { message: 'Digital asset deleted successfully' };
  }
}
