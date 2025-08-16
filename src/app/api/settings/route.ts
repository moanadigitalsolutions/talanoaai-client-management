import { NextRequest, NextResponse } from 'next/server';
import { settingsQueries, timeSlotQueries } from '@/lib/database';

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
    const { key, value, category } = body;

    if (!key || value === undefined || !category) {
      return NextResponse.json({ error: 'Missing required fields: key, value, category' }, { status: 400 });
    }

    settingsQueries.set(key, value, category);
    
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
    const { settings } = body;

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings must be an array' }, { status: 400 });
    }

    // Update multiple settings in a transaction-like manner
    for (const setting of settings) {
      const { key, value, category } = setting;
      if (key && value !== undefined && category) {
        settingsQueries.set(key, value, category);
        
        // Special handling for default duration changes
        if (key === 'defaultDuration') {
          const newDuration = parseInt(value);
          if (!isNaN(newDuration) && newDuration > 0) {
            // Update all available time slots to use the new default duration
            timeSlotQueries.updateAllAvailableDurations(newDuration);
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
