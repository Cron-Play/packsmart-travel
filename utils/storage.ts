
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripTemplate } from '@/types/packing';

const TEMPLATES_KEY = '@packsmart_templates';

export async function saveTemplates(templates: TripTemplate[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(templates);
    await AsyncStorage.setItem(TEMPLATES_KEY, jsonValue);
    console.log('Templates saved successfully:', templates.length);
  } catch (error) {
    console.error('Error saving templates:', error);
    throw error;
  }
}

export async function loadTemplates(): Promise<TripTemplate[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(TEMPLATES_KEY);
    if (jsonValue !== null) {
      const templates = JSON.parse(jsonValue);
      console.log('Templates loaded successfully:', templates.length);
      return templates;
    }
    console.log('No templates found, returning empty array');
    return [];
  } catch (error) {
    console.error('Error loading templates:', error);
    return [];
  }
}

export async function deleteTemplate(templateId: string): Promise<void> {
  try {
    const templates = await loadTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    await saveTemplates(filteredTemplates);
    console.log('Template deleted successfully:', templateId);
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}
