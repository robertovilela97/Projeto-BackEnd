# Desafio Backend Avançado

Primeiramente, obrigado pelo seu interesse em trabalhar conosco, A seguir você encontrará todas as informações necessárias para fazer seu teste.

## Stack do projeto

Você pode utilizar a stack em node js, utilizando o framework de sua escolha.

## Objetivo do desafio

O objetivo é construir uma api de pontos de interesse usando a latitude e longitude para mostrar pontos de interesses próximos ao usuário

1. Você deve criar um endpoint para importar o arquivo csv "addresses_model" contendo endereços e salvar em um banco de dados de sua escolha.
2. Criar um crud para gerenciar pontos de interesse.
 1. Create - deve ser criado um ponto de interesse a partir de um endereço fornecido via endpoint, antes de salvar devera ser pego a latitude e longitude deste endereço.
 - Update - deve ser parecido com o create, passando endereço e pegando a latitude e longitude.	
 - Delete - deletar pontos de interesse.
3. Para pegar converter os endereços em coordenadas recomendamos o uso do openstreetmap ou google maps
	- https://nominatim.org/release-docs/latest/api/Search/
	- https://developers.google.com/maps?hl=pt-br
4. Criar um endpoint para buscar pontos de interesse, neste endpoint o cliente irá fornecer a latitude, longitude e raio, sendo assim seu codigo devera fazer um cálculo de raio fornecido pelo cliente, lembrando que serão em km, mostrando os pontos de interesse dentro desse raio, esses dados devem ser paginados.
	- ``{"latitude": "", "longitude": "", "raio": 5}``
	
## O que será avaliado!!

- Documentação
- Código limpo e organizado (nomenclatura, etc)
- Conhecimento de padrões (PSRs, design patterns, SOLID)
- Ser consistente e saber argumentar suas escolhas
- Apresentar soluções que domina
- Modelagem de Dados
- Manutenibilidade do Código
- Tratamento de erros
- Cuidado com itens de segurança
- Arquitetura (estruturar o pensamento antes de escrever)
- Carinho em desacoplar componentes (outras camadas, service, repository)

## O que NÃO será avaliado!

- Frontend

## Diferenciais!

- Uso de Docker
- Uso de Design Patterns
- Testes de integração

## Como participar do desafio?

1. Fork este repositório.
- Clone o fork na sua máquina.
- Escreva seu código, seguindo a metodologia que achar mais adequada.
- Não se esqueça de criar um "README" com todas as instruções para rodar seu código
- Avise-nos que terminou o desafio.