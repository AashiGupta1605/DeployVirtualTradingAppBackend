
export const buildSearchQuery = (search) => {
    if (!search) return {};
  
    return {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ]
    };
  };
  
  export const buildDateQuery = (startDate, endDate) => {
    const dateQuery = {};
    if (startDate) {
      dateQuery.createdDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      dateQuery.createdDate = dateQuery.createdDate || {};
      dateQuery.createdDate.$lte = new Date(endDate);
    }
    return dateQuery;
  };
  

  export const buildAgeQuery = (minAge, maxAge) => {
    const ageQuery = {};
    const now = new Date();
    if (minAge) {
      const minDob = new Date(now.setFullYear(now.getFullYear() - minAge));
      ageQuery.dob = { $lte: minDob };
    }
    if (maxAge) {
      const maxDob = new Date(now.setFullYear(now.getFullYear() - maxAge));
      ageQuery.dob = ageQuery.dob || {};
      ageQuery.dob.$gte = maxDob;
    }
    return ageQuery;
  };