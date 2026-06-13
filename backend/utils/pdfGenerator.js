const PDFDocument = require('pdfkit');

/**
 * Generates an elegant landscape Certificate of Participation.
 * Returns a Promise that resolves to a PDF Buffer.
 */
const generateCertificatePDF = (userName, eventName, eventDate, collegeName, registrationId) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 40
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => {
        reject(err);
      });

      const width = doc.page.width;
      const height = doc.page.height;

      // Draw elegant cream background overlay
      doc.rect(0, 0, width, height).fill('#fafaf9');

      // Outer gold border
      doc.rect(25, 25, width - 50, height - 50).lineWidth(4).stroke('#d4af37');
      
      // Inner teal border
      doc.rect(33, 33, width - 66, height - 66).lineWidth(1.5).stroke('#0f766e');

      // Decorative corner designs
      // Top Left Corner
      doc.moveTo(33, 63).lineTo(63, 33).lineWidth(2).stroke('#0f766e');
      doc.moveTo(33, 70).lineTo(70, 33).lineWidth(1).stroke('#d4af37');
      
      // Top Right Corner
      doc.moveTo(width - 33, 63).lineTo(width - 63, 33).lineWidth(2).stroke('#0f766e');
      doc.moveTo(width - 33, 70).lineTo(width - 70, 33).lineWidth(1).stroke('#d4af37');

      // Bottom Left Corner
      doc.moveTo(33, height - 63).lineTo(63, height - 33).lineWidth(2).stroke('#0f766e');
      doc.moveTo(33, height - 70).lineTo(70, height - 33).lineWidth(1).stroke('#d4af37');

      // Bottom Right Corner
      doc.moveTo(width - 33, height - 63).lineTo(width - 63, height - 33).lineWidth(2).stroke('#0f766e');
      doc.moveTo(width - 33, height - 70).lineTo(width - 70, height - 33).lineWidth(1).stroke('#d4af37');

      // Header Text
      doc.moveDown(3);
      doc.fillColor('#0f766e')
         .font('Helvetica-Bold')
         .fontSize(36)
         .text('CERTIFICATE OF PARTICIPATION', { align: 'center', characterSpacing: 1 });
      
      doc.moveDown(1);
      doc.fillColor('#6b7280')
         .font('Helvetica')
         .fontSize(12)
         .text('THIS IS PROUDLY PRESENTED TO', { align: 'center', characterSpacing: 2 });
      
      // Participant Name
      doc.moveDown(1.2);
      doc.fillColor('#111827')
         .font('Helvetica-Bold')
         .fontSize(28)
         .text(userName.toUpperCase(), { align: 'center' });

      // Name Separator Line
      const lineY = doc.y + 12;
      doc.moveTo(width / 2 - 180, lineY)
         .lineTo(width / 2 + 180, lineY)
         .lineWidth(1)
         .stroke('#d4af37');

      // Certificate Body Text
      doc.moveDown(2);
      doc.fillColor('#4b5563')
         .font('Helvetica')
         .fontSize(13)
         .lineGap(6)
         .text('for active involvement, dedication, and successful participation in the event', { align: 'center' });
      
      doc.fillColor('#0f766e')
         .font('Helvetica-Bold')
         .fontSize(16)
         .text(eventName, { align: 'center' });
      
      doc.fillColor('#4b5563')
         .font('Helvetica')
         .fontSize(12)
         .text(`conducted on ${new Date(eventDate).toDateString()} by ${collegeName || 'our campus'}.`, { align: 'center' });

      // Signatures
      const sigY = height - 120;

      // Signature 1: Coordinator
      doc.moveTo(100, sigY).lineTo(250, sigY).lineWidth(1).stroke('#9ca3af');
      doc.fillColor('#374151')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('Event Coordinator', 100, sigY + 8);
      doc.fillColor('#6b7280')
         .font('Helvetica')
         .fontSize(9)
         .text('Organizing Committee', 100, sigY + 22);

      // Signature 2: Authorized Director
      doc.moveTo(width - 250, sigY).lineTo(width - 100, sigY).lineWidth(1).stroke('#9ca3af');
      doc.fillColor('#374151')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('Authorized Signatory', width - 250, sigY + 8);
      doc.fillColor('#6b7280')
         .font('Helvetica')
         .fontSize(9)
         .text('Institution Director', width - 250, sigY + 22);

      // Footer - Verification ID
      doc.fillColor('#9ca3af')
         .font('Helvetica-Oblique')
         .fontSize(8.5)
         .text(`Certificate ID: ${registrationId}`, 40, height - 52, {
           width: width - 80,
           align: 'right'
         });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateCertificatePDF
};
