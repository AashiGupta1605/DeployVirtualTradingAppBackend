// // services/pdfService.js
// import PDFDocument from 'pdfkit';
// import moment from 'moment-timezone';

// // Helper function to format currency (adjust as needed)
// const formatCurrency = (amount) => {
//     return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// const generateTransactionPDF = (transactions, userName, reportDate, timezone) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const doc = new PDFDocument({ margin: 50, size: 'A4' });
//             const buffers = [];

//             doc.on('data', buffers.push.bind(buffers));
//             doc.on('end', () => {
//                 const pdfData = Buffer.concat(buffers);
//                 resolve(pdfData);
//             });
//             doc.on('error', (err) => {
//                  console.error("PDF generation stream error:", err);
//                  reject(err);
//             });

//             // --- PDF Content ---
//             const reportDateFormatted = moment(reportDate).tz(timezone).format('MMMM Do YYYY');
//             const marketHours = `9:30 AM - 3:30 PM (${timezone})`;

//             // Header
//             // doc.image('path/to/your/PGR_logo_refoho.jpg', { // <--- ADJUST PATH to your actual logo file
//             //     fit: [80, 80],
//             //     align: 'center'
//             // })
//             // .moveDown(0.5); // Space after logo

//             doc.fontSize(18).font('Helvetica-Bold').text('Daily Transaction Report', { align: 'center' });
//             doc.moveDown(1);
//             doc.fontSize(12).font('Helvetica');
//             doc.text(`User: ${userName || 'N/A'}`, { align: 'left' });
//             doc.text(`Date: ${reportDateFormatted}`, { align: 'left' });
//             doc.text(`Market Hours: ${marketHours}`, { align: 'left' });
//             doc.moveDown(2);

//             // Table Header
//             const tableTop = doc.y;
//             const colWidths = { time: 70, symbol: 80, type: 50, qty: 60, price: 90, total: 100 };
//             let currentX = doc.page.margins.left; // Start at left margin

//             doc.fontSize(10).font('Helvetica-Bold');
//             doc.text('Time', currentX, tableTop); currentX += colWidths.time;
//             doc.text('Symbol', currentX, tableTop); currentX += colWidths.symbol;
//             doc.text('Type', currentX, tableTop); currentX += colWidths.type;
//             doc.text('Quantity', currentX, tableTop, { width: colWidths.qty, align: 'right' }); currentX += colWidths.qty;
//             doc.text('Price', currentX, tableTop, { width: colWidths.price, align: 'right' }); currentX += colWidths.price;
//             doc.text('Total', currentX, tableTop, { width: colWidths.total, align: 'right' });

//             // Underline header
//             doc.moveTo(doc.page.margins.left, doc.y + 5)
//                .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
//                .stroke();
//             doc.font('Helvetica').moveDown(0.5);

//             // Table Rows
//             let yPos = doc.y;
//             const rowHeight = 15; // Estimated height per row

//             transactions.forEach((tx, index) => {
//                 // Check if enough space for the row, if not, add new page
//                  if (yPos > doc.page.height - doc.page.margins.bottom - rowHeight) {
//                     doc.addPage();
//                     yPos = doc.page.margins.top; // Reset Y for new page

//                      // Optional: Redraw header on new page
//                     let headerX = doc.page.margins.left;
//                     doc.fontSize(10).font('Helvetica-Bold');
//                     doc.text('Time', headerX, yPos); headerX += colWidths.time;
//                     doc.text('Symbol', headerX, yPos); headerX += colWidths.symbol;
//                     doc.text('Type', headerX, yPos); headerX += colWidths.type;
//                     doc.text('Quantity', headerX, yPos, { width: colWidths.qty, align: 'right' }); headerX += colWidths.qty;
//                     doc.text('Price', headerX, yPos, { width: colWidths.price, align: 'right' }); headerX += colWidths.price;
//                     doc.text('Total', headerX, yPos, { width: colWidths.total, align: 'right' });
//                     doc.moveTo(doc.page.margins.left, doc.y + 5).lineTo(doc.page.width - doc.page.margins.right, doc.y + 5).stroke();
//                     doc.font('Helvetica').moveDown(0.5);
//                     yPos = doc.y; // Update yPos after drawing headers
//                 }

//                 const transactionTime = moment(tx.createdAt).tz(timezone).format('HH:mm:ss');
//                 const priceFormatted = formatCurrency(tx.price);
//                 const totalFormatted = formatCurrency(tx.total);

