import crypto from 'crypto';
// function generateStrongPassword(name) {
//     const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
//     const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    
//     // Clean the name by removing spaces and special characters
//     const cleanName = name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    
//     // Generate random string
//     const randomString = crypto.randomBytes(4).toString('hex');
    
//     // Combine components to create password
//     let password = `${cleanName}${randomString}${randomSpecialChar}`;
    
//     // Ensure password is at least 8 characters
//     while (password.length < 8) {
//       password += crypto.randomBytes(1).toString('hex');
//     }
    
//     // Trim to 16 characters if it's too long
//     if (password.length > 16) {
//       password = password.substring(0, 16);
//     }
    
//     return password;
//   }


//   export default generateStrongPassword;

function generateStrongPassword(name) {
    // Clean the name (remove spaces and special characters, convert to lowercase)
    const cleanName = name.replace(/\s+/g, '')
                         .replace(/[^a-zA-Z0-9]/g, '')
                         .toLowerCase();
    
    // Special characters pool
    const specialChars = '!@#$%^&*_+-=';
    const randomSpecialChar = specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Generate 4-digit random number
    const random4Digit = Math.floor(1000 + Math.random() * 9000);
    
    // Combine all parts
    return `${cleanName}${randomSpecialChar}${random4Digit}`;
  }

  export default generateStrongPassword;