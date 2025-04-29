module.exports = (sequelize, DataTypes) => {
    const Grade = sequelize.define('Grade', {
      grade:       { type: DataTypes.INTEGER, allowNull: false },
      student_id:  { type: DataTypes.INTEGER, allowNull: false },
      subject_id:  { type: DataTypes.INTEGER, allowNull: false },
      professor_id:{ type: DataTypes.INTEGER, allowNull: false }
    }, {
      tableName: 'grades',
      timestamps: false
    });
  
    Grade.associate = models => {
      Grade.belongsTo(models.User, { as: 'student', foreignKey: 'student_id' });
      Grade.belongsTo(models.User, { as: 'professor', foreignKey: 'professor_id' });
      Grade.belongsTo(models.Subject, { foreignKey: 'subject_id' });
    };
  
    return Grade;
  };
  