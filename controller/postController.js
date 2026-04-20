import Post from "../models/Post.js";
import Comment from "../models/Comments.js";
import cloudinary from "../services/cloudinary.js";
import fs from "fs";

// controllers
// export const createPost = async (req, res) => {
//     try {
//         const { caption, location } = req.body;
//         const media = req.files.map((file) => {
//             return {
//                 mediaType: file.mimetype.startsWith("image") ? "image" : "video",
//                 mediaUrl: file.path
//             }
//         })

//         const userId = req.user.id;

//         const newPost = await Post.create({
//             caption,
//             userId,
//             location,
//             media
//         })

//         res.status(201).json({
//             success: true,
//             message: "Post Created successfully",
//             data: newPost
//         })

//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             success: false,
//             message: "Error in creating Post",
//         })

//     }
// }

export const createPost = async (req, res) => {
    try {
        const { caption, location } = req.body;
        const media = [];
        
        // [{},{},{}]

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No files uploaded"
            });
        }


        for(const file of req.files){
            // uploading file to cloudinary

            console.log("Uploading file:", file.path);
            console.log("Cloud name:", process.env.CLOUD_NAME);

            const result= await cloudinary.uploader.upload(file.path, {
                folder:"socialConnect-posts",
                resource_type: "auto" 
            })

            media.push({
                mediaType: file.mimetype.startsWith("image") ? "image" : "video",
                mediaUrl: result.secure_url,
                publicId: result.public_id
            })
            fs.unlinkSync(file.path);
        }

        const userId = req.user.id;

        const newPost = await Post.create({
            caption,
            userId,
            location,
            media
        })

        res.status(201).json({
            success: true,
            message: "Post Created successfully",
            data: newPost
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Error in creating Post",
        })

    }
}



// export const getAllPosts = async (req, res) => {
//     try {
//         const posts = await Post.find()
//             .populate("userId", "name profilePicture")
//             .sort({createdAt: -1})

//         res.status(200).json({
//             success: true,
//             data: posts
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: "Error fetching posts" });
//     }
// };

export const getAllPosts = async (req, res) => {
    try {

        // Math.max(value,1)
        const page=Math.max(Number(req.query.page) || 1, 1); //first 1 is default value and second 1 is minimum value of page number
        const limit=Math.min(Number(req.query.limit) || 5,20);
        const skip=(page-1)*limit;

        const posts = await Post.find()
        .populate("userId", "name profilePicture")
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        .sort({createdAt: -1})

        const totalposts = await Post.countDocuments();
        const totalpages = Math.ceil(totalposts/limit);

        res.status(200).json({
            success: true,
            data: posts,
            paginatedData: {
                currentPage: page,
                totalpages: totalpages,
                totalPosts:totalposts,
                hasNextPage:page< totalpages,
                hasPrevPage:page>1

            }
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching posts" });
        
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const posts = await Post.find({ userId: req.user.id })
        .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: posts });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching user posts" });
    }
};


export const deletePost = async(req, res) => {
    try {
        const postId=req.params.delid;
        const userId=req.user.id;

        const myPost= await Post.findById(postId);

        if(!myPost){
            return res.status(404).json({success:false, message:"Post not found"})
        }

        if(myPost.userId.toString() !== userId){
            return res.status(403).json({success:false, message:"Unauthorized"})
        }

        //to delete my images from cloudinary
        for(const media of myPost.media){
            await cloudinary.uploader.destroy(media.publicId)
        }

        const del = await Post.findByIdAndDelete(postId);

        res.status(200).json({
            success:true, 
            message:"Post deleted successfully", 
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false, 
            message:"Error in deleting post"
        })
        
    }
}

// export const createPost = async (req, res) => {
//     try {
//         const { caption, location } = req.body;
//         const media = []

//             for (const file of req.files) {
//                 // Upload each file to Cloudinary
//                 const result = await cloudinary.uploader.upload(file.path, {
//                     folder: "social_connect_posts"
//                 });
//                 media.push({
//                     mediaType: file.mimetype.startsWith("image") ? "image" : "video",
//                     mediaUrl: result.secure_url
//                 })
//                 // Optionally, you can delete the local file after uploading to Cloudinary
//                 fs.unlinkSync(file.path);

//             }

//         const userId = req.user.id;

//         const newPost = await Post.create({
//             caption,
//             userId,
//             location,
//             media
//         })

//         res.status(201).json({
//             success: true,
//             message: "Post Created successfully",
//             data: newPost
//         })


//     } catch (error) {
//         console.log(error)
//         res.status(500).json({
//             success: false,
//             message: "Error in creating Post",
//         })

//     }
// }