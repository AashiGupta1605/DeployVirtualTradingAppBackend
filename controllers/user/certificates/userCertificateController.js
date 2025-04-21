// Get all certificates for a user
// import User from "../../../models/UserModal";
import PDFDocument from 'pdfkit';
import blobStream from 'blob-stream';
import EventRegistration from "../../../models/EventRegistrationModal.js";
export const getUserCertificates = async (req, res) => {
    try {
    //   const userId = req.user.id;
      const userId = req.params.id;
  
      // Find all completed registrations with certificate IDs
      const registrations = await EventRegistration.find({
        userId,
        status: 'Completed', // Only completed events have certificates
        certificateId: { $exists: true }
      })
      .populate('eventId', 'title description startDate endDate entryFee participants icon')
      .sort({ createdAt: -1 });
  
      // Format the response
      const certificates = registrations.map(reg => ({
        certificateId: reg.certificateId,
        event: reg.eventId,
        registrationDate: reg.createdAt,
        registrationId: reg._id
      }));
  
      res.status(200).json({
        success: true,
        count: certificates.length,
        certificates
      });
    } catch (error) {
      console.error('Error fetching user certificates:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user certificates',
        error: error.message
      });
    }
  };
  
  // Generate certificate PDF
//   working

//   export const generateCertificatePDF = async (req, res) => {
//     try {
//       const { certificateId } = req.params;
//     //   const userId = req.user._id;
//       const userId = req.params.id;
  
//       // Verify the certificate belongs to the user
//       const registration = await EventRegistration.findOne({
//         certificateId,
//         userId
//       }).populate('eventId').populate('userId');
  
//       if (!registration) {
//         return res.status(404).json({
//           success: false,
//           message: 'Certificate not found or not authorized'
//         });
//       }
  
//       // Generate certificate data
//       const certificateData = {
//         id: registration.certificateId,
//         userName: registration.userId.name,
//         eventName: registration.eventId.title,
//         eventDescription: registration.eventId.description,
//         registrationDate: registration.createdAt,
//         eventDates: {
//           start: registration.eventId.startDate,
//           end: registration.eventId.endDate
//         }
//       };
  
//       // Generate PDF (this is simplified - you might want to use a proper PDF generation library)
//       const doc = new PDFDocument({
//         layout: 'landscape',
//         size: 'A4'
//       });
  
//       // Set response headers
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader('Content-Disposition', `attachment; filename=${certificateData.userName.replace(' ', '_')}_certificate.pdf`);
  
//       // Pipe the PDF to the response
//       doc.pipe(res);
  
//       // Add certificate content
//     //   doc.image('path/to/your/certificate/background.png', 0, 0, { width: 842, height: 595 });
//       doc.fontSize(36).text('Certificate of Completion', 50, 100);
//       doc.fontSize(24).text(`This certificate is awarded to ${certificateData.userName}`, 50, 160);
//       doc.fontSize(20).text(`For successfully completing ${certificateData.eventName}`, 50, 200);
//       doc.fontSize(16).text(`Event Dates: ${new Date(certificateData.eventDates.start).toLocaleDateString()} - ${new Date(certificateData.eventDates.end).toLocaleDateString()}`, 50, 250);
//       doc.fontSize(14).text(`Certificate ID: ${certificateData.id}`, 50, 300);
//       doc.fontSize(12).text(`Issued on: ${new Date(certificateData.registrationDate).toLocaleDateString()}`, 50, 330);
  
//       // Finalize the PDF
//       doc.end();
  
//     } catch (error) {
//       console.error('Error generating certificate:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to generate certificate',
//         error: error.message
//       });
//     }
//   };



export const generateCertificatePDF = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const userId = req.params.id;

    // Verify certificate ownership
    const registration = await EventRegistration.findOne({
      certificateId,
      userId
    }).populate('eventId').populate('userId');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or not authorized'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${registration.userId.name.replace(' ', '_')}_certificate.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Golden border
    doc.rect(0, 0, doc.page.width, doc.page.height)
       .fill('#fffaf0'); // Light golden background

    doc.strokeColor('#d4af37')
       .lineWidth(15)
       .rect(15, 15, doc.page.width - 30, doc.page.height - 30)
       .stroke();

    // Header section with blue background
    doc.rect(0, 0, doc.page.width, 150)
       .fill('#1e40af'); // Dark blue

    // Certificate icon
    doc.fillColor('#ffffff')
       .fontSize(60)
       .text('✓', 50, 50, { width: 80, align: 'center' });

    // Certificate title
    doc.fillColor('#ffffff')
       .fontSize(36)
       .text('Certificate of Completion', 150, 50);

    // Subtitle
    doc.fillColor('#ffffff')
       .fontSize(18)
       .text('This certificate is proudly presented to', 150, 100);

    // Main content area
    doc.fillColor('#1e3a8a') // Dark blue text
       .fontSize(36)
       .text(registration.userId.name, 50, 180, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Event details
    doc.fillColor('#4b5563') // Gray text
       .fontSize(16)
       .text(`For successfully completing "${registration.eventId.title}"`, 50, 250, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Event dates
    doc.fontSize(14)
       .text(
         `Event Dates: ${new Date(registration.eventId.startDate).toLocaleDateString()} - ${new Date(registration.eventId.endDate).toLocaleDateString()}`,
         50, 300, {
           align: 'center',
           width: doc.page.width - 100
         }
       );

    // Certificate ID
    doc.fontSize(12)
       .text(`Certificate ID: ${certificateId}`, 50, 350, {
         align: 'center',
         width: doc.page.width - 100
       });

    // Verification section
    doc.moveDown(3);
    doc.fillColor('#d4af37') // Gold color
       .text('• • •', { align: 'center', width: doc.page.width - 100 });

    // Signatures
    doc.moveDown(2);
    doc.fillColor('#1e3a8a')
       .text('_________________________', 100, doc.y, { width: 200 });
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Authorized Signature', 100, doc.y + 5, { width: 200 });

    doc.fillColor('#1e3a8a')
       .text('_________________________', 400, doc.y - 25, { width: 200 });
    doc.fontSize(10)
       .fillColor('#6b7280')
       .text('Event Coordinator', 400, doc.y - 20, { width: 200 });

    // Footer
    doc.fontSize(10)
       .fillColor('#9ca3af')
       .text('Verified by TradeTrove', {
         align: 'center',
         width: doc.page.width - 100,
         marginTop: 30
       });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate',
      error: error.message
    });
  }
};