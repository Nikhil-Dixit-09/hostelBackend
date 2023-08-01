const mongoose = require("mongoose");
const complaintSchema = mongoose.Schema({
  description: { type: String, required: true },
  hostel: { type: String, required: true },
  roomNumber: { type: String, required: true },
  person: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: Number, default: 1 },
  genre: { type: String, required: true },
  img: {type:String}
});
const Complaints = mongoose.model("Complaints", complaintSchema);
module.exports = Complaints;
