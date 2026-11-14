import connectDB from "../config/db.js";
import Hackathon from "../models/Hackathon.js";
import mongoose from "mongoose";

const run = async () => {
  await connectDB();

  // Remove any legacy records from prior ad-hoc test runs where source was not brabble or demo
  const cleanLegacy = await Hackathon.deleteMany({
    source: { $nin: ["brabble", "demo"] },
  });
  if (cleanLegacy.deletedCount > 0) {
    console.log("Cleaned legacy test records:", cleanLegacy.deletedCount);
  }

  // Set platform from sourceId prefix if platform is default
  const unstopUpdates = await Hackathon.updateMany(
    { isDemo: false, sourceId: /^unstop-/ },
    { $set: { platform: "Unstop" } }
  );
  const internshalaUpdates = await Hackathon.updateMany(
    { isDemo: false, sourceId: /^internshala-/ },
    { $set: { platform: "Internshala" } }
  );
  const devpostUpdates = await Hackathon.updateMany(
    { isDemo: false, sourceId: /^devpost-/ },
    { $set: { platform: "Devpost" } }
  );
  const hackclubUpdates = await Hackathon.updateMany(
    { isDemo: false, sourceId: /^hackclub-/ },
    { $set: { platform: "Hack Club" } }
  );

  console.log("Updated platforms:", {
    unstop: unstopUpdates.modifiedCount,
    internshala: internshalaUpdates.modifiedCount,
    devpost: devpostUpdates.modifiedCount,
    hackclub: hackclubUpdates.modifiedCount,
  });

  const total = await Hackathon.countDocuments();
  const liveCount = await Hackathon.countDocuments({ isDemo: false, source: "brabble" });
  const demoCount = await Hackathon.countDocuments({ isDemo: true });

  const sampleLive = await Hackathon.findOne({ isDemo: false, source: "brabble" });
  console.log(
    JSON.stringify(
      {
        total,
        liveCount,
        demoCount,
        sampleLive: {
          title: sampleLive.title,
          source: sampleLive.source,
          sourceId: sampleLive.sourceId,
          platform: sampleLive.platform,
          isDemo: sampleLive.isDemo,
          prizePool: sampleLive.prizePool,
          registrationUrl: sampleLive.registrationUrl ? "VALID_URL" : "MISSING",
        },
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
