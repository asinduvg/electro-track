export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'inventory_manager' | 'warehouse_staff' | 'department_user'
          name: string
          department: string | null
          created_at: string | null
          last_login: string | null
        }
        Insert: {
          id?: string
          email: string
          role: 'admin' | 'inventory_manager' | 'warehouse_staff' | 'department_user'
          name: string
          department?: string | null
          created_at?: string | null
          last_login?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'inventory_manager' | 'warehouse_staff' | 'department_user'
          name?: string
          department?: string | null
          created_at?: string | null
          last_login?: string | null
        }
      }
      items: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          category: string
          subcategory: string | null
          manufacturer: string
          model: string | null
          serial_number: string | null
          quantity: number
          minimum_stock: number | null
          unit_cost: number
          location_id: string | null
          purchase_date: string | null
          warranty_expiration: string | null
          status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'ordered' | 'discontinued'
          created_at: string | null
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          category: string
          subcategory?: string | null
          manufacturer: string
          model?: string | null
          serial_number?: string | null
          quantity?: number
          minimum_stock?: number | null
          unit_cost: number
          location_id?: string | null
          purchase_date?: string | null
          warranty_expiration?: string | null
          status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'ordered' | 'discontinued'
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          category?: string
          subcategory?: string | null
          manufacturer?: string
          model?: string | null
          serial_number?: string | null
          quantity?: number
          minimum_stock?: number | null
          unit_cost?: number
          location_id?: string | null
          purchase_date?: string | null
          warranty_expiration?: string | null
          status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'ordered' | 'discontinued'
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
        }
      }
      locations: {
        Row: {
          id: string
          building: string | null
          room: string | null
          unit: string
          created_at: string | null
        }
        Insert: {
          id?: string
          building?: string | null
          room?: string | null
          unit: string
          created_at?: string | null
        }
        Update: {
          id?: string
          building?: string | null
          room?: string | null
          unit?: string
          created_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          type: 'receive' | 'transfer' | 'dispose' | 'adjust'
          item_id: string
          quantity: number
          from_location_id: string | null
          to_location_id: string | null
          performed_by: string
          performed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          type: 'receive' | 'transfer' | 'dispose' | 'adjust'
          item_id: string
          quantity: number
          from_location_id?: string | null
          to_location_id?: string | null
          performed_by: string
          performed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          type?: 'receive' | 'transfer' | 'dispose' | 'adjust'
          item_id?: string
          quantity?: number
          from_location_id?: string | null
          to_location_id?: string | null
          performed_by?: string
          performed_at?: string | null
          notes?: string | null
        }
      }
      attachments: {
        Row: {
          id: string
          item_id: string
          name: string
          type: string
          url: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          id?: string
          item_id: string
          name: string
          type: string
          url: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          id?: string
          item_id?: string
          name?: string
          type?: string
          url?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}