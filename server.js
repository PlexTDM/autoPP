import express from 'express';
import 'dotenv/config';
import { getPP } from './plugin.js';
import cors from 'cors';

const server = express();

server.use(express.json());
server.use(cors())
server.use(express.urlencoded({extended: true}));

server.get('/',async (req,res)=>{
    const id = req.query.id;
    if (!id)res.status(404).json({message:'enter username in query'});
    try{
        const pp = await getPP(req.query.id);
        res.json({pp:pp});
        // console.log(req.query.id);
    }catch(err){
        res.status(500).json({message:err})
    }
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Listening port ${PORT}`);
})