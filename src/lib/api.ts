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
  const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`
      *,
      created_by:users!items_created_by_fkey(*)
    `);

  if (itemsError) throw itemsError;

  // Get item locations
  const { data: itemLocations, error: locationsError } = await supabase
      .from('item_locations')
      .select(`
      *,
      location:locations(*)
    `);

  if (locationsError) throw locationsError;

  // Combine items with their locations
  const itemsWithLocations = items.map(item => ({
    ...item,
    locations: itemLocations?.filter(il => il.item_id === item.id) || []
  }));

  return itemsWithLocations;
}

export async function getItemById(id: string) {
  const { data: item, error: itemError } = await supabase
      .from('items')
      .select(`
      *,
      created_by:users!items_created_by_fkey(*)
    `)
      .eq('id', id)
      .single();

  if (itemError) throw itemError;

  // Get item locations
  const { data: locations, error: locationsError } = await supabase
      .from('item_locations')
      .select(`
      *,
      location:locations(*)
    `)
      .eq('item_id', id);

  if (locationsError) throw locationsError;

  return {
    ...item,
    locations: locations || []
  };
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

// Item Locations
export async function getItemLocations(itemId: string) {
  const { data, error } = await supabase
      .from('item_locations')
      .select(`
      *,
      location:locations(*)
    `)
      .eq('item_id', itemId);

  if (error) throw error;
  return data;
}

export async function addItemLocation(itemLocation: Tables['item_locations']['Insert']) {
  const { data, error } = await supabase
      .from('item_locations')
      .insert(itemLocation)
      .select()
      .single();

  if (error) throw error;
  return data;
}

export async function updateItemLocation(id: string, updates: Partial<Tables['item_locations']['Update']>) {
  const { data, error } = await supabase
      .from('item_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

  if (error) throw error;
  return data;
}

export async function deleteItemLocation(id: string) {
  const { error } = await supabase
      .from('item_locations')
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
      from_location:locations!transactions_from_location_id_fkey(*),
      to_location:locations!transactions_to_location_id_fkey(*),
      performed_by_user:users!transactions_performed_by_fkey(*)
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

    // Then update the item quantities in item_locations
    const { data: itemLocations, error: locationsError } = await supabase
        .from('item_locations')
        .select('*')
        .eq('item_id', transaction.item_id);

    if (locationsError) throw locationsError;

    switch (transaction.type) {
      case 'receive':
        if (transaction.to_location_id) {
          const existingLocation = itemLocations?.find(
              il => il.location_id === transaction.to_location_id
          );

          if (existingLocation) {
            await updateItemLocation(existingLocation.id, {
              quantity: existingLocation.quantity + transaction.quantity
            });
          } else {
            await addItemLocation({
              item_id: transaction.item_id,
              location_id: transaction.to_location_id,
              quantity: transaction.quantity
            });
          }
        }
        break;

      case 'transfer':
        if (transaction.from_location_id && transaction.to_location_id) {
          const fromLocation = itemLocations?.find(
              il => il.location_id === transaction.from_location_id
          );
          const toLocation = itemLocations?.find(
              il => il.location_id === transaction.to_location_id
          );

          if (fromLocation) {
            await updateItemLocation(fromLocation.id, {
              quantity: fromLocation.quantity - transaction.quantity
            });
          }

          if (toLocation) {
            await updateItemLocation(toLocation.id, {
              quantity: (toLocation.quantity || 0) + transaction.quantity
            });
          } else {
            await addItemLocation({
              item_id: transaction.item_id,
              location_id: transaction.to_location_id,
              quantity: transaction.quantity
            });
          }
        }
        break;

      case 'dispose':
      case 'withdraw':
        if (transaction.from_location_id) {
          const fromLocation = itemLocations?.find(
              il => il.location_id === transaction.from_location_id
          );

          if (fromLocation) {
            await updateItemLocation(fromLocation.id, {
              quantity: fromLocation.quantity - transaction.quantity
            });
          }
        }
        break;

      case 'adjust':
        if (transaction.from_location_id) {
          const location = itemLocations?.find(
              il => il.location_id === transaction.from_location_id
          );

          if (location) {
            await updateItemLocation(location.id, {
              quantity: transaction.quantity
            });
          }
        }
        break;
    }

    // Update total item quantity
    const { data: updatedLocations, error: finalError } = await supabase
        .from('item_locations')
        .select('quantity')
        .eq('item_id', transaction.item_id);

    if (finalError) throw finalError;

    const totalQuantity = updatedLocations?.reduce((sum, loc) => sum + (loc.quantity || 0), 0) || 0;

    await updateItem(transaction.item_id, {
      quantity: totalQuantity,
      status: totalQuantity <= 0 ? 'out_of_stock' : 'in_stock'
    });

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