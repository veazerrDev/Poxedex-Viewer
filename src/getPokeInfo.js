export default function getPokeInfo(nameOfPokemon) {
  return fetch(
    `https://pokeapi.co/api/v2/pokemon/${nameOfPokemon.toLowerCase()}`,
  ).then((res) => {
    if (!res.ok) throw new Error("Not found");
    return res.json();
  });
}
