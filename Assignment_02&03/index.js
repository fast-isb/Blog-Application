const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const User = require('./model/user.js');
// const Token = require('./model/token.js');
const app = express();
const salt = bcrypt.genSaltSync(10);
const path = require('path');
const { log } = require('console');
const { decode } = require('punycode');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
require("dotenv").config();
app.use(express.static('public'));
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}
));
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send("Token is missing");
    }

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send("Invalid token");
        }

        req.user = decoded;
        next();
    });
}
function verifytoken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send("Token is missing");
    }

    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send("Invalid token");
        }

        req.user = decoded;
        next();
    });
}

app.post('/userregister', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!(email && username && password)) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const oldUser = await User.findOne({ email });
        if (oldUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const totalUsers = await User.countDocuments({});
        const user = await User.create({
            userid: totalUsers + 1,
            name: username,
            email: email,
            password: bcrypt.hashSync(password, salt),
        });

        // Save user (if needed)
        // await user.save();

        // Send a meaningful response upon successful user creation
        return res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
});

app.post("/userlogin", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!(email && password && username)) {
            res.status(400).send("All input is required");
        }
        var token;
        const user = await User.findOne({ email });
        const passok = bcrypt.compareSync(password, user.password);
        if (passok) {
            if (user.canlogin) {
                const token = jwt.sign(
                    { username, password, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
                res.status(200).cookie('token', token, { httpOnly: true, secure: false }).json({
                    user
                });
            } else {
                res.status(403).send('You are blocked by admin');
            }
        } else {
            res.status(400).send('Invalid Credentials');
        }

    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});
app.get('/userhome', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        res.json(decoded);
    });
});


app.post('/logout', (req, res) => {
    res.cookie('token', '').json('logout');
});

