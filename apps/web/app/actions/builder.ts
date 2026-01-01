'use server';

import { createForm, getConnectors, addDatabaseToConnector } from '../../lib/server-db';

export async function createFormAction(formData: FormData) {
  const name = formData.get('name') as string;
  const connectorId = formData.get('connectorId') as string;
  const targetDb = formData.get('targetDb') as string;
  const fieldsJson = formData.get('fields') as string;

  if (!name || !connectorId) {
    return { error: 'Name and Connector are required' };
  }

  let fields = [];
  try {
      fields = JSON.parse(fieldsJson);
  } catch (e) {
      return { error: 'Invalid fields data' };
  }

  try {
     const form = await createForm(connectorId, name, fields, targetDb);
     return { success: true, formId: form.id };
  } catch (e) {
      return { error: 'Failed to create form' };
  }
}

export async function getConnectorsAction() {
    return await getConnectors();
}

export async function addDatabaseAction(connectorId: string, dbId: string) {
    if (!connectorId || !dbId) return { error: 'Missing Data' };
    try {
        await addDatabaseToConnector(connectorId, dbId);
        return { success: true };
    } catch (e) {
        return { error: 'Failed to add database' };
    }
}
