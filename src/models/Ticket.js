import { DataTypes } from 'sequelize';

export const initTicketModel = (sequelize) => {
    return sequelize.define('Ticket', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        imageFullUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        imageThumbUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.ENUM('restaurant', 'hotel', 'work'),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'verified', 'paid', 'rejected'),
            defaultValue: 'pending'
        },
        ticketDate: {
            type: DataTypes.DATE,
            allowNull: false
        }
    }, { tableName: 'tickets' });
};