const { faker } = require("@faker-js/faker");
const Post = require("./models/Post");
const User = require("./models/User");
const Comment = require("./models/Comment");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB);
  } catch (err) {
    console.log(err);
  }
  // edit id string to create posts with that user as the author.
  const user = await User.findById("65b80547da3ce5a87ca6b6b5");
  const publishedPosts = await Post.find({ isPublished: true });

  try {
    await Promise.all(
      publishedPosts.map(async (post) => {
        const maxNum = Math.floor(Math.random() * 5);
        for (let i = 0; i < maxNum; i++) {
          const comment = new Comment({
            postId: post._id,
            commentAuthor: user._id,
            body: faker.lorem.sentences({ min: 1, max: 4 }),
          });
          console.log(
            `Comment: ${comment._id} as been made to Post: ${post._id}`,
          );
          await comment.save();
        }
      }),
    );
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  // for (let i = 0; i < 10; i++) {
  //   try {
  //     const post = new Post({
  //       title: faker.lorem.sentences(1),
  //       body: faker.lorem.sentences({ min: 3, max: 10 }),
  //       isPublished: faker.datatype.boolean(0.5),
  //       author: user,
  //     });
  //     await post.save();
  //     console.log("new post created", i + 1);
  //   } catch (err) {
  //     console.log(err);
  //     process.exit(1);
  //   }
  // }
  process.exit(0);
}

main();
