import { test, expect } from '@playwright/test';

test.describe('Activity Notes CRUD', () => {
	let testCustomerId: string;
	let testNoteId: string;

	test.beforeAll(async ({ request }) => {
		// Create a test customer for notes
		const customerRes = await request.post('/api/customers', {
			data: {
				firstName: 'Notes',
				lastName: 'Test',
				email: `notes${Date.now()}@example.com`,
				mobile: '(555) 888-8888',
				status: 'active'
			}
		});
		const customerJson = await customerRes.json();
		testCustomerId = customerJson.id;
	});

	test('create activity note', async ({ request }) => {
		if (!testCustomerId) test.skip();
		
		const noteData = {
			customerId: testCustomerId,
			type: 'meeting',
			description: 'Test activity note from automated test',
			date: '2025-08-17',
			time: '14:30'
		};

		const res = await request.post('/api/activity-notes', { data: noteData });
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('id');
		testNoteId = json.id;
	});

	test('get activity notes by customer', async ({ request }) => {
		if (!testCustomerId) test.skip();
		
		const res = await request.get(`/api/activity-notes?customerId=${testCustomerId}`);
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('notes');
		expect(Array.isArray(json.notes)).toBeTruthy();
	});

	test('delete activity note', async ({ request }) => {
		if (!testNoteId) test.skip();
		
		const res = await request.delete(`/api/activity-notes?id=${testNoteId}`);
		expect(res.ok()).toBeTruthy();
	});

	test.afterAll(async ({ request }) => {
		// Cleanup test customer
		if (testCustomerId) {
			await request.delete(`/api/customers/${testCustomerId}`);
		}
	});
});

test.describe('Documents CRUD', () => {
	let testCustomerId: string;
	let testDocId: string;

	test.beforeAll(async ({ request }) => {
		// Create a test customer for documents
		const customerRes = await request.post('/api/customers', {
			data: {
				firstName: 'Docs',
				lastName: 'Test',
				email: `docs${Date.now()}@example.com`,
				mobile: '(555) 777-7777',
				status: 'active'
			}
		});
		const customerJson = await customerRes.json();
		testCustomerId = customerJson.id;
	});

	test('create document', async ({ request }) => {
		if (!testCustomerId) test.skip();
		
		const docData = {
			customerId: testCustomerId,
			name: 'test-document.pdf',
			size: '125 KB',
			filePath: '/uploads/test-document.pdf'
		};

		const res = await request.post('/api/documents', { data: docData });
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('id');
		testDocId = json.id;
	});

	test('get documents by customer', async ({ request }) => {
		if (!testCustomerId) test.skip();
		
		const res = await request.get(`/api/documents?customerId=${testCustomerId}`);
		expect(res.ok()).toBeTruthy();
		const json = await res.json();
		expect(json).toHaveProperty('documents');
		expect(Array.isArray(json.documents)).toBeTruthy();
	});

	test('delete document', async ({ request }) => {
		if (!testDocId) test.skip();
		
		const res = await request.delete(`/api/documents?id=${testDocId}`);
		expect(res.ok()).toBeTruthy();
	});

	test.afterAll(async ({ request }) => {
		// Cleanup test customer
		if (testCustomerId) {
			await request.delete(`/api/customers/${testCustomerId}`);
		}
	});
});
