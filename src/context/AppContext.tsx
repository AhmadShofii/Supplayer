import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORIES,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_MOVEMENTS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
} from '../lib/initialData';
import {
  AuditLog,
  Category,
  CompanySettings,
  InventoryMovement,
  MovementType,
  Product,
  PurchaseOrder,
  PurchaseOrderStatus,
  ReferenceType,
  Supplier,
  User,
  UserRole,
} from '../types';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  title?: string;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  suppliers: Supplier[];
  categories: Category[];
  products: Product[];
  purchaseOrders: PurchaseOrder[];
  movements: InventoryMovement[];
  auditLogs: AuditLog[];
  companySettings: CompanySettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info', message: string, title?: string) => void;
  removeToast: (id: string) => void;

  // Auth
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;

  // Supplier
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => { success: boolean; actionTaken: 'deleted' | 'deactivated'; message: string };

  // Category
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;

  // Product
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  archiveProduct: (id: string) => void;
  deleteProduct: (id: string) => { success: boolean; message: string };

  // Inventory
  addStockMovement: (params: {
    productId: string;
    type: MovementType;
    quantity: number;
    notes: string;
    referenceType: ReferenceType;
    referenceId?: string;
  }) => { success: boolean; message: string };

  // Purchase Order
  createPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'poNumber'>) => PurchaseOrder;
  updatePurchaseOrderStatus: (id: string, status: PurchaseOrderStatus) => { success: boolean; message: string };
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => { success: boolean; message: string };

  // Users
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;

  // Settings
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  resetToInitialData: () => void;
}

