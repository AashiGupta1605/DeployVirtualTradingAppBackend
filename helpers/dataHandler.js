
// new onoe with gendeer

// dataHandler.js
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

  if (startDate && endDate) {
    // Case 1: Both start date and end date are provided
    dateQuery.createdDate = {
      $gte: new Date(startDate), // Start of the start date
      $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)), // End of the end date
    };
  } else if (startDate) {
    // Case 2: Only start date is provided
    dateQuery.createdDate = {
      $gte: new Date(startDate), // Start of the start date
    };
  } else if (endDate) {
    // Case 3: Only end date is provided
    dateQuery.createdDate = {
      $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)), // End of the end date
    };
  }

  return dateQuery;
};

// export const buildGenderQuery = (gender) => {
//   if (!gender) return {};
//   return { gender: { $regex: gender, $options: 'i' } };
// };

export const buildGenderQuery = (gender) => {
  if (!gender) return {};
  return { gender: { $eq: gender } }; // Use exact match instead of regex
};