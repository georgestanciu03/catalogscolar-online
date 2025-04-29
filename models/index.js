const Sequelize = require('sequelize');
const sequelize = new Sequelize('catalog-scolar', 'postgres', '1q2w3e', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Subject = require('./Subject')(sequelize, Sequelize.DataTypes);
const Grade = require('./Grade')(sequelize, Sequelize.DataTypes);

// Asociere (relații)
User.associate && User.associate({ User, Subject, Grade });
Subject.associate && Subject.associate({ User, Subject, Grade });
Grade.associate && Grade.associate({ User, Subject, Grade });

module.exports = { sequelize, User, Subject, Grade };
