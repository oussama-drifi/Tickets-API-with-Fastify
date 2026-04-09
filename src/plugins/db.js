import fp from 'fastify-plugin';
import { Sequelize } from 'sequelize';
import bcrypt from 'bcrypt';
import { initUserModel } from '../models/User.js';
import { initTicketModel } from '../models/Ticket.js';
import { initCardCategoryModel } from '../models/CardCategory.js';
import { initCardModel } from '../models/Card.js';
import { initPaymentModel } from '../models/Payment.js';
import 'dotenv/config';

async function dbConnector(fastify, options) {
    const sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT) || 3306,
            dialect: 'mysql',
            logging: false,
        }
    );

    const User = initUserModel(sequelize);
    const Ticket = initTicketModel(sequelize);
    const CardCategory = initCardCategoryModel(sequelize);
    const Card = initCardModel(sequelize);
    const Payment = initPaymentModel(sequelize);

    User.hasMany(Ticket, { foreignKey: 'userId', as: 'tickets' });
    User.hasMany(Card, { foreignKey: 'userId', as: 'cards' });

    Ticket.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

    CardCategory.hasMany(Card, { foreignKey: 'categoryId', as: 'cards' });

    Card.belongsTo(CardCategory, { foreignKey: 'categoryId', as: 'category' });
    Card.belongsTo(User, { foreignKey: 'userId', as: 'owner' });


    Payment.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });
    Payment.belongsTo(User, { foreignKey: 'userId', as: 'payer' });
    Payment.belongsTo(Card, { foreignKey: 'card_id', as: 'card' });

    try {
        await sequelize.authenticate();
        // Sync models with DB (in dev only!)
        if (process.env.NODE_ENV !== 'production') {
            await sequelize.sync({ alter: true });
        }
        
        fastify.log.info('success: Database connected and synced');

        // Seed default admin if none exists
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'test123', 10);
            await User.create({
                name: 'Admin',
                email: process.env.ADMIN_EMAIL || 'test@example.com',
                password: hashedPassword,
                role: 'admin'
            });
            fastify.log.info('Default admin account created');
        }

        // Decorate fastify instance
        fastify.decorate('db', {
            sequelize,
            models: { User, Ticket, CardCategory, Card, Payment }
        });
    } catch (error) {
        fastify.log.error('error: Database connection failed:', error);
        throw error;
    }
}

export default fp(dbConnector);