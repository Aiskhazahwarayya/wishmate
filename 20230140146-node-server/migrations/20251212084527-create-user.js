'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pengguna', {  
      ID_User: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },      
      NamaLengkap: {
        type: Sequelize.STRING,
        allowNull: false
      },
      Email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true 
      },
      Password: {
        type: Sequelize.STRING,
        allowNull: false
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
    await queryInterface.dropTable('Pengguna');
  }
};