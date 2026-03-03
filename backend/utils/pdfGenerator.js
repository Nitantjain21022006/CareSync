import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * @desc Generate a Professional Medical Receipt PDF
 * @param {Object} bill - Bill document with populated patient
 * @param {Object} appointment - Appointment document with populated doctor
 */
export const generateReceiptPDF = (bill, appointment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // 1. Header & Branding
            doc.fillColor('#2D7D6F').fontSize(24).text('CareSync (MediCare)', { align: 'left' });
            doc.fontSize(10).fillColor('#A0AEC0').text('Institutional Healthcare Solutions', { align: 'left' });
            doc.moveDown();

            // 2. Receipt Info
            doc.fillColor('#1A202C').fontSize(14).text('OFFICIAL MEDICAL RECEIPT', { underline: true });
            doc.fontSize(10).text(`Invoice ID: ${bill.invoiceId || bill._id}`);
            doc.text(`Date of Issuance: ${new Date(bill.createdAt).toLocaleDateString()}`);
            doc.text(`Status: PAID`, { font: 'Helvetica-Bold', color: 'green' });
            doc.moveDown();

            // 3. Patient & Doctor Details
            doc.fontSize(12).fillColor('#2D3748').text('Patient Details:', { underline: true });
            doc.fontSize(10).text(`Name: ${bill.patient?.fullName || 'N/A'}`);
            doc.text(`Email: ${bill.patient?.email || 'N/A'}`);
            doc.moveDown(0.5);

            doc.fontSize(12).text('Clinical Origin:', { underline: true });
            doc.fontSize(10).text(`Practitioner: Dr. ${appointment.doctor?.fullName || 'N/A'}`);
            doc.text(`Specialization: ${appointment.doctor?.metadata?.specialization || 'Clinical Generalist'}`);
            doc.text(`Appointment Date: ${new Date(appointment.date).toLocaleDateString()}`);
            doc.moveDown();

            // 4. Billing Table Header
            const tableTop = 330;
            doc.fontSize(10).fillColor('#A0AEC0').text('Description', 50, tableTop);
            doc.text('Amount (USD)', 400, tableTop, { align: 'right' });
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

            // 5. Billing Items
            let currentY = tableTop + 25;
            bill.items.forEach(item => {
                doc.fillColor('#1A202C').text(item.description, 50, currentY);
                doc.text(`$${item.amount.toFixed(2)}`, 400, currentY, { align: 'right' });
                currentY += 20;
            });

            // 6. Total
            doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
            doc.fontSize(14).fillColor('#2D7D6F').text('TOTAL AMOUNT PAID', 50, currentY + 15);
            doc.text(`$${bill.totalAmount.toFixed(2)}`, 400, currentY + 15, { align: 'right' });

            // 7. Footer
            doc.fontSize(8).fillColor('#A0AEC0').text(
                'This is a computer-generated document. No signature is required. All services are processed under CareSync Institutional RBAC protocols.',
                50, 700, { align: 'center', width: 500 }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * @desc Generate a Consultation Summary PDF
 * @param {Object} appointment - Appointment document with populated doctor and patient
 */
export const generateConsultationPDF = (appointment) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                let pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // 1. Header & Branding
            doc.fillColor('#2D7D6F').fontSize(24).text('CareSync (MediCare)', { align: 'left' });
            doc.fontSize(10).fillColor('#A0AEC0').text('Institutional Healthcare Solutions', { align: 'left' });
            doc.moveDown();

            // 2. Document Info
            doc.fillColor('#1A202C').fontSize(14).text('CLINICAL CONSULTATION SUMMARY', { underline: true });
            doc.fontSize(10).text(`Encounter ID: ${appointment._id}`);
            doc.text(`Date of Service: ${new Date(appointment.date).toLocaleDateString()}`);
            doc.text(`Duration: ${appointment.duration} minutes`);
            doc.text(`Status: COMPLETED`, { font: 'Helvetica-Bold', color: '#2D7D6F' });
            doc.moveDown();

            // 3. Patient Details
            doc.fontSize(12).fillColor('#2D3748').text('Patient Demographics:', { underline: true });
            doc.fontSize(10).text(`Name: ${appointment.patient?.fullName || 'N/A'}`);
            doc.text(`Email: ${appointment.patient?.email || 'N/A'}`);
            doc.moveDown(0.5);

            // 4. Doctor Details
            doc.fontSize(12).text('Attending Practitioner:', { underline: true });
            doc.fontSize(10).text(`Provider: Dr. ${appointment.doctor?.fullName || 'N/A'}`);
            doc.text(`Specialization: ${appointment.doctor?.metadata?.specialization || 'Clinical Generalist'}`);
            doc.moveDown();

            // 5. Clinical Notes
            doc.fontSize(12).text('Clinical Notes & Summary:', { underline: true });
            doc.moveDown(0.5);
            doc.fillColor('#1A202C').fontSize(10).text(appointment.consultationNotes || 'No notes provided by the practitioner.', {
                align: 'justify',
                width: 500
            });
            doc.moveDown();

            // 6. Footer
            doc.fontSize(8).fillColor('#A0AEC0').text(
                'This document serves as an official clinical summary under CareSync protocols. For medical emergencies, please visit the nearest hospital.',
                50, 700, { align: 'center', width: 500 }
            );

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};
