import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow external admin app (and any origin in dev)
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin === '*' ? true : corsOrigin.split(',').map(s => s.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// In-memory stores - match frontend types
// User: id (string), username?, email, name, role, password? (dev only), schoolId?, image, imageCldPubId, department, createdAt, updatedAt
// School: id (string), name, type, system, country, city, commune, address, gpsLat, gpsLng, phone, email, directorName, directorPhone, website, logoUrl, logoCldPubId, studentCount, teacherCount, series[], createdAt, updatedAt
// Subject: id (number), name, code, description, department, createdAt
// Class: id (number), name, subjectId, teacherId, capacity, description, status, bannerUrl, bannerCldPubId, schedules, inviteCode
// Enrollment: id (number), classId (number), studentId (string), enrolledAt
let users = [];
let schools = [];
let subjects = [];
let classes = [];
let enrollments = [];

let subjectIdSeq = 1;
let classIdSeq = 1;
let enrollmentIdSeq = 1;

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9);

// ==================== HELPERS ====================

function getSubjectById(id) {
  const n = typeof id === 'string' ? parseInt(id, 10) : id;
  return subjects.find((s) => s.id === n);
}

function getUserById(id) {
  return users.find((u) => u.id === id);
}

function getClassById(id) {
  const n = typeof id === 'string' ? parseInt(id, 10) : id;
  return classes.find((c) => c.id === n);
}

function getEnrollmentsByClassId(classId) {
  const cid = typeof classId === 'string' ? parseInt(classId, 10) : classId;
  return enrollments.filter((e) => e.classId === cid);
}

// Enrich class with subject, teacher, students (for getOne and getList)
function enrichClass(cls) {
  const subject = getSubjectById(cls.subjectId);
  const teacher = getUserById(cls.teacherId);
  const classEnrollments = getEnrollmentsByClassId(cls.id);
  const students = classEnrollments.map((e) => {
    const u = getUserById(e.studentId);
    return u
      ? {
          id: u.id,
          name: u.name,
          email: u.email,
          enrolledAt: e.enrolledAt,
          enrollmentId: e.id,
        }
      : null;
  }).filter(Boolean);

  return {
    ...cls,
    subject: subject || null,
    teacher: teacher || null,
    students,
  };
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/sign-up', (req, res) => {
  const { email, password, name, role, image, imageCldPubId, department, username } = req.body;
  const now = new Date().toISOString();

  const newUser = {
    id: generateId(),
    username: username || (email ? email.split('@')[0] : 'user'),
    email: email || 'user@example.com',
    name: name || 'User',
    role: role || 'student',
    password: password || '',
    image: image || '',
    imageCldPubId: imageCldPubId || '',
    department: department || '',
    schoolId: null,
    createdAt: now,
    updatedAt: now,
  };

  users.push(newUser);

  res.json({
    success: true,
    user: { ...newUser, password: undefined },
  });
});

// Connexion: email OU nom d'utilisateur + mot de passe
app.post('/api/auth/sign-in', (req, res) => {
  const { email, username, password } = req.body;
  const login = email || username || '';

  const user = users.find(
    (u) => (u.email && u.email === login) || (u.username && u.username === login)
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Utilisateur ou email introuvable.',
    });
  }

  if (password !== undefined && user.password != null && user.password !== '' && user.password !== password) {
    return res.status(401).json({
      success: false,
      error: 'Mot de passe incorrect.',
    });
  }

  const { password: _, ...safeUser } = user;
  res.json({
    success: true,
    user: safeUser,
  });
});

// Inscription école: crée l'école + le compte responsable (admin)
app.post('/api/auth/school/register', (req, res) => {
  const body = req.body;
  const {
    username,
    email,
    password,
    confirmPassword,
    schoolName,
    schoolType,
    system,
    country,
    city,
    commune,
    address,
    gpsLat,
    gpsLng,
    phone,
    officialEmail,
    directorName,
    directorPhone,
    website,
    logoUrl,
    logoCldPubId,
    studentCount,
    teacherCount,
    series,
  } = body;

  if (!email || !password || !schoolName) {
    return res.status(400).json({
      success: false,
      error: 'Email, mot de passe et nom de l\'école sont requis.',
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Le mot de passe et la confirmation ne correspondent pas.',
    });
  }
  if (users.some((u) => u.email === email)) {
    return res.status(400).json({
      success: false,
      error: 'Un compte avec cet email existe déjà.',
    });
  }
  const un = username || email.split('@')[0];
  if (users.some((u) => u.username === un)) {
    return res.status(400).json({
      success: false,
      error: 'Ce nom d\'utilisateur est déjà pris.',
    });
  }

  const now = new Date().toISOString();
  const schoolId = generateId();
  const school = {
    id: schoolId,
    name: schoolName || '',
    type: schoolType || '',
    system: system || '',
    country: country || '',
    city: city || '',
    commune: commune || '',
    address: address || '',
    gpsLat: gpsLat != null ? Number(gpsLat) : null,
    gpsLng: gpsLng != null ? Number(gpsLng) : null,
    phone: phone || '',
    officialEmail: officialEmail || email,
    directorName: directorName || '',
    directorPhone: directorPhone || '',
    website: website || '',
    logoUrl: logoUrl || '',
    logoCldPubId: logoCldPubId || '',
    studentCount: studentCount != null ? Number(studentCount) : null,
    teacherCount: teacherCount != null ? Number(teacherCount) : null,
    series: Array.isArray(series) ? series : [],
    createdAt: now,
    updatedAt: now,
  };
  schools.push(school);

  const userId = generateId();
  const newUser = {
    id: userId,
    username: un,
    email,
    name: directorName || schoolName,
    role: 'admin',
    password,
    image: '',
    imageCldPubId: '',
    department: '',
    schoolId,
    createdAt: now,
    updatedAt: now,
  };
  users.push(newUser);

  const { password: _p, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    user: safeUser,
    school,
  });
});