const STORAGE_KEY_PREFIX = 'pt_supplier_v1_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS[0];
      }
    }
    return INITIAL_USERS[0]; // Default logged in as Super Admin for smooth preview
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}categories`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}purchase_orders`);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_ORDERS;
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}movements`);
    return saved ? JSON.parse(saved) : INITIAL_MOVEMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}company_settings`);
    return saved ? JSON.parse(saved) : INITIAL_COMPANY_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Local storage synchronization
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}products`, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}purchase_orders`, JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}movements`, JSON.stringify(movements));
  }, [movements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}company_settings`, JSON.stringify(companySettings));
  }, [companySettings]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const logAction = (action: string, targetType: AuditLog['targetType'], targetId: string | undefined, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys-anon',
      userName: currentUser?.name || 'Sistem',
      role: currentUser?.role || 'admin',
      action,
      targetType,
      targetId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Auth Handlers
  const login = (email: string, role?: UserRole): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      if (found.status === 'inactive') {
        addToast('error', 'Akun ini dinonaktifkan oleh Administrator. Hubungi IT.', 'Akses Ditolak');
        return false;
      }
      const updatedUser: User = {
        ...found,
        role: role || found.role,
        lastLogin: new Date().toISOString(),
      };
      setCurrentUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === found.id ? updatedUser : u)));
      logAction('LOGIN', 'auth', found.id, `User ${found.name} login`);
      addToast('success', `Selamat datang kembali, ${found.name}`, 'Login Berhasil');
      return true;
    } else {
      // Allow custom email login as default admin for demo testing
      const newUser: User = {
        id: `usr-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email,
        role: role || 'admin',
        department: 'Operasional',
        status: 'active',
        lastLogin: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
      setCurrentUser(newUser);
      logAction('LOGIN', 'auth', newUser.id, `User baru ${newUser.name} login`);
      addToast('success', `Akun baru terdaftar dan login sebagai ${newUser.name}`, 'Login Berhasil');
      return true;
    }
  };

  const logout = () => {
    if (currentUser) {
      logAction('LOGOUT', 'auth', currentUser.id, `User ${currentUser.name} keluar sesi`);
    }
    setCurrentUser(null);
    addToast('info', 'Anda telah keluar dari sesi kerja.', 'Logout Berhasil');
  };

  const switchUserRole = (role: UserRole) => {
    const userWithRole = users.find((u) => u.role === role && u.status === 'active');
    if (userWithRole) {
      setCurrentUser(userWithRole);
      addToast('info', `Beralih ke peran: ${userWithRole.name} (${userWithRole.role})`, 'Peran Diubah');
    } else if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      addToast('info', `Peran aktif diubah menjadi: ${role}`, 'Peran Diubah');
    }
  };

  // Supplier CRUD
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSuppliers((prev) => [newSupplier, ...prev]);
    logAction('CREATE_SUPPLIER', 'supplier', newSupplier.id, `Menambahkan supplier baru: ${newSupplier.name}`);
    addToast('success', `Supplier ${newSupplier.name} berhasil disimpan.`, 'Berhasil');
  };

  const updateSupplier = (id: string, supplierData: Partial<Supplier>) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...supplierData, updatedAt: new Date().toISOString() } : s))
    );
    const sup = suppliers.find((s) => s.id === id);
    logAction('UPDATE_SUPPLIER', 'supplier', id, `Memperbarui data supplier: ${sup?.name || id}`);
    addToast('success', 'Data supplier berhasil diperbarui.', 'Berhasil');
  };

  const deleteSupplier = (
    id: string
  ): { success: boolean; actionTaken: 'deleted' | 'deactivated'; message: string } => {
    const sup = suppliers.find((s) => s.id === id);
    if (!sup) return { success: false, actionTaken: 'deleted' as const, message: 'Supplier tidak ditemukan.' };

    // Check if supplier has PO history (PRD 4.3 rule)
    const hasPO = purchaseOrders.some((po) => po.supplierId === id);
    if (hasPO) {
      // Soft deactivate per PRD requirement
      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'inactive', updatedAt: new Date().toISOString() } : s))
      );
      logAction('ARCHIVE_SUPPLIER', 'supplier', id, `Menonaktifkan supplier ${sup.name} karena memiliki histori transaksi`);
      addToast('info', `Supplier "${sup.name}" memiliki riwayat transaksi, status diubah menjadi Nonaktif.`, 'Diarsipkan');
      return {
        success: true,
        actionTaken: 'deactivated',
        message: `Supplier "${sup.name}" memiliki transaksi PO aktif/riwayat. Sesuai aturan perusahaan, statusnya dinonaktifkan (diarsipkan) agar histori data tetap utuh.`,
      };
    } else {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
      logAction('DELETE_SUPPLIER', 'supplier', id, `Menghapus supplier permanen: ${sup.name}`);
      addToast('success', `Supplier "${sup.name}" berhasil dihapus.`, 'Dihapus');
      return {
        success: true,
        actionTaken: 'deleted',
        message: `Supplier "${sup.name}" berhasil dihapus dari sistem.`,
      };
    }
  };

  // Category
  const addCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    logAction('CREATE_CATEGORY', 'product', newCat.id, `Menambahkan kategori: ${newCat.name}`);
    addToast('success', `Kategori ${newCat.name} berhasil ditambahkan.`, 'Berhasil');
  };

  const updateCategory = (id: string, catData: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...catData } : c)));
    addToast('success', 'Kategori produk berhasil diperbarui.', 'Berhasil');
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prd-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);

    // Initial stock movement if stock > 0
    if (newProd.currentStock > 0) {
      const initMovement: InventoryMovement = {
        id: `mov-${Date.now()}`,
        productId: newProd.id,
        type: 'in',
        quantity: newProd.currentStock,
        stockBefore: 0,
        stockAfter: newProd.currentStock,
        referenceType: 'manual',
        referenceId: 'SALDO-AWAL',
        notes: 'Pencatatan saldo persediaan awal saat input produk baru',
        createdBy: currentUser?.name || 'Sistem',
        createdAt: new Date().toISOString(),
      };
      setMovements((prev) => [initMovement, ...prev]);
    }

    logAction('CREATE_PRODUCT', 'product', newProd.id, `Menambahkan produk baru: ${newProd.name} (${newProd.sku})`);
    addToast('success', `Produk ${newProd.name} berhasil disimpan.`, 'Berhasil');
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prodData, updatedAt: new Date().toISOString() } : p))
    );
    const prd = products.find((p) => p.id === id);
    logAction('UPDATE_PRODUCT', 'product', id, `Memperbarui data produk: ${prd?.name || id}`);
    addToast('success', 'Data produk berhasil diperbarui.', 'Berhasil');
  };

  const archiveProduct = (id: string) => {
    const prd = products.find((p) => p.id === id);
    if (!prd) return;
    const newStatus = prd.status === 'active' ? 'archived' : 'active';
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p))
    );
    logAction('ARCHIVE_PRODUCT', 'product', id, `Mengubah status produk ${prd.name} menjadi ${newStatus}`);
    addToast('info', `Status produk ${prd.name} diubah menjadi ${newStatus === 'active' ? 'Aktif' : 'Arsip'}.`, 'Status Diperbarui');
  };

  const deleteProduct = (id: string) => {
    const prd = products.find((p) => p.id === id);
    if (!prd) return { success: false, message: 'Produk tidak ditemukan.' };

    const inPO = purchaseOrders.some((po) => po.items.some((i) => i.productId === id));
    if (inPO) {
      // Soft archive
      archiveProduct(id);
      return {
        success: true,
        message: `Produk "${prd.name}" telah digunakan dalam Purchase Order. Status diubah menjadi Arsip untuk menjaga integritas data.`,
      };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    logAction('DELETE_PRODUCT', 'product', id, `Menghapus produk: ${prd.name}`);
    addToast('success', `Produk ${prd.name} berhasil dihapus.`, 'Dihapus');
    return { success: true, message: `Produk "${prd.name}" berhasil dihapus.` };
  };

  // Stock Movement (PRD 4.5 & Non-negative stock rule)
  const addStockMovement = ({
    productId,
    type,
    quantity,
    notes,
    referenceType,
    referenceId,
  }: {
    productId: string;
    type: MovementType;
    quantity: number;
    notes: string;
    referenceType: ReferenceType;
    referenceId?: string;
  }): { success: boolean; message: string } => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) {
      return { success: false, message: 'Produk tidak ditemukan di database.' };
    }

    if (quantity <= 0) {
      return { success: false, message: 'Jumlah barang harus lebih besar dari 0.' };
    }

    const currentStock = targetProduct.currentStock;
    let newStock = currentStock;

    if (type === 'in') {
      newStock = currentStock + quantity;
    } else if (type === 'out') {
      if (quantity > currentStock) {
        addToast(
          'error',
          `Stok tidak mencukupi! Tersedia: ${currentStock} ${targetProduct.unit}, diminta keluar: ${quantity} ${targetProduct.unit}. Stok tidak boleh bernilai negatif.`,
          'Validasi Stok Gagal'
        );
        return {
          success: false,
          message: `Stok tidak boleh bernilai negatif. Stok saat ini (${currentStock} ${targetProduct.unit}) kurang dari permintaan (${quantity} ${targetProduct.unit}).`,
        };
      }
      newStock = currentStock - quantity;
    } else if (type === 'adjustment') {
      // Opname: quantity is target stock
      newStock = quantity;
      if (newStock < 0) {
        return { success: false, message: 'Stok hasil penyesuaian tidak boleh negatif.' };
      }
    }

    // Atomic update
    const movementRecord: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId,
      type,
      quantity,
      stockBefore: currentStock,
      stockAfter: newStock,
      referenceType,
      referenceId: referenceId || `MUT-${Date.now().toString().slice(-6)}`,
      notes,
      createdBy: currentUser?.name || 'Staf Gudang',
      createdAt: new Date().toISOString(),
    };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, currentStock: newStock, updatedAt: new Date().toISOString() } : p))
    );
    setMovements((prev) => [movementRecord, ...prev]);

    logAction(
      'STOCK_MUTATION',
      'inventory',
      productId,
      `Mutasi ${type.toUpperCase()} sebesar ${quantity} ${targetProduct.unit} untuk produk ${targetProduct.name}. Stok: ${currentStock} -> ${newStock}`
    );

    addToast(
      'success',
      `Mutasi ${type === 'in' ? 'Masuk' : type === 'out' ? 'Keluar' : 'Penyesuaian'} berhasil. Stok ${targetProduct.name} kini: ${newStock} ${targetProduct.unit}.`,
      'Stok Diperbarui'
    );

    return { success: true, message: 'Mutasi persediaan berhasil dicatat.' };
  };

  // Purchase Order Operations
  const createPurchaseOrder = (
    poData: Omit<PurchaseOrder, 'id' | 'createdAt' | 'updatedAt' | 'poNumber'>
  ): PurchaseOrder => {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const seq = String(purchaseOrders.length + 1).padStart(4, '0');
    const poNumber = `PO/PTS/${currentYear}/${currentMonth}/${seq}`;

    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPurchaseOrders((prev) => [newPO, ...prev]);
    logAction('CREATE_PO', 'po', newPO.id, `Membuat Purchase Order ${newPO.poNumber} untuk ${newPO.supplierName}`);
    addToast('success', `Purchase Order ${newPO.poNumber} berhasil dibuat dengan status ${newPO.status.toUpperCase()}.`, 'PO Dibuat');
    return newPO;
  };

  const updatePurchaseOrderStatus = (id: string, newStatus: PurchaseOrderStatus) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po) return { success: false, message: 'Purchase Order tidak ditemukan.' };

    const oldStatus = po.status;

    // Rule: Cannot delete or cancel received order arbitrarily
    if (oldStatus === 'received' && newStatus === 'cancelled') {
      addToast('error', 'Pesanan yang telah berstatus Diterima tidak dapat dibatalkan secara langsung.', 'Operasi Ditolak');
      return { success: false, message: 'Pesanan yang telah diterima tidak dapat dibatalkan.' };
    }

    const now = new Date().toISOString();
    let updatedPO: PurchaseOrder = {
      ...po,
      status: newStatus,
      updatedAt: now,
    };

    if (newStatus === 'approved') {
      updatedPO.approvedBy = currentUser?.name || 'Admin';
    }

    // When status changes to RECEIVED: Automatically record stock in for all items!
    if (newStatus === 'received' && oldStatus !== 'received') {
      updatedPO.receivedAt = now;
      updatedPO.receivedBy = currentUser?.name || 'Staf Gudang';

      // Update product stocks & create movements
      const newMovements: InventoryMovement[] = [];
      const updatedProducts = [...products];

      po.items.forEach((item) => {
        const prodIndex = updatedProducts.findIndex((p) => p.id === item.productId);
        if (prodIndex >= 0) {
          const p = updatedProducts[prodIndex];
          const stockBefore = p.currentStock;
          const stockAfter = stockBefore + item.quantity;

          updatedProducts[prodIndex] = {
            ...p,
            currentStock: stockAfter,
            updatedAt: now,
          };

          newMovements.push({
            id: `mov-${Date.now()}-${item.id}`,
            productId: item.productId,
            type: 'in',
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            referenceType: 'po',
            referenceId: po.poNumber,
            notes: `Penerimaan barang fisik dari PO ${po.poNumber} (${po.supplierName})`,
            createdBy: currentUser?.name || 'Staf Gudang',
            createdAt: now,
          });
        }
      });

      setProducts(updatedProducts);
      setMovements((prev) => [...newMovements, ...prev]);

      logAction(
        'RECEIVE_PO',
        'po',
        po.id,
        `Penerimaan barang PO ${po.poNumber}: Seluruh ${po.items.length} item otomatis dimasukkan ke stok persediaan gudang`
      );

      addToast(
        'success',
        `PO ${po.poNumber} berstatus DITERIMA. Persediaan ${po.items.length} jenis produk telah otomatis ditambahkan ke stok gudang!`,
        'Barang Diterima & Stok Masuk'
      );
    } else {
      logAction('UPDATE_PO_STATUS', 'po', po.id, `Status PO ${po.poNumber} diubah: ${oldStatus} -> ${newStatus}`);
      addToast('info', `Status PO ${po.poNumber} diubah menjadi: ${newStatus.toUpperCase()}`, 'Status PO Berubah');
    }

    setPurchaseOrders((prev) => prev.map((p) => (p.id === id ? updatedPO : p)));
    return { success: true, message: `Status PO berhasil diperbarui menjadi ${newStatus}.` };
  };

  const updatePurchaseOrder = (id: string, poData: Partial<PurchaseOrder>) => {
    setPurchaseOrders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...poData, updatedAt: new Date().toISOString() } : p))
    );
    addToast('success', 'Perubahan Purchase Order berhasil disimpan.', 'Berhasil');
  };

  const deletePurchaseOrder = (id: string) => {
    const po = purchaseOrders.find((p) => p.id === id);
    if (!po) return { success: false, message: 'PO tidak ditemukan.' };

    // PRD Section 4.6 rule: "Pesanan yang telah diterima tidak boleh dihapus secara permanen agar riwayat pembelian tetap valid."
    if (po.status === 'received') {
      addToast(
        'error',
        'Pesanan yang telah Diterima tidak boleh dihapus permanen untuk melindungi validitas akuntansi & audit.',
        'Penghapusan Ditolak'
      );
      return {
        success: false,
        message: 'Pesanan yang telah diterima tidak boleh dihapus secara permanen agar riwayat pembelian tetap valid.',
      };
    }

    setPurchaseOrders((prev) => prev.filter((p) => p.id !== id));
    logAction('DELETE_PO', 'po', id, `Menghapus Purchase Order ${po.poNumber}`);
    addToast('success', `Purchase Order ${po.poNumber} telah dihapus.`, 'PO Dihapus');
    return { success: true, message: `PO ${po.poNumber} berhasil dihapus.` };
  };

  // User management
  const addUser = (userData: Omit<User, 'id' | 'lastLogin'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastLogin: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    logAction('CREATE_USER', 'user', newUser.id, `Mendaftarkan pengguna baru: ${newUser.name} (${newUser.role})`);
    addToast('success', `Pengguna ${newUser.name} berhasil ditambahkan.`, 'Berhasil');
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...userData } : null));
    }
    logAction('UPDATE_USER', 'user', id, `Memperbarui data akun pengguna ID: ${id}`);
    addToast('success', 'Data pengguna berhasil diperbarui.', 'Berhasil');
  };

  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => ({ ...prev, ...newSettings }));
    logAction('UPDATE_SETTINGS', 'system', undefined, 'Memperbarui konfigurasi profil perusahaan');
    addToast('success', 'Pengaturan profil perusahaan berhasil disimpan.', 'Berhasil');
  };

  const resetToInitialData = () => {
    setCurrentUser(INITIAL_USERS[0]);
    setUsers(INITIAL_USERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setPurchaseOrders(INITIAL_PURCHASE_ORDERS);
    setMovements(INITIAL_MOVEMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setActiveTab('dashboard');

    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_KEY_PREFIX))
      .forEach((k) => localStorage.removeItem(k));

    addToast('info', 'Database sistem telah dikembalikan ke data awal demo.', 'Reset Sukses');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        suppliers,
        categories,
        products,
        purchaseOrders,
        movements,
        auditLogs,
        companySettings,
        activeTab,
        setActiveTab,
        toasts,
        addToast,
        removeToast,
        login,
        logout,
        switchUserRole,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        addCategory,
        updateCategory,
        addProduct,
        updateProduct,
        archiveProduct,
        deleteProduct,
        addStockMovement,
        createPurchaseOrder,
        updatePurchaseOrderStatus,
        updatePurchaseOrder,
        deletePurchaseOrder,
        addUser,
        updateUser,
        updateCompanySettings,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
