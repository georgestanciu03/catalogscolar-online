module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define('Subject', {
      name: { type: DataTypes.STRING, allowNull: false }
    }, {
      tableName: 'subjects',
      timestamps: false
    });
  
    Subject.associate = models => {
      Subject.hasMany(models.Grade, { foreignKey: 'subject_id', as: 'grades' });
    };
  
    return Subject;
  };
  