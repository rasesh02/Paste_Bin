import mongoose from 'mongoose';


const PasteSchema= new mongoose.Schema({
   content:{
    type: String,
    required: true
   },
   maxViews:{
    type: Number,
    default: null 
   },
   views: {
     type: Number,
    default: null 
   },
   expiresAt:{
    type: Date,
    default: null
   },
   createdAt:{
    type: Date,
    default: () => new Date() 
   }
})

//export const Paste=mongoose.model('Paste',PasteSchema);
export const Paste=mongoose.models.Paste || mongoose.model("Paste", PasteSchema);
