const generateEmailTemplate = ({ subject, message }) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; font-size: 24px; font-weight: bold; color: #333; }
            .content { font-size: 16px; color: #555; line-height: 1.6; }
            .footer { margin-top: 20px; font-size: 14px; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">PGR - Virtual Trading Platform</div>
            <hr>
            <div class="content">
              <h3>${subject}</h3>
              <p>${message}</p>
            </div>
            <hr>
            <div class="footer">
              <p>Thanks & Regards,</p>
              <p><strong>PGR - Virtual Trading Platform Team</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;
  };
  
  export default generateEmailTemplate;
  