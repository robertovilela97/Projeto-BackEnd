const db = require('./db');
const axios = require('axios');
const csv = require('csv-parser');
const fs = require('fs');
const constants = require('./constants')

// Função para cadastrar os pontos de interesse através de um arquivo csv.
//#region
async function processarCsvEInserirPontos(filePath, criarPontoInteresse, buscarCoordenadasNominatim) {
    return new Promise((resolve, reject) => {
      const pontosDeInteresse = [];
  
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => pontosDeInteresse.push(data))
        .on('end', async () => {
          try {
            for (const ponto of pontosDeInteresse) {

              //Parte do código para verificar se contém latitude e longitude, caso não tenha faz a busca pelo 
              //metodo buscarCoordenadasNominatim e insere as informacoes que estao faltando
              //#region 
              const { name, street, number, neighborhood, state, city, latitude, longitude } = ponto;
            
              let coordenadas = { latitude, longitude };

              if (!latitude || !longitude) {
                coordenadas = await buscarCoordenadasNominatim(ponto);
              }

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
              //#endregion
              // Com os dados já preenchidos utiliza o metodo criarPontoInteresse para criar o registro no banco
              await criarPontoInteresse(pontoInteresse);
            }
            resolve();
          } catch (error) {
            reject(error);
          } finally {
            fs.unlink(filePath, (err) => {
              if (err) console.error(constants.ERROR_DELETING, err);
            });
          }
        })
        .on('error', (error) => {
          reject(error);
        });
    });
}
//#endregion

