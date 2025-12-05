'use server';

import { z } from 'zod';
// import dbConnect from '@/connectors/mongodb'; // Example import

const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10),
});

export async function submitForm(prevState: any, formData: FormData) {
  const data = {
    email: formData.get('email'),
    message: formData.get('message'),
  };

  const validated = schema.safeParse(data);

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  try {
    // await dbConnect();
    // Save to DB
    console.log('Server Action received:', validated.data);
    return { success: true, message: 'Saved successfully!' };
  } catch (e) {
    return { success: false, message: 'Database error' };
  }
}