//                 // Draw row content
//                 let cellX = doc.page.margins.left;
//                 doc.text(transactionTime, cellX, yPos); cellX += colWidths.time;
//                 doc.text(tx.companySymbol, cellX, yPos, { width: colWidths.symbol, ellipsis: true }); cellX += colWidths.symbol; // Added ellipsis for long symbols
//                 doc.text(tx.type.toUpperCase(), cellX, yPos); cellX += colWidths.type;
//                 doc.text(tx.numberOfShares.toString(), cellX, yPos, { width: colWidths.qty, align: 'right' }); cellX += colWidths.qty;
//                 doc.text(priceFormatted, cellX, yPos, { width: colWidths.price, align: 'right' }); cellX += colWidths.price;
//                 doc.text(totalFormatted, cellX, yPos, { width: colWidths.total, align: 'right' });

//                 yPos += rowHeight; // Move yPos down for the next line
//                 doc.y = yPos; // Explicitly set doc.y
//             });

//             // Footer (Page Numbers)
//             const pageCount = doc.bufferedPageRange().count;
//             for (let i = 0; i < pageCount; i++) {
//                 doc.switchToPage(i);
//                 // Add page number at the bottom
//                 doc.fontSize(8).text(`Page ${i + 1} of ${pageCount}`,
//                     doc.page.margins.left,
//                     doc.page.height - doc.page.margins.bottom + 10, // Position below bottom margin
//                     { align: 'center' }
//                 );
//             }

//             // Finalize the PDF and end the stream
//             doc.end();

//         } catch (error) {
//             console.error("Error generating PDF:", error);
//             reject(error);
//         }
//     });
// };

// export default generateTransactionPDF;


// services/pdfService.js
// import PDFDocument from 'pdfkit';
// import moment from 'moment-timezone';
// import fs from 'fs'; // Needed for checking if logo exists
// import path from 'path'; // Needed for resolving logo path

// // Helper function to format currency
// const formatCurrency = (amount) => {
//     // Ensure amount is a number
//     const numAmount = Number(amount);
//     if (isNaN(numAmount)) {
//         return '₹ N/A'; // Or some other placeholder
//     }
//     return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// };

// // Helper function to safely get user ID string
// const getUserIdString = (user) => {
//     if (user && user._id) {
//         return user._id.toString();
//     }
//     return 'N/A';
// };


// const generateTransactionPDF = (
//     transactions,
//     user, // Pass the full user object { _id, name, ... }
//     reportDate,
//     timezone,
//     companyDetails, // Pass { name, logoPath, email, phone }
//     eventDetails = null // Pass { name: eventName } if applicable, otherwise null
// ) => {
//     return new Promise((resolve, reject) => {
//         try {
//             const doc = new PDFDocument({
//                 margin: 50, // Standard margins
//                 size: 'A4',
//                 bufferPages: true // Needed for adding footers/headers later
//             });
//             const buffers = [];

//             doc.on('data', buffers.push.bind(buffers));
//             doc.on('end', () => {
//                 const pdfData = Buffer.concat(buffers);
//                 resolve(pdfData);
//             });
//             doc.on('error', (err) => {
//                  console.error("PDF generation stream error:", err);
//                  reject(err);
//             });

//             // --- PDF Static Details ---
//             const reportDateFormatted = moment(reportDate).tz(timezone).format('MMMM Do YYYY');
//             const marketHours = `9:30 AM - 3:30 PM (${timezone})`;
//             const userName = user?.name || 'N/A';
//             const userId = getUserIdString(user);

//             // --- Header Function ---
//             // const drawHeader = (docInstance) => {
//             //     const headerYStart = docInstance.page.margins.top;
//             //     const headerXStart = docInstance.page.margins.left;
//             //     const contentWidth = docInstance.page.width - docInstance.page.margins.left - docInstance.page.margins.right;

//             //     // 1. Logo and Company Name (Left Aligned)
//             //     const logoPath = companyDetails?.logoPath;
//             //     const companyName = companyDetails?.name || 'PGR Trading';
//             //     let currentY = headerYStart;
//             //     const logoSize = 40; // Smaller logo size

