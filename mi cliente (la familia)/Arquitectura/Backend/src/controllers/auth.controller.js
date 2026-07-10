const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Users = require('../models/users.model');
const Employees = require('../models/employees.model');
const Sessions = require('../models/sessions.model');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_please_change';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecret_refresh_key_please_change';
const ACCESS_TOKEN_EXPIRATION = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRATION_DAYS = 7; 

// Helper para generar y guardar los tokens
const generateTokens = async (user, req, remember_me = false) => {
  const accessToken = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRATION }
  );

  // Si "Recuérdame" está activo, le damos 30 días, si no, 1 día
  const refreshDays = remember_me ? 30 : 1;

  const refreshToken = jwt.sign(
    { id: user.id },
    JWT_REFRESH_SECRET,
    { expiresIn: `${refreshDays}d` }
  );

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + refreshDays);

  await Sessions.create({
    user_id: user.id,
    token_hash: tokenHash,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'] || '',
    expires_at: expiresAt
  });

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (Nombre, Apellido, Correo, Contraseña)' });
    }

    // Usaremos el email como username del sistema
    const username = email.toLowerCase();

    // Check if user already exists
    const { rows: existingUsers } = await Users.findByUsername(username);
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Creamos primero el registro del Empleado (Usuario Humano)
    const { rows: employeeRows } = await Employees.create({
      first_name,
      last_name,
      email: username,
      phone,
      role: 'cashier' // rol por defecto
    });
    const newEmployee = employeeRows[0];

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Creamos el Usuario vinculado al Empleado
    const { rows: userRows } = await Users.create({
      username,
      password_hash,
      employee_id: newEmployee.id,
      role: 'cashier'
    });

    const newUser = userRows[0];
    
    // Generamos tokens de inmediato
    const tokens = await generateTokens(newUser, req);

    delete newUser.password_hash;

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente', 
      user: {
        ...newUser,
        first_name: newEmployee.first_name,
        last_name: newEmployee.last_name
      },
      ...tokens // accessToken, refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, remember_me } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El correo y la contraseña son obligatorios' });
    }

    const username = email.toLowerCase();

    // Find user
    const { rows } = await Users.findByUsername(username);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = rows[0];

    // Check active status
    if (!user.active) {
      return res.status(403).json({ error: 'El usuario está desactivado' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generamos tokens, ajustando el tiempo si marcó "Recuérdame"
    const tokens = await generateTokens(user, req, remember_me);

    delete user.password_hash;

    res.json({
      message: 'Login successful',
      user,
      ...tokens // accessToken, refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await Sessions.findByTokenHash(tokenHash);
    
    if (!session) {
      return res.status(403).json({ error: 'Session not found or revoked' });
    }

    const { rows } = await Users.findById(decoded.id);
    if (rows.length === 0 || !rows[0].active) {
      return res.status(403).json({ error: 'User not found or deactivated' });
    }

    const user = rows[0];

    // Revocamos la sesión antigua (Refresh Token Rotation)
    await Sessions.revoke(tokenHash);

    // Generamos un par nuevo de tokens
    const tokens = await generateTokens(user, req);

    res.json({
      ...tokens // accessToken, refreshToken
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      await Sessions.revoke(tokenHash);
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Perfil propio: datos del usuario + su employee vinculado
const me = async (req, res, next) => {
  try {
    const { rows } = await Users.findById(req.user.id);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const user = rows[0];
    let profile = { first_name: '', last_name: '', phone: null, email: user.username };

    if (user.employee_id) {
      const { rows: empRows } = await Employees.findById(user.employee_id);
      if (empRows.length) {
        const emp = empRows[0];
        profile = {
          first_name: emp.first_name,
          last_name: emp.last_name,
          phone: emp.phone,
          email: emp.email ?? user.username,
        };
      }
    }

    res.json({ user: { ...user, ...profile } });
  } catch (error) {
    next(error);
  }
};

// Actualizar perfil propio (nombre, apellido, teléfono)
const updateMe = async (req, res, next) => {
  try {
    const { first_name, last_name, phone } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Nombre y apellido son obligatorios' });
    }

    const { rows } = await Users.findById(req.user.id);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = rows[0];

    let employee;
    if (user.employee_id) {
      const { rows: empRows } = await Employees.findById(user.employee_id);
      const current = empRows[0];
      const { rows: updatedRows } = await Employees.update(user.employee_id, {
        ...current,
        first_name,
        last_name,
        phone: phone ?? current.phone,
      });
      employee = updatedRows[0];
    } else {
      // Usuario sin employee vinculado (caso borde): se crea uno
      const { rows: createdRows } = await Employees.create({
        first_name,
        last_name,
        phone,
        email: user.username,
        role: 'cashier',
      });
      employee = createdRows[0];
      await db.query('UPDATE users SET employee_id=$1 WHERE id=$2', [employee.id, user.id]);
    }

    res.json({
      user: {
        ...user,
        first_name: employee.first_name,
        last_name: employee.last_name,
        phone: employee.phone,
        email: employee.email ?? user.username,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cambiar contraseña propia (requiere la actual)
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Se requieren la contraseña actual y la nueva' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' });
    }

    const { rows } = await Users.findByUsername(req.user.username);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = rows[0];

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await Users.updatePassword(user.id, password_hash);

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
  updateMe,
  changePassword
};
