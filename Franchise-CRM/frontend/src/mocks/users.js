export const MOCK_OTP = '123456';

export const mockUsers = [
  {
    username: 'superadmin',
    email: 'super@mail.com',
    password: 'password123',
    role: 'super_admin',
  },
  {
    username: 'admin',
    email: 'admin@mail.com',
    password: 'password123',
    role: 'admin',
  },
  {
    // Partner username = company name (used as requestedBy in event requests)
    username: 'Sunrise Packaging',
    email: 'partner@mail.com',
    password: 'password123',
    role: 'partner',
  },
];