import mongoose from 'mongoose';
import Methodology from '../models/Methodology.model';
import { methodologiesSeedData } from './methodologies.seed';
import logger from '../utils/logger';
import config from '../config/env';

async function seedMethodologies() {
    try {
        // Connect to database
        await mongoose.connect(config.mongodbUri);
        logger.info('Connected to MongoDB for seeding');

        // Clear existing methodologies (optional - comment out if you want to keep existing)
        // await Methodology.deleteMany({});
        // logger.info('Cleared existing methodologies');

        // Insert seed data
        for (const methodologyData of methodologiesSeedData) {
            const existing = await Methodology.findOne({
                methodologyId: methodologyData.methodologyId,
            });

            if (existing) {
                logger.info(`Methodology ${methodologyData.methodologyId} already exists, skipping`);
                continue;
            }

            await Methodology.create(methodologyData);
            logger.info(`Created methodology: ${methodologyData.methodologyId}`);
        }

        logger.info('Methodology seeding completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Error seeding methodologies:', error);
        process.exit(1);
    }
}

// Run seed if called directly
if (require.main === module) {
    seedMethodologies();
}

export default seedMethodologies;