app.post('/api/auth/sign-out', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==================== SCHOOLS ====================

app.get('/api/schools', (req, res) => {
  res.json({ success: true, data: schools, pagination: { total: schools.length, page: 1, limit: schools.length } });
});

app.get('/api/schools/:id', (req, res) => {
  const school = schools.find((s) => s.id === req.params.id);
  if (!school) return res.status(404).json({ success: false, error: 'School not found' });
  res.json({ success: true, data: [school] });
});

// ==================== USERS ====================

app.get('/api/users', (req, res) => {
  const { page = 1, limit = 10, roles, searchQuery } = req.query;

  let filtered = [...users];

  if (roles) {
    filtered = filtered.filter((u) => u.role === roles);
  }
  if (searchQuery) {
    const q = String(searchQuery).toLowerCase();
    filtered = filtered.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const start = (pageNum - 1) * limitNum;
  const data = filtered.slice(start, start + limitNum);

  res.json({
    success: true,
    data,
    pagination: {
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    },
  });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, data: [user] });
});

app.post('/api/users', (req, res) => {
  const now = new Date().toISOString();
  const newUser = {
    id: generateId(),
    email: req.body.email || '',
    name: req.body.name || '',
    role: req.body.role || 'student',
    image: req.body.image || '',
    imageCldPubId: req.body.imageCldPubId || '',
    department: req.body.department || '',
    createdAt: now,
    updatedAt: now,
    ...req.body,
  };
  newUser.id = newUser.id || generateId();
  newUser.createdAt = newUser.createdAt || now;
  newUser.updatedAt = newUser.updatedAt || now;
  users.push(newUser);
  res.json({ success: true, data: [newUser] });
});

app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  const updated = {
    ...users[index],
    ...req.body,
    id: users[index].id,
    updatedAt: new Date().toISOString(),
  };
  users[index] = updated;
  res.json({ success: true, data: [updated] });
});

app.delete('/api/users/:id', (req, res) => {
  const index = users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  users.splice(index, 1);
  res.json({ success: true, data: {} });
});

// ==================== SUBJECTS ====================

app.get('/api/subjects', (req, res) => {
  const { page = 1, limit = 10, department, searchQuery } = req.query;

  let filtered = [...subjects];

  if (department) {
    filtered = filtered.filter((s) => s.department === department);
  }
  if (searchQuery) {
    const q = String(searchQuery).toLowerCase();
    filtered = filtered.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.code && s.code.toLowerCase().includes(q))
    );
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const start = (pageNum - 1) * limitNum;
  const data = filtered.slice(start, start + limitNum);

  res.json({
    success: true,
    data,
    pagination: {
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    },
  });
});

app.get('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const subject = subjects.find((s) => s.id === id);
  if (!subject) {
    return res.status(404).json({ success: false, error: 'Subject not found' });
  }
  res.json({ success: true, data: [subject] });
});

app.post('/api/subjects', (req, res) => {
  const now = new Date().toISOString();
  const newId = subjectIdSeq++;
  const newSubject = {
    id: newId,
    name: req.body.name || '',
    code: req.body.code || '',
    description: req.body.description || '',
    department: req.body.department || '',
    createdAt: now,
    ...req.body,
  };
  newSubject.id = newId;
  newSubject.createdAt = now;
  subjects.push(newSubject);
  res.json({ success: true, data: [newSubject] });
});

app.put('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = subjects.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Subject not found' });
  }
  const updated = { ...subjects[index], ...req.body, id };
  subjects[index] = updated;
  res.json({ success: true, data: [updated] });
});

app.delete('/api/subjects/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = subjects.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Subject not found' });
  }
  subjects.splice(index, 1);
  res.json({ success: true, data: {} });
});

