module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email:    { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    role:     { type: DataTypes.STRING, allowNull: false }, // 'elev' sau 'profesor'
    name:     { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'users',
    timestamps: false
  });

  User.associate = models => {
    User.hasMany(models.Grade, { foreignKey: 'student_id', as: 'grades' });
    User.hasMany(models.Grade, { foreignKey: 'professor_id', as: 'given_grades' });
  };

  return User;
};
