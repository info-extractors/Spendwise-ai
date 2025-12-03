import {DataTypes,Model,Optional} from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes { 
    id : number;
    email : string;
    password : string;
    firstName : string;
    lastName : string;
}


interface UserCreationAttributes extends Optional<UserAttributes,'id'>{

}

class User extends Model<UserAttributes,UserCreationAttributes>{
    public id !: number;
    public email !: string;
    public password !: string;
    public firstName !: string;
    public lastName !: string;

    public readonly createdAt !: Date;
    public readonly updatedAt !: Date;

    
    public validPassword(password : string) : boolean {
        return bcrypt.compareSync(password,this.password);
    }
}

User.init(
    {
        id : {
            type : DataTypes.INTEGER,
            autoIncrement : true,
            primaryKey : true,
        },
        email : {
            type : DataTypes.STRING,
            unique : true,
            allowNull : false,
        },
        password : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        firstName : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        lastName : {
            type : DataTypes.STRING,
            allowNull : false,
        },
    },
    {
        sequelize,
        modelName : 'User',
        hooks : {
            beforeCreate : (user : User) => {
                user.password = bcrypt.hashSync(user.password,10);
            },
        },
    }
);

export default User;