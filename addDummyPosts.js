const { faker } = require("@faker-js/faker");
const Post = require("./models/Post");
const User = require("./models/User");
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
  const user = await User.findById("65ba7e17b8360fe2dc424195");

  for (let i = 0; i < 10; i++) {
    try {
      const post = new Post({
        title: faker.lorem.sentences(1),
        body: faker.lorem.sentences({ min: 3, max: 10 }),
        isPublished: faker.datatype.boolean(0.5),
        author: user,
      });
      await post.save();
      console.log("new post created", i + 1);
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }
  process.exit(0);
}

main();
