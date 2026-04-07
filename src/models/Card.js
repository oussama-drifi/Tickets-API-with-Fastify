import { DataTypes } from 'sequelize';

export const initCardModel = (sequelize) => {
    return sequelize.define('Card', {
        balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        status: {
            type: DataTypes.ENUM('active', 'blocked'),
            defaultValue: 'active'
        }
    }, { tableName: 'cards' });
};
