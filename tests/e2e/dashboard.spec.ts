import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
	test('api dashboard returns stats', async ({ request }) => {
		const res = await request.get('/api/dashboard');
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('stats');
		expect(json.stats).toHaveProperty('totalCustomers');
		expect(json.stats).toHaveProperty('activeCustomers');
		expect(json.stats).toHaveProperty('totalAppointments');
		expect(json.stats).toHaveProperty('scheduledAppointments');
		expect(json.stats).toHaveProperty('completedAppointments');
		expect(json.stats).toHaveProperty('cancelledAppointments');
		expect(json.stats).toHaveProperty('monthlyRevenue');
	});

	test('dashboard page loads correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/TalanoaAI/i);
		await expect(page.locator('main h1')).toContainText('Dashboard');
		
		// Check stats cards are present
		await expect(page.locator('text=Total Customers')).toBeVisible();
		await expect(page.locator('text=Active Customers')).toBeVisible();
		await expect(page.locator('text=Monthly Revenue')).toBeVisible();
	});
});
