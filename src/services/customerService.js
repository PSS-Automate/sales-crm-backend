const { prisma } = require('../config/database');

const customerService = {
  async getAll({ page = 1, limit = 10, search = null }) {
    const skip = (page - 1) * limit;
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    } : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  async getById(id) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        appointments: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            services: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                    price: true
                  }
                }
              }
            }
          },
          orderBy: { date: 'desc' },
          take: 10
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
  },

  async create(data) {
    return prisma.customer.create({
      data: {
        ...data,
        loyaltyPoints: 0,
        totalVisits: 0
      }
    });
  },

  async update(id, data) {
    try {
      return await prisma.customer.update({
        where: { id },
        data
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      await prisma.customer.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  },

  async updateLoyaltyPoints(id, points) {
    return prisma.customer.update({
      where: { id },
      data: {
        loyaltyPoints: {
          increment: points
        }
      }
    });
  },

  async incrementVisitCount(id) {
    return prisma.customer.update({
      where: { id },
      data: {
        totalVisits: {
          increment: 1
        },
        lastVisit: new Date()
      }
    });
  }
};

module.exports = { customerService };
