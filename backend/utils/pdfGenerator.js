import PDFDocument from 'pdfkit';

const EMERALD = '#2D7D6F';
const SLATE = '#1A202C';
const LIGHT_BG = '#F8FBFA';
const GRAY = '#718096';
const WHITE = '#FFFFFF';

/**
 * @desc Overlay Header & Footer on a specific page
 */
const overlayBranding = (doc, title, pageNum, totalPages) => {
    const width = doc.page.width;
    const height = doc.page.height;

    // --- Header ---
    doc.save();
    doc.fillColor(EMERALD).rect(0, 0, width, 65).fill();
    doc.fillColor(WHITE).fontSize(20).font('Helvetica-Bold').text('CareSync (MediCare)', 50, 18);
    doc.fontSize(9).font('Helvetica').text('Advanced Institutional Healthcare Management System', 50, 42);

    // Title Badge (Top-Right)
    doc.fillColor(WHITE).fontSize(12).font('Helvetica-Bold').text(title.toUpperCase(), 300, 25, { align: 'right', width: 262 });
    doc.restore();

    // --- Footer ---
    doc.save();
    const footerHeight = 45;
    doc.fillColor(EMERALD).rect(0, height - footerHeight, width, footerHeight).fill();

    // Page Numbering
    doc.fillColor(WHITE).fontSize(8).font('Helvetica').text(
        `Page ${pageNum} of ${totalPages}`,
        0, height - 30, { align: 'center', width: width }
    );

    doc.fontSize(7).text(
        `CONFIDENTIAL RECORD | Generated: ${new Date().toLocaleString()} | CareSync Institutional Node: SECURE-RBAC-01`,
        0, height - 18, { align: 'center', width: width }
    );
    doc.restore();
};

/**
 * @desc Finalize Document by applying branding to all pages
 */
const finalizeDoc = (doc, title) => {
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        overlayBranding(doc, title, i + 1, totalPages);
    }
};

/**
 * @desc Generate a Highly Detailed Medical Receipt
 */