// Função para criar um novo ponto de interesse
//#region
async function criarPontoInteresse(pontoInteresse) {
    const { name, street, number, neighborhood, state, city, latitude, longitude } = pontoInteresse;

    try {
        // Verificar se já existe um ponto de interesse com os mesmos dados
        const checkQuery = `
            SELECT * FROM ponto_interesse 
            WHERE name = $1 AND street = $2 AND number = $3 
            AND neighborhood = $4 AND state = $5 AND city = $6
        `;
        const checkValues = [name, street, number, neighborhood, state, city];
        const { rows } = await db.query(checkQuery, checkValues);

        if (rows.length > 0) {
            return { message: constants.ALREADY_REGISTERED };
        }

        const insertQuery = `
            INSERT INTO ponto_interesse (name, street, number, neighborhood, state, city, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const insertValues = [name, street, number, neighborhood, state, city, latitude, longitude];
        const insertResult = await db.query(insertQuery, insertValues);

        // Extrair o ponto de interesse recém-criado
        const pontoInteresseCriado = insertResult.rows[0];

        // Registro de log para o ponto de interesse criado
        const logQuery = `
            INSERT INTO log_ponto_interesse (registration_id, name, description, date_time)
            VALUES ($1, $2, 'Criado registro de ponto de interesse', now())
            RETURNING *
        `;
        const logValues = [pontoInteresseCriado.id, pontoInteresseCriado.name];
        const logResult = await db.query(logQuery, logValues);

        console.log(constants.LOG_CREATED_RECORD, logResult.rows[0]);

        // Retornar o objeto completo do ponto de interesse criado e a mensagem de sucesso
        return { 
            message: constants.SUCCESSFULLY_SAVED,
            data: pontoInteresseCriado
        };
    } catch (err) {
        console.error(constants.ERROR_CREATING, err);
        throw err;
    }
}
//#endregion

// Função para listar pontos de interesse
//#region
async function listarPontosInteresse() {
    try {
        const { rows } = await db.query('SELECT * FROM ponto_interesse');
        return rows;
    } catch (err) {
        console.error(`${constants.SEARCH_ERROR} Na Aplicação: ${err}`);
        throw err;
    }
}
//#endregion

// Função para calcular pontos de interesse dentro de um raio
//#region 
async function calcularPontosInteresseNoRaio(latitude, longitude, raio, status) {
    try {
        console.log(`Calculando pontos de interesse no raio de ${raio} km para a latitude ${latitude} e longitude ${longitude}`);
        const query = `
      SELECT * 
      FROM (
        SELECT *,
              (6371 * acos(cos(radians($1))
              * cos(radians(latitude)) 
              * cos(radians($2) - radians(longitude)) 
              + sin(radians($1)) * sin(radians(latitude)))) 
              AS distancia 
        FROM ponto_interesse
      ) AS subquery 
      WHERE distancia <= $3 and ativo = $4
    `;
        const values = [latitude, longitude, raio, status];
        const { rows } = await db.query(query, values);
        console.log('Pontos encontrados:', rows);
        return rows;
    } catch (err) {
        console.error(constants.ERROR_CALCULATING_RADIUS, err);
        throw err;
    }
}
//#endregion

// Função para atualizar um ponto de interesse através do id informado
//#region 
async function atualizarPontoInteresse(id, pontoInteresse) {

    const { name, street, number, neighborhood, state, city, latitude, longitude } = pontoInteresse
    try {
        const query = `
      UPDATE ponto_interesse
      SET name = $1, street = $2, number = $3, neighborhood = $4, state = $5, city = $6, latitude = $7, longitude = $8
      WHERE id = $9
      RETURNING *
    `;
        const values = [name, street, number, neighborhood, state, city, latitude, longitude, id];
        const { rows } = await db.query(query, values);

        if (rows.length === 0) {
            throw new Error(constants.REGISTER_NOT_FOUND);
        }

        // Extrair o ponto de interesse recem-criado
        const pontoInteresseAtualizado = rows[0];

        // Registro de log para o ponto de interesse criado
        const logQuery = `
            INSERT INTO log_ponto_interesse (registration_id, name, description, date_time)
            VALUES ($1, $2, 'Atualizado registro de ponto de interesse', now())
            RETURNING *
        `;
        const logValues = [pontoInteresseAtualizado.id, pontoInteresseAtualizado.name];
        const logResult = await db.query(logQuery, logValues);

        console.log(constants.LOG_CREATED_RECORD, logResult.rows[0]);

        // Retornar o objeto completo do ponto de interesse criado
        return pontoInteresseAtualizado;
    } catch (err) {
        console.error(constants.ERROR_IN_UPDATE, err);
        throw err;
    }
}
//#endregion

// Função para deletar um ponto de interesse por ID (Delete Lógico)
//#region 
async function deletarLogicoPontoInteresse(id) {
    try {
        // Query para buscar o ponto de interesse e obter o nome
        const getNameQuery = 'SELECT name FROM ponto_interesse WHERE id = $1';
        const { rows: nameRows } = await db.query(getNameQuery, [id]);

        if (nameRows.length === 0) {
            throw new Error(constants.REGISTER_NOT_FOUND);
        }

        const name = nameRows[0].name;

        // Query para inativar o ponto de interesse
        const updateQuery = 'UPDATE ponto_interesse SET ativo = false WHERE id = $1 RETURNING *';
        const { rows: updateRows } = await db.query(updateQuery, [id]);

        if (updateRows.length === 0) {
            throw new Error(constants.REGISTER_NOT_FOUND);
        }

        // Registro de log para o ponto de interesse inativado
        const logQuery = `
            INSERT INTO log_ponto_interesse (registration_id, name, description, date_time)
            VALUES ($1, $2, 'Inativado', now())
            RETURNING *
        `;
        const logValues = [id, name];
        const logResult = await db.query(logQuery, logValues);

        if (logResult.rows.length === 0) {
            throw new Error(constants.ERROR_CREATING_LOG);
        }

        console.log(constants.LOG_CREATED_RECORD, logResult.rows[0]);

        return updateRows[0]; // Retorna o ponto de interesse inativado
    } catch (err) {
        console.error(constants.FAILED_TO_DEACTIVATE, err);
        throw err;
    }
}
//#endregion

// Função para ativar um ponto de interesse por ID
//#region
async function ativarPontoInteresse(id) {
    try {
        // Query para buscar o ponto de interesse e obter o nome
        const getNameQuery = 'SELECT name FROM ponto_interesse WHERE id = $1';
        const { rows: nameRows } = await db.query(getNameQuery, [id]);

        if (nameRows.length === 0) {
            throw new Error(constants.REGISTER_NOT_FOUND);
        }

        const name = nameRows[0].name;

        // Query para ativar o ponto de interesse
        const updateQuery = 'UPDATE ponto_interesse SET ativo = true WHERE id = $1 RETURNING *';
        const { rows: updateRows } = await db.query(updateQuery, [id]);

        if (updateRows.length === 0) {
            throw new Error(constants.REGISTER_NOT_FOUND);
        }

        // Registro de log para o ponto de interesse ativado
        const logQuery = `
            INSERT INTO log_ponto_interesse (registration_id, name, description, date_time)
            VALUES ($1, $2, 'Ativado', now())
            RETURNING *
        `;
        const logValues = [id, name];
        const logResult = await db.query(logQuery, logValues);

        if (logResult.rows.length === 0) {
            throw new Error(constants.ERROR_CREATING_LOG);
        }

        console.log('Criado registro de log:', logResult.rows[0]);

        return updateRows[0]; // Retorna o ponto de interesse inativado
    } catch (err) {
        console.error(constants.FAILED_TO_DEACTIVATE, err);
        throw err;
    }
}
//#endregion

// Função para deletar um ponto de interesse por ID (Delete Físico)
//#region
async function deletarFisicoPontoInteresse(id) {
    try {
        // Query para buscar o ponto de interesse e obter o nome
        const getNameQuery = 'SELECT name FROM ponto_interesse WHERE id = $1';
        const { rows: nameRows } = await db.query(getNameQuery, [id]);

        if (nameRows.length === 0) {
            throw new Error(constants.REGISTER_NOT_FOUND);
        }

        const name = nameRows[0].name;

        // Query para deletar o ponto de interesse
        const deleteQuery = 'DELETE FROM ponto_interesse WHERE id = $1 RETURNING *';
        const { rows: deleteRows } = await db.query(deleteQuery, [id]);

        if (deleteRows.length === 0) {
            throw new Error(constants.REGISTER_NOT_FOUND);
        }

        // Registro de log para o ponto de interesse deletado
        const logQuery = `
            INSERT INTO log_ponto_interesse (registration_id, name, description, date_time)
            VALUES ($1, $2, 'Deletado de forma permanente', now())
            RETURNING *
        `;
        const logValues = [id, name];
        const logResult = await db.query(logQuery, logValues);

        if (logResult.rows.length === 0) {
            throw new Error(constants.ERROR_CREATING_LOG);
        }

        console.log('Criado registro de log:', logResult.rows[0]);

        return deleteRows[0]; // Retorna o ponto de interesse deletado
    } catch (err) {
        console.error(constants.FAILED_TO_DELETE, err);
        throw err;
    }
}
//#endregion

// Função para buscar coordenadas (latitude e longitude) a partir de um endere�o usando o servi�o Nominatim
//#region
async function buscarCoordenadasNominatim(dados) {
    try {
        // Montar o endere�o completo
        const address = `${dados.street}, ${dados.city}, ${dados.state}`;

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

        const response = await axios.get(url);

        if (response.data.length === 0) {
            throw new Error(constants.NO_RESULTS);
        }

        const { lat, lon } = response.data[0];
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch (error) {
        console.error(constants.ERROR_SEEARCH_COORDINATES, error.message);
        throw error;
    }
}
//#endregion

module.exports = {
    listarPontosInteresse,
    criarPontoInteresse,
    deletarFisicoPontoInteresse,
    deletarLogicoPontoInteresse,
    ativarPontoInteresse,
    atualizarPontoInteresse,
    calcularPontosInteresseNoRaio,
    buscarCoordenadasNominatim,
    processarCsvEInserirPontos,
};
