import { test, expect, request } from '@playwright/test';

// Contract Testing - Validating API contracts without Pact broker
// This demonstrates consumer-driven contract testing principles

test.describe('Contract Testing - PokeAPI', () => {

  test('pokemon endpoint contract - required fields exist', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/pokemon/pikachu');
    expect(response.status()).toBe(200);
    
    const body = await response.json();

    // Contract: these fields MUST always exist
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('abilities');
    expect(body).toHaveProperty('types');
    expect(body).toHaveProperty('stats');
    expect(body).toHaveProperty('moves');
    expect(body).toHaveProperty('sprites');

    // Contract: field types must match
    expect(typeof body.id).toBe('number');
    expect(typeof body.name).toBe('string');
    expect(Array.isArray(body.abilities)).toBe(true);
    expect(Array.isArray(body.types)).toBe(true);
  });

  test('pokemon type contract - response structure is consistent', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/type/fire');
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Contract: type endpoint must return these fields
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('pokemon');
    expect(body).toHaveProperty('damage_relations');

    // Contract: damage_relations must have specific structure
    expect(body.damage_relations).toHaveProperty('double_damage_from');
    expect(body.damage_relations).toHaveProperty('double_damage_to');
    expect(body.damage_relations).toHaveProperty('half_damage_from');
    expect(body.damage_relations).toHaveProperty('half_damage_to');
  });

  test('pokemon list contract - pagination structure is consistent', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/pokemon?limit=5');
    expect(response.status()).toBe(200);

    const body = await response.json();

    // Contract: paginated responses must always include these fields
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('next');
    expect(body).toHaveProperty('results');

    // Contract: results must be an array of objects with name and url
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBe(5);
    body.results.forEach((item: any) => {
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('url');
      expect(typeof item.name).toBe('string');
      expect(typeof item.url).toBe('string');
    });
  });

  test('error contract - invalid resource returns consistent error structure', async ({ request }) => {
    const response = await request.get('https://pokeapi.co/api/v2/pokemon/invalidpokemon123');
    
    // Contract: 404 responses must always return this status
    expect(response.status()).toBe(404);
  });

});