// ==================== CLASSES ====================

app.get('/api/classes', (req, res) => {
  const { page = 1, limit = 10, subjectId, teacherId, searchQuery } = req.query;

  let filtered = [...classes];

  if (subjectId) {
    const sid = parseInt(subjectId, 10);
    filtered = filtered.filter((c) => c.subjectId === sid);
  }
  if (teacherId) {
    filtered = filtered.filter((c) => c.teacherId === teacherId);
  }
  if (searchQuery) {
    const q = String(searchQuery).toLowerCase();
    filtered = filtered.filter((c) => c.name && c.name.toLowerCase().includes(q));
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const start = (pageNum - 1) * limitNum;
  const slice = filtered.slice(start, start + limitNum);
  const data = slice.map(enrichClass);

  res.json({
    success: true,
    data,
    pagination: {
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    },
  });
});

app.get('/api/classes/:id', (req, res) => {
  const id = req.params.id;
  const cls = getClassById(id);
  if (!cls) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }
  const enriched = enrichClass(cls);
  res.json({ success: true, data: [enriched] });
});

app.post('/api/classes', (req, res) => {
  const now = new Date().toISOString();
  const body = req.body;
  const newId = classIdSeq++;
  const newClass = {
    id: newId,
    name: body.name || '',
    term: body.term || '',
    subjectId: body.subjectId != null ? Number(body.subjectId) : undefined,
    teacherId: body.teacherId || '',
    capacity: body.capacity != null ? Number(body.capacity) : undefined,
    description: body.description || '',
    status: body.status || 'active',
    bannerUrl: body.bannerUrl || '',
    bannerCldPubId: body.bannerCldPubId || '',
    inviteCode: body.inviteCode || '',
    schedules: Array.isArray(body.schedules) ? body.schedules : [],
    createdAt: now,
  };
  classes.push(newClass);
  res.json({ success: true, data: [enrichClass(newClass)] });
});

app.put('/api/classes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = classes.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }
  const body = req.body;
  const updated = {
    ...classes[index],
    ...body,
    id,
    subjectId: body.subjectId != null ? Number(body.subjectId) : classes[index].subjectId,
    teacherId: body.teacherId !== undefined ? body.teacherId : classes[index].teacherId,
    capacity: body.capacity != null ? Number(body.capacity) : classes[index].capacity,
    schedules: Array.isArray(body.schedules) ? body.schedules : classes[index].schedules || [],
  };
  classes[index] = updated;
  res.json({ success: true, data: [enrichClass(updated)] });
});

app.delete('/api/classes/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = classes.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Class not found' });
  }
  classes.splice(index, 1);
  enrollments = enrollments.filter((e) => e.classId !== id);
  res.json({ success: true, data: {} });
});

// ==================== ENROLLMENTS ====================

app.get('/api/enrollments', (req, res) => {
  const { page = 1, limit = 10, studentId } = req.query;

  let filtered = [...enrollments];

  if (studentId) {
    filtered = filtered.filter((e) => e.studentId === studentId);
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const start = (pageNum - 1) * limitNum;
  const slice = filtered.slice(start, start + limitNum);

  // Enrich each enrollment with full class (for student dashboard and list views)
  const data = slice.map((e) => {
    const cls = getClassById(e.classId);
    return {
      ...e,
      class: cls ? enrichClass(cls) : null,
    };
  });

  res.json({
    success: true,
    data,
    pagination: {
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
    },
  });
});

app.post('/api/enrollments', (req, res) => {
  const { classId, studentId } = req.body;
  const classIdNum = classId != null ? Number(classId) : NaN;
  if (!classIdNum || !studentId) {
    return res.status(400).json({ success: false, error: 'classId and studentId required' });
  }
  const existing = enrollments.find(
    (e) => e.classId === classIdNum && e.studentId === studentId
  );
  if (existing) {
    return res.json({ success: true, data: [existing] });
  }
  const newId = enrollmentIdSeq++;
  const newEnrollment = {
    id: newId,
    classId: classIdNum,
    studentId: String(studentId),
    enrolledAt: new Date().toISOString(),
  };
  enrollments.push(newEnrollment);
  res.json({ success: true, data: [newEnrollment] });
});

app.delete('/api/enrollments/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = enrollments.findIndex((e) => e.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Enrollment not found' });
  }
  enrollments.splice(index, 1);
  res.json({ success: true, data: {} });
});

// ==================== HEALTH & ROOT ====================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Classroom Backend API - Development Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/sign-up, /api/auth/sign-in, /api/auth/sign-out, /api/auth/school/register',
      schools: '/api/schools',
      users: '/api/users',
      subjects: '/api/subjects',
      classes: '/api/classes',
      enrollments: '/api/enrollments',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`API base: http://localhost:${PORT}/api`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
