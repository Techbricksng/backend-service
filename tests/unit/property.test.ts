import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createPropertyHandler, fetchPropertiesHandler } from '../../src/plugins/propertyRoutePlugin';
import { ResponseToolkit } from '@hapi/hapi';

let mongoServer: MongoMemoryServer;
let client: MongoClient;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create(); // Start in-memory MongoDB server
    const uri = mongoServer.getUri(); // Get the connection URI
    client = new MongoClient(uri);
    await client.connect(); // Connect to the in-memory database
});

afterAll(async () => {
    await client.close(); // Close the connection
    await mongoServer.stop(); // Stop the in-memory server
});

describe('Property CRUD Operations', () => {
    it('should create a property', async () => {
        const mockRequest = {
            payload: {
                name: 'Test Property',
                description: 'Test Description',
                price: {
                    houseRent: 1000,
                    electricityFee: 100,
                    damageFee: 50,
                    otherFee: 20,
                    total: 1170,
                },
                location: 'Test Location',
                category: { name: 'Test Category', description: 'Test Category Description' },
                owner: { userId: '123', name: 'Test Owner' },
                agent: { userId: '456', name: 'Test Agent' },
                buildingInfo: {
                    facilities: ['Pool', 'Gym'],
                    numberOfFloors: 5,
                    parkingSpaces: 10,
                },
            },
            server: {
                app: {
                    prisma: {
                        property: {
                            create: jest.fn().mockResolvedValue({
                                id: '1',
                                name: 'Test Property',
                                description: 'Test Description',
                                price: {
                                    houseRent: 1000,
                                    electricityFee: 100,
                                    damageFee: 50,
                                    otherFee: 20,
                                    total: 1170,
                                },
                                location: 'Test Location',
                                category: { name: 'Test Category', description: 'Test Category Description' },
                                owner: { userId: '123', name: 'Test Owner' },
                                agent: { userId: '456', name: 'Test Agent' },
                                buildingInfo: {
                                    facilities: ['Pool', 'Gym'],
                                    numberOfFloors: 5,
                                    parkingSpaces: 10,
                                },
                                reviews: [],
                                images: [],
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            }),
                        },
                    },
                },
            },
        };

        const mockResponse = {
            response: (data: any) => ({
                code: (status: number) => ({ ...data, statusCode: status }),
            }),
        } as unknown as ResponseToolkit;

        const result = await createPropertyHandler(mockRequest as any, mockResponse);
        expect(result.statusCode).toBe(201);
        expect((result as any).data.name).toBe('Test Property'); // Access data directly from the result
    });

    it('should fetch properties with filters', async () => {
        const mockRequest = {
            query: {
                location: 'Test Location',
                minPrice: 1000,
                maxPrice: 2000,
                sortBy: 'price',
                order: 'asc',
            },
            server: {
                app: {
                    prisma: {
                        property: {
                            findMany: jest.fn().mockResolvedValue([
                                {
                                    id: '1',
                                    name: 'Test Property',
                                    description: 'Test Description',
                                    price: {
                                        houseRent: 1000,
                                        electricityFee: 100,
                                        damageFee: 50,
                                        otherFee: 20,
                                        total: 1170,
                                    },
                                    location: 'Test Location',
                                    category: { name: 'Test Category', description: 'Test Category Description' },
                                    owner: { userId: '123', name: 'Test Owner' },
                                    agent: { userId: '456', name: 'Test Agent' },
                                    buildingInfo: {
                                        facilities: ['Pool', 'Gym'],
                                        numberOfFloors: 5,
                                        parkingSpaces: 10,
                                    },
                                    reviews: [],
                                    images: [],
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                },
                            ]),
                        },
                    },
                },
            },
        };

        const mockResponse = {
            response: (data: any) => ({
                code: (status: number) => ({ ...data, statusCode: status }),
            }),
        } as unknown as ResponseToolkit;

        const result = await fetchPropertiesHandler(mockRequest as any, mockResponse);
        expect(result.statusCode).toBe(200);
        expect(Array.isArray((result as any).data)).toBe(true); // Access data directly from the result
    });
});