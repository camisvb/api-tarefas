import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

function conectarBanco() {
    const conexao = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    return conexao;
}

export default conectarBanco;