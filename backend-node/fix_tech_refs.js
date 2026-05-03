const mongoose = require('mongoose');
const User = require('./models/User');

async function fixRefs() {
  try {
    await mongoose.connect('mongodb://localhost:27017/itsm_db');
    console.log('Connected to database');

    const techs = await User.find({ role: 'TECHNICIAN' });
    console.log(`Checking ${techs.length} technicians...`);

    for (let tech of techs) {
      if (!tech.technicianReference) {
        const ref = 'TECH-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        await User.updateOne(
          { _id: tech._id },
          { $set: { technicianReference: ref } }
        );
        console.log(`Updated: ${tech.name} -> ${ref}`);
      } else {
        console.log(`Skipped (already has ref): ${tech.name} -> ${tech.technicianReference}`);
      }
    }

    console.log('Finished updating technicians.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixRefs();
