import { supabase } from './supabase';
import type { Database } from './database.types';

type Tables = Database['public']['Tables'];

// Users
export async function getUsers() {
  const { data, error } = await supabase
      .from('users')
      .select('*');

  if (error) throw error;
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

  if (error) throw error;
  return data;
}

export async function updateUser(id: string, updates: Partial<Tables['users']['Update']>) {
  const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

  if (error) throw error;
  return data;
}

// Items
export async function getItems() {
  const { data, error } = await supabase
      .from('items')
      .select(`
      *,
      location:locations(*),
      created_by:users!items_created_by_fkey(*)
    `);

  if (error) throw error;
  return data;
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
      .from('items')
      .select(`
      *,
      location:locations(*),
      created_by:users!items_created_by_fkey(*)
    `)
      .eq('id', id)
      .single();

  if (error) throw error;
  return data;
}

export async function createItem(item: Tables['items']['Insert']) {
  const { data, error } = await supabase
      .from('items')
      .insert(item)
      .select()
      .single();

  if (error) throw error;
  return data;
}

export async function updateItem(id: string, updates: Partial<Tables['items']['Update']>) {
  const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

  if (error) throw error;
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

  if (error) throw error;
}

// Locations
export async function getLocations() {
  const { data, error } = await supabase
      .from('locations')
      .select('*');

  if (error) throw error;
  return data;
}

export async function createLocation(location: Tables['locations']['Insert']) {
  const { data, error } = await supabase
      .from('locations')
      .insert(location)
      .select()
      .single();

  if (error) throw error;
  return data;
}

// Transactions
export async function getTransactions() {
  const { data, error } = await supabase
      .from('transactions')
      .select(`
      *,
      item:items(*),
      from_location:locations(*),
      to_location:locations(*),
      performed_by:users(*)
    `);

  if (error) throw error;
  return data;
}

export async function createTransaction(transaction: Tables['transactions']['Insert']) {
  try {
    // First create the transaction record with metadata
    const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
          metadata: {
            browser: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

    if (transactionError) throw transactionError;

    // Then update the item quantity and location based on transaction type
    const item = await getItemById(transaction.item_id);
    if (!item) throw new Error('Item not found');

    let newQuantity = item.quantity;
    let newStatus = item.status;
    let newLocationId = item.location_id;

    switch (transaction.type) {
      case 'receive':
        newQuantity += transaction.quantity;
        newLocationId = transaction.to_location_id || item.location_id;
        break;
      case 'transfer':
        newLocationId = transaction.to_location_id || item.location_id;
        break;
      case 'dispose':
      case 'withdraw':
        newQuantity -= transaction.quantity;
        break;
      case 'adjust':
        newQuantity = transaction.quantity;
        break;
    }

    // Update status based on new quantity
    if (newQuantity <= 0) {
      newStatus = 'out_of_stock';
    } else if (item.minimum_stock && newQuantity <= item.minimum_stock) {
      newStatus = 'low_stock';
    } else {
      newStatus = 'in_stock';
    }

    // Update the item
    const { error: updateError } = await supabase
        .from('items')
        .update({
          quantity: newQuantity,
          status: newStatus,
          location_id: newLocationId
        })
        .eq('id', transaction.item_id);

    if (updateError) throw updateError;

    return transactionData;
  } catch (error) {
    throw error;
  }
}

// Attachments
export async function getAttachments(itemId: string) {
  const { data, error } = await supabase
      .from('attachments')
      .select(`
      *,
      uploaded_by:users(*)
    `)
      .eq('item_id', itemId);

  if (error) throw error;
  return data;
}

export async function createAttachment(attachment: Tables['attachments']['Insert']) {
  const { data, error } = await supabase
      .from('attachments')
      .insert(attachment)
      .select()
      .single();

  if (error) throw error;
  return data;
}

export async function deleteAttachment(id: string) {
  const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);

  if (error) throw error;
}