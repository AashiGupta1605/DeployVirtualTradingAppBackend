import DemoReqByOrganizationModal from '../../models/DemoReqByOrganizationModal.js';
import DemoReqByUserModal from '../../models/DemoReqByUserModal.js';

export const addOrgDemoRequest = async (req, res) => {
    try {
        const {name, website, email, mobile, contactPerson, aboutHelp, preferredDay, preferredTimeSlot } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }
        if (!website || website.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Website is required.' });
        }
        if (!email || email.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }
        if (!mobile || mobile.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Mobile number is required.' });
        }
        if (!aboutHelp || aboutHelp.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Tell about, how can we Assist you the best?" });
        }
        if (!preferredDay || preferredDay.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Preferred day is required.' });
        }
        // if (!preferredTimeSlot || preferredTimeSlot.trim().length === 0) {
        //     return res.status(400).json({ success: false, message: 'Preferred time slot is required.' });
        // }

        if (name && name.trim().length > 25) {
            return res.status(400).json({ success: false, message: 'Name is too large.' });
        }
        if (mobile && mobile.trim().length!=10) {
            return res.status(400).json({ success: false, message: 'Invalid Mobile Number.' });
        }
        if (aboutHelp && aboutHelp.trim().length > 100) {
            return res.status(400).json({ success: false, message: 'Maximum length of Query can be 100.' });
        }

        // const emailExists = await DemoReqByOrganizationModal.findOne({ email: email.trim() });
        // if (emailExists) {
        //     return res.status(409).json({ success: false, message: 'Demo Request by this Email already exists.' });
        // }
        // const mobileExists = await DemoReqByOrganizationModal.findOne({ mobile: mobile.trim() });
        // if (mobileExists) {
        //     return res.status(409).json({ success: false, message: 'Demo Request by this Contact Number already exists.' });
        // }

        const today = new Date();
        const getDayDifference = (startDate, endDate) => {
            const diffInMs = endDate - startDate;
            return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        };

        const emailExistsInOrg = await DemoReqByOrganizationModal.findOne({ email: email.trim(), isResolved:false });
        const emailExistsInUser = await DemoReqByUserModal.findOne({ email: email.trim(), isResolved:false });
        if (emailExistsInUser) {
            const daysDiff = getDayDifference(new Date(emailExistsInUser.demoRequestDate), today);
            if (daysDiff < 7) {
                return res.status(409).json({ success: false, message: `Demo Booked As a User by this Email already exists. Re-Request Demo after ${7-daysDiff} days.` });
            }
        }
        if (emailExistsInOrg) {
            const daysDiff = getDayDifference(new Date(emailExistsInOrg.demoRequestDate), today);
            if(daysDiff<7){
                return res.status(409).json({ success: false, message: `Demo Booked As an Organization by this Email already exists. Re-Request Demo after ${7-daysDiff} days.` });
            }
        }

        const mobileExistsInOrg = await DemoReqByOrganizationModal.findOne({ mobile: mobile.trim(), isResolved:false });
        const mobileExistsInUser = await DemoReqByUserModal.findOne({ mobile: mobile.trim(), isResolved:false });
        if (mobileExistsInUser) {
            const daysDiff = getDayDifference(new Date(mobileExistsInUser.demoRequestDate), today);
            if(daysDiff<7)
            return res.status(409).json({ success: false, message: `Demo Booked As a User by this Mobile Number already exists. Re-Request Demo after ${7-daysDiff} days.` });
        }
        if (mobileExistsInOrg) {
            const daysDiff = getDayDifference(new Date(mobileExistsInOrg.demoRequestDate), today);
            if(daysDiff<7)
            return res.status(409).json({ success: false, message: `Demo Booked As an Organization by this Mobile Number already exists. Re-Request Demo after ${7-daysDiff} days.` });
        }

        const newRequest = new DemoReqByOrganizationModal({
            name: name.trim(),
            website: website.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            contactPerson: contactPerson.trim(),
            aboutHelp: aboutHelp.trim(),
            // preferredDate,
            preferredDay: preferredDay.trim(),
            preferredTimeSlot: preferredTimeSlot.trim(),
            demoRequestDate: new Date()
        });

        const savedRequest = await newRequest.save();

        if (savedRequest) {
            return res.status(201).json({
                success: true,
                message: "Your Demo Request Booked Successfully.",
                data: savedRequest
            });
        } 
        else {
            return res.status(500).json({
                success: false,
                message: "Failed to save demo request. Please try again."
            });
        }
    } 
    catch (error) 
    {
        console.error('Error in addDemoRequest:', error);
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `${duplicateField} already exists. Please use a unique value.`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Something went wrong while processing your request.',
            error: error.message
        });
    }
};

export const displayOrgDemoRequest = async (req, res) => {
    try{
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const allOrgDemoRequests = await DemoReqByOrganizationModal.find({
            $or: [
                { isResolved: false },
                { 
                    isResolved: true, 
                    demoResolveDate: { $gte: sevenDaysAgo } 
                }
            ]
        }).sort({ demoRequestDate: -1 }); // latest first

        if (!allOrgDemoRequests || allOrgDemoRequests.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No Demo Requests Booked by Organization found."
            });
        }

        return res.status(201).json({
            success: true,
            message: "Demo Requests by Organizations retrieved successfully.",
            totalRequests: allOrgDemoRequests.length,
            data: allOrgDemoRequests
        });
    }
    catch (error) {
        console.error("Error in getting Demos booked by Organization data:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to get Demos booked by Organization: ${error.message}.`,
            error: error.message
        });
    }
}

// export const updateOrgDemoRequestStatus = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const existingDemoRequest = await DemoReqByOrganizationModal.findById(id);

//         if (!existingDemoRequest) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Demo Request by Organization not found."
//             });
//         }

//         const newIsResolvedStatus = !existingDemoRequest.isResolved;

//         // Update with toggled status and set demoResolveDate accordingly
//         const updatedDemoRequest = await DemoReqByOrganizationModal.findByIdAndUpdate(
//             id,
//             {
//                 isResolved: newIsResolvedStatus,
//                 demoResolveDate: newIsResolvedStatus ? new Date() : null,
//                 resolvedCount: newIsResolvedStatus ? existingDemoRequest.resolvedCount + 1 : existingDemoRequest.resolvedCount,
//             },
//             { new: true }
//         );

//         return res.status(201).json({
//             success: true,
//             message: `Demo Request status is now marked as ${newIsResolvedStatus ? "Resolved" : "Pending"}.`,
//             data: updatedDemoRequest
//         });

//     } 
//     catch (error) {
//         console.error("Error in updating Organization demo request status:", error);
//         return res.status(500).json({
//             success: false,
//             message: `Failed to update Demo request status: ${error.message}`,
//             error: error.message
//         });
//     }
// };

export const updateOrgDemoRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const existingDemoRequest = await DemoReqByOrganizationModal.findById(id);

        if (!existingDemoRequest) {
            return res.status(400).json({
                success: false,
                message: "Demo Request by Organization not found."
            });
        }

        if(existingDemoRequest.isResolved)
            return res.status(400).json({success: false, message: "This Demo Request is Already Resolved"})

        const updatedDemoRequest = await DemoReqByOrganizationModal.findByIdAndUpdate(
            id,
            {
                isResolved: true,
                demoResolveDate: new Date(),
            },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: `Demo Request is Resolved.`,
            data: updatedDemoRequest
        });

    } 
    catch (error) {
        console.error("Error in updating Organization demo request status:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update Demo request status: ${error.message}`,
            error: error.message
        });
    }
};