/**
 * Mock Authentication Service
 * Sistema de autenticação local para testes sem Supabase
 */

// Usuários de teste
const MOCK_USERS = [
  {
    id: '1',
    email: 'aluno@teste.com',
    password: '123456',
    name: 'João Silva',
    role: 'student',
    grade: 7,
    school: 'Escola Teste'
  },
  {
    id: '2',
    email: 'professor@teste.com',
    password: '123456',
    name: 'Maria Santos',
    role: 'teacher',
    subject: 'Matemática',
    school: 'Escola Teste'
  },
  {
    id: '3',
    email: 'pai@teste.com',
    password: '123456',
    name: 'Carlos Oliveira',
    role: 'parent',
    phone: '(11) 98765-4321'
  },
  {
    id: '4',
    email: 'coordenador@teste.com',
    password: '123456',
    name: 'Ana Costa',
    role: 'coordinator',
    school: 'Escola Teste'
  }
];

// Simular delay de rede
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Login
export const mockLogin = async (email, password) => {
  await delay(500); // Simular latência de rede

  const user = MOCK_USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    throw new Error('Email ou senha incorretos');
  }

  // Remover senha do objeto retornado
  const { password: _, ...userWithoutPassword } = user;

  // Salvar no localStorage
  localStorage.setItem('mock_user', JSON.stringify(userWithoutPassword));
  localStorage.setItem('mock_token', 'mock-token-' + user.id);

  return { user: userWithoutPassword, token: 'mock-token-' + user.id };
};

// Registro
export const mockRegister = async (userData) => {
  await delay(500);

  // Verificar se email já existe
  const existingUser = MOCK_USERS.find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('Email já cadastrado');
  }

  // Criar novo usuário
  const newUser = {
    id: String(MOCK_USERS.length + 1),
    email: userData.email,
    name: userData.name,
    role: userData.role,
    ...userData
  };

  // Remover senha do objeto retornado
  const { password: _, ...userWithoutPassword } = newUser;

  // Adicionar à lista (apenas em memória)
  MOCK_USERS.push(newUser);

  // Salvar no localStorage
  localStorage.setItem('mock_user', JSON.stringify(userWithoutPassword));
  localStorage.setItem('mock_token', 'mock-token-' + newUser.id);

  return { user: userWithoutPassword, token: 'mock-token-' + newUser.id };
};

// Logout
export const mockLogout = async () => {
  await delay(200);
  localStorage.removeItem('mock_user');
  localStorage.removeItem('mock_token');
};

// Obter usuário atual
export const mockGetCurrentUser = async () => {
  await delay(200);
  
  const userStr = localStorage.getItem('mock_user');
  const token = localStorage.getItem('mock_token');

  if (!userStr || !token) {
    return null;
  }

  return JSON.parse(userStr);
};

// Verificar se está usando mock
export const isMockAuth = () => {
  return localStorage.getItem('mock_token') !== null;
};

// Limpar dados mock
export const clearMockData = () => {
  localStorage.removeItem('mock_user');
  localStorage.removeItem('mock_token');
};

