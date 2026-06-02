import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL! });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PERMISSIONS = [
  { name: 'messages:create', description: 'Enviar mensajes a plataformas' },
  { name: 'messages:read',   description: 'Ver historial de mensajes propios' },
  { name: 'metrics:read',    description: 'Ver métricas de todos los usuarios (admin)' },
];

const ROLE_PERMISSIONS: Record<string, string[]> = {
  USER:  ['messages:create', 'messages:read'],
  ADMIN: ['messages:create', 'messages:read', 'metrics:read'],
};

async function seedPermissions() {
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where:  { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log('Permissions seeded');

  for (const [role, names] of Object.entries(ROLE_PERMISSIONS)) {
    for (const name of names) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { name } });
      await prisma.rolePermission.upsert({
        where:  { role_permissionId: { role: role as any, permissionId: permission.id } },
        update: {},
        create: { role: role as any, permissionId: permission.id },
      });
    }
  }
  console.log('Role permissions seeded');
}

async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { username: 'admin' } });

  if (!existing) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { username: 'admin', password: hashedPassword, role: 'ADMIN' },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }
}

async function main() {
  await seedPermissions();
  await seedAdmin();
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
