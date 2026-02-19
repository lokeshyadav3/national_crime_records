import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  caseDetails: any;
  persons: any[];
  supplementaryStatements: any[];
  evidence: any[];
  trackingRecords: any[];
  logoBase64?: string;
  emblemBase64?: string;
}

const DEFAULT_PHOTO_URL = '/unknown.jpg';

// Helper to load image from URL/Path as Data URL
async function loadImage(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Failed to load image:', url);
    return null;
  }
}

// Load person photo with fallback to unknown.jpg
async function loadPersonPhoto(photoUrl: string | null): Promise<string | null> {
  const loaded = await loadImage(photoUrl);
  if (loaded) return loaded;
  return await loadImage(DEFAULT_PHOTO_URL);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch { return 'N/A'; }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return 'N/A'; }
}

function fullName(first: string, middle: string | null, last: string): string {
  return [first, middle, last].filter(Boolean).join(' ');
}

// Helper: Add image safely based on Data URL
function addImageSafe(doc: jsPDF, dataUrl: string, x: number, y: number, w: number, h: number) {
  try {
    const match = dataUrl.match(/^data:image\/(\w+);base64,/);
    const format = match ? match[1].toUpperCase() : 'JPEG';
    doc.addImage(dataUrl, format, x, y, w, h);
  } catch (e) {
    console.error('Failed to embed image:', e);
  }
}

