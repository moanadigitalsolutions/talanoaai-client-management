import { test, expect } from '@playwright/test';

test.describe('Booking System', () => {
	let testCustomerId: string;
	let testSlotId: string;
	let testAppointmentId: string;

	test.beforeAll(async ({ request }) => {
		// Create a test customer for bookings
		const customerRes = await request.post('/api/customers', {
			data: {
				firstName: 'Booking',
				lastName: 'Test',
				email: `booking${Date.now()}@example.com`,
				mobile: '(555) 999-9999',
				status: 'active'
			}
		});
		const customerJson = await customerRes.json();
		testCustomerId = customerJson.id;
	});

	test('time slots API returns schedule', async ({ request }) => {
		const res = await request.get('/api/time-slots');
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('days');
		expect(json).toHaveProperty('weekOffset');
		expect(Array.isArray(json.days)).toBeTruthy();
		
		// Find an available slot for testing
		const availableSlot = json.days
			.flatMap((day: any) => day.timeSlots)
			.find((slot: any) => slot.isAvailable);
		if (availableSlot) {
			testSlotId = availableSlot.id;
		}
	});

	test('create new time slot template', async ({ request }) => {
		const newSlot = {
			day: 'Monday',
			time: '17:00',
			duration: 45
		};
		const res = await request.post('/api/time-slots', { data: newSlot });
		expect(res.ok()).toBeTruthy();
	});

	test('create appointment', async ({ request }) => {
		if (!testCustomerId) test.skip();
		
		const appointment = {
			customerId: testCustomerId,
			title: 'Test Appointment',
			description: 'Automated test booking',
			date: '2025-08-18',
			time: '10:00',
			duration: 60,
			status: 'scheduled',
			service: 'Test Service',
			timeSlotId: testSlotId
		};

		const res = await request.post('/api/appointments', { data: appointment });
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('id');
		testAppointmentId = json.id;
	});

	test('get appointments list', async ({ request }) => {
		const res = await request.get('/api/appointments');
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(Array.isArray(json)).toBeTruthy();
	});

	test('update appointment', async ({ request }) => {
		if (!testAppointmentId) test.skip();
		
		const updateData = {
			customerId: testCustomerId,
			title: 'Updated Test Appointment',
			description: 'Updated description',
			date: '2025-08-18',
			time: '10:00',
			duration: 90,
			status: 'scheduled',
			service: 'Updated Service'
		};

		const res = await request.put(`/api/appointments/${testAppointmentId}`, {
			data: updateData
		});
		expect(res.ok()).toBeTruthy();
	});

	test('booking page loads correctly', async ({ page }) => {
		await page.goto('/booking');
		await expect(page).toHaveTitle(/TalanoaAI/i);
		await expect(page.locator('main h1')).toContainText('Booking Schedule');
		
		// Check week navigation buttons
		await expect(page.locator('text=Prev Week')).toBeVisible();
		await expect(page.locator('text=This Week')).toBeVisible();
		await expect(page.locator('text=Next Week')).toBeVisible();
		await expect(page.locator('text=Add Slot')).toBeVisible();
		await expect(page.locator('button:has-text("Manage")')).toBeVisible();
	});

	test('manage mode toggle works', async ({ page }) => {
		await page.goto('/booking');
		
		// Wait for page to load first
		await expect(page.locator('main h1')).toContainText('Booking Schedule');
		
		// Click Manage button
		await page.click('button:has-text("Manage")');
		await expect(page.locator('button:has-text("Done")')).toBeVisible();
		
		// Click Done to exit manage mode
		await page.click('button:has-text("Done")');
		await expect(page.locator('button:has-text("Manage")')).toBeVisible();
	});

	test('add slot form works', async ({ page }) => {
		await page.goto('/booking');
		
		// Wait for page to load
		await expect(page.locator('main h1')).toContainText('Booking Schedule');
		
		// Click Add Slot
		await page.click('button:has-text("Add Slot")');
		await expect(page.locator('label:has-text("Day")')).toBeVisible();
		await expect(page.locator('label:has-text("Time")')).toBeVisible();
		await expect(page.locator('label:has-text("Duration")')).toBeVisible();
		
		// Cancel adding slot
		await page.click('button:has-text("Cancel")');
	});

	test('delete appointment', async ({ request }) => {
		if (!testAppointmentId) test.skip();
		
		const res = await request.delete(`/api/appointments/${testAppointmentId}`);
		expect(res.ok()).toBeTruthy();
	});

	test('delete time slot template', async ({ request }) => {
		// Create a slot to delete
		const newSlot = {
			day: 'Friday',
			time: '18:00',
			duration: 30
		};
		await request.post('/api/time-slots', { data: newSlot });
		
		// Get the slot ID (matches createIfNotExists pattern: slot_${day}_${time} with special chars as _)
		const slotId = 'slot_Friday_18_00';
		const res = await request.delete(`/api/time-slots?id=${encodeURIComponent(slotId)}`);
		expect(res.ok()).toBeTruthy();
	});

	test.afterAll(async ({ request }) => {
		// Cleanup test customer
		if (testCustomerId) {
			await request.delete(`/api/customers/${testCustomerId}`);
		}
	});
});
