import fs from 'fs-extra';

// create a mock json array db that represents a table with records
const createJSONDB = async (name) => {
    try {
        await fs.stat(name)
    } catch (error) {
        if (error.code == 'ENOENT') {
            await fs.outputJSON(name, [])
        }
    }
    return {
        async get(id) {
            const items = await fs.readJSON(name)
            return items.find(item => {
                return item.id = id
            })
        },
        async getAll() {
            return await fs.readJSON(name)
        },
        async put(id, fields) {
            const items = await fs.readJSON(name)
            const index = items.findIndex(item => item.id == id)
            if (index >= 0) { // found
                items[index] = {
                    id, ...fields
                }
            } else {
                items.push({
                    id, ...fields
                })
            }
            await fs.outputJSON(name, items, { spaces: 2 })
        },
    };
}


export { createJSONDB }