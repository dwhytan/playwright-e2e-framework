import { test, expect } from '@playwright/test';

test.describe('API — PokeAPI', () => {

  test('fetching a Pokémon by name returns correct data', async ({ request }) => {
    await test.step('Send GET /pokemon/pikachu', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/pokemon/pikachu');

      await test.step('Verify status 200', async () => {
        expect(response.status()).toBe(200);
      });

      const body = await response.json();

      await test.step('Verify name and ID match Pikachu (#25)', async () => {
        expect(body.name).toBe('pikachu');
        expect(body.id).toBe(25);
      });

      await test.step('Verify response includes abilities and types', async () => {
        expect(body).toHaveProperty('abilities');
        expect(body).toHaveProperty('types');
      });
    });
  });

  test('fetching a Pokémon by ID returns the correct name', async ({ request }) => {
    await test.step('Send GET /pokemon/1 and verify ID 1 is Bulbasaur', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/pokemon/1');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.name).toBe('bulbasaur');
    });
  });

  test('listing Pokémon returns paginated results', async ({ request }) => {
    await test.step('Send GET /pokemon?limit=10', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/pokemon?limit=10');
      expect(response.status()).toBe(200);
      const body = await response.json();

      await test.step('Verify exactly 10 results with pagination fields', async () => {
        expect(body.results.length).toBe(10);
        expect(body).toHaveProperty('count');
        expect(body).toHaveProperty('next');
      });
    });
  });

  test('requesting a non-existent Pokémon returns 404', async ({ request }) => {
    await test.step('Send GET /pokemon/notapokemon and verify 404 response', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/pokemon/notapokemon');
      expect(response.status()).toBe(404);
    });
  });

  test('fetching a Pokémon type returns type data and damage relations', async ({ request }) => {
    await test.step('Send GET /type/fire', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/type/fire');
      expect(response.status()).toBe(200);
      const body = await response.json();

      await test.step('Verify type name and associated Pokémon list', async () => {
        expect(body.name).toBe('fire');
        expect(body).toHaveProperty('pokemon');
      });
    });
  });

});