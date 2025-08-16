/**
 * Consistent date formatting utilities to prevent hydration mismatches
 */

export function formatDate(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Use consistent formatting that won't vary between server and client
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      timeZone: 'UTC'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function formatDateTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid Date';
  }
}

export function formatDateISO(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (error) {
    console.error('Error formatting ISO date:', error);
    return '';
  }
}

export function formatTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    // Use UTC hours and minutes to avoid timezone issues
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}
