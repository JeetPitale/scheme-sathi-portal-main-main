
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const list = await mongoose.connection.db.collection('schemes').find({}).toArray();
        console.log(`Fixing ${list.length} schemes...`);
        
        for (const s of list) {
            let cat = s.category;
            if (cat === 'pension') cat = 'pensions';
            
            // Create a clean URL slug from the name
            const slug = (s.name || 'unnamed').toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
                
            await mongoose.connection.db.collection('schemes').updateOne(
                { _id: s._id },
                { $set: { category: cat, slug: slug } }
            );
        }
        console.log('DONE! Slugs and Categories fixed.');
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

fix();
