import { DataTypes } from 'sequelize';

export const initCardCategoryModel = (sequelize) => {
    return sequelize.define('CardCategory', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    }, { tableName: 'card_categories' });
};
