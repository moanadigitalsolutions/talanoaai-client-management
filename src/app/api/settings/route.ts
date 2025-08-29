import { NextRequest, NextResponse } from 'next/server';
import { settingsQueries } from '@/lib/database';
import { settingSchema, bulkSettingsSchema, parseOrError } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const key = url.searchParams.get('key');

    if (key) {
      const setting = settingsQueries.get(key);
      return NextResponse.json(setting);
    }

    if (category) {
      const settings = settingsQueries.getByCategory(category);
      return NextResponse.json(settings);
    }

    const allSettings = settingsQueries.getAll();
    return NextResponse.json(allSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
  const parsed = parseOrError(settingSchema, body);
  if ('error' in parsed) return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 });
  const { key, value, category } = parsed.data;

    if (!key || value === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields: key, value, category' }, { status: 400 });
    }

    settingsQueries.set(key, String(value), category);
    
    const updatedSetting = settingsQueries.get(key);
    return NextResponse.json(updatedSetting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
  const parsed = parseOrError(bulkSettingsSchema, body);
  if ('error' in parsed) return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 });
  const { settings } = parsed.data;

    // Update multiple settings in a transaction-like manner
    for (const setting of settings) {
      const { key, value, category } = setting;
      if (key && value !== undefined && category) {
        settingsQueries.set(key, String(value), category);
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
