const mongoose = require('mongoose')

const mongoURI = "mongodb+srv://pooja:pooja123@cluster0.cyhi7qx.mongodb.net/goFood?retryWrites=true&w=majority&appName=Cluster0";


module.exports = function (callback) {
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, async (err) => {
        if (err) {
            console.log("❌ DB Connection Error: " + err)
        } else {
            console.log("✅ Connected to MongoDB")

            try {
                const foodCollection = await mongoose.connection.db.collection("food_items");
                const data = await foodCollection.find({}).toArray();

                const categoryCollection = await mongoose.connection.db.collection("foodCategory");
                const Catdata = await categoryCollection.find({}).toArray();

                callback(null, data, Catdata);
            } catch (error) {
                console.error("❌ Error fetching collections:", error);
                callback(error, null, null);
            }
        }
    })
};
