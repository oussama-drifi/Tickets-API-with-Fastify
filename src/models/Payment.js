import { DataTypes } from 'sequelize';

export const initPaymentModel = (sequelize) => {
    return sequelize.define('Payment', {
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('success', 'failed'),
            allowNull: false
        }
    }, { tableName: 'payments' });
};
