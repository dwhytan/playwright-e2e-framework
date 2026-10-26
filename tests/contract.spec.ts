import { test, expect } from '@playwright/test';

test.describe('Contract Testing — PokeAPI', () => {

  test('/pokemon endpoint contract — required fields always present', async ({ request }) => {
    await test.step('Send GET /pokemon/pikachu', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/pokemon/pikachu');
      expect(response.status()).toBe(200);
      const body = await response.json();

      await test.step('Verify all mandatory contract fields exist', async () => {
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('name');
        expect(body).toHaveProperty('abilities');
        expect(body).toHaveProperty('types');
        expect(body).toHaveProperty('stats');
        expect(body).toHaveProperty('moves');
        expect(body).toHaveProperty('sprites');
      });

      await test.step('Verify contract field types are correct', async () => {
        expect(typeof body.id).toBe('number');
        expect(typeof body.name).toBe('string');
        expect(Array.isArray(body.abilities)).toBe(true);
        expect(Array.isArray(body.types)).toBe(true);
      });
    });
  });

  test('/type endpoint contract — response structure is consistent', async ({ request }) => {
    await test.step('Send GET /type/fire', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/type/fire');
      expect(response.status()).toBe(200);
      const body = await response.json();

      await test.step('Verify base contract fields for type resource', async () => {
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('name');
        expect(body).toHaveProperty('pokemon');
        expect(body).toHaveProperty('damage_relations');
      });

      await test.step('Verify damage_relations structure is complete', async () => {
        expect(body.damage_relations).toHaveProperty('double_damage_from');
        expect(body.damage_relations).toHaveProperty('double_damage_to');
        expect(body.damage_relations).toHaveProperty('half_damage_from');
        expect(body.damage_relations).toHaveProperty('half_damage_to');
      });
    });
  });

  test('pagination contract — list response structure is consistent', async ({ request }) => {
    await test.step('Send GET /pokemon?limit=5', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/pokemon?limit=5');
      expect(response.status()).toBe(200);
      const body = await response.json();

      await test.step('Verify required pagination fields', async () => {
        expect(body).toHaveProperty('count');
        expect(body).toHaveProperty('next');
        expect(body).toHaveProperty('results');
        expect(Array.isArray(body.results)).toBe(true);
        expect(body.results.length).toBe(5);
      });

      await test.step('Verify each list item has name and url fields', async () => {
        body.results.forEach((item: { name: string; url: string }) => {
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('url');
          expect(typeof item.name).toBe('string');
          expect(typeof item.url).toBe('string');
        });
      });
    });
  });

  test('error contract — invalid resource consistently returns 404', async ({ request }) => {
    await test.step('Send GET with a non-existent resource', async () => {
      const response = await request.get('https://pokeapi.co/api/v2/pokemon/invalidpokemon123');

      await test.step('Verify error contract returns status 404', async () => {
        expect(response.status()).toBe(404);
      });
    });
  });

});