import {DataTypes,Model,Optional} from 'sequelize';
import sequelize from '../config/database';

interface TransactionAttributes {
    id : number;
    amount : number;
    description : string;
    category : string;
    type  : 'income' | 'expense';
    date : Date;
    userId : number;
    aiConfidence?: number;
    source?: string;
}

interface TransactionCreationAttributes extends Optional<TransactionAttributes,'id'>{

}

class Transaction extends Model<TransactionAttributes,TransactionCreationAttributes>{
    public id !: number;
    public amount !: number;
    public description !: string;
    public category !:string;
    public type !: 'income' | 'expense';
    public date !: Date;
    public userId !: number;
    public aiConfidence?: number; 
    public source?: string;

    public readonly createdAt !: Date;
    public readonly updatedAt !: Date;
}

Transaction.init(
    {
        id : {
            type : DataTypes.INTEGER,
            autoIncrement : true,
            primaryKey : true,
        },
        amount : {
            type : DataTypes.DECIMAL(10,2),
            allowNull : false,
        },
        description : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        category : {
            type : DataTypes.STRING,
            allowNull : false,
        },
        type : {
            type : DataTypes.ENUM('income','expense'),
            allowNull : false,
        },
        date : {
            type : DataTypes.DATE,
            allowNull : false,
        },
        userId : {
            type : DataTypes.INTEGER,
            allowNull : false,
            references : {
                model : 'Users',
                key : 'id',
            },
        },aiConfidence: {
            type: DataTypes.FLOAT,
            allowNull: true,  // Can be null for manually created transactions
        },
        source: {
            type: DataTypes.STRING,
            defaultValue: 'manual',  // Default value for existing transactions
        },
    },{
        sequelize,
        modelName : 'Transaction',
    }
)

export default Transaction;