export async function generateFIRReport(data: ReportData) {
  const { caseDetails: c, persons, supplementaryStatements, evidence, trackingRecords, logoBase64, emblemBase64 } = data;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const colors = {
    primary: [12, 35, 64] as [number, number, number],
    secondary: [30, 58, 95] as [number, number, number],
    gold: [212, 168, 83] as [number, number, number],
    text: [30, 30, 30] as [number, number, number],
    lightGray: [245, 245, 248] as [number, number, number],
    border: [180, 180, 195] as [number, number, number],
    red: [180, 40, 40] as [number, number, number],
  };

  // ── Helper: check page space ──
  function checkPage(needed: number) {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = margin;
      addPageBorder();
    }
  }

  // ── Helper: page border ──
  function addPageBorder() {
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.5);
    doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.3);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  }

  // ── Helper: numbered section header ──
  let sectionCounter = 0;
  function sectionTitle(title: string) {
    sectionCounter++;
    checkPage(14);
    y += 3;
    doc.setFillColor(...colors.primary);
    doc.roundedRect(margin, y, contentWidth, 8, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(`${sectionCounter}. ${title.toUpperCase()}`, margin + 4, y + 5.8);
    y += 11;
    doc.setTextColor(...colors.text);
  }

  // ── Helper: field in a grid row ──
  function fieldRow(label: string, value: string, startX?: number, maxWidth?: number): number {
    const sx = startX ?? margin;
    const mw = maxWidth ?? contentWidth;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(label + ':', sx, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.text);
    const lines = doc.splitTextToSize(value || 'N/A', mw - 35);
    doc.text(lines, sx + 34, y);
    const h = Math.max(lines.length * 4, 5);
    return h;
  }

  // ── Helper: two-column field ──
  function fieldRowTwoCol(l1: string, v1: string, l2: string, v2: string) {
    const half = contentWidth / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(l1 + ':', margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.text);
    doc.text(v1 || 'N/A', margin + 34, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(90, 90, 90);
    doc.text(l2 + ':', margin + half, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...colors.text);
    doc.text(v2 || 'N/A', margin + half + 34, y);

    return 5;
  }

  // ── Helper: person detail block with photo ──
  async function personBlock(p: any, roleLabel?: string) {
    checkPage(55);
    const blockStartY = y;

    // Load photo (fallback to unknown.jpg)
    const photoBase64 = await loadPersonPhoto(p.photo || p.person_photo);
    const photoW = 28;
    const photoH = 35;

    // Photo on RIGHT side
    if (photoBase64) {
      // Photo border
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.3);
      doc.rect(pageWidth - margin - photoW - 1, blockStartY - 1, photoW + 2, photoH + 2);
      addImageSafe(doc, photoBase64, pageWidth - margin - photoW, blockStartY, photoW, photoH);
    }

    const detailsWidth = contentWidth - (photoBase64 ? photoW + 8 : 0);

    if (roleLabel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.primary);
      doc.text(`[${roleLabel}]`, margin, y);
      y += 5;
    }

    y += fieldRow('Full Name', fullName(p.first_name, p.middle_name, p.last_name), margin, detailsWidth);
    y += fieldRowTwoCol('Gender', p.gender || 'N/A', 'DOB', p.date_of_birth ? formatDate(p.date_of_birth) : 'N/A');
    y += fieldRowTwoCol('Citizenship', p.citizenship || 'N/A', 'National ID', p.national_id || 'N/A');
    y += fieldRow('Contact', p.contact_number || 'N/A', margin, detailsWidth);
    y += fieldRow('Email', p.email || 'N/A', margin, detailsWidth);
    y += fieldRow('Address', [p.address, p.city, p.state].filter(Boolean).join(', ') || 'N/A', margin, detailsWidth);

    y = Math.max(y, blockStartY + photoH + 3);

    // Statement
    if (p.statement) {
      checkPage(12);
      y += 1;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(90, 90, 90);
      doc.text('Statement:', margin, y);
      y += 4;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...colors.text);
      const stmtLines = doc.splitTextToSize(`"${p.statement}"`, contentWidth - 8);
      stmtLines.forEach((line: string) => {
        checkPage(5);
        doc.text(line, margin + 4, y);
        y += 4;
      });
      y += 1;
    }

    // Separator
    y += 2;
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.15);
    doc.setLineDashPattern([2, 2], 0);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setLineDashPattern([], 0);
    y += 3;
  }

  // ══════════════════════════════════════════════════════
  // PAGE 1: HEADER — Government of Nepal FIR Header
  // ══════════════════════════════════════════════════════
  addPageBorder();

  // Top gold accent line
  doc.setFillColor(...colors.gold);
  doc.rect(margin, y, contentWidth, 1.5, 'F');
  y += 3;

  const headerStartY = y;
  const logoSize = 16;

  // Left logo
  if (logoBase64) addImageSafe(doc, logoBase64, margin + 2, headerStartY, logoSize, logoSize);
  // Right emblem
  if (emblemBase64) addImageSafe(doc, emblemBase64, pageWidth - margin - logoSize - 2, headerStartY, logoSize, logoSize);

  // Header text
  const textCenterY = headerStartY + 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...colors.primary);
  doc.text('GOVERNMENT OF NEPAL', pageWidth / 2, textCenterY, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(...colors.secondary);
  doc.text('MINISTRY OF HOME AFFAIRS', pageWidth / 2, textCenterY + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('NEPAL POLICE', pageWidth / 2, textCenterY + 9, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('National Crime Records Bureau', pageWidth / 2, textCenterY + 13, { align: 'center' });

  y = headerStartY + logoSize + 3;

  // FIR title banner
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin + 25, y, contentWidth - 50, 9, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('FIRST INFORMATION REPORT (F.I.R.)', pageWidth / 2, y + 6.5, { align: 'center' });
  y += 12;

  // Gold separator
  doc.setFillColor(...colors.gold);
  doc.rect(margin, y, contentWidth, 1, 'F');
  y += 4;

  // ── FIR Reference Box ──
  doc.setFillColor(...colors.lightGray);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'F');
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'S');

  const refBoxY = y + 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.primary);
  doc.text(`FIR No: ${c.fir_no}`, margin + 5, refBoxY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.text);
  doc.text(`Date Filed: ${formatDateTime(c.fir_date_time)}`, pageWidth - margin - 5, refBoxY, { align: 'right' });

  // Status row
  const statusColor = c.case_status === 'Closed' ? [0, 128, 0] : c.case_status === 'Open' ? [200, 50, 50] : [180, 120, 0];
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${c.case_status}`, margin + 5, refBoxY + 8);

  const prioColor = c.case_priority === 'High' || c.case_priority === 'Critical' ? [200, 50, 50] : [80, 80, 80];
  doc.setTextColor(prioColor[0], prioColor[1], prioColor[2]);
  doc.text(`Priority: ${c.case_priority}`, margin + 55, refBoxY + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...colors.text);
  doc.text(`Station: ${c.station_name} (${c.station_code})`, pageWidth - margin - 5, refBoxY + 8, { align: 'right' });

  y += 24;

  // ══════════════════════════════════════════════════════
  // SECTION 1: POLICE STATION INFORMATION
  // ══════════════════════════════════════════════════════
  sectionTitle('Police Station Information');

  y += fieldRowTwoCol('Station Name', c.station_name || 'N/A', 'Station Code', c.station_code || 'N/A');
  y += fieldRowTwoCol('District', c.district || 'N/A', 'Province', c.state_province || 'N/A');
  y += fieldRowTwoCol('Municipality', c.municipality || 'N/A', 'Phone', c.station_phone || 'N/A');
  y += fieldRow('Address', c.station_address || 'N/A');
  if (c.jurisdiction_area) {
    y += fieldRow('Jurisdiction', c.jurisdiction_area);
  }
  if (c.incharge_first_name) {
    y += fieldRow('Station In-Charge',
      `${c.incharge_rank || ''} ${fullName(c.incharge_first_name, '', c.incharge_last_name)} (Badge: ${c.incharge_badge || 'N/A'})`);
  }
  y += 2;

  // ══════════════════════════════════════════════════════
  // SECTION 2: OFFENCE / INCIDENT DETAILS
  // ══════════════════════════════════════════════════════
  sectionTitle('Offence / Incident Details');
  y += fieldRowTwoCol('Crime Type', c.crime_type || 'N/A', 'Section of Law', c.crime_section || 'N/A');
  y += fieldRowTwoCol('Incident Date', formatDateTime(c.incident_date_time), 'FIR Date', formatDateTime(c.fir_date_time));
  y += fieldRowTwoCol('Location', c.incident_location || 'N/A', 'District', c.incident_district || 'N/A');
  y += 2;
  // Description box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text('Brief Facts / Description of Offence:', margin, y);
  y += 4;
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.2);
  const descText = c.summary || 'No description available.';
  const descLines = doc.splitTextToSize(descText, contentWidth - 8);
  const descBoxH = Math.max(descLines.length * 4 + 6, 15);
  checkPage(descBoxH + 2);
  doc.setFillColor(252, 252, 255);
  doc.roundedRect(margin, y, contentWidth, descBoxH, 1, 1, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...colors.text);
  let descY = y + 4;
  descLines.forEach((line: string) => {
    doc.text(line, margin + 4, descY);
    descY += 4;
  });
  y += descBoxH + 3;

  // ══════════════════════════════════════════════════════
  // SECTION 3: COMPLAINANT / INFORMANT
  // ══════════════════════════════════════════════════════
  const complainants = persons.filter(p => p.role === 'Complainant');
  if (complainants.length > 0) {
    sectionTitle('Complainant / Informant Details');
    for (const p of complainants) {
      await personBlock(p);
    }
  }

  // ══════════════════════════════════════════════════════
  // SECTION 4: VICTIM DETAILS
  // ══════════════════════════════════════════════════════
  const victims = persons.filter(p => p.role === 'Victim');
  if (victims.length > 0) {
    sectionTitle(`Victim Details (${victims.length})`);
    for (const p of victims) {
      await personBlock(p);
    }
  }

  // ══════════════════════════════════════════════════════
  // SECTION 5: ACCUSED / SUSPECTS
  // ══════════════════════════════════════════════════════
  const accusedList = persons.filter(p => p.role === 'Accused' || p.role === 'Suspect');
  if (accusedList.length > 0) {
    sectionTitle(`Details of Known / Suspected Accused (${accusedList.length})`);
    for (const p of accusedList) {
      await personBlock(p, p.role.toUpperCase());
    }
  }

  // ══════════════════════════════════════════════════════
  // SECTION 6: WITNESSES
  // ══════════════════════════════════════════════════════
  const witnesses = persons.filter(p => p.role === 'Witness');
  if (witnesses.length > 0) {
    sectionTitle(`Witness Details (${witnesses.length})`);
    for (const p of witnesses) {
      await personBlock(p);
    }
  }

  // ══════════════════════════════════════════════════════
  // SECTION 7: REGISTERING OFFICER
  // ══════════════════════════════════════════════════════
  sectionTitle('Registering Officer');
  checkPage(45);
  const officerStartY = y;

  const officerPhotoBase64 = await loadPersonPhoto(c.officer_photo);
  const offPhotoW = 28;
  const offPhotoH = 35;
  const offDetailsWidth = contentWidth - (officerPhotoBase64 ? offPhotoW + 8 : 0);

  if (officerPhotoBase64) {
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.rect(pageWidth - margin - offPhotoW - 1, officerStartY - 1, offPhotoW + 2, offPhotoH + 2);
    addImageSafe(doc, officerPhotoBase64, pageWidth - margin - offPhotoW, officerStartY, offPhotoW, offPhotoH);
  }

  y += fieldRow('Name', fullName(c.officer_first_name, c.officer_middle_name, c.officer_last_name), margin, offDetailsWidth);
  y += fieldRowTwoCol('Rank', c.officer_rank || 'N/A', 'Badge No', c.officer_badge || 'N/A');
  y += fieldRow('Department', c.officer_department || 'N/A', margin, offDetailsWidth);
  y += fieldRow('Contact', c.officer_contact || 'N/A', margin, offDetailsWidth);

  y = Math.max(y, officerStartY + offPhotoH + 3);

  // ══════════════════════════════════════════════════════
  // SECTION 8: EVIDENCE / EXHIBITS (text + images)
  // ══════════════════════════════════════════════════════
  if (evidence && evidence.length > 0) {
    sectionTitle(`Evidence / Exhibits (${evidence.length})`);

    for (let idx = 0; idx < evidence.length; idx++) {
      const ev = evidence[idx];
      checkPage(30);

      // Evidence header line
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(...colors.primary);
      doc.text(`${idx + 1}. ${ev.evidence_code || 'N/A'}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`[${ev.evidence_type || 'N/A'}]  Status: ${ev.status || 'N/A'}`, margin + 50, y);
      doc.text(`Collected: ${formatDate(ev.collected_date_time)}`, pageWidth - margin, y, { align: 'right' });
      y += 5;

      // Collected by
      if (ev.collected_by_first_name) {
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`Collected by: ${ev.collected_by_rank || ''} ${fullName(ev.collected_by_first_name, '', ev.collected_by_last_name)}`, margin + 2, y);
        y += 4;
      }

      // Check if file_path exists — note file name for reference
      let fileName = '';
      if (ev.file_path) {
        fileName = ev.file_path.split('/').pop() || '';
      }

      // Description text (full width)
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...colors.text);
      const descLines = doc.splitTextToSize(ev.description || 'No description.', contentWidth - 4);
      descLines.forEach((line: string) => {
        checkPage(5);
        doc.text(line, margin + 2, y);
        y += 4;
      });

      // Show attached file name if present
      if (fileName) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 100, 100);
        doc.text(`Attached file: ${fileName}`, margin + 2, y);
        y += 4;
      }

      // Separator between evidence items
      y += 2;
      if (idx < evidence.length - 1) {
        doc.setDrawColor(...colors.border);
        doc.setLineWidth(0.15);
        doc.setLineDashPattern([2, 2], 0);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setLineDashPattern([], 0);
        y += 3;
      }
    }
    y += 2;
  }

  // ══════════════════════════════════════════════════════
  // SECTION 9: SUPPLEMENTARY STATEMENTS
  // ══════════════════════════════════════════════════════
  if (supplementaryStatements && supplementaryStatements.length > 0) {
    sectionTitle(`Supplementary Statements (${supplementaryStatements.length})`);
    for (const ss of supplementaryStatements) {
      checkPage(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...colors.primary);
      doc.text(`${ss.role || ''} — ${fullName(ss.first_name, '', ss.last_name)}`, margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${formatDateTime(ss.statement_date)}`, pageWidth - margin, y, { align: 'right' });
      y += 4;
      if (ss.recorded_by_first_name) {
        doc.setFontSize(7);
        doc.text(`Recorded by: ${ss.recorded_by_rank || ''} ${fullName(ss.recorded_by_first_name, '', ss.recorded_by_last_name)}`, margin, y);
        y += 4;
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(...colors.text);
      const stLines = doc.splitTextToSize(`"${ss.statement}"`, contentWidth - 8);
      stLines.forEach((line: string) => {
        checkPage(5);
        doc.text(line, margin + 4, y);
        y += 4;
      });
      if (ss.remarks) {
        y += 1;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 100, 100);
        doc.text(`Remarks: ${ss.remarks}`, margin + 4, y);
        y += 4;
      }
      y += 2;
      doc.setDrawColor(...colors.border);
      doc.setLineWidth(0.15);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(margin, y, pageWidth - margin, y);
      doc.setLineDashPattern([], 0);
      y += 3;
    }
  }

  // ══════════════════════════════════════════════════════
  // SECTION 10: TIMELINE / ACTIONS TAKEN
  // ══════════════════════════════════════════════════════
  if (trackingRecords && trackingRecords.length > 0) {
    sectionTitle(`Case Timeline / Actions Taken (${trackingRecords.length})`);
    const trackRows = trackingRecords.map((t: any, idx: number) => [
      String(idx + 1),
      formatDateTime(t.track_date_time),
      t.action_type || 'N/A',
      (t.action_description || 'N/A').substring(0, 80),
      t.old_status && t.new_status ? `${t.old_status} >> ${t.new_status}` : (t.new_status || '-'),
    ]);
    checkPage(25);
    autoTable(doc, {
      startY: y,
      head: [['#', 'Date/Time', 'Action Type', 'Description', 'Status Change']],
      body: trackRows,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: { fillColor: colors.secondary, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 1.8, textColor: colors.text },
      columnStyles: { 0: { cellWidth: 8 }, 4: { cellWidth: 28 } },
      didDrawPage: () => { addPageBorder(); },
    });
    y = (doc as any).lastAutoTable.finalY + 4;
  }

  // ══════════════════════════════════════════════════════
  //  SIGNATURE SECTION — Real FIR Format
  // ══════════════════════════════════════════════════════
  checkPage(80);
  y += 6;

  // Section heading
  doc.setFillColor(...colors.primary);
  doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DECLARATION & SIGNATURES', margin + 4, y + 5);
  y += 11;

  // Declaration text
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(60, 60, 60);
  const declarationText = 'I hereby declare that the contents of the above First Information Report are true and correct to the best of my knowledge and belief, and nothing has been concealed therein.';
  const declLines = doc.splitTextToSize(declarationText, contentWidth);
  declLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 3.5;
  });
  y += 6;

  // Load signatures
  const complainant = complainants[0];
  let complainantSig: string | null = null;
  if (complainant) {
    complainantSig = await loadImage(complainant.person_signature || complainant.signature || null);
  }
  let officerSig = await loadImage(c.officer_signature);

  const sigBlockW = 65;
  const sigBlockH = 40;
  const sigImageH = 18;
  const leftBoxX = margin;
  const centerBoxX = margin + (contentWidth - sigBlockW) / 2;
  const rightBoxX = pageWidth - margin - sigBlockW;

  // ── LEFT: Complainant Signature ──
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftBoxX, y, sigBlockW, sigBlockH, 1.5, 1.5, 'S');

  if (complainantSig) {
    addImageSafe(doc, complainantSig, leftBoxX + (sigBlockW - 50) / 2, y + 3, 50, sigImageH);
  }
  // Signature line
  doc.setDrawColor(...colors.text);
  doc.setLineWidth(0.3);
  doc.line(leftBoxX + 5, y + sigImageH + 5, leftBoxX + sigBlockW - 5, y + sigImageH + 5);
  // Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('Signature of Complainant', leftBoxX + sigBlockW / 2, y + sigImageH + 10, { align: 'center' });
  // Name
  if (complainant) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.text);
    doc.text(fullName(complainant.first_name, complainant.middle_name, complainant.last_name),
      leftBoxX + sigBlockW / 2, y + sigImageH + 14, { align: 'center' });
    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${formatDate(c.fir_date_time)}`,
      leftBoxX + sigBlockW / 2, y + sigImageH + 18, { align: 'center' });
  }

  // ── CENTER: Station Seal ──
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.5);
  doc.roundedRect(centerBoxX, y, sigBlockW, sigBlockH, 1.5, 1.5, 'S');
  // Inner dashed border for seal
  doc.setLineDashPattern([3, 2], 0);
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.2);
  doc.roundedRect(centerBoxX + 3, y + 3, sigBlockW - 6, sigBlockH - 6, 1, 1, 'S');
  doc.setLineDashPattern([], 0);
  // Seal text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('STATION SEAL', centerBoxX + sigBlockW / 2, y + sigBlockH / 2 - 3, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('/ Official Stamp', centerBoxX + sigBlockW / 2, y + sigBlockH / 2 + 2, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(170, 170, 170);
  doc.text(c.station_name || '', centerBoxX + sigBlockW / 2, y + sigBlockH / 2 + 7, { align: 'center' });

  // ── RIGHT: Officer Signature ──
  doc.setDrawColor(...colors.primary);
  doc.setLineWidth(0.3);
  doc.roundedRect(rightBoxX, y, sigBlockW, sigBlockH, 1.5, 1.5, 'S');

  if (officerSig) {
    addImageSafe(doc, officerSig, rightBoxX + (sigBlockW - 50) / 2, y + 3, 50, sigImageH);
  }
  // Signature line
  doc.setDrawColor(...colors.text);
  doc.setLineWidth(0.3);
  doc.line(rightBoxX + 5, y + sigImageH + 5, rightBoxX + sigBlockW - 5, y + sigImageH + 5);
  // Label
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('Signature of Registering Officer', rightBoxX + sigBlockW / 2, y + sigImageH + 10, { align: 'center' });
  // Name
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colors.text);
  doc.text(`${c.officer_rank || ''} ${fullName(c.officer_first_name, c.officer_middle_name, c.officer_last_name)}`,
    rightBoxX + sigBlockW / 2, y + sigImageH + 14, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text(`Badge: ${c.officer_badge || 'N/A'}`,
    rightBoxX + sigBlockW / 2, y + sigImageH + 18, { align: 'center' });

  y += sigBlockH + 8;

  // ── Copy Distribution Line ──
  checkPage(20);
  doc.setDrawColor(...colors.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(90, 90, 90);
  doc.text('Copy Distribution:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  y += 3.5;
  doc.text('1. Original — Police Station Record', margin + 4, y);
  y += 3;
  doc.text('2. Duplicate — Complainant / Informant', margin + 4, y);
  y += 3;
  doc.text('3. Triplicate — Superintendent of Police / District Police Office', margin + 4, y);
  y += 3;
  doc.text('4. Quadruplicate — Court (if applicable)', margin + 4, y);
  y += 5;

  // ── Disclaimer Footer ──
  checkPage(12);
  doc.setDrawColor(...colors.gold);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6);
  doc.setTextColor(130, 130, 130);
  doc.text(
    'This is a computer-generated First Information Report from the National Crime Records Management System.',
    pageWidth / 2, y, { align: 'center' }
  );
  y += 3;
  doc.text(
    'This document is valid without physical signature when digitally verified.',
    pageWidth / 2, y, { align: 'center' }
  );
  y += 3;
  doc.text(
    `Generated on: ${new Date().toLocaleString('en-US')} | FIR No: ${c.fir_no}`,
    pageWidth / 2, y, { align: 'center' }
  );

  // ══════════════════════════════════════════════════════
  //  PAGE NUMBERS
  // ══════════════════════════════════════════════════════
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) addPageBorder();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    // Footer line on each page
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(0.2);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
  }

  doc.save(`FIR_${c.fir_no}_Report.pdf`);
}
