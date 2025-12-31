'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    static associate(models) {
      this.belongsTo(models.User, {
        foreignKey: 'ID_User', 
        as: 'user' 
      });
    }
  }
  
  Wishlist.init({
    ID_Wishlist: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    ID_User: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    NamaItem: {
      type: DataTypes.STRING,
      allowNull: false
    },
    Deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    TargetHarga: {
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false
    },
    StatusItem: {
      type: DataTypes.ENUM('pending', 'dibeli'), 
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'dibeli']] 
      }
    }
  }, {
    sequelize,
    modelName: 'Wishlist',
    tableName: 'wishlist', 
  });
  
  return Wishlist;
};