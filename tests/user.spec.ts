import { test, expect, request } from '@playwright/test';

const baseURL = process.env.BASE_URL;
const exampleUser = {
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    photoUrl: 'http://example.com/photo.jpg',
    role: 'CUSTOMER',
};

let createdUserId: string = '';

test.describe('User API Endpoints', () => {
    test.beforeAll(async () => {
        // Create the user if it doesn't exist already
        const response = await request.post(`${baseURL}/api/v1/users/register`, {
            data: { email: exampleUser.email },
        });

        if (response.status() === 201) {
            // If the user is created successfully, save their ID for later use
            const responseBody = await response.json();
            createdUserId = responseBody.data.id;
        } else if (response.status() === 400) {
            // If the user already exists, use the existing user
            console.log('User already exists. Using the existing user.');
            const userResponse = await request.get(`${baseURL}/api/v1/users?email=${exampleUser.email}`);
            const existingUser = await userResponse.json();
            createdUserId = existingUser.data[0].id;
        }
    });

    test.skip('Create and verify user', async () => {
        const response = await request.post(`${baseURL}/api/v1/users`, {
            data: {
                ...exampleUser,
            },
        });

        expect(response.status()).toBe(201);
        const user = await response.json();
        expect(user.data.email).toBe(exampleUser.email);
        expect(user.data.firstName).toBe(exampleUser.firstName);
        expect(user.data.lastName).toBe(exampleUser.lastName);
        expect(user.data.role).toBe(exampleUser.role);
    });

    test('Get all users', async () => {
        const response = await request.get(`${baseURL}/api/v1/users`);

        expect(response.status()).toBe(200);
        const users = await response.json();
        console.log('users', users);
        expect(users.data.length).toBeGreaterThan(0);
        expect(users.data.some((user) => user.email === exampleUser.email)).toBeTruthy();
    });

    test('Get user by ID', async () => {
        const response = await request.get(`${baseURL}/api/v1/users/${createdUserId}`);

        expect(response.status()).toBe(200);
        const user = await response.json();
        expect(user.data.email).toBe(exampleUser.email);
        expect(user.data.firstName).toBe(exampleUser.firstName);
    });

    test('Update user details', async () => {
        const updatedUser = { firstName: 'Updated', lastName: 'User' };

        const response = await request.put(`${baseURL}/api/v1/users/${createdUserId}`, {
            data: updatedUser,
        });

        expect(response.status()).toBe(200);
        const user = await response.json();
        expect(user.data.firstName).toBe(updatedUser.firstName);
        expect(user.data.lastName).toBe(updatedUser.lastName);
    });

    test('Delete user', async () => {
        const response = await request.delete(`${baseURL}/api/v1/users/${createdUserId}`);

        expect(response.status()).toBe(200);
        const message = await response.json();
        expect(message).toHaveProperty('message', 'User deleted successfully');
    });

    test.afterAll(async () => {
        // Optionally, clean up after tests if required (delete user)
        await request.delete(`${baseURL}/api/v1/users/${createdUserId}`);
    });
});
