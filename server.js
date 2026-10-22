import express from 'express';
import dotenv from 'dotenv';
import conectarBanco from './db.js';

dotenv.config();

const app = express();
app.use(express.json());

const PORTA = process.env.PORTA || 3000;
const conexao = conectarBanco();

// 1. INCLUSÃO (Criar Tarefa)
app.post("/tarefas", async (req, res) => {
    try {
        const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;
        const sql = "INSERT INTO tarefas (nome, descricao, responsavel, data_tarefa, concluido) VALUES (?, ?, ?, ?, ?)";
        const valores = [nome, descricao, responsavel, data_tarefa, concluido ?? false];

        const [resposta] = await conexao.query(sql, valores);
        res.status(201).json({
            id: resposta.insertId,
            message: "Tarefa cadastrada com sucesso!"
        });
    } catch (erro) {
        res.status(500).json({ error: "Erro ao cadastrar tarefa", details: erro.message });
    }
});

// 2. CONSULTA POR ID
app.get("/tarefas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "SELECT * FROM tarefas WHERE id = ?";
        const [resposta] = await conexao.query(sql, [id]);

        if (resposta.length > 0) {
            res.json(resposta[0]);
        } else {
            res.status(404).json({ message: "Tarefa não encontrada" });
        }
    } catch (erro) {
        res.status(500).json({ error: "Erro ao buscar tarefa", details: erro.message });
    }
});

// 3. LISTA DE TAREFAS POR PERÍODO (Filtrar por data_inicio e data_fim nas query params)
// Exemplo de chamada: GET /tarefas?inicio=2026-01-01&fim=2026-01-31
app.get("/tarefas", async (req, res) => {
    try {
        const { inicio, fim } = req.query;

        if (inicio && fim) {
            const sql = "SELECT * FROM tarefas WHERE data_tarefa BETWEEN ? AND ?";
            const [resposta] = await conexao.query(sql, [inicio, fim]);
            return res.json(resposta);
        }

        const sqlGeral = "SELECT * FROM tarefas";
        const [respostaGeral] = await conexao.query(sqlGeral);
        res.json(respostaGeral);
    } catch (erro) {
        res.status(500).json({ error: "Erro ao listar tarefas", details: erro.message });
    }
});

// 4. ATUALIZAÇÃO (Editar Tarefa)
app.put("/tarefas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, responsavel, data_tarefa, concluido } = req.body;
        
        const sql = "UPDATE tarefas SET nome = ?, descricao = ?, responsavel = ?, data_tarefa = ?, concluido = ? WHERE id = ?";
        const valores = [nome, descricao, responsavel, data_tarefa, concluido, id];

        const [resposta] = await conexao.query(sql, valores);

        if (resposta.affectedRows > 0) {
            res.json({ message: "Tarefa atualizada com sucesso" });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada para atualização" });
        }
    } catch (erro) {
        res.status(500).json({ error: "Erro ao atualizar tarefa", details: erro.message });
    }
});

// 5. EXCLUSÃO (Deletar Tarefa)
app.delete("/tarefas/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const sql = "DELETE FROM tarefas WHERE id = ?";
        const [resposta] = await conexao.query(sql, [id]);

        if (resposta.affectedRows > 0) {
            res.json({ message: "Tarefa excluída com sucesso" });
        } else {
            res.status(404).json({ message: "Tarefa não encontrada para exclusão" });
        }
    } catch (erro) {
        res.status(500).json({ error: "Erro ao excluir tarefa", details: erro.message });
    }
});

app.listen(PORTA, () => {
    console.log(`Servidor rodando com sucesso em http://localhost:${PORTA}`);
});