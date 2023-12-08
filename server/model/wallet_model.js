const mongoose=require('mongoose')
const Schema = mongoose.Schema;

mongoose.connect("mongodb://127.0.0.1:27017/furnify")


const walletSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userdetails',
    },
    wallet: {
      type: Number,
      default: 0,
    },
    walletTransactions: [
      {
        date: { type: Date },
        type: { type: String },
        amount: { type: Number },
      },
    ],
  });
  
  const walletModel = mongoose.model("wallets", walletSchema);

module.exports=walletModel