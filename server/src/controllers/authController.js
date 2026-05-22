const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Clave secreta para firmar los tokens (Se lee del .env o usa una por defecto)
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_universitaria_2026';

// Simulación de Base de Datos Temporal (Arreglo en memoria)
// Esto permite que el endpoint guarde usuarios mientras el servidor esté corriendo.
const usuariosMock = [];

// 1. ENDPOINT: REGISTRO
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validaciones básicas
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Todos los campos (name, email, password) son obligatorios." });
        }

        // Verificar si el usuario ya existe en nuestro mock
        const userExists = usuariosMock.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado." });
        }

        // Encriptar la contraseña (Seguridad)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el nuevo usuario simulación
        const nuevoUsuario = {
            id: usuariosMock.length + 1,
            name,
            email,
            password: hashedPassword, // Guardamos la contraseña segura
            role: role || 'Usuario',   // Rol por defecto si no se envía uno personalizado
            createdAt: new Date()
        };

        // Guardar temporalmente en el arreglo
        usuariosMock.push(nuevoUsuario);

        // Responder con éxito sin devolver la contraseña
        res.status(201).json({
            message: "Usuario registrado con éxito de forma temporal.",
            user: {
                id: nuevoUsuario.id,
                name: nuevoUsuario.name,
                email: nuevoUsuario.email,
                role: nuevoUsuario.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};

// 2. ENDPOINT: LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Por favor, proporciona email y contraseña." });
        }

        // Buscar el usuario en nuestro mock
        const usuario = usuariosMock.find(u => u.email === email);
        if (!usuario) {
            return res.status(401).json({ message: "Credenciales incorrectas (Usuario no encontrado)." });
        }

        // Comparar contraseña ingresada con el hash guardado
        const passwordCorrecto = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecto) {
            return res.status(401).json({ message: "Credenciales incorrectas (Contraseña inválida)." });
        }

        // Generar el Token (JWT) - Expira en 4 horas
        // Guardamos su ID y su Rol dentro del token para usarlo luego en los permisos (RBAC)
        const token = jwt.sign(
            { id: usuario.id, role: usuario.role },
            JWT_SECRET,
            { expiresIn: '4h' }
        );

        // Responder al cliente con el token
        res.status(200).json({
            message: "Autenticación exitosa.",
            token,
            user: {
                id: usuario.id,
                name: usuario.name,
                email: usuario.email,
                role: usuario.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor.", error: error.message });
    }
};

module.exports = {
    register,
    login
};