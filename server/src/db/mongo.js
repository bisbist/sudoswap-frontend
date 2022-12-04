import mongoose, { mongo, Schema } from 'mongoose'
import mongooseLong from 'mongoose-long'
import { MongoMemoryServer } from 'mongodb-memory-server'

mongooseLong(mongoose)

// ubuntu 22.04: https://stackoverflow.com/questions/72133316/ubuntu-22-04-libssl-so-1-1-cannot-open-shared-object-file-no-such-file-or-di
let mongod = new MongoMemoryServer()

// connect to a new db
const connect = async (uri) => {
    if (!uri) {
        await mongod.start()
        uri = mongod.getUri()
    }
    return await mongoose.connect(uri);
}

// disconnect from connected db
const disconnect = async () => {
    if (mongod.state == "starting" || mongod.state == "running") {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
        await mongod.stop()
    }
    await mongoose.disconnect()
}

// clearAll deletes all data from all collections
const clearAll = async () => {
    return await Promise.all(Object
        .values(mongoose.connection.collections)
        .map(collection => {
            return collection.deleteMany()
        }))
}

export default { connect, disconnect, clearAll }