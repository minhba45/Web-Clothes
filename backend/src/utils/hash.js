const bcrypt=require('bcrypt');
const SALT_ROUNDS=10;
const hashPassword=(password)=>{
    return bcrypt.hash(password,SALT_ROUNDS);
};
const verifyPassword=(password,hassedPassword)=>{
    return bcrypt.compare(password,hassedPassword);
};
module.exports={hashPassword,verifyPassword};