const requestIp = require('request-ip');
const fetch = require('node-fetch');
const useragent = require('useragent');

const requestInfo = async (req) => {
    const accessKey = process.env.IP_STACK_KEY
    const ip = requestIp.getClientIp(req);

    const fetchIp = await fetch(`http://api.ipstack.com/${ip}?access_key=${accessKey}`);
    const ipData = await fetchIp.json();

    const agent = useragent.parse(req.headers['user-agent']);

    let response = {
        ip : {
            ip: ipData.ip,
            type: ipData.type,
            countryName: ipData.country_name,
            city: ipData.city,
            latitude: ipData.latitude,
            longitude: ipData.longitude,
            capital: ipData.location.capital,
            countryFlag: ipData.location.country_flag
        },
        os: agent.os.toString(),
        device: agent.device.toString(),
        agent: agent.toAgent()
    }  
    
    return response;
}

module.exports = requestInfo;