app.delete('/post/:postid', (req, res) => {
    const { postid } = req.params;
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        }
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            res.status(404).send("User not found");
        }
        const postIndexToDelete = user.posts.findIndex(post => post.postid === parseInt(postid));

        if (postIndexToDelete === -1) {
            res.status(404).send("Post not found");
        }
        user.posts.splice(postIndexToDelete, 1);
        await user.save();
        res.status(200).send(`Post deleted for user ${user.userid}, Post ID: ${postid}`);
    });
})
app.put('/post/:postid', (req, res) => {
    const { postid } = req.params;
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        }
        const { title, description } = req.body;
        if (!title || !description) {
            res.status(400).send("All fields required");
        } else {
            const user = await User.findOne({ email: decoded.email });
            if (!user) {
                res.status(404).send("User not found");
            }

            const postToUpdate = user.posts.find(post => post.postid === parseInt(postid));

            if (!postToUpdate) {
                res.status(404).send("Post not found");
            }
            postToUpdate.title = title;
            postToUpdate.description = description;
            await user.save();

            res.status(200).send(`Post updated for user ${user.userid}, Post ID: ${postToUpdate.postid}`);
        }
    })
});
app.post('/post', async (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        }
        const { title, description } = req.body;
        if (!title || !description) {
            res.status(400).send("All fields required");
        } else {
            const user = await User.findOne({ email: decoded.email });
            if (!user) {
                res.status(404).send("User not found");
            }
            const newPost = {
                postid: user.posts.length + 1,
                title,
                ownerid: user.userid,
                description,
                likes: 0,
                comments: []
            };
            user.posts.push(newPost);
            await user.save();

            res.status(201).send(`Post added for user ${user.userid}`);
        }
    });
});
app.get('/posts', async (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        } else {
            try {
                const user = await User.findOne({ email: decoded.email });

                if (!user) {
                    res.status(404).json({ error: "User not found" });
                    return;
                }

                const following = user.following; // Access 'following' directly from the 'user' object

                const posts = await User.aggregate([
                    { $match: { userid: { $in: [user.userid, ...following] } } },
                    { $unwind: '$posts' },
                    {
                        $match: {
                            $or: [
                                { userid: user.userid }, // Posts of the currently logged-in user
                                { 
                                    userid: { $in: following },
                                    'posts.canshow': true // Posts of followed users with canshow=true
                                } 
                            ],
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            'userid': 1,
                            'name': 1,
                            'posts.postid': 1,
                            'posts.title': 1,
                            'posts.description': 1,
                            'posts.date': 1,
                            'posts.likes': 1,
                            'posts.comments': 1
                        }
                    }
                ]);

                if (!posts || posts.length === 0) {
                    res.status(404).send("No posts found for the user");
                } else {
                    res.status(200).json(posts);
                }
            } catch (error) {
                console.log(error);
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
});


app.get('/following', async (req, res) => {
    const { token } = req.cookies;

    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        } else {
            try {

                // Fetch the authenticated user
                const authenticatedUser = await User.findOne({ email: decoded.email });

                if (!authenticatedUser) {
                    res.status(404).json({ error: "User not found" });
                }

                // Retrieve the 'following' array for the authenticated user
                const followingArray = authenticatedUser.following;
                res.status(200).json({ following: followingArray });
            } catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
});
app.get('/followers', async (req, res) => {
    const { token } = req.cookies;

    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        } else {
            try {

                // Fetch the authenticated user
                const authenticatedUser = await User.findOne({ email: decoded.email });

                if (!authenticatedUser) {
                    res.status(404).json({ error: "User not found" });
                }

                // Retrieve the 'following' array for the authenticated user
                const followingArray = authenticatedUser.followers;
                res.status(200).json({ following: followingArray });
            } catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    });
});
app.get('/getid', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        const user = await User.findOne({ email: decoded.email });
        res.json({ userid: user.userid });
    });
});
app.get('/explore', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        const user = await User.find({ email: { $ne: decoded.email } });
        res.json({ user });
    });
});
app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.TOKEN_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        }
        const user = await User.findOne({ email: decoded.email });
        res.json({
            userid: user.userid,
            username: user.name,
            email: user.email,
        });
    });
});
app.put('/profile', async (req, res) => {
    try {
        const { token } = req.cookies;
        const { username, email, password } = req.body;

        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const oldUser = await User.findOne({ email });
        if (oldUser && oldUser.email !== decoded.email) {
            return res.status(400).json({ error: 'Try another Email to Update Profile' });
        }

        const updatedUser = await User.findOne({ email: decoded.email });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username) {
            updatedUser.name = username;
        }
        if (email) {
            updatedUser.email = email;
        }
        if (password) {
            updatedUser.password = password;
        }

        await updatedUser.save();

        const newToken = jwt.sign(
            { username: updatedUser.name, email: updatedUser.email, password: updatedUser.password },
            process.env.TOKEN_KEY,
            { expiresIn: "2h" }
        );
        res.cookie('token', newToken, { httpOnly: true, secure: false });

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(403).json({ error: "Invalid token or something went wrong" });
    }
})

