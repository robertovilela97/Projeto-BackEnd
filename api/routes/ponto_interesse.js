const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});
const constants = require('../../Aplicativo/constants')

const { listarPontosInteresse, criarPontoInteresse, deletarFisicoPontoInteresse, deletarLogicoPontoInteresse, atualizarPontoInteresse, calcularPontosInteresseNoRaio, buscarCoordenadasNominatim, processarCsvEInserirPontos, ativarPontoInteresse } = require('../../Aplicativo/index');

//Rota para importar o arquivo csv dos pontos de interesse
//#region
/**
 * @swagger
 * /api/ponto_interesse/Import:
 *   post:
 *     summary: Importa um arquivo CSV de pontos de interesse.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Arquivo CSV importado com sucesso.
 *       400:
 *         description: Falha na importação do arquivo CSV.
 *       500:
 *         description: Erro interno no servidor.
 */
router.post('/Import', upload.single('arquivo'), async (req, res) => {
    // Verifica se o arquivo foi enviado corretamente
    if (!req.file) {
        return res.status(400).send(constants.NULL_FILE);
    }
  
    try {
      const filePath = req.file.path;
  
      // Processar o arquivo CSV e inserir pontos de interesse no banco de dados
      await processarCsvEInserirPontos(filePath, criarPontoInteresse, buscarCoordenadasNominatim);
  
      // Responder ao cliente
      res.send(constants.IMPORTED_FILE);
    } catch (error) {
      console.error(constants.ERROR_WHILE_IMPORTING_AND_INSERTING, error);
      res.status(500).send(constants.IMPORT_ERROR);
    }
  });
  //#endregion

//Rota para cadastrar um novo ponto de interesse
//#region
/**
 * @swagger
 * /api/ponto_interesse/Create:
 *   post:
 *     summary: Cria um novo ponto de interesse.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               street:
 *                 type: string
 *               number:
 *                 type: int
 *               neighborhood:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ponto de interesse criado com sucesso.
 *       400:
 *         description: Dados inv�lidos fornecidos.
 *       500:
 *         description: Erro ao criar ponto de interesse.
 */
router.post('/Create', async (req, res) => {
    const { name, street, number, neighborhood, state, city } = req.body;

    // Validação dos dados recebidos
    if (!name || !street || !number || !neighborhood || !state || !city) {
        return res.status(400).json({ error: `${constants.ALL_REQUIRED_FIELDS} name, street, number, neighborhood, state, city.`});
    }
    const dados = {
        name,
        street,
        number,
        neighborhood,
        state,
        city,
    }
    try {
        // Buscar coordenadas e adicionar no pontoInteresse
        const coordenadas = await buscarCoordenadasNominatim(dados);

        const pontoInteresse = {
            name,
            street,
            number,
            neighborhood,
            state,
            city,
            latitude: coordenadas.latitude,
            longitude: coordenadas.longitude,
        };

        // Criar o ponto de interesse no banco de dados
        const novoPonto = await criarPontoInteresse(pontoInteresse);

        res.status(200).json(novoPonto);
    } catch (err) {
        console.error(`${constants.ERROR_CREATING} Na Rota: ${err}`);
        res.status(500).json({ error: constants.ERROR_CREATING});
    }
});
//#endregion

//Rota para Listar todos os ponto de interesse
//#region
/**
 * @swagger
 * /api/ponto_interesse/Read:
 *   get:
 *     summary: Retorna todos os pontos de interesse cadastrados.
 *     responses:
 *       200:
 *         description: Lista de pontos de interesse.
 */
router.get('/Read', async (req, res) => {
    try {
        const pontosInteresse = await listarPontosInteresse();
        res.json(pontosInteresse);
    } catch (err) {
        console.error(`${constants.SEARCH_ERROR} Na Rota: ${err}`);
        res.status(500).json({ error: constants.SEARCH_ERROR});
    }
});
//#endregion

//Rota para verificar todos os ponto de interesse em um raio (KM) a partir da latitude e longitude fornecidas
//#region
/**
 * @swagger
 * /api/ponto_interesse/Radius:
 *   get:
 *     summary: Retorna pontos de interesse dentro de um raio espec�fico.
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude do ponto de refer�ncia.
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude do ponto de refer�ncia.
 *       - in: query
 *         name: raio
 *         required: true
 *         schema:
 *           type: number
 *         description: Raio em quil�metros.
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Pontos ativos ou inativos.
 *     responses:
 *       200:
 *         description: Lista de pontos de interesse dentro do raio especificado.
 *       400:
 *         description: Dados inv�lidos fornecidos.
 *       500:
 *         description: Erro ao buscar pontos de interesse.
 */
router.get('/Radius', async (req, res) => {
    const { latitude, longitude, raio, status } = req.query;

    // Valida��o b�sica dos dados recebidos
    if (!latitude || !longitude || !raio) {
        return res.status(400).json({ error: `${constants.ALL_REQUIRED_FIELDS} latitude, longitude e raio.`});
    }

    try {
        const pontosNoRaio = await calcularPontosInteresseNoRaio(latitude, longitude, raio, status);
        res.status(200).json(pontosNoRaio);
    } catch (err) {
        console.error(constants.SEARCH_ERROR_RADIUS, err);
        res.status(500).json({ error: constants.SEARCH_ERROR_RADIUS});
    }
});
//#endregion

