const pactum = require('pactum');
const faker = require('faker');

describe('Testes da API de Empresas', () => {
  const baseUrl = 'https://api-desafio-qa.onrender.com/company';

  let validCompanyData;
  let invalidCompanyData;
  let companyId;

  beforeEach(() => {
    validCompanyData = {
      name: faker.company.companyName(),
      cnpj: faker.random.number({ min: 10000000000000, max: 99999999999999 }).toString(), // Gerar um CNPJ válido
      state: faker.address.stateAbbr(),
      city: faker.address.city(),
      address: faker.address.streetAddress(),
      sector: faker.commerce.department()
    };

    invalidCompanyData = {
      name: '',
      cnpj: faker.random.number({ min: 10000000000000, max: 99999999999999 }).toString(), // CNPJ válido
      state: 'SC',
      city: 'Criciuma',
      address: 'Rua Pedro, 123',
      sector: faker.commerce.department()
    };
  });

  // 1 - Teste de criação de empresa com dados válidos
  it('POST /company - Criação bem-sucedida', async () => {
    const response = await pactum
      .spec()
      .post(baseUrl)
      .withJson(validCompanyData)
      .expectStatus(201);

    companyId = response.json.id; // Salva o ID da empresa criada
    expect(response.json.name).toEqual(validCompanyData.name);
  });

  // 2 - Teste de criação de empresa com CNPJ inválido
  it('POST /company - Erro com CNPJ inválido', async () => {
    const response = await pactum
      .spec()
      .post(baseUrl)
      .withJson({ ...validCompanyData, cnpj: '123' }) // CNPJ inválido
      .expectStatus(400);
  });

  // 3 - Teste de listagem de empresas
  it('GET /company - Lista de empresas', async () => {
    await pactum
      .spec()
      .get(baseUrl)
      .expectStatus(200)
      .expectJsonLike([
        {
          id: companyId,
          name: validCompanyData.name,
          cnpj: validCompanyData.cnpj,
          state: validCompanyData.state,
          city: validCompanyData.city,
          address: validCompanyData.address,
          sector: validCompanyData.sector
        }
      ]);
  });

  // 4 - Teste de busca por ID de empresa existente
  it('GET /company/:id - Obter empresa existente', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/${companyId}`)
      .expectStatus(200)
      .expectJsonLike({
        id: companyId,
        name: validCompanyData.name
      });
  });

  // 5 - Teste de busca por ID de empresa não existente
  it('GET /company/:id - Erro para empresa não existente', async () => {
    await pactum
      .spec()
      .get(`${baseUrl}/99999`) // ID que não existe
      .expectStatus(404);
  });

  // 6 - Teste de atualização de empresa com dados válidos
it('PUT /company - Atualização de empresa existente', async () => {
  const updatedData = {
    ...validCompanyData,
    name: faker.company.companyName() // Nome aleatório
  };

  const response = await pactum
    .spec()
    .put(`${baseUrl}/${companyId}`)
    .withJson(updatedData)
    .expectStatus(200);

  // Verifica se a resposta contém o ID e se o nome foi atualizado corretamente
  expect(response.json.id).toEqual(companyId);
  expect(response.json.name).toEqual(updatedData.name);
});

  // 7 - Teste de erro ao atualizar empresa não existente
  it('PUT /company - Erro ao atualizar empresa não existente', async () => {
    await pactum
      .spec()
      .put(`${baseUrl}/99999`) // ID que não existe
      .withJson(validCompanyData)
      .expectStatus(404);
  });

  // 8 - Teste de erro de validação ao atualizar com dados inválidos
  it('PUT /company - Erro de validação ao atualizar com dados inválidos', async () => {
    await pactum
      .spec()
      .put(`${baseUrl}/${companyId}`)
      .withJson(invalidCompanyData)
      .expectStatus(400); // Espera um erro de validação
  });

  // 9 -  Teste de exclusão de empresa
  it('DELETE /company - Exclusão bem-sucedida', async () => {
    await pactum.spec().delete(`${baseUrl}/${companyId}`).expectStatus(200); // Espera status 204 No Content
  });

  // 10 -  Teste de erro ao buscar empresa excluída
  it('GET /company/:id - Erro para empresa excluída', async () => {
    await pactum.spec().get(`${baseUrl}/${companyId}`).expectStatus(404); // Espera status 404 Not Found
  });

  // 11 - Teste de criação de empresa com nome vazio
  it('POST /company - Erro com nome vazio', async () => {
    await pactum
      .spec()
      .post(baseUrl)
      .withJson({ ...validCompanyData, name: '' })
      .expectStatus(400);
  });

  // 12 - Teste de criação de empresa com estado vazio
  it('POST /company - Erro com estado vazio', async () => {
    await pactum
      .spec()
      .post(baseUrl)
      .withJson({ ...validCompanyData, state: '' })
      .expectStatus(400);
  });

  // 13 -  Teste de criação de empresa com cidade vazia
  it('POST /company - Erro com cidade vazia', async () => {
    await pactum
      .spec()
      .post(baseUrl)
      .withJson({ ...validCompanyData, city: '' })
      .expectStatus(400);
  });

  // 14 - Teste de criação de empresa com endereço vazio
  it('POST /company - Erro com endereço vazio', async () => {
    await pactum
      .spec()
      .post(baseUrl)
      .withJson({ ...validCompanyData, address: '' })
      .expectStatus(400);
  });

  // 15 - Teste de atualização de empresa com ID inválido
  it('PUT /company - Erro com ID inválido', async () => {
    await pactum
      .spec()
      .put(`${baseUrl}/invalid-id`)
      .withJson(validCompanyData)
      .expectStatus(400);
  });
});