app.post('/follow/:userid', async (req, res) => {
    const { token } = req.cookies;

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const { userid } = req.params;
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).send("User not found");
        }

        const userToFollow = await User.findOne({ userid: parseInt(userid) });
        if (!userToFollow) {
            return res.status(404).send("User to follow not found");
        }

        // Check if the user is trying to follow themselves
        if (user.userid === userToFollow.userid) {
            return res.status(400).send("You cannot follow yourself");
        }

        // Check if the user is already following the target user
        if (user.following.includes(userToFollow.userid)) {
            return res.status(400).send("You are already following this user");
        }

        // user.following.push(userToFollow.userid);
        // userToFollow.followers.push(user.userid);
        user.following.push(userToFollow.userid);
        userToFollow.followers.push(user.userid);
        userToFollow.Notification_followers.push("User with id " + user.userid + " follow you");
        await user.save();
        await userToFollow.save();

        await user.save();
        await userToFollow.save();

        return res.status(200).send(`You are now following user ${userToFollow.userid}`);
    } catch (error) {
        res.status(403).json({ error: "Invalid token" });
    }
});
app.delete('/follow/:userid', async (req, res) => {
    const { token } = req.cookies;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);

        const { userid } = req.params;
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            res.status(404).send("User not found");
        }

        const userToUnfollow = await User.findOne({ userid: parseInt(userid) });
        if (!userToUnfollow) {
            res.status(404).send("User to follow not found");
        }

        // Check if the user is trying to follow themselves
        if (user.userid === userToUnfollow.userid) {
            res.status(400).send("You cannot follow yourself");
        }

        // Check if the user is already not following the target user
        if (!user.following.includes(userToUnfollow.userid)) {
            res.status(400).send("You are not following this user");
        }
        //  Remove the target user from the current user's following array
        user.following = user.following.filter(followedUserId => followedUserId !== userToUnfollow.userid);

        // Remove the current user from the target user's followers array
        userToUnfollow.followers = userToUnfollow.followers.filter(followerUserId => followerUserId !== user.userid);

        await user.save();
        await userToUnfollow.save();

        res.status(200).send(`You have unfollowed user ${userToUnfollow.userid}`);
    } catch (error) {
        return res.status(403).json({ error: "Invalid token" });
    }

});
app.post('/comment/:userid/:postid', async (req, res) => {
    const { token } = req.cookies;
    const userToFollowId = req.params.userid;
    const postId = req.params.postid;
    const commentText = req.body.comment;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findOne({ email: decoded.email });
        const commenterId = user.userid;
        if (!user) {
            res.status(404).send("User not found");
        }
        if (!commentText) {
            res.status(403).json({ error: 'Content required' });

        }
        // const isFollowing = user.following.includes(userToFollowId);
        // if (!isFollowing) {
        //     res.status(403).json({ error: 'You can only comment on posts of users you are following' });
        // }
        const userToCommentOn = await User.findOne({ userid: parseInt(userToFollowId) });
        if (!userToCommentOn) {
            res.status(404).send("User whose post to be commented on not found");
        }
        const postToCommentOn = userToCommentOn.posts.find(post => post.postid === parseInt(postId));
        if (!postToCommentOn) {
            res.status(404).send("Post id not found in followed user");
        }
        if (!(postToCommentOn.canshow)) {
            res.status(404).send("Post is disabled");
        }
        const newComment = {
            commenters: commenterId,
            text: commentText,
            commentid: postToCommentOn.comments.length + 1, // Assuming commentid is unique, increment for each new comment
        };
        const newnotificationcomment = "User with id " + commenterId + " comment on your post";
        postToCommentOn.comments.push(newComment);
        userToCommentOn.Notification_comments.push(newnotificationcomment);

        await userToCommentOn.save();
        res.status(200).json({ message: 'Comment added successfully', newComment });
    } catch (error) {
        res.status(403).json({ error: "Invalid token" });
    }

});
app.delete('/comment/:userid/:postid/:commentid', async (req, res) => {
    const { token } = req.cookies;
    const userToFollowId = req.params.userid;
    const postId = req.params.postid;
    const commentIdToDelete = req.params.commentid;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findOne({ email: decoded.email });
        const commenterId = user.userid;

        if (!user) {
            res.status(404).send("User not found");
        }

        // const isFollowing = user.following.includes(userToFollowId);

        // if (!isFollowing) {
        //     return res.status(403).json({ error: 'You can only delete comments on posts of users you are following' });
        // }

        const userToCommentOn = await User.findOne({ userid: parseInt(userToFollowId) });

        if (!userToCommentOn) {
            res.status(404).send("User whose post to be commented on not found");
        }
        const postToCommentOn = userToCommentOn.posts.find(post => post.postid === parseInt(postId));

        if (!postToCommentOn) {
            res.status(404).send("Post id not found in followed user");
        }
        if (!(postToCommentOn.canshow)) {
            res.status(404).send("Post is disabled");
        }

        const commentToDelete = postToCommentOn.comments.find(comment => comment.commentid === parseInt(commentIdToDelete));

        if (!commentToDelete) {
            res.status(404).json({ message: 'Comment not found on the specified post' });
        }

        // Check if the comment was made by the current user
        if (commentToDelete.commenters !== commenterId) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }

        // Remove the comment from the array
        postToCommentOn.comments = postToCommentOn.comments.filter(comment => comment.commentid !== parseInt(commentIdToDelete));

        // Save the changes
        await userToCommentOn.save();

        // Return a success message
        return res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

});
app.post('/like/:userid/:postid', async (req, res) => {
    const { token } = req.cookies;
    const followuser = req.params.userid;
    const followuserpost = req.params.postid;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findOne({ email: decoded.email });
        const currentuserid = user.userid;
        if (!user) {
            res.status(404).send("User not found");
        }
        //                 const isFollowing = user.following.includes(followuser);
        // if (!isFollowing) {
        //     return res.status(403).json({ error: 'You can only like posts of users you are following' });
        // }

        const userToFollow = await User.findOne({ userid: parseInt(followuser) });
        if (!userToFollow) {
            res.status(404).send("User whose post to be liked not found");
        }

        const postToUpdate = userToFollow.posts.find(post => post.postid === parseInt(followuserpost));
        if (!postToUpdate) {
            res.status(404).send("Post id not found in followed user");
        }
        if (!(postToUpdate.canshow)) {
            res.status(405).send("Post is disabled");
        }


        // Ensure that likes and likerid are defined
        if (!postToUpdate.likes || !postToUpdate.likes.likerid) {
            postToUpdate.likes = { likerid: [], totalLikes: 0 };
        }

        // Check if the likerid is already in the likes array
        const alreadyLiked = postToUpdate.likes.likerid.includes(parseInt(currentuserid));
        if (alreadyLiked) {
            res.status(400).json({ error: 'You have already liked this post' });
        } else {
            // Add the likerid to the likes array
            postToUpdate.likes.likerid.push(parseInt(currentuserid));
            postToUpdate.likes.totalLikes++;

            await userToFollow.save();
            return res.status(200).json({ message: 'Post liked successfully' });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');

    }
});
app.delete('/like/:userid/:postid', async (req, res) => {
    const { token } = req.cookies;
    const unfollowuser = req.params.userid;
    const unfollowuserpost = req.params.postid;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findOne({ email: decoded.email });
        const currentuserid = user.userid;
        if (!user) {
            res.status(404).send("User not found");
        }
        const userToUnfollow = await User.findOne({ userid: parseInt(unfollowuser) });
        if (!userToUnfollow) {
            res.status(404).send("User whose post to be unliked not found");
        }

        const postToUpdate = userToUnfollow.posts.find(post => post.postid === parseInt(unfollowuserpost));
        if (!postToUpdate) {
            res.status(404).send("Post id not found in unfollowed user");
        }
        if (!(postToUpdate.canshow)) {
            res.send("Post is disabled");
        }

        // Ensure that likes and likerid are defined
        if (!postToUpdate.likes || !postToUpdate.likes.likerid) {
            postToUpdate.likes = { likerid: [], totalLikes: 0 };
        }

        // Check if the likerid is in the likes array
        const likedIndex = postToUpdate.likes.likerid.indexOf(parseInt(currentuserid));
        if (likedIndex === -1) {
            res.status(400).json({ error: 'You have not liked this post' });
        } else {
            // Remove the likerid from the likes array
            postToUpdate.likes.likerid.splice(likedIndex, 1);
            postToUpdate.likes.totalLikes--;
            await userToUnfollow.save();

            // Convert the post to a plain object to avoid validation issues
            // const plainPost = postToUpdate.toObject();

            return res.status(200).json({ message: 'Post unliked successfully' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

});

app.get('/viewnotifications', async (req, res) => {
    const { token } = req.cookies;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).send("User not found");
        }
        let notifications = {};

        // Handle comments notifications
        if (user && user.Notification_comments) {
            if (user.Notification_comments.length < 1) {
                notifications.comments = ["No one commented on your post yet"];
            } else {
                notifications.comments = user.Notification_comments;
            }
        }

        // Handle followers notifications
        if (user && user.Notification_followers) {
            if (user.Notification_followers.length < 1) {
                notifications.followers = ["No one followed you yet"];
            } else {
                notifications.followers = user.Notification_followers;
            }
        }
        // console.log("nosjdkfbkj");
        await user.save();

        res.status(200).json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


// // Unfollow another user (protected by authentication middleware)

app.post('/search/username', async (req, res) => {

    const username = req.body.username;
    const { token } = req.cookies;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findOne({ email: decoded.email });
        const users = await User.find({ name: username });
        if (!user) {
            res.status(403).send("User not found");
        }
        if (!users || users.length === 0) {
            res.status(404).json({ error: 'No users found with the given username' });
        }
        const allUserPosts = [];
        for (const user of users) {
            if (user.posts && user.posts.length > 0) {
                const userPosts = user.posts.map(post => ({
                    userid: user.userid,
                    postid: post.postid,
                    description: post.description,
                    title: post.title,
                    likes: post.likes,
                    comments: post.comments
                }));
                allUserPosts.push(...userPosts);
            }
        }
        res.status(200).json({ allUserPosts });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/search/keyword', async (req, res) => {
    const { token } = req.cookies;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        const user = await User.findOne({ email: decoded.email });
        const { keyword } = req.body;

        if (!user) {
            res.status(403).send("User not found");
        }
        if (!keyword) {
            res.status(400).json({ error: 'Keywords are required for search' });
        }

        // Find all users
        const users = await User.find();

        // Find posts that contain the specified keywords for each user
        const matchingPosts = users.reduce((result, user) => {
            const userMatchingPosts = user.posts.filter(post => post.description.includes(keyword));
            return result.concat(userMatchingPosts);
        }, []);
        console.log(matchingPosts);
        res.status(200).json(matchingPosts);
    } catch (error) {
        // console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post("/adminlogin", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!(email && password && username)) {
            res.status(400).send("All input is required");
        }
        if (username == 'AbdulSubhan' && email == 'i211223@nu.edu.pk' && password == '1223') {
            const token = jwt.sign(
                { username, password, email },
                process.env.REFRESH_KEY,
                {
                    expiresIn: "2h",
                }
            );
            res.status(200).cookie('token', token, { httpOnly: true, secure: false }).json({
                username, password, email
            });
            // res.status(200).cookie('token', token, { httpOnly: true, secure: false }).json({
            //     user
            // });
            // res.status(200).json("login Success");
        } else {
            res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.log(err);
    }
});
app.get('/adminhome', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.REFRESH_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Invalid token" });
        }
        res.json(decoded);
    });
});
app.post('/adminlogout', (req, res) => {
    res.cookie('token', '').json('logout');
});

