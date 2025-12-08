'use server';

import dbConnect from '@/lib/dbConnect';
import Appointment from '@/lib/models/Appointment';
import { revalidatePath } from 'next/cache';

export async function createAppointment(prevState: any, formData: FormData) {
  try {
    await dbConnect();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    const reason = formData.get('reason') as string;

    const appointment = await Appointment.create({
      name,
      email,
      date,
      time,
      reason,
    });

    revalidatePath('/appointment-demo'); // Adjust path as needed

    return { success: true, message: 'Appointment booked successfully!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getAppointments() {
    try {
        await dbConnect();
        const appointments = await Appointment.find({}).sort({ date: 1 });
        // Convert Mongoose docs to plain objects if necessary for Client Components
        return JSON.parse(JSON.stringify(appointments));      
    } catch (error: any) {
        console.error('Failed to fetch appointments:', error);
        return [];
    }
}
