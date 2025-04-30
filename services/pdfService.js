// services/pdfService.js
import PDFDocument from 'pdfkit';
import moment from 'moment-timezone';

// Helper function to format currency (adjust as needed)
const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const generateTransactionPDF = (transactions, userName, reportDate, timezone) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
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

            // --- PDF Content ---
            const reportDateFormatted = moment(reportDate).tz(timezone).format('MMMM Do YYYY');
            const marketHours = `9:30 AM - 3:30 PM (${timezone})`;

            // Header
            // doc.image('path/to/your/PGR_logo_refoho.jpg', { // <--- ADJUST PATH to your actual logo file
            //     fit: [80, 80],
            //     align: 'center'
            // })
            // .moveDown(0.5); // Space after logo

            doc.fontSize(18).font('Helvetica-Bold').text('Daily Transaction Report', { align: 'center' });
            doc.moveDown(1);
            doc.fontSize(12).font('Helvetica');
            doc.text(`User: ${userName || 'N/A'}`, { align: 'left' });
            doc.text(`Date: ${reportDateFormatted}`, { align: 'left' });
            doc.text(`Market Hours: ${marketHours}`, { align: 'left' });
            doc.moveDown(2);

            // Table Header
            const tableTop = doc.y;
            const colWidths = { time: 70, symbol: 80, type: 50, qty: 60, price: 90, total: 100 };
            let currentX = doc.page.margins.left; // Start at left margin

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Time', currentX, tableTop); currentX += colWidths.time;
            doc.text('Symbol', currentX, tableTop); currentX += colWidths.symbol;
            doc.text('Type', currentX, tableTop); currentX += colWidths.type;
            doc.text('Quantity', currentX, tableTop, { width: colWidths.qty, align: 'right' }); currentX += colWidths.qty;
            doc.text('Price', currentX, tableTop, { width: colWidths.price, align: 'right' }); currentX += colWidths.price;
            doc.text('Total', currentX, tableTop, { width: colWidths.total, align: 'right' });

            // Underline header
            doc.moveTo(doc.page.margins.left, doc.y + 5)
               .lineTo(doc.page.width - doc.page.margins.right, doc.y + 5)
               .stroke();
            doc.font('Helvetica').moveDown(0.5);

            // Table Rows
            let yPos = doc.y;
            const rowHeight = 15; // Estimated height per row

            transactions.forEach((tx, index) => {
                // Check if enough space for the row, if not, add new page
                 if (yPos > doc.page.height - doc.page.margins.bottom - rowHeight) {
                    doc.addPage();
                    yPos = doc.page.margins.top; // Reset Y for new page

                     // Optional: Redraw header on new page
                    let headerX = doc.page.margins.left;
                    doc.fontSize(10).font('Helvetica-Bold');
                    doc.text('Time', headerX, yPos); headerX += colWidths.time;
                    doc.text('Symbol', headerX, yPos); headerX += colWidths.symbol;
                    doc.text('Type', headerX, yPos); headerX += colWidths.type;
                    doc.text('Quantity', headerX, yPos, { width: colWidths.qty, align: 'right' }); headerX += colWidths.qty;
                    doc.text('Price', headerX, yPos, { width: colWidths.price, align: 'right' }); headerX += colWidths.price;
                    doc.text('Total', headerX, yPos, { width: colWidths.total, align: 'right' });
                    doc.moveTo(doc.page.margins.left, doc.y + 5).lineTo(doc.page.width - doc.page.margins.right, doc.y + 5).stroke();
                    doc.font('Helvetica').moveDown(0.5);
                    yPos = doc.y; // Update yPos after drawing headers
                }

                const transactionTime = moment(tx.createdAt).tz(timezone).format('HH:mm:ss');
                const priceFormatted = formatCurrency(tx.price);
                const totalFormatted = formatCurrency(tx.total);

                // Draw row content
                let cellX = doc.page.margins.left;
                doc.text(transactionTime, cellX, yPos); cellX += colWidths.time;
                doc.text(tx.companySymbol, cellX, yPos, { width: colWidths.symbol, ellipsis: true }); cellX += colWidths.symbol; // Added ellipsis for long symbols
                doc.text(tx.type.toUpperCase(), cellX, yPos); cellX += colWidths.type;
                doc.text(tx.numberOfShares.toString(), cellX, yPos, { width: colWidths.qty, align: 'right' }); cellX += colWidths.qty;
                doc.text(priceFormatted, cellX, yPos, { width: colWidths.price, align: 'right' }); cellX += colWidths.price;
                doc.text(totalFormatted, cellX, yPos, { width: colWidths.total, align: 'right' });

                yPos += rowHeight; // Move yPos down for the next line
                doc.y = yPos; // Explicitly set doc.y
            });

            // Footer (Page Numbers)
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                // Add page number at the bottom
                doc.fontSize(8).text(`Page ${i + 1} of ${pageCount}`,
                    doc.page.margins.left,
                    doc.page.height - doc.page.margins.bottom + 10, // Position below bottom margin
                    { align: 'center' }
                );
            }

            // Finalize the PDF and end the stream
            doc.end();

        } catch (error) {
            console.error("Error generating PDF:", error);
            reject(error);
        }
    });
};

export default generateTransactionPDF;