const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../db');

// Clave secreta para firmar los tokens (Se lee del .env o usa una por defecto)
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_universitaria_2026';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '4h';

async function qRawUnsafe(sql, ...params) {
    try {
        return await prisma.$queryRawUnsafe(sql, ...params);
    } catch (e) {
        console.error('qRawUnsafe failed SQL:', sql, 'params:', params, 'error:', e.message);
        throw e;
    }
}

// 1. ENDPOINT: REGISTRO -> persiste en DB
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Todos los campos (name, email, password) son obligatorios." });
        }

        // Discover where the User table lives and operate with raw SQL there.
        const userTableInfo = await prisma.$queryRaw`SELECT table_schema FROM information_schema.tables WHERE table_name = 'User' LIMIT 1`;
        const userSchema = (userTableInfo && userTableInfo[0] && userTableInfo[0].table_schema) ? userTableInfo[0].table_schema : null;
        if (userSchema) {
            const schema = userSchema;
            // Check existing user (safe, parameterized)
            if (schema === 'public') {
                const rows = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`;
                if (rows && rows[0]) return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });

                // Ensure role exists in public
                const roleRows = await prisma.$queryRaw`SELECT * FROM "Role" WHERE name = ${role || 'Usuario'} LIMIT 1`;
                let roleRec = roleRows && roleRows[0] ? roleRows[0] : null;
                if (!roleRec) {
                    const created = await prisma.$queryRaw`INSERT INTO "Role" (name) VALUES (${role || 'Usuario'}) RETURNING *`;
                    roleRec = created && created[0] ? created[0] : { id: null };
                }

                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
                const hashed = await bcrypt.hash(password, salt);
                const createdUser = await prisma.$queryRaw`INSERT INTO "User" ("name", "email", "password", "roleId", "createdAt", "updatedAt") VALUES (${name}, ${email}, ${hashed}, ${roleRec.id}, now(), now()) RETURNING *`;
                const user = createdUser && createdUser[0] ? createdUser[0] : null;
                return res.status(201).json({ message: 'Usuario creado.', user: { id: user.id, name: user.name, email: user.email } });
            } else {
                // Non-public schema: use $queryRawUnsafe with parameter bindings for values
                console.log('auth: checking user in schema', schema, 'email=', email);
                const rows = await qRawUnsafe(`SELECT * FROM "${schema}"."User" WHERE email = $1 LIMIT 1`, email);
                if (rows && rows[0]) return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });

                let roleRec = null;
                console.log('auth: checking role in schema', schema, 'role=', role || 'Usuario');
                const roleRows = await qRawUnsafe(`SELECT * FROM "${schema}"."Role" WHERE name = $1 LIMIT 1`, role || 'Usuario');
                if (roleRows && roleRows[0]) roleRec = roleRows[0];
                else {
                    // try public
                    const pubRows = await prisma.$queryRaw`SELECT * FROM information_schema.tables WHERE table_schema='public' AND table_name='Role' LIMIT 1`;
                    if (pubRows.length > 0) {
                        const created = await prisma.$queryRaw`INSERT INTO "public"."Role" (name) VALUES (${role || 'Usuario'}) RETURNING *`;
                        roleRec = created && created[0] ? created[0] : { id: null };
                    } else {
                        console.log('auth: creating role in schema', schema, 'role=', role || 'Usuario');
                        const created = await qRawUnsafe(`INSERT INTO "${schema}"."Role" (name) VALUES ($1) RETURNING *`, role || 'Usuario');
                        roleRec = created && created[0] ? created[0] : { id: null };
                    }
                }

                const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
                const hashed = await bcrypt.hash(password, salt);
                console.log('auth: creating user in schema', schema, 'name=', name, 'email=', email);
                const createdUser = await qRawUnsafe(`INSERT INTO "${schema}"."User" (name, email, password, roleId, createdAt, updatedAt) VALUES ($1, $2, $3, $4, now(), now()) RETURNING *`, name, email, hashed, roleRec.id);
                const user = createdUser && createdUser[0] ? createdUser[0] : null;
                return res.status(201).json({ message: 'Usuario creado.', user: { id: user.id, name: user.name, email: user.email } });
            }
        }

        // Ensure role exists (create if missing) in Prisma-mode (no legacy public User table)
        let roleRec;
        const hasPublicRole = (await prisma.$queryRaw`SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='Role' LIMIT 1`).length > 0;
        if (hasPublicRole) {
            const rows = await prisma.$queryRaw`SELECT * FROM "Role" WHERE name = ${role || 'Usuario'} LIMIT 1`;
            if (rows && rows[0]) roleRec = rows[0];
            else {
                const created = await prisma.$queryRaw`INSERT INTO "Role" (name) VALUES (${role || 'Usuario'}) RETURNING *`;
                roleRec = created && created[0] ? created[0] : { id: null };
            }
        } else {
            roleRec = await prisma.role.findFirst({ where: { name: role || 'Usuario' } });
            if (!roleRec) {
                roleRec = await prisma.role.create({ data: { name: role || 'Usuario', description: 'Rol por defecto' } });
            }
        }

        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
        const hashed = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashed,
                roleId: roleRec.id,
            }
        });

        res.status(201).json({ message: 'Usuario creado.', user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor.', error: err.message });
    }
};

// 2. ENDPOINT: LOGIN -> valida, genera token y crea session
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Proporciona email y contraseña.' });

        // Login: discover user table schema first
        const userTableInfo2 = await prisma.$queryRaw`SELECT table_schema FROM information_schema.tables WHERE table_name = 'User' LIMIT 1`;
        const userSchema2 = (userTableInfo2 && userTableInfo2[0] && userTableInfo2[0].table_schema) ? userTableInfo2[0].table_schema : null;
        if (userSchema2) {
            const schema = userSchema2;
            let rows;
            if (schema === 'public') {
                rows = await prisma.$queryRaw`SELECT * FROM "User" WHERE email = ${email} LIMIT 1`;
            } else {
                console.log('auth: login - querying user in schema', schema, 'email=', email);
                rows = await qRawUnsafe(`SELECT * FROM "${schema}"."User" WHERE email = $1 LIMIT 1`, email);
            }
            const user = rows && rows[0] ? rows[0] : null;
            if (!user) return res.status(401).json({ message: 'Credenciales incorrectas.' });

            const passwordField = user.password || user.passwordHash || user.password_hash || 'password';
            const hash = user.password || user.passwordHash || user.password_hash;
            const ok = await bcrypt.compare(password, hash);
            if (!ok) return res.status(401).json({ message: 'Credenciales incorrectas.' });

            const token = jwt.sign({ id: user.id, roleId: user.roleId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

            // Try to create session if sessions table exists in same schema or public
            const sessionInfo = await prisma.$queryRaw`SELECT table_schema FROM information_schema.tables WHERE table_name = 'sessions' LIMIT 1`;
            const sessionSchema = (sessionInfo && sessionInfo[0] && sessionInfo[0].table_schema) ? sessionInfo[0].table_schema : null;
            if (sessionSchema) {
                try {
                    const expiresAtIso = new Date(Date.now() + (parseDuration(JWT_EXPIRES) || 4 * 3600 * 1000)).toISOString();
                    if (sessionSchema === 'public') {
                        await prisma.$queryRaw`INSERT INTO "sessions" ("userId","userAgent","ipAddress","expiresAt","createdAt","updatedAt") VALUES (${user.id}, ${req.headers['user-agent']?.slice(0,255) || null}, ${req.ip}, ${expiresAtIso}, now(), now())`;
                    } else {
                        console.log('auth: inserting session in schema', sessionSchema, 'userId=', user.id);
                        await qRawUnsafe(`INSERT INTO "${sessionSchema}"."sessions" ("userId","userAgent","ipAddress","expiresAt","createdAt","updatedAt") VALUES ($1,$2,$3,$4,now(),now())`, user.id, req.headers['user-agent']?.slice(0,255) || null, req.ip, expiresAtIso);
                    }
                } catch (e) {
                    console.error('Failed to create session via raw SQL', e);
                }
            }

            return res.status(200).json({ message: 'Autenticación exitosa.', token, user: { id: user.id, name: user.name, email: user.email } });
        }

        // If we couldn't find a User table, fail.
        return res.status(500).json({ message: 'Error en el servidor.', error: 'No se encontró la tabla User en la base de datos.' });
    } catch (err) {
        res.status(500).json({ message: 'Error en el servidor.', error: err.message });
    }
};

function parseDuration(str) {
    // supports simple formats like '1d', '4h', '3600s'
    if (!str) return null;
    const m = str.match(/^(\d+)([smhd])$/);
    if (!m) return null;
    const v = parseInt(m[1], 10);
    const u = m[2];
    switch (u) {
        case 's': return v * 1000;
        case 'm': return v * 60 * 1000;
        case 'h': return v * 3600 * 1000;
        case 'd': return v * 24 * 3600 * 1000;
        default: return null;
    }
}

module.exports = { register, login };