//             //     if (logoPath && fs.existsSync(logoPath)) {
//             //         try {
//             //              docInstance.image(logoPath, headerXStart, currentY, {
//             //                 fit: [logoSize, logoSize],
//             //                 // align: 'left' // Default alignment for image at specific coordinates
//             //              });
//             //              // Place Company Name next to the logo or below
//             //              docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart + logoSize + 10, currentY + (logoSize / 4));
//             //              currentY += logoSize + 5; // Move down below logo area
//             //         } catch (imgErr) {
//             //             console.warn("Could not load logo:", imgErr.message);
//             //             // Fallback: Just draw company name if logo fails
//             //             docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY);
//             //             currentY += 20;
//             //         }
//             //     } else {
//             //         if (logoPath) console.warn(`Logo path not found or invalid: ${logoPath}`);
//             //         // If no logo path or file doesn't exist, just draw company name
//             //         docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY);
//             //         currentY += 20;
//             //     }

//             //      // 2. Report Title (Centered)
//             //      docInstance.fontSize(18).font('Helvetica-Bold').text('Daily Transaction Report', headerXStart, currentY, { align: 'center', width: contentWidth });
//             //      currentY += 30; // Space after title


//             //     // 3. User, Date, Event Info (Left Aligned below Title)
//             //     docInstance.fontSize(11).font('Helvetica');
//             //     docInstance.text(`User: ${userName}`, headerXStart, currentY, { continued: true });
//             //     docInstance.text(` (ID: ${userId})`, { continued: false }); // Add User ID
//             //     currentY += 15;

//             //     // Conditionally display Event Name
//             //     if (eventDetails && eventDetails.name) {
//             //         docInstance.text(`Event: ${eventDetails.name}`, headerXStart, currentY);
//             //         currentY += 15;
//             //     }

//             //     docInstance.text(`Report Date: ${reportDateFormatted}`, headerXStart, currentY);
//             //     currentY += 15;
//             //     docInstance.text(`Market Hours: ${marketHours}`, headerXStart, currentY);
//             //     currentY += 25; // More space before table

//             //     // Return the Y position where the table should start
//             //     return currentY;
//             // };

//                         // --- Header Function ---
//                         const drawHeader = (docInstance) => {
//                             const headerYStart = docInstance.page.margins.top;
//                             const headerXStart = docInstance.page.margins.left;
//                             const contentWidth = docInstance.page.width - docInstance.page.margins.left - docInstance.page.margins.right;
//                             const centerX = headerXStart + contentWidth / 2; // Calculate center X
            
//                             // 1. Logo and Company Name (Centered)
//                             const logoPath = companyDetails?.logoPath;
//                             const companyName = companyDetails?.name || 'PGR Trading';
//                             let currentY = headerYStart;
//                             const logoSize = 50; // Adjust logo size if needed
            
//                             if (logoPath && fs.existsSync(logoPath)) {
//                                 try {
//                                      // Calculate X position to center the logo
//                                      const logoX = centerX - logoSize / 2;
//                                      docInstance.image(logoPath, logoX, currentY, {
//                                         fit: [logoSize, logoSize],
//                                      });
//                                      currentY += logoSize + 5; // Space below logo
            
//                                      // Draw Company Name centered below the logo
//                                      docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY, {
//                                          align: 'center',
//                                          width: contentWidth
//                                      });
//                                      currentY += 20; // Space below company name
            
//                                 } catch (imgErr) {
//                                     console.warn("Could not load logo:", imgErr.message);
//                                     // Fallback: Just draw company name centered if logo fails
//                                     docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY, { align: 'center', width: contentWidth });
//                                     currentY += 25;
//                                 }
//                             } else {
//                                 if (logoPath) console.warn(`Logo path not found or invalid: ${logoPath}`);
//                                 // If no logo path or file doesn't exist, just draw company name centered
//                                 docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY, { align: 'center', width: contentWidth });
//                                 currentY += 25;
//                             }
            
//                              // 2. Report Title (Centered) - Adjust Y position based on above
//                              docInstance.fontSize(18).font('Helvetica-Bold').text('Daily Transaction Report', headerXStart, currentY, { align: 'center', width: contentWidth });
//                              currentY += 30; // Space after title
            
//                             // 3. User, Date, Event Info (Keep Left Aligned or Center?) - Let's keep left for now
//                             docInstance.fontSize(11).font('Helvetica');
//                             docInstance.text(`User: ${userName} (ID: ${userId})`, headerXStart, currentY);
//                             currentY += 15;
            
