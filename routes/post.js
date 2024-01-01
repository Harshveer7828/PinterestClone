const mongoose = require('mongoose');


const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    image:String,
    title: {
        type:String,
    },
    description: {
        type: String,
    },
    likes: {
        type: Array,
        default:[]
    },
});

// Create the Post model
module.exports = mongoose.model('Post', postSchema);


