export type UserRole = 'super_admin' | 'admin' | 'purchasing' | 'gudang' | 'manajemen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  categoryId: string;
  supplierId: string;
  buyPrice: number;
  minStock: number;
  currentStock: number;
  unit: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'in' | 'out' | 'adjustment';
export type ReferenceType = 'po' | 'manual' | 'production' | 'audit' | 'damaged';

export interface InventoryMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType: ReferenceType;
  referenceId?: string;
  notes: string;
  createdBy: string;
  createdAt: string;
}

export type PurchaseOrderStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'processing'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  notes: string;
  createdBy: string;
  approvedBy?: string;
  receivedAt?: string;
  receivedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  targetType: 'supplier' | 'product' | 'inventory' | 'po' | 'user' | 'system' | 'auth';
  targetId?: string;
  details: string;
}

export interface CompanySettings {
  name: string;
  tradeName: string;
  address: string;
  phone: string;
  email: string;
  npwp: string;
  website: string;
  city: string;
  postalCode: string;
  defaultTaxPercent: number;
  requireApprovalAbove: number;
}