//                             if (eventDetails && eventDetails.name) {
//                                 docInstance.text(`Event: ${eventDetails.name}`, headerXStart, currentY);
//                                 currentY += 15;
//                             }
            
//                             docInstance.text(`Report Date: ${reportDateFormatted}`, headerXStart, currentY);
//                             currentY += 15;
//                             docInstance.text(`Market Hours: ${marketHours}`, headerXStart, currentY);
//                             currentY += 25; // More space before table
            
//                             // Return the Y position where the table should start
//                             return currentY;
//                         };

//             // --- Footer Function ---
//             const drawFooter = (docInstance) => {
//                 //  const footerY = docInstance.page.height - docInstance.page.margins.bottom + 10;
//                 //  const footerXStart = docInstance.page.margins.left;
//                 //  const contentWidth = docInstance.page.width - docInstance.page.margins.left - docInstance.page.margins.right;
//                 //  const companyEmail = companyDetails?.email || 'praedicoglobalresearch@gmail.com'; // Example
//                 //  const companyPhone = companyDetails?.phone || '+1-800-TRADING';      // Example

//                 //  docInstance.fontSize(8).font('Helvetica-Oblique');

//                 //  // Company Contact Info (Left Aligned)
//                 //  docInstance.text(`Contact: ${companyEmail} | ${companyPhone}`, footerXStart, footerY, {
//                 //     align: 'left',
//                 //     width: contentWidth / 2 // Allocate half width
//                 //  });

//                  // Page Number (Right Aligned) - gets added later in the loop
//             };

//             // --- Draw Header on First Page ---
//             let tableTopY = drawHeader(doc); // Get Y position after drawing header

//             // --- Table Header ---
//             const colWidths = { time: 70, symbol: 90, type: 50, qty: 60, price: 100, total: 110 }; // Adjusted widths
//             const tableHeaderY = tableTopY;
//             let currentX = doc.page.margins.left;

//             doc.fontSize(10).font('Helvetica-Bold');
//             doc.text('Time', currentX, tableHeaderY); currentX += colWidths.time;
//             doc.text('Symbol', currentX, tableHeaderY); currentX += colWidths.symbol;
//             doc.text('Type', currentX, tableHeaderY); currentX += colWidths.type;
//             doc.text('Quantity', currentX, tableHeaderY, { width: colWidths.qty, align: 'right' }); currentX += colWidths.qty;
//             doc.text('Price', currentX, tableHeaderY, { width: colWidths.price, align: 'right' }); currentX += colWidths.price;
//             doc.text('Total', currentX, tableHeaderY, { width: colWidths.total, align: 'right' });

//             // Underline header
//             doc.moveTo(doc.page.margins.left, doc.y + 5)
//                .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
//                .strokeColor('#cccccc') // Lighter gray for underline
//                .stroke();
//             doc.font('Helvetica').moveDown(0.8); // Slightly more space after header line

//             // --- Table Rows ---
//             let yPos = doc.y;
//             const rowHeight = 18; // Increased height for better spacing

//             transactions.forEach((tx, index) => {
//                 // Check for Page Break
//                 if (yPos > doc.page.height - doc.page.margins.bottom - rowHeight - 30) { // Added buffer for footer
//                     doc.addPage();
//                     yPos = drawHeader(doc); // Draw header on new page and get starting Y

//                     // Redraw table header on new page
//                     let headerX = doc.page.margins.left;
//                     doc.fontSize(10).font('Helvetica-Bold');
//                     doc.text('Time', headerX, yPos); headerX += colWidths.time;
//                     doc.text('Symbol', headerX, yPos); headerX += colWidths.symbol;
//                     doc.text('Type', headerX, yPos); headerX += colWidths.type;
//                     doc.text('Quantity', headerX, yPos, { width: colWidths.qty, align: 'right' }); headerX += colWidths.qty;
//                     doc.text('Price', headerX, yPos, { width: colWidths.price, align: 'right' }); headerX += colWidths.price;
//                     doc.text('Total', headerX, yPos, { width: colWidths.total, align: 'right' });
//                     doc.moveTo(doc.page.margins.left, doc.y + 5).lineTo(doc.page.width - doc.page.margins.right, doc.y + 5).strokeColor('#cccccc').stroke();
//                     doc.font('Helvetica').moveDown(0.8);
//                     yPos = doc.y; // Update yPos after drawing headers
//                 }

