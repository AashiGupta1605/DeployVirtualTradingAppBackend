import dotenv from "dotenv"; 
dotenv.config();


const generateEmailTemplate = ({ subject, message, buttonText = "", buttonLink = "" ,showHomeLink = true}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0; }
          .container { max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: center; }
           .logo { 
            height: 50px; 
            width: 50px; 
            object-fit: contain; 
            border-radius: 50%; 
            margin-bottom: 4px; /* Reduce the gap */
            display: block;
            margin-left: auto;
            margin-right: auto;
          }
          .header { font-size: 24px; font-weight: bold; color: #333; margin-top: 0; }
          
          /* Fixing Purple Text Issue */
          .content { font-size: 16px; color: #555 !important; line-height: 1.6; text-align: left; }
          .content h3 { color: #333 !important; margin-bottom: 10px; }
          .content p { color: #555 !important; margin-bottom: 10px; }

          
          /* Footer Styling */
          .footer { margin-top: 20px; font-size: 14px; color: #777; }
          
          /* Ensuring Grey Colors & Removing Purple Link Styling */
          a { color: #555 !important; text-decoration: none; font-weight: bold; }
          a:hover { color: #888 !important; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
        <div align="center" style="margin: 0 auto; max-width: 100%;">
          <img src="https://res.cloudinary.com/dufmoqkie/image/upload/v1743314060/PGR_logo_refoho.jpg" alt="PGR Logo" class="logo"  style="display: block; width: 120px; height: 120px; border-radius: 50%; border: 2px solid #f4f4f4;"
    width="120"
    height="120"> 
    </div>
          <div class="header">PGR - Virtual Trading App</div>
          <hr>
          <div class="content">
            <h3>${subject}</h3>
            <p>${message}</p>
            ${buttonLink ? `<a href="${buttonLink}" class="button">${buttonText}</a>` : ""}
            ${showHomeLink ? `<p><a href="${process.env.FRONTEND_URL}">Go to Home</a></p>` : ""}

          </div>
          <hr>
          <div class="footer">
            <p>Thanks & Regards,</p>
            <p><strong>PGR - Virtual Trading App Team</strong></p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export default generateEmailTemplate;
