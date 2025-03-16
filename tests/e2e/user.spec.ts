import { test, expect } from "@playwright/test"

const baseURL = process.env.BASE_URL || "http://localhost:50000"
const exampleUser = {
  email: "testuser@example.com",
  firstName: "Test",
  lastName: "User",
  photoUrl: "http://example.com/photo.jpg",
  role: "CUSTOMER",
}

let createdUserId = ""
let request

test.describe("User API Endpoints", () => {
  test.beforeAll(async ({ playwright }) => {
    request = await playwright.request.newContext({
      baseURL: baseURL,
    })

    try {
      const response = await request.post("/api/v1/users/register", {
        data: { email: exampleUser.email },
      })

      if (response.ok()) {
        const responseBody = await response.json()
        createdUserId = responseBody.data.id
      } else if (response.status() === 400) {
        console.log("User already exists. Using the existing user.")
        const userResponse = await request.get(`/api/v1/users?email=${exampleUser.email}`)
        if (userResponse.ok()) {
          const existingUser = await userResponse.json()
          createdUserId = existingUser.data[0].id
        } else {
          console.error("Failed to get existing user:", await userResponse.text())
        }
      } else {
        console.error("Failed to register user:", await response.text())
      }
    } catch (error) {
      console.error("Error in beforeAll:", error)
    }
  })

  test.skip("Create and verify user", async () => {
    const response = await request.post("/api/v1/users", {
      data: exampleUser,
    })

    expect(response.ok()).toBeTruthy()
    const user = await response.json()
    expect(user.data.email).toBe(exampleUser.email)
    expect(user.data.firstName).toBe(exampleUser.firstName)
    expect(user.data.lastName).toBe(exampleUser.lastName)
    expect(user.data.role).toBe(exampleUser.role)
  })

  test("Get all users", async ({ playwright }) => {
    const request = await playwright.request.newContext({
      baseURL: baseURL,
    });
  
    const response = await request.get("/api/v1/users");
    expect(response.ok()).toBeTruthy();
  
    const users = await response.json();
    console.log("users", users);
    expect(users.data.length).toBeGreaterThan(0);
  });
  
  test("Get user by ID", async () => {
    const response = await request.get(`/api/v1/users/${createdUserId}`)

    if (!response.ok()) {
      console.error("Get user by ID failed:", await response.text())
    }
    expect(response.ok()).toBeTruthy()
    const user = await response.json()
    expect(user.data.email).toBe(exampleUser.email)
  })

  test("Update user details", async () => {
    const updatedUser = { firstName: "Updated", lastName: "User" }

    const response = await request.put(`/api/v1/users/${createdUserId}`, {
      data: updatedUser,
    })

    if (!response.ok()) {
      console.error("Update user details failed:", await response.text())
    }
    expect(response.ok()).toBeTruthy()
    const user = await response.json()
    expect(user.data.firstName).toBe(updatedUser.firstName)
    expect(user.data.lastName).toBe(updatedUser.lastName)
  })

  test("Delete user", async () => {
    const response = await request.delete(`/api/v1/users/${createdUserId}`)

    if (!response.ok()) {
      console.error("Delete user failed:", await response.text())
    }
    expect(response.ok()).toBeTruthy()
    const message = await response.json()
    expect(message).toHaveProperty("message", "User deleted successfully")
  })

  test.afterAll(async () => {
    if (createdUserId) {
      await request.delete(`/api/v1/users/${createdUserId}`)
    }
    await request.dispose()
  })
})

