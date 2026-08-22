import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileCode,
  Printer,
  CheckCircle2,
  X,
  Sparkles,
  Shield,
  Layers,
  Calendar,
  DollarSign,
  Info,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Trip, User } from '../types';
import { exportTripToJSON, exportTripToPDF, printItineraryVoucher, sanitizeFilename } from '../utils/exportUtils';
import { formatCurrency, SupportedCurrency } from '../utils/currency';
import { calculateDurationDays, formatDate } from '../utils/dateUtils';
import { calculateTripFinancials } from '../utils/budgetCalculations';

interface ExportTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
  currentUser?: User | null;
  currency?: SupportedCurrency;
}

export const ExportTripModal: React.FC<ExportTripModalProps> = ({
  isOpen,
  onClose,
  trip,
  currentUser,
  currency = 'INR',
}) => {
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);

  if (!isOpen || !trip) return null;

  const financials = calculateTripFinancials(trip);
  const duration = calculateDurationDays(trip.startDate, trip.endDate);
  const totalActivities = (trip.stops || []).reduce(
    (acc, stop) => acc + (stop.activities || []).length,
    0
  );

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      try {
        exportTripToPDF(trip, currency, currentUser);
        setExportSuccess('PDF itinerary downloaded successfully!');
        setTimeout(() => setExportSuccess(null), 4000);
      } catch (err) {
        console.error('PDF Export Error:', err);
      } finally {
        setIsExportingPDF(false);
      }
    }, 300);
  };

  const handleExportJSON = () => {
    setIsExportingJSON(true);
    setTimeout(() => {
      try {
        exportTripToJSON(trip, currency);
        setExportSuccess('JSON data package downloaded successfully!');
        setTimeout(() => setExportSuccess(null), 4000);
      } catch (err) {
        console.error('JSON Export Error:', err);
      } finally {
        setIsExportingJSON(false);
      }
    }, 200);
  };

  const handlePrint = () => {
    printItineraryVoucher(trip, currency);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1C1917]/75 backdrop-blur-md overflow-y-auto animate-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-3xl shadow-2xl border border-[#E7E5E4] overflow-hidden my-auto animate-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#1C1917] text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C2410C] text-white flex items-center justify-center shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[2px] text-[#C2410C] block">
                Offline Backup & Syndication
              </span>
              <h2 className="font-editorial-serif text-2xl font-bold tracking-tight text-white">
                Export Trip Itinerary
              </h2>
            </div>
          </div>

          <button
            id="close-export-modal-btn"
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-[#FFFFFF]">
          {/* Trip Summary Pill */}
          <div className="p-4 rounded-2xl bg-[#FBFBFA] border border-[#E7E5E4] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                  Active Travel Plan
                </span>
              </div>
              <h3 className="font-editorial-serif text-lg font-bold text-[#1C1917]">
                {trip.title}
              </h3>
              <p className="text-xs text-[#78716C] mt-0.5">
                {formatDate(trip.startDate, 'medium')} – {formatDate(trip.endDate, 'medium')} • {duration} Days • {trip.stops?.length || 0} Cities
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#FFF7ED] px-3 py-1.5 rounded-xl border border-[#FED7AA] shrink-0 self-start sm:self-center">
              <DollarSign className="w-4 h-4 text-[#C2410C]" />
              <div>
                <span className="text-[9px] font-bold uppercase text-[#C2410C] block leading-none">
                  Est. Total
                </span>
                <span className="font-editorial-serif font-bold text-sm text-[#1C1917]">
                  {formatCurrency(financials.totalEstimatedCost, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {exportSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportSuccess}</span>
            </div>
          )}

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option 1: PDF Export */}
            <div className="p-5 rounded-2xl border-2 border-[#E7E5E4] hover:border-[#C2410C] hover:bg-[#FFF7ED]/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center group-hover:bg-[#C2410C] group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100/70 text-rose-800 px-2 py-0.5 rounded-full">
                    Print / PDF
                  </span>
                </div>
                <h4 className="font-editorial-serif font-bold text-base text-[#1C1917] mb-1">
                  Offline PDF Document
                </h4>
                <p className="text-xs text-[#78716C] leading-relaxed mb-4">
                  Formatted multi-page document with day-wise activity schedule, hotel details, transport links, and emergency offline guides.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E7E5E4]">
                <button
                  id="btn-download-pdf"
                  disabled={isExportingPDF}
                  onClick={handleExportPDF}
                  className="w-full py-2.5 px-4 bg-[#C2410C] hover:bg-[#9A3412] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70"
                >
                  {isExportingPDF ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download PDF ({sanitizeFilename(trip.title)}.pdf)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full py-2 px-3 bg-[#F5F4F0] hover:bg-[#E7E5E4] text-[#1C1917] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#78716C]" />
                  <span>Direct Browser Print (A4)</span>
                </button>
              </div>
            </div>

            {/* Option 2: JSON Export */}
            <div className="p-5 rounded-2xl border-2 border-[#E7E5E4] hover:border-[#C2410C] hover:bg-[#FFF7ED]/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center group-hover:bg-[#1C1917] group-hover:text-white transition-colors">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100/70 text-blue-800 px-2 py-0.5 rounded-full">
                    Raw JSON Data
                  </span>
                </div>
                <h4 className="font-editorial-serif font-bold text-base text-[#1C1917] mb-1">
                  Structured JSON Package
                </h4>
                <p className="text-xs text-[#78716C] leading-relaxed mb-4">
                  Full structured JSON schema including coordinates, cost indices, activity metadata, and financial snapshots for backup or migration.
                </p>
              </div>

              <div className="pt-2 border-t border-[#E7E5E4]">
                <button
                  id="btn-download-json"
                  disabled={isExportingJSON}
                  onClick={handleExportJSON}
                  className="w-full py-2.5 px-4 bg-[#1C1917] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-70"
                >
                  {isExportingJSON ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download JSON ({sanitizeFilename(trip.title)}.json)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Included Features List */}
          <div className="p-4 rounded-2xl bg-[#F5F4F0] border border-[#E7E5E4] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
              <Shield className="w-4 h-4 text-[#C2410C]" />
              <span>Offline Master Data Guarantee</span>
            </div>
            <p className="text-[11px] text-[#78716C] leading-relaxed">
              Exported files do not require internet access. All {trip.stops?.length || 0} destination stops, {totalActivities} curated experiences, budget breakdowns, and accommodation notes are fully bundled into your offline file.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FBFBFA] border-t border-[#E7E5E4] flex items-center justify-between">
          <span className="text-[11px] text-[#78716C]">
            Exported in <span className="font-bold text-[#1C1917]">{currency}</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1C1917] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
