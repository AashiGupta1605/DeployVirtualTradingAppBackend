import NiftyData from '../../models/NiftyDataModal.js';
import { saveNiftyDataValidation, getCompanyBySymbolValidation,} from '../../helpers/joiValidation.js';


// Save Nifty data
export const saveNiftyData = async (req, res) => {
  try {
    // Validate request body
    const { error } = saveNiftyDataValidation.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, value } = req.body;
    await new NiftyData({ name, value }).save();
    res.status(201).json({ message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data to the database.' });
  }
};

// Get all Nifty data
export const getNiftyData = async (req, res) => {
  try {
    res.status(200).json(await NiftyData.find());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data' });
  }
};

// Get latest company data by symbol
export const getCompanyBySymbol = async (req, res) => {
  try {
    // Validate request params
    const { error } = getCompanyBySymbolValidation.validate(req.params);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { symbol } = req.params;
    const latestData = await NiftyData.findOne().sort({ fetchTime: -1 });

    if (!latestData?.stocks) {
      return res.status(404).json({ message: 'No stock data available' });
    }

    const company = latestData.stocks.find(stock => stock.symbol === symbol);
    if (!company) {
      return res.status(404).json({ message: `Company with symbol ${symbol} not found` });
    }

    res.status(200).json(company);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all historical data of a company by symbol
export const getAllCompanyDataBySymbol = async (req, res) => {
  try {
    const { symbol } = req.params;
    const allBatches = await NiftyData.find();

    if (!allBatches.length) {
      return res.status(404).json({ message: 'No stock data available' });
    }

    const companyData = allBatches.flatMap(batch => batch.stocks.filter(stock => stock.symbol === symbol));
    if (!companyData.length) {
      return res.status(404).json(`{ message: Company with symbol ${symbol} not found }`);
    }

    res.status(200).json(companyData);
  } catch (error) {
    console.error('Error fetching company data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// controllers/admin/adminControllers.js
import Organization from '../../models/OrgRegisterModal.js';
import transporter from '../../config/emailColfig.js';


export const registerOrganization = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    const { name, email, password, ...otherData } = req.body;
    
    // Create organization
    const organization = await Organization.create({
      name,
      email,
      password,
      ...otherData,
      approvalStatus: 'approved'
    });

    console.log('Organization created:', organization);

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to PGR VirtualTrading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Welcome to PGR VirtualTrading Platform</h1>
          <p>Dear ${name},</p>
          <p>Your organization has been successfully registered on the PGR VirtualTrading Platform.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Your Login Credentials</h2>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please login using these credentials at <a href="${process.env.FRONTEND_URL}" style="color: #2563EB;">${process.env.FRONTEND_URL}</a></p>
          <p style="color: #DC2626;"><strong>Important:</strong> For security reasons, we recommend changing your password after your first login.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0;">Best regards,<br>PGR VirtualTrading Team</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Continue even if email fails
    }

    // Send single response with all information
    res.status(201).json({
      success: true,
      message: 'Organization registered successfully and welcome email sent',
      organization
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register organization',
      error: error.message
    });
  }
};

// Remove separate sendWelcomeEmail endpoint as it's now integrated into registration

// controllers/user/userControllers.js
import User from '../../models/UserModal.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, ...otherData } = req.body;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      ...otherData,
      status: true
    });

    // Send welcome email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to PGR VirtualTrading Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563EB;">Welcome to PGR VirtualTrading Platform</h1>
          <p>Dear ${name},</p>
          <p>Your account has been successfully registered on the PGR VirtualTrading Platform.</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Your Login Credentials</h2>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p>Please login using these credentials at <a href="${process.env.FRONTEND_URL}" style="color: #2563EB;">${process.env.FRONTEND_URL}</a></p>
          <p style="color: #DC2626;"><strong>Important:</strong> For security reasons, we recommend changing your password after your first login.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
            <p style="margin: 0;">Best regards,<br>PGR VirtualTrading Team</p>
          </div>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully and welcome email sent',
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message
    });
  }
};



// controllers/admin/feedbackController.js
import Feedback from '../../models/FeedbackModal.js';

// Get all feedbacks with optional filters
// controllers/admin/feedbackController.js

// Get all feedbacks with optional filters
export const getAllFeedbacks = async (req, res) => {
  try {
    const {
      category,
      rating,
      startDate,
      endDate,
      recommend,
      search
    } = req.query;

    let query = { isDeleted: false };

    // Apply filters if provided
    if (category && category !== 'all') {
      query.feedbackCategory = category;
    }

    if (rating && rating !== 'all') {
      query.rating = parseInt(rating);
    }

    if (recommend === 'true' || recommend === 'false') {
      query.recommend = recommend === 'true';
    }

    if (startDate && endDate) {
      query.createdDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (search) {
      // Get user IDs matching the search criteria
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
      
      const userIds = users.map(user => user._id);
      
      query.$or = [
        { userId: { $in: userIds } },
        { feedbackMessage: { $regex: search, $options: 'i' } }
      ];
    }

    const feedbacks = await Feedback.find(query)
      .populate('userId', 'name email mobile') // Populate user details
      .sort({ createdDate: -1 });

    // Calculate statistics
    const stats = {
      total: feedbacks.length,
      positive: feedbacks.filter(f => f.rating >= 4).length,
      negative: feedbacks.filter(f => f.rating <= 2).length,
      recommended: feedbacks.filter(f => f.recommend).length
    };

    res.status(200).json({
      success: true,
      data: feedbacks,
      stats
    });

  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedbacks',
      error: error.message
    });
  }
};

// Get feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback',
      error: error.message
    });
  }
};

// Update feedback status (approve/reject)
// controllers/admin/feedbackController.js
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status,
          updatedDate: Date.now()
        } 
      },
      { 
        new: true,
        populate: {
          path: 'userId',
          select: 'name email'
        }
      }
    );

    if (!updatedFeedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Feedback status updated to ${status}`,
      data: updatedFeedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update feedback status',
      error: error.message
    });
  }
};

// Soft delete feedback
export const softDeleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isDeleted: true,
          updatedDate: Date.now()
        }
      },
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
      data: feedback
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback',
      error: error.message
    });
  }
};

// Get feedback statistics
export const getFeedbackStats = async (req, res) => {
  try {
    const allFeedbacks = await Feedback.find({ isDeleted: false });

    const stats = {
      total: allFeedbacks.length,
      categoryDistribution: {},
      averageRating: 0,
      recommendationRate: 0
    };

    // Calculate statistics
    if (allFeedbacks.length > 0) {
      // Category distribution
      allFeedbacks.forEach(feedback => {
        stats.categoryDistribution[feedback.feedbackCategory] = 
          (stats.categoryDistribution[feedback.feedbackCategory] || 0) + 1;
      });

      // Average rating
      const totalRating = allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      stats.averageRating = (totalRating / allFeedbacks.length).toFixed(1);

      // Recommendation rate
      const recommended = allFeedbacks.filter(f => f.recommend).length;
      stats.recommendationRate = ((recommended / allFeedbacks.length) * 100).toFixed(1);
    }

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feedback statistics',
      error: error.message
    });
  }
};