app.get('/getidadmin', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        }
        res.json({ username: decoded.username, email: decoded.email, password: decoded.password });
    });
});
app.get('/adminprofile', (req, res) => {
    const { token } = req.cookies;
    jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
        if (err) {
            res.status(403).json({ error: "Invalid token" });
        }
        res.json({ username: decoded.username, email: decoded.email, password: decoded.password });
    });
});


app.get('/viewposts', async (req, res) => {
    const { token } = req.cookies;
    try {
        jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
            if (err) {
                res.status(403).json({ error: "Invalid token" });
            }

            const users = await User.find({}, 'userid name canlogin posts');
            res.json(users);
        })
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.post("/block/:userid", async (req, res) => {
    const { token } = req.cookies;
    const usertoblock = req.params.userid;
    console.log(usertoblock);
    try {
        jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
            if (err) {
                res.status(403).json({ error: "Invalid token" });
            }
            const user = await User.findOne({ userid: usertoblock });
            if (!user) {
                res.status(404).json("User not found");
            }
            else {
                if (!(user.canlogin)) {
                    res.json("user is already blocked")
                }
                user.canlogin = false;
                await user.save();
                res.status(200).json(user);
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});
app.post("/unblock/:userid", async (req, res) => {
    const { token } = req.cookies;
    const usertoblock = req.params.userid;
    console.log(usertoblock);
    try {
        jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
            if (err) {
                res.status(403).json({ error: "Invalid token" });
            }
            const user = await User.findOne({ userid: usertoblock });
            if (!user) {
                res.status(404).json("User not found");
            }
            else {
                if ((user.canlogin)) {
                    res.json("user is already unblocked")
                }
                user.canlogin = true;
                await user.save();
                res.status(200).json(user);
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});
app.post('/adminsearch/username', async (req, res) => {

    const username = req.body.username;
    const { token } = req.cookies;
    try {
        jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
            if (err) {
                res.status(403).json({ error: "Invalid token" });
            }
            const users = await User.find({ name: username });
            if (!users || users.length === 0) {
                res.status(404).json({ error: 'No users found with the given username' });
            }
            const allUserPosts = [];
            for (const user of users) {
                if (user.posts && user.posts.length > 0) {
                    const userPosts = user.posts.map(post => ({
                        userid: user.userid,
                        postid: post.postid,
                        description: post.description,
                        title: post.title,
                        likes: post.likes,
                        comments: post.comments
                    }));
                    allUserPosts.push(...userPosts);
                }
            }
            res.status(200).json({ allUserPosts });
        }
        )
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/adminsearch/keyword', async (req, res) => {
    const { token } = req.cookies;
    try {
        jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
            if (err) {
                res.status(403).json({ error: "Invalid token" });
            }
            const { keyword } = req.body;
            if (!keyword) {
                res.status(400).json({ error: 'Keywords are required for search' });
            }

            // Find all users
            const users = await User.find();

            // Find posts that contain the specified keywords for each user
            const matchingPosts = users.reduce((result, user) => {
                const userMatchingPosts = user.posts.filter(post => post.description.includes(keyword));
                return result.concat(userMatchingPosts);
            }, []);
            console.log(matchingPosts);
            res.status(200).json(matchingPosts);
        })
    } catch (error) {
        // console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
// app.post("/adminhome/unblock/:userid", verifytoken, async (req, res) => {
//     try {
//         const usertoblock = req.params.userid;
//         const user = await User.findOne({ userid: usertoblock });
//         if (!user) {
//             return res.status(404).send("User not found");
//         }
//         else {
//             if (user.canlogin) {
//                 return res.send("user is already unblocked")
//             }
//             user.canlogin = true;
//             await user.save();
//             res.json(user)
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).send(error);
//     }
// });

app.post('/disable/:userid/:postid', async (req, res) => {
    const { token } = req.cookies;
    const userID = req.params.userid;
    const postId = req.params.postid;
    try {
        jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
            if (err) {
                res.status(403).json({ error: "Invalid token" });
            }
          

            const user = await User.findOne({ userid: userID });
            if (!user) {
                res.status(404).send("User not found");
            }

            const postToDisable = user.posts.find(post => post.postid === parseInt(postId));
            if (!postToDisable) {
                res.status(404).send("Specific Post Not Found Against User");
            } else {
                if (!(postToDisable.canshow)) {
                    res.send("post is already disable")
                }
                postToDisable.canshow = false; // Corrected the typo in false
                await user.save();
                res.status(200).send("post disabled");
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
app.post('/enable/:userid/:postid', async (req, res) => {
    const { token } = req.cookies;
    const userID = req.params.userid;
    const postId = req.params.postid;
    try {
        jwt.verify(token, process.env.REFRESH_KEY, async (err, decoded) => {
            if (err) {
                res.status(403).json({ error: "Invalid token" });
            }
          

            const user = await User.findOne({ userid: userID });
            if (!user) {
                res.status(404).send("User not found");
            }

            const postToDisable = user.posts.find(post => post.postid === parseInt(postId));
            if (!postToDisable) {
                res.status(404).send("Specific Post Not Found Against User");
            } else {
                if ((postToDisable.canshow)) {
                    res.send("post is already enable")
                }
                postToDisable.canshow = true; // Corrected the typo in false
                await user.save();
                res.status(200).send("post disabled");
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
// app.post('/adminhome/enable/:userid/:postid', verifytoken, async (req, res) => {
//     try {
//         const userID = req.params.userid;
//         const postId = req.params.postid;

//         const user = await User.findOne({ userid: userID });
//         if (!user) {
//             return res.status(404).send("User not found");
//         }

//         const postToDisable = user.posts.find(post => post.postid === parseInt(postId));
//         if (!postToDisable) {
//             res.status(404).send("Specific Post Not Found Against User");
//             return;
//         } else {
//             if (postToDisable.canshow) {
//                 return res.send("post is already enabled")
//             }
//             postToDisable.canshow = true; // Corrected the typo in false
//             await user.save();
//             res.send("post enabled");
//         }

//     } catch (error) {
//         console.log(error);
//         res.status(500).send(error);
//     }
// });

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
});



app.delete('/users', async (req, res) => {
    try {
        const result = await User.deleteMany({});
        res.json({ message: 'All users deleted successfully', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while deleting users' });
    }
});


mongoose.connect("mongodb://localhost/Assignment_02", { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Database connected successfully');
});


app.listen(4000, () => {
    console.log('App runing on port 4000');
})