//Rota para atualizar um ponto de interesse através do id fornecido
//#region
/**
 * @swagger
 * /api/ponto_interesse/Update{id}:
 *   put:
 *     summary: Atualiza um ponto de interesse por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ponto de interesse a ser atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               street:
 *                 type: string
 *               number:
 *                 type: number
 *               neighborhood:
 *                 type: string
 *               state:
 *                 type: string
 *               city:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ponto de interesse atualizado com sucesso.
 *       400:
 *         description: Dados inv�lidos fornecidos.
 *       404:
 *         description: Ponto de interesse n�o encontrado.
 *       500:
 *         description: Erro ao atualizar ponto de interesse.
 */
router.put('/Update:id', async (req, res) => {
    const { id } = req.params;
    const { name, street, number, neighborhood, state, city, } = req.body;

    // Valida��o b�sica dos dados recebidos
    if (!name || !street || !number || !neighborhood || !state || !city) {
        return res.status(400).json({ error: `${constants.ALL_REQUIRED_FIELDS} name, street, number, neighborhood, state, city.`});
    }

    const dados = {
        name,
        street,
        number,
        neighborhood,
        state,
        city,
    }

    try {

        // Buscar coordenadas usando a fun��o buscarCoordenadasNominatim
        const coordenadas = await buscarCoordenadasNominatim(dados);

        // Adicionar latitude e longitude aos dados do ponto de interesse
        const pontoInteresse = {
            name,
            street,
            number,
            neighborhood,
            state,
            city,
            latitude: coordenadas.latitude,
            longitude: coordenadas.longitude,
        };

        const pontoAtualizado = await atualizarPontoInteresse(id, pontoInteresse);
        if (!pontoAtualizado) {
            return res.status(404).json({ error: constants.REGISTER_NOT_FOUND});
        }
        res.status(200).json(pontoAtualizado);
    } catch (err) {
        console.error(`${constants.ERROR_IN_UPDATE} Na Rota: ${err}`);
        res.status(500).json({ error: constants.ERROR_IN_UPDATE });
    }
});
//#endregion

//Rota para inativar um ponto de interesse através do id fornecido
//#region
/**
 * @swagger
 * /api/ponto_interesse/Inactivate/{id}:
 *   put:
 *     summary: Inativa um ponto de interesse por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ponto de interesse a ser inativado.
 *     responses:
 *       200:
 *         description: Ponto de interesse inativado com sucesso.
 *       404:
 *         description: Ponto de interesse n�o encontrado.
 *       500:
 *         description: Erro ao inativar ponto de interesse.
 */
router.put('/Inactivate/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pontoInativado = await deletarLogicoPontoInteresse(id);
        if (!pontoInativado) {
            return res.status(404).json({ error: constants.REGISTER_NOT_FOUND });
        }
        res.status(200).json({ message: constants.DEACTIVATED_SUCCESSFULLY });
    } catch (err) {
        console.error(`${constants.FAILED_TO_DEACTIVATE} Na Rota: ${err}`);
        res.status(500).json({ error: constants.FAILED_TO_DEACTIVATE });
    }
});
//#endregion

//Rota para ativar um ponto de interesse através do id fornecido
//#region
/**
 * @swagger
 * /api/ponto_interesse/Activate/{id}:
 *   put:
 *     summary: ativar um ponto de interesse por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ponto de interesse a ser inativado.
 *     responses:
 *       200:
 *         description: Ponto de interesse ativado com sucesso.
 *       404:
 *         description: Ponto de interesse não encontrado.
 *       500:
 *         description: Erro ao ativar ponto de interesse.
 */
router.put('/Activate/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pontoAtivado = await ativarPontoInteresse(id);
        if (!pontoAtivado) {
            return res.status(404).json({ error: constants.REGISTER_NOT_FOUND });
        }
        res.status(200).json({ message: constants.ACTIVATED_SUCCESSFULLY });
    } catch (err) {
        console.error(`${constants.FAILED_TO_ACTIVATE} Na Rota: ${err}`);
        res.status(500).json({ error: constants.FAILED_TO_ACTIVATE });
    }
});
//#endregion

//Rota para deletar um ponto de interesse através do id fornecido (De forma permanente)
//#region
/**
 * @swagger
 * /api/ponto_interesse/Delete/{id}:
 *   delete:
 *     summary: Deleta um ponto de interesse permanentemente por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do ponto de interesse a ser deletado permanentemente.
 *     responses:
 *       200:
 *         description: Ponto de interesse deletado com sucesso.
 *       404:
 *         description: Ponto de interesse não encontrado.
 *       500:
 *         description: Erro ao deletar ponto de interesse.
 */
router.delete('/Delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pontoDeletado = await deletarFisicoPontoInteresse(id);
        if (!pontoDeletado) {
            return res.status(404).json({ error: constants.REGISTER_NOT_FOUND });
        }
        res.status(200).json({ message: constants.SUCCESSFULLY_DELETED });
    } catch (err) {
        console.error(`${constants.FAILED_TO_DELETE} Na Rota: ${err}`);
        res.status(500).json({ error: constants.FAILED_TO_DELETE });
    }
});
//#endregion

module.exports = router;
