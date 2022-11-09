import _ from 'lodash'

const config = {}

export const setConfig = (src) => {
    _.extend(config, src)
}

export default config