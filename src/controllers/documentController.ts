import { Request, Response } from 'express';
import { asyncHandler } from '../utils/errorHandler';
import Document, { DocumentStatus, DocumentType } from '../models/Document';
import { AppError } from '../utils/errorHandler';

// Upload a document
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { kycVerificationId, documentNumber } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  if (!files || !files.documentFront || !files.documentBack || !files.selfie) {
    throw new AppError('All document files are required', 400);
  }

  const documents = await Promise.all([
    // Create document for front
    Document.create({
      userId,
      kycVerificationId,
      type: DocumentType.PASSPORT,
      status: DocumentStatus.PENDING,
      fileName: files.documentFront[0].filename,
      fileUrl: `/uploads/${files.documentFront[0].filename}`,
      fileSize: files.documentFront[0].size,
      mimeType: files.documentFront[0].mimetype,
      metadata: {
        originalName: files.documentFront[0].originalname,
        uploadDate: new Date(),
        documentNumber,
      },
    }),
    // Create document for back
    Document.create({
      userId,
      kycVerificationId,
      type: DocumentType.PASSPORT,
      status: DocumentStatus.PENDING,
      fileName: files.documentBack[0].filename,
      fileUrl: `/uploads/${files.documentBack[0].filename}`,
      fileSize: files.documentBack[0].size,
      mimeType: files.documentBack[0].mimetype,
      metadata: {
        originalName: files.documentBack[0].originalname,
        uploadDate: new Date(),
        documentNumber,
      },
    }),
    // Create document for selfie
    Document.create({
      userId,
      kycVerificationId,
      type: DocumentType.SELFIE,
      status: DocumentStatus.PENDING,
      fileName: files.selfie[0].filename,
      fileUrl: `/uploads/${files.selfie[0].filename}`,
      fileSize: files.selfie[0].size,
      mimeType: files.selfie[0].mimetype,
      metadata: {
        originalName: files.selfie[0].originalname,
        uploadDate: new Date(),
      },
    }),
  ]);

  res.status(201).json({ document: documents[0] });
});

// Get a document by ID
export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await Document.findByPk(req.params.id);
  if (!document) {
    throw new AppError('Document not found', 404);
  }
  res.json({ document });
});

// List documents for a user or KYC verification
export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { userId, kycVerificationId } = req.query;
  const where: any = {};
  if (userId) where.userId = userId;
  if (kycVerificationId) where.kycVerificationId = kycVerificationId;
  const documents = await Document.findAll({ where });
  res.json({ documents });
});

// Update document status
export const updateDocumentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, verificationNotes } = req.body;
  const document = await Document.findByPk(id);
  if (!document) {
    throw new AppError('Document not found', 404);
  }
  await document.update({
    status,
    verificationNotes,
    verifiedBy: req.user!.id,
    verifiedAt: new Date(),
  });
  res.json({ document });
}); 