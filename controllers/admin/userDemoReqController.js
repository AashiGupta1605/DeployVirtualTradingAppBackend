import DemoReqByUserModal from '../../models/DemoReqByUserModal.js';
import DemoReqByOrganizationModal from '../../models/DemoReqByOrganizationModal.js'; 
import { sendDemoBookedEmail, demoCompletedSuccessfulyEmail } from '../../helpers/bookDemoSuccessMailSend.js';

export const addUserDemoRequest = async (req, res) => {
    try {
        const {name, email, mobile, gender, dob, aboutHelp, preferredDate, preferredTimeSlot } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Name is required.' });
        }
        if (!email || email.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }
        if (!mobile || mobile.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Mobile number is required.' });
        }
        if (!gender || gender.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Gender is required.' });
        }
        if (!dob) {
            return res.status(400).json({ success: false, message: 'Date of birth is required.' });
        }
        if (!aboutHelp || aboutHelp.trim().length === 0) {
            return res.status(400).json({ success: false, message: "Tell about, how can we Assist you the best?" });
        }
        if (!preferredDate) {
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
        if (aboutHelp && aboutHelp.trim().length > 160) {
            return res.status(400).json({ success: false, message: 'Maximum length of Query can be 100.' });
        }

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

        const newRequest = new DemoReqByUserModal({
            name: name.trim(),
            email: email.trim(),
            mobile: mobile.trim(),
            gender: gender.trim(),
            dob,
            aboutHelp: aboutHelp.trim(),
            // partOfOrganization,
            // organizationName: organizationName?.trim() || '',
            preferredDate,
            preferredTimeSlot: preferredTimeSlot.trim(),
            demoRequestDate: new Date()
        });

        const savedRequest = await newRequest.save();

        if (savedRequest) {
            
            await sendDemoBookedEmail(email,name,preferredTimeSlot,preferredDate)

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

// export const displayUserDemoRequest = async (req, res) => {
//     try{
//         // const {timeSlot, status, gender, field, search} = req.params;

//         const sevenDaysAgo = new Date();
//         sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

//         const allUserDemoRequests = await DemoReqByUserModal.find({
//             $or: [
//                 { isResolved: false },
//                 { 
//                     isResolved: true, 
//                     demoResolveDate: { $gte: sevenDaysAgo } 
//                 }
//             ]
//         }).sort({ demoRequestDate: -1 }); // latest first

//         if (!allUserDemoRequests || allUserDemoRequests.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No Demo Requests Booked by User found."
//             });
//         }

//         return res.status(201).json({
//             success: true,
//             message: "Demo Requests by Users retrieved successfully.",
//             totalRequests: allUserDemoRequests.length,
//             data: allUserDemoRequests
//         });
//     }
//     catch (error) {
//         console.error("Error in getting Demos booked by User data:", error);
//         return res.status(500).json({
//             success: false,
//             message: `Failed to get Demos booked by User: ${error.message}.`,
//             error: error.message
//         });
//     }
// }


// export const updateUserDemoRequestStatus = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const existingDemoRequest = await DemoReqByUserModal.findById(id);

//         if (!existingDemoRequest) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Demo Request by User not found."
//             });
//         }

//         const newIsResolvedStatus = !existingDemoRequest.isResolved;

//         // Update with toggled status and set demoResolveDate accordingly
//         const updatedDemoRequest = await DemoReqByUserModal.findByIdAndUpdate(
//             id,
//             {
//                 isResolved: newIsResolvedStatus,
//                 demoResolveDate: newIsResolvedStatus ? new Date() : null,
//                 resolvedCount: newIsResolvedStatus ? existingDemoRequest.resolvedCount + 1 : existingDemoRequest.resolvedCount
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
//         console.error("Error in updating user demo request status:", error);
//         return res.status(500).json({
//             success: false,
//             message: `Failed to update Demo request status: ${error.message}`,
//             error: error.message
//         });
//     }
// };


export const displayUserDemoRequest = async (req, res) => {
    try {
        let { timeSlot, status, gender, field, search } = req.params;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Base query: unresolved or resolved in last 7 days
        const query = {
            $or: [
                { isResolved: false },
                {
                    isResolved: true,
                    demoResolveDate: { $gte: sevenDaysAgo }
                }
            ]
        };

        if (field && field.trim()!=="" && field !== "all" && search && search.trim() !== "" && search !== "all") {
            query[field] = { $regex: new RegExp("^" + search, "i") };
        }

        if (timeSlot && timeSlot !== "all") query.preferredTimeSlot = timeSlot;
        if (gender && gender !== "all") query.gender = gender;
        if (status && status !== "all") query.isResolved = status === 'true';

        const allUserDemoRequests = await DemoReqByUserModal?.find(query).sort({ demoRequestDate: -1 });

        // if (!allUserDemoRequests || allUserDemoRequests.length === 0) {
        //     return res.status(400).json({
        //         success: false,
        //         message: "No matching demo requests found."
        //     });
        // }
        //NOTE: No need of above to check are records available or not, bcoz here we are only displaying so no need of this, as this will give error 
        // but, in the case of display this is not any type of error, it's just needed when we r doing something like update or delete. 

        return res.status(201).json({
            success: true,
            message: "Demo Requests of Users retrieved successfully.",
            totalRequests: allUserDemoRequests.length,
            data: allUserDemoRequests
        });

    } 
    catch (error) {
        console.error("Error in getting Demos booked by User data:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to get Demos booked by User: ${error.message}`,
            error: error.message
        });
    }
};

export const updateUserDemoRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const existingDemoRequest = await DemoReqByUserModal.findById(id);

        if (!existingDemoRequest) {
            return res.status(400).json({
                success: false,
                message: "Demo Request by User not found."
            });
        }

        if(existingDemoRequest.isResolved)
            return res.status(400).json({success: false, message: "This Demo Request is Already Resolved"})

        const updatedDemoRequest = await DemoReqByUserModal.findByIdAndUpdate(
            id,
            {
                isResolved: true,
                demoResolveDate: new Date(),
            },
            { new: true }
        );

        if(updatedDemoRequest){
            await demoCompletedSuccessfulyEmail(existingDemoRequest.email,existingDemoRequest.name,existingDemoRequest.preferredDate)
            return res.status(201).json({
                success: true,
                message: `Demo Request is Resolved.`,
                data: updatedDemoRequest
            });
        }

    } 
    catch (error) {
        console.error("Error in updating user demo request status:", error);
        return res.status(500).json({
            success: false,
            message: `Failed to update Demo request status: ${error.message}`,
            error: error.message
        });
    }
};