//                 const transactionTime = moment(tx.createdAt).tz(timezone).format('HH:mm:ss');
//                 const priceFormatted = formatCurrency(tx.price);
//                 const totalFormatted = formatCurrency(tx.total);

//                 // Draw row content
//                 let cellX = doc.page.margins.left;
//                 doc.fontSize(9).font('Helvetica'); // Slightly smaller font for row data
//                 doc.text(transactionTime, cellX, yPos, { width: colWidths.time, lineBreak: false }); cellX += colWidths.time;
//                 doc.text(tx.companySymbol || 'N/A', cellX, yPos, { width: colWidths.symbol, ellipsis: true, lineBreak: false }); cellX += colWidths.symbol;
//                 doc.text(tx.type?.toUpperCase() || 'N/A', cellX, yPos, { width: colWidths.type, lineBreak: false }); cellX += colWidths.type;
//                 doc.text(tx.numberOfShares?.toString() || '0', cellX, yPos, { width: colWidths.qty, align: 'right', lineBreak: false }); cellX += colWidths.qty;
//                 doc.text(priceFormatted, cellX, yPos, { width: colWidths.price, align: 'right', lineBreak: false }); cellX += colWidths.price;
//                 doc.text(totalFormatted, cellX, yPos, { width: colWidths.total, align: 'right', lineBreak: false });

//                 yPos += rowHeight; // Move yPos down for the next line
//                 doc.y = yPos; // Explicitly set doc.y
//             });

//             // --- Add Footer and Page Numbers to all pages ---
//             const range = doc.bufferedPageRange(); // Get page range { start: 0, count: N }
//             for (let i = range.start; i < range.start + range.count; i++) {
//                 doc.switchToPage(i);

//                 // Draw the main footer content (contact info)
//                 drawFooter(doc);

//                 // Add page number (centered or right-aligned at the very bottom)
//                 const footerY = doc.page.height - doc.page.margins.bottom + 10;
//                 const footerXStart = doc.page.margins.left;
//                  const contentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
//                 doc.fontSize(8).font('Helvetica').text(
//                     `Page ${i + 1} of ${range.count}`,
//                     footerXStart, // Start X
//                     footerY,      // Y position
//                     { align: 'right', width: contentWidth } // Align to the right within the content width
//                 );
//             }

//             // Finalize the PDF and end the stream
//             doc.end();

//         } catch (error) {
//             console.error("Error generating PDF:", error);
//             reject(error);
//         }
//     });
// };

// export default generateTransactionPDF;




// services/pdfService.js
import PDFDocument from 'pdfkit';
import moment from 'moment-timezone';
import fs from 'fs'; // Needed for checking if logo exists
import path from 'path'; // Needed for resolving logo path