export const generateReceiptPDF = (bill, appointment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Initial cursor below header
            doc.y = 85;

            // 1. Transaction Summary
            doc.fillColor(EMERALD).fontSize(16).font('Helvetica-Bold').text('FINANCIAL SETTLEMENT SUMMARY', 50);
            doc.strokeColor(EMERALD).lineWidth(1).moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
            doc.moveDown(1.5);

            // 2. Metadata Grid
            const metadataY = doc.y;
            const meta = [
                { l: 'INVOICE REF:', v: bill.invoiceId || bill._id },
                { l: 'SETTLEMENT DATE:', v: new Date(bill.createdAt).toLocaleDateString('en-IN') },
                { l: 'PAYMENT STATUS:', v: 'CLEARED / PAID', color: '#10B981' },
                { l: 'TRANSACTION ID:', v: bill.razorpayPaymentId || 'INTERNAL_RECON_882' }
            ];

            meta.forEach((item, i) => {
                doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(item.l, 50, metadataY + (i * 15));
                doc.fillColor(item.color || SLATE).font('Helvetica-Bold').text(item.v, 180, metadataY + (i * 15));
            });

            doc.moveDown(4);

            // 3. Entity Profiles
            doc.fillColor(EMERALD).fontSize(12).font('Helvetica-Bold').text('PARTICIPANT ENGAGEMENT', 50);
            doc.moveDown(0.5);

            // Boxes for Patient & Doctor
            const profileY = doc.y;
            doc.fillColor(LIGHT_BG).rect(50, profileY, 245, 70, 5).fill();
            doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('RECEPIENT (PATIENT):', 60, profileY + 12);
            doc.fontSize(11).font('Helvetica-Bold').text(bill.patient?.fullName || 'N/A', 60, profileY + 25);
            doc.fontSize(8).font('Helvetica').text(bill.patient?.email || 'N/A', 60, profileY + 40);

            doc.fillColor(LIGHT_BG).rect(305, profileY, 245, 70, 5).fill();
            doc.fillColor(SLATE).fontSize(9).font('Helvetica').text('ISSUING CLINICIAN:', 315, profileY + 12);
            doc.fontSize(11).font('Helvetica-Bold').text(`Dr. ${appointment.doctor?.fullName || 'N/A'}`, 315, profileY + 25);
            doc.fontSize(8).font('Helvetica').text(appointment.doctor?.metadata?.specialization || 'Clinical Specialist', 315, profileY + 40);

            doc.moveDown(6);

            // 4. Detailed Line Items
            doc.fillColor(EMERALD).fontSize(12).font('Helvetica-Bold').text('CLINICAL SERVICES BREAKDOWN', 50);
            doc.moveDown(0.5);

            const tableTop = doc.y;
            doc.fillColor(EMERALD).rect(50, tableTop, 500, 22).fill();
            doc.fillColor(WHITE).fontSize(9).font('Helvetica-Bold').text('DESCRIPTION OF CLINICAL SERVICE', 65, tableTop + 7);
            doc.text('AMOUNT (INR)', 400, tableTop + 7, { align: 'right', width: 140 });

            let currentY = tableTop + 30;
            bill.items.forEach(item => {
                doc.fillColor(SLATE).font('Helvetica').fontSize(10).text(item.description, 65, currentY);
                doc.font('Helvetica-Bold').text(`₹ ${item.amount.toLocaleString()}`, 400, currentY, { align: 'right', width: 140 });
                currentY += 18;

                if (currentY > 680) {
                    doc.addPage();
                    doc.y = 85;
                    currentY = 85;
                }
            });

            // 5. Grand Totals
            const totalY = Math.max(currentY + 20, doc.y + 20);
            doc.strokeColor(GRAY).lineWidth(0.5).moveTo(50, totalY).lineTo(550, totalY).stroke();

            doc.fontSize(9).fillColor(GRAY).text('GROSS SUB-TOTAL:', 350, totalY + 15);
            doc.fillColor(SLATE).font('Helvetica-Bold').text(`₹ ${bill.totalAmount.toLocaleString()}`, 480, totalY + 15, { align: 'right' });

            doc.fontSize(9).fillColor(GRAY).text('INSTITUTIONAL LEVY / TAX:', 350, totalY + 28);
            doc.fillColor(SLATE).text(`₹ 0.00`, 480, totalY + 28, { align: 'right' });

            doc.fillColor(LIGHT_BG).rect(340, totalY + 45, 210, 35).fill();
            doc.fontSize(14).fillColor(EMERALD).text('TOTAL PAID:', 350, totalY + 55);
            doc.text(`₹ ${bill.totalAmount.toLocaleString()}`, 450, totalY + 55, { align: 'right', width: 90 });

            finalizeDoc(doc, 'Official Medical Receipt');
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * @desc Generate a Highly Detailed Consultation Summary
 */
export const generateConsultationPDF = (appointment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            doc.y = 85;

            // 1. Header Section
            doc.fillColor(EMERALD).fontSize(16).font('Helvetica-Bold').text('CLINICAL ENCOUNTER OVERVIEW', 50);
            doc.strokeColor(EMERALD).lineWidth(1).moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
            doc.moveDown(1.5);

            // 2. Clinical Context
            const contextY = doc.y;
            const ctx = [
                { l: 'PATIENT IDENTITY:', v: appointment.patient?.fullName },
                { l: 'ATTENDING PROVIDER:', v: `Dr. ${appointment.doctor?.fullName}` },
                { l: 'SPECIALIZATION:', v: appointment.doctor?.metadata?.specialization || 'Clinical Generalist' },
                { l: 'ENCOUNTER DATE:', v: new Date(appointment.date).toLocaleDateString('en-IN') },
                { l: 'UNIQUE CASE REF:', v: appointment._id.toString().toUpperCase() }
            ];

            ctx.forEach((stat, i) => {
                doc.fontSize(9).fillColor(GRAY).font('Helvetica').text(stat.l, 50, contextY + (i * 16));
                doc.fillColor(SLATE).font('Helvetica-Bold').text(stat.v || 'N/A', 180, contextY + (i * 16));
            });

            doc.moveDown(6);

            // 3. Clinical Observation Summary
            doc.fillColor(EMERALD).fontSize(12).font('Helvetica-Bold').text('PRACTITIONER EVALUATION & SUMMARY', 50);
            doc.moveDown(0.5);

            doc.fillColor(LIGHT_BG).rect(50, doc.y, 500, 220, 5).fill();
            doc.fillColor(SLATE).fontSize(10.5).font('Helvetica').text(
                appointment.consultationNotes || 'The practitioner has recorded a standard clinical evaluation for this encounter. The summary includes observations related to primary symptoms and institutional triage results. No critical abnormalities were noted for immediate escalation during this session.',
                65, doc.y + 15, { align: 'justify', width: 470, lineGap: 4 }
            );

            doc.moveDown(16);

            // 4. Strategic Directions
            doc.fillColor(EMERALD).fontSize(12).font('Helvetica-Bold').text('INSTITUTIONAL ADVISORY', 50);
            doc.moveDown(1);

            const advices = [
                'Clinical roadmap adherence is strictly recommended for optimal recovery.',
                'Access the digital prescription and lab orders directly via the CareSync Portal.',
                'Follow-up protocols should be initiated as per the clinical schedule defined above.',
                'Immediate emergency re-intake is advised if acute respiratory or cardiac symptoms occur.'
            ];

            advices.forEach((advice, i) => {
                doc.fillColor(GRAY).fontSize(9.5).text(`${i + 1}. ${advice}`, 65);
                doc.moveDown(0.5);
            });

            finalizeDoc(doc, 'Clinical Consultation Summary');
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * @desc Generate a Strategic Admin Analytics Report
 */
export const generateAdminReportPDF = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            doc.y = 85;

            // 1. Executive Summary Header
            doc.fillColor(SLATE).fontSize(16).font('Helvetica-Bold').text('INSTITUTIONAL STRATEGIC METRICS', 50);
            doc.strokeColor(EMERALD).lineWidth(1.5).moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
            doc.moveDown(1.5);

            // 2. KPI Cards
            const kpiY = doc.y;
            doc.fillColor(LIGHT_BG).rect(50, kpiY, 245, 80, 5).fill();
            const totalRev = data.revenue?.reduce((sum, r) => sum + r.amount, 0) || 0;
            doc.fillColor(EMERALD).fontSize(10).font('Helvetica-Bold').text('GROSS REVENUE (CYCLE)', 70, kpiY + 18);
            doc.fillColor(SLATE).fontSize(18).text(`₹ ${totalRev.toLocaleString()}`, 70, kpiY + 35);

            doc.fillColor(LIGHT_BG).rect(305, kpiY, 245, 80, 5).fill();
            const totalCases = (data.cases?.active || 0) + (data.cases?.resolved || 0) + (data.cases?.cancelled || 0);
            doc.fillColor(EMERALD).fontSize(10).font('Helvetica-Bold').text('TOTAL CLINICAL THROUGHPUT', 325, kpiY + 18);
            doc.fillColor(SLATE).fontSize(18).text(`${totalCases} Encounters`, 325, kpiY + 35);

            doc.moveDown(7);

            // 3. Throughput Segmentation
            doc.fillColor(EMERALD).fontSize(12).font('Helvetica-Bold').text('CASE PIPELINE DISTRIBUTION', 50);
            doc.moveDown(0.8);

            const segments = [
                { l: 'ACTIVE PIPELINE (ONGOING):', v: data.cases?.active || 0 },
                { l: 'RESOLVED / SETTLED CASES:', v: data.cases?.resolved || 0 },
                { l: 'CANCELLED REVENUE LEAKAGE:', v: data.cases?.cancelled || 0 }
            ];

            segments.forEach((seg, i) => {
                doc.fontSize(10).fillColor(GRAY).font('Helvetica').text(seg.l, 50, doc.y + 5);
                doc.fillColor(SLATE).font('Helvetica-Bold').text(seg.v.toString(), 400, doc.y - 12, { align: 'right', width: 140 });
                doc.moveDown(0.5);
            });

            doc.moveDown(3);

            // 4. Institutional Efficiency Index
            const successRate = data.outcomes?.successful > 0
                ? Math.round((data.outcomes.successful / (data.outcomes.successful + data.outcomes.rejected)) * 100)
                : 0;

            doc.fillColor(EMERALD).fontSize(12).font('Helvetica-Bold').text('OPERATIONAL EFFICIENCY INDEX', 50);
            doc.moveDown(0.8);

            const gaugeY = doc.y;
            doc.fillColor(LIGHT_BG).rect(150, gaugeY, 300, 110, 8).fill();
            doc.fillColor(successRate >= 85 ? '#10B981' : EMERALD).fontSize(42).font('Helvetica-Bold').text(`${successRate}%`, 150, gaugeY + 35, { align: 'center', width: 300 });
            doc.fillColor(GRAY).fontSize(10).font('Helvetica').text('AGGREGATE QUALITY CONFIDENCE', 150, gaugeY + 15, { align: 'center', width: 300 });

            doc.moveDown(10);

            // 5. Fiscal Segmentation Analysis
            if (doc.y > 600) doc.addPage();
            doc.fillColor(EMERALD).fontSize(12).font('Helvetica-Bold').text('FISCAL SEGMENTATION (DETAILED)', 50);
            doc.moveDown(0.5);

            doc.fillColor(EMERALD).rect(50, doc.y, 501, 22).fill();
            doc.fillColor(WHITE).fontSize(9).font('Helvetica-Bold').text('SEGMENT CODE', 65, doc.y - 15);
            doc.text('REVENUE ALLOCATION (INR)', 350, doc.y - 15, { align: 'right', width: 190 });

            let segY = doc.y + 12;
            data.revenue.forEach(item => {
                doc.fillColor(SLATE).font('Helvetica').fontSize(10).text(`INST-FSC-${item._id.toString().padStart(3, '0')}`, 65, segY);
                doc.font('Helvetica-Bold').text(`₹ ${item.amount.toLocaleString()}`, 350, segY, { align: 'right', width: 190 });
                segY += 18;
                if (segY > 680) {
                    doc.addPage();
                    doc.y = 85;
                    segY = 85;
                }
            });

            finalizeDoc(doc, 'Institutional Analytics Dashboard');
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
