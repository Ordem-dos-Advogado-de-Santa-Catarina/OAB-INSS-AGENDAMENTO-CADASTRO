
import mysql from "mysql2/promise";
import * as dotenv from "dotenv";

dotenv.config();

async function testInsert() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("DATABASE_URL not found");
        return;
    }

    console.log("Tentando realizar inserção de teste em user_forms...");

    const connection = await mysql.createConnection(dbUrl);

    try {
        // Simulando o mesmo INSERT que falhou para o usuário
        const query = `
      INSERT INTO user_forms 
      (USERID, NAME, CPF, EMAIL, OAB, PHONE, FORMTYPE, REASON, DESCRIPTION, STATUS) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            1, // USERID dummy
            'TESTE FINAL',
            '000.000.000-00',
            'teste@exemplo.com',
            '12345',
            '(48) 99999-9999',
            'tcms_update',
            'Atualização de Endereço',
            'Teste de descrição de erro',
            'draft'
        ];

        const [result] = await connection.execute(query, params);
        console.log("Inserção realizada com sucesso!", result);
    } catch (error: any) {
        console.error("❌ ERRO NO MYSQL:");
        console.error("Mensagem:", error.message);
        console.error("Código:", error.code);
        console.error("SQL State:", error.sqlState);
    } finally {
        await connection.end();
    }
}

testInsert();
