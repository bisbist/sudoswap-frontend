import fs from 'fs/promises';

// create a mock json array db that represents a table with records
const createJSONDB = async (name) => {
    try {
        await fs.stat(name)
    } catch (error) {
        if (error.code == 'ENOENT') {
            await fs.writeFile(name, JSON.stringify([]))
        }
    }
    return {
        async get(id) {
            const buf = await fs.readFile(name)
            const pairs = JSON.parse(buf.toString())
            return pairs.find(pair => {
                return pair.id = id
            })
        },
        async getAll() {
            const buf = await fs.readFile(name)
            const pairs = JSON.parse(buf.toString())
            return pairs;
        },
        async put(id, fields) {
            const buf = await fs.readFile(name)
            const pairs = JSON.parse(buf.toString())
            const index = pairs.findIndex(pair => pair.id == id)
            if (index >= 0) { // found
                pairs[index] = {
                    id, ...fields
                }
            } else {
                pairs.push({
                    id, ...fields
                })
            }
            await fs.writeFile(name, JSON.stringify(pairs, null, 2))
        },
    };
}


export { createJSONDB }