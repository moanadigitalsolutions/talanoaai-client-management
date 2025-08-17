import { test, expect } from '@playwright/test';

test.describe('Customers CRUD', () => {
	const testCustomer = {
		firstName: 'Test',
		lastName: 'Customer',
		email: `test${Date.now()}@example.com`,
		mobile: '(555) 123-4567',
		status: 'active'
	};

	let customerId: string;

	test('create customer via API', async ({ request }) => {
		const res = await request.post('/api/customers', {
			data: testCustomer
		});
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('id');
		customerId = json.id;
	});

	test('get customers list', async ({ request }) => {
		const res = await request.get('/api/customers');
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('data');
		expect(Array.isArray(json.data)).toBeTruthy();
	});

	test('get customer by ID', async ({ request }) => {
		if (!customerId) test.skip();
		const res = await request.get(`/api/customers/${customerId}`);
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('customer');
		expect(json.customer.email).toBe(testCustomer.email);
	});

	test('update customer', async ({ request }) => {
		if (!customerId) test.skip();
		const updateData = { ...testCustomer, firstName: 'Updated' };
		const res = await request.put(`/api/customers/${customerId}`, {
			data: updateData
		});
		expect(res.ok()).toBeTruthy();
	});

	test('customers page loads and displays list', async ({ page }) => {
		await page.goto('/customers');
		await expect(page).toHaveTitle(/TalanoaAI/i);
		await expect(page.locator('main h1')).toContainText('Customers');
		
		// Check table headers - using exact text match
		await expect(page.locator('th:has-text("Customer ID")')).toBeVisible();
		await expect(page.locator('th:has-text("Email")')).toBeVisible();
		await expect(page.locator('th:has-text("Status")')).toBeVisible();
	});

	test('delete customer', async ({ request }) => {
		if (!customerId) test.skip();
		const res = await request.delete(`/api/customers/${customerId}`);
		expect(res.ok()).toBeTruthy();
	});
});
