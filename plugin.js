import axios from 'axios'
import 'dotenv/config'
import XMLHttpRequest from 'xhr2'

const API_URL = 'https://osu.ppy.sh/api/v2'
const { CLIENT_ID, CLIENT_SECRET } = process.env
const getToken = async () => {
    const params = {
        client_id: parseInt(CLIENT_ID),
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
        scope: 'public'
    }
    const { data } = await axios.post('https://osu.ppy.sh/oauth/token', params)
    return data.access_token
}
export const getPP = async (user, mode = 'osu') => {
    const token = await getToken()

    const { data } = await axios.get(`${API_URL}/users/${user}/${mode}`, {
        headers:{
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    return data.statistics.pp;
}

export const getTopBeatmaps = async (userId, mode = 'osu') => {
    if(typeof userId === 'string' || userId instanceof String){
        const data = await getUser(userId)
        userId = data.id
    }
    const token = await getToken()

    const { data } = await axios.get(`${API_URL}/users/${userId}/scores/best`,{
            params: { 'mode': mode, 'limit': 1 },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }    
    )
    return data
}

export const getIdByName = async (name) => {
    if (name instanceof Number) return "Only Enter String"
    const user = await getUser(name)
    return user.id
}

export const getUser = async (id) => {
    if (!id) return "Provide Username or Id"
    const token = await getToken()
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    }
    const { data } = await axios.get(`https://osu.ppy.sh/api/v2/users/${id}`, {headers:headers})
    return data
}

export const setDiscordStatus = async (token=null, id, mode='osu') =>{
    if(!token)return'please provide discord access token';
    const pp = await getPP(id, mode);
    console.log(pp);
    // const response = await axios.patch('https://discord.com/api/v9/users/@me/settings',
    //     JSON.stringify({custom_status:{text:pp}}),{headers:{
    //         'Authorization':'mfa.DwaHXcUfHsDBZZFRzWF_L9-fPuCo6zg-CpeNlE371OLjgnoghVTlHVrXKRTKBkfEKseNpTz4KdjPLZeDm7je',
    //         'Content-Type':'application/json'
    //     }}
    // ).catch(err=>console.log(err))
    // response?console.log(response.data):''

    const text = 'PP: '+pp.toString();

    let req = new XMLHttpRequest();
    // req.open("GET", "https://discord.com/api/v9/users/@me/", true);

    const authToken = 'mfa.DwaHXcUfHsDBZZFRzWF_L9-fPuCo6zg-CpeNlE371OLjgnoghVTlHVrXKRTKBkfEKseNpTz4KdjPLZeDm7je'

    req.open("PATCH", "https://discord.com/api/v9/users/@me/settings", true);
    req.setRequestHeader("Authorization", authToken);
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify({
        custom_status: {text: text}
    }));
    req.onreadystatechange = ()=>{
        console.log((req.response));
        return(req.response);
    }
        
}