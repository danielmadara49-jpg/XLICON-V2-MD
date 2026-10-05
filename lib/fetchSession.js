const axios = require("axios")
const baseApi = "https://xlicon-sessionid.koyeb.app"

async function getSession(id){
    try {
        const { data } = await axios.get(`${baseApi}/api/retrieve?q=${id}`);
        const msg = data.message;
        return typeof msg === "string" ? JSON.parse(msg) : msg
    } catch (err) {
        console.log("there was an error:", err.message)
    }
}

module.exports = { getSession }
