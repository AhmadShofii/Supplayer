import React from 'react';
import { X, Printer, Download, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDate, formatRupiah, getPOStatusColor, getPOStatusLabel } from '../lib/formatters';
import { PurchaseOrder } from '../types';

interface PurchaseOrderVoucherModalProps {
  po: PurchaseOrder;
  onClose: () => void;
}

export const PurchaseOrderVoucherModal: React.FC<PurchaseOrderVoucherModalProps> = ({ po, onClose }) => {
  const { companySettings, suppliers } = useApp();
  const supplier = suppliers.find((s) => s.id === po.supplierId);
  const statusColor = getPOStatusColor(po.status);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full border border-slate-200 shadow-2xl my-8 overflow-hidden text-xs">
        {/* Action Bar (Hidden when printing) */}
        <div className="bg-[#23374D] px-6 py-3.5 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#8FA99B]">{po.poNumber}</span>
            <span className="text-slate-400">·</span>
            <span className="text-xs font-semibold">Voucher Purchase Order Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8FA99B] hover:bg-[#7c9789] text-[#23374D] font-bold rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-300 hover:text-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Paper */}
        <div className="p-8 space-y-6 bg-white text-[#27313B]" id="printable-voucher">
          {/* Header PT Supplier */}
          <div className="flex items-start justify-between border-b-2 border-[#23374D] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#23374D] text-[#8FA99B] flex items-center justify-center font-black text-sm">
                  PTS
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-[#23374D] tracking-tight">
                    {companySettings.name}
                  </h1>
                  <p className="text-[11px] text-slate-500">{companySettings.address}</p>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-mono space-y-0.5">
                <div>NPWP: {companySettings.npwp} · Telp: {companySettings.phone}</div>
                <div>Email: {companySettings.email} · Web: {companySettings.website}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-[#23374D] tracking-wider uppercase block">
                SURAT PESANAN PEMBELIAN
              </span>
              <span className="text-lg font-mono font-black text-[#23374D] block mt-0.5">
                {po.poNumber}
              </span>
              <div className="mt-2 inline-block">
                <span
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${statusColor.bg} ${statusColor.text} ${statusColor.border}`}
                >
                  STATUS: {getPOStatusLabel(po.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Supplier and Order Metadata */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                DITUJUKAN KEPADA VENDOR (SUPPLIER)
              </span>
              <div className="font-bold text-sm text-[#23374D]">{po.supplierName}</div>
              <div className="text-[11px] text-slate-600 mt-1">
                UP: {supplier?.contactPerson || 'Bagian Sales & Order'}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                Telp: {supplier?.phone || '-'} · Email: {supplier?.email || '-'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Alamat: {supplier?.address || '-'}
              </div>
            </div>

            <div className="space-y-1.5 text-right font-mono text-xs">
              <div>
                <span className="text-slate-500 font-sans text-[11px] mr-2">Tanggal Terbit PO:</span>
                <strong className="text-slate-900">{formatDate(po.orderDate)}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[11px] mr-2">Target Pengiriman:</span>
                <strong className="text-slate-900">{formatDate(po.expectedDeliveryDate)}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-sans text-[11px] mr-2">Pembuat Dokumen:</span>
                <span className="text-slate-700">{po.createdBy}</span>
              </div>
              {po.approvedBy && (
                <div>
                  <span className="text-slate-500 font-sans text-[11px] mr-2">Disetujui Oleh:</span>
                  <span className="text-emerald-700 font-semibold">{po.approvedBy}</span>
                </div>
              )}
              {po.receivedAt && (
                <div>
                  <span className="text-slate-500 font-sans text-[11px] mr-2">Diterima Gudang:</span>
                  <span className="text-emerald-700 font-semibold">{formatDate(po.receivedAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#23374D] text-white text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-2.5 text-center w-10">No</th>
                  <th className="p-2.5">SKU</th>
                  <th className="p-2.5">Deskripsi Item Barang</th>
                  <th className="p-2.5 text-right">Qty</th>
                  <th className="p-2.5">Satuan</th>
                  <th className="p-2.5 text-right">Harga Satuan (Rp)</th>
                  <th className="p-2.5 text-right">Subtotal (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {po.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-mono font-semibold text-[#23374D]">{item.sku}</td>
                    <td className="p-2.5 font-medium text-slate-800">{item.productName}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-slate-900">{item.quantity}</td>
                    <td className="p-2.5 text-slate-600">{item.unit}</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#23374D]">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculation Summary & Notes */}
          <div className="grid grid-cols-2 gap-6 items-start">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Catatan & Syarat Pengadaan
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                {po.notes || 'Barang harus dikirim sesuai spesifikasi teknis dan standar mutu yang disepakati.'}
              </p>
              <div className="mt-2 text-[10px] text-slate-400">
                Lampirkan salinan PO ini saat pengiriman fisik bersama Surat Jalan resmi.
              </div>
            </div>

            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 font-mono text-xs">
              <div className="p-2 flex justify-between">
                <span className="font-sans text-slate-500">Subtotal Belanja:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(po.subtotal)}</span>
              </div>
              <div className="p-2 flex justify-between">
                <span className="font-sans text-slate-500">PPN ({po.taxPercent}%):</span>
                <span className="text-slate-800">{formatRupiah(po.taxAmount)}</span>
              </div>
              <div className="p-2.5 flex justify-between bg-slate-100 font-bold text-sm text-[#23374D]">
                <span className="font-sans">Grand Total:</span>
                <span>{formatRupiah(po.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Signatures Column */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <span className="text-slate-400 block mb-14 text-[10px] uppercase font-bold">
                Dibuat Oleh (Purchasing)
              </span>
              <div className="font-semibold border-t border-slate-300 pt-1 text-slate-800">
                {po.createdBy}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-14 text-[10px] uppercase font-bold">
                Disetujui Oleh (Admin / Direksi)
              </span>
              <div className="font-semibold border-t border-slate-300 pt-1 text-slate-800">
                {po.approvedBy || '( Belum Disetujui )'}
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-14 text-[10px] uppercase font-bold">
                Dikonfirmasi Vendor Supplier
              </span>
              <div className="font-semibold border-t border-slate-300 pt-1 text-slate-800">
                {po.supplierName}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
