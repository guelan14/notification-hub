import prisma from '../config/prisma';

export const getAllRolePermissions = () => {
  return prisma.rolePermission.findMany({
    include: { permission: { select: { name: true } } },
  });
};
