import { DataTypes } from 'sequelize';

export const initPaymentModel = (sequelize) => {
    return sequelize.define('Payment', {
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        method: {
            type: DataTypes.ENUM('card', 'cash'),
            allowNull: false
        },
        payment_code: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        card_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        },
        status: {
            type: DataTypes.ENUM('in_review', 'success', 'cancelled', 'failed'),
            allowNull: false,
            defaultValue: 'in_review'
        },
        label: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        }

    }, { tableName: 'payments' });
};
