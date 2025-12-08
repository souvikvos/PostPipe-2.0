import mongoose, { Document, Model } from 'mongoose';

export interface IAppointment extends Document {
  name: string;
  email: string;
  date: Date;
  time: string;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

const AppointmentSchema = new mongoose.Schema<IAppointment>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [60, 'Name cannot be more than 60 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email',
    ],
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date'],
  },
  time: {
    type: String,
    required: [true, 'Please provide a time'],
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason'],
    maxlength: [500, 'Reason cannot be more than 500 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Avoid OverwriteModelError upon hot reload in development
const Appointment = (mongoose.models.Appointment as Model<IAppointment>) || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;
