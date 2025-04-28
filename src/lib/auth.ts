import { supabase } from './supabase';
import type { Database } from './database.types';
import { UserRole } from '../types';

type UserInsert = Database['public']['Tables']['users']['Insert'];

export async function signUp(email: string, password: string, userData: Omit<UserInsert, 'id' | 'email'>) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('Failed to create user');

  // Create the user profile in our users table
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: authData.user.email!,
      ...userData
    });

  if (profileError) {
    // Rollback: delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw profileError;
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  console.info(data)
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
}

// Initialize demo users if they don't exist
export async function initializeDemoUsers() {
  const demoUsers = [
    {
      email: 'vegain@example.com',
      password: 'vegain321',
      role: UserRole.ADMIN,
      name: 'Admin User'
    },
    {
      email: 'inventory@example.com',
      password: 'password123',
      role: UserRole.INVENTORY_MANAGER,
      name: 'Inventory Manager',
      department: 'Operations'
    },
    {
      email: 'warehouse@example.com',
      password: 'password123',
      role: UserRole.WAREHOUSE_STAFF,
      name: 'Warehouse Staff',
      department: 'Warehouse'
    },
    {
      email: 'department@example.com',
      password: 'password123',
      role: UserRole.DEPARTMENT_USER,
      name: 'Department User',
      department: 'Engineering'
    }
  ];

  for (const user of demoUsers) {
    try {
      await signUp(user.email, user.password, {
        role: user.role,
        name: user.name,
        department: user.department
      });
    } catch (error) {
      // Ignore errors if user already exists
      console.log(`User ${user.email} may already exist:`, error);
    }
  }
}