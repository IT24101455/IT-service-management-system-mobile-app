
const mongoose = require('mongoose');

async function checkUser() {
    try {
        await mongoose.connect('mongodb://localhost:27017/itsm_db');
        const db = mongoose.connection.db;
        const user = await db.collection('users').findOne({ email: 'tharanijeyam2001@gmail.com' });
        
        if (user) {
            console.log('--- USER FOUND ---');
            console.log('Email:', user.email);
            console.log('Role:', `"${user.role}"`); // Using quotes to see hidden spaces
            console.log('Role Length:', user.role.length);
        } else {
            console.log('User not found in database.');
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkUser();