// Helper function to format currency
const formatCurrency = (amount) => {
    // Ensure amount is a number
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
        return '₹ N/A'; // Or some other placeholder
    }
    return `₹${numAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Helper function to safely get user ID string
const getUserIdString = (user) => {
    if (user && user._id) {
        return user._id.toString();
    }
    return 'N/A';
};


const generateTransactionPDF = (
    transactions,
    user, // Pass the full user object { _id, name, ... }
    reportDate,
    timezone,
    companyDetails, // Pass { name, logoPath, email, phone }
    eventDetails = null // Pass { name: eventName } if applicable, otherwise null
) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50, // Standard margins
                size: 'A4',
                bufferPages: true // Needed for adding elements across pages later
            });
            const buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });
            doc.on('error', (err) => {
                 console.error("PDF generation stream error:", err);
                 reject(err);
            });

            // --- PDF Static Details ---
            const reportDateFormatted = moment(reportDate).tz(timezone).format('MMMM Do YYYY');
            const marketHours = `9:30 AM - 3:30 PM (${timezone})`;
            const userName = user?.name || 'N/A';
            const userId = getUserIdString(user);

            // --- Header Function ---
            const drawHeader = (docInstance) => {
                const headerYStart = docInstance.page.margins.top;
                const headerXStart = docInstance.page.margins.left;
                const contentWidth = docInstance.page.width - docInstance.page.margins.left - docInstance.page.margins.right;
                const centerX = headerXStart + contentWidth / 2; // Calculate center X

                // 1. Logo and Company Name (Centered)
                const logoPath = companyDetails?.logoPath;
                const companyName = companyDetails?.name || 'PGR Trading';
                let currentY = headerYStart;
                const logoSize = 50; // Adjust logo size if needed

                if (logoPath && fs.existsSync(logoPath)) {
                    try {
                         // Calculate X position to center the logo
                         const logoX = centerX - logoSize / 2;
                         docInstance.image(logoPath, logoX, currentY, {
                            fit: [logoSize, logoSize],
                         });
                         currentY += logoSize + 5; // Space below logo

                         // Draw Company Name centered below the logo
                         docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY, {
                             align: 'center',
                             width: contentWidth
                         });
                         currentY += 20; // Space below company name

                    } catch (imgErr) {
                        console.warn("Could not load logo:", imgErr.message);
                        // Fallback: Just draw company name centered if logo fails
                        docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY, { align: 'center', width: contentWidth });
                        currentY += 25;
                    }
                } else {
                    if (logoPath) console.warn(`Logo path not found or invalid: ${logoPath}`);
                    // If no logo path or file doesn't exist, just draw company name centered
                    docInstance.fontSize(14).font('Helvetica-Bold').text(companyName, headerXStart, currentY, { align: 'center', width: contentWidth });
                    currentY += 25;
                }

                 // 2. Report Title (Centered) - Adjust Y position based on above
                 docInstance.fontSize(18).font('Helvetica-Bold').text('Daily Transaction Report', headerXStart, currentY, { align: 'center', width: contentWidth });
                 currentY += 30; // Space after title

                // 3. User, Date, Event Info (Keep Left Aligned)
                docInstance.fontSize(11).font('Helvetica');
                docInstance.text(`User: ${userName} (ID: ${userId})`, headerXStart, currentY);
                currentY += 15;

                if (eventDetails && eventDetails.name) {
                    docInstance.text(`Event: ${eventDetails.name}`, headerXStart, currentY);
                    currentY += 15;
                }

                docInstance.text(`Report Date: ${reportDateFormatted}`, headerXStart, currentY);
                currentY += 15;
                docInstance.text(`Market Hours: ${marketHours}`, headerXStart, currentY);
                currentY += 25; // More space before table

                // Return the Y position where the table should start
                return currentY;
            };

             // --- Footer Function (Simplified for Page Numbers Only) ---
             const drawPageBottomElements = (docInstance) => {
                // This function is now primarily for elements absolutely at the bottom of *every* page.
                // Company contact info is moved to after the table loop.
                // You could add a standard footer line here if needed.
                // const lineY = docInstance.page.height - docInstance.page.margins.bottom;
                // docInstance.moveTo(docInstance.page.margins.left, lineY).lineTo(docInstance.page.width - docInstance.page.margins.right, lineY).strokeColor('#cccccc').stroke();
             };


            // --- Draw Header on First Page ---
            let tableTopY = drawHeader(doc); // Get Y position after drawing header

            // --- Table Header ---
            const colWidths = { time: 70, symbol: 90, type: 50, qty: 60, price: 100, total: 110 }; // Adjusted widths
            const tableHeaderY = tableTopY;
            let currentX = doc.page.margins.left;

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Time', currentX, tableHeaderY); currentX += colWidths.time;
            doc.text('Symbol', currentX, tableHeaderY); currentX += colWidths.symbol;
            doc.text('Type', currentX, tableHeaderY); currentX += colWidths.type;
            doc.text('Quantity', currentX, tableHeaderY, { width: colWidths.qty, align: 'right' }); currentX += colWidths.qty;
            doc.text('Price', currentX, tableHeaderY, { width: colWidths.price, align: 'right' }); currentX += colWidths.price;
            doc.text('Total', currentX, tableHeaderY, { width: colWidths.total, align: 'right' });

            // Underline header
            doc.moveTo(doc.page.margins.left, doc.y + 5)
               .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
               .strokeColor('#cccccc') // Lighter gray for underline
               .stroke();
            doc.font('Helvetica').moveDown(0.8); // Slightly more space after header line

            // --- Table Rows ---
            let yPos = doc.y;
            const rowHeight = 18; // Increased height for better spacing

            transactions.forEach((tx, index) => {
                // Check for Page Break (leave space for potential contact info + page number at bottom)
                if (yPos > doc.page.height - doc.page.margins.bottom - rowHeight - 40) { // Added buffer
                    doc.addPage();
                    yPos = drawHeader(doc); // Draw header on new page and get starting Y

                    // Redraw table header on new page
                    let headerX = doc.page.margins.left;
                    doc.fontSize(10).font('Helvetica-Bold');
                    doc.text('Time', headerX, yPos); headerX += colWidths.time;
                    doc.text('Symbol', headerX, yPos); headerX += colWidths.symbol;
                    doc.text('Type', headerX, yPos); headerX += colWidths.type;
                    doc.text('Quantity', headerX, yPos, { width: colWidths.qty, align: 'right' }); headerX += colWidths.qty;
                    doc.text('Price', headerX, yPos, { width: colWidths.price, align: 'right' }); headerX += colWidths.price;
                    doc.text('Total', headerX, yPos, { width: colWidths.total, align: 'right' });
                    doc.moveTo(doc.page.margins.left, doc.y + 5).lineTo(doc.page.width - doc.page.margins.right, doc.y + 5).strokeColor('#cccccc').stroke();
                    doc.font('Helvetica').moveDown(0.8);
                    yPos = doc.y; // Update yPos after drawing headers
                }

                const transactionTime = moment(tx.createdAt).tz(timezone).format('HH:mm:ss');
                const priceFormatted = formatCurrency(tx.price);
                const totalFormatted = formatCurrency(tx.total);

                // Draw row content
                let cellX = doc.page.margins.left;
                doc.fontSize(9).font('Helvetica'); // Slightly smaller font for row data
                doc.text(transactionTime, cellX, yPos, { width: colWidths.time, lineBreak: false }); cellX += colWidths.time;
                doc.text(tx.companySymbol || 'N/A', cellX, yPos, { width: colWidths.symbol, ellipsis: true, lineBreak: false }); cellX += colWidths.symbol;
                doc.text(tx.type?.toUpperCase() || 'N/A', cellX, yPos, { width: colWidths.type, lineBreak: false }); cellX += colWidths.type;
                doc.text(tx.numberOfShares?.toString() || '0', cellX, yPos, { width: colWidths.qty, align: 'right', lineBreak: false }); cellX += colWidths.qty;
                doc.text(priceFormatted, cellX, yPos, { width: colWidths.price, align: 'right', lineBreak: false }); cellX += colWidths.price;
                doc.text(totalFormatted, cellX, yPos, { width: colWidths.total, align: 'right', lineBreak: false });

                yPos += rowHeight; // Move yPos down for the next line
                doc.y = yPos; // Explicitly set doc.y
            });
            // --- END of transactions.forEach loop ---


            // --- Add Company Contact Info AFTER the table content ---
            let finalContentY = doc.y; // Get Y position after the last table row
            const contactInfoHeightEst = 20; // Estimated height needed for contact info
            const pageContentWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const companyEmail = companyDetails?.email || 'support@default.com';
            const companyPhone = companyDetails?.phone || '+1-000-000-0000';

            // Check if there's enough space on the current page for contact info + page number buffer
            if (finalContentY > doc.page.height - doc.page.margins.bottom - contactInfoHeightEst - 20) {
                doc.addPage();
                // Optional: Redraw header if contact info starts on a new page
                drawHeader(doc); // Draw header on the new page
                finalContentY = doc.y; // Use the Y position after the header on the new page
                 finalContentY += 15; // Add padding after header if contact starts on new page
            } else {
                finalContentY += 20; // Add padding below table if on the same page
            }

            // Draw the contact info (e.g., centered)
            doc.fontSize(9).font('Helvetica-Oblique');
            doc.text(
                `Contact: ${companyEmail} | ${companyPhone}`,
                doc.page.margins.left, // X position
                finalContentY,           // Y position
                { align: 'center', width: pageContentWidth } // Centering options
            );
            // --- END Adding Contact Info ---


            // --- Add Page Numbers to all pages ---
            const range = doc.bufferedPageRange(); // Get page range { start: 0, count: N }
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);

                // Draw elements intended for the very bottom of *every* page (if any)
                 drawPageBottomElements(doc);

                // Add page number (at the very bottom)
                const pageNumY = doc.page.height - doc.page.margins.bottom + 10; // Position for page number
                doc.fontSize(8).font('Helvetica').text(
                    `Page ${i + 1} of ${range.count}`,
                    doc.page.margins.left, // Start X
                    pageNumY,      // Y position
                    { align: 'right', width: pageContentWidth } // Align to the right within the content width
                );
            }

            // Finalize the PDF and end the stream
            doc.end();

        } catch (error) {
            console.error("Error generating PDF:", error);
            reject(error); // Reject the promise on error
        }
    });
};

export default generateTransactionPDF;