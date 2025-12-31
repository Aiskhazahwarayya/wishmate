'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Wishlist', {      
      ID_Wishlist: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },      
      ID_User: {
        type: Sequelize.INTEGER,
        allowNull: false, 
        references: {
          model: 'Pengguna', 
          key: 'ID_User'    
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'  
      },      
      NamaItem: {
        type: Sequelize.STRING, 
        allowNull: false
      },      
      Deskripsi: {
        type: Sequelize.TEXT,
        allowNull: false 
      },
      TargetHarga: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },      
      StatusItem: {
        type: Sequelize.ENUM('pending', 'dibeli'),
        allowNull: false, 
        defaultValue: 'pending'                   
      },      
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },      
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },
  
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Wishlist');
  }
};