import db from '@/utils/db';
import MMCode from '@/models/MMCodes';
import colors from 'colors'
import timestamp from 'console-timestamp'

const handler = async (req, res) => {   

    try {

        if(req.method === 'GET') {

       //     console.log(req.query)

        await db.connect();    

        const { year, make, model } = req.query;

         if(year && make && model){  //return varients    

            const responce = await MMCode.aggregate([
                {
                    $match: { "year": Number(year) }
                },               
                { //project: filter out make
                    $project: { 

                        "makes": { 
                            $filter: { 
                                input: "$makes",    
                                as: "s",                                                
                                cond:{
                                $eq: ['$$s.make', make],                              
                              }                                
                            }
                        },
                        "year": 1,                       
                      
                    }
                }, 
                { //undwind makes: turn array to object 
                  $unwind: "$makes"                     
                },
                { //filter: filter out model
                    $project: { 

                        "models": { 
                            $filter: { 
                                input: "$makes.models",    
                                as: "m",                                                
                                cond:{
                                $eq: ['$$m.model', model],                              
                              }                                
                            }
                        },
                        "year": 1,                               
                      
                    }
                },
                { //undwind models: turn array to object

                    $unwind: "$models"
                    
                },
                { //project: filter out varients
                    $project: {
                        "varients": "$models.varients",
                       
                    }
                },
            ])  

              if(responce.length > 0){  
          
               return res.status(200).send(responce[0].varients)

              }else{

              return res.status(404).send({message: 'Not Found'})

             }

        }else if(year && make && !model){ //return models

              const responce = await MMCode.aggregate([
                {
                    $match: { "year": Number(year) }
                },               
                { 
                    $project: { 

                        "makes": { 
                            $filter: { 
                                input: "$makes",    
                                as: "s",                                                
                                cond:{
                                $eq: ['$$s.make', make],                              
                                }                                
                            }
                        },
                        "year": 1,
                      
                    }
                },
                {
                    $project: {                       
                        "models": {
                            $map: {
                                input: "$makes.models",
                                as: "model",
                                in: "$$model.model"
                            }
                        },
                        "year": 1,
                        
                    }
                },
                {
                    $group: {
                        _id: "$year",
                        models: {"$first": { $first: "$models"}}
                        
                    }
                }])  

              if(responce.length == 1){  

                const models = responce[0].models
                return res.status(200).send(models)

              }else{

                return res.status(404).send({message: 'Not Found'})

             }

        }else if(year && !make && !model){

            const responce = await MMCode.aggregate([
                {
                    $match: { "year": Number(year) }
                }, 
                { //project: filter out varients
                    $project: {
                        "makes": "$makes.make",
                       
                    }
                }
                
            ]) 
           return res.status(200).send(responce[0].makes)                 

        }else if(!year && !make && !model){

            res.status(400).send({message: 'Bad Request'})
        }  
    

        }else if(req.method === 'POST'){

            res.status(403).send({ message: 'Forbidden' });      
        
        }else if(req.method === 'PUT'){
        
            await db.connect();    

            const { make } = req.query;

            if(make){  //return varients    

                const responce = await MMCode.aggregate([                                 
                    { 
                        $project: { 

                            "makes": { 
                                $filter: { 
                                    input: "$makes",    
                                    as: "s",                                                
                                    cond:{
                                    $eq: ['$$s.make', make],                              
                                }                                
                                }
                            },
                            "year": 1,                       
                        
                        }
                    }, 
                   { //undwind makes: turn array to object 
                    $unwind: "$makes"                     
                    },
                    {
                        $project: {                       
                            "models": {
                                $map: {
                                    input: "$makes.models",
                                    as: "model",
                                    in: "$$model.model"
                                }
                            },
                            "year": 1,
                            
                        }
                    },
                    {
                        $unwind: "$models"
                    },
                   {
                        $group: {
                            _id: null,
                            model: { $addToSet: "$models"}
                            

                        }
                    }                 
                  
                   
                 
                ])  

                if(responce.length == 1){  

                    const models = responce[0].model.sort()
          
                    res.status(200).send(models)

                }else{

                    res.status(404).send({message: 'Not Found'})

                }

            }else{
                    
                const responce = await MMCode.aggregate([                                 
                     
                  
                   {
                        $group: {
                            _id: null,
                            make: { $addToSet: "$makes.make"}
                            

                        }
                    },
                    {
                        $unwind: "$make"
                    },
                    {
                        $unwind: "$make"
                    },
                    {
                        $group: {
                            _id: null,
                            make: { $addToSet: "$make"}
                            

                        }
                    },
                 
                ])  

                if(responce.length == 1){  

                    const makes = responce[0].make.sort()
          
                    res.status(200).send(makes)

                }else{

                    res.status(404).send({message: 'Not Found'})

                }
            }     
        
        }else if(req.method === 'DELETE'){
        
            res.status(403).send({ message: 'Forbidden' });    
        
        }     

    } catch (error) {        
        console.error(`${colors.red('error')} - ${error.message}, ${colors.yellow(req.method +' /api/mmcode')} @ ${colors.blue(timestamp('DD-MM-YY hh:mm:ss'))}`) 
        res.status(500).send({ message: 'Internal Server Error' });        
    }

};

export default handler;
