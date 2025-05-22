import bcryptjs from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';

async function handler(req, res) {

  try {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('req.body', req.body)

  const { knownAs, email, password } = req.body; 

  if (!knownAs || !email || !password ) {

    res.status(422).json({
      message: 'Validation error',
    });
    return;
  }

      const emailValid = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACTAPI_KEY}&email=${email}`)
      if(emailValid.status == 200) {

        const emailValidJson = await emailValid.json()
        if(emailValidJson.deliverability !== 'DELIVERABLE'){
          return res.status(400).json({ message: 'Email is not valid' });
        }else{

            await db.connect();

            const existingUser = await User.findOne({ email: email });

            if (existingUser) {

              res.status(400).json({ message: 'User exists already!' });

            }else{

            const newUser = new User({
              knownAs,
              email,
              password: bcryptjs.hashSync(password), 
              registrationMethodforEmail: 'credentials'   
            });

            const user = await newUser.save();            

            res.status(201).send({ message: 'Created user!',
                                    _id: user._id,
                                    name: user.name,
                                    email: user.email,
                                    password : password
                                  });

            }
        }

      }else{

              await db.connect();

                const existingUser = await User.findOne({ email: email });

                if (existingUser) {

                  res.status(422).json({ message: 'User exists already!' });

                }else{

                const newUser = new User({
                  knownAs,
                  email,
                  password: bcryptjs.hashSync(password), 
                  registrationMethodforEmail: 'credentials'   
                });

                const user = await newUser.save();

                res.status(201).send({ message: 'Created user!',
                                        _id: user._id,
                                        name: user.name,
                                        email: user.email,
                                        password : password
                                      });

                }

      }

  } catch (error) {    
    return res.status(500).send({ message: 'Internal Server Error' }); 
  }

}

export default handler;