
import { createPropertyHandler, fetchPropertiesHandler } from '../src/plugins/propertyRoutePlugin';
import { PrismaClient } from '@prisma/client';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { IProperty } from '../src/types/property';

describe('Property Handlers', () => {
    let prisma: PrismaClient;
    let request: Request;
    let h: ResponseToolkit;

    const mockPayload: IProperty = {
        id: 'property123',
        name: 'Test Property',
        description: 'A test property', // Ensure this is a string or null
        price: {
            houseRent: 1000,
            electricityFee: 50,
            damageFee: 100,
            otherFee: 50,
            total: 1200,
        },
        location: 'Test Location',
        category: {
            name: 'Test Category',
            description: 'A test category', // Ensure this is a string or null
        },
        owner: {
            userId: 'owner123',
            name: 'Test Owner',
        },
        agent: {
            userId: 'agent123',
            name: 'Test Agent',
        },
        buildingInfo: {
            facilities: ['Pool', 'Gym'],
            numberOfFloors: 5,
            parkingSpaces: 10,
        },
        reviews: [],
        images: [],
        imageIds: [], // Ensure this field is included
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        prisma = new PrismaClient();
        request = {
            server: {
                app: { prisma },
            },
            payload: mockPayload,
        } as unknown as Request;

        h = {
            response: jest.fn().mockReturnThis(),
            code: jest.fn().mockReturnThis(),
        } as unknown as ResponseToolkit;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a property', async () => {
        const mockCreate = jest.spyOn(prisma.property, 'create').mockResolvedValue(mockPayload);

        await createPropertyHandler(request, h);

        expect(mockCreate).toHaveBeenCalledWith({
            data: {
                ...mockPayload,
                buildingInfo: {
                    facilities: ['Pool', 'Gym'],
                    numberOfFloors: 5,
                    parkingSpaces: 10,
                },
            },
        });

        expect(h.response).toHaveBeenCalledWith({
            version: '1.0.0',
            data: mockPayload,
        });
        expect(h.code).toHaveBeenCalledWith(201);
    });

    it('should fetch properties', async () => {
        const mockFindMany = jest.spyOn(prisma.property, 'findMany').mockResolvedValue([mockPayload]);

        await fetchPropertiesHandler(request, h);

        expect(mockFindMany).toHaveBeenCalledWith({
            include: {
                reviews: true,
                images: true,
            },
        });

        expect(h.response).toHaveBeenCalledWith({
            version: '1.0.0',
            data: [mockPayload],
        });
        expect(h.code).toHaveBeenCalledWith(200);
    });
});