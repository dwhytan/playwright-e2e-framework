import { test, expect } from '@playwright/test';

test.describe('API Testing - PokeAPI', () => {

  test('GET - fetch pokemon by name returns correct data', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/pokemon/pikachu');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('pikachu');
    expect(body.id).toBe(25);
    expect(body).toHaveProperty('abilities');
    expect(body).toHaveProperty('types');
  });

  test('GET - fetch pokemon by id returns correct name', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/pokemon/1');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('bulbasaur');
  });

  test('GET - fetch pokemon list returns paginated results', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/pokemon?limit=10');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.results.length).toBe(10);
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('next');
  });

  test('GET - invalid pokemon returns 404', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/pokemon/notapokemon');
    expect(response.status()).toBe(404);
  });

  test('GET - fetch pokemon type returns correct data', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/type/fire');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe('fire');
    expect(body).toHaveProperty('pokemon');
  });

});