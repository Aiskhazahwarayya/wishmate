'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Definisi Relasi (Association): Pengguna memiliki banyak Wishlist (1:M)
     */
    static associate(models) {
      this.hasMany(models.Wishlist, { 
        foreignKey: 'ID_User',
        as: 'wishlists' 
      });

      // 2. Relasi ke Presensi (Dihapus/diubah, karena tidak ada di skema awal Wishlist Anda, 
      //    tapi jika Anda ingin menambahkannya di masa depan, gunakan:
      /*
      this.hasMany(models.Presensi, { 
          foreignKey: 'ID_User', 
          as: 'presensi' 
      });
      */
    }
  }
  
  User.init({
    ID_User: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    NamaLengkap: {
        type: DataTypes.STRING,
        allowNull: false
    },    
    Email: { 
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },    
    Password: { 
      type: DataTypes.STRING,
      allowNull: false
    }, 
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'pengguna',
  });
  return User;
};