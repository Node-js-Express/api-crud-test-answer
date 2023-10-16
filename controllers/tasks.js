import PokemonData from "../utils/PokemonData.js";
import { asyncWrapper } from "../middleware/async.js";

const pokemonData = new PokemonData();

export const getAllPokemons = asyncWrapper(async(req, res, next) => {
    if (pokemonData.getPokemonData().length === 0) {
        return res.status(404).json({ error: '잡은 포켓몬이 없습니다...' });
    }
    res.status(201).json({ pokemon: pokemonData.getPokemonData() });
});

export const getPokemonToID = asyncWrapper(async(req, res, next) => {
    const { id } = req.params;
    
    const foundPokemon = pokemonData.getPokemonData().find(p => p.id === parseInt(id));
    if (!foundPokemon) {
        return res.status(404).json({ error: '포켓몬을 찾을 수 없습니다.' });
    }
    res.status(201).json({ pokemon: foundPokemon });
});

export const getAlpa = asyncWrapper(async(req, res, next) => {
    const filteredPokemon = pokemonData.getPokemonData().filter(p => {
        const isHighBaseStats = p.baseStats >= 600;
        const hasDesiredPersonality = ['대담한', '용감한', '무사태평한'].includes(p.personality);
        return isHighBaseStats && hasDesiredPersonality;
    });

    if (filteredPokemon.length === 0) {
        return res.status(404).json({ error: '알파가 없는 불쌍한 장원이...' });
    }

    const names = filteredPokemon.map(p => p.name);
    res.status(201).json({ names });
});

export const deletePokmons = asyncWrapper(async(req, res, next) => {
    const { id } = req.params;
    
    // 해당 id를 가진 포켓몬 찾기
    const foundIndex = pokemonData.getPokemonData().findIndex(p => p.id === parseInt(id));
    if (foundIndex === -1) {
        return res.status(404).json({ error: '포켓몬을 찾을 수 없습니다.' });
    }

    // 삭제할 포켓몬 정보 가져오기
    const deletedPokemon = pokemonData.getPokemonData()[foundIndex];

    // 해당 id를 가진 포켓몬 삭제
    pokemonData.getPokemonData().splice(foundIndex, 1);

    res.status(201).json({ message: `굿바이 ${deletedPokemon.name}!!` });
});

export const postPokemon = asyncWrapper(async(req, res, next) => {
    const { id, name, gender, baseStats, personality } = req.body;

    // 필요한 데이터가 유효한지 확인
    if (!id || !name || !gender || !baseStats || !personality) {
        return res.status(400).json({ error: '포켓몬 데이터가 부족합니다.' });
    }

    // 이미 존재하는 ID인지 확인
    if (pokemonData.getPokemonData().find(p => p.id === id)) {
        return res.status(400).json({ error: '잡았던 포켓몬 입니다.' });
    }

    // personality가 유효한지 확인
    const validPersonalities = ['용감한', '대담한', '무사태평한', '조심스러운', '촐랑거리는', '겁쟁이'];
    if (!validPersonalities.includes(personality)) {
        return res.status(400).json({ error: '그런 성격을 가진 포켓몬은 없습니다.' });
    }

    // baseStats가 0보다 크고 999보다 작거나 같은지 확인
    if (baseStats < 1 || baseStats > 999) {
        return res.status(400).json({ error: '포켓몬이 너무 강하거나 너무 약합니다.' });
    }

    // 새로운 포켓몬 추가
    const newPokemon = { id, name, gender, baseStats, personality };
    pokemonData.getPokemonData().push(newPokemon);

    res.status(201).json({ message: `좋았어 ${newPokemon.name}!! 넌 내꺼야!!!` });
});

export const updatePokemons = asyncWrapper(async (req, res, next) => {
    const { id } = req.params;
    const updatedData = req.body;

    // 이미 존재하는 ID인지 확인
    const existingPokemon = pokemonData.getPokemonData().find(p => p.id === parseInt(id));
    if (!existingPokemon) {
        return res.status(404).json({ error: '포켓몬을 찾을 수 없습니다.' });
    }

    // 중복된 ID인 경우 에러 응답
    const isDuplicateId = pokemonData.getPokemonData().some(p => p.id !== existingPokemon.id && p.id === parseInt(updatedData.id));
    if (isDuplicateId) {
        return res.status(400).json({ error: '이미 존재하는 ID입니다.' });
    }

    // 기존 포켓몬 업데이트
    Object.assign(existingPokemon, updatedData);

    res.status(201).json({ message: `${existingPokemon.name}의 포켓몬 정보가 업데이트 되었습니다.` });
});
