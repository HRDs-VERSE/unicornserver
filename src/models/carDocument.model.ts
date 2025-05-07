import mongoose, { Document, Schema } from 'mongoose';

// FileObject for rc, insurance, and pollutionPaper
interface FileObject {
  url: string;
}

// CarPhotoObject with an array of URLs
interface CarPhotoObject {
  url: string[];
}

// Full document interface
export interface IDocuments extends Document {
  userId: Schema.Types.ObjectId;
  drivingLicense: string[];
  rc: FileObject[];
  insurance: FileObject[];
  addhar: string[];
  pollutionPaper: FileObject[];
  carPhoto: CarPhotoObject[];
}

const FileObjectSchema = new Schema<FileObject>(
  {
    url: { type: String, required: true },
  },
  { _id: false }
);

const CarPhotoSchema = new Schema<CarPhotoObject>(
  {
    url: {
      type: [String],
      required: true,
    },
  },
  { _id: false }
);

const carDocumentSchema = new Schema<IDocuments>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    drivingLicense: {
      type: [String],
      default: [],
    },
    rc: {
      type: [FileObjectSchema],
      default: [],
    },
    insurance: {
      type: [FileObjectSchema],
      default: [],
    },
    addhar: {
      type: [String],
      default: [],
    },
    pollutionPaper: {
      type: [FileObjectSchema],
      default: [],
    },
    carPhoto: {
      type: [CarPhotoSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Export the model
const CarDocument = mongoose.model<IDocuments>('CarDocument', carDocumentSchema);
export default CarDocument;
