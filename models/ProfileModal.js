import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  id: { type: String, required: true },
  address: { type: String },
  photo: { type: String }
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;
