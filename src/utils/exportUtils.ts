import { jsPDF } from 'jspdf';
import { Trip, TripActivity, User } from '../types';
import { calculateDurationDays, formatDate, formatTime, getDaysArray } from './dateUtils';
import { calculateTripFinancials } from './budgetCalculations';
import { formatCurrency, SupportedCurrency } from './currency';

/**
 * Clean string for safe file naming
 */
export function sanitizeFilename(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .slice(0, 40) || 'voyara_trip';
}

/**
 * Export trip as formatted JSON file
 */
export function exportTripToJSON(trip: Trip, currency: SupportedCurrency = 'INR'): void {
  const financials = calculateTripFinancials(trip);
  const duration = calculateDurationDays(trip.startDate, trip.endDate);

  const exportData = {
    voyaraSchemaVersion: '2.0.0',
    exportedAt: new Date().toISOString(),
    tripOverview: {
      id: trip.id,
      title: trip.title,
      description: trip.description,
      status: trip.status,
      visibility: trip.visibility || 'private',
      startDate: trip.startDate,
      endDate: trip.endDate,
      durationDays: duration,
      currency: currency,
      totalBudget: trip.totalBudget,
      formattedBudget: formatCurrency(trip.totalBudget, currency),
      coverImage: trip.coverImage,
      tags: trip.tags || [],
      notes: trip.notes || '',
    },
    financialSummary: {
      totalEstimatedCost: financials.totalEstimatedCost,
      formattedEstimatedCost: formatCurrency(financials.totalEstimatedCost, currency),
      remainingBudget: financials.remainingBudget,
      percentUsed: financials.percentUsed,
      isOverBudget: financials.isOverBudget,
      costPerDay: financials.costPerDay,
      categoryBreakdown: {
        accommodation: financials.breakdown.accommodation,
        transport: financials.breakdown.transport,
        activities: financials.breakdown.activities,
        food: financials.breakdown.food,
        miscellaneous: financials.breakdown.miscellaneous,
      },
    },
    stops: (trip.stops || []).map((stop, index) => ({
      stopNumber: index + 1,
      id: stop.id,
      cityName: stop.cityName,
      country: stop.country,
      region: stop.region,
      arrivalDate: stop.arrivalDate,
      departureDate: stop.departureDate,
      accommodationName: stop.accommodationName || 'Not specified',
      accommodationCost: stop.accommodationCost,
      formattedAccommodationCost: formatCurrency(stop.accommodationCost, currency),
      coordinates: stop.coordinates,
      transportToStop: stop.transportToStop || null,
      notes: stop.notes || '',
      activitiesCount: (stop.activities || []).length,
      activities: (stop.activities || []).map((act) => ({
        id: act.id,
        title: act.title,
        category: act.category,
        date: act.date,
        time: act.time,
        durationMinutes: act.durationMinutes,
        cost: act.cost,
        formattedCost: act.cost > 0 ? formatCurrency(act.cost, currency) : 'Free',
        location: act.location,
        completed: !!act.completed,
        notes: act.notes || '',
      })),
    })),
    members: (trip.members || []).map((m) => ({
      name: m.name,
      email: m.email,
      role: m.role,
    })),
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `${sanitizeFilename(trip.title)}_itinerary.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Generate and download high-grade offline PDF document
 */
export function exportTripToPDF(
  trip: Trip,
  currency: SupportedCurrency = 'INR',
  user?: User | null
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 16;

  const financials = calculateTripFinancials(trip);
  const daysArray = getDaysArray(trip.startDate, trip.endDate);
  const duration = calculateDurationDays(trip.startDate, trip.endDate);

  // Helper for adding footer to all pages
  const addFooters = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      // Bottom separator
      doc.setDrawColor(231, 229, 228); // #E7E5E4
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      // Footer branding
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(194, 65, 12); // #C2410C
      doc.text('VOYARA TRAVEL CLUB', margin, pageHeight - 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108); // #78716C
      doc.text('Official Offline Master Itinerary', margin + 38, pageHeight - 7);

      const pageText = `Page ${i} of ${totalPages}`;
      doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 7);
    }
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 18;
      return true;
    }
    return false;
  };

  // --- PAGE 1: HEADER & BANNER ---
  // Top Rust Accent Bar
  doc.setFillColor(194, 65, 12); // #C2410C
  doc.rect(margin, currentY, contentWidth, 3, 'F');
  currentY += 8;

  // App / Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(194, 65, 12);
  doc.text('GLOBAL TROTTERS & VOYARA TRAVEL CLUB', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108);
  const dateExported = `Generated on ${formatDate(new Date().toISOString(), 'medium')}`;
  doc.text(dateExported, pageWidth - margin - doc.getTextWidth(dateExported), currentY);
  currentY += 7;

  // Trip Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(28, 25, 23); // #1C1917
  const titleLines = doc.splitTextToSize(trip.title, contentWidth);
  doc.text(titleLines, margin, currentY);
  currentY += titleLines.length * 8 + 2;

  // Trip Subtitle / Dates
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 113, 108);
  const datesText = `${formatDate(trip.startDate, 'full')} – ${formatDate(trip.endDate, 'full')} (${duration} Days)`;
  doc.text(datesText, margin, currentY);
  currentY += 8;

  // Curator / Traveler info
  if (user) {
    doc.setFontSize(8.5);
    doc.setTextColor(41, 37, 36);
    doc.text(`Lead Curator: ${user.name} (${user.email})`, margin, currentY);
    currentY += 6;
  }

  // Description block if present
  if (trip.description) {
    doc.setFillColor(251, 251, 250); // #FBFBFA
    doc.setDrawColor(231, 229, 228);
    doc.setLineWidth(0.2);

    const descLines = doc.splitTextToSize(trip.description, contentWidth - 8);
    const boxHeight = descLines.length * 4.5 + 6;
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(68, 64, 60);
    doc.text(descLines, margin + 4, currentY + 5);
    currentY += boxHeight + 6;
  }

  // --- METRIC HIGHLIGHTS CARDS (4-column grid) ---
  checkPageBreak(25);
  const cardWidth = (contentWidth - 9) / 4;
  const cardHeight = 18;

  const metrics = [
    { label: 'DURATION', val: `${duration} Days` },
    { label: 'DESTINATIONS', val: `${trip.stops?.length || 0} Cities` },
    {
      label: 'TOTAL BUDGET',
      val: formatCurrency(trip.totalBudget, currency),
    },
    {
      label: 'ESTIMATED COST',
      val: formatCurrency(financials.totalEstimatedCost, currency),
    },
  ];

  metrics.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    doc.setFillColor(245, 244, 240); // #F5F4F0
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 113, 108);
    doc.text(m.label, cardX + 3.5, currentY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(28, 25, 23);
    doc.text(m.val, cardX + 3.5, currentY + 12);
  });
  currentY += cardHeight + 8;

  // --- ROUTE & DESTINATION STOPS OVERVIEW ---
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 25, 23);
  doc.text('1. Destination Route & Stays', margin, currentY);
  currentY += 5;

  // Table header for stops
  doc.setFillColor(28, 25, 23);
  doc.rect(margin, currentY, contentWidth, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('#', margin + 3, currentY + 4.2);
  doc.text('City & Country', margin + 12, currentY + 4.2);
  doc.text('Stay Dates', margin + 65, currentY + 4.2);
  doc.text('Accommodation', margin + 115, currentY + 4.2);
  doc.text('Est. Cost', pageWidth - margin - 20, currentY + 4.2);
  currentY += 6;

  (trip.stops || []).forEach((stop, idx) => {
    checkPageBreak(10);
    const isEven = idx % 2 === 0;
    doc.setFillColor(isEven ? 255 : 250, isEven ? 255 : 249, isEven ? 255 : 247);
    doc.rect(margin, currentY, contentWidth, 7, 'F');
    doc.setDrawColor(231, 229, 228);
    doc.line(margin, currentY + 7, pageWidth - margin, currentY + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(194, 65, 12);
    doc.text(String(idx + 1), margin + 3, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(28, 25, 23);
    doc.text(`${stop.cityName}, ${stop.country}`, margin + 12, currentY + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108);
    const stopDates = `${formatDate(stop.arrivalDate, 'short')} - ${formatDate(stop.departureDate, 'short')}`;
    doc.text(stopDates, margin + 65, currentY + 4.8);

    doc.setTextColor(41, 37, 36);
    const hotel = (stop.accommodationName || 'Local Stay').slice(0, 24);
    doc.text(hotel, margin + 115, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(28, 25, 23);
    const costFormatted = formatCurrency(stop.accommodationCost, currency);
    doc.text(costFormatted, pageWidth - margin - 20, currentY + 4.8);

    currentY += 7;
  });
  currentY += 6;

  // --- DAY BY DAY DETAILED SCHEDULE ---
  checkPageBreak(25);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 25, 23);
  doc.text('2. Day-Wise Chronological Schedule', margin, currentY);
  currentY += 6;

  daysArray.forEach((dayDate, dayIdx) => {
    // Find stop that includes this date
    const currentStop = (trip.stops || []).find((s) => {
      return dayDate >= s.arrivalDate && dayDate <= s.departureDate;
    }) || trip.stops?.[0];

    // Find activities for this day
    const dayActivities: TripActivity[] = [];
    (trip.stops || []).forEach((s) => {
      (s.activities || []).forEach((act) => {
        if (act.date === dayDate) {
          dayActivities.push(act);
        }
      });
    });

    // Sort by time
    dayActivities.sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

    checkPageBreak(20 + dayActivities.length * 8);

    // Day Header Bar
    doc.setFillColor(245, 244, 240); // #F5F4F0
    doc.setDrawColor(231, 229, 228);
    doc.roundedRect(margin, currentY, contentWidth, 7, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(194, 65, 12);
    doc.text(`DAY ${dayIdx + 1}`, margin + 3, currentY + 4.8);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(28, 25, 23);
    doc.text(formatDate(dayDate, 'full'), margin + 20, currentY + 4.8);

    if (currentStop) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      const cityTag = `📍 ${currentStop.cityName}, ${currentStop.country}`;
      doc.text(cityTag, pageWidth - margin - doc.getTextWidth(cityTag) - 3, currentY + 4.8);
    }
    currentY += 8.5;

    // List activities or empty rest notice
    if (dayActivities.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 113, 108);
      doc.text('• Open exploration / Leisure transit / Free time scheduled.', margin + 6, currentY + 3.5);
      currentY += 6;
    } else {
      dayActivities.forEach((act) => {
        checkPageBreak(10);
        doc.setDrawColor(231, 229, 228);
        doc.line(margin + 5, currentY + 7, pageWidth - margin - 5, currentY + 7);

        // Time
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(194, 65, 12);
        doc.text(formatTime(act.time || '09:00'), margin + 5, currentY + 4.5);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(28, 25, 23);
        const actTitle = act.title.slice(0, 48);
        doc.text(actTitle, margin + 26, currentY + 4.5);

        // Category Tag
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(120, 113, 108);
        doc.text(`[${act.category}] • ${act.durationMinutes}m`, margin + 115, currentY + 4.5);

        // Cost
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(28, 25, 23);
        const costStr = act.cost > 0 ? formatCurrency(act.cost, currency) : 'Free';
        doc.text(costStr, pageWidth - margin - 20, currentY + 4.5);

        currentY += 7.5;
      });
      currentY += 2;
    }
  });

  // --- FINANCIAL BREAKDOWN SUMMARY ---
  checkPageBreak(40);
  currentY += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 25, 23);
  doc.text('3. Comprehensive Financial Budget Breakdown', margin, currentY);
  currentY += 5;

  doc.setFillColor(251, 251, 250);
  doc.setDrawColor(231, 229, 228);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  const budgetItems = [
    { label: 'Accommodations & Hotels', amount: financials.breakdown.accommodation },
    { label: 'Transit & Local Mobility', amount: financials.breakdown.transport },
    { label: 'Curated Activities & Excursions', amount: financials.breakdown.activities },
    { label: 'Dining & Food Provisioning', amount: financials.breakdown.food },
    { label: 'Contingency & Miscellaneous', amount: financials.breakdown.miscellaneous },
  ];

  let bY = currentY + 5;
  budgetItems.forEach((b) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(68, 64, 60);
    doc.text(b.label, margin + 5, bY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(28, 25, 23);
    const val = formatCurrency(b.amount, currency);
    doc.text(val, margin + 80, bY);
    bY += 5;
  });

  // Total summary on right of the box
  doc.setDrawColor(231, 229, 228);
  doc.line(margin + 105, currentY + 3, margin + 105, currentY + 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.text('TARGET BUDGET', margin + 112, currentY + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(28, 25, 23);
  doc.text(formatCurrency(trip.totalBudget, currency), margin + 112, currentY + 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 113, 108);
  doc.text('ESTIMATED EXPENDITURE', margin + 112, currentY + 19);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(194, 65, 12);
  doc.text(formatCurrency(financials.totalEstimatedCost, currency), margin + 112, currentY + 24);

  currentY += 38;

  // --- OFFLINE TRAVEL ADVICE & HELPLINE ---
  checkPageBreak(25);
  doc.setFillColor(254, 243, 199); // #FEF3C7 amber-100
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(margin, currentY, contentWidth, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('✈ OFFLINE TRAVEL GUIDELINES & BACKUP', margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  doc.text(
    'Keep this offline PDF saved on your mobile device. For airport immigration and rail transit checks, present this schedule along with your valid passport and booking confirmation codes.',
    margin + 4,
    currentY + 10,
    { maxWidth: contentWidth - 8 }
  );

  // Apply footers to all generated pages
  addFooters();

  // Save the PDF
  doc.save(`${sanitizeFilename(trip.title)}_itinerary.pdf`);
}

/**
 * Open high-definition printable browser dialog
 */
export function printItineraryVoucher(trip: Trip, currency: SupportedCurrency = 'INR'): void {
  window